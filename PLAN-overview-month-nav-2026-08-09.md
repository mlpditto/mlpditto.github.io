# PLAN — v6: เพิ่มตัวเลือกเดือนในแถบปุ่มวัน (Overview) เหมือนแผง VIP

> วางแผน 2026-08-09 · ไฟล์: `public/Sales Analytics.html` (ปัจจุบัน V136.30 "Auto-load", live แล้ว)
> feedback: แถบปุ่มวัน (v4) โชว์แค่ 10 วันล่าสุด (ทางลัดตั้งใจ) ไม่พอดูข้อมูลเก่ากว่านั้น (เช่น ม.ค.-ก.พ. ที่เพิ่ง backfill) — อยากได้ปุ่มเลื่อนเดือนเหมือนแผง VIP

## หลักการ

- **ไม่แตะ `loadRecentDayPills()` เดิม (v4/v5)** — ยังใช้เป็น initial load + auto-load เหมือนเดิมทุกอย่าง (10 วันล่าสุด, ราคาถูก, เชื่อถือได้)
- เพิ่มปุ่มเลื่อนเดือนเป็น**ชั้นแยกต่างหาก** ที่กดแล้วค่อย query เดือนนั้นจริงๆ แทนที่ `recentDayPillsCache` เดิม — ไม่กดไม่ query เพิ่ม
- reuse ฟังก์ชัน `monthLabel`, `currentMonthStr`, `THAI_MONTHS` ที่มีอยู่แล้วจากแผง VIP ไม่เขียนซ้ำ

## 1. HTML — ปุ่มเลื่อนเดือน

**anchor:** ก่อน `<div id="recentDayPills" ...>` (บรรทัด 577):
```html
<div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 rounded-lg px-1 self-start">
    <button onclick="shiftOverviewMonth(-1)" class="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400"><i class="ph-bold ph-caret-left"></i></button>
    <span id="overview-month-label" class="text-xs font-bold text-slate-700 dark:text-slate-200 px-1 min-w-[90px] text-center">-</span>
    <button onclick="shiftOverviewMonth(1)" id="overview-month-next" class="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-30 disabled:cursor-not-allowed"><i class="ph-bold ph-caret-right"></i></button>
</div>
```

## 2. Const/State ใหม่

**anchor:** ใกล้ `let recentDayPillsCache = [];` เพิ่มต่อท้าย:
```javascript
let overviewMonth = null; // 'YYYY-MM' เดือนที่กำลังดูอยู่ในแถบปุ่มวัน (เริ่มที่เดือนปัจจุบัน)
```

## 3. JS — เลื่อนเดือน + query เดือนนั้น

**anchor:** วางท้าย `renderRecentDayPills()`:
```javascript
function getMonthDayRange(monthStr) {
    const [y, m] = monthStr.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0);
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    return { start: fmt(start), end: fmt(end) };
}

async function loadOverviewMonthPills(monthStr) {
    const { start, end } = getMonthDayRange(monthStr);
    try {
        const snapshot = await window.db.collection('sales_analytics')
            .where(firebase.firestore.FieldPath.documentId(), '>=', start)
            .where(firebase.firestore.FieldPath.documentId(), '<=', end)
            .get();
        recentDayPillsCache = snapshot.docs
            .map(doc => ({ id: doc.id, date: doc.data().date }))
            .sort((a, b) => b.id.localeCompare(a.id));
        renderRecentDayPills();
    } catch (e) {
        console.error("โหลดวันของเดือนที่เลือกไม่สำเร็จ", e);
    }
}

function shiftOverviewMonth(delta) {
    const [y, m] = overviewMonth.split('-').map(Number);
    const d = new Date(y, m - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    if (next > currentMonthStr()) return; // กันเลื่อนไปอนาคต
    overviewMonth = next;
    document.getElementById('overview-month-label').innerText = monthLabel(overviewMonth);
    document.getElementById('overview-month-next').disabled = (overviewMonth >= currentMonthStr());
    loadOverviewMonthPills(overviewMonth);
}
```

## 4. JS — ตั้งค่าเริ่มต้นตอน auth พร้อม (แค่ label เฉยๆ ไม่ query)

**anchor:** ใน `loadRecentDayPills()` (v4) เพิ่มบรรทัดแรกในบล็อก `try`:
```javascript
overviewMonth = currentMonthStr();
document.getElementById('overview-month-label').innerText = monthLabel(overviewMonth);
document.getElementById('overview-month-next').disabled = true; // อยู่เดือนปัจจุบันอยู่แล้ว
```
> ไม่เรียก query เดือนซ้ำตรงนี้ — ปล่อยให้ `loadRecentDayPills()` เดิมทำงานของมันต่อ (10 วันล่าสุด) label แค่โชว์ "เดือนปัจจุบัน" เฉยๆ ให้ตรงกับ state จริง จนกว่าผู้ใช้จะกดลูกศรเปลี่ยนเดือนเอง

## ข้อควรระวัง

- กดลูกศรย้อนไปเดือนที่ไม่มีข้อมูลเลย → `recentDayPillsCache` ว่าง → แถบปุ่มว่างเปล่า ไม่ error (ปกติ)
- ปุ่มเดือนถัดไป (`overview-month-next`) disable เมื่อถึงเดือนปัจจุบัน กันเลื่อนอนาคต
- ไม่กระทบ auto-load (v5) เลย เพราะยังอ่านจาก `recentDayPillsCache[0]` ที่มาจาก `loadRecentDayPills()` เดิมตอน initial load เท่านั้น (ตอนนั้นยังไม่มีใครกดเปลี่ยนเดือน)

## Verify ที่บ้าน

1. เปิดหน้าเว็บ → ป้ายเดือนโชว์เดือนปัจจุบันถูกต้อง ลูกศรถัดไป disable
2. กดลูกศรย้อนไปเดือนที่มีข้อมูล (เช่น ม.ค. 2026 ที่เพิ่ง backfill) → แถบปุ่มวันเปลี่ยนเป็นวันของเดือนนั้นถูกต้อง เรียงใหม่→เก่า
3. คลิกวันในเดือนเก่า → โหลดข้อมูลวันนั้นถูกต้องเหมือนเดิม (ผ่าน `loadCloudData` เดิม ไม่แตะ)
4. กดลูกศรไปเรื่อยๆ จนถึงเดือนปัจจุบัน → ลูกศรถัดไป disable ถูกจังหวะ
5. Dark mode + มือถือ 375px: ปุ่มเดือน+แถบวัน wrap ได้ปกติ

## เช็คก่อนเริ่ม

- [ ] backup เก็บที่ scratchpad เท่านั้น
- [ ] deploy ตาม workflow ปกติ — push เฉพาะ "Go Online"
