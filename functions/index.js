const { onDocumentCreated, onDocumentUpdated } = require("firebase-functions/v2/firestore");
const { setGlobalOptions } = require("firebase-functions/v2");
const admin = require("firebase-admin");
const { google } = require("googleapis");

admin.initializeApp();

// Global configuration
setGlobalOptions({
    region: "asia-southeast1",
    maxInstances: 10
});

const SERVICE_ACCOUNT = require("./service-account.json");
const CALENDAR_ID = "medlifeplus@gmail.com";

const auth = new google.auth.JWT(
    SERVICE_ACCOUNT.client_email,
    null,
    SERVICE_ACCOUNT.private_key,
    ["https://www.googleapis.com/auth/calendar"]
);

const calendar = google.calendar({ version: "v3", auth });

// 1. นัดหมายได้รับการยืนยัน -> ลง Google Calendar
exports.syncappointment = onDocumentUpdated("visitor_appointments/{aptId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (before.status !== "confirmed" && after.status === "confirmed") {
        const startStr = `${after.date}T${after.startTime || after.time}:00+07:00`;
        const startDateTime = new Date(startStr);
        let endDateTime;
        if (after.endTime) {
            endDateTime = new Date(`${after.date}T${after.endTime}:00+07:00`);
        } else {
            endDateTime = new Date(startDateTime.getTime() + 3600000);
        }

        const eventResources = {
            summary: `📅 Appt: ${after.visitorName}`,
            location: "Medlife Plus Official",
            description: `📝 จุดประสงค์: ${after.purpose}\n📞 เบอร์: ${after.visitorPhone}`,
            start: { dateTime: startDateTime.toISOString(), timeZone: "Asia/Bangkok" },
            end: { dateTime: endDateTime.toISOString(), timeZone: "Asia/Bangkok" },
            colorId: "2",
        };

        try {
            const res = await calendar.events.insert({ calendarId: CALENDAR_ID, resource: eventResources });
            return event.data.after.ref.update({
                calendarEventId: res.data.id,
                calendarSyncedAt: admin.firestore.FieldValue.serverTimestamp()
            });
        } catch (e) { console.error("Apt Sync Error:", e); }
    }
});

// 2. เช็คอินจริง -> ลง Google Calendar
exports.synccheckin = onDocumentCreated("visitor_logs/{logId}", async (event) => {
    const data = event.data.data();
    const eventResources = {
        summary: `✅ Checked-in: ${data.firstName} ${data.lastName}`,
        location: "Medlife Plus Office",
        description: `📍 เข้าพบแล้ว\n📝 วัตถุประสงค์: ${data.purposes.join(", ")}\n📞 เบอร์: ${data.phone}`,
        start: { dateTime: new Date().toISOString(), timeZone: "Asia/Bangkok" },
        end: { dateTime: new Date(Date.now() + 3600000).toISOString(), timeZone: "Asia/Bangkok" },
        colorId: "5",
    };

    try {
        const res = await calendar.events.insert({ calendarId: CALENDAR_ID, resource: eventResources });
        return event.data.ref.update({
            calendarEventId: res.data.id,
            calendarSyncedAt: admin.firestore.FieldValue.serverTimestamp()
        });
    } catch (e) { console.error("Checkin Sync Error:", e); }
});

// 3. เช็คเอาท์ -> อัปเดต Google Calendar
exports.synccheckout = onDocumentUpdated("visitor_logs/{logId}", async (event) => {
    const before = event.data.before.data();
    const after = event.data.after.data();

    if (before.status === "active" && after.status === "completed" && after.calendarEventId) {
        try {
            const timeStr = new Date().toLocaleTimeString("th-TH");
            await calendar.events.patch({
                calendarId: CALENDAR_ID,
                eventId: after.calendarEventId,
                resource: {
                    description: `${after.description || ""}\n\n👋 CHECK-OUT: ${timeStr}`,
                    colorId: "8",
                },
            });
        } catch (e) { console.error("Checkout Sync Error:", e); }
    }
});
