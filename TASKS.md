# 📝 Task Log - FKB Front Kanban

## 📅 30 กรกฎาคม 2026 (11) — WARN popup: คอลัมน์ ออเดอร์/ORW โชว์ทั้งสองค่า

*   **ตาราง "สปสช ต้นทุน MLP ไม่ใช่ 0" ใน WARN popup:** เดิมโชว์ค่าเดียว (`orderId || orw`) → สองบรรทัดแบบเดียวกับโมดัลใส่ BAR — แยก helper กลาง `orderOrwCellHtml()` ให้สองตารางใช้ร่วมกัน (ORW เด่นบน / เลขออเดอร์จางล่าง / ไม่มีเลย = "-")
*   **ทดสอบ chromium:** helper ครบ 4 combo + render WARN popup จริงด้วย stub 2 บิล เซลล์ถูกทุกแถว + รันเทสต์ bar picker เดิมซ้ำผ่าน (กัน regression จาก refactor); bump `?v=20260730191500`
## 📅 30 กรกฎาคม 2026 (10) — โมดัลใส่ BAR หลายบิล: Smart Paste จับคู่ AR/ORW/INV + คอลัมน์ออเดอร์สองค่า

*   **คอลัมน์ ออเดอร์/ORW โชว์ทั้งสองค่า:** เดิมเลือกค่าเดียว (`orderId || orw`) → สองบรรทัดในช่องเดียว ORW ตัวหนาบน (ตรงกับเลขในใบวางบิล) / เลขออเดอร์ 020... ตัวเล็กจางล่าง
*   **Smart Paste (user เลือกแบบ 2A):** ปุ่มข้างช่อง BAR + ดัก Ctrl+V ทั้งโมดัล (ถือเป็น smart paste เมื่อข้อความมีเลขอ้างอิง ≥2 ตัวหรือมี BAR — วางเลขเดี่ยวในช่องค้นหายังปกติ) → ใช้ `parseBillingWorkbook` ตัวเดียวกับ Paste BILLING NOTE แกะหน้า "วางบิลลูกหนี้" แล้ว: เติมช่อง BAR จากหัวใบ, ติ๊กบิลตามลำดับความแม่น **AR → ORW → INV** (บิลหลาย AR คั่น `,` เช็กครบ), บิลที่ติด BAR อื่น = ไฮไลต์เหลือง+ไม่ติ๊ก (กันเผลอทับ), เปิด "แสดงทุกบิล" อัตโนมัติถ้าบิลที่เจอโดนตัวกรอง default ซ่อน, แถบสรุป `จับคู่ได้ N/M · ติด BAR อื่น · ไม่เจอในระบบ: ...` (โชว์ 6 ตัวแรก)
*   **การใส่จริงใช้เส้นทางเดิม** `applyBulkOverride` (audit trail + สถานะ "วางบิลแล้ว" เมื่อ BAR+AR ครบ) — ไม่แตะการคำนวณเงิน
*   **ทดสอบ chromium 14 เคส:** เติม BAR, ติ๊กตาม AR/ORW ถูกตัว, ติด BAR อื่นเตือนไม่ติ๊ก, showAll auto, สรุปครบ 3 ท่อน, คอลัมน์สองบรรทัด render จริง, ปุ่ม apply นับถูก, ข้อความไม่มีเลขอ้างอิง = แจ้งเตือนไม่พัง; bump `?v=20260730190000`
## 📅 30 กรกฎาคม 2026 (9) — CKNC: บิลประกัน "รายการยาไม่มี MLP" auto-จับคู่เมื่อวางบิลครบ+มีต้นทุน

*   **ขยายกติกา reconcile (user เลือกแบบมีเงื่อนไข):** เดิม `isReconciledNhsoClicknic` จำกัดเฉพาะ สปสช (clicknic-only + BAR + AR = จับคู่แล้ว) → rename เป็น `isReconciledClicknicOnly` และเพิ่ม**ประกัน**: ต้องมี BAR + AR ครบ **และมีข้อมูลต้นทุนแล้ว** (`billHasCostData` = bill.cost+mlpCost > 0 หรือทุนจริงรายบรรทัด realCost > 0) — บิลทุนยังว่างยังค้างเป็น "รายการยาไม่มี MLP" กันกำไรเวอร์หลุดเรดาร์; ประเภทเคสอื่น/สถานะอื่นไม่เข้ากติกา
*   **ผลอัตโนมัติทุกจุดที่ใช้ฟังก์ชันนี้:** แท็บจับคู่แล้ว/ตัวนับ, chip "รายการยาไม่มี MLP", issue CNM ในการ์ดบิล — ไม่แตะการคำนวณเงิน/ข้อมูลเซฟ (ตีความสถานะตอนแสดงผล ถอดกลับได้)
*   **ทดสอบ chromium 11 เคส:** สปสช เดิมครบ, ประกัน (ทุนรายบรรทัด/ทุนระดับบิล cost/mlpCost) = จับคู่, ประกันไม่มีทุน/ไม่มี AR = ไม่จับคู่, general/matched ไม่เข้ากติกา, integration ผ่านแท็บ matched/clicknic-only ถูกฝั่ง; bump `?v=20260730181602`
## 📅 30 กรกฎาคม 2026 (8) — CKNC: ชิปวัน/เดือนซ่อนช่วงที่ไม่มีบิลตรงตัวกรอง

*   **ปัญหา (user เสนอ):** กรองประเภทเคส "ประกัน" แล้วชิปวันยังโชว์ทุกวันพร้อมเลขนับรวมทุกเคส — กดวันที่ไม่มีเคสประกัน (เช่น 02/07) เจอ "ไม่พบข้อมูลตามตัวกรอง" เปล่า ๆ
*   **แก้:** ตัวกรองที่ไม่ใช่วันที่ทำงานอยู่ (แท็บสถานะ/ประเภทเคส/งานวางบิล/ค้นหา) → ชิปวัน/เดือน/ปี**ซ่อนช่วงที่ไม่มีบิลตรงตัวกรอง** และ**ตัวเลขในชิปเปลี่ยนเป็นจำนวนบิลที่ตรง** (เดิมนับออเดอร์ CLICKNIC ทั้งหมด); ไม่มีตัวกรอง = ชิปครบทุกวันเลขเดิมเป๊ะ
*   **โครง:** แยก `billMatchesNonDateFilters()` ออกจาก `filteredBills` (กติกาเดียวกัน ใช้ร่วมกัน) + `dateKeysForRange()` แชร์ logic โหมด dateField (primary/any/ระบุฟิลด์) กับ `isWithinDateRange` ที่ refactor ให้บางลง + `filteredDateChipCounts()` คืน Map วันที่→จำนวนบิล (null = ไม่มีตัวกรอง); ผูก re-render ชิปกับ search/caseType/billingStage (`renderFilterScopedViews`) และ `setActiveStatus` (กดแท็บ)
*   **ทดสอบ chromium (stub bills 4 ใบ 3 วัน):** กรองประกัน → วันสปสช-ล้วนหาย เลขชิปวัน+เดือนนับใหม่ถูก, แท็บ สปสช ก็กรองชิป, ล้างตัวกรองกลับครบเลขเดิม, regression `filteredBills` ประกัน+ช่วงวันได้ผลเดิม; bump `?v=20260730171500`
## 📅 30 กรกฎาคม 2026 (7) — LINE MAN: ปุ่ม UNPAID เป็นป้าย "รอโอน" นับวันค้าง สีไล่ระดับ

*   **แทน UNPAID เทาจาง (user เลือกแบบ A):** บิลยังไม่ PAID ในตารางประวัติแสดง `🕐 รอโอน` (วันนี้) / `🕐 รอ N วัน` — helper `unpaidWaitInfo()` นับจากวันขาย (`record.date`) ถึงวันนี้; **≤1 วัน = amber รอปกติ, ≥2 วัน = ส้มเข้ม ค้างนาน** ให้สะดุดตาว่าต้องตามเงิน LINE MAN; ยังเป็นปุ่มกด `quickSetPaid` เหมือนเดิม + title bar อธิบาย; วันที่ parse ไม่ได้ = "รอโอน" เฉย ๆ ไม่ crash
*   **ทดสอบ chromium (stub salesData + renderUI):** helper ครบ 4 เคส (วันนี้/1 วัน/3 วัน/วันที่พัง), render จริง 3 บิล → PAID เดิมคงอยู่, unpaid วันนี้ amber, unpaid 3 วันส้มเข้ม, จับภาพแถวยืนยัน
## 📅 30 กรกฎาคม 2026 (6) — CKNC: พรีวิว Paste BILLING NOTE โชว์ record ประกอบเสร็จ แทนบรรทัดดิบ

*   **ปัญหา (user รายงาน "แสดงผลไม่สมบูรณ์"):** หน้าใบวางบิลลูกหนี้ copy มา 1 แถวเว็บแตกเป็น 3 บรรทัด (AR / ORW+INV / วันที่+ยอด) — parser นำเข้าจริง (`parseBillingWorkbook`) merge ถูกอยู่แล้ว (ยืนยันด้วย chromium: 3 บรรทัด → 1 record ครบทุกช่อง) แต่**ตารางพรีวิว**โชว์บรรทัดดิบ เลยเห็น "40 rows" แถวแตกกระจาย
*   **แก้:** เพิ่ม `previewBillingRecords()` — โหมด billing พรีวิวเป็นตาราง record ที่ parser ประกอบแล้ว (ที่/BAR/AR/ORW/INV/วันที่/ยอดชำระ ใช้ `billingRowsFromText` ตัวเดียวกับ checksum) + summary "N รายการเครดิต · รวม ฿X"; สิ่งที่เห็น = สิ่งที่จะ import จริง; เพิ่ม listener ช่อง BAR/วันครบกำหนด → พรีวิวอัปเดตตาม (autofill ไม่ทับค่าที่พิมพ์เอง — guard เดิมใน `autofillBillingHead`); โหมด CLICKNIC/MLP พรีวิวดิบแบบเดิม
*   **ทดสอบ chromium:** 10 บรรทัดดิบ → 3 แถว record ครบช่อง, summary+ยอดรวมถูก, พิมพ์ BAR → คอลัมน์ BAR ตามทุกแถว, ปุ่ม Import เปิด, โหมด clicknic ยังนับบรรทัดดิบ (กัน regression); bump `?v=20260730154239`
## 📅 30 กรกฎาคม 2026 (5) — lean รายละเอียดการสั่งซื้อ: 4 หลักท้าย + เบอร์โทร เป็น chip กรอกได้บน header

*   **chip เป็นช่องกรอกในตัว (user เลือกแบบ A):** ย้าย input `orderId`/`customerPhone` (และ `e-` ฝั่ง edit) ขึ้น header ของ section รายละเอียดการสั่งซื้อ เป็น pill `[# 0065] [📞 0972763163]` — id เดิมทุกตัว โค้ด save/draft/autofill ไม่ต้องแตะ; ตัดแถวล่างเดิมทิ้งทั้งแถว (section สั้นลง 1 แถว); เห็นค่าได้แม้หุบ section
*   **โครง chip:** ห่อ `<label class="info-chip">` กดตรงไหนก็ focus input, `focus-within` ขอบฟ้า, `onclick="event.stopPropagation()"` ที่ container กัน toggle section ตอนกดพิมพ์; header title ใส่ `truncate title-label` (ซ่อนที่ ≤429px แบบเดียวกับหัวการชำระเงิน ให้ที่ chip บนจอแคบ)
*   **ทดสอบ chromium headless:** id ไม่ซ้ำ (แถวเดิมลบจริง), autofill จากเลขเต็มลง chip ทั้ง add/edit (รวม uppercase), คลิก chip → section ไม่หุบ + focus เข้า input, คลิกหัวข้อ → หุบปกติ, overflow 0 ทุกจอ 1280–360px
## 📅 30 กรกฎาคม 2026 (4) — chip GP: ขยายอีกนิด + ตัว active เป็นพื้นทึบสีประจำโหมด

*   **ขนาด (รอบ 2 ตาม feedback):** ยอด 13→**14px**, % 9→**9.5px**, padding `6px 14px`→`7px 16px`; ≤480px ยอด 13px / % 9px / padding `4px 10px`
*   **สี active ใหม่ (user ขอให้ต่างจากเดิม):** เดิมพื้นขาวตัวสี → เป็น**พื้นทึบตัวหนังสือขาว**: -30% เขียว LINE MAN `#00B14F` (สีแบรนด์จาก tailwind config), -0% rose `#e11d48`, -35% amber `#d97706` + เงาสีตามโหมด; ใช้ทั้ง light/dark (กติกา `[data-rate]` อยู่หลัง `.dark` ชนะทั้งสองธีม)
*   **ทดสอบ:** chromium headless — ฟอนต์/สี active ทั้ง 3 โหมด + dark mode ตรงสเปก, overflow 0 ทุกจอ 1280–360px; **กับดักเทสต์:** `.gp-seg` มี `transition: all .15s` → getComputedStyle ทันทีหลังใส่คลาสได้ค่าต้นทาง ต้องปิด transition ใน harness ก่อนวัดสี

*   **ขยายตาม feedback ของ user:** ยอดคงเหลือ 12→**13px**, ป้าย % 8.5→**9px**, padding chip `4px 12px`→`6px 14px`; จอ ≤480px ยอด 11→**12px**, % 8→**8.5px**, padding `2px 8px`→`3px 9px`; ≤379px พฤติกรรมเดิม (ซ่อนยอด คืน % ปกติ)
*   **ทดสอบ chromium headless ซ้ำ:** 1280/519/480/414/375/360px overflow 0 ทุกจอ (headerH โต ~7px ตามที่ตั้งใจ), ฟอนต์จริงตรงสเปก

## 📅 30 กรกฎาคม 2026 (2) — chip GP: ยอดเงินเป็นตัวเด่น % เป็นป้ายเล็ก

*   **สลับลำดับความสำคัญใน chip (user เลือกแบบ B):** เมื่อมี Gross ป้าย `%` หดเป็นตัวเล็กบน (8.5px) ยอดคงเหลือเป็นตัวหนาเด่น (12px) — ห่อป้าย % ด้วย `span.gp-seg-rate` ทั้ง 6 ปุ่ม (add+edit), JS ติดคลาส `gp-seg-has-amt` ใน `updateGpSegAmounts()` เมื่อ Gross > 0; Gross 0 = ถอดคลาส chip กลับทรง % ปกติ; padding chip ขยับ `3px 10px`→`4px 12px`
*   **จอแคบ:** ≤480px ยอด 11px / % 8px; ≤379px ซ่อนยอด + คืน % ขนาดปกติ — **กับดัก:** บล็อกคืนค่า 379px ต้องอยู่**หลัง**บล็อก 480px ในไฟล์ ไม่งั้นโดน cascade ทับ (specificity เท่ากัน ตัวหลังชนะ)
*   **ทดสอบ:** jsdom (ยอด/คลาส/label ทุก scope + Gross 0) ผ่านครบ; layout chromium headless (playwright-core + cache ms-playwright, force เปิด `#recordModal` ไม่ต้อง login) — 1280/519/480/414/375/360px overflow 0 ทุกจอ, ฟอนต์จริงตรงสเปก, 375px ยอดซ่อน+% คืน 10px

*   **chip GP ในหัวข้อการชำระเงิน (add+edit modal):** บรรทัดเล็กใต้ `-0% / -30% / -35%` เปลี่ยนจากยอดที่โดนหัก (`-฿45.50`) เป็น**ยอดคงเหลือหลังหัก** (`฿84.50`) — user เลือกแบบ A "โชว์ยอดคงเหลืออย่างเดียว" ให้ตรง mental model "กดตัวเลือกไหน ได้เงินเท่าไร" และสอดคล้องบรรทัด "→ รับจริง" รายชิ้น; chip `-0%` ได้อานิสงส์โชว์ยอดเต็ม (เดิม `฿0.00` ไม่มีประโยชน์); แก้จุดเดียวใน `updateGpSegAmounts()`
*   **ทดสอบ jsdom (โหลดไฟล์จริง):** Gross 130 → ฿130.00/฿91.00/฿84.50 ทั้ง scope edit, Gross 1250 → ฿1,250.00/฿875.00/฿812.50 scope add (เช็ก comma), Gross 0 → ซ่อนบรรทัดยอด — ผ่านครบ; ไฟล์ inline ไม่ต้อง bump `?v=`

## 📅 22 กรกฎาคม 2026 (4) — Master modal: ปุ่มบันทึก+X ขึ้นหัว ตัดแถบล่าง + กันปิดทับงานแก้ค้าง

*   **หัว modal (user เลือกแบบ 2):** ปุ่ม "💾 บันทึก" (น้ำเงิน มีป้าย) + ปุ่ม X (`aria-label="ปิด"`) มุมขวาบน ข้าง "รวมซ้ำ"; **ตัดแถบล่าง (บันทึก/ปิด) ทิ้งทั้งแถบ** → modal สั้นลง และหัวอยู่นอกส่วน scroll กดได้ตลอดไม่ต้องเลื่อนลงล่าง
*   **กันปิดทับงานแก้ค้าง (user เลือกให้ถาม):** `masterFormSnapshot()` เก็บ JSON ค่าฟอร์มทั้งหมด (ชื่อ/alias/แถวเจ้า(ชื่อ,ทุน,⭐)/ราคา 4 ช่อง/หน่วย/codes) ตอน `openMasterEdit` จบ → `closeMasterModal()` เทียบก่อนปิด ถ้าต่าง = Swal ถาม "ปิดเลย / กลับไปแก้ต่อ"; บันทึกสำเร็จ = ล้าง snapshot ไม่ถาม; **ปุ่ม "รวมซ้ำ" ผ่าน dirty-check เดียวกัน** (`openMergeFromMaster` await `closeMasterModal()` ก่อนเปิด mergeModal)
*   **จอแคบ (<sm):** ซ่อน "(Master)" + ตัวหนังสือ "รวมซ้ำ" (เหลือไอคอน) + หัว `text-base` → ชื่อ "จัดการสินค้า" แสดงเต็ม ไม่ล้น
*   **ทดสอบ Playwright:** ไม่แก้ = X ปิดทันทีไม่ถาม; แก้แล้ว X = ถาม (ยกเลิก→เปิดต่อค่าอยู่ครบ, ยืนยัน→ปิด); รวมซ้ำตอน dirty = ถาม (ยกเลิก→mergeModal ไม่เปิด, ยืนยัน→เปิด); 375px overflow 0 + ชื่อไม่ถูกตัด; ไม่มี pageerror

## 📅 22 กรกฎาคม 2026 (3) — ช่องชื่อเจ้าใน Master modal: dropdown ค้นหาเอง แทน datalist

*   **ปัญหา (user รายงาน):** พิมพ์ "YA" ไม่เจอ YAPAIBOON ต้องพิมพ์ "ยาไพ" — datalist ให้เบราว์เซอร์ match เอง กติกาต่างกันตามเครื่อง/มือถือ ควบคุมไม่ได้ และไม่ match aliases ในทะเบียน
*   **แก้:** ถอด `<datalist id="m-supplier-datalist">` เปลี่ยนเป็น dropdown singleton `#supplier-suggest` (body-level, `z-[150]` สูงกว่า masterModal 140) — match กับ **โค้ด / ชื่อเต็ม / aliases / aliasKeys** จากทะเบียน `suppliers` (normalize ด้วย `supplierKeyOf` เดิม): พิมพ์ YA, ยาไพ, YPB, ya เจอ YAPAIBOON หมด; เรียง prefix-match ก่อน → ความถี่ใช้จริง; focus เปล่า = เจ้าที่ใช้บ่อย 8 ตัวแรก; เจ้านอกทะเบียนยังโชว์ป้าย "ยังไม่มีในทะเบียนเจ้า" เหมือนเดิม
*   **การใช้งาน:** คลิก/แตะเลือก (pointerdown ก่อน blur), คีย์บอร์ด ↑↓ + Enter + Escape, เลื่อน scroll = ปิด (กันตำแหน่งเพี้ยน), เลือกแล้วใส่**โค้ด**ลงช่องเหมือน datalist เดิม — รูปแบบข้อมูลที่บันทึกไม่เปลี่ยน
*   **`buildSupplierDatalist()` ชื่อเดิม แต่เปลี่ยนหน้าที่:** สร้าง `supplierSuggestItems[]` (code/label/keys/freq) แทนการเขียน `<option>`
*   **ทดสอบ Playwright:** stub ทะเบียน 4 เจ้า → ค้น YA/ยาไพ/YPB/ya, คลิกเลือก, ↑↓+Enter, Escape, พิมพ์ไม่ match = ซ่อน — ผ่านครบ ไม่มี pageerror

## 📅 22 กรกฎาคม 2026 (2) — Master modal เป็น 2 คอลัมน์: ฟอร์มซ้าย / กำไร sticky ขวา

*   **จอ ≥768px (md):** card `max-w-xl`→`md:max-w-3xl`; scroll container เป็น `md:grid md:grid-cols-[minmax(0,1fr)_320px]` แบ่ง 3 ก้อน — ฟอร์มบน (ชื่อ→แปะ) col1, กล่องคาดการณ์กำไร col2 `row-span-2` + `md:sticky md:top-0` (ลอยติดบนขณะเลื่อนฟอร์ม), ฟอร์มล่าง (หน่วย+codes) col1
*   **มือถือ (<md):** DOM เรียงเดิมเป๊ะ (แปะ → กำไร → หน่วย) ไม่กระทบการใช้งาน
*   **ตารางช่องทางผอมลงให้พอดีคอลัมน์ 320px:** ตัดคอลัมน์ "ราคา" (ซ้ำกับช่องกรอกด้านบน — ตาม gp-calc ที่มีแค่ รับจริง/กำไร/%) + label สั้นลง `LINE MAN (GP 35%)`→`GP 35%` ชุดเดียวกับการ์ดสรุป
*   **ทดสอบ Playwright:** เดสก์ท็อป 1280px กล่องกำไรอยู่ขวา+sticky จริง (เลื่อน 300px ตำแหน่งไม่ขยับ), overflow=0 ทั้งกล่อง/ตาราง; มือถือ 375px ลำดับเดิม overflow=0; ไม่มี pageerror

## 📅 22 กรกฎาคม 2026 — Master modal โชว์กำไรแบบ GP-Calc + ลิงก์ส่งค่าไป gp-calc

*   **การ์ดสรุปกำไร 4 ใบ (แบบ gp-calc):** เพิ่ม `#m-profit-cards` ใน `m-profit-body` เหนือตารางเทียบช่องทาง — NO FEE / GP 30% / GP 35% / หน้าร้าน (ราคาปลีก) โชว์กำไร + % margin ตัวเลขใหญ่; ช่องทางที่ยังไม่กรอกราคา = ขีด; render ต่อท้ายใน `updateMasterProfit()` ใช้ทุนหลัก `getPrimaryCost()` + ค่าคงที่ `GP_RATE/GP_RATE_ALT` เดิม (ไม่แตะการคำนวณ/บันทึกข้อมูลใด ๆ)
*   **ปุ่ม "🧮 GP-Calc ↗" หัวกล่องคาดการณ์กำไร:** ฟังก์ชันใหม่ `openGpCalc()` เปิด `gp-calc.html?cost=<ทุนหลัก>&sell=<ราคา LINE MAN>&store=<ราคาปลีก>` แท็บใหม่ (`noopener`) — ใส่เฉพาะ param ที่มีค่า > 0
*   **gp-calc.html รับค่าจาก URL:** อ่าน `?cost=&sell=&store=` ตอนโหลด (ก่อน `render()` แรก) เติมช่องแล้วคำนวณทันที; ไม่มี param = ว่างเหมือนเดิม
*   **ทดสอบ Playwright headless ผ่านครบ:** ตัวเลขการ์ดใน modal ตรงกับ gp-calc ทุกใบ (ทุน 140 / TELE 450 / ปลีก 350 → +310/+175/+152.50/+210), URL จากปุ่มถูกต้อง, ไม่กรอกปลีก → การ์ดหน้าร้านเป็นขีด, จอ 375px ไม่ overflow, ไม่มี pageerror; ไฟล์ inline ทั้งคู่ไม่ต้อง bump `?v=`

## 📅 14 กรกฎาคม 2026 — LINE MAN Master modal: ทุนหลายเจ้า + popup กว้างขึ้น

*   **Popup กว้างขึ้น:** `masterModal` card `max-w-md`→`max-w-xl` (มือถือยังเต็มจอ)
*   **ราคาทุนหลายเจ้า (แทนช่องทุนเดี่ยว):** แถว dynamic `[⭐ radio][ชื่อบริษัท+datalist][ทุน][🗑]` + ปุ่ม "เพิ่มเจ้า"; **⭐ = ทุนหลัก** ที่ใช้คำนวณกำไร + autofill บิล (ผู้ใช้เลือกเอง — decision "เจ้าที่ mark ไว้"); ลบเจ้า⭐ → ⭐ ย้ายแถวอื่นอัตโนมัติ, เหลือขั้นต่ำ 1 แถว
*   **link บ. ที่ซื้อบ่อย = datalist เรียนรู้เอง** (decision): รวม `suppliers[].name` จากทุกสินค้า → `<datalist>` เรียงตามความถี่ (ซื้อบ่อยขึ้นก่อน) ไม่ต้องสร้าง collection ใหม่
*   **Data model:** เพิ่ม `suppliers: [{name, cost, primary}]` ใน `master_products`; **คง `prices.COST` = ทุนของเจ้า ⭐** (autofill/กำไรทั่วแอปที่อ่าน `prices.COST` 6+ จุดทำงานต่อไม่ regress) + `companyProductId` เดิมไม่แตะ
*   **Functions ใหม่:** `supplierRowHtml/addSupplierRow/removeSupplierRow/ensurePrimarySupplier/renderSupplierRows/collectSuppliers/getPrimaryCost/buildSupplierDatalist`; `updateMasterProfit` + `saveMasterEdit` อ่านทุนจาก `getPrimaryCost()` แทน `#m-cost` (ลบ element เดิม)
*   **Backward compat:** สินค้าเก่าที่มีแค่ `prices.COST` → auto สร้าง 1 แถว (cost เดิม, ⭐) ตอนเปิด modal
*   **ทดสอบ browser จริง (local server) ผ่าน:** โหลด 2 เจ้า+⭐, เปลี่ยน⭐→กำไรคำนวณใหม่, เพิ่ม/ลบ+⭐ย้ายเอง, datalist เรียงความถี่, backward-compat, ไม่มี console error. **ยังไม่เทสต์ save จริง Firestore** (ต้อง login admin — ผู้ใช้ verify); inline ไม่ต้อง bump `?v=`

## 🗺️ ROADMAP (ยังไม่เริ่ม) — App Check + Full Strict Schema

> วางแผนไว้ 14 ก.ค. 2026 ยังไม่ลงมือ. บริบทที่สำรวจแล้ว: **15 หน้า init Firebase ทุกหน้าใช้ compat SDK v9.6.1 + แชร์ `firebase-config.js` ร่วมกัน** (init App Check เขียนที่เดียวใช้ได้ทั้งหมด แต่ต้องเพิ่ม `<script>` app-check ราย 15 หน้า); 1 หน้าใช้ Storage; deploy rules ลงแค่ `(default)` (named DB deny-all แล้ว)

### 🛡️ Track A — App Check (reCAPTCHA v3)
เป้า: กัน REST abuse จริง (referrer ปลอมได้). ความเสี่ยง: **enforce ก่อน client พร้อม = พังทั้งแอป** → ต้อง monitor ก่อน
*   **A0 Prep:** สมัคร reCAPTCHA v3 site key + register app ใน App Check console + debug token localhost
*   **A1 ติดตั้ง (monitor mode):** เพิ่ม `firebase-app-check-compat.js` 15 หน้า + init ใน `firebase-config.js` (`activate(siteKey, true)`) — ยังไม่ enforce [แตะ 15 ไฟล์ ต้องครบ]
*   **A2 Monitor:** ดู metrics หลายวัน ว่า % verified สูง (รวม LINE LIFF ใน in-app browser); จุดไหน token ไม่มา แก้ให้ครบ
*   **A3 Enforce Firestore:** เปิด enforcement เฉพาะ Firestore ก่อน (เสี่ยงสูง พร้อม rollback)
*   **A4 Enforce Auth (+Storage):** ทีละตัว, ทดสอบ Google popup + LIFF login ให้ครบ

### 📋 Track B — Full Strict Schema (ทุก collection) — ระดับ **Lenient-strict**
เป้า: field/type/size validation. **ตัดสินใจ: ใช้ required+type+size cap ไม่ใช้ `hasOnly()`** (กันของผิดได้โดยเสี่ยง regress ต่ำ; ยอมให้มี field เกินได้). collection JSON ก้อนใหญ่ (`cknc_sessions`, `*_backups`, `sales_analytics`, `tmtp_records`) ทำได้แค่ size cap + required key ไม่กี่ตัว
*   **หลักการต่อ collection:** map ทุกจุด client เขียน → validation fn → เทสต์ Playground (allow ถูก + deny ผิด) + smoke test แอปจริง → deploy `(default)`
*   **B1 Pilot:** 1 ตัวง่าย admin-write (`faqs` หรือ `ecom_access_codes`) ตั้ง pattern
*   **B2 สาธารณะ (ค่าสูงสุด):** VCI `visitor_registrations`/`visitor_logs`/`visitor_appointments` (`create: if true` = ใครก็เขียน) — map ฟอร์ม VCI ให้ครบ
*   **B3 Admin data:** `master_products`, `settings`, `system`, `companies`
*   **B4 ยากสุด (ท้าย):** `tasks` (polymorphic order/health/history), ปิดงาน `users`, + big-JSON แบบ size-cap

### ลำดับที่แนะนำ
A0→A1→A2 ก่อน (monitor passive เสี่ยงต่ำ) → ทำ B1→B2 ขนานระหว่างรอ metrics → A3/A4 enforce เมื่อพร้อม → B3→B4 ปิดท้าย

---

## 📅 14 กรกฎาคม 2026 — Security: Schema validation ใน rules (phase ถัดไป — safe hardening)

### 🔒 สิ่งที่ทำ (deploy rules-only แล้ว ✅ compiled+released)
*   **ปิดช่องโหว่ privilege-escalation ใน `users` (ของจริงที่เจอ):** เดิม `allow read, write: if isOwner || isAdmin` → user ที่ล็อกอินยิง SDK/REST เขียน doc **ตัวเอง** ตั้ง `role:'admin'` หรือ `access.analytics:true` / `status:'approved'` = ยกสิทธิ์ตัวเองได้ (isAdmin เช็ค `role=='admin'`, hasAreaAccess เช็ค `access[area]`). แก้เป็นแยก read/create/update/delete + helper `safeSelfUserCreate` (ห้าม seed role/access, status ต้องเป็น 'pending') และ `safeSelfUserUpdate` (`diff().affectedKeys().hasAny(['role','access','status'])` = ห้ามแตะ 3 ฟิลด์นี้). ตรวจครบ 4 เส้นทางลงทะเบียนเอง (index.html:396, admin.html:430, history.html:1273) — เขียนแค่ displayName/phone/pictureUrl/status:'pending' ไม่พัง; admin grant (admin.html:796/803) ยังทำงานผ่าน branch `isAdmin()`
*   **`createdAt` immutable บน task update:** `!...affectedKeys().hasAny(['createdAt'])` กันแก้ย้อนวันที่; ตรวจแล้วไม่มี client path ไหนเขียนทับ createdAt ตอน update (มีแต่ create/import ที่ตั้งค่า)

### ⚠️ สิ่งที่ **ไม่ทำ** เพราะไม่ตรงกับ data model จริง (แก้ note ของ Codex)
*   Codex แนะ `createdBy/updatedBy == request.auth.uid` — **ใช้ไม่ได้กับแอปนี้ จะ reject ทุก write:** `createdBy` เก็บ **ชื่อ display** ไม่ใช่ uid (index.html:411) + user ที่ล็อกอินผ่าน LINE LIFF ไม่ได้เป็น Firebase-auth เลย (request.auth = null/anonymous) ทำให้ owner-check เดิมใน tasks rules ก็จับ uid ไม่ตรงอยู่แล้ว
*   immutable-`createdBy` = ไม่ปลอดภัย (admin แก้ record คนอื่นเขียนทับ createdBy จริง — history.html:1410)
*   `createdAt==serverTimestamp` ตอน create = ไม่ปลอดภัย (Excel import เขียนวันที่ย้อนหลัง — history.html:1900)
*   Full strict schema (hasOnly allow-list ทุก collection) = เลื่อนไว้ (เสี่ยง permission-denied ทั้งแอปถ้า map field ผิด, docs เขียนจาก 16 หน้า inline)

### 🔑 Firebase API key — rotate + restrict เสร็จแล้ว (14 ก.ค. 2026)
*   **เข้าใจใหม่:** apiKey ของ Firebase Web เป็น public by design (ฝังใน client JS) ไม่ใช่ความลับ — rotate อย่างเดียวไม่ช่วย เพราะคีย์ใหม่ก็ public; ตัวป้องกันจริง = **restrict** (HTTP referrer + API list) + Firestore rules + App Check
*   **สถานะจริงใน Cloud Console (จากภาพผู้ใช้):** rotate ทำไปแล้ว — `20260218-New Browser key` (สร้าง 18 ก.พ.) restrict ครบ (Websites: `mlpditto.github.io/*`, `firebaseapp.com`, `web.app`, `localhost/*` + API list 24) และ **config ใช้คีย์ใหม่นี้อยู่แล้ว** (ยืนยันค่า `AIzaSyCSeIW…` ตรงกับ Show key)
*   แก้คอมเมนต์ล้าสมัยใน `firebase-config.js` (เดิม "โปรดเปลี่ยน API Key" → note ที่ถูกต้อง)
*   **เหลือ (optional):** ลบคีย์เก่า `Browser key (auto created by Firebase)` (28 ม.ค. = ตัวที่รั่ว, unused แล้ว) — ทดสอบ prod หลังลบ; ถ้ากังวล auto-recreate ปล่อยไว้ได้ (restricted แล้ว)

### ✅ Verify production ผ่านแล้ว (14 ก.ค. 2026, Rules Playground บน `(default)`)
*   `update /users/<uid non-admin>` + `{role:'admin'}` → **บล็อก** (write ไม่ผ่าน) 🔒; `{phone:'...'}` → **allowed** (แก้โปรไฟล์ยังได้ ไม่ regress)
*   **เจอ 2 เรื่องระหว่าง verify:**
    *   **มี Firestore database 2 ตัว** — `(default)` (แอปใช้จริง + rules hardened อยู่ตัวนี้) กับ named `fkb-front-kanban` (ว่างเปล่า ไม่มีโค้ดไหนใช้ แต่ rules เดิม `allow read,write: if true` เปิดโล่ง) → **ล็อก deny-all แล้ว**. ระวัง: `firebase deploy --only firestore:rules` ลงเฉพาะ `(default)` — named DB ต้องแก้ rules แยกใน Console. ดู [[fkb-firestore-databases]]
    *   **`isAdmin()` throw error เมื่อ user doc ไม่มีฟิลด์ `role`** (playground โชว์ "Property role is undefined") — **แก้แล้ว** (commit `0a23fbb`): `isAdmin` ใช้ `data.get('role','')`, `hasAreaAccess` ใช้ `data.get('access',{}).get(area,false)` → field หาย = deny สะอาดแทน error; พฤติกรรมทุกเคส valid เหมือนเดิม (admin ยังเป็น admin). **หมายเหตุ:** ยังเหลือเคส user doc ไม่มีอยู่เลย (`get()` = null) จะยัง error — แต่ user ที่ register แล้วมี doc เสมอ = edge หายาก

### 📋 ค้าง / verify
*   tasks owner-check ยังจับ uid ไม่ตรง (createdBy=ชื่อ, LINE≠firebase-auth) — เป็นของเดิม ไม่ได้แตะรอบนี้ (ผลจริง = เฉพาะ admin แก้ tasks ได้ผ่าน rules)
*   **App Check (reCAPTCHA)** = ตัวกัน REST abuse จริง (referrer ปลอมได้) — งานใหญ่ เฟสถัดไป

## 📅 14 กรกฎาคม 2026 — Security: ปิดช่องโหว่ Firestore rules `if true` (Sales Analytics + TMTP)

### 🔒 ต้นเหตุ
`firestore.rules` มี 3 collection เปิดโล่ง `allow read, write: if true` — `sales_analytics`, `tmtp_records`, `tmtp_backups` — ใครมี API key (ซึ่งคอมเมนต์ใน `firebase-config.js` บอกว่าเคยรั่ว) ยิงตรงเข้า DB อ่าน/เขียน/ลบทั้ง collection ได้ผ่าน REST โดยไม่ต้องเปิดเว็บ; สาเหตุ = 2 หน้านี้เดิม **ไม่มีระบบ login เลย** (2 ใน 21 หน้าที่ไม่มี `signIn`/`onAuthStateChanged`)

### Option A — anonymous stop-gap (commit `6fe6c73`)
*   **rules:** `sales_analytics`/`tmtp_records` → `isAuthenticated()`; `tmtp_backups` → append-only (`create: isAuthenticated`, `read/update/delete: isAdmin`)
*   **client (2 หน้า):** เพิ่ม `authReady` — `onAuthStateChanged` รอ restore session เดิมก่อน แล้วค่อย `signInAnonymously()` เฉพาะเมื่อไม่มี user (กัน downgrade admin/Google session เป็น anonymous — เดิมเช็ค `currentUser` แบบ sync ซึ่ง null ตอนโหลดเสมอ); ทุก Firestore op `await authReady`
*   **Codex adversarial-review จับได้ 1 บั๊ก:** `updatedBy: 'System'` ใน `syncProcessedToCloud` เพราะ batch ถูกสร้างก่อน authReady resolve → ย้าย `await authReady` ไปก่อนสร้าง batch (currentUser ถูก restore ก่อนอ่าน) — สองผู้ตรวจ (Codex + Claude) สรุปตรงกันว่า anonymous = identity ไม่ใช่ authorization barrier
*   ทดสอบ local + production ผ่าน: signed-in อ่านได้, ไม่มี token = `permission-denied`

### Option B — auth gate จริง (commit `2826992`) ✅ ใช้จริง
*   **rules:** `sales_analytics` → `isAdmin() || hasAreaAccess('analytics')`; `tmtp_records` → `isAdmin() || hasAreaAccess('tmtp')`; `tmtp_backups` create เช่นเดียวกัน (read/update/delete ยัง admin)
*   **client (2 หน้า):** overlay gate เต็มจอ 3 สถานะ (loading/login/denied) — `authReady` resolve เฉพาะเมื่อ login + เป็น admin หรือมี `access[area]`; login ด้วย Google popup แทน anonymous; area key `analytics`/`tmtp` มีอยู่แล้วใน `PERMISSION_AREAS` ของ admin.html (ต่อสายที่ค้างไว้แต่แรก — admin ติ๊กสิทธิ์ให้ user รายคนได้โดยไม่ต้องแก้โค้ด)
*   **ทดสอบ:** local (gate บล็อก, authReady ค้างเมื่อไม่มีสิทธิ์) + production (signed-out=login gate, anonymous=`permission-denied` + client denied, admin login=เข้าใช้งานได้ — ผู้ใช้ verify ทางผ่านแล้ว)
*   deploy ลำดับ hosting→rules (กันหน้า cache เก่าเจอ rules ใหม่); ไม่ต้อง bump `?v=` (2 หน้านี้เป็น HTML เดี่ยว inline เหมือน lineman-mgr)

### 📋 ค้าง (phase ถัดไป)
*   **Schema validation ใน rules** (field/type/size/immutable, `createdBy/updatedBy == request.auth.uid`) ตามที่ Codex แนะนำ — เลื่อนออกจากรอบนี้ ยังไม่ทำ
*   ควร rotate Firebase API key ที่คอมเมนต์บอกว่าเคยรั่ว

## 📅 13 กรกฎาคม 2026 — LINE MAN เพิ่มช่องกรอกต้นทุนรายชิ้นในรายการสินค้า

### 🧹 ลดรายการซ้ำใน MASTER (แบ่ง Phase)
*   **Phase 1 — Dedup datalist (autocomplete รายการสินค้า):** เดิม `updateDatalist` dump ทุก alias ต่อสินค้า (`id`/`name`/`canonicalName` มักซ้ำกันเป๊ะ) → ดรอปดาวน์มีบรรทัดซ้ำ 2-3 ตัวต่อสินค้าเดียว; แก้เป็นโชว์ **1 option ต่อสินค้า 1 ตัว** (ชื่อหลัก `canonicalName||name||id`) + dedup ด้วย `normalizeMasterKey`; alias ยังใช้จับคู่ใน `findMasterProductByName` ตามเดิม (commit 8f6b13d)
*   **Phase 3 — เครื่องมือรวมสินค้าซ้ำ (ปุ่ม "รวมซ้ำ" ในแถบเครื่องมือ):** modal ระดับ body (z-[135]) `openMergeModal` → `scanDuplicateMasters` จับกลุ่ม `master_products` ด้วยรหัส `[NNNN]` (ไม่มีรหัสใช้ normalize ชื่อ) โชว์เฉพาะกลุ่ม ≥2 ตัว; แต่ละกลุ่มมี **radio เลือกอิสระ 3 อย่าง**: ตัวหลักที่เก็บ / ใช้ทุนของตัวไหน / ใช้ราคาของตัวไหน (default อัจฉริยะ: ตัวหลัก=ข้อมูลครบสุด, ทุน=ตัวที่มีทุน, ราคา=ตัวที่มีราคา → รวม "ของดีจากทั้งคู่") + คอลัมน์จำนวนบิลอ้างอิงในเดือนที่โหลด; กด "รวมกลุ่มนี้" → Swal ยืนยันโชว์ชื่อหลัก/ทุน/ราคา/รายการที่จะลบ → เขียน survivor (`cost`+`prices.COST`+`prices.LINEMAN` + union ทุกชื่อเป็น `aliases` ให้บิลเก่ายังหาเจอ) แล้ว **ลบ doc ตัวซ้ำจริง** → re-sync + re-scan (กลุ่มหายไปเอง); ยืนยันทีละกลุ่ม ไม่มี auto-merge. Mock-test ครบ: scan/สรุปกลุ่ม/default/merge (รวมทุน 20 + ราคา 39 จากคนละตัว) + ลบเฉพาะตัวซ้ำ + กลุ่มหายหลังรวม. **ทดสอบ delete จริงบน Firestore ต้อง login (รันโดยผู้ใช้)** — logic ทั้งหมดผ่าน mock แล้ว
*   **Phase 3 safety — backup JSON อัตโนมัติก่อนลบ:** เพิ่ม `downloadJSON`/`tsStamp`; ก่อน merge จะแตะ Firestore ทุกครั้ง ระบบดาวน์โหลด `master-merge-backup-<ts>.json` อัตโนมัติ (เก็บข้อมูลเต็มทุก doc ในกลุ่ม + survivorId + deletedIds → กู้คืนได้ถ้าพลาด) + ปุ่ม "สำรองทั้งหมด" ในหัวโมดัล (`backupMasterAll` → `master-backup-<ts>.json`) + บรรทัดเตือนในกล่องยืนยันว่าจะ backup ให้ก่อน; ทดสอบ: full backup + auto backup ยิงก่อน delete (opsOrder = set→delete), JSON มี docs ครบ 2 + deletedIds ถูก
*   **Phase 2+4 — จับคู่ด้วยรหัส [NNNN] + กันสร้าง doc ซ้ำตอน upsert:** เพิ่ม `masterCodeOf` (ดึง SKU `[NNNN]`) และให้ `findMasterProductByName` fallback จับคู่ด้วยรหัสเมื่อ normalize ตรงเป๊ะไม่เจอ → variant คนละ suffix ("...10s" vs "...10s 10x1") ที่รหัสเดียวกันถือเป็นสินค้าเดียว; รวม upsert 2 จุด (บันทึกใหม่/แก้ไข) เป็น helper เดียว `upsertMasterLinemanPrice` — เจอของเดิมเขียนลง doc เดิม + เรียนรู้ชื่อที่พิมพ์เป็น `linemanAlias`, ไม่เจอค่อยสร้าง doc ใหม่ (docId trim + กัน `/`); mock-test 4 เคส: exact/variant(รหัสเดียวกัน→doc เดิม+learn alias)/สินค้าใหม่(รหัสใหม่→doc ใหม่)/ชื่อมี slash. **หมายเหตุ:** code matching มีผลกับ cost/price autofill ทั้งแอป (ตั้งใจให้รวมตามรหัส) — เหลือ Phase 3 (เครื่องมือรวม doc ซ้ำที่มีอยู่แล้ว: preview+เลือกค่าทุน/ราคาเอง+ยืนยันทีละคู่+ลบจริง)

### 🐛 แก้บั๊ก
*   **ปุ่ม ⓘ ในตารางประวัติกดแล้ว popup MASTER ไม่โผล่ (โผล่ซ้อนหลัง editModal):** ต้นเหตุ — `masterModal` ถูกวางไว้ **ข้างใน `editModal`** ใน DOM; ตอน editModal ปิดอยู่มันเป็น `display:none` ลูกจึง render ไม่ได้ (ถอด `.hidden` ก็ไม่โผล่) พอเปิด editModal ทีหลัง masterModal ที่ค้างไว้เลยโผล่ตามแถมอยู่ต่ำกว่า (z-60 < editModal 130) เห็นเป็นซ้อนหลัง; **แก้:** ย้าย `masterModal` ออกมาเป็น sibling ระดับ `<body>` + ยก z-index `z-[60]`→`z-[140]` (สูงกว่า editModal ที่มี CSS override `z-index:130 !important`) เพื่อเปิดซ้อนตอนแก้บิลได้ด้วย (ปุ่ม ⓘ ข้างชื่อสินค้าในฟอร์มแก้ไขก็เรียก modal นี้); ทดสอบ local: กดจากตารางประวัติโผล่แล้ว + เปิดซ้อนตอนแก้บิล master อยู่บนสุด + editModal ยังครบ

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข
*   **LINE MAN Sales Recorder (lineman-mgr.html) — คอลัมน์ "ทุน/ชิ้น" ในตารางรายการสินค้า (แนวทาง A):** เพิ่มช่องกรอกต้นทุนต่อชิ้นรายรายการ (โทน rose ให้เข้าชุดกับช่อง COST ระดับบิล) วางระหว่างคอลัมน์ *จำนวน* กับ *ราคา* ทั้งฟอร์มเพิ่มและแก้ไข
    *   **Auto-fill จาก MASTER แต่แก้ทับได้:** เลือกสินค้า/พิมพ์ชื่อแล้วเติมทุนจาก MASTER ให้อัตโนมัติ (เหมือนเดิม) แต่พอผู้ใช้พิมพ์ทุนเอง จะติดธง `data-user-edited` กัน auto-fill มาเขียนทับ — แก้ปัญหาเดิมที่ทุนมาจาก MASTER อย่างเดียว สินค้าที่ไม่มีใน MASTER หรือทุน MASTER ผิดจะแก้รายบิลไม่ได้เลย
    *   **ช่อง "ต้นทุน (COST)" ระดับบิล = ผลรวมทุน×จำนวนทุกแถว** (เดิม `calculateTotalFromItems` lookup MASTER มารวมอย่างเดียว → ตอนนี้อ่านจากช่องในแถวเป็นหลัก, ว่าง+ยังไม่แก้เอง จึง fallback ไป MASTER); เก็บทุนลง item ตอนบันทึกทั้งบิลใหม่/แก้ไข/draft → `{name, qty, price, cost}`; แถวเก่าที่ยังไม่มี cost ยัง auto-fill จาก MASTER ให้เหมือนเดิม (ไม่ regress)
    *   **โบนัส:** บรรทัดเล็กใต้ช่องราคา (updateItemNetHints) เพิ่ม "กำไร/ชิ้น" ต่อจาก "→ รับจริง" เช่น `→ รับจริง ฿77.00 · กำไร ฿0.00` (กำไร = รับจริงหลังหัก GP − ทุน)
    *   **Refactor:** เปลี่ยน selector รายแถวทั้งหมดจาก `td:nth-child(n)` เป็น class (`.item-name` `.item-qty` `.item-cost` `.item-price`) ทั้ง 8 จุด — เดิมเลื่อนคอลัมน์ทีเป็นพังทันที
    *   ทดสอบบน local server ผ่านทุกเคส (5 คอลัมน์, gross/orderCost ถูกต้อง, แก้ทุนเอง+ล้างช่องแล้วไม่ autofill ทับ, กำไร/ชิ้น, ไม่มี console error, ตารางไม่ล้นแนวนอน); lineman-mgr.html ไม่ต้อง bump เวอร์ชัน (inline ทั้งหมด)

## 📅 8 กรกฎาคม 2026 — ช่วงที่บ้าน (CKNC คำวินิจฉัยรายบิล + ไทม์ไลน์ระยะห่างการมารับบริการ)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **บันทึกคำวินิจฉัย (Dx) รายบิล — 1 เลขที่ออเดอร์ = 1 Dx:** เก็บใน `override.values.diagnosis` (ไม่ใช่ `override.note` ซึ่งการแก้ inline เขียนทับเสมอ เช่น "แก้สถานะจากตาราง") จึงไหลเข้า session / autosave / export / merge เองผ่าน `applyBillOverride` โดยไม่ต้องแตะ payload; กรอกได้ 3 ทาง — ชิป `+ Dx` / `Dx: …` ใต้ชื่อในตาราง (กดเปิดไทม์ไลน์แล้วโฟกัสช่องของบิลนั้น), ช่อง "คำวินิจฉัยการมารับบริการครั้งนี้" ในหน้ารายละเอียด, และ Paste & Analyze (parser อ่าน `วินิจฉัย:` / `คำวินิจฉัย:` / `การวินิจฉัย:` / `อาการ:` / `Dx:` / `diagnosis:`)
    *   **นิยาม "การมาแต่ละครั้ง" ใหม่ด้วย union-find (`groupBillsIntoVisits`):** เลขที่ออเดอร์เดียวกัน **หรือ** วันเดียวกัน = การมาครั้งเดียว — ของเดิม `annotateCustomerVisits` นับจาก unique dates ล้วน ๆ ทำให้บิลที่วัน CKNC/MLP ไม่ตรงกัน (issue DMM) ถูกนับเป็นมา 2 ครั้ง; ทดสอบแล้ว: ลูกค้า 3 บิล โดย 2 ใบวันเดียวกันคนละเลขออเดอร์ → นับเป็น 2 ครั้ง ถูกต้อง
    *   **ป๊อปอัพไทม์ไลน์การมารับบริการ (`visitTimelineModal`):** กดป้าย "ครั้งที่ n/N" หรือ "ห่าง N วัน" เปิดดูทุกครั้งที่มาของลูกค้าคนนั้น เรียงตามวัน (พ.ศ.) พร้อมระยะห่างจากครั้งก่อน · ยาที่ได้ · ประเภทเคส · ช่อง Dx แก้ได้ในตัว (Enter/blur บันทึก ไม่ปิด popup) · ปุ่มเปิดหน้ารายละเอียด · ปุ่ม "ค้นหาทุกบิลของคนนี้ในตาราง" (พฤติกรรมเดิมของป้ายมาซ้ำ ย้ายมาไว้ที่นี่ เดิมกดป้ายแล้วแค่เติมคำค้น); การ์ด popup ต้องบังคับ `flex-column` เพราะ `.clipboard-card` เป็น grid 3 แถวตายตัว
    *   **เตือนมาซ้ำเร็ว + ยาซ้ำกับครั้งก่อน:** ชิป "ห่าง N วัน" ข้างป้ายมาซ้ำ เป็นสีเหลืองเมื่อเร็วกว่าเกณฑ์ (`repeatVisitWarnDays` ใน rule config, default 7 วัน, 0 = ปิด — ตั้งค่าได้ที่แผงเครื่องมือ); validation issue ใหม่ 2 ตัวไหลเข้าคอลัมน์ "ตรวจ" ที่มีอยู่โดยไม่ต้องแตะ pipeline — **RPT** `REPEAT_SOON` (มาซ้ำเร็ว, warn/เหลือง) และ **RSM** `REPEAT_SAME_MED` (ยาซ้ำครั้งก่อน, info/เทา — เทียบชื่อยาข้ามครั้งด้วย normalizeMedicineKey); มาซ้ำเร็ว + ยาตัวเดิม = สัญญาณเบิกซ้ำหรือรักษาไม่ได้ผล
    *   **Export เพิ่ม 4 คอลัมน์** (CSV + XLSX + billReportRow): `diagnosis`, `visit_index`, `visit_count`, `visit_gap_days` — bump v=20260710090000, commit `1310085`
    *   **Paste & Analyze อ่านคำวินิจฉัย + ประเภทเคส จากบรรทัด "ประเภท:" (พร้อมแก้บั๊กเก่า 2 ตัวที่ตัวอย่างจริงเผยออกมา):** ข้อความจริงคือ `[Ref-ID : R-...] รายการของ คุณ ธีรภัทร โอสุวรรณ` ขึ้นบรรทัดใหม่ `ประเภท: (สปสช โรคทั่วไป) Acute sinusitis ...`
        *   **บั๊กเก่า #1 — ประเภทเคสหายทั้งหมดเมื่อ "ประเภท:" อยู่คนละบรรทัด:** `nameMatch` ใช้ flag `/m` และ `.` ไม่ข้ามบรรทัด วงเล็บประเภทที่อยู่บรรทัดถัดไปจึงไม่เคยถูกอ่าน (paste แล้วประเภทยังเป็น "ไม่ทราบ" ทั้งที่ข้อความบอกชัด)
        *   **บั๊กเก่า #2 — ชื่อผู้รับบริการติดคำว่า "ประเภท:" มาด้วย** เมื่อข้อความอยู่บรรทัดเดียว (ชื่อหยุดที่วงเล็บเท่านั้น) → ตอนนี้ชื่อหยุดที่ `ประเภท` หรือ `(` หรือท้ายบรรทัด
        *   **กติกา Dx ใหม่:** Dx = ข้อความหลังวงเล็บบนบรรทัด `ประเภท:` (ตัดจุดไข่ปลาท้ายด้วย `trimDiagnosis`); หัวข้อชัดเจน `วินิจฉัย:` / `Dx:` / `อาการ:` ชนะเสมอถ้ามี; `ประเภท: สปสช โรคทั่วไป` (ไม่มีวงเล็บ) อ่านประเภทได้แต่ไม่ถูกเข้าใจผิดเป็น Dx
        *   **`caseTypeFromPasteText`:** ต้องตรวจ สปสช **ก่อน** general เพราะ `(สปสช โรคทั่วไป)` มีคำว่า "ทั่วไป" อยู่ด้วย เรียงผิดจะกลายเป็นเคสทั่วไปทันที
        *   ทดสอบ 8 รูปแบบ + end-to-end ผ่าน modal จริง (ติ๊ก 4 ช่อง → apply → ชิป `Dx: Acute sinusitis` ขึ้นในตาราง, caseType=nhso, billingStage คำนวณใหม่เป็น nhso-pending เอง); **เปลี่ยนพฤติกรรม:** ข้อความ 2 บรรทัดแบบนี้ ช่อง "ประเภทเคส" จะถูกติ๊กมาให้อัตโนมัติแล้ว (เพราะเพิ่งจับค่าได้) — bump v=20260710183000, commit `623d11e`
*   **AGENT-PLAYBOOK.md:**
    *   **§7 เปลี่ยนเกณฑ์ deploy จาก "ต้องพิมพ์ Go Online ทุกครั้ง" เป็นแยกตามความเสี่ยง:** deploy+commit+push ได้เลยเมื่อครบ 3 ข้อ (ผู้ใช้สั่งงานนั้นในเทิร์นนั้น + ทดสอบด้วยการรันจริงในเบราว์เซอร์ + ไม่แตะ data model/การคำนวณเงิน); ยังต้องเสนอแล้วรอไฟเขียวเมื่อแตะ `billOverrides` / การคำนวณกำไร-ยอดเบิก-`countsInRevenue` / session payload + เส้นทางกู้คืน / ลบ-รวมบิล — เพราะกลุ่มนี้พังแล้ว session ที่เซฟไว้เสียหายย้อนหลัง ไม่ใช่แค่หน้าจอเพี้ยน — commit `64737ee`

## 📅 7 กรกฎาคม 2026 (CKNC ตัดแท็บสถานะปัญหาที่ซ้ำ + LINE MAN เพิ่มตัวเลือก GP -35%)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข
*   **LINE MAN Sales Recorder (lineman-mgr.html):**
    *   **ปุ่ม ⓘ แก้ MASTER รายสินค้าจากตารางประวัติ + ถามอัปเดตต้นทุนบิลต่อ (แบบ B):** ทุกบรรทัดสินค้าในแถวประวัติมีปุ่ม ⓘ เปิด modal MASTER ของตัวนั้น (openMasterEditFromBill จำ uid บิลไว้ใน masterEditBillUid, เปิดจากฟอร์มปกติ = รีเซ็ต context) — หลังบันทึก MASTER สำเร็จ ถ้าเปิดมาจากบิลจะเด้งถาม "อัปเดตต้นทุนบิลนี้เลยไหม?" โชว์ทุนเก่า/ทุนจาก MASTER/กำไรใหม่ + รายชื่อตัวที่ยังไม่มีทุน (ไม่ถูกนับ) ก่อนยืนยัน กันเขียนทับเงียบ ๆ; ยืนยันแล้วคำนวณ cost บิลใหม่จาก master ทุกรายการ + เก็บทุนต่อชิ้นลง items แล้ว saveMonthRecords (realtime sync รีเฟรชกำไร/กรอบแดงปุ่มวันที่เอง); ครบวงจรกับกรอบแดง: เห็นวันแดง → กด ⓘ กรอกทุน → ตกลง → กำไรจริงขึ้นทันที; แสดง % กำไรทศนิยม 2 ตำแหน่งทั้ง 4 จุด (ฟอร์มเพิ่ม/แก้ไข/แถวตาราง/การ์ด dashboard)
    *   **แสดงราคารับจริงหลังหัก GP ใต้ช่องราคาแต่ละรายการ (แบบ A):** บรรทัดเล็กสีส้ม "→ รับจริง ฿39.00" (จำนวน >1 แสดง "×2 = ฿78.00") ใต้ช่องราคาในตารางสินค้า ทั้งฟอร์มเพิ่มและแก้ไข — คิดจากสัดส่วน NET ÷ GROSS ของทั้งบิล (updateItemNetHints เรียกท้าย calculateNet/calculateNetPopup) จึงถูกทุกโหมดอัตโนมัติ: 30% → ×0.70, -35% → ×0.65, MANUAL NET กระจายตามสัดส่วนจริง, NO FEE/ไม่มีการหัก → ซ่อน; อัปเดตสดเมื่อแก้ราคา/จำนวน/สลับโหมด
    *   **ปุ่มวันที่ในแถบเลือกวันขึ้นกรอบแดงเข้มเมื่อวันนั้นมีรายการกำไร 100%:** กำไร 100.0% = net > 0 แต่ต้นทุน 0 (ยังไม่ได้กรอกต้นทุน) — คำนวณ fullProfitDates จากข้อมูลทั้งเดือนตอน render date-pagination, ปุ่มวันที่เข้าเงื่อนไขได้ `border-2 border-red-800` (dark: red-500) + tooltip "มีรายการกำไร 100% (ต้นทุน 0 — ยังไม่กรอกต้นทุน)" ใช้ได้ทั้งปุ่ม active (พื้นเขียว) และปกติ — เห็นจากแถบเลยว่าวันไหนต้องไปตามกรอกต้นทุน
    *   **เพิ่มการ์ด tick box "-35%" ข้าง NO FEE (ทั้งฟอร์มเพิ่มและแก้ไข):** GP ทางเลือก 35% (`GP_RATE_ALT = 0.35`, ธง `isGp35` ใน record) — NET = GROSS × 0.65; NO FEE กับ -35% เลือกได้อย่างเดียว ติ๊กอันหนึ่งปลดอีกอันอัตโนมัติ (gpExclusive), MANUAL NET ยัง override ได้เหมือนเดิม; มีผลครบทุกทาง: คำนวณ live ในฟอร์ม (calculateNet/calculateNetPopup ผ่าน activeGpRate), บันทึกใหม่, แก้ไข, quick toggle NO FEE ในแถว (เปิด NO FEE = ล้างธง 35%, ปิด = กลับ 30%); ตารางประวัติแสดง badge เหลือง "35%" ต่อท้ายยอด GP; CSV import ยังคิด 30% ตามเดิม (ไปติ๊กแก้รายบิลได้)
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **ตัดแท็บสถานะปัญหา 3 ตัวที่ซ้ำกับ chip แถบ "ต้องจัดการ":** แท็บ ไม่พบรายการยา / รายการยาไม่มี MLP / ใบวางบิลไม่เจอ MLP นับเลขเดียวกันและกรองเหมือน chip ในแถบต้องจัดการเป๊ะ (กด chip แล้วแท็บติดเขียวตาม เห็น active ซ้ำ 2 ที่) → ลบแท็บออก แถวแท็บเหลือหมวดมุมมองหลัก ทั้งหมด/จับคู่แล้ว/PAID/ประกัน/สปสช/Exclude ส่วนกลุ่มปัญหากรองจาก chip ต้องจัดการที่เดียว (แนวเดียวกับที่เคยตัดแท็บ "รอใบวางบิล"); ลบ 3 entry ใน tabCountIds ด้วย; trade-off ที่ยอมรับ: ตอนกรองกลุ่มปัญหา แถวแท็บไม่มีแท็บติดเขียว (ดูสถานะ active ที่ตัว chip + บรรทัดสรุป/แถวว่างบอกตัวกรอง) — bump v=20260707010000

## 📅 6 กรกฎาคม 2026 — ช่วงที่บ้าน (STEP 2 นำเข้าเฉพาะ คลิกนิก เฮลท์)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **จัดเรียงคอลัมน์ "บิล / ผู้รับบริการ" ใหม่ (5 บรรทัด → 4):** บรรทัด 1 ชื่อ + phone (ตัวเล็ก muted ชิดขวา ก่อนปุ่ม wand — ชื่อยาว phone/wand ตกบรรทัดใหม่แทนบีบชื่อ ด้วย flex-wrap + min-width 110px), บรรทัด 2 เลขที่ออเดอร์+copy คู่กับ refId+copy (เพิ่มปุ่ม copy ให้ refId — เดิมไม่มี), บรรทัด 3 ORW + chip ลำดับเคส (เดิม), บรรทัด 4 เครดิต AR + ใบวางบิล BAR รวมบรรทัดเดียว (billRefLinesHtml คืน span เดียว แต่ละก้อนเป็น .bill-ref-part inline-block ขึ้นบรรทัดใหม่ทั้งก้อนเมื่อที่ไม่พอ); ตัดบรรทัด refId·phone ล่างสุดออก (ย้ายขึ้นไปอยู่บรรทัด 1-2) เคสข้อมูลครบเตี้ยลง 1 บรรทัด/แถว — bump v=20260706570000
    *   **STEP 2 (MLP) นำเข้าเฉพาะรายการของ บริษัท คลิกนิก เฮลท์ จำกัด:** รายงาน MEDLIFE PLUS รวมทุกช่องทาง (ไฟล์จริง 6 ก.ค.: 155 แถว เป็น คลิกนิก เฮลท์ แค่ 35 — ที่เหลือ ชีวีบริรักษ์ 79 / AMED / LINEMAN / เคสเงินสด ฯลฯ) แถวพวกนี้ไม่ใช่บิลของบอร์ดและจะกลายเป็นบิล "ไม่พบรายการยา" ปลอม; parseMlpWorkbook กรองด้วยคอลัมน์บริษัท (regex คลิกนิก\s*เฮลท์, ช่องบริษัทว่างให้ผ่านกันตัดบรรทัดต่อของ detail) ครอบทุกทางเข้า ทั้ง Paste Clipboard และอัปโหลดไฟล์; modal paste บอกก่อนกดนำเข้า "155 rows, 7 columns — จะนำเข้าเฉพาะ คลิกนิก เฮลท์ 35 แถว" + ปุ่ม Import ถูกปิดเมื่อไม่มีแถว คลิกนิก เลย — bump v=20260706560000

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **Card Detail: รวม chips กรองด่วน + แถบ bulk เป็นแถวเดียว (ประหยัดพื้นที่ ~1 แถว):** ส่วน bulk เปลี่ยนจากแถบเต็มความกว้างเป็นกล่อง inline พื้น mint ต่อท้าย chips ในแถว card-detail-actions (โผล่เมื่อติ๊กเลือกบิล); ตัด chip "ดูเฉพาะ: สปสช/ประกัน" ที่ซ้ำกับ chips แถวบนออก; Exclude / ยกเลิก Exclude / ล้างการเลือก ยุบเข้าเมนู ⋯ (dropdown ปิดเองเมื่อคลิกที่อื่น/หลังสั่งงาน); ปุ่ม "กรองตารางตามนี้" ชิดขวาด้วย margin-left:auto; จอแคบแถว wrap เอง — bump v=20260706550000
    *   **แก้บั๊ก UI ซ้อนกันใน Card Detail (chips กรอง/ปุ่มทับแถบ bulk):** ซ้ำรอย pitfall เดิม — `.modal-card` เป็น grid 3 แถว (auto/1fr/auto) แต่การ์ดโตเป็น 6 ลูก (head/chips กรอง/bulk/chips ค่าซ้ำ/ตาราง/pager) แถว 1fr ไปตกที่แถว chips พอเนื้อหาสูงเกิน max-height ถูกบีบเหลือ 0 แล้วลูกล้นทับ bulk bar → เปลี่ยนการ์ดนี้เป็น flex column (`.modal-card.card-detail-card` ชนะ specificity) ทุกส่วนสูงตามเนื้อหา ตารางเป็นตัวยืด/scroll (min 120px กันหายบนจอแคบ) + จอ ≤640px การ์ดทั้งใบ scroll แทนการตัดทิ้ง — bump v=20260706540000
    *   **Card Detail: แบ่งหน้า (pagination) สูงสุด 50 แถว/หน้า:** แทนการตัดที่ 80 แถวแรก — แถบใต้ตาราง "← ก่อนหน้า | 1–50 จาก 123 บิล · หน้า 1/3 | ถัดไป →" + บรรทัดสรุปบอกหน้า; เปลี่ยนการ์ด/กด quick filter รีเซ็ตหน้า 1, การติ๊กเลือกคงอยู่ข้ามหน้า, ≤50 แถวซ่อน pager, เปลี่ยนหน้าเลื่อนกลับหัวตาราง — bump v=20260706530000
    *   **แก้บั๊ก: chip ตัวเลขในตารางย่อยการ์ดเลื่อนตำแหน่ง/สีเพี้ยน:** `.metric span { display:block }` และ `.monthly-cases-row span:first-child { text-align:left; color:muted }` ทับ chip → ตัวเลขไหลชิดซ้ายของช่อง; แก้ด้วย selector เจาะจงกว่า ให้ chip เป็น `display:inline` + inherit สี/น้ำหนัก/การจัดชิดทั้งหมด (ตำแหน่งตรงเป๊ะกับข้อความปกติ) hover ใช้ box-shadow แทน padding ไม่มี layout ขยับ — bump v=20260706520000
    *   **การ์ด KPI: ตัวเลขในตารางย่อยรายเดือนเป็น chip กดได้ → popup บิลของช่องนั้น:** ครอบ 4 การ์ด (เคสรายเดือน / ยอดขาย / ต้นทุน / กำไร) — กดเลขช่อง เดือน×ประเภทเคส (เช่น สปสช มิ.ย. = 801) เปิด Card Detail scope ตามช่องนั้น ("ยอดขาย สปสช · มิ.ย. 2569") เงื่อนไขนับตรงกับการ์ด (การ์ดเงินนับเฉพาะบิลรายได้จริง countsInRevenue, การ์ดเคสนับทุกบิล); ปุ่ม "กรองตารางตามนี้" จาก drill ตั้งทั้งประเภทเคส + ช่วงเดือน (dateField=primary) ให้ทั้งจอ; กดที่อื่นในแถว = กรองเดือนทั้งจอเหมือนเดิม — กลไก: state.monthDrill + config "monthDrill" (title เป็น getter) + monthDrillCell/handleMonthTableClick — bump v=20260706510000
    *   **แถวว่าง "ไม่พบข้อมูลตามตัวกรอง" บอกตัวกรองที่ทำงาน + ปุ่มล้างในตัว:** แก้ปัญหาเลขแท็บ (เช่น สปสช 81) ไม่ตรงกับตารางว่าง — แท็บนับเฉพาะช่วงเดือน แต่ตาราง AND ทุกตัวกรองรวม dropdown งานวางบิล/ค้นหา (ตัวกรองติดกลับมากับ autosave ที่กู้คืนได้); แถวว่างตอนนี้ระบุ "ตัวกรองที่ทำงาน: แท็บ: สปสช · งานวางบิล: รอตรวจสอบ ..." + ปุ่ม "ล้างตัวกรอง" กดแล้วบิลกลับมาทันที — bump v=20260706500000
    *   **Card Detail bulk bar: chip "ดูเฉพาะ: สปสช/ประกัน":** กรองมุมมองระหว่างทำ bulk โดยการเลือกไม่หาย + กด quick filter ที่ active ซ้ำ = กลับดูทั้งหมด (ใช้กับ chips แถวบนด้วย) — ภายหลังถูกยุบรวมใน v=550000 เพราะซ้ำกับ chips แถวบนที่อยู่แถวเดียวกันแล้ว — bump v=20260706490000
    *   **การ์ด STEP 1–3 แสดงสถานะกู้คืน + ประวัติอัปโหลดต่อ step (sourceMeta):** หลังกู้คืน autosave การ์ดไม่ขึ้น "ยังไม่ได้โหลด" อีก — แสดงสีฟ้า+ไอคอนย้อนเวลา "กู้คืนแล้ว — N บิลมีรายการยา (M รายการ) / N บิล MLP / N บิลมีใบวางบิล (BAR K เลข)" นับจากตัวบิล (snapshot ไม่มี source rows); เก็บ state.sourceMeta ต่อ step (เวลาอัปโหลดล่าสุด/ชื่อไฟล์/จำนวนแถว) ทุกครั้งที่อัปโหลด/paste/sample แล้ว persist ใน session+autosave ทุกถังเดือน (combineSessionPayloads merge ถังใหม่สุดชนะ) → บรรทัดเล็กใต้สถานะ "อัปโหลดล่าสุด 6 ก.ค. 69 14:05 • 3 ไฟล์ • 1,204 แถว"; payload เก่าไม่มี meta fallback เป็น "ข้อมูล ณ <เวลา autosave> (autosave)" จาก state.restoredInfo — bump v=20260706480000

## 📅 5 กรกฎาคม 2026 (CKNC แก้บั๊กลำดับเคสหายหลังกู้คืน)

### 🐛 แก้ไขบัค
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **บรรทัดสรุปใต้ตาราง: เงิน ขาย/ต้นทุน/กำไร นับเฉพาะรายได้จริงให้ตรงกับการ์ด + แยกกำไร สปสช/ประกัน:** เดิมการ์ด KPI นับเฉพาะบิลรายได้จริง (countsInRevenue = PAID หรือ วางบิลมี BAR) แต่บรรทัดสรุปนับทุกบิลที่แสดง → กดเดือนแล้วการ์ดยอดขาย 801 แต่สรุป "ขาย 13,216.50" ไม่ตรง (เพราะประกันที่ยังรอเอกสาร/ไม่มี BAR ถูกรวมในสรุปแต่ไม่นับในการ์ด); แก้ให้สรุป ขาย/ต้นทุน/กำไร นับเฉพาะ revenueRows เท่ากับการ์ด + เพิ่มป้าย "รายได้จริง:" + แยกกำไรตามประเภทเคส (สปสช/ประกัน, มี ทั่วไป/ไม่ทราบ เมื่อไม่ใช่ 0, ใช้ "—" เมื่อเป็น 0); "วางบิล" (billedAmount) + จำนวนเคส ยังนับทุกบิลที่แสดง (ความคืบหน้าวางบิล/การนับ ไม่ใช่รายได้) — bump v=20260706470000
    *   **แก้ modal "ยืนยันซ่อนคู่นี้ — ระบุเหตุผล" เพี้ยน (textarea ลอยไปติดขอบล่าง มีช่องว่างระหว่างชิปกับ "เหตุผล"):** ต้นเหตุ = การ์ด `.clipboard-card` เป็น grid แถวกลาง `minmax(0,1fr)` บังคับให้ body ยืดเต็มการ์ด — บนจอกว้างชิปเหตุผลตัดเหลือ 2 แถว เนื้อหาสั้นแต่ body ยังยืด → ดัน label+textarea ไปล่างสุดเกิดช่องว่าง; แก้ให้เฉพาะ modal นี้ `.clipboard-card` เป็น flex-column + `.dismiss-reason-body` เป็น `flex:0 1 auto` (หดได้แต่ไม่ยืด) → ทุกส่วนสูงตามเนื้อหา, พิสูจน์แล้ว: ถ้าการ์ดถูกบังคับสูงเกินเนื้อหา body คงที่ (ที่ว่างไปอยู่ใต้ปุ่ม ไม่แทรกในฟอร์ม) — bump v=20260706460000
    *   **รวมแถว mini chips เข้าแถบ "ต้องจัดการ" แถวเดียว (ลดซ้ำซ้อน/ประหยัดที่):** เอาแถว metric-mini-row ออกทั้งแถว แล้วรวม chip เตือนทุกตัวไว้ในแถบ mergeAssistant จุดเดียว จัดกลุ่มด้วยเส้นคั่นเบา: [จับคู่: ไม่พบรายการยา/รายการยาไม่มี MLP/ใบวางบิลไม่เจอ MLP/รอใบวางบิล] | [วางบิล: ประกันรอเอกสาร/สปสชรอวางบิล/รอตรวจสอบ] | [ยังไม่ทราบประเภท] | [WARN]; ตัด "ไม่พบรายการยา" ที่ซ้ำเหลือตัวเดียว, chip 0 ซ่อนอัตโนมัติ; กด chip = กรองตาราง (applyGapFilter ตั้งตัวกรองมิติเดียว รีเซ็ตมิติอื่น กดซ้ำยกเลิก), WARN เปิด popup; ตัด chip นับเฉย ๆ (บิล CLICKNIC/ใบวางบิล — ดูได้จาก step status); renderMergeSuggestions → renderMergeAssistant — bump v=20260706450000
    *   **Card Detail: ปุ่ม one-click กรองด่วน 4 ตัว:** ทั้งหมด / PAID woBAR (วางบิลแล้ว/PAID แต่ยังไม่มีเลข BAR) / ประกัน / สปสช — กรองเฉพาะแถวที่แสดงในการ์ด (การเลือก bulk ยังยึดชุดเต็มของการ์ด) chip active สีเขียว, หัวการ์ดบอก "กรอง: ..."; รีเซ็ตเป็นทั้งหมดเมื่อเปลี่ยนการ์ด — bump v=20260706440000
    *   **ไม่เตือน NCO "ไม่มีต้นทุน" สำหรับเคส สปสช:** สปสช ต้นทุนปกติ = 0 (CLICKNIC ส่งยาให้ฟรี) → ต้นทุน 0 ไม่ใช่ข้อมูลขาด; เพิ่มเงื่อนไข `bill.caseType !== "nhso"` ใน validation MISSING_MLP_COST (chip NCO) — เคสอื่น (ประกัน/ทั่วไป) ที่ต้นทุน 0 ยังเตือนเหมือนเดิม — bump v=20260706430000
    *   **นำเข้าไฟล์/paste = เพิ่มเข้าข้อมูลเดิมเสมอ (ไม่ถามโหมด):** เดิมถ้ามีข้อมูลอยู่จะเด้ง modal ถาม (ยกเลิก/เริ่มใหม่ทั้งหมด/เพิ่มเข้าข้อมูลเดิม) → ตอนนี้อัปโหลดไฟล์ + Paste Clipboard เมื่อมีข้อมูลอยู่ = append เสมอ (แถวซ้ำถูกตัดอัตโนมัติ ค่าที่แก้มือคงอยู่) ไม่ถาม; โหลด session ยังถามเหมือนเดิม (การกระทำที่ตั้งใจ) — bump v=20260706420000
    *   **เอาการ์ด "ครบ CKNC+MLP+BAR" ออกจากแถว KPI:** metric matched ยังคำนวณ+ใช้ tab/export เหมือนเดิม เอาแค่การ์ดออก (ลบ matched จาก metricIds, renderMetrics null-guard กันอยู่แล้ว); แถว KPI เหลือ เคสรายเดือน·ยอดขาย·ต้นทุน·กำไร — bump v=20260706410000
    *   **การ์ดยอดขาย + กำไร: เพิ่มตารางย่อ สปสช/ประกัน 3 เดือนล่าสุด:** generalize renderCostByMonth → renderMoneyByMonth(bodyId, valueFn) ใช้ร่วม 3 การ์ด (ยอดขาย=sale, ต้นทุน=cost+mlpCost, กำไร=profit); ยอดขาย/กำไร ได้ตารางย่อ 3 เดือน (สปสช/ประกัน, นับเฉพาะบิลรายได้ตาม countsInRevenue) ต่อจาก chip เดิม กดแถวกรองเดือนได้ (handler ครอบ 3 body) — bump v=20260706400000
    *   **ยอดขาย/ต้นทุน/กำไร นับเฉพาะบิล PAID หรือ วางบิลแล้วมี BAR:** เปลี่ยนกติกาคำนวณ — countsInRevenue = billingStage paid หรือ (billed และมี barNo); การ์ด KPI ยอดขาย/ต้นทุน/กำไร + chip แยก สปสช/ประกัน/อื่น ๆ + ตารางต้นทุนรายเดือน นับเฉพาะบิลที่เข้าเงื่อนไข (รายได้ที่เกิดจริง ตัดบิลที่ยังไม่วางบิล/ไม่มี BAR ออก); กำไรเดิมนับ matched+รอใบวางบิล → เปลี่ยนเป็น revenueBills; แถบสรุปใต้ตาราง (ผลรวมแถวที่แสดง) และ export ยังนับตามเดิม — bump v=20260706390000
    *   **แก้ความไม่สอดคล้อง: กดเดือนจากการ์ดแล้วกรองด้วย "วันบิลหลัก" (CLICKNIC→MLP):** เดิมการ์ดเคสรายเดือน/ต้นทุนนับเดือนจาก clicknic||mlp แต่กดเดือนกรองด้วย clicknicDate อย่างเดียว → บิลที่ไม่มีวัน CLICKNIC (มีแต่ MLP) ถูกนับในการ์ดแต่ไม่โผล่ตอนกรอง เลขไม่ตรง; แก้เป็น: การ์ดนับด้วย primaryBillDate + เพิ่มโหมด dateField "primary" (วันบิลหลัก CLICKNIC→MLP) ใน isWithinDateRange + dropdown + toggleMonthFilter ใช้โหมดนี้ — กดเดือนจากการ์ดเห็นบิลตรงกับที่การ์ดนับ (หมายเหตุ: quick chip "ทุกวัน CLICKNIC" ยังนับด้วย clicknic ตามชื่อ) — bump v=20260706380000
    *   **การ์ดต้นทุน: ตารางย่อต้นทุน สปสช/ประกัน 3 เดือนล่าสุด:** ใต้ยอดต้นทุนรวมมีตารางย่อ (แนวเดียวกับการ์ดเคสรายเดือน) แสดงต้นทุน (cost+mlpCost) แยก สปสช/ประกัน ราย 3 เดือนล่าสุด นับทุกบิลบนจอ (ไม่ขึ้นกับตัวกรอง) กดแถวเดือนกรองทั้งจอได้ (reuse toggleMonthFilter); ค่าเป็นเงินจัดชิดขวา คอลัมน์กว้างกว่า count — bump v=20260706370000
    *   **Popup ลำดับเคส: แก้เลขลำดับซ้ำง่ายขึ้น (ช่องแก้ชัด + ปุ่มแก้อัตโนมัติ):** (1) ช่องเลขลำดับให้ affordance ชัดว่าคลิกพิมพ์แก้ได้ — เส้นขอบ/พื้นขาว/cursor text + ไอคอนดินสอจางในช่อง (เข้มขึ้นตอน hover) + tooltip "คลิกพิมพ์แก้เลขได้เลย"; (2) แถวที่ซ้ำมีปุ่ม "✦ #N" ในคอลัมน์จัดการ กดแล้วใส่เลขว่างถัดไปของเดือน (nextFreeCaseSeq = เลขบวกน้อยสุดที่ยังไม่มีใครใช้ เติมช่องว่างก่อน) ทันที ไม่ต้องพิมพ์เอง — bump v=20260706360000
    *   **WARN popup: ปุ่ม "แก้เอง" (สปสช MLP≠0) เป็นปุ่มไอคอนดินสอ:** เปลี่ยนจากปุ่มข้อความเป็น icon-action (fa-pen-to-square) เหมือนปุ่มแก้ในตารางอื่น — bump v=20260706320000
    *   **WARN popup: เปลี่ยนข้อความปุ่ม "ตั้งต้นทุน MLP = 0 ให้ทั้งหมด" → "Set MLP cost 0"; Card Detail: เพิ่มความกว้างคอลัมน์ บิล/ORW (col-ref 152px → 210px):** — bump v=20260706330000
    *   **Card Detail: แก้ bulk ได้ในตัว (ไม่ต้องเด้งไปตารางหลัก):** เพิ่ม checkbox เลือกรายแถว + เลือกทั้งหมด (หัวคอลัมน์จัดการ) + แถบ bulk ในป็อปอัป (โผล่เมื่อมีบิลติ๊ก): ตั้งประเภทเคส / งานวางบิล (dropdown), ใส่ BAR (input+Enter), Exclude / ยกเลิก Exclude, ล้างการเลือก — ใช้ applyBulkOverride(keySet) แล้ว refreshCardDetail; selection แยกจากตารางหลัก (cardBulkSelected), prune คีย์ที่หลุดกลุ่ม (เช่นเปลี่ยนประเภทเคสแล้วบิลออกจากการ์ด), เคลียร์ตอนปิด/เปลี่ยนการ์ด; แถวที่ติ๊กไฮไลต์เขียว — bump v=20260706350000
    *   **Drawer ยอดเงิน: จัดช่องใหม่ 3+2 แถว:** ต้นทุน CKNC / ต้นทุน MLP / ราคาขาย อยู่แถวเดียว (grid 3 คอลัมน์ 0.82/0.82/1fr — ช่องต้นทุนแคบกว่า ราคาขายกว้างสุด), ยอดใบวางบิล / ยอดเรียกเก็บ (CKNC-INS/NHSO) อยู่แถวเดียว (2 คอลัมน์) — bump v=20260706340000
    *   **แก้บั๊ก UI: modal ระบุเหตุผลซ่อนคู่บิล เลย์เอาต์เพี้ยน (textarea ถูกตัด):** `.clipboard-card` เป็น grid 3 แถว (auto/1fr/auto) แต่ modal มีลูก 5 ตัว → summary ไปอยู่แถว 1fr แล้ว stretch ดัน textarea/actions เพี้ยน/ถูกตัด → ห่อ summary+chips+label เป็น `.dismiss-reason-body` เดียว (min-height:0 + overflow-y:auto) ให้การ์ดเหลือ 3 ลูก (head/body/actions) พอดี grid — bump v=20260706310000
    *   **Popup เทียบคู่บิล: ปุ่ม copy ต่อจากเลขที่ออเดอร์:** แถว "เลขที่ออเดอร์" ในตารางเทียบสองบิล มีปุ่มคัดลอกทั้งสองฝั่ง (flag copyable ใน fields tuple) กดแล้วไอคอนเปลี่ยน ✓ — bump v=20260706300000
    *   **Popup ลำดับเคส: ย้ายเตือนเลขซ้ำไปต่อท้ายหัวข้อ (inline บรรทัดเดียว):** จากแถบเตือนใน scroll body (เลื่อนหาย) → ย้ายเป็น chip ต่อท้าย "ลำดับเคสสปสช · มิ.ย. 2026 (81 เคส)" ในหัว modal (ไม่เลื่อน เห็นตลอด): "⚠ ซ้ำ: [#60][#67]" กด chip = jump ไปแถว + แฟลชเหมือนเดิม (ย้าย handler ไป caseSeqDupInline) — bump v=20260706290000
    *   **Popup ลำดับเคส: แถบเตือนเลขซ้ำเป็น chip กดกระโดดไปแถวได้:** เปลี่ยน "พบลำดับซ้ำ: #45, #60, #67" จากข้อความล้วนเป็น chip แต่ละเลข (data-dup-seq) กดแล้วเลื่อนไปแถวแรกของลำดับนั้น + ไฮไลต์แฟลชทุกแถวที่ซ้ำเลขเดียวกัน (animation caseSeqJump box-shadow ส้ม) + โฟกัสช่องแก้เลข; เพิ่ม data-row-seq ให้ทุกแถว — bump v=20260706280000
    *   **WARN: ตรวจ สปสช ต้นทุน MLP ≠ 0 + ปุ่ม bulk ตั้งเป็น 0:** เคส สปสช ปกติต้นทุน MLP = 0.00 → เพิ่มการตรวจ (nhsoCostIssues: activeBills caseType nhso, |mlpCost|≥0.005) นับรวมที่การ์ด WARN (warnTotalCount = คู่บิลซ้ำ + สปสชผิด); กด WARN เปิด popup แบ่ง 2 section: "น่าจะเป็นบิลเดียวกัน" (เดิม) + "สปสช ต้นทุน MLP ไม่ใช่ 0" (ตาราง ผู้รับบริการ/ออเดอร์/ต้นทุน MLP แดง) มีปุ่ม "ตั้งต้นทุน MLP = 0 ให้ทั้งหมด" (bulk ผ่าน applyBulkOverride keySet) + ปุ่ม "แก้เอง" เปิด drawer รายบิล; แก้แล้ว popup อัปเดตเอง (เตือนหมดปิดเอง) — bump v=20260706270000
    *   **เปลี่ยนแถบ Merge 3 ฝั่ง → แถบ "ยังไม่ครบ" (actionable):** เดิมโชว์ funnel CLICKNIC/MLP memo/Billing ref + % (ต้องลบเลขเองถึงรู้ว่าเหลืออะไร) → เปลี่ยนเป็นโชว์เฉพาะกลุ่มที่ยัง match ไม่ครบเป็น chip กดกรองได้: รายการยาไม่มี MLP (แดง) / ไม่พบรายการยา (ส้ม) / ใบวางบิลไม่เจอ MLP (แดง) / รอใบวางบิล (ส้ม); ซ่อน chip ที่ 0, ครบหมด = "ครบทุกฝั่ง ✓" เขียว; หัวแถวบอก "ยังไม่ครบ N รายการ"; กด chip = setActiveStatus ไปกลุ่มนั้น + เลื่อนไปตาราง (กดซ้ำ = กลับ ทั้งหมด); นับตามช่วงวันที่ที่กรอง (statusCounts); ลบ mergeAssistantData ที่ไม่ใช้แล้ว — bump v=20260706250000
    *   **แก้บั๊ก UI: ปุ่ม AR2BAR ล้นทับช่อง AR:** `.bar-field-row` (grid item ในช่อง BAR) ไม่มี `min-width:0` เลย shrink ไม่ได้ ปุ่มล้นออกไปทับคอลัมน์ AR (rule กัน overflow เดิมเจาะจง `.form-grid > label > input` ลูกตรง แต่ input ถูกห่อใน bar-field-row แล้ว) → เพิ่ม min-width:0 ให้ bar-field-row + input flex:1 1 0 width:100% + ปุ่ม flex:0 0 auto nowrap (ยืนยันด้วยการวัด: ปุ่มพอดีขอบ cell ไม่ทับ AR) — bump v=20260706260000
    *   **เปลี่ยนชื่อปุ่มลัด BAR ใน drawer "+ หลายบิล" → "AR2BAR":** — bump v=20260706240000
    *   **Popup ลำดับเคส: chip "+ BAR" เมื่อยังไม่มีใบวางบิล:** คอลัมน์โค้ด แถวที่ยังไม่มี BAR โผล่ chip "+ BAR" สีเหลืองต่อท้ายโค้ด กดแล้วเปิดปุ่มลัด "ใส่ BAR ให้หลายบิล" โดย pre-select บิลนั้นไว้ให้ (ถ้าบิลไม่มี AR จะเปิด toggle แสดงทุกบิลอัตโนมัติให้เห็น) — พิมพ์ BAR ครั้งเดียวใส่ได้เลย — bump v=20260706230000
    *   **ปุ่มลัด "ใส่ BAR ให้หลายบิล" (เลือกตาม AR):** modal ใหม่ — พิมพ์เลข BAR ครั้งเดียวด้านบน แล้วติ๊กเลือกบิลในตาราง (ผู้รับบริการ/AR/ออเดอร์/วันที่/BAR เดิม) ไม่ต้องไปติ๊กในตารางหลัก; default โชว์เฉพาะบิลที่มี AR แต่ยังไม่มี BAR + ช่องค้นหา + toggle "แสดงทุกบิล" + เลือกทั้งหมดในรายการ; กด "ใส่ BAR ให้ N บิล" ใส่ทีเดียวผ่าน applyBulkOverride (เพิ่ม param keySet) คำนวณ stage ใหม่ (BAR+AR ครบ = วางบิลแล้ว) + audit; เปิดได้ 2 จุด: ปุ่ม "+ หลายบิล" ข้างช่อง BAR ใน drawer (pre-fill BAR ปัจจุบัน) และปุ่ม "เลือกหลายบิล…" ใน bulk bar; drawer เปิดอยู่จะรีเฟรชค่าใหม่หลังใส่ — bump v=20260706220000
    *   **จัดลำดับการ์ด KPI ใหม่ + rename + เอาการ์ด MLP รอใบวางบิลออก:** ลำดับใหม่ เคสรายเดือน · ยอดขาย · ต้นทุน · กำไร · ครบ CKNC+MLP+BAR; rename "ยอดขายยา"→"ยอดขาย", "กำไร matched หลัง MLP"→"กำไร"; ลบการ์ด "MLP รอใบวางบิล" (metric mlpNoBilling ยังคำนวณ+อยู่ใน export/report/tab เหมือนเดิม, เอาแค่การ์ดออก) — เพิ่ม null-guard ใน renderMetrics กัน crash ตอนการ์ดถูกลบ; ผู้ใช้ยืนยันว่า "MLP รอใบวางบิล" (status pending-billing) กับ "รอตรวจสอบวางบิล" (billingStage pending-review) วัดคนละแกน ไม่ซ้ำตรง แต่ทับกันบางบิลได้ — bump v=20260706210000
    *   **Drawer ช่องลำดับเคส: บอกเดือน/ปี + chip โค้ด + เตือนลำดับซ้ำ (แดงอ่อน) + ปุ่มเทียบ:** label เป็น "ลำดับเคสของเดือน · มิ.ย. 2569" (ปีตาม BE/CE), ใต้ช่องมี chip โค้ดเต็ม (NHSO-037-06) สีตามประเภทเคส อัปเดตสดตอนพิมพ์; ถ้าเลขซ้ำกับบิลอื่น (ประเภทเคส+เดือนเดียวกัน) ช่องพื้นแดงอ่อน + บรรทัดเตือน "⚠ ลำดับ #37 ซ้ำกับ <เลขออเดอร์> (และอีก N ใบ)" + ปุ่ม "เทียบข้อมูล" — ซ้ำ 1 ใบเปิด popup เทียบสองบิลรายฟิลด์ (titleText override), ซ้ำหลายใบเปิดตารางลำดับทั้งเดือน; เช็คสดตอนพิมพ์ ไม่นับตัวเอง (drawer ใช้แดง ต่างจาก popup ตารางที่ใช้ส้ม/เหลือง ตามที่ผู้ใช้กำหนด) — bump v=20260706200000
    *   **Popup ลำดับเคส: ปุ่ม copy หลังเลขที่ออเดอร์:** ปุ่มคัดลอกข้างเลขที่ออเดอร์ในคอลัมน์ บิล/ผู้รับบริการ (บรรทัดเดียวกับเลข) กดแล้วไอคอนเปลี่ยน ✓; แยกจากปุ่มเปิด drawer เดิม (คลิก copy ไม่เปิด drawer) — bump v=20260706190000
    *   **การ์ดยอดขายยา: แยกยอดตามประเภทเคสเป็น chip:** ใต้ตัวเลขยอดขายรวมมี chip แยก สปสช (น้ำเงิน) / ประกัน (ม่วง) / อื่น ๆ (เทา) นับตามช่วงวันที่ที่กรอง + ป้ายช่วงเวลาในหัวการ์ด (เหมือนการ์ดกำไร); refactor renderProfitBreakdown → renderCaseBreakdown ใช้ร่วมสองการ์ด — bump v=20260706180000
    *   **แก้บั๊ก UI: modal ระบุเหตุผลซ่อนคู่บิล label/textarea ชนขอบ:** `.drawer-note` (ยืมมาจาก drawer ที่มี padding ของ section) ไม่มี padding แนวนอนในบริบท modal เลยชนขอบซ้าย (label "เหตุผล" ถูกตัด) → เพิ่ม margin/padding 18px เจาะจงให้ label/textarea/summary เว้นขอบเท่ากับ chips — bump v=20260706170000
    *   **Drawer: ช่องเงินแสดงทศนิยม 2 ตำแหน่ง:** ต้นทุน CKNC / ต้นทุน MLP / ราคาขาย / ยอดใบวางบิล / ยอดเรียกเก็บ และกำไร preview แสดง "0.00" / "10.00" เสมอ (helper fixed2 = toNumeric().toFixed(2), ไม่ใส่ลูกน้ำในช่องกรอกให้แก้ง่าย; กำไร preview ใส่ลูกน้ำ + 2 ตำแหน่ง) รวมถึงตอน sync ยอดขายจากรายการยาใน drawer — bump v=20260706160000
    *   **Popup ลำดับเคส: เตือนลำดับซ้ำ + ไฮไลต์:** ถ้ามีเลข caseSeq ซ้ำกันในเดือน (มักเกิดตอนตอกเลขเองชนกับ auto) ขึ้นแถบเตือนสีเหลืองบนตารางบอกเลขที่ซ้ำ (เช่น "พบลำดับซ้ำ: #30, #33"), แถวที่ซ้ำพื้นเหลืองอ่อน + ช่องกรอกลำดับขอบส้มพื้นเหลือง hover เห็นข้อความเตือน — คำนวณจากทุกแถวของเดือน (ค้นหาอยู่ก็ยังเตือน) — bump v=20260706150000
    *   **การ์ดกำไร: แยกยอดตามประเภทเคส (สปสช/ประกัน/อื่น ๆ) + ป้ายช่วงเวลา:** ใต้ตัวเลขกำไรรวมมี chip แยกกำไร สปสช (น้ำเงิน) / ประกัน (ม่วง) / อื่น ๆ (เทา) นับเฉพาะบิล matched+รอใบวางบิลตามช่วงวันที่ที่กรองอยู่ (กดเดือน/วันก็เปลี่ยนตาม) ซ่อน chip ที่ยอด 0, หัวการ์ดต่อท้ายป้ายช่วง เช่น "· มิ.ย. 2569" — bump v=20260706140000
    *   **แก้บั๊ก: แท็บสถานะค่า 0 ยังโชว์อยู่ (`hidden` โดน CSS ทับ):** ตั้ง `button.hidden = true` ใน renderTabs แล้วแต่แท็บยังแสดง เพราะ `.tab-button { display: inline-flex }` มี specificity สูงกว่า `[hidden]` (UA rule `display:none`) เลยชนะ → เพิ่ม `.tab-button[hidden] { display: none }` เจาะจง; แท็บ ไม่พบรายการยา/รายการยาไม่มี MLP/ใบวางบิลไม่เจอ MLP/Exclude ที่นับได้ 0 หายจริงแล้ว — bump v=20260706130000
    *   **ซ่อนคู่บิล: เปลี่ยน prompt เป็น modal พร้อมปุ่มเหตุผลสำเร็จรูป:** ปุ่ม "ไม่ใช่บิลเดียวกัน" เปิด modal ใหม่แทน prompt() เดิม — มีปุ่มเหตุผลสำเร็จรูป 5 ตัว (เจ็บป่วยคนละอาการ / คนละครั้งที่มารับบริการ / คนละวันที่ / ชื่อซ้ำ คนละคน / ตรวจสอบแล้วเป็นคนละออเดอร์) กดเติมต่อท้ายช่องข้อความได้หลายตัว (กันซ้ำ) หรือพิมพ์เอง แล้วกด "ยืนยันซ่อนคู่นี้"; เก็บ pendingDismissItem กัน context เปลี่ยนระหว่างเปิด modal — bump v=20260706120000
    *   **Popup ลำดับเคส: เพิ่มช่องค้นหาเลขที่ออเดอร์:** ช่องค้นหาเหนือตาราง (persistent ไม่ re-render กันโฟกัสหลุด) กรองตามเลขที่ออเดอร์ / ORW / ชื่อผู้รับบริการ / โค้ด NHSO-XXX-MM แบบสด; หัวตารางบอก "N จาก M เคส" ตอนค้นหา, ไม่พบขึ้นข้อความแยก, สีกลุ่ม BAR คิดจากทุกแถวของเดือน (ค้นแล้วสีคงที่); กัน Enter submit form dialog (ไม่ปิด popup) — bump v=20260706110000
    *   **Bill Detail drawer: ปุ่ม copy หลังเลขที่ออเดอร์ในหัว drawer:** ปุ่มคัดลอกข้าง h2 หัว drawer กดแล้วคัดลอกเลขที่ออเดอร์ (fallback ORW/billingNo) ไอคอนเปลี่ยน ✓ ชั่วครู่ — ซ่อนอัตโนมัติเมื่อบิลไม่มีเลขให้คัดลอก (จัดการใน click handler ของ detailDrawer เดิม) — bump v=20260706100000
    *   **WARN เปิด popup รายการคู่ทันที + ถอดแผงเหลืองออกจากหน้าหลัก:** กดการ์ด WARN แล้วขึ้น popup ตารางคู่ที่สงสัยเลย (% / คู่บิล / เหตุผล / ปุ่ม เทียบ·รวม ต่อแถว) — "เทียบ" เปิดตารางเทียบสองบิล (มีปุ่มรวม/ซ่อนคู่ในนั้น), "รวม" เข้า flow รวมบิลเดิม; แผงเหลือง "น่าจะเป็นบิลเดียวกัน" เหนือ bulk bar ถูกถอดออก ประหยัดพื้นที่แนวตั้งอีกหนึ่งแถบ; popup เปิดค้างอยู่จะตามข้อมูลล่าสุด (dismiss แล้วแถวหาย คู่หมดปิดเอง) — bump v=20260706090000
    *   **Card Detail: ปุ่ม copy หลังเลขที่ออเดอร์:** คอลัมน์ บิล/ORW เพิ่มปุ่มคัดลอกท้ายบรรทัดเลขที่ออเดอร์ (บรรทัดรองใต้ ORW) กดแล้วไอคอนเปลี่ยน ✓ เหมือนปุ่ม copy ORW เดิม — bump v=20260706080000
    *   **Popup ลำดับเคส: สีขอบโค้ดตามกลุ่ม BAR:** chip โค้ด (NHSO-XXX-MM) ในตารางลำดับได้ขอบหนา 2px สีตามกลุ่มใบวางบิล — บิลที่ BAR เดียวกันขอบสีเดียวกัน (palette 8 สี วนตามลำดับที่เจอ), ยังไม่มี BAR = ขอบส้ม, hover เห็นเลข BAR + เพิ่มคำอธิบายใน hint ท้ายตาราง — bump v=20260706070000
    *   **การ์ด WARN คู่บิลซ้ำ + ตัดการ์ด เคสประกัน/เคส สปสช ที่ซ้ำกับแท็บ:** แผงเหลือง "น่าจะเป็นบิลเดียวกัน" ไม่กางค้างอีกต่อไป — ย้ายเป็นการ์ดเล็ก "WARN" (ส้ม, ต่อจาก สปสชรอวางบิล) แสดงจำนวนคู่ กดการ์ด (หรือ Enter/Space) เพื่อกาง/หุบแผงรายการคู่ + เลื่อนจอไปหา แผงเปิดอยู่การ์ดติดพื้นส้ม, ไม่มีคู่ = การ์ดกับแผงซ่อนทั้งคู่; ตัดการ์ดเล็ก "เคสประกัน/เคส สปสช" ออก (ซ้ำกับแท็บ ประกัน/สปสช ที่นับเลขเดียวกัน) — bump v=20260706060000
    *   **แท็บสถานะค่า 0 ซ่อนอัตโนมัติ:** แบบเดียวกับการ์ด metric ค่า 0 — แท็บที่นับได้ 0 ตามช่วงวันที่ที่กรอง (เช่น ไม่พบรายการยา / ใบวางบิลไม่เจอ MLP / Exclude) ถูกซ่อน เหลือเฉพาะแท็บที่มีของ; "ทั้งหมด" กับแท็บที่เปิดอยู่แสดงเสมอ (สลับออกได้ ไม่หายคามือ) — bump v=20260706050000
    *   **Popup เทียบคู่บิล: ปุ่ม "ไม่ใช่บิลเดียวกัน (ซ่อนคู่นี้)" พร้อมเหตุผล:** ตรวจแล้วว่าเป็นคนละรายการ → กดปุ่มแดงใน popup กรอกเหตุผล (prompt, กดยกเลิกได้) คู่นั้นถูกซ่อนจากแผงแนะนำถาวร — เก็บใน state.dismissedSuggestions (กันซ้ำด้วย pairKey) ติดไปกับ session/autosave ครบทุกเส้นทาง (save/โหลดแทนที่/โหลดเพิ่ม/รวม sessions/กู้คืนตอนเปิดหน้า) + ลง audit trail ("ซ่อนคู่แนะนำรวมบิล" พร้อมเหตุผล); นำเข้าไฟล์แบบ "เริ่มใหม่ทั้งหมด" ล้างรายการซ่อน — bump v=20260706040000
    *   **Drawer: ตัดหัวข้อ "แก้ไขข้อมูลแถวนี้":** ซ้ำซ้อน — drawer ทั้งบานคือฟอร์มแก้ไขอยู่แล้ว ประหยัดพื้นที่แนวตั้ง 1 บรรทัด — bump v=20260706030000
    *   **Drawer: ช่อง BAR ว่างขึ้นพื้นส้มอ่อน + ย่อ label ราคาขาย:** ช่องใบวางบิล (BAR) ที่ยังไม่กรอกได้พื้นส้มอ่อนเตือนให้ไล่เก็บเลข (อัปเดตสดตอนพิมพ์/ลบ ผ่าน class `input-empty-warn` + รองรับโหมดมืด), label "ราคาขาย (ยอดขายยา)" ย่อเหลือ "ราคาขาย" — bump v=20260706020000
    *   **แก้บั๊ก UI: popup ลำดับเคส/เทียบคู่บิล การ์ดแคบกว่ากรอบ dialog (คอลัมน์ จัดการ ถูกตัด):** ปัญหาเดิมซ้ำรอย modal merge preview — การ์ดใช้ class `import-mode-card` ที่จำกัด 520px แต่ dialog กว้าง 680/760px ตารางเลยถูกบีบ/ตัดขอบขวา → แยกเป็น class `case-seq-card` / `suggest-pair-card` กว้างเต็มกรอบ + เพิ่มระยะขอบข้างให้ body ทั้งสอง (ยืนยันด้วยการวัดจริง: การ์ด = dialog พอดี คอลัมน์จัดการครบ) — bump v=20260706010000
    *   **ปุ่ม "เลือก" ในแผงแนะนำคู่บิล เปิด popup เทียบสองบิล + action ต่อ:** เดิมกดแล้วแค่ติ๊ก 2 บิลในตาราง — ถ้าตัวกรอง/ค้นหาซ่อนบิลอยู่จะดูเหมือนไม่มีอะไรเกิดขึ้น → ตอนนี้เปิด popup ตารางเทียบรายฟิลด์ (ผู้รับบริการ/ออเดอร์/ORW/สถานะ/งานวางบิล/ประเภทเคส/วันที่/เงิน/ยา/BAR/AR/โทร) ช่องที่ค่าสองฝั่งไม่ตรงกันพื้นเหลือง + แสดง % และเหตุผลที่จับคู่, ปุ่ม "ดูรายละเอียด" เปิด drawer รายบิล, ปุ่ม "รวมบิล" วิ่งเข้า flow รวมเดิม (มีสรุปยืนยันก่อน); สองบิลยังถูกติ๊กเลือกในตารางให้เหมือนเดิม — bump v=20260706000000
    *   **Popup ลำดับเคส: แต่ง UI + เปิดแก้ไขบิลได้จากตาราง:** ตารางใหม่ในกรอบมน หัวตาราง sticky, โค้ดเป็น chip สีตามประเภทเคส (น้ำเงิน สปสช / ม่วง ประกัน), แถวบิลที่กดมามีแถบเน้นเขียวซ้าย, hover ไฮไลต์, รองรับโหมดมืด; เพิ่มคอลัมน์ "จัดการ" — กดเลขบิลหรือปุ่มดินสอของแถวไหนก็ได้เพื่อปิด popup แล้วเปิด Bill Detail drawer ของบิลนั้นทันที — bump v=20260705230000
    *   **Drawer: แยกช่องต้นทุนเป็น "ต้นทุน CKNC" + "ต้นทุน MLP" และ label ยอดเรียกเก็บตามประเภทเคส:** เดิมช่องต้นทุนเดียวรวมสองก้อน (แก้แล้วยุบเข้า cost ล้าง mlpCost) → ตอนนี้แก้แยกฟิลด์ตรงตาม data model (cost / mlpCost) กำไร preview รวมสองช่องสด; label "ยอดเรียกเก็บประกัน (CKNC-P)" เปลี่ยนเป็น dynamic ตามประเภทเคสของบิล: สปสช = "ยอดเรียกเก็บ (CKNC-NHSO)", ประกัน = "(CKNC-INS)", อื่น ๆ = "(CKNC-INS/NHSO)" (ข้อความ validation/chip ECM/paste modal ใช้ CKNC-INS/NHSO); แถม: เปลี่ยนช่อง ยอดใบวางบิล + ยอดเรียกเก็บ จาก type="number" เป็น text inputmode="decimal" ตามธรรมเนียมกันค่ามีลูกน้ำหาย — bump v=20260705220000
    *   **Chip ลำดับเคสรูปแบบใหม่ NHSO-XXX-MM + popup ตารางลำดับทั้งเดือน:** เปลี่ยน label chip จาก "สปสช #6·มิ.ย." เป็นโค้ด `NHSO-006-06` / ประกันเป็น `INS-XXX-MM` (XXX = ลำดับ 3 หลัก, MM = เลขเดือน 2 หลัก, * = กำหนดเลขเอง); คลิก chip เปิด popup ตารางลำดับเคสทุกใบของประเภท×เดือนนั้น (คอลัมน์ ลำดับ/โค้ด/วันที่ CKNC/บิล·ผู้รับบริการ, แถวบิลที่กดถูก highlight) แก้เลขได้ในช่องลำดับของแต่ละแถว (Enter บันทึก · เว้นว่าง = กลับนับอัตโนมัติ — กลไก caseSeqManual + audit เดิม) แทน inline edit บน chip แบบเก่า — bump v=20260705210000
    *   **คอลัมน์ บิล/ผู้รับบริการ: แยกบรรทัดเลขอ้างอิง + จำนวนเครดิตต่อ BAR:** จากเดิมต่อกันบรรทัดเดียว "ORW · ใบวางบิล BAR · เครดิต AR" → แยกเป็น 3 บรรทัด: ORW (พร้อมปุ่ม copy + chip ลำดับเคส), เครดิต AR-..., ใบวางบิล BAR-... (N เครดิต) — N คือจำนวนเลขเครดิตทั้งหมดที่เกาะ BAR เดียวกันนับข้ามทุกบิลที่ไม่ Exclude (barCreditCountMap คำนวณครั้งเดียวต่อการ render) — bump v=20260705200000
    *   **แก้บั๊ก: เลข AR ไม่ถูกเติมให้อัตโนมัติใน drawer (บิลจาก autosave เก่า):** บิลจาก snapshot เก่าเก็บเลขไว้ในฟิลด์เดิม `billingNo` (เช่น "AR-00003-26-2304") แต่ช่อง BAR/AR ใน drawer อ่านจากฟิลด์ใหม่ `barNo`/`creditNos` ที่ว่างเปล่า → เพิ่มขั้น "สะสาง snapshot" (normalizeSnapshotBills ใน renderSnapshot): แตกเลขจาก billingNo เข้า BAR (ขึ้นต้น BAR) / AR (ขึ้นต้น AR) อัตโนมัติ + stage auto (ไม่ใช่แก้มือ/ไม่ใช่ PAID) คิดใหม่ตามกติกา BAR+AR ปัจจุบัน แล้วอัปเดต chip ตรวจสอบให้ตรง — bump v=20260705190000
    *   **"วางบิลแล้ว" (auto) ต้องมีทั้ง BAR + AR ครบก่อน:** เดิมแค่มียอดใบวางบิลหรือเลขอ้างอิงตัวเดียวก็เด้งเป็น "วางบิลแล้ว" (เกิดบิลติด chip เตือน NBR/NAR ค้าง) → ตอนนี้ auto-detect เข้าสถานะวางบิลแล้วเมื่อมีทั้งเลขใบวางบิล (BAR) และเลขที่เครดิต (AR) เท่านั้น (แก้จุดเดียวที่ deriveBillingStage + ปรับ call sites ให้ส่ง barNo/creditNos, การกรอกยอดใบวางบิลไม่เปลี่ยน stage อีกต่อไป, เลือก chip เองแบบ manual ได้เหมือนเดิม); เปลี่ยน label ใน drawer "งานวางบิล (PAID อยู่ที่นี่)" → "งานวางบิล" — bump v=20260705180000
    *   **แก้บั๊ก: chip ลำดับเคส สปสช/ประกัน หายจากคอลัมน์ บิล/ผู้รับบริการ หลังกู้คืน session/autosave:** ทุกเส้นทางโหลด session (แทนที่/เพิ่ม/รวม sessions/กู้คืนอัตโนมัติตอนเปิดหน้า) ตั้ง `state.bills` ตรง ๆ โดยไม่เรียก `assignCaseSequences()` — บิลจาก autosave ที่บันทึกก่อนมีฟีเจอร์นี้จึงไม่มีเลขลำดับและ chip ไม่ขึ้น → ย้ายการคำนวณไปไว้ต้น `renderSnapshot()` ให้คำนวณใหม่ทุกครั้งที่วาดจอ (idempotent — เลขที่ตอกมือใน caseSeqManual ไม่กระทบ) — bump v=20260705170000

## 📅 4 กรกฎาคม 2026 — ช่วงที่ร้าน (CKNC นับตามตัวกรอง & ลำดับเคสรายเดือน)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **การ์ดเคสรายเดือน สปสช/ประกัน ในแถว KPI:** ตารางย่อสรุปจำนวนเคสต่อเดือนของปีปัจจุบัน (ไม่ขึ้นกับตัวกรอง — เห็นภาพรวมทั้งปีเสมอ) กดแถวเดือนเพื่อกรอง/ล้างตัวกรองเดือนนั้นทั้งจอได้ — bump v=20260705160000
    *   **ตัวเลขนับตามตัวกรองทุกจุด + chip ลำดับเคสกดแก้ได้:** การ์ด metric / chips ประเภทเคส / แท็บสถานะ / ชุดแถวใน Card Detail นับเฉพาะช่วงวันที่ที่กรองอยู่ พร้อมป้ายบอกช่วง (เดือน/ปี/วัน/ช่วง) + จำนวนแยกประเภทเคสที่บรรทัดสรุปและหัว Card Detail; chip ลำดับเคส (เช่น สปสช #12·มิ.ย.) เปลี่ยนเป็นปุ่ม กดแก้เลขในที่ (Enter บันทึก, Esc ยกเลิก, เว้นว่างกลับเป็นเลขอัตโนมัติ) + ลง audit trail — bump v=20260705150000
    *   **สวิตช์ BE|CE + bulk "แก้เงิน" + tag ลำดับเคสรายเดือน:** (1) segmented switch BE|CE แทนปุ่ม พ.ศ./ค.ศ. เดิม มีทั้ง header, Card Detail และ Bill Detail drawer sync กันหมด (2) ปุ่ม "แก้เงิน" ใน bulk bar — เลือกหลายบิลแก้ยอดขาย/ต้นทุนทีเดียว 3 โหมด (ค่าคงที่ / % ของยอดขาย / กำไรคงที่) พร้อม live preview (3) tag ลำดับเคสรายเดือนแยกประเภท สปสช/ประกัน เรียงตามวันที่ CLICKNIC อัตโนมัติ แก้เลขเองได้ใน drawer + คอลัมน์ case_seq ใน export (4) แก้ select ประเภทเคสล้นไปทับคอลัมน์งานวางบิลใน Card Detail — bump v=20260705140000
    *   **Chip เตือน NBR/NAR — บิลวางบิลแล้ว/PAID ที่ขาดเลขใบวางบิลหรือเลขเครดิต:** ขึ้น chip เหลืองในคอลัมน์ตรวจสอบให้ไล่เก็บเลข BAR/AR ได้ครบ — bump v=20260705130000
    *   **เพิ่มรายการยาจากตารางหลัก:** ปุ่ม "+ เพิ่มยา" ในคอลัมน์รายการยา กรอกชื่อ/จำนวน/ราคาแล้ว Enter บันทึกผ่านระบบ override เดิม ไม่ต้องเปิด drawer — bump v=20260705120000
    *   **ปุ่ม copy เลข ORW ใน Card Detail:** กดคัดลอกได้ทุกแถว ไอคอนเปลี่ยนเป็น ✓ ยืนยันชั่วครู่ — bump v=20260705110000

## 📅 4 กรกฎาคม 2026 (CKNC กู้คืนงานคร่อมหลายเดือน)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **Card Detail: แถว PAID ย้อมเขียวทั้งแถว:** เหมือนตารางหลัก (พื้นเขียวอ่อน + เส้นคาดเขียวขอบซ้าย) + แถว Exclude จางลงด้วย — bump v=20260705090000
    *   **Card Detail: คอลัมน์ตรวจสอบเป็น chip โค้ดย่อ + สีตามชนิดปัญหา:** แทนข้อความยาว "warn/NEGATIVE_PROFIT: กำไรติดลบ" ด้วย chip กระชับ hover เห็นข้อความเต็ม — ตามสเปกผู้ใช้: NGP กำไรติดลบ (แดง), NMR ขาดรายการยา (ส้มอ่อน), DMM วันที่ไม่ตรงกัน (เทา); ที่เสนอเพิ่มครบชุด: CNM ยาไม่มี MLP / BNM บิลไม่เจอ MLP / COS ทุนเกินยอดขาย (แดง), NCO ไม่มีต้นทุน / NBA ไม่มียอดวางบิล / NAR ไม่มีเลข AR (เหลือง), PDB รอใบวางบิล (น้ำเงิน), BEM/BCM/ECM ยอดไม่ตรง + EXC ไม่นับคำนวณ (เทา) — mapping อยู่ที่ issueChipDefs ใน cknc.js ปรับโค้ด/สีได้จุดเดียว — bump v=20260705080000
    *   **แก้บั๊ก: เพิ่มรายการยาใน drawer แล้วยังขึ้น "ไม่พบรายการยา":** บิล mlp-only ที่มี medicines จาก override → applyBillOverride ปรับสถานะเป็น "จับคู่แล้ว" อัตโนมัติ + validation MLP_NO_MEDICINE เช็กว่ามีรายการยาจริงก่อนเตือน (บิลเดิมที่เคยบันทึกไว้หายเองหลัง reload/rebuild)
    *   **Drawer: งานวางบิล (PAID อยู่ที่นี่) เป็น chips แทน dropdown:** กดเลือกทีเดียวเห็นทุกตัวเลือก chip ที่เลือกเป็นสีเขียว (ค่าเก็บใน select เดิมที่ซ่อนไว้ logic บันทึก/manual detection ไม่เปลี่ยน)
    *   **Card Detail: เปลี่ยนประเภทเคสได้จากตารางเลย:** คอลัมน์ประเภทเคสเป็น dropdown สีตามประเภท (เหมือนตารางหลัก) เลือกแล้วบันทึกผ่าน quickUpdateCaseType + refresh การ์ดทันที ไม่ต้องเข้าหน้าแก้ไข
    *   **Card Detail: เพิ่มคอลัมน์ "กำไร" ต่อจากต้นทุน:** ติดลบเป็นสีแดง — bump v=20260705070000
    *   **ระบบแนะนำคู่บิลที่น่าจะรวมกัน (merge suggestions + % ความคล้าย):** แผงสีเหลืองอ่อนเหนือ bulk bar แสดง "น่าจะเป็นบิลเดียวกัน N คู่" — จับกลุ่มจากสัญญาณแรง (ORW เดียวกัน/เบอร์โทร/ชื่อ normalize ตัดคำนำหน้า) แล้วให้คะแนนรายคู่: ORW เดียวกัน 45, ชื่อตรง 25, เบอร์ตรง 20, ข้อมูลคนละฝั่ง CKNC↔MLP เติมกันพอดี 15, วันที่ตรง 10, ยอดขายเท่ากัน 10 (แสดงเมื่อ ≥50%, สูงสุด 8 คู่, hover ดูเหตุผล) ปุ่ม "เลือก" ติ๊กสองบิลในตาราง / "รวม" วิ่งเข้า flow รวมบิลเดิมพร้อม confirm; กลุ่มชื่อซ้ำเกิน 6 บิลถูกข้าม (สัญญาณกว้างไป), cache ตามชุดบิล (พิมพ์ค้นหาไม่คำนวณซ้ำ), จำกัด ≤800 บิล — bump v=20260705060000
    *   **หัวตารางสรุปรายบิลจัดกึ่งกลาง:** คอลัมน์ สถานะ·งานวางบิล / วันที่ / รายการยา / การเงิน / ตรวจ จัด center (จัดการ กับ บิล/ผู้รับบริการ ยังชิดซ้าย) — class `th-center` — bump v=20260705050000
    *   **Paste BILLING NOTE รับข้อความทั้งหน้าใบวางบิลลูกหนี้ (หน้า BAR) — ผูก BAR ให้ทุกเลขที่เครดิตอัตโนมัติ:** Ctrl+A ที่หน้า BAR ในระบบวางบิลแล้ว copy มาวางใน modal เดิมได้เลย (เลือกวิธี text parser แทน OCR — แม่น 100% ไม่ต้องโหลดไลบรารี) parser จำเลข BAR จากหัวกระดาษ (contextBar) แล้วผูกให้รายการเครดิต AR/ORW/INV ทุกแถวถัดไปที่ไม่มี BAR ของตัวเอง + กัน 2 บั๊ก: "BAR-xxxx" มี "AR-xxxx" ซ้อนข้างในเคยเสี่ยงกลายเป็นเลขเครดิตผี (ตัด BAR ออกก่อน match AR) และ section การชำระเงิน/ยอดเงินสุทธิ ท้ายหน้าเคยเสี่ยงไปปนยอดของรายการสุดท้าย (เพิ่ม flush trigger) + placeholder ใน modal บอกวิธีใช้ — bump v=20260705040000
    *   **ปุ่ม "ใส่ BAR" ใน bulk bar — เสริม feedback ให้ไม่ดูเหมือนปุ่มพัง:** ตัวกลไกทำงานถูกอยู่แล้ว (ทดสอบยืนยัน) แต่กดตอนช่องว่างแล้วเงียบสนิท → ตอนนี้ขึ้นข้อความ "พิมพ์เลขใบวางบิล (BAR-...) ในช่องก่อน..." + โฟกัสช่องให้, กด Enter ในช่อง = กดปุ่ม, และตอนสำเร็จขึ้น status "ใส่ใบวางบิล BAR-x ให้ N บิลแล้ว" (แถวยังกะพริบเขียว + stage เปลี่ยนเป็นวางบิลแล้วเหมือนเดิม) — bump v=20260705030000
    *   **Lean ส่วนสรุปตัวเลข: การ์ดอย่างเดียว (แบบ A):** ตัด 3 กล่องหัวข้อ (การจับคู่ 3 ฝั่ง / งานวางบิล / ประเภทเคส) ที่เป็นแถว label:ตัวเลข → ตัวเลขรองทั้ง 11 ตัวกลายเป็นการ์ดเล็กหน้าตาเดียวกับการ์ด KPI เรียงแถวเดียวใต้แถว KPI (ห่อบรรทัดได้), **การ์ดค่า 0 ถูกซ่อนอัตโนมัติ** (ใช้ class is-zero ที่มีอยู่แล้ว + CSS display:none) เหลือเฉพาะตัวเลขที่มีความหมาย, คำอธิบายกลุ่มย้ายไปอยู่ใน tooltip ของแต่ละการ์ด, คลิกการ์ดดูรายละเอียด (drill-down) ได้เหมือนเดิม — ความสูงส่วนนี้ลดลงราวครึ่งหนึ่ง — bump v=20260705020000
    *   **แก้บั๊ก: refresh แล้วงานที่คร่อมหลายเดือนหายเกือบหมด ต้องไปกดโหลด autosave ทีละถังเอง:** autosave แบ่งถังรายเดือน แต่ตอนเปิดหน้าระบบกู้คืนเฉพาะถังเดียวที่ใหม่สุด (เช่นได้ 2026-07 กลับมา 10 บิล จากงานจริง 117 บิล) → ตอนนี้ถ้ารอบ autosave ล่าสุดคร่อมหลายเดือน (field `months` ใน doc) จะดึงทุกถังของรอบนั้นมารวมกันด้วยกติกา "ข้อมูลมากที่สุด" แล้วกู้คืนเป็นชุดเดียว (status แสดง "CKNC Autosave 2026-06 + 2026-07 (N บิล)")
    *   **Refactor:** แยก logic รวม payload หลาย session เป็น `combineSessionPayloads()` ใช้ร่วมกันระหว่าง "รวม sessions" กับกู้คืนตอนเปิดหน้า
    *   **กันบิลผีคืนชีพตอนโหลด session:** เส้นทางโหลดแบบแทนที่ apply กลุ่มรวมบิล + รายการลบซ้ำเสมอ — บิลที่เคยรวม/ลบไปแล้วซึ่งค้างอยู่ในถังเดือนเก่าจะไม่โผล่กลับ — bump v=20260705010000

## 📅 3 กรกฎาคม 2026 (CKNC Paste & Analyze)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **เพิ่ม/ลบรายการยาได้จาก Bill Detail Drawer:** ปุ่ม "+ เพิ่มรายการยา" หัวส่วนรายการยา (บิลไม่มีรายการยาก็เพิ่มเองได้), ช่องชื่อยาแก้ไขได้ทุกบรรทัด, ปุ่ม × ลบรายบรรทัด — กรอกจำนวน×ราคาแล้วยอดขายรวม/กำไรพรีวิวคำนวณให้ทันที บันทึกผ่านระบบ override เดิม (แถวว่างถูกตัดทิ้ง ลบจนหมดก็บันทึกว่างได้ถ้าบิลเคยมีรายการ) — bump v=20260705000000
    *   **เปลี่ยนสีประเภทเคส "ประกัน" เป็นม่วง แยกจาก สปสช:** เดิมประกัน (#eef3ff) กับ สปสช (#e8f0fb) เป็นน้ำเงินอ่อนแทบแยกไม่ออก — สีน้ำเงินสงวนไว้ให้ สปสช ตามธรรมเนียม จึงเปลี่ยนประกันเป็นโทนม่วง (#f4eefc / #6d28a8) ครบทุกจุด: select ในตาราง, badge, chip ใน card detail + เพิ่มกฎโหมดมืดของประกัน (เดิมไม่มี ตกไปใช้สีพื้น) — bump v=20260704230000
    *   **แก้บั๊ก UI: chip "กำไร 10" (สปสช) หลุดตำแหน่งไปชิดซ้ายของเซลล์:** `.profit-line.profit-nhso` ใช้ `width: fit-content` กล่องเลยหดแล้วเกาะขอบซ้าย ต่างจาก "กำไร x" ปกติที่เป็น block เต็มกว้างจัดชิดขวา → เพิ่ม `margin-left: auto` ให้ chip ดันชิดขวาใต้ช่องทุนเหมือนแถวอื่น — bump v=20260704220000
    *   **Paste & Analyze: สีบอกสถานะรายแถว ลด cognitive load:** แถวที่ค่าใหม่ต่างจากเดิม → กรอบ/พื้นเขียว (จะเปลี่ยน), ค่าที่วิเคราะห์ได้เท่ากับของเดิม → จางสีเดียวกันทั้งสองฝั่ง + ต่อท้าย "· เท่าเดิม" (ไม่ต้องไล่เทียบเอง), วิเคราะห์ไม่พบ → จางสุดเหมือนเดิม; เปลี่ยนช่องตัวเลขใน modal นี้เป็น type="text" inputmode="decimal" ตามธรรมเนียมช่องเงินใหม่ — bump v=20260704210000
    *   **Quick date filters แบบชั้น ปี → เดือน → วัน:** เพิ่มแถว chip เดือน (ชื่อเดือนไทยย่อ + จำนวนบิล เช่น "มิ.ย. 2569 (79)") เหนือแถววัน กดเดือนแล้วกรองทั้งเดือน + แถววันเหลือเฉพาะวันของเดือนนั้น เจาะรายวันต่อได้ ถ้าข้อมูลคร่อมหลายปีจะมีแถว chip ปีโผล่อีกชั้น (ปีเดียว/เดือนเดียวไม่แสดงแถวนั้นให้รก) เลขปีสลับ พ.ศ.⇄ค.ศ. ตามปุ่มเดิม ใช้เครื่องกรองช่วงวันที่เดิมทั้งหมดจึงเข้ากับยอดรวม/tabs/export อัตโนมัติ — bump v=20260704200000
    *   **Bulk action ใหม่ "ลบรายการ":** ติ๊กเลือกบิลแล้วลบออกจากงานบนจอถาวร (ปุ่มแดงใน bulk bar + confirm สรุปรายการก่อนลบ + ลง audit trail) — คีย์ที่ลบเก็บใน state.deletedBillKeys ติดไปกับ session/autosave และถูกลบซ้ำอัตโนมัติหลัง rebuild/append session/รวม sessions (บิลเดิมจาก session อื่นไม่งอกกลับ); ต้นฉบับใน session/ไฟล์เดิมไม่ถูกแก้ นำเข้าไฟล์แบบ "เริ่มใหม่ทั้งหมด" จะล้างรายการลบ — bump v=20260704190000
    *   **แก้บั๊ก "กำไรไม่คำนวณอัตโนมัติ" + กำไรคำนวณสดตอนพิมพ์:** สาเหตุคือช่องเงินเป็น `type="number"` — วาง/พิมพ์ค่ามีลูกน้ำ (เช่น "29,690.00") browser ตีเป็นค่า invalid ส่งค่าว่างมาให้ ระบบเห็นเป็น 0 = ไม่เปลี่ยน เลยไม่คำนวณ (ใน drawer ร้ายกว่า: บันทึกเป็น 0 เงียบ ๆ ได้) → เปลี่ยนช่องเงินทั้งหมดเป็น `type="text" inputmode="decimal"` แล้ว parse ผ่าน toNumeric ซึ่งตัดลูกน้ำอยู่แล้ว (ขาย/ทุนในตาราง, จำนวน/ราคายาในตารางและ drawer, ขาย/ทุนใน drawer) + เพิ่มคำนวณกำไรสดระหว่างพิมพ์ขาย/ทุนในตาราง (แสดงบนจอทันที ค่าจริง commit ตอนออกจากช่องเหมือนเดิม) — bump v=20260704180000
    *   **Bulk action ใหม่ "รวมบิล":** ติ๊กเลือก ≥2 บิล (เช่นออเดอร์เดียวกันแต่ข้อมูลแยกคนละแถว CLICKNIC/MLP) แล้วกดรวมเป็นบิลเดียวแบบ "ข้อมูลมากที่สุด" — บิลที่ข้อมูลเยอะสุดเป็นบิลหลักชนะรายฟิลด์ ช่องว่าง/ศูนย์เติมจากบิลอื่น รายการยาเอาชุดที่ยาวกว่า, ค่าที่แก้มือ (PAID/ประเภทเคส) ไม่หาย, มีข้อมูลครบสองฝั่งแล้วสถานะกลายเป็น matched, มี confirm สรุปก่อนรวม + ลง audit trail; กลุ่มรวมเก็บใน state.billMergeGroups ติดไปกับ session/autosave และถูก re-apply หลัง rebuild/append session/รวม sessions (สมาชิกที่โผล่กลับมาจาก session อื่นถูก fold ซ้ำอัตโนมัติ) — bump v=20260704170000
    *   **แก้บั๊ก UI: modal "ตรวจผลรวมก่อนยืนยัน" (merge preview) กางเต็มจอแต่เนื้อหากองซีกซ้าย:** dialog ใช้ความกว้าง 1080px ของ `.clipboard-modal` แต่การ์ดข้างในถูกจำกัด 520px — เพิ่มกฎ CSS ให้ `#mergeResultModal` และ `#importModeModal` กว้าง 520px พอดีการ์ด modal กลับมาอยู่กึ่งกลางจอ — bump v=20260704160000
    *   **ปุ่ม Paste & Analyze ในคอลัมน์ บิล/ผู้รับบริการ:** ปุ่มไอคอน (wand) ข้างชื่อผู้รับบริการ เปิด popup วางข้อความรายการจาก CLICKNIC แล้ววิเคราะห์อัตโนมัติทันทีที่พิมพ์/วาง — ดึง ผู้รับบริการ, วันที่ CLICKNIC, ประเภทเคส (จากวงเล็บ เช่น "เคสประกัน/บัตรเครดิต"), Ref-ID, เบอร์โทร, ที่อยู่, ยอดเรียกเก็บประกัน (เลขแรกท้ายข้อความ), ยอดขายยา MLP (เลขหลัง)
    *   **ตารางเทียบ เดิม → ใหม่ ต่อฟิลด์:** ติ๊กเลือกเฉพาะฟิลด์ที่จะใช้ (ติ๊กให้อัตโนมัติเฉพาะค่าที่พบและต่างจากเดิม) แก้ค่าที่วิเคราะห์ได้ก่อนบันทึกได้ กด "นำไปใช้กับบิลนี้" บันทึกผ่านระบบ override + ลง audit trail
    *   **กันพลาดเลขบิล:** เลขบิลในข้อความไม่ตรงแถวที่เปิด → เตือนสีแดง พร้อมปุ่ม "สลับไปใช้กับบิลนั้น"; cross-check วันที่ในข้อความกับวันที่ฝังในเลขบิล (0+ค.ศ.+เดือน+วัน) ไม่ตรงเตือนสีส้ม
    *   **ฟิลด์ใหม่ต่อบิล: Ref-ID / เบอร์โทร / ที่อยู่ / ยอดเรียกเก็บประกัน (CKNC คาดการณ์):** แก้ได้ใน Bill Detail Drawer, แสดง Ref-ID·เบอร์โทรใต้เลขบิลในตาราง, ออกใน Export CSV/XLSX (ref_id, phone, address, expected_claim) และติดไปกับ session/autosave
    *   **Validation ใหม่ (info):** ยอดใบวางบิลไม่ตรงยอดเรียกเก็บประกันที่ CKNC คาดไว้ (เกิน tolerance)
    *   **เปลี่ยนประเภทเคสจาก paste:** งานวางบิลที่ไม่ได้แก้มือ คำนวณ stage ใหม่ตามประเภทเคสอัตโนมัติ (เหมือนแก้จากตาราง) + label แหล่งที่มา "แก้มือ·paste"
    *   **Version bump:** v=20260703110000
    *   **ปรับ label + ตัด tab ซ้ำ (รอบสอง):** "ยอดเรียกเก็บประกัน (CKNC คาดการณ์)" → "(CKNC-P)" (drawer/popup/validation), สถานะ "MLP ไม่มีรายการยา" → "ไม่พบรายการยา" (tab/dropdown/metric/report/export), ตัด tab "รอใบวางบิล" ออก (ผลลัพธ์ซ้ำกับ tab ประกัน — สถานะรอใบวางบิลในแถวยังอยู่เหมือนเดิม) — bump v=20260703120000

## 📅 2 กรกฎาคม 2026 (CKNC สรุปรายบิล — No Horizontal Scroll)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **CKNC Bill Reconciliation (cknc.html):**
    *   **ยกเครื่องตารางสรุปรายบิล 18 → 7 คอลัมน์:** ไม่ต้องเลื่อนแนวนอนบนจอ ≥1200px โดยซ้อนข้อมูลที่เกี่ยวข้องในเซลล์เดียว — บิล/ผู้รับบริการ/ORW/ใบวางบิลรวมเป็นช่องเดียว, สถานะ+งานวางบิล+ประเภทเคสซ้อนแนวตั้ง, วันที่ 3 ช่องรวมเป็นช่องเดียว (แก้ inline ได้เหมือนเดิม)
    *   **คอลัมน์เงินย่อเหลือ ยอดขาย + กำไร:** ต้นทุนยา / ค่าใช้จ่าย MLP / ยอดใบวางบิล ย้ายไปแก้ใน Bill Detail Drawer พร้อมเพิ่มช่อง "ต้นทุนยา" ใหม่ใน drawer (กำไร preview คำนวณ auto รวมต้นทุนยาที่แก้)
    *   **รายการยา clamp 2 บรรทัด:** ปุ่ม "ดูทั้งหมด/ย่อ" กางรายการยายาว ลดความสูงแถว
    *   **ปุ่มจัดการเป็นไอคอน + ตรวจสอบเป็น badge:** ปุ่มรายละเอียด/แก้ยา/Exclude เปลี่ยนเป็น icon buttons มี tooltip, คอลัมน์ตรวจสอบแสดงจำนวนจุด (สีตามระดับ warn/danger) hover ดูรายละเอียด
    *   **รายการยาแบบแก้ไขได้รายบรรทัด:** แสดง 1 ยา 1 บรรทัด พร้อมช่องกรอก จำนวน × ราคาต่อหน่วย = ยอดขายบรรทัด — แก้แล้วคำนวณยอดขายยารวม/กำไร/medicinesText ใหม่อัตโนมัติผ่านระบบ override (ทำงานทั้งโหมดปกติและ session snapshot; บิลจาก session เก่าที่ไม่มีข้อมูลรายบรรทัดแสดงข้อความอ่านอย่างเดียว) เกิน 3 บรรทัดพับอัตโนมัติพร้อมปุ่ม "ดูทั้งหมด (n รายการ)"
    *   **คอลัมน์ "การเงิน":** ช่องกรอก ยอดขาย + ต้นทุนยา อยู่ในคอลัมน์เดียว (แท็ก ขาย/ทุน) พร้อมบรรทัดกำไร; บิลใหม่เก็บ medicines array ลง session/autosave ด้วย
    *   **บิลจาก session/autosave เก่าก็แก้รายบรรทัดได้:** สังเคราะห์รายการยาจากข้อความ (ชื่อ + จำนวน) อัตโนมัติตอนโหลด session — ราคาต่อหน่วยเริ่มว่าง (placeholder "ราคา", ยอดบรรทัด "= —") กรอกแล้วยอดขายรวมคำนวณจากทุกบรรทัด; กันพลาด: ถ้ายังไม่กรอกราคาเลย การแก้จำนวนจะอัปเดตแค่ข้อความรายการยา ไม่ทับยอดขายเดิมของบิล
    *   **Drawer แก้รายการยารายบรรทัดได้:** ส่วน "รายการยา" ใน Bill Detail Drawer เปลี่ยนจากแถบอ่านอย่างเดียวเป็นบรรทัดแก้ไขได้ (จำนวน × ราคา/หน่วย = ยอดบรรทัด) — แก้แล้ว sync ช่องราคาขายกับกำไร preview ทันที และบันทึกรวมกับปุ่ม "บันทึกการแก้ไข" (กันทับยอดขายเดิมแบบเดียวกับตาราง)
    *   **ตัดป้าย "ORW" ซ้ำในคอลัมน์บิล:** ค่า ORW ขึ้นต้นด้วย "ORW-" อยู่แล้ว แสดงเฉพาะค่า (เช่น ORW-00003-26-3234) — คงคำว่า "ORW -" เฉพาะบิลที่ไม่มีค่า
    *   **ย้ายปุ่ม วิเคราะห์/เครื่องมือ ขึ้นแถบบนสุด:** รวมกับปุ่ม Save Session/Export ฯลฯ (อยู่หน้าสุด มีเส้นคั่น) ประหยัดพื้นที่แนวตั้งหนึ่งแถบเต็ม — ยังซ่อนอัตโนมัติจนกว่าจะมีข้อมูลเหมือนเดิม
    *   **Lean Bill Detail Drawer:** ตัดบล็อก "ข้อมูลสรุป" ที่ซ้ำกับฟอร์มแก้ไข (ORW/INV/ผู้รับบริการ/วันที่/ยอดเงิน ฯลฯ เหลือจุดแก้ไขจุดเดียว) — คงไว้เฉพาะแถบชิพ สถานะ + ผลตรวจสอบ ใต้หัว drawer
    *   **Version bump:** v=20260703100000

## 📅 7 มีนาคม 2026 (Sales Breakdown & UI Enhancement)

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **LINE MAN Sales Recorder (lineman-mgr.html):**
    *   **เพิ่มระบบแจกแจง % (FEE vs NO FEE):** เพิ่มการแสดงผลยอดรับโอนสุทธิแยกตามประเภทออเดอร์ (FEE - มีค่า GP และ NO FEE - ไม่มีค่า GP) บนการ์ด Net Paid
    *   **Real-time Breakdown Calculation:** ระบบคำนวณยอดเงินและเปอร์เซ็นต์ส่วนแบ่งรายได้จากออเดอร์ทั้งสองประเภทแบบอัตโนมัติตามเดือนที่เลือก
    *   **UI Clarity:** ปรับปรุง Layout ของการ์ดสรุปยอดเงินให้แสดงรายละเอียดแยกสัดส่วนชัดเจน พร้อมไอคอนช่วยแยกประเภท (Percent/Bolt)


## 📅 5 มีนาคม 2026 (Stock Intelligence & Layout Refactor)

### 🐛 แก้ไขบัคสำคัญ — Admin Edit Button (ecom.html)
*   **B2B Wholesale Portal (ecom.html):**
    -   **ปุ่ม Edit ที่ Product Card ไม่ทำงาน — แก้ไขบัค 3 จุดพร้อมกัน:**
        1.  **`toggleAdminView()` Toggle ค่า `isAdmin` ผิด:** แยก `adminViewEnabled` (ควบคุม UI Overlay) ออกจาก `isAdmin` (ตรวจสอบ Role Firebase) — กดปุ่ม Cog จะไม่ทำให้สิทธิ์ Admin หายแล้ว
        2.  **Tailwind `hidden flex` Conflict:** Modal ที่มีทั้ง `class="hidden flex"` บังคับ `display:none !important` เสมอ แม้จะลบ `hidden` ออก — แก้โดยใช้ `style.display = 'flex'/'none'` โดยตรงแทน
        3.  **Product ID มีอักขระพิเศษ:** ชื่อยาที่เป็น Firestore Doc ID ทำให้ inline `onclick` string พัง — แก้โดยใช้ `window._ecomProductMap[idx]` (index map) แทนการ inject ID โดยตรง
    -   **Admin Auto-Enable:** Login ด้วย Role Admin ปุ่ม Cog จะ Active และ Edit Buttons ปรากฏทันทีโดยไม่ต้องกด Toggle ก่อน

### 🚀 ฟีเจอร์ใหม่ & การแก้ไข (Latest)
*   **ProOrder Manager (v4.18):**
    -   **Smart Stock Parsing:** ปรับปรุงระบบ Paste ให้สามารถดึงข้อมูล "จำนวนคงเหลือ" (Remaining Stock) จากตารางข้อมูลดิบได้อัตโนมัติ
    -   **Zero-Stock Filter (เหลือ 0):** เพิ่มปุ่มลัด (Box Icon) สำหรับกรองแสดงเฉพาะสินค้าที่ของขาดสต็อก (Remaining = 0) พร้อมทำแถบแจ้งเตือนสีแดงกระพริบให้เห็นชัดเจน
    -   **Paste Overwrite Logic:** แก้ไขปัญหาการวางรายการซ้ำแล้วจำนวนบวกเพิ่มสะสม โดยเปลี่ยนเป็นระบบ "เขียนทับ" (Overwrite) ด้วยจำนวนล่าสุดที่ระบุแทน
    -   **Version Up v4.18:** อัปเดต Changelog และเวอร์ชันของระบบเพื่อรองรับฟีเจอร์ใหม่
*   **ECOM Admin Dashboard (ecom-admin.html) Enhancements:**
    -   **Alphabetic Nav Bar (A-Z):** เพิ่มแถบเมนู A-Z (Alphabet Navbar) ด้านบนรายการสินค้า ช่วยให้กรองสินค้าตามตัวอักษรตัวแรกได้ทันที แยกกลุ่มตัวเลขและอักษรพิเศษ (#) ชัดเจน
    -   **One-Click Visibility Toggle:** ปรับปรุงปุ่มสถานะ (ACTIVE/HIDDEN) ในตารางให้คลิกเพื่อสลับการแสดงผลหน้าเว็บบายพาส (Show/Hide) ได้ในคลิกเดียว พร้อมระบบ Toast แจ้งเตือน
    -   **Soft Delete & Trash System:** เปลี่ยนระบบลบสินค้าเป็น "ย้ายลงถังขยะ" (Soft Delete) เพื่อป้องกันการลบผิดพลาด สามารถกู้คืน (Restore) หรือลบถาวรจากฟิลเตอร์ Trash ได้
    -   **Smart Category Populating:** แก้ไขบัคเมนูตัวกรอง "ทุกหมวด" ให้ดึงรายชื่อหมวดหมู่จากฐานข้อมูลมาแสดงผลอัตโนมัติเมื่อโหลดหน้าเว็บ
    -   **Special Character Support (V2):** แก้ไขปัญหาปุ่ม Edit กดไม่ได้สำหรับสินค้าที่มีชื่อยาวหรือมีอักขระพิเศษ (", ', \) โดยเพิ่มระบบ Safe ID Escaping ขั้นสูง
    -   **Security Rules Update:** ปรับปรุง Firestore Rules ให้ Admin (medlifeplus@gmail.com หรือ role: admin) สามารถจัดการ Access Codes และ Master Products ได้อย่างสมบูรณ์ ปลอดภัยจากการเข้าถึงโดยไม่ได้รับอนุญาต
    -   **Pagination Control:** เพิ่มระบบแบ่งหน้า (Pagination) หน้าละ 30 รายการ พร้อมปุ่มคัดกรองสถานะที่แม่นยำและการนับจำนวนรายการตามจริง
*   **B2B Wholesale Portal (ecom.html):**
    -   **PC High-Density Grid:** ปรับเปลี่ยนการแสดงผลเป็นแบบ 6 คอลัมน์ (Grid 6-Cols) บนหน้าจอเดสก์ท็อปขนาดใหญ่ เพื่อให้เห็นสินค้าจำนวนมากพร้อมกัน
    -   **Alphabetic Nav Bar (A-Z):** เพิ่มแถบเมนูค้นหาตามตัวอักษร (รวม "ก-ฮ") เพื่อความรวดเร็วในการเลื่อนดูรายการสินค้าที่ขึ้นต้นด้วยอักษรนั้นๆ ทำงานร่วมกับ Search และ Category ได้อย่างสมบูรณ์
    -   **Multi-Platform Pricing:** จัดการราคาแยกตามหน่วยและ Platform ได้หลากหลาย (ECOM, หน้าร้าน, Grab, Lineman, Shopee) พร้อมการแสดง Platform Label ที่หน้าบัตรสินค้าเพื่อให้ลูกค้าทราบเงื่อนไขราคาชัดเจน
    -   **Dynamic Category Management:** Admin สามารถระบุหมวดหมู่สินค้าใหม่ได้ทันทีผ่าน Modal โดยไม่ต้องเลือกจาก Dropdown เดิม ระบบจะอัปเดตแถบ Sidebar และ Option ต่างๆ อัตโนมัติทั่วทั้งหน้าเว็บ
    -   **Modal UI Refactor:** ปรับปรุงหน้าต่างแก้ไขข้อมูล (Admin Popup) ให้มีขนาดกว้างขึ้น (Max-XL), เพิ่มขนาดตัวอักษร (Large Font), และปรับระยะห่างของ Input ต่างๆ ให้กรอกข้อมูลได้สะดวกและเป็นระเบียบมากขึ้น
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
