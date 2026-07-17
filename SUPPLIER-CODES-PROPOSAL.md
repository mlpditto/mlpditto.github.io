# ตารางโค้ดเจ้า (supplier codes) — ร่างให้รีวิว 17 ก.ค. 2026

สร้างจาก **ข้อมูลจริงใน `master_products` 818 doc** (อ่านสด ไม่ได้เขียนอะไร) — ชื่อเจ้าใน `prices` **65 ชื่อ** + ชื่อใน `suppliers[]` ของ LINE MAN **2 ชื่อ** (`YPB`, `PNCP`) ยุบเหลือ **62 โค้ด** (รวมเจ้าใหม่ `NUT` ที่ยังไม่เคยมีในฐานข้อมูล)

> สถานะ: **ยังไม่แตะโค้ด ยังไม่แตะ data** รอคุณรีวิวตารางนี้ก่อน

## สิ่งที่ตกลงกันแล้ว (สะท้อนในตารางนี้)

- `**NONVAT ยาไพบูลย์` = **คนละเจ้า** กับ `YAPAIBOON` → โค้ด `YAPAIBOON-NV` (ซื้อไม่มี VAT ต้นทุนคนละราคา)
- `ZPL nnnnnn <ผู้ผลิต>` / `DKSH XXX <ผู้ผลิต>` = **แยกตามผู้ผลิต** → `MEGA`, `MSD`, `PFIZER`, `MERCK` ฯลฯ ส่วน `ZUELLIG` / `DKSH` เก็บไว้เฉพาะรายการที่ไม่ระบุผู้ผลิต
- **แยกให้ละเอียดที่สุดทุกกรณี** (ตกลง 17 ก.ค. 2026): Abbott แยกแผนก (`ABBOTT-EPD`/`ABBOTT-MND`) · Reckitt แยกแผนก (`RB-CONSUMER`/`RB-HEALTH`) · Takeda แยกช่องทาง (`TAKEDA` ผ่าน Zuellig / `TAKEDA-HECA` ผ่าน DKSH) · `FUTURO`/`NEXCARE` แยกจาก `MONTANA` · `NEOPLAST` แยกจาก `OREX`
  > หลักที่ได้: **ชื่อดิบต่างกัน = โค้ดต่างกัน** ไม่ยุบรวมเอง — ถ้าภายหลังอยากดูรวม ค่อยจัดกลุ่มตอนแสดงผลได้ แต่ข้อมูลที่ยุบไปแล้วกู้คืนไม่ได้
- **ยังไม่แตะ CKNC** — งานนี้จบแค่ทำชื่อให้ตรงกันระหว่าง ProOrder กับ LINE MAN

## ข้อเสนอเรื่องรูปแบบโค้ด

ใช้ **โค้ดนำหน้าเดิมของ ProOrder** เป็นมาตรฐาน (`YAPAIBOON`, `SPD2020`, `VMD`, `BYGP` …) แล้วให้โค้ดสั้นของ LINE MAN (`YPB`) เป็น alias

เหตุผล: โค้ดพวกนี้**มีอยู่แล้วในข้อมูลจริง 583 รายการ** ไม่ต้องคิดใหม่ ส่วนฝั่ง LINE MAN มีแค่ 2 ชื่อ (`YPB` 4 รายการ, `PNCP` 1 รายการ) ย้ายง่ายกว่ากันมาก ถ้าอยากได้โค้ดสั้นแบบ `YPB` เป็นตัวหลักก็ทำได้ แต่ต้องตั้งชื่อย่อใหม่ให้อีก ~57 เจ้าเอง

**กติกาที่โค้ดต้องผ่าน (ตรวจอัตโนมัติแล้วทั้งตาราง):**
- ห้ามมี `_` — คีย์ใน `prices` คือ `"บริษัท_หน่วย"` ถ้าโค้ดมี `_` จะ parse ชื่อเจ้าเพี้ยน
- ห้ามชนคำสงวนของ LINE MAN: `LINEMAN` / `COST` / `RETAIL` / `WHOLESALE` / `STICKER`
- ทุกชื่อดิบต้องมีโค้ดพอดี 1 ตัว ไม่ซ้ำ ไม่ตกหล่น

## ตาราง (เรียงตามจำนวนรายการที่มีต้นทุนจริง)

| โค้ด | ชื่อเจ้า | doc | ทุน>0 | ชื่อดิบที่รวมเข้ามา (alias) |
|---|---|---:|---:|---|
| `BYGP` | ร้านบ้านยา BANYA-GP | 16 | 13 | `BYGP ร้านบ้านยา BANYA-GP` |
| `SPD2020` | เอสพี ดรัก สโตร์ 2020 | 137 | 11 | `SPD2020 บจก. เอสพี ดรัก สโตร์ 2020 (สำนักงานใหญ่)`<br>`SPD2020 บจก. เอสพี ดรัก สโตร์ 2020` |
| `VMD` | วรมิตร ดรัก เซ็นเตอร์ | 58 | 8 | `VMD บจก. วรมิตร ดรัก เซ็นเตอร์ (สำนักงานใหญ่)`<br>`VMD บจก. วรมิตร ดรัก เซ็นเตอร์` |
| `ZUELLIG` | Zuellig Pharma (ไม่ระบุผู้ผลิต) | 23 | 7 | `ZUELLIG PHARMA., LTD.` |
| `MORYA` | หมอยาสุรินทร์ | 11 | 6 | `MORYA บจก. หมอยาสุรินทร์` |
| `YAPAIBOON` | ยาไพบูลย์ | 159 | 2 | `YAPAIBOON บจก. ยาไพบูลย์ (สำนักงานใหญ่)`<br>`YAPAIBOON บจก. ยาไพบูลย์`<br>**LINE MAN:** `YPB` |
| `TPD` | ถนอมเภสัช (THANOM PHARMA) | 16 | 2 | `TPD THANOM PHARMA DISTRIBUTION CO.,LTD.` |
| `DKSH` | DKSH (ไม่ระบุผู้ผลิต) | 12 | 2 | `DKSH (Thailand) Limited`<br>`DKSH` |
| `MSD` | MSD | 6 | 2 | `ZPL 102069 MSD` |
| `RXN` | PharmaNet | 7 | 1 | `RXN PharmaNet Company Limited` |
| `MEGA` | MEGA LIFESCIENCES | 7 | 1 | `ZPL 102110 MEGA LIFESCIENCES` |
| `DNC` | ดีเอ็น เซ็นเตอร์ 2019 | 16 | — | `DNC บจก. ดีเอ็น เซ็นเตอร์ 2019` |
| `S15` | สยามฟาร์มาซี ดรักเซ็นเตอร์ | 14 | — | `S15 บจก. สยามฟาร์มาซี ดรักเซ็นเตอร์` |
| `YAPAIBOON-NV` | ยาไพบูลย์ (ไม่มี VAT) | 13 | — | `**NONVAT ยาไพบูลย์`<br>แยกตามที่ตกลง — ซื้อแบบไม่มี VAT ต้นทุนคนละราคา |
| `CCDC` | ชัชชัยเภสัช | 12 | — | `CCDC บจก. ชัชชัยเภสัช CHATCHAIBHAESAJ CO.,LTD.` |
| `BERLIN` | Berlin Pharmaceutical | 7 | — | `BERLIN PHARMACEUTICAL INDUSTRY CO.,LTD.` |
| `TCPHARMA` | T.C.Pharma-Chem | 7 | — | `T.C.PHARMA-CHEM CO.,LTD.` |
| `MONTANA` | Montana Marketing | 5 | — | `Montana Marketing Co.,Ltd.` |
| `PFIZER` | Pfizer | 3 | — | `ZPL 108630 Pfizer` |
| `RB-CONSUMER` | Reckitt — RB Consumer | 3 | — | `DKSH TEL RB CONSUMER`<br>แยกจาก RB Health ตามที่ตกลง (แนวเดียวกับ Abbott) |
| `CHB` | จรูญเภสัช (CHAROON BHESAJ) | 2 | — | `CHB CRB CHAROON BHESAJ LTD.` |
| `GSK` | GSK | 2 | — | `ZPL 102112 GSK` |
| `ABBOTT-EPD` | Abbott EPD | 2 | — | `ZPL 102136 ABBOTT ES LTD-EPD`<br>แยกจาก Abbott Nutrition ตามที่ตกลง |
| `BCC` | BCC Consumer Care | 2 | — | `DKSH TMI BCC CONSUMER CARE` |
| `MERCK` | Merck | 2 | — | `DKSH T58 MERCK` |
| `BKKMEDISUPPLY` | Bangkok Medisupply | 2 | — | `DKSH TN2 BANGKOK MEDISUPPLY` |
| `FUTURO` | Futuro (ผ่าน Montana) | 2 | — | `MONTANA-FUTURO`<br>แยกจาก MONTANA ตามที่ตกลง |
| `ANB` | A.N.B. Laboratories | 2 | — | `A.N.B. LABORATORIES CO.,LTD.` |
| `THAIHERBAL` | Thai Herbal Products | 2 | — | `THAI HERBAL PRODUCTS CO.,LTD.` |
| `SIAMPHARM` | Siam Pharmaceutical | 2 | — | `SIAM PHARMACEUTICAL CO.,LTD.` |
| `BLH` | บี.แอล.ฮั้ว (B.L.HUA) | 1 | — | `BLH B.L.HUA CO.,LTD.` |
| `ABBOTT-MND` | Abbott Nutrition (MND) | 1 | — | `ZPL 102119 ABBOTT NUTRITION (MND)` |
| `MENARINI` | Menarini | 1 | — | `ZPL 102094 Menarini` |
| `TEMMLER` | TEMMLER PHARMA | 1 | — | `ZPL 102073 TEMMLER PHARMA` |
| `BESINS` | Besins Healthcare | 1 | — | `ZPL 102151 Besins Healthcare` |
| `HALEON` | Haleon Consumer | 1 | — | `ZPL 102191 Haleon Consumer` |
| `MEDA` | Meda Pharma | 1 | — | `ZPL 107217 Meda Pharma` |
| `SCHWABE` | Dr. Willmar Schwabe | 1 | — | `ZPL 102130 Dr. Willmar Schwabe` |
| `OTSUKA` | Thai Otsuka | 1 | — | `ZPL 102113 Thai Otsuka` |
| `TAKEDA` | Takeda (Thailand) — ผ่าน Zuellig | 1 | — | `ZPL 102189 TAKEDA (Thailand) Ltd.`<br>แยกจาก TAKEDA-HECA ตามที่ตกลง → รู้ว่าล็อตไหนมาทางไหน |
| `TAKEDA-HECA` | Takeda HECA — ผ่าน DKSH | 1 | — | `DKSH TOT TAKEDA - HECA` |
| `RB-HEALTH` | Reckitt — RB Health | 1 | — | `DKSH TEI RB HEALTH` |
| `MUNDIPHARMA` | Mundipharma | 1 | — | `DKSH UD3 MUNDIPHARMA-OTHERS` |
| `AZ` | AstraZeneca | 1 | — | `DKSH UE5 AZ-SEROQUEL` |
| `TMP` | TMP | 1 | — | `DKSH TSM TMP`<br>⚠️ ไม่รู้ว่า TMP ย่อจากอะไร — ช่วยเติมชื่อเต็ม |
| `ALCON` | Alcon Pharma | 1 | — | `DKSH TT2 ALCON PHARMA` |
| `BLACKMORES` | Blackmores | 1 | — | `DKSH T61 BLACKMORES` |
| `TEVA` | Teva Pharm-Med | 1 | — | `DKLL TEP TEVA PHARM-MED` |
| `EXELTIS` | Exeltis Pharma | 1 | — | `DKLL TMK EXELTIS-PHARMA` |
| `SMITHNEPHEW` | Smith & Nephew | 1 | — | `DKLL TK1 SMITH&NEPHEW` |
| `NEXCARE` | Nexcare (ผ่าน Montana) | 1 | — | `MONTANA-NEXCARE` |
| `NEOPLAST` | Neoplast (ผ่าน OREX) | 1 | — | `OREX AB03 NEOPLAST`<br>แยกจาก OREX ตามที่ตกลง |
| `PINYO` | Pinyo Pharmacy | 1 | — | `PINYO PHARMACY LTD.,PART.` |
| `VALOR` | Valor Health | 1 | — | `VALOR HEALTH CO.,LTD.` |
| `PHARMANORD` | Pharma Nord S.E.A. | 1 | — | `Pharma Nord S.E.A. Co., Ltd.` |
| `OSOTHINTER` | Osoth Inter Laboratories | 1 | — | `OSOTH INTER LABORATORIES CO.,LTD.` |
| `PACIFIC` | Pacific Healthcare (Thailand) | 1 | — | `PACIFIC HEALTHCARE (THAILAND) CO., LTD.` |
| `OUAYUN` | Ouay Un Osoth (อ้วยอันโอสถ) | 1 | — | `OUAY UN OSOTH CO., LTD.` |
| `SCHAROEN` | S.Charoen Bhaesaj Trading | 1 | — | `S.CHAROEN BHAESAJ TRADING CO.,LTD. [KBTG]` |
| `PROSP` | Prosp Pharma | 1 | — | `PROSP PHARMA CO.,LTD.` |
| `TRB` | ทีอาร์บี เชอร์เม็ดดิก้า | 1 | — | `บจก. ทีอาร์บี เชอร์เม็ดดิก้า` |
| `NUT` | บริษัท นูทริชั่น โปรเฟส จำกัด (มหาชน) | 0 | — | **LINE MAN:** `PNCP`<br>**เจ้าใหม่ ยังไม่เคยมีในฐานข้อมูล** — สินค้าขึ้นต้น `PNCP` (4 ตัว: I-NOX / PROPOLIS spray / DILUECA / MULTINUTRA) โดยมากซื้อจากเจ้านี้<br>⚠️ `PNCP` ที่อยู่ใน `suppliers[]` ของ `[5327] PNCP DILUECA` คือ**ชื่อนำสินค้าที่กรอกผิดช่อง** ไม่ใช่ชื่อเจ้า — ดูข้อเสนอวิธีแก้ด้านล่าง |
## จุดที่ต้องให้คุณชี้ขาด (มี ⚠️ ในตาราง)

1. ~~`PNCP` คือเจ้าไหน~~ **ตอบแล้ว 17 ก.ค. 2026:** `PNCP` = **ชื่อนำของสินค้า ไม่ใช่ชื่อเจ้า** สินค้ากลุ่มนี้โดยมากซื้อจาก **NUT** (บริษัท นูทริชั่น โปรเฟส จำกัด (มหาชน)) → เพิ่มโค้ด `NUT` เป็นเจ้าใหม่
   - ตรวจ data แล้ว: สินค้าขึ้นต้น PNCP มี 4 ตัว (`[225] I-NOX`, `[2657] PROPOLIS spray`, `[5327] DILUECA`, `[5579] MULTINUTRA`) — **ไม่มีตัวไหนมีเจ้าใน `prices` เลย** และมี `[5327]` ตัวเดียวที่ `suppliers[]` กรอกคำว่า `PNCP` ไว้
   - **เสนอ: แก้ที่ data 1 doc ดีกว่าตั้ง alias ถาวร** — เปลี่ยน `suppliers[0].name` ของ `[5327]` จาก `PNCP` เป็น `NUT` (ทุน 113.2433 คงเดิม) แล้วเลิกใช้ alias `PNCP` ไปเลย เพราะถ้าปล่อยให้ `PNCP` เป็น alias ของเจ้า วันหลังใครกรอกชื่อนำสินค้าลงช่องเจ้าอีกก็จะกลายเป็น "เจ้า" ที่ถูกต้องขึ้นมาเงียบ ๆ
   - ⚠️ ต้องยืนยันก่อน: `[5327] DILUECA` ล็อตนั้น**ซื้อจาก NUT จริงไหม** (คุณบอกว่า "โดยมาก" ไม่ใช่ "ทุกตัว") ถ้าใช่ผมแก้ให้ ถ้าไม่แน่ใจ ปล่อยไว้ก่อนได้ ไม่กระทบอะไร
2. **`DKSH TSM TMP`** — ยังไม่รู้ว่า TMP ย่อจากอะไร (คุณก็ยังไม่ทราบ) — **คงโค้ด `TMP` ไว้ตามชื่อดิบ** ใช้งานได้ปกติ ไว้เจอบิลจริงค่อยเติมชื่อเต็มทีหลัง
3. ~~Abbott / Reckitt / Takeda / MONTANA-FUTURO+NEXCARE / OREX-NEOPLAST~~ **ตอบแล้ว 17 ก.ค. 2026: แยกทั้งหมด** (สะท้อนในตารางแล้ว)

## ถ้าตารางนี้โอเค ขั้นต่อไปที่เสนอ

1. สร้าง collection `suppliers` — doc id = โค้ด, fields `{ code, name, aliases[], nonVat? }` (เขียนครั้งเดียวจากตารางนี้)
2. `normalizeSupplierName(raw)` ใช้ร่วมกัน — ProOrder/LINE MAN แปลงชื่อดิบ → โค้ด ตอน**อ่าน** (ยังไม่ต้องแตะ data เดิม)
3. `suppliersFromCompanyPrices` ให้คืนโค้ดแทนชื่อดิบ + datalist ใน LINE MAN ดึงจาก collection แทนการรวบชื่อจาก master
4. ค่อยตัดสินใจทีหลังว่าจะ migrate คีย์ `prices` ของเดิมไหม (**ไม่จำเป็นต้องทำ** ถ้า normalize ตอนอ่าน — และเสี่ยงน้อยกว่ามาก)
