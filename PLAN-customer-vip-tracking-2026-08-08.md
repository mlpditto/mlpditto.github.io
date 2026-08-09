# PLAN — จัดอันดับลูกค้ากำลังซื้อสูง (VIP Ranking) สะสมข้ามเดือน + เผื่อทางไปหน้าโปรไฟล์ลูกค้า

> วางแผนที่บ้าน 2026-08-08 · ไฟล์: `public/Sales Analytics.html` (ปัจจุบัน V136.25 Dedup Fix)
> โจทย์ต้นทาง: "วางแผนพัฒนา ให้คล้าย LINE MAN เน้น track user ที่มีกำลังซื้อสูง"
> ตีความยืนยันกับผู้ใช้แล้ว: (1) เอาทั้ง "ระบบจัดอันดับ" (v1) และ "หน้าโปรไฟล์ลูกค้ารายตัว" (v2, ยังไม่ลงรายละเอียดระดับ implement) (2) ข้อมูลต้องสะสม**ข้ามเดือน** ไม่ใช่แค่วันที่โหลดอยู่ปัจจุบัน
> เกี่ยวข้อง: [[fkb-lineman-month-docs]] (ต้นแบบ pattern สะสมข้ามเดือนที่ LINE MAN mgr ใช้จริง) · [[fkb-master-merge-dedup]] (ปัญหาคลาสเดียวกันเรื่อง merge ชื่อซ้ำ) · แผนคู่ขนาน [PLAN-sales-analytics-profit-gpm-2026-08-08.md](PLAN-sales-analytics-profit-gpm-2026-08-08.md) (รอไฟล์ตัวอย่างอยู่ ยังไม่ได้ลงมือ — แผนนี้แก้คนละจุดในไฟล์เดียวกัน ความเสี่ยงชนกันต่ำ แต่ถ้าแพตช์นั้นลงก่อน ต้องเช็ก anchor ซ้ำเพราะโครงสร้าง HTML จะขยับ)

---

## 0. ข้อเท็จจริงสำคัญที่เจอตอนสำรวจโค้ด (อ่านก่อนตัดสินใจ)

**หน้านี้ไม่เคยรวมข้อมูลข้ามวันมาก่อนเลย** — ต่างจากที่คิดไว้ตอนแรกว่ามี "Trend chart" ให้ต่อยอดได้:
- `retailChart` / `wholesaleChart` (บรรทัด ~2042-2095) ชื่อฟังดูเหมือนกราฟแนวโน้มข้ามเวลา แต่จริงๆ วาดจาก **`allData` ของวันเดียวที่โหลดอยู่** แกน X คือเลขท้าย orderId ไม่ใช่วันที่ — ไม่ใช่ของที่เอามาต่อยอดตรงๆ ได้
- โครงสร้าง Firestore คือ **1 doc ต่อ 1 วัน** (`sales_analytics/{YYYY-MM-DD}` เก็บ `records: allData` ทั้งก้อน) ต่างจาก LINE MAN ที่เป็น 1 doc ต่อเดือน — ถ้าจะสะสมข้ามเดือนจริง ต้องดึงหลายสิบ-หลายร้อย doc ต่อ 1 ครั้งที่ผู้ใช้กด (ไม่ใช่ดึงแค่ไม่กี่ doc แบบ LINE MAN)
- ดังนั้นฟีเจอร์นี้ **ต้องสร้าง infra การดึง+รวมข้อมูลหลายวันใหม่ทั้งหมด** (ไม่มีของเดิมให้ต่อ) — เป็นงานใหญ่กว่าที่ชื่อ "จัดอันดับลูกค้า" ฟังดูตรงๆ

**แท็บ "ลูกค้า" ปัจจุบันเป็นแค่ตาราง filter บิลดิบ** (บรรทัด 789-899, ฟังก์ชัน `filterCustomers`/`renderCustomerResults` บรรทัด ~2380-2470) — ไม่มีการรวมยอดต่อ 1 ชื่อลูกค้าเลยสักจุด ต้องสร้างชั้นรวมยอด (aggregation) ใหม่ทั้งหมด

**`customerName` เป็น free text พาร์สจากใบเสร็จ** ไม่มีเบอร์โทร ไม่มี customer ID ถาวร → คนเดียวกันสะกดคนละแบบ = นับแยกกัน (ปัญหาคลาสเดียวกับ [[fkb-master-merge-dedup]]) — **ไม่แก้ในแผนนี้** แค่บันทึกเป็นข้อจำกัดที่รู้ตัว (ดู §7)

---

## 1. ขอบเขต (Scope)

**v1 (แผนนี้ลงรายละเอียดถึงระดับ implement):**
1. เพิ่มแผง "🏆 อันดับลูกค้ากำลังซื้อสูง" ในแท็บ "ลูกค้า" (view-customer) — เลือกช่วงวันที่ (ค่าเริ่มต้นย้อนหลัง 90 วัน) → กดดึงข้อมูล → รวมยอดต่อ 1 ชื่อลูกค้าข้ามทุกวันในช่วงนั้น → จัดอันดับตามยอดสะสม
2. ติด badge 👑 VIP ให้คนที่ยอดสะสมเกิน threshold ที่ตั้งได้ (ค่าเริ่มต้น 5,000 บาท)
3. คลิกชื่อในตารางอันดับ → กรองตารางบิลดิบด้านล่าง (ของเดิม) ให้โชว์เฉพาะบิลของคนนั้นในช่วงที่ดึงมา (integration ราคาถูก ใช้ของเดิมที่มีอยู่แล้ว)

**v2 (บันทึกไว้เป็นทิศทาง ยังไม่ลง anchor/โค้ดในแผนนี้ — รอ v1 พิสูจน์ว่าคุณภาพข้อมูล/ความแม่นยำการจับคู่ชื่อใช้ได้จริงก่อน):**
- หน้า/modal โปรไฟล์ลูกค้ารายตัว: ประวัติการซื้อทั้งหมด, กราฟยอดซื้อรายเดือน, โน้ต
- ถ้าปัญหาชื่อซ้ำ/สะกดต่างกันกวนอันดับมากจนใช้จริงไม่ได้ → ค่อยพิจารณาระบบ alias mapping แบบ [[cknc-master-mapping]] (collection แยกไว้ผูกชื่อ mือ)
- ถ้าอยากได้เบอร์โทรเพื่อ match แม่นขึ้น → ต้องเพิ่มช่อง capture ตอน parse (งานแยกอีกก้อน ไม่ใช่แค่ UI)

---

## 2. หลักการ (กันของเดิมพัง)

- **ไม่แตะ `processData`/`parseAndImportCSV`/`filterCustomers`/`renderCustomerResults` เดิมเลย** — ฟีเจอร์นี้เป็นชั้นแยกที่ดึงข้อมูลเองจาก Firestore ไม่ได้ต่อจาก `allData` ที่มีอยู่ (เพราะ `allData` มีแค่วันเดียว)
- ตัวแปร/ฟังก์ชันใหม่ทั้งหมดตั้งชื่อขึ้นต้น `vip` หรือ `customerRange` ให้แยกชัดจากของเดิม
- **Cache ใน memory ระดับ session เท่านั้น** (ไม่ persist) มิรเรอร์ pattern `histStatsCache` ของ LINE MAN ([[fkb-lineman-month-docs]]) — ดึง doc รายวันแล้วเก็บผล aggregate ไว้ ถ้าผู้ใช้ปรับช่วงวันที่ซ้อนทับของเดิม ไม่ต้องดึงซ้ำ
- **เตือนจำนวน read ก่อนดึงเสมอ** ถ้าช่วงกว้าง (เช่น >60 วัน) เพราะ Firestore คิดเงินต่อ read และ 1 วัน = 1 read ที่นี่ (ต่างจาก LINE MAN ที่ 1 เดือน = 1 read) — ถ้าไม่เตือน ผู้ใช้กดเผลอเลือกช่วง 1 ปีจะยิง 365 reads โดยไม่รู้ตัว

---

## 3. Const ใหม่

**anchor:** ใกล้ `maskCustomerName` (บรรทัด 1162) เพิ่มก่อนหน้า:
```javascript
const VIP_DEFAULT_LOOKBACK_DAYS = 90;
const VIP_SPEND_THRESHOLD = 5000; // บาท สะสมในช่วงที่เลือก → ติด badge VIP
const VIP_MIN_ORDER_COUNT = 1;    // กันชื่อเดียวโผล่ครั้งเดียวยอดสูงลิ่วจากบิลพิเศษ (ปรับเป็น 2 ได้ถ้าอยากเข้มกว่านี้)
const VIP_EXCLUDED_NAMES = ['-', '', 'ลูกค้าทั่วไป', 'ทั่วไป']; // ชื่อ generic ที่ไม่ควรถูกนับเป็น "ลูกค้า" รายตัว
let vipDayCache = {}; // key = docId (YYYY-MM-DD) → array ของ {customerName, amountVal, saleType, date, orderId} เฉพาะ field ที่ต้องใช้ (กัน memory บวม)
```

---

## 4. HTML — แผงอันดับ VIP ในแท็บลูกค้า

**anchor:** แทรกก่อนการ์ด filter เดิม (ก่อนบรรทัด 789-793 `<div id="view-customer" ...> <div class="bg-white ... animate-slide-up"> <h4>ตัวกรองข้อมูลลูกค้า`) — ใส่เป็นการ์ดแยกอันใหม่คั่นกลาง:

```html
<div id="vipRankingCard"
    class="bg-white dark:bg-dark-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 animate-slide-up">
    <div class="flex justify-between items-center mb-4 flex-wrap gap-3">
        <h4 class="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
            <i class="ph-fill ph-trophy text-yellow-500"></i> อันดับลูกค้ากำลังซื้อสูง (สะสมข้ามวัน)
        </h4>
        <div class="flex items-center gap-2 flex-wrap">
            <input type="date" id="vip-start-date" class="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 dark:text-white outline-none">
            <span class="text-xs text-slate-400">ถึง</span>
            <input type="date" id="vip-end-date" class="text-xs border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1.5 bg-white dark:bg-slate-900 dark:text-white outline-none">
            <button onclick="loadVipRanking()" id="btnLoadVip"
                class="bg-brand-600 hover:bg-brand-700 text-white font-medium py-1.5 px-4 rounded-lg text-xs transition-all flex items-center gap-1.5 shadow-sm">
                <i class="ph-bold ph-magnifying-glass"></i> ดึงข้อมูล
            </button>
        </div>
    </div>
    <div id="vipRangeInfo" class="text-xs text-slate-400 mb-3"></div>
    <div class="overflow-x-auto max-h-[400px] custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl">
        <table class="w-full text-sm text-left whitespace-nowrap text-slate-600 dark:text-slate-300">
            <thead class="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0 z-10">
                <tr>
                    <th class="px-4 py-2 text-center w-[50px]">#</th>
                    <th class="px-4 py-2">ชื่อลูกค้า</th>
                    <th class="px-4 py-2 text-right">ยอดสะสม</th>
                    <th class="px-4 py-2 text-center">จำนวนบิล</th>
                    <th class="px-4 py-2 text-right">เฉลี่ย/บิล</th>
                    <th class="px-4 py-2 text-center">ล่าสุด</th>
                </tr>
            </thead>
            <tbody id="vipTableBody" class="divide-y divide-slate-50 dark:divide-slate-700 bg-white dark:bg-dark-800">
                <tr><td colspan="6" class="text-center py-8 text-slate-400">เลือกช่วงวันที่แล้วกด "ดึงข้อมูล"</td></tr>
            </tbody>
        </table>
    </div>
</div>
```
> ปุ่ม "ดึงข้อมูล" ไม่ auto-run ตอนเปิดแท็บ (ต่างจาก `filterCustomers()` เดิมที่ auto-load) — เพราะการดึงหลาย doc มีต้นทุน (read count) ต้องให้ผู้ใช้กดเองทุกครั้งที่อยากรีเฟรชช่วงใหม่

---

## 5. JS — ตั้งค่าเริ่มต้นวันที่ (ตอนสลับไปแท็บลูกค้า)

**anchor:** ใน `switchMainTab` บล็อก `else if (tab === 'customer') { ... filterCustomers(); }` (บรรทัด 1392-1395) เพิ่มต่อท้าย:
```javascript
if (!document.getElementById('vip-start-date').value) {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - VIP_DEFAULT_LOOKBACK_DAYS);
    document.getElementById('vip-end-date').value = end.toISOString().slice(0, 10);
    document.getElementById('vip-start-date').value = start.toISOString().slice(0, 10);
}
```
> ตั้งแค่ครั้งแรกที่เข้าแท็บ (เช็ค `.value` ว่างก่อน) ไม่ทับค่าที่ผู้ใช้ปรับเองไว้แล้วตอนกลับมาแท็บซ้ำ

---

## 6. JS — ดึงหลายวัน + cache + รวมยอด (ฟังก์ชันใหม่ทั้งชุด)

**anchor:** วางท้ายบล็อก Firebase Cloud Functions เดิม (หลัง `loadCloudData` บรรทัด ~1290 ก่อนฟังก์ชันถัดไป)

```javascript
// --- VIP CUSTOMER RANKING (สะสมข้ามวัน) ---
function dateRangeToDocIds(startStr, endStr) {
    const ids = [];
    let cur = new Date(startStr);
    const end = new Date(endStr);
    while (cur <= end) {
        ids.push(cur.toISOString().slice(0, 10)); // ตรงกับ formatDateForDoc() (YYYY-MM-DD) เพราะ docId ไม่ใช้ พ.ศ.
        cur.setDate(cur.getDate() + 1);
    }
    return ids;
}

async function loadVipRanking() {
    const startStr = document.getElementById('vip-start-date').value;
    const endStr = document.getElementById('vip-end-date').value;
    if (!startStr || !endStr || startStr > endStr) {
        showToast("เลือกช่วงวันที่ให้ถูกต้องก่อน", "error");
        return;
    }
    const docIds = dateRangeToDocIds(startStr, endStr);
    const toFetch = docIds.filter(id => !(id in vipDayCache));

    if (toFetch.length > 60) {
        const proceed = confirm(`ช่วงที่เลือกต้องดึงข้อมูล ${toFetch.length} วัน (${toFetch.length} reads) อาจใช้เวลาสักครู่ ดำเนินการต่อ?`);
        if (!proceed) return;
    }

    const btn = document.getElementById('btnLoadVip');
    btn.disabled = true;
    btn.innerHTML = '<i class="ph-bold ph-spinner animate-spin"></i> กำลังดึง...';
    document.getElementById('vipRangeInfo').innerText = `กำลังดึง ${toFetch.length} วัน (cache ไว้แล้ว ${docIds.length - toFetch.length} วัน)...`;

    try {
        await authReady;
        // ดึงทีละ doc (Firestore JS SDK ไม่มี "IN" query เกิน 30 ค่า และ doc อาจไม่ครบทุกวัน) — ยอมรับ N reads ตามช่วงที่เลือก
        for (const docId of toFetch) {
            try {
                const doc = await window.db.collection('sales_analytics').doc(docId).get();
                const records = doc.exists ? (doc.data().records || []) : [];
                // เก็บเฉพาะ field ที่ต้องใช้ กัน memory/ขนาด cache บวมโดยไม่จำเป็น
                vipDayCache[docId] = records
                    .filter(r => !r.isExcluded)
                    .map(r => ({ customerName: r.customerName, amountVal: r.amountVal, saleType: r.saleType, date: r.date, orderId: r.orderId }));
            } catch (e) {
                console.error("VIP fetch error for " + docId, e);
                vipDayCache[docId] = []; // กันพลาดวันเดียวแล้วล้มทั้งช่วง
            }
        }

        const rangeRecords = docIds.flatMap(id => vipDayCache[id] || []);
        const ranking = aggregateVipCustomers(rangeRecords);
        renderVipRanking(ranking, rangeRecords.length, docIds.length);
    } catch (e) {
        showToast("ดึงข้อมูลไม่สำเร็จ: " + e.message, "error");
        console.error(e);
    } finally {
        btn.disabled = false;
        btn.innerHTML = '<i class="ph-bold ph-magnifying-glass"></i> ดึงข้อมูล';
    }
}

function aggregateVipCustomers(records) {
    const map = new Map();
    records.forEach(r => {
        const name = (r.customerName || '').trim();
        if (VIP_EXCLUDED_NAMES.includes(name)) return;
        if (!map.has(name)) map.set(name, { name, total: 0, count: 0, lastDate: r.date });
        const c = map.get(name);
        c.total += r.amountVal;
        c.count += 1;
        if (new Date(r.date.split('/').reverse().join('-')) > new Date(c.lastDate.split('/').reverse().join('-'))) {
            c.lastDate = r.date;
        }
    });
    return [...map.values()]
        .filter(c => c.count >= VIP_MIN_ORDER_COUNT)
        .sort((a, b) => b.total - a.total);
}

function renderVipRanking(ranking, recordCount, dayCount) {
    document.getElementById('vipRangeInfo').innerText =
        `รวม ${recordCount} บิล จาก ${dayCount} วัน → พบลูกค้า ${ranking.length} ราย (ไม่รวมชื่อทั่วไป/ว่าง)`;

    const tbody = document.getElementById('vipTableBody');
    if (ranking.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">ไม่พบข้อมูลในช่วงนี้</td></tr>`;
        return;
    }
    tbody.innerHTML = ranking.map((c, i) => {
        const isVip = c.total >= VIP_SPEND_THRESHOLD;
        const displayName = isPrivacyMode ? maskCustomerName(c.name) : c.name;
        return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer" onclick="filterCustomerTableByName('${c.name.replace(/'/g, "\\'")}')">
            <td class="px-4 py-2 text-center text-slate-400 text-xs font-mono">${i + 1}</td>
            <td class="px-4 py-2 text-sm dark:text-slate-300 flex items-center gap-1.5">
                ${isVip ? '<span title="VIP: ยอดสะสมเกิน ' + VIP_SPEND_THRESHOLD.toLocaleString() + ' บาท">👑</span>' : ''}
                ${displayName}
            </td>
            <td class="px-4 py-2 text-right font-bold text-slate-700 dark:text-slate-200 text-sm">${isPrivacyMode ? '•••' : c.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
            <td class="px-4 py-2 text-center text-xs">${c.count}</td>
            <td class="px-4 py-2 text-right text-xs text-slate-500">${isPrivacyMode ? '•••' : (c.total / c.count).toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
            <td class="px-4 py-2 text-center text-xs text-slate-400">${c.lastDate}</td>
        </tr>`;
    }).join('');
}

function filterCustomerTableByName(name) {
    // integration ราคาถูก: ใช้ตัวกรองบิลดิบเดิมที่มีอยู่แล้ว แทนที่จะสร้างตารางใหม่ซ้ำ
    showToast(`กรองบิลของ "${name}" ในตารางด้านล่าง — ปรับ/เคลียร์ตัวกรองอื่นได้ตามปกติ`);
    // v1: เลื่อนจอไปตารางเดิมให้ผู้ใช้ไล่ดูเอง (ตารางเดิมไม่มีช่องค้นชื่อ ต้องเพิ่มถ้าจะกรองอัตโนมัติจริง — ดู §8 known gap)
    document.getElementById('customerTableBody').scrollIntoView({ behavior: 'smooth', block: 'center' });
}
```

---

## 7. ข้อควรระวัง / ข้อจำกัดที่รู้ตัว

- **ชื่อซ้ำ/สะกดต่างกัน = คนละคนในระบบ** (`"คุณสมชาย"` vs `"สมชาย ใจดี"` vs `"สมชาย"`) — v1 ไม่แก้ปัญหานี้ ใช้ exact string match ล้วนๆ ผลอันดับจะ**ประเมินยอดจริงต่ำกว่าความเป็นจริง**สำหรับคนที่พนักงานพิมพ์ชื่อไม่สม่ำเสมอ ต้องบอกผู้ใช้ตอนส่งมอบว่านี่คือข้อจำกัด ไม่ใช่บั๊ก
- **ลูกค้าขายปลีก walk-in ส่วนใหญ่ไม่มีชื่อ/ชื่อ generic** → ตารางอันดับที่ได้จะเอนไปทาง**ลูกค้าขายส่ง/เครดิต**เป็นหลัก (ซึ่งจริงๆ ตรงกับ "กำลังซื้อสูง" อยู่แล้ว แต่ต้องรู้ตัวว่าไม่ใช่ภาพรวมลูกค้าทั้งหมด)
- **ต้นทุน Firestore read**: 1 วัน = 1 read ไม่เหมือน LINE MAN ที่ 1 เดือน = 1 read — ช่วงกว้างมาก (เช่นเลือกทั้งปี) จะมี prompt เตือนแต่ยังกดต่อได้ ถ้าใช้บ่อยควรพิจารณาจำกัด lookback สูงสุดหรือทำ pagination
- **Cache อยู่แค่ session เดียว** (ตัวแปร JS ธรรมดา ไม่ได้เก็บ localStorage) — reload หน้าแล้วต้องดึงใหม่ทั้งหมด เป็นการตัดสินใจแบบง่ายสำหรับ v1 ยอมรับได้เพราะฟีเจอร์นี้ไม่ใช่ทางเข้าข้อมูลหลัก
- **`filterCustomerTableByName` ยังไม่กรองอัตโนมัติจริง** (ตารางบิลดิบเดิมไม่มีช่อง search ชื่อลูกค้าให้ผูกต่อ) — v1 แค่เลื่อนจอไปให้ดู ถ้าต้องการกรองจริงต้องเพิ่มช่องค้นหาในแท็บลูกค้าเดิมด้วย (งานเพิ่มเล็กน้อย นอกขอบเขต anchor ที่ระบุไว้ในแผนนี้ — ทำได้เป็น follow-up)
- **Privacy mode**: ชื่อ mask ด้วย `maskCustomerName` เดิม, ยอดเงินซ่อนเป็น `•••` เหมือนจุดอื่นในหน้านี้
- ฟีเจอร์นี้เป็น **read-only ล้วน** ไม่มีการเขียนกลับ Firestore ไม่กระทบข้อมูลเดิมแม้แต่จุดเดียว ความเสี่ยงต่ำกว่าแผน GPM ที่รออยู่

## 8. Verify ที่บ้าน

1. เข้าแท็บ "ลูกค้า" ครั้งแรก → ช่องวันที่ auto-fill ย้อนหลัง 90 วันถึงวันนี้
2. กด "ดึงข้อมูล" (ช่วงสั้นๆ ก่อน เช่น 7 วันที่มีข้อมูลจริงบน cloud) → เห็นตารางอันดับ + จำนวนบิล/วันที่ดึงถูกต้อง
3. ลองปรับช่วงวันที่ให้ทับซ้อนของเดิมบางส่วน → กดดึงซ้ำ → เช็คว่าดึงเฉพาะวันใหม่ (ดูจาก `vipRangeInfo` หรือ console log เวลา fetch)
4. ลองเลือกช่วง >60 วัน → เช็คว่า prompt เตือนจำนวน read ก่อนดึงจริง
5. เปิด privacy mode → ชื่อ/ยอดในตารางอันดับซ่อนถูกต้อง
6. เช็คคนที่ยอดสะสม ≥ 5,000 บาท มี badge 👑 ครบ, คนต่ำกว่าไม่มี
7. คลิกแถวลูกค้า → เลื่อนจอไปตารางบิลดิบด้านล่าง (ยังไม่กรองอัตโนมัติ ตามที่ระบุใน §7)
8. ลองช่วงวันที่ไม่มีข้อมูลเลย (เช่นวันที่ยังไม่เคยบันทึกขึ้น cloud) → ต้องไม่ error, โชว์ "ไม่พบข้อมูลในช่วงนี้"
9. Dark mode + มือถือ 375px: การ์ดอันดับไม่ล้น, input วันที่ใช้งานได้ปกติ
10. Reload หน้าเปล่าๆ แล้วเข้าแท็บลูกค้าอีกครั้ง → cache หายตามคาด ต้องกดดึงใหม่ (พฤติกรรมที่ตั้งใจ ไม่ใช่บั๊ก)

## 9. เช็คก่อนเริ่ม

- [ ] อยู่บนไฟล์จริงที่บ้าน (`D:\20_Code`) ไม่ใช่ OneDrive
- [ ] ยึด **anchor string** ไม่ใช่เลขบรรทัด — ถ้าแพตช์ GPM (แผนคู่ขนาน) ลงไปก่อนแล้ว เลขบรรทัดในแผนนี้จะคลาดทั้งหมด ต้องหา anchor ใหม่จากข้อความ
- [ ] มีข้อมูลจริงบน cloud (`sales_analytics` collection) ให้ทดสอบ — ถ้าข้อมูลน้อย ให้ paste/import วันย้อนหลังเพิ่มก่อนเพื่อมี range ทดสอบจริง
- [ ] backup ไฟล์เดิมก่อนแก้
- [ ] deploy ตาม workflow ปกติ (bump `?v=`, firebase deploy) — push เฉพาะ "Go Online" (ดู [[cknc-workflow]])
