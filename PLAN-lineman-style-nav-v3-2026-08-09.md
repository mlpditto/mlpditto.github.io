# PLAN — v3: ปรับ UX แผง VIP + Modal โปรไฟล์ ให้คล้าย LINE MAN (เดือน/วันเป็นปุ่มกด)

> วางแผน 2026-08-09 · ไฟล์: `public/Sales Analytics.html` (ปัจจุบัน V136.27 "Customer Profile", live แล้ว)
> ต่อยอดจาก [[sales-analytics-vip-customer-plan]] — feedback จากผู้ใช้: "ยังไม่คล้าย LINE MAN เช่น กดดูวันที่/เดือน" (อ้างอิงหน้าจอ LINE MAN Sales Recorder ที่มีปุ่มเดือน "‹ สิงหาคม 2569 ›" + แท็บวันเป็นปุ่ม "ทั้งหมด, 07/08/26, 06/08/26...")
> ยืนยันขอบเขตแล้ว: ใช้ pattern นี้ **ทั้ง 2 จุด** — (1) แผง VIP หลัก (2) modal โปรไฟล์ลูกค้า

## 1. หลักการออกแบบ (ต่างจาก LINE MAN ตรงไหน ทำไม)

LINE MAN เก็บ **1 doc ต่อเดือน** → "เลือกเดือน" = โหลด 1 doc พอ ส่วน Sales Analytics เก็บ **1 doc ต่อวัน** → "เลือกเดือน" ต้องดึง ~28-31 doc — ยังทำได้ปกติ (อยู่ในช่วงที่ไม่ต้องเตือน >60 วัน) แต่**ไม่เหมือนกันเป๊ะ** จึงปรับ pattern LINE MAN ให้เข้ากับสถาปัตยกรรมนี้:

- **แผง VIP หลัก**: จุดประสงค์คือ "สะสมข้ามเดือน" (ตามโจทย์ต้นทาง) เดือนเดียวไม่พอ → ใช้ **ปุ่มความยาวช่วง (1/3/6/12 เดือน) + ปุ่มเลื่อนเดือนสิ้นสุด** แทนเดือนเดียวแบบ LINE MAN ตรงๆ (ยังคงคอนเซปต์ "กดปุ่ม ไม่ต้องพิมพ์วันที่" ที่ผู้ใช้ต้องการ)
- **Modal โปรไฟล์ลูกค้า**: จุดประสงค์คือ "ไล่ดูประวัติบิล" ตรงกับ LINE MAN เป๊ะ → ใช้ **เดือน + วันเป็นปุ่ม** เหมือนต้นแบบ แต่เดือน/วันที่โชว์เป็นปุ่มมาจาก**เดือน/วันที่ลูกค้าคนนั้นมีบิลจริงเท่านั้น** (ไม่ใช่ทุกเดือนปฏิทิน กันปุ่มเดือนว่างเปล่า)

## 2. หลักการทั่วไป (กันของเดิมพัง)

- ลบ `<input type="date">` ทั้งคู่ในแผง VIP ทิ้ง — แทนด้วยปุ่ม เก็บ state เป็นตัวแปรแทน
- `loadVipRanking` เปลี่ยนจากอ่าน input เป็นรับ `(startStr, endStr)` เป็นพารามิเตอร์ — logic ภายใน (fetch loop, cache, confirm >60 วัน) **ไม่แตะ**
- `aggregateVipCustomers`, `renderVipRanking` row จัดอันดับ, `openCustomerProfileModal` การคำนวณสรุป/กราฟ **ไม่แตะ** — แค่เพิ่มชั้นกรอง/นำทางใหม่คลุมด้านบน
- Modal เก็บ order เต็มไว้ที่ตัวแปร `cpmAllOrders` แยกจากที่ filter โชว์ กันต้องคำนวณสรุป/กราฟใหม่ทุกครั้งที่กดปุ่มวัน (กราฟยังคงโชว์ทุกเดือนในช่วงเหมือนเดิม ไม่ผูกกับปุ่มวันที่เลือก — ใช้เป็นภาพรวม ส่วนตารางข้างล่างเป็นตัวไล่ดูละเอียด)

---

## 3. แผง VIP หลัก — HTML (แทนที่ input วันที่)

**anchor:** แทนที่ทั้งบล็อกนี้ (บรรทัด 796-805):
```html
<!-- เดิม -->
<input type="date" id="vip-start-date" ...>
<span class="text-xs text-slate-400">ถึง</span>
<input type="date" id="vip-end-date" ...>
<button onclick="loadVipRanking()" id="btnLoadVip" ...>ดึงข้อมูล</button>
```
```html
<!-- v3 -->
<div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg px-1">
    <button onclick="shiftVipMonth(-1)" class="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"><i class="ph-bold ph-caret-left"></i></button>
    <span id="vip-month-label" class="text-xs font-bold text-slate-700 dark:text-slate-200 px-1 min-w-[110px] text-center">-</span>
    <button onclick="shiftVipMonth(1)" id="vip-month-next" class="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-30 disabled:cursor-not-allowed"><i class="ph-bold ph-caret-right"></i></button>
</div>
<div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-full p-0.5 text-[11px] font-bold">
    <button onclick="setVipPeriod(1)" id="vip-period-1" class="px-2.5 py-1 rounded-full transition-all">1 เดือน</button>
    <button onclick="setVipPeriod(3)" id="vip-period-3" class="px-2.5 py-1 rounded-full transition-all">3 เดือน</button>
    <button onclick="setVipPeriod(6)" id="vip-period-6" class="px-2.5 py-1 rounded-full transition-all">6 เดือน</button>
    <button onclick="setVipPeriod(12)" id="vip-period-12" class="px-2.5 py-1 rounded-full transition-all">12 เดือน</button>
</div>
```
> ปุ่มเดือนถัดไป (`vip-month-next`) ต้อง `disabled` เมื่ออยู่ที่เดือนปัจจุบันแล้ว (กันเลื่อนไปอนาคตที่ไม่มีข้อมูล) — ปุ่มก่อนหน้าไม่ต้อง disable (ข้อมูลเก่าแค่จะว่างเฉยๆ ไม่ error)
> ไม่มีปุ่ม "ดึงข้อมูล" แยกแล้ว — เลือกปุ่มไหนก็ fetch+render ทันที (ตรงคอนเซ็ปต์ LINE MAN "กดแล้วจบ")

## 4. แผง VIP หลัก — Const/State ใหม่

**anchor:** ใกล้ `let vipDayCache = {};` (บรรทัด ~1141) เพิ่มต่อท้าย:
```javascript
let vipEndMonth = null;      // 'YYYY-MM' เดือนสิ้นสุดของช่วงที่ดู (ค่าเริ่มต้น = เดือนปัจจุบัน)
let vipPeriodMonths = 3;     // 1 | 3 | 6 | 12 — ความยาวช่วงที่เลือก (ปุ่ม active)
const THAI_MONTHS = ['มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน', 'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'];
```

## 5. แผง VIP หลัก — JS นำทางเดือน/ช่วง (แทนที่ `loadVipRanking` เดิมบางส่วน)

**anchor:** แก้ `loadVipRanking()` (บรรทัด 1347) — **เปลี่ยน signature รับพารามิเตอร์แทนอ่าน input**, เนื้อในเหมือนเดิมทุกจุด:
```javascript
// เดิม:
// async function loadVipRanking() {
//     const startStr = document.getElementById('vip-start-date').value;
//     const endStr = document.getElementById('vip-end-date').value;
//     if (!startStr || !endStr || startStr > endStr) { ... }

// v3:
async function loadVipRanking(startStr, endStr) {
    if (!startStr || !endStr || startStr > endStr) {
        showToast("ช่วงวันที่ไม่ถูกต้อง", "error");
        return;
    }
```
> ท้ายฟังก์ชัน (finally block เดิม) เปลี่ยนจาก enable/reset ปุ่ม `btnLoadVip` (ไม่มีแล้ว) เป็น enable ปุ่มเดือน/ช่วงกลับ (ดู §7)

**anchor:** วางฟังก์ชันใหม่ต่อจาก `dateRangeToDocIds` (บรรทัด 1345, ก่อน `loadVipRanking`):
```javascript
function monthLabel(monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    return `${THAI_MONTHS[m - 1]} ${y}`;
}

function getVipMonthRange(endMonthStr, months) {
    const [ey, em] = endMonthStr.split('-').map(Number);
    const endDate = new Date(ey, em, 0); // วันสุดท้ายของเดือนสิ้นสุด
    const startDate = new Date(ey, em - months, 1); // วันแรกของเดือนเริ่ม
    const fmt = (d) => d.toISOString().slice(0, 10);
    return { start: fmt(startDate), end: fmt(endDate) };
}

function currentMonthStr() {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function updateVipPeriodButtons() {
    [1, 3, 6, 12].forEach(m => {
        const btn = document.getElementById('vip-period-' + m);
        btn.className = 'px-2.5 py-1 rounded-full transition-all' + (m === vipPeriodMonths ? ' bg-white dark:bg-slate-700 shadow-sm text-brand-600' : ' text-slate-400');
    });
}

function shiftVipMonth(delta) {
    const [y, m] = vipEndMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (next > currentMonthStr()) return; // กันเลื่อนไปอนาคต
    vipEndMonth = next;
    refreshVipPanel();
}

function setVipPeriod(months) {
    vipPeriodMonths = months;
    updateVipPeriodButtons();
    refreshVipPanel();
}

async function refreshVipPanel() {
    document.getElementById('vip-month-label').innerText = monthLabel(vipEndMonth);
    document.getElementById('vip-month-next').disabled = (vipEndMonth >= currentMonthStr());
    const { start, end } = getVipMonthRange(vipEndMonth, vipPeriodMonths);
    await loadVipRanking(start, end);
}
```
> `refreshVipPanel` คือจุดเดียวที่เรียก `loadVipRanking` แล้ว (แทนปุ่ม "ดึงข้อมูล" เดิม) — เก็บ `start`/`end` ไว้ใช้ต่อใน modal โปรไฟล์ (§8) ผ่านตัวแปร module-level ใหม่ `vipLastFetchStart`/`vipLastFetchEnd` ตั้งค่าตอนต้น `refreshVipPanel`

## 6. แผง VIP หลัก — เก็บช่วงล่าสุดไว้ให้ modal ใช้

**anchor:** เพิ่มใน §4 const block ต่อจาก `vipPeriodMonths`:
```javascript
let vipLastFetchStart = null, vipLastFetchEnd = null; // เก็บช่วงที่ fetch ล่าสุด ไว้ให้ modal โปรไฟล์อ้างอิง label
```
**anchor:** ใน `refreshVipPanel()` (§5) เพิ่มก่อนเรียก `loadVipRanking`:
```javascript
vipLastFetchStart = start; vipLastFetchEnd = end;
```

## 7. แผง VIP หลัก — ปุ่ม loading state (แทนปุ่ม "ดึงข้อมูล" เดิม)

**anchor:** ใน `loadVipRanking()` ส่วน loading (บรรทัดเดิมที่ปิด/เปิดปุ่ม `btnLoadVip`) เปลี่ยนเป็น disable ปุ่มเดือน/ช่วงระหว่างโหลด:
```javascript
// เดิม: btn.disabled = true; btn.innerHTML = '...กำลังดึง...'
// v3:
['vip-period-1', 'vip-period-3', 'vip-period-6', 'vip-period-12'].forEach(id => document.getElementById(id).disabled = true);
document.getElementById('vip-month-label').innerText = 'กำลังโหลด...';
// ...
// ใน finally:
['vip-period-1', 'vip-period-3', 'vip-period-6', 'vip-period-12'].forEach(id => document.getElementById(id).disabled = false);
document.getElementById('vip-month-label').innerText = monthLabel(vipEndMonth);
```

## 8. แผง VIP หลัก — เริ่มต้นตอนเข้าแท็บลูกค้าครั้งแรก

**anchor:** ใน `switchMainTab` บล็อก `else if (tab === 'customer')` (บรรทัด ~1627) แทนที่โค้ด set `vip-start-date`/`vip-end-date` เดิมทั้งหมด:
```javascript
// เดิม: if (!document.getElementById('vip-start-date').value) { ... set input values ... }
// v3:
if (!vipEndMonth) {
    vipEndMonth = currentMonthStr();
    updateVipPeriodButtons();
    refreshVipPanel();
}
```

---

## 9. Modal โปรไฟล์ลูกค้า — HTML (เพิ่มเดือน/วันเป็นปุ่มเหนือประวัติบิล)

**anchor:** แทนที่หัวข้อ `<h4>ประวัติบิล</h4>` เดิม (ในโมดัล):
```html
<!-- เดิม -->
<h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">ประวัติบิล</h4>
```
```html
<!-- v3 -->
<div class="flex items-center justify-between mb-2">
    <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">ประวัติบิล</h4>
    <div class="flex items-center gap-1 text-xs">
        <button onclick="cpmShiftMonth(-1)" id="cpm-month-prev" class="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-20 disabled:cursor-not-allowed"><i class="ph-bold ph-caret-left"></i></button>
        <span id="cpm-month-label" class="font-bold text-slate-600 dark:text-slate-300 px-1 min-w-[90px] text-center">-</span>
        <button onclick="cpmShiftMonth(1)" id="cpm-month-next" class="p-1 text-slate-400 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-20 disabled:cursor-not-allowed"><i class="ph-bold ph-caret-right"></i></button>
    </div>
</div>
<div id="cpm-day-tabs" class="flex items-center gap-1.5 flex-wrap mb-3"></div>
```

## 10. Modal โปรไฟล์ลูกค้า — Const/State ใหม่

**anchor:** ใกล้ `let customerProfileChart = null;` เพิ่มต่อท้าย:
```javascript
let cpmAllOrders = [];       // order เต็มของลูกค้าที่เปิดอยู่ (ไม่ผ่านกรองเดือน/วัน)
let cpmMonths = [];          // เดือนที่ลูกค้าคนนี้มีบิลจริง เรียงเก่า→ใหม่ ['YYYY-MM', ...]
let cpmSelectedMonthIdx = -1; // index ใน cpmMonths ที่เลือกอยู่
let cpmSelectedDay = null;   // 'DD/MM/YYYY' ที่เลือก หรือ null = "ทั้งหมด" ของเดือนนั้น
```

## 11. Modal โปรไฟล์ลูกค้า — JS เดือน/วันเป็นปุ่ม

**anchor:** แก้ `openCustomerProfileModal(name)` — เพิ่มก่อนบรรทัด `renderCustomerProfileChart(orders); renderCustomerOrderList(orders);` (ลบสองบรรทัดนี้ทิ้ง แทนด้วย):
```javascript
cpmAllOrders = orders;
renderCustomerProfileChart(orders); // กราฟยังโชว์ทุกเดือนในช่วงเหมือนเดิม ไม่ผูกกับตัวกรองวัน

cpmMonths = [...new Set(orders.map(r => cpmMonthKey(r.date)))].sort();
cpmSelectedMonthIdx = cpmMonths.length - 1; // default = เดือนล่าสุดที่มีบิล
cpmSelectedDay = null;
renderCpmMonthNav();
renderCpmDayTabsAndOrders();
```

**anchor:** วางฟังก์ชันใหม่ต่อจาก `renderCustomerProfileChart` (ก่อน `renderCustomerOrderList`):
```javascript
function cpmMonthKey(dateStr) {
    const parts = dateStr.split('/'); // DD/MM/YYYY
    return `${parts[2]}-${parts[1].padStart(2, '0')}`;
}

function cpmShiftMonth(delta) {
    const next = cpmSelectedMonthIdx + delta;
    if (next < 0 || next >= cpmMonths.length) return;
    cpmSelectedMonthIdx = next;
    cpmSelectedDay = null;
    renderCpmMonthNav();
    renderCpmDayTabsAndOrders();
}

function cpmSelectDay(dateStr) {
    cpmSelectedDay = dateStr;
    renderCpmDayTabsAndOrders();
}

function renderCpmMonthNav() {
    const key = cpmMonths[cpmSelectedMonthIdx];
    const [y, m] = key.split('-').map(Number);
    document.getElementById('cpm-month-label').innerText = `${THAI_MONTHS[m - 1]} ${y}`;
    document.getElementById('cpm-month-prev').disabled = (cpmSelectedMonthIdx <= 0);
    document.getElementById('cpm-month-next').disabled = (cpmSelectedMonthIdx >= cpmMonths.length - 1);
}

function renderCpmDayTabsAndOrders() {
    const monthKey = cpmMonths[cpmSelectedMonthIdx];
    const monthOrders = cpmAllOrders.filter(r => cpmMonthKey(r.date) === monthKey);
    const days = [...new Set(monthOrders.map(r => r.date))]
        .sort((a, b) => new Date(b.split('/').reverse().join('-')) - new Date(a.split('/').reverse().join('-')));

    const tabsEl = document.getElementById('cpm-day-tabs');
    const pillClass = (active) => 'text-[11px] font-bold px-2.5 py-1 rounded-full transition-all' +
        (active ? ' bg-brand-600 text-white' : ' bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800');
    let html = `<button onclick="cpmSelectDay(null)" class="${pillClass(cpmSelectedDay === null)}">ทั้งหมด</button>`;
    days.forEach(d => {
        const short = d.split('/').slice(0, 2).join('/') + '/' + d.split('/')[2].slice(2); // DD/MM/YY
        html += `<button onclick="cpmSelectDay('${d}')" class="${pillClass(cpmSelectedDay === d)}">${short}</button>`;
    });
    tabsEl.innerHTML = html;

    const filtered = cpmSelectedDay ? monthOrders.filter(r => r.date === cpmSelectedDay) : monthOrders;
    renderCustomerOrderList(filtered);
}
```
> `renderCustomerOrderList(orders)` เดิม**ไม่แก้เลย** — รับ array ที่กรองมาแล้วเหมือนเดิมทุกประการ แค่เปลี่ยนตัวเรียกจากที่เดียว (`openCustomerProfileModal`) เป็นผ่าน `renderCpmDayTabsAndOrders` แทน

## 12. ข้อควรระวัง

- **เดือน/วันในปุ่มมาจากข้อมูลจริงของลูกค้าคนนั้นเท่านั้น** (ไม่ใช่ทุกเดือนปฏิทิน) — ถ้าลูกค้าซื้อแค่ 2 เดือนใน 12 เดือนที่ดึงมา ปุ่มเดือนจะมีแค่ 2 ปุ่มให้เลื่อน ไม่ใช่ 12 ปุ่ม (ตั้งใจ กันปุ่มว่างเปล่า)
- **แผง VIP หลัก**: ปุ่มเดือนถัดไป (`vip-month-next`) disable เมื่อถึงเดือนปัจจุบัน กันเลื่อนไปอนาคต; ปุ่มเดือนก่อนหน้าไม่ disable (แค่ข้อมูลว่างถ้าไม่มีจริง ไม่ error)
- **cache เดิม (`vipDayCache`) ยังใช้ได้ปกติ** ไม่ได้แตะ — สลับเดือน/ช่วงไปมาในขอบเขตที่เคยดึงแล้วจะเร็วทันที (cache hit) เหมือน v1
- **12 เดือน = ~365 reads** เกิน threshold 60 วันแน่นอน → `confirm()` เดิมยังทำงานอยู่ (logic ไม่แตะ) — แค่ trigger จากปุ่ม "12 เดือน" แทนปุ่ม "ดึงข้อมูล" เดิม
- **กราฟรายเดือนใน modal ไม่ผูกกับตัวกรองวันที่** (ยังโชว์ทุกเดือนในช่วงที่ดึงมาเสมอ) — ตั้งใจให้เป็นภาพรวม ส่วนปุ่มเดือน/วันข้างล่างเป็นตัวไล่ดูละเอียด ไม่ใช่บั๊ก
- ทุกจุดยัง read-only ไม่เขียนกลับ Firestore เหมือน v1/v2

## 13. Verify ที่บ้าน

1. เข้าแท็บลูกค้าครั้งแรก → ปุ่ม "3 เดือน" active + label เดือนปัจจุบัน + fetch อัตโนมัติทันที (ไม่ต้องกด "ดึงข้อมูล" เพราะไม่มีปุ่มนี้แล้ว)
2. กดปุ่ม "1 เดือน"/"6 เดือน"/"12 เดือน" → fetch ใหม่ถูกต้อง (เช็คจำนวนวัน/บิลใน `vipRangeInfo`), ปุ่ม active สลับถูก
3. กดลูกศร "‹" เลื่อนเดือนสิ้นสุดย้อนหลัง → fetch เดือนใหม่ถูกต้อง, ลูกศร "›" กดซ้ำจนถึงเดือนปัจจุบันแล้วต้อง disable
4. กด "12 เดือน" ที่เดือนปัจจุบัน → ต้องเจอ `confirm()` เตือน >60 วัน เหมือนเดิม
5. คลิกลูกค้าในตาราง → modal เปิด → เดือนล่าสุดที่มีบิลจริงถูกเลือกอัตโนมัติ, ปุ่มวันที่ในเดือนนั้นครบตามข้อมูลจริง เรียงใหม่→เก่า
6. คลิกปุ่มวันใดวันหนึ่ง → ตารางกรองเหลือเฉพาะวันนั้น, คลิก "ทั้งหมด" → กลับมาเห็นทั้งเดือน
7. เลื่อนเดือนใน modal ("‹"/"›") → ปุ่มวันเปลี่ยนตามเดือนที่เลือก, ที่ขอบ (เดือนแรก/เดือนล่าสุดที่มีบิล) ลูกศรฝั่งนั้น disable
8. ลูกค้าที่มีบิลเดือนเดียว → ลูกศรทั้งคู่ disable ตั้งแต่เปิด modal ไม่ error
9. Dark mode + มือถือ 375px: ปุ่มเดือน/ช่วง/วันไม่ล้น, wrap ได้ปกติ
10. Privacy mode: ทุกจุดยังซ่อนชื่อ/ยอดถูกต้องเหมือน v1/v2 (ไม่ได้แตะโค้ดส่วนนั้น)

## 14. เช็คก่อนเริ่ม

- [ ] อยู่บนไฟล์จริงที่บ้าน (`D:\20_Code`) ไม่ใช่ OneDrive
- [ ] ยึด anchor string ไม่ใช่เลขบรรทัด
- [ ] backup ไฟล์เดิมก่อนแก้
- [ ] deploy ตาม workflow ปกติ — push เฉพาะ "Go Online"
