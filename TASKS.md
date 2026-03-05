# 📝 Task Log - FKB Front Kanban

## 📅 5 มีนาคม 2026 (Stock Intelligence & Layout Refactor)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **ProOrder Manager (v4.18):**
    -   **Smart Stock Parsing:** ปรับปรุงระบบ Paste ให้สามารถดึงข้อมูล "จำนวนคงเหลือ" (Remaining Stock) จากตารางข้อมูลดิบได้อัตโนมัติ
    -   **Zero-Stock Filter (เหลือ 0):** เพิ่มปุ่มลัด (Box Icon) สำหรับกรองแสดงเฉพาะสินค้าที่ของขาดสต็อก (Remaining = 0) พร้อมทำแถบแจ้งเตือนสีแดงกระพริบให้เห็นชัดเจน
    -   **Paste Overwrite Logic:** แก้ไขปัญหาการวางรายการซ้ำแล้วจำนวนบวกเพิ่มสะสม โดยเปลี่ยนเป็นระบบ "เขียนทับ" (Overwrite) ด้วยจำนวนล่าสุดที่ระบุแทน
    -   **Version Up v4.18:** อัปเดต Changelog และเวอร์ชันของระบบเพื่อรองรับฟีเจอร์ใหม่
*   **B2B Wholesale Portal (ecom.html):**
    -   **PC Full-Width Layout:** ปลดล็อกข้อจำกัดความกว้างหน้าจอ (Max-width) สำหรับผู้ใช้งานบนคอมพิวเตอร์ ทำให้ระบบแสดงผลเต็มหน้าจอ (Full Width) เพื่อการดูรายการสินค้าที่ครบถ้วนและสบายตามากขึ้น


## 📅 1 มีนาคม 2026 (LINE MAN Monthly Storage Refactor)

### 🔧 การแก้ไขบัค
*   **LINE MAN Sales Recorder (lineman-mgr.html):**
    *   **CSV Import สาขารอง (PNP) ไม่แสดงข้อมูล:** แก้ไขบัค Critical ที่ทำให้ข้อมูลที่ Import จาก CSV ขณะอยู่ใน Tab สาขารอง ไม่ปรากฏขึ้น (Hardcoded `'lineman_sales'` แทน `currentStore`)

### 🚀 ฟีเจอร์ใหม่ (Major Refactor)
*   **Per-Month Firestore Storage:** ปรับสถาปัตยกรรมการจัดเก็บข้อมูลจาก Single Document ต่อ Store เป็น **Monthly Documents** (`system/{store}_{YYYY-MM}`) เพื่อแก้ปัญหา Firestore 1MB limit เมื่อมีข้อมูลสะสมจำนวนมาก
    *   **Auto-Migration:** ระบบตรวจจับและ Migrate ข้อมูลรูปแบบเก่าไปยังรูปแบบใหม่อัตโนมัติเมื่อโหลดครั้งแรก
    *   **Month Index Document:** จัดการรายชื่อเดือนที่มีข้อมูลผ่าน `{store}_index` document แทนการ scan Records
    *   **Month-Aware CSV Import:** Import CSV ได้หลายเดือนพร้อมกัน ระบบจะจัดกลุ่มและบันทึกแยก Document ต่อเดือนอัตโนมัติ แสดงสรุปว่า Import เดือนใดบ้าง
    *   **Smart Month Switching:** เปลี่ยนเดือนใน Dropdown จะ Subscribe Firestore listener ของเดือนนั้นแทนการ Filter ใน Memory
    *   **Cross-Month Edit Support:** แก้ไขรายการเปลี่ยนวันที่ข้ามเดือนได้ — ระบบย้าย Record จาก Doc เดือนเก่าไปเดือนใหม่อัตโนมัติ

## 📅 27 กุมภาพันธ์ 2026 (Local Invoice Bot & Analytics Security)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **TMTP Manager (TMTP-Manager.html):**
    *   **BOT PDF Download:** เพิ่มปุ่ม "BOT PDF" สีแดงแบบพิเศษในหน้า Daily Summary เพื่อเรียกใช้งาน Local Invoice Bot ให้ดาวน์โหลดไฟล์ใบกำกับภาษีต้นฉบับรูปแบบ PDF
    *   **Custom Save Path:** ปรับปรุง UI ใหม่เป็น Custom Modal พร้อมเพิ่มปุ่มลัด (Preset Buttons) สำหรับเลือกโฟลเดอร์ปลายทาง (.เช่น `C:\Invoices`, `CHIIWII Date`) เพื่อความสะดวกรวดเร็วในการดาวน์โหลด
    *   **Python Command Shortcut:** เพิ่มปุ่ม "Code" หน้าตาคล้าย Terminal ตรงเมนูด้านบน เพื่อคลิกคัดลอกคำสั่ง `python local_invoice_bot/invoice_server.py` ได้ทันที ช่วยให้แอดมินไม่ต้องพิมพ์คำสั่งเองเมื่อเริ่มใช้งานบอท
*   **Local Invoice Bot (Python Server):**
    *   **Automated Playwright PDF Downloader:** สร้างสคริปต์ `download_invoice.py` ที่ล็อกอินเข้าสู่ระบบหลังบ้านอัตโนมัติ ค้นหาเอกสารตามเงื่อนไข และ Export เป็น PDF แท้
    *   **Smart Auto-Stop:** บอทจะหยุดค้นหาในหน้าเว็บทันทีที่พบออเดอร์เป้าหมายครบถ้วน ช่วยให้ทำงานเร็วขึ้นมาก
    *   **Local Flask API:** สร้าง `invoice_server.py` เพื่อเปิด Local Server รับ Request จัดการสร้างโฟลเดอร์ตามวันที่/หมวดหมู่ และเซฟไฟล์เข้าเครื่องโดยตรง
*   **Firestore Security (firestore.rules):**
    *   **TMTP Cloud Access:** เพิ่ม Rules ให้สามารถอ่านและเขียนข้อมูลคอลเลกชัน `tmtp_records` และ `tmtp_backups` เพื่อรองรับฟีเจอร์ Cloud Sync และ Cloud Restore
    *   **Sales Analytics Rules:** เพิ่ม Rules ให้อ่านและเขียนข้อมูลคอลเลกชัน `sales_analytics` เพื่อรองรับการเซฟโปรเจกต์งานวิเคราะห์ยอดขาย

## 📅 26 กุมภาพันธ์ 2026 (B2B ECOM Wholesale)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **B2B Wholesale Portal (ecom.html):**
    *   **New ECOM UI:** สร้างหน้าเว็บ B2B Wholesale Portal สำหรับให้ลูกค้าเข้ามาเลือกซื้อสินค้า (ขายส่ง) ด้วย UI ที่ทันสมัย (ส้ม-เทา)
    *   **Live Product Search:** ระบบค้นหาสินค้าจากชื่อและบริษัทแบบ Real-time โดยดึงข้อมูลประเภทยา เครื่องมือแพทย์จากฐานข้อมูลกลาง
    *   **Shopping Cart Drawer:** ระบบตะกร้าสินค้าแบบแถบสไลด์ด้านข้าง พร้อมคำนวณยอดรวมและจำนวนชิ้นแบบอัตโนมัติ และแจ้งเตือน SweetAlert2
    *   **Smart Pricing Emulator:** ระบบดึงราคาส่ง `sp_wholesale` หรือคำนวณราคาจำลองจาก `sp_store` เพื่อแสดงส่วนลดที่น่าสนใจสำหรับระบบ B2B B2C
    *   **Role-Based Access Components:** แสดง UI พิเศษ (Dashboard วิเคราะห์ออเดอร์) และเครื่องมือแจ้งเตือน Low Stock หุ้นเหลือน้อยเฉพาะ Admin
    *   **Admin Product Management:** เพิ่มระบบแก้ไขข้อมูลสินค้าสำหรับ Admin บนหน้า ECOM (Product Modal)
    *   **Smart Category Filtering:** เพิ่มระบบจัดหมวดหมู่สินค้าและแสดงผลตัวกรอง Sidebar แบบ Real-time
    *   **Auto Resize Image Upload:** ระบบอัปโหลดรูปภาพสินค้าพร้อมบีบอัดขนาดอัตโนมัติ (ไม่เกิน 800px) แปลงไฟล์แนบแบบ Base64 ไปยัง Firestore
    *   **Product Visibility Control:** เพิ่มคุณสมบัติซ่อน/แสดงสินค้าสำหรับ Admin เพื่อความรัดกุมในการจำหน่าย
    *   **Admin Dashboard Integration:** อัปเดตเมนูด้านบนของ `admin.html` ให้เชื่อมโยงไปยัง `ecom.html` ผ่านปุ่มระบบ ECOM ด้านขวาบน

## 📅 26 กุมภาพันธ์ 2026 (Stock Return Sync & Smart Features)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **Stock Manager (return-log-int.html):**
    *   **Cloud Autosave & Sync (Real-time):** ปรับปรุงระบบบันทึกให้ซิงก์ข้อมูลขึ้น Cloud (Firestore) อัตโนมัติทุกครั้งที่มีการเพิ่ม แก้ไข ลบ หรือ Import ข้อมูล เพื่อป้องกันข้อมูลสูญหาย และรองรับการทำงานหลายเครื่องพร้อมกัน
    *   **Smart Drafting (LocalStorage):** เพิ่มระบบจำค่าที่กำลังพิมพ์ค้างไว้ในฟอร์ม (Draft) หากผู้ใช้เผลอปิดหน้าต่าง ข้อมูลจะไม่หาย และเพิ่มระบบยืนยัน (Confirm) เมื่อกดปุ่ม Reset เพื่อป้องกันการลบข้อมูลในฟอร์มโดยไม่ตั้งใจ
    *   **Intelligent Product Autocomplete:** เปลี่ยนช่องกรอกชื่อสินค้าให้เป็นแบบ Dropdown (`<datalist>`) ค้นหาและดึงข้อมูลจาก Master Products มาให้เลือกอัตโนมัติ ช่วยลดความผิดพลาดในการพิมพ์
    *   **Merge Duplicate Entries:** เพิ่มระบบตรวจสอบสินค้าซ้ำ (ทั้งชื่อและ Lot) ก่อนบันทึก หากพบระบบจะเด้งถามผู้ใช้ว่าต้องการ **"รวมจำนวน (Merge)"** เข้ากับรายการเดิม หรือ **"สร้างรายการแยกกัน"** เพื่อความยืดหยุ่นและป้องกันการคีย์ยอดกระจาย
    *   **Enhanced Reporting:** เพิ่มปุ่ม **Export CSV** สำหรับดาวน์โหลดรายงานเฉพาะรายการที่ผ่านการกรอง (Filter) แล้ว เพื่อความสะดวกในการส่งบัญชีหรือหัวหน้า
    *   **UX Improvements (Toast UI):** เปลี่ยนระบบแจ้งเตือนผลลัพธ์การกระทำ (บันทึก/แก้ไข/ลบสำเร็จ) จากข้อความเล็กๆ ไปใช้ Toast Notification (SweetAlert2) ที่เด้งมุมขวาบนแบบ Modern UI เคลียร์และชัดเจนขึ้น
    *   **Strict Form Validation:** ป้องกันไม่ให้บันทึกจำนวน (Qty) เป็น 0 หรือติดลบ เพื่อลดข้อผิดพลาดในการทำข้อมูลคืนสินค้า

## 📅 26 กุมภาพันธ์ 2026 (Product Alias & PC Readability)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **ProOrder Manager (proorder.html):**
    *   **Product Alias (AKA) Functionality:** เพิ่มระบบ "ชื่อเรียกอื่นๆ" ให้สินค้าในฐานข้อมูล Master เพื่อรองรับสินค้าที่มีหลายชื่อจาก Supplier ต่างกัน
    *   **Smart Name Resolution:** ระบบ `batchAddProducts` และการ Import จะค้นหาชื่อสินค้าจากทั้งชื่อหลักและ Alias อัตโนมัติ (Resolved via Firestore `array-contains`) ทำให้ข้อมูลรวมกลุ่มกันได้แม่นยำขึ้น
    *   **Master Modal Update:** เพิ่ม UI สำหรับจัดการ Alias ในหน้าแก้ไขข้อมูลสินค้าหลัก พร้อมระบบเพิ่มฟิลด์แบบ Dynamic
    *   **Alias Matches Visibility:** แสดงชื่อ Alias ที่ถูกจับคู่ในหน้าค้นหา (Master Explorer) และหน้าประมวลผลการสั่งซื้อเพื่อให้ผู้ใช้ทราบว่ารายการนั้นถูกจับคู่มาจากชื่อใด
*   **LINE MAN Sales Recorder (lineman-mgr.html):**
    *   **PC UI Typography & Comfort:** ปรับปรุงความสบายตาในการใช้งานบนคอมพิวเตอร์ โดยเพิ่มขนาด Font พื้นฐานและปรับปรุง Hierarchy ของตัวอักษรในโหมด Responsive (PC View)
    *   **Global Layout Adjustments:** ขยายขนาดตาราง ป้ายสถานะ และระยะห่างของ Label ต่างๆ ให้เหมาะสมกับหน้าจอใหญ่ ลดภาระสายตาสำหรับเภสัชกร/แอดมินที่ต้องดูจอเป็นเวลานาน
    *   **Tailwind Style Fixes:** แก้ไขปัญหา CSS Lint ในส่วนการ Custom ขนาดตัวอักษรแบบเจาะจงที่ใช้ร่วมกับ Tailwind Utility Classes

## 📅 25 กุมภาพันธ์ 2026 (Smart Company Merge)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **SOAP History (history.html):**
    *   **Drug Purchase History (Objective):** เพิ่มระบบบันทึกรายการยาที่จ่าย/สั่งซื้อในหัวข้อ Objective (O) โดยเชื่อมโยงกับฐานข้อมูล **Master Drug** อัตโนมัติ
    *   **Master Autocomplete:** ระบบแนะนำชื่อยาและดึงหน่วยนับ (Unit) จากฐานข้อมูลกลาง ทำให้บันทึกข้อมูลได้รวดเร็วและแม่นยำ
    *   **Integrated Reporting:** รายการยาที่จ่ายจะถูกแสดงรวมในหน้า Preview และหน้าพิมพ์ประวัติรักษา (Print Record) โดยอัตโนมัติ
*   **ProOrder Manager (v4.16):**
    *   **Auto-Detect Similar Companies:** เพิ่มปุ่ม "ค้นหาชื่อคล้ายกัน" ในหน้า Company Registry เพื่อช่วยตรวจจับชื่อบริษัทที่พิมพ์ผิดหรือมีความแตกต่างเล็กน้อย (เช่น หจก., บจก., สำนักงานใหญ่) โดยใช้ระบบ Normalized Similarity
    *   **Thai Context Optimization:** ปรับปรุงระบบวิเคราะห์ชื่อบริษัทให้รองรับคำเฉพาะทางภาษาไทย (บจก, หจก, สาขา, สำนักงานใหญ่) ทำให้การจัดกลุ่มชื่อที่คล้ายกันแม่นยำขึ้นมาก
    *   **Workflow Integration:** เมื่อกดค้นหา ระบบจะเลือกรายการที่คล้ายกันให้โดยอัตโนมัติ เพื่อให้ผู้ใช้กดปุ่ม "รวม (Merge)" เพื่อจัดการต่อได้ทันทีในคลิกเดียว

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **TMTP Manager Cloud Restore (v6.10):**
    *   **Cloud Restore Feature:** เพิ่มระบบดึงข้อมูลย้อนหลังจาก Cloud (Firestore) โดยการระบุวันที่ ทำให้สามารถกู้คืนข้อมูลมาวิเคราะห์ต่อได้แม้จะล้างข้อมูลในเครื่องไปแล้ว
    *   **Cloud Data Management:** ปรับปรุง UI เพิ่มปุ่ม "Cloud" ในส่วน Data Input เพื่อเปิด Modal สำหรับเลือกวันที่ต้องการ Restore
*   **TMTP Manager Enhancements (v6.9):**
    *   **Instant Paste Backup:** เพิ่มระบบสำรองข้อมูลดิบอัตโนมัติทันทีที่ "วาง" (Paste) ข้อมูลลงในกล่องรับข้อมูล โดยระบบจะตรวจจับวันที่ (Extraction) และบันทึกลง Firestore (`tmtp_backups`) เพื่อป้องกันข้อมูลสูญหาย
    *   **Cloud Synchronization:** ข้อมูลที่ผ่านการประมวลผลแล้วจะถูกซิงก์ขึ้น Cloud (`tmtp_records`) โดยอัตโนมัติ เพื่อสะสมเป็นประวัติยาวนาน (History) สำหรับการดึงมาวิเคราะห์ (Analyze) ย้อนหลังได้แม้อยู่คนละเครื่องหรือล้างข้อมูลในเครื่องไปแล้ว
    *   **Historical Analysis Ready:** ข้อมูลที่ซิงก์ขึ้น Cloud จะถูกจัดเก็บแบบแยกรายการอย่างเป็นระเบียบ ทำให้แอดมินสามารถนำข้อมูลไปทำรายงานสรุปยอดขายระยะยาวได้แม่นยำขึ้น
*   **User Order Form Refactoring (index.html):**
    *   **Admin Sync:** ปรับเปลี่ยนฟิลด์ในแบบฟอร์มสั่งซื้อฝั่งลูกค้าให้สอดคล้องกับระบบบันทึกงานของแอดมิน เพื่อความสม่ำเสมอของข้อมูล
    *   **Work Details Area:** เปลี่ยนจากช่องกรอกชื่อสินค้าบรรทัดเดียวเป็น **Textarea** ขนาดใหญ่ เพื่อรองรับการพิมพ์รายละเอียดงานหรือรายการสั่งซื้อที่ละเอียดเหมือนฝั่งแอดมิน
    *   **Deadline Integration:** เพิ่มช่องเลือก **วันที่และเวลา (Deadline)** ในหน้าสั่งซื้อ เพื่อให้ลูกค้ากำหนดเวลาที่ต้องการงานเสร็จได้โดยตรง และข้อมูลจะไปปรากฏบน Kanban Board ทันที
    *   **Data Model Synchronization:** ปรับปรุง Logic การส่งข้อมูลไปยัง Firestore ให้รองรับฟีลด์ `deadline` และใช้ `productName` สำหรับเก็บรายละเอียดงานทั้งหมด เพื่อให้แอดมินบริหารจัดการงานได้ง่ายขึ้น

---

## 📅 21 กุมภาพันธ์ 2026 (ระบบคำนวณกำไร LINE MAN)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **Cost & Profit Management (lineman-mgr.html):**
    *   **เพิ่มระบบคำนวณกำไร (PROFIT):** เพิ่มช่องกรอก **"ต้นทุน (COST)"** ในหน้าบันทึกและแก้ไขยอดขาย เพื่อใช้คำนวณกำไรแบบ Real-time
    *   **Auto-Profit Calculation:** ระบบคำนวณกำไรทั้งแบบจำนวนเงิน (บาท) และเปอร์เซ็นต์ (%) อัตโนมัติ (`Net - Cost = Profit`)
    *   **Smart Cost Autofill:** ดึงข้อมูลต้นทุนจาก **Master Products** มาคำนวณให้อัตโนมัติเมื่อเลือกสินค้าในรายการ เพื่อลดภาระการกรอกข้อมูล
    *   **Dynamic Profit Visualization:** แสดงสถานะกำไร/ขาดทุนด้วยสี (เขียว/แดง) ตามเงื่อนไข ทำให้ตรวจสอบประสิทธิภาพการขายได้ทันที
    *   **Dashboard Profit Summary:** เพิ่มยอดรวม **"กำไรรวมประจำเดือน"** บนหน้า Dashboard หลัก เพื่อการติดตามผลประกอบการที่รวดเร็ว
    *   **Realized Profit Tracking:** ปรับปรุงการคำนวณกำไรบน Dashboard ให้ดึงมาเฉพาะรายการที่ **"เงินเข้าแล้ว" (Paid)** และมีข้อมูล **"ต้นทุน"** ครบถ้วน เพื่อป้องกันการแสดงกำไร 100% หรือกำไรที่ยังไม่เกิดขึ้นจริง
    *   **History Enrichment:** เพิ่มการแสดงผลกำไรและเปอร์เซ็นต์กำไรในตารางประวัติยอดขายทุกรายการ
    *   **Enhanced CSV Export:** ปรับปรุงไฟล์ส่งออกข้อมูลให้รวมคอลัมน์ Cost, Profit และ Profit % เพื่อการวิเคราะห์เชิงลึก
    *   **Stability & Safety Fix (Major):**
        *   **Global UI Safety Wrappers:** เพิ่มฟังก์ชัน `safeSetText` และ `safeSetClass` ครอบคลุมทั้งระบบ เพื่อป้องกันหน้าจอค้าง (Crash) หากมี Element บางจุดหายไปหรือไม่พบข้อมูล
        *   **Form ID Restoration:** แก้ไขปัญหา Critical Bug ที่ ID บางส่วนหายไป (`form-title`, `form-icon`) จนทำให้ตารางรายการไม่แสดงผล
        *   **Try-Catch Payout UI:** แยกการทำงานของหน้าสรุปยอดโอน (Payout) ไม่ให้ปัญหาเล็กน้อยในส่วนนั้นส่งผลกระทบต่อตารางยอดขายหลัก
    *   **Smart CSV Import 2.0:**
        *   **Order vs Received Mapping:** ปรับปรุงการ Import ให้แยก **"เวลาที่สั่ง"** และ **"เวลารับสินค้า (Received)"** ออกจากกันอย่างถูกต้อง ทำให้คำนวณ Performance (ความเร็ว) ได้ทันทีหลัง Import
        *   **Smart Merge Logic:** ระบบรวมข้อมูลฉลาดขึ้น โดยจะเลือกเก็บข้อมูลที่ "สมบูรณ์กว่า" และ **ไม่เขียนทับข้อมูลที่แอดมินกรอกเอง** (เช่น ชื่อลูกค้า, เบอร์โทร) เมื่อมีการ Import ซ้ำ

---

## 📅 20 กุมภาพันธ์ 2026 (OCR & Master Data Expansion)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **AI OCR Integration (proorder.html):** 
    *   เพิ่มระบบ **Tesseract.js** เพื่อรองรับการดึงข้อมูลจาก **รูปภาพ (Image)** และ **PDF ที่มาจากการสแกน** (Scanned PDF)
    *   ปรับปรุงระบบ **Line Reconstruction** ใน PDF โดยการจัดกลุ่มข้อความตามพิกัดแนวตั้ง (Y-coordinate) ทำให้การรวมบรรทัดแม่นยำขึ้นมากแม้ในไฟล์ที่มี Column ซับซ้อน
    *   เพิ่มระบบ **Manual Line Picker:** ให้ผู้ใช้เลือกเฉพาะบรรทัดที่เป็นรายการสินค้าเพื่อนำไปประมวลผลต่อ ป้องกันข้อความขยะ (Headers/Footers) เข้ามารบกวน
*   **Master Data Expansion:** 
    *   เพิ่มฟิลด์ **ราคาขาย (Selling Prices)** 4 ระดับ: **หน้าร้าน (Store), Platform, ส่ง (Wholesale), และราคาแนะนำ (Suggested)** เพื่อใช้ในการอ้างอิงและทำกำไร
    *   เพิ่มปุ่ม **"เพิ่มรายการ" (Add Product)** ในหน้า Master Explorer เพื่อให้สามารถสร้างฐานข้อมูลสินค้าใหม่ได้ด้วยมือทันที โดยไม่ต้องรอ Import
*   **TMTP Manager UI Tweaks (TMTP-Manager.html):**
    *   ปรับตำแหน่งปุ่ม **"Copy"** ในหน้า Draft Email ให้มาอยู่ด้านหน้าซ้ายสุด (ก่อนหน้าชื่อหมวด) เพื่อความสะดวกในการใช้งานแบบต่อเนื่อง (Better Ergonomics)
*   **Bug Fixes & Security:**
    *   ปรับปรุงระบบ Sanitize Firestore Document ID ให้รองรับอักขระพิเศษได้ครอบคลุมขึ้น
    *   แก้ไข UI ของ Master Product Modal ให้รองรับการ "ลบ" และ "ย้ายบริษัท" ในส่วนการวิเคราะห์ได้เสถียรขึ้น

---

## 📅 19 กุมภาพันธ์ 2026 (Documentation & Feature Sync)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **Firestore Security Fix (proorder.html):** แก้ไขปัญหา "Invalid document reference" เมื่อใช้ชื่อสินค้าที่มีเครื่องหมาย `/` โดยการเพิ่มระบบ Sanitize ชื่อไฟล์อัตโนมัติก่อนบันทึก `master_products` (ใช้ฟังก์ชัน `getDocId`)
*   **Documentation Milestone:** ปรับปรุง `FEATURES.md`, `README.md` และ `TASKS.md` ให้เป็นปัจจุบันที่สุด ครอบคลุมฟีเจอร์ใหม่ๆ เช่น Sales Analytics (Privacy Mode), Premium Tax Invoice (BahtText) และ LINE MAN Recorder (V7.0 Redesign)
*   **Sales Analytics:** เพิ่มคู่มือการใช้งานระบบวิเคราะห์ยอดขายเชิงลึกและการซ่อนตัวเลขยอดเงิน
*   **Searchable References:** แสดงเลขที่อ้างอิง (REF) ใต้เลขที่ใบกำกับภาษีในตารางหลัก และสามารถใช้ค้นหาข้อมูล (Reverse Lookup) ได้ทันที
*   **Editable Tables:** ข้อมูลในตารางสามารถแก้ไขได้ทันที (Inline Edit) ทั้งเลข INV, ยอดเงิน, และพนักงาน
*   **Cloud Operations (v6.10):**
    *   **Cloud Restore:** ระบบดึงข้อมูลออเดอร์ย้อนหลังตามวันที่จาก Cloud (Firestore) ช่วยให้ทำงานต่อเนื่องได้ทุกที่
    *   **Instant Paste Backup:** ระบบสำรองข้อมูลดิบอัตโนมัติเมื่อมีการ "วาง" ข้อมูล ปลอดภัยกว่าเดิม
    *   **Cloud Sync:** ข้อมูลที่ผ่านการ Process จะถูกเก็บขึ้น Cloud อัตโนมัติเพื่อใช้ในการวิเคราะห์ระยะยาว
*   **ProOrder Manager:** ปรับปรุงรายละเอียดระบบ Master Database, การรวมชื่อบริษัท (Merge), และระบบค้นหาอัจฉริยะที่คงผลลัพธ์ขณะแก้ไข
*   **VCI (Visitor Check-in) System Enhancements:**
    *   **Permission Center:** รวมเมนู "Approval" และ "Visit requests" เป็น **"Permission"** (Combined Badge & KPI Table) เพื่อความคล่องตัว
    *   **Unified History:** หน้า **Log History** แสดงรวมทั้ง Check-in และ Booking พร้อมสถานะแยกสี (Green/Indigo)
    *   **Apt History in Profile:** เพิ่มแท็บประวัตินัดหมายในหน้าโปรไฟล์รายคน (history.html)
    *   **Dashboard KPI Layout:** รวมยอด Permission เป็นใบเดียวและจัด Layout 4 Columns
    *   **Appointment Form 2.0:** เพิ่มระบบเลือกเวลาเริ่ม-จบ (Start/End Time) และปุ่มเลือกวัตถุประสงค์ (Training, เสนอสินค้า, อื่นๆ) พร้อมระบบบังคับกรอกเหตุผล
    *   **VCI Dashboard Redesign:** ปรับโฉมหน้า Admin เป็น Single Page Hub ขยายเต็มหน้าจอ และใช้ระบบ **Popup (Modal)** ในการอนุมัติสมาชิกและนัดหมาย เพื่อความคล่องตัว
    *   **User UI Preview:** เพิ่มระบบจำลองหน้าจอมือถือ (Mockup) ในหน้า Dashboard เพื่อให้แอดมินทดสอบขั้นตอนของผู้ติดต่อได้ทันที
    *   **Google Calendar Sync Fix:** แก้ไข Firebase Functions เป็นเวอร์ชัน **v2 (Modern Syntax)** เพื่อรองรับ Node.js 22/24 และซิงก์ข้อมูลนัดหมายลงปฏิทินกลางได้สำเร็จ
    *   **Firestore & JS Optimization:** แก้ไขปัญหาการเรียงลำดับข้อมูลที่ติด Error Missing Index และแก้บัค Script ค้างในหน้า Portal ประวัติ

---

## 📅 18 กุมภาพันธ์ 2026 (ระบบบันทึกยอดขาย LINE MAN)

### 🚀 ฟีเจอร์ใหม่
*   **ระบบสำรองข้อมูล (JSON Backup):** เพิ่มปุ่มสำหรับส่งออกข้อมูลทั้งหมดในรูปแบบ JSON ต่อยอดจากระบบ CSV เดิม เพื่อรองรับการสำรองข้อมูลที่สมบูรณ์กว่า

### 🔧 การแก้ไขบัคและปรับปรุงความเสถียร (lineman-mgr.html)
*   **แก้ไขปัญหาการกดปุ่ม "บันทึก" ไม่ได้:**
    *   **Browser Validation Fix:** เพิ่ม `novalidate` และย้ายการตรวจสอบข้อมูลมาทำผ่าน JavaScript แทน เพื่อแก้ปัญหา "An invalid form control is not focusable" ซึ่งเกิดขึ้นเมื่อเบราว์เซอร์พยายาม Focus ฟิลด์ที่มองไม่เห็น (เช่น ใน Modal) จนทำให้ฟอร์มค้าง
    *   **Special Characters Handling:** ปรับฟังก์ชัน `addItemRow` ให้รองรับชื่อสินค้าที่มีอักขระพิเศษ (เช่น เครื่องหมายคำพูด `"`) ป้องกันตัวโค้ด HTML พัง
*   **รองรับสินค้าที่มีเครื่องหมาย `/`:** เพิ่มระบบ Escaping ชื่อสินค้าก่อนบันทึกลง Firestore (`master_products`) เพื่อไม่ให้เกิด Error จาก Path ของฐานข้อมูล
*   **เพิ่มความแม่นยำในการบันทึกแก้ไข:** โปรแกรมจะค้นหารายการใหม่ด้วย Unique ID (`recordedAt`) ทุกครั้งก่อนบันทึก ป้องกันการบันทึกทับผิดรายการหากลำดับตารางมีการสลับที่
*   **ปรับปรุงการแจ้งเตือน Error:** เพิ่มระบบ **Detailed Debugging** ในกล่องข้อความ Error (รายละเอียด Stack Trace สั้นๆ) เพื่อให้เภสัชกร/แอดมินแจ้งฝ่ายเทคนิคได้แม่นยำขึ้น

### 🎨 ปรับปรุง UI/UX
*   **ความแม่นยำของตัวเลข:** ปรับการแสดงผลยอดเงินรวม (Gross), GP และยอดรับสุทธิ (Net) บน Dashboard และตารางรายการ ให้แสดงทศนิยม 2 ตำแหน่งทั้งหมด (`฿XX.XX`)
*   **Smart Calc Logic:** แก้ไขปัญหาการคำนวณราคาในรายการสินค้าที่หยุดทำงานหากฟิลด์บางส่วน (item-total) ถูกนำออกไป

---
*บันทึกโดย Antigravity AI*
