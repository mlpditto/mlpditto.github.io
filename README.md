# 🏥 Medlife Plus Pharmacy - FKB Front Kanban

[![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)](https://fkb-front-kanban.web.app)
[![Framework](https://img.shields.io/badge/Framework-Vanilla_JS-orange.svg)](https://javascript.info)
[![Database](https://img.shields.io/badge/Database-Firebase-yellow.svg)](https://firebase.google.com)
[![UI](https://img.shields.io/badge/UI-Tailwind_CSS-blueviolet.svg)](https://tailwindcss.com)

ระบบบริหารจัดการร้านยาและเวชภัณฑ์ครบวงจร (Medlife Plus Pharmacy Management System) ที่เชื่อมต่อกับ LINE LIFF และ Firebase เพื่อการทำงานที่รวดเร็วและแม่นยำ

Comprehensive pharmacy and medical supply management system integrated with LINE LIFF and Firebase for efficient and accurate workflows.

---

## 🚀 ฟีเจอร์หลัก (Main Features)

### 1. 🛒 ระบบลูกค้า (Customer Portal - index.html)
*   **ภาษาไทย:** ลูกค้าสามารถลงทะเบียนสมาชิกผ่าน LINE, แจ้งออเดอร์สินค้า, และบันทึกประวัติสุขภาพเบื้องต้น (BMI, อาการสำคัญ, ประวัติแพ้ยา)
*   **English:** Customers can register via LINE, submit orders, and record health history (BMI, symptoms, allergy records).
*   **Key Features:** LINE/Google Login, Health SOAP Form, BMI Calculation, Status Tracking.

### 2. 🛡️ ศูนย์บริหารจัดการ (Admin Hub - admin.html)
*   **ภาษาไทย:** ระบบ Kanban Board สำหรับติดตามสถานะออเดอร์, จัดการสิทธิ์ผู้ใช้งาน, และระบบ **Day Counter** เพื่อดูระยะเวลาที่ Card ค้างอยู่ในระบบ (จะหยุดนับเมื่อย้ายเข้า Archive)
*   **English:** Kanban Board for tracking order status, managing user permissions, and an automated **Day Counter** to monitor task duration (stops upon archiving).
*   **Key Features:** Drag & Drop Kanban, Day Counter (Color-coded + Red Flag), User Approval (Status Icons), LIFF Preview Mode.

### 3. 📊 ระบบสั่งยาอัจฉริยะ (ProOrder Manager - proorder.html)
*   **ภาษาไทย:** ระบบช่วยรวบรวมรายการสั่งยาด้วย "Smart Paste" (รวมยอดอัตโนมัติ), ระบบฐานข้อมูลสินค้าส่วนกลาง (Master DB), และบันทึกราคาสินค้าแยกตามซัพพลายเออร์
*   **English:** Order aggregation system with "Smart Paste" (auto-merging), Master Product Database, and multi-supplier pricing management.
*   **Key Features:** Firestore Master DB Integration, Multi-Supplier Pricing, Click-to-Edit Master Data, Intelligent Suggestion.

### 4. 📋 ระบบประวัติการรักษา (SOAP History - history.html)
*   **ภาษาไทย:** บันทึกประวัติทางการแพทย์ด้วยมาตรฐาน SOAP Note, เชื่อมโยงแฟ้มประวัติด้วยเบอร์โทรศัพท์ และรองรับการนำเข้าข้อมูลจาก Excel/CSV
*   **English:** Medical record system using SOAP standards, linking patient profiles by phone number, and supporting Excel/CSV data import.
*   **Key Features:** Professional SOAP Framework, Phone-based Search, Data Import Preview Mode.

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| Category | Technology |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla JavaScript, Tailwind CSS |
| **Backend** | Firebase Firestore, Firebase Auth, Firebase Hosting |
| **Integration** | LINE LIFF SDK, Google Fonts (Prompt / IBM Plex Sans Thai) |
| **Libraries** | Chart.js, Font Awesome, XLSX/PapaParse (Data handling) |

---

## 📂 โครงสร้างไฟล์ (File Structure)

- `index.html`: หน้าหลักสำหรับลูกค้า (Customer Portal)
- `admin.html`: ระบบหลังบ้านสำหรับทีมงาน (Admin Hub)
- `proorder.html`: ระบบสั่งยาอัจฉริยะ (Master Database)
- `history.html`: ระบบประวัติการรักษา (SOAP History)
- `Sales Analytics.html`: ระบบวิเคราะห์ยอดขายจาก CSV
- `TMTP-Manager.html`: ระบบประมวลผลข้อมูลส่งพัสดุ
- `return-log-int.html`: ระบบจัดการคืนสินค้าและวันหมดอายุ
- `faq.html`: ระบบจัดการฐานความรู้

---

## 🔒 การรักษาความปลอดภัย (Security)
-   **API Key Restrictions:** จำกัดการใช้งาน API Key เฉพาะโดเมนที่อนุญาต
-   **Role-Based Access:** ตรวจสอบสิทธิ์ (Admin/Staff/Member) ก่อนเข้าใช้งาน
-   **Zero-Code Credentials:** ปฏิบัติตามมาตรฐาน Google Cloud โดยไม่เก็บ Secret Keys ไว้ใน Code

---

*พัฒนาโดยทีม Medlife Plus Service*
*Developed by Medlife Plus Service*
