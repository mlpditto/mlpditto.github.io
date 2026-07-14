// public/firebase-config.js

// 1. ค่า Config ของโปรเจกต์คุณ
// 🔒 หมายเหตุความปลอดภัย: apiKey ของ Firebase Web เป็นค่า "สาธารณะโดยดีไซน์"
//    (ฝังอยู่ใน client JS ทุกหน้า ใครก็อ่านได้) — มันแค่ระบุโปรเจกต์ ไม่ได้ให้สิทธิ์เข้าถึงข้อมูล
//    การป้องกันจริงคือ Firestore rules + API key restriction (HTTP referrer + API list ใน Cloud Console) + App Check
//    คีย์นี้ผ่านการ rotate + restrict แล้ว (20260218-New Browser key, จำกัดเฉพาะโดเมนแอป) — ไม่ต้องพยายามซ่อนค่า
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