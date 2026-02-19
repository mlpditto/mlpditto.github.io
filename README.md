# 🏥 MLP - FKB Front Kanban

[![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)](https://fkb-front-kanban.web.app)
[![Framework](https://img.shields.io/badge/Framework-Vanilla_JS-orange.svg)](https://javascript.info)
[![Database](https://img.shields.io/badge/Database-Firebase-yellow.svg)](https://firebase.google.com)
[![UI](https://img.shields.io/badge/UI-Tailwind_CSS-blueviolet.svg)](https://tailwindcss.com)

ระบบบริหารจัดการร้านยาและเวชภัณฑ์ครบวงจร ที่เชื่อมต่อกับ LINE LIFF และ Firebase เพื่อการทำงานที่รวดเร็วและแม่นยำ

Comprehensive pharmacy and medical supply management system integrated with LINE LIFF and Firebase for efficient and accurate workflows.

---

## 🚀 ฟีเจอร์หลัก (Main Features)

### 1. 🛒 ระบบลูกค้า (Customer Portal - index.html)
*   **ภาษาไทย:** ลูกค้าสามารถลงทะเบียนสมาชิกผ่าน LINE/Google, แจ้งออเดอร์สินค้า, และบันทึกประวัติสุขภาพ (SOAP)
*   **English:** Customer registration via LINE/Google, order submission, and health history (SOAP).

### 2. 🛡️ ศูนย์บริหารจัดการ (Admin Hub - admin.html)
*   **ภาษาไทย:** ระบบ Kanban Board สำหรับติดตามภาระงาน, ระบบ **Day Counter** แจ้งเตือนธงแดง, และจัดการสิทธิ์ผู้ใช้งาน (RBAC)
*   **English:** Kanban Board for task tracking, **Day Counter** with red flag alerts, and Role-Based Access Control (RBAC).

### 3. 📊 ระบบวิเคราะห์ยอดขาย (Sales Analytics.html)
*   **ภาษาไทย:** วิเคราะห์ยอดขายเชิงลึกจากไฟล์ CSV, แสดงผลเป็นกราฟ (Chart.js), ฟีเจอร์ Privacy Mode ซ่อนยอดเงิน (แสดงเป็น %), และระบบจัดอันดับพนักงาน
*   **English:** In-depth sales analysis from CSV, interactive charts (Chart.js), Privacy Mode for financial data, and staff performance ranking.

### 4. 📦 ระบบจัดการข้อมูลส่งพัสดุ (TMTP Manager - TMTP-Manager.html)
*   **ภาษาไทย:** ระบบออกใบกำกับภาษี (Premium Tax Invoice) พร้อม BahtText, รันเลข INV/REF อัตโนมัติ, และสรุปยอดส่งพัสดุแยกประเภท (MED/PHARM/NHSO)
*   **English:** Professional Tax Invoice generation with BahtText support, automatic INV/REF sequences, and shipment categorization.

### 5. 💊 ระบบสั่งยาอัจฉริยะ (ProOrder Manager - proorder.html)
*   **ภาษาไทย:** ระบบรวบรวมรายการสั่งยาด้วย Smart Paste, ฐานข้อมูล Master DB (Firestore), ระบบ Sanitization ชื่อสินค้า (รองรับเครื่องหมาย /), และระบบสำรองข้อมูล JSON
*   **English:** Order aggregation via Smart Paste, Firestore Master DB, Item name sanitization (supports /), and JSON data backups.

### 6. 📋 ระบบประวัติการรักษา (SOAP History - history.html)
*   **ภาษาไทย:** บันทึกประวัติมาตรฐาน SOAP Note พร้อม Smart Datalist (Nationality/Race), เชื่อมโยงประวัติรักษากับออเดอร์สินค้า, และนำเข้าข้อมูล Excel/CSV
*   **English:** Professional SOAP record system with smart dropdowns, patient profile linking history with orders, and Excel/CSV import.

### 7. 🛵 ระบบบันทึกยอดขาย LINE MAN (Sales Recorder - lineman-mgr.html)
*   **ภาษาไทย:** (V7.0) บันทึกยอดขายจากแอป Rider ด้วย UI แบบ Collapsible, ตารางสินค้าแบบย่อ, ระบบคำนวณ GP/Net อัตโนมัติ, และติดตามความเร็วในการรับโอนเงิน
*   **English:** Mobile-first sales recorder with collapsible UI, auto-calculation (GP/Net), and performance tracking for payment speed.

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| Category | Technology |
| :--- | :--- |
| **Frontend** | HTML5, Vanilla JavaScript, Tailwind CSS 4.x |
| **Backend** | Firebase Firestore, Firebase Auth, Firebase Hosting |
| **Integration** | LINE LIFF SDK, Google Fonts (Prompt / IBM Plex Sans Thai Looped) |
| **Libraries** | Chart.js, Font Awesome 6.x, XLSX/PapaParse, BahtText Logic |

---

## 📂 โครงสร้างไฟล์ (File Structure)

- `index.html`: หน้าหลักสำหรับลูกค้า (Customer Portal)
- `admin.html`: ระบบหลังบ้านสำหรับทีมงาน (Admin Hub)
- `Sales Analytics.html`: ระบบวิเคราะห์ยอดขายเชิงลึก
- `TMTP-Manager.html`: ระบบจัดการข้อมูลส่งพัสดุ & Tax Invoice
- `proorder.html`: ระบบสั่งยาอัจฉริยะ (Master Database)
- `history.html`: ระบบประวัติการรักษา (SOAP History)
- `lineman-mgr.html`: ระบบบันทึกยอดขาย LINE MAN (Sales Recorder)
- `vci-visitor-check-in.html`: ระบบบันทึกผู้มาติดต่อ (Visitor Check-in)
- `return-log-int.html`: ระบบจัดการคืนสินค้าและวันหมดอายุ
- `faq.html`: ระบบจัดการฐานความรู้

---

## 🔒 การรักษาความปลอดภัย (Security)
-   **Role-Based Access:** ตรวจสอบสิทธิ์ (Admin/Staff/Member) ก่อนเข้าใช้งาน
-   **Security Rules:** ใช้ Firestore Rules ป้องกันการเข้าถึงข้อมูลข้ามสิทธิ์
-   **Data Integrity:** ระบบ Sanitization ป้องกันอักขระพิเศษทำลายโครงสร้างฐานข้อมูล

---

*พัฒนาโดยทีม Medlife Plus Service*
*Developed by Medlife Plus Service*
