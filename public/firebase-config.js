// public/firebase-config.js

// 1. ค่า Config ของโปรเจกต์คุณ
// 🔒 SECURITY WARNING: API Key นี้เคยรั่วไหลสู่สาธารณะ โปรดนำ API Key ใหม่มาเปลี่ยนที่นี่
const firebaseConfig = {
    apiKey: "AIzaSyCSeIW-4e9Op8_LzKYavaxwVdYyHC8Q0nE",
    authDomain: "fkb-front-kanban.firebaseapp.com",
    projectId: "fkb-front-kanban",
    storageBucket: "fkb-front-kanban.firebasestorage.app",
    messagingSenderId: "135805270397",
    appId: "1:135805270397:web:ef5f4e23fef49175af3414",
    measurementId: "G-SS039Q7L2B"
};

// 2. เริ่มการทำงาน Firebase และประกาศตัวแปรให้ไฟล์อื่นใช้ได้
try {
    if (typeof firebase !== 'undefined') {
        // เริ่ม Initialize
        firebase.initializeApp(firebaseConfig);

        // ประกาศตัวแปร Global (สำคัญมาก: บรรทัดนี้แก้ปัญหา auth is not defined)
        window.db = firebase.firestore();
        window.auth = firebase.auth();

        console.log("✅ Firebase Config Loaded Successfully (Ready to use)");
    } else {
        console.error("❌ Error: ไม่พบ Firebase SDK กรุณาเช็คว่าในไฟล์ HTML มีการใส่ <script src='...firebase...'> ครบถ้วนหรือไม่");
    }
} catch (e) {
    console.error("❌ Config Error:", e);
    alert("เกิดข้อผิดพลาดในการตั้งค่า Firebase: " + e.message);
}