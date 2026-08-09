# PLAN — v2: หน้าโปรไฟล์ลูกค้า (Modal ประวัติ + กราฟรายเดือน)

> วางแผน 2026-08-09 · ไฟล์: `public/Sales Analytics.html` (ปัจจุบัน V136.26 "VIP Ranking", live แล้ว)
> ต่อยอดจาก [[sales-analytics-vip-customer-plan]] (v1 จัดอันดับลูกค้า VIP — deploy แล้ว commit `c45095f`)
> ขอบเขตยืนยันกับผู้ใช้แล้ว: **(1) read-only เท่านั้น** ยังไม่มีโน้ต/แท็ก (ไม่เขียนกลับ Firestore รอบนี้) **(2) คลิกแถวในตาราง VIP → เปิด modal โปรไฟล์ทันที** (แทนที่พฤติกรรม scroll แบบเดิมของ v1 ทั้งหมด)

---

## 1. เป้าหมาย

คลิกชื่อลูกค้าในตารางอันดับ VIP (v1) → เปิด modal โชว์:
1. สรุปยอด (ยอดสะสม/จำนวนบิล/เฉลี่ยต่อบิล) — เลขเดียวกับแถวในตาราง ไม่คำนวณซ้ำ
2. กราฟแท่งยอดซื้อรายเดือน (Chart.js เหมือน retailChart/wholesaleChart ที่มีอยู่แล้ว)
3. รายการประวัติบิลทั้งหมดของลูกค้าคนนั้น (เรียงล่าสุดก่อน) พร้อมไอคอนวิธีจ่ายเหมือนตารางบิลดิบเดิม

**ขอบเขตข้อมูล:** ใช้ข้อมูลจาก `vipDayCache` (ช่วงวันที่ที่ผู้ใช้ดึงไว้แล้วในแผง VIP) **ไม่ fetch เพิ่ม** — เร็ว ไม่มีต้นทุน read เพิ่ม แต่ผูกกับช่วงวันที่ที่เลือกไว้ก่อนหน้า (ต้อง label ให้ชัดในโมดัลว่า "ในช่วงที่ดึงไว้" กันเข้าใจผิดว่าเป็นประวัติทั้งชีวิตลูกค้า) — ถ้าอยากได้ประวัติทั้งหมดแบบไม่จำกัดช่วง ทำเป็น v3 แยก (ต้อง fetch ไม่จำกัด ต้นทุน read สูงกว่านี้มาก)

## 2. หลักการ

- **ไม่แก้ logic v1 เดิม** (`aggregateVipCustomers`, `loadVipRanking` fetch loop) เพิ่มแค่ field ที่เก็บใน cache (§3) กับฟังก์ชัน modal ใหม่ทั้งหมด
- **แทนที่ (ไม่ใช่เพิ่ม)**: `filterCustomerTableByName` (scroll-to-table แบบ v1) ถูกถอดออก เปลี่ยน onclick ของแถวในตาราง VIP ไปเรียก `openCustomerProfileModal` แทนตรงๆ — ไม่มีจุดไหนในโค้ดเรียก `filterCustomerTableByName` อีกแล้วหลังแพตช์นี้ (เช็คแล้ว มีจุดเดียว)
- Modal อยู่ **body-level** สิบเดียวกับ `cloudLoadModal`/`editModal` ห้าม nest ในแท็บใดๆ (กันปัญหา [[fkb-modal-body-level]] parent `display:none` ทำลูก modal ไม่ render)
- ยอดเงิน/ชื่อใน modal ผูก privacy mode (`isPrivacyMode`) เหมือนจุดอื่นในหน้านี้ทั้งหมด

---

## 3. เพิ่ม field ใน cache (แก้ 1 บรรทัดจาก v1)

**anchor:** `loadVipRanking()` บรรทัด 1376 (การ map ก่อนเก็บลง `vipDayCache[docId]`) — เพิ่ม `breakdown` และ `invoiceId` เข้าไปในอ็อบเจกต์ที่เก็บ (field ที่ v1 ยังไม่ได้เก็บ จำเป็นสำหรับไอคอนวิธีจ่ายในประวัติ):
```javascript
// เดิม (v1):
// .map(r => ({ customerName: r.customerName, amountVal: r.amountVal, saleType: r.saleType, date: r.date, orderId: r.orderId }));

// v2:
.map(r => ({ customerName: r.customerName, amountVal: r.amountVal, saleType: r.saleType, date: r.date, orderId: r.orderId, invoiceId: r.invoiceId, breakdown: r.breakdown }));
```
> **ผลกระทบ:** cache เก่าที่ดึงไว้ก่อนแพตช์นี้ (ถ้าผู้ใช้ยังไม่ reload หน้า) จะไม่มี `breakdown`/`invoiceId` — โมดัลต้องกันด้วย `r.breakdown || {}` (ดู §6) ไม่ error ถ้าฟิลด์หาย ผู้ใช้แค่กด "ดึงข้อมูล" ซ้ำ (cache หายตอน reload หน้าอยู่แล้วตามพฤติกรรม v1)

---

## 4. Const/ตัวแปรใหม่

**anchor:** ใกล้ `let retailChart = null; let wholesaleChart = null;` (บรรทัด 1133-1134) เพิ่มต่อท้าย:
```javascript
let customerProfileChart = null; // instance กราฟรายเดือนใน modal โปรไฟล์ลูกค้า
```

---

## 5. HTML — Modal โปรไฟล์ลูกค้า

**anchor:** วางก่อน `<!-- Cloud Load Modal -->` (บรรทัด 2724) หรือหลังก็ได้ — ขอวางก่อนเพื่อให้ modal ใหม่อยู่ใกล้กับที่เรียกใช้ทางแนวคิด (ทั้งคู่เป็น sibling ระดับ body เหมือนกัน ไม่กระทบ):

```html
<!-- Customer Profile Modal (v2) -->
<div id="customerProfileModal"
    class="fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-hidden border border-slate-200 dark:border-slate-700 animate-slide-up flex flex-col">
        <div class="bg-gradient-to-r from-brand-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
            <div>
                <h3 id="cpm-name" class="text-base font-bold flex items-center gap-2"><i class="ph-fill ph-user-circle"></i> -</h3>
                <p id="cpm-range" class="text-[11px] text-white/70 mt-0.5"></p>
            </div>
            <button onclick="closeCustomerProfileModal()" class="text-white/80 hover:text-white shrink-0"><i class="ph-bold ph-x text-xl"></i></button>
        </div>

        <div class="p-6 overflow-y-auto custom-scrollbar flex-1">
            <div class="grid grid-cols-3 gap-3 mb-5">
                <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                    <p class="text-[10px] text-slate-400 mb-1">ยอดสะสม</p>
                    <p id="cpm-total" class="font-bold text-slate-800 dark:text-slate-100">-</p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                    <p class="text-[10px] text-slate-400 mb-1">จำนวนบิล</p>
                    <p id="cpm-count" class="font-bold text-slate-800 dark:text-slate-100">-</p>
                </div>
                <div class="bg-slate-50 dark:bg-slate-900 rounded-xl p-3 text-center">
                    <p class="text-[10px] text-slate-400 mb-1">เฉลี่ย/บิล</p>
                    <p id="cpm-avg" class="font-bold text-slate-800 dark:text-slate-100">-</p>
                </div>
            </div>

            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">ยอดซื้อรายเดือน</h4>
            <div class="relative h-[180px] w-full mb-6"><canvas id="customerProfileChart"></canvas></div>

            <h4 class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-2">ประวัติบิล</h4>
            <div class="overflow-x-auto max-h-[240px] custom-scrollbar border border-slate-200 dark:border-slate-700 rounded-xl">
                <table class="w-full text-sm text-left whitespace-nowrap text-slate-600 dark:text-slate-300">
                    <thead class="text-xs text-slate-500 dark:text-slate-400 uppercase bg-slate-50 dark:bg-slate-800 sticky top-0">
                        <tr>
                            <th class="px-3 py-2">วันที่</th>
                            <th class="px-3 py-2">เลขที่</th>
                            <th class="px-3 py-2 text-center">จ่ายโดย</th>
                            <th class="px-3 py-2 text-right">ยอดเงิน</th>
                        </tr>
                    </thead>
                    <tbody id="cpm-orders" class="divide-y divide-slate-50 dark:divide-slate-700"></tbody>
                </table>
            </div>
        </div>
    </div>
</div>
```

---

## 6. JS — เปิด/ปิด modal + คำนวณ

**anchor:** วางหลัง `filterCustomerTableByName` (บรรทัด 1440-1444) แล้ว**ลบฟังก์ชันนั้นทิ้ง** (ไม่มีที่เรียกใช้แล้วหลังแพตช์นี้ — เช็ค caller เดียวคือ onclick ในตาราง VIP ที่จะเปลี่ยนใน §7):

```javascript
function openCustomerProfileModal(name) {
    const orders = [];
    Object.keys(vipDayCache).forEach(docId => {
        (vipDayCache[docId] || []).forEach(r => {
            if ((r.customerName || '').trim() === name) orders.push(r);
        });
    });
    orders.sort((a, b) => new Date(b.date.split('/').reverse().join('-')) - new Date(a.date.split('/').reverse().join('-')));

    const total = orders.reduce((s, r) => s + r.amountVal, 0);
    const count = orders.length;
    const avg = count > 0 ? total / count : 0;
    const displayName = isPrivacyMode ? maskCustomerName(name) : name;

    document.getElementById('cpm-name').innerHTML = `<i class="ph-fill ph-user-circle"></i> ${displayName}`;
    document.getElementById('cpm-range').innerText = `ข้อมูลในช่วงที่ดึงไว้: ${document.getElementById('vip-start-date').value} ถึง ${document.getElementById('vip-end-date').value}`;
    document.getElementById('cpm-total').innerText = isPrivacyMode ? '•••' : total.toLocaleString(undefined, { minimumFractionDigits: 2 });
    document.getElementById('cpm-count').innerText = count;
    document.getElementById('cpm-avg').innerText = isPrivacyMode ? '•••' : avg.toLocaleString(undefined, { maximumFractionDigits: 0 });

    renderCustomerProfileChart(orders);
    renderCustomerOrderList(orders);

    document.getElementById('customerProfileModal').classList.remove('hidden');
    document.getElementById('customerProfileModal').classList.add('flex');
}

function closeCustomerProfileModal() {
    document.getElementById('customerProfileModal').classList.add('hidden');
    document.getElementById('customerProfileModal').classList.remove('flex');
}

function renderCustomerProfileChart(orders) {
    const monthly = new Map(); // key = 'YYYY-MM' → total
    orders.forEach(r => {
        const parts = r.date.split('/'); // DD/MM/YYYY
        const key = `${parts[2]}-${parts[1].padStart(2, '0')}`;
        monthly.set(key, (monthly.get(key) || 0) + r.amountVal);
    });
    const sortedKeys = [...monthly.keys()].sort();
    const labels = sortedKeys.map(k => {
        const [y, m] = k.split('-');
        return `${m}/${y.slice(2)}`;
    });
    const values = sortedKeys.map(k => monthly.get(k));

    const ctx = document.getElementById('customerProfileChart');
    if (customerProfileChart) customerProfileChart.destroy();
    customerProfileChart = new Chart(ctx, {
        type: 'bar',
        data: { labels, datasets: [{ label: 'ยอดซื้อ', data: values, backgroundColor: '#6366f1', borderRadius: 4 }] },
        options: {
            responsive: true, maintainAspectRatio: false,
            plugins: { legend: { display: false }, tooltip: { callbacks: { label: (c) => isPrivacyMode ? 'ซ่อน' : c.formattedValue } } },
            scales: { y: { ticks: { display: !isPrivacyMode } } }
        }
    });
}

function renderCustomerOrderList(orders) {
    const tbody = document.getElementById('cpm-orders');
    if (orders.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" class="text-center py-6 text-slate-400 text-xs">ไม่พบประวัติบิล</td></tr>`;
        return;
    }
    tbody.innerHTML = orders.map(r => {
        const b = r.breakdown || {};
        let icons = '';
        if (b.cash > 0) icons += '<i class="ph-fill ph-money text-orange-500"></i>';
        if (b.credit > 0) icons += '<i class="ph-fill ph-credit-card text-purple-500"></i>';
        if (b.credit_ar > 0) icons += '<i class="ph-fill ph-user-list text-teal-600"></i>';
        if ((b.transfer_lpm || 0) + (b.transfer_fiscal || 0) + (b.transfer_scb || 0) > 0) icons += '<i class="ph-fill ph-bank text-cyan-600"></i>';
        return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700">
            <td class="px-3 py-2 text-xs text-slate-500 dark:text-slate-400">${r.date}</td>
            <td class="px-3 py-2 text-xs font-mono text-brand-600 dark:text-brand-400">${r.orderId}</td>
            <td class="px-3 py-2 text-center">${icons || '-'}</td>
            <td class="px-3 py-2 text-right text-xs font-bold text-slate-700 dark:text-slate-200">${isPrivacyMode ? '•••' : r.amountVal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
        </tr>`;
    }).join('');
}
```
> `renderCustomerOrderList` ใช้ icon set แบบย่อ (ไม่แยกช่องทางโอนเหมือนตารางบิลดิบ) เพราะพื้นที่ modal แคบกว่า — ถ้าอยากละเอียดเท่าตารางเดิมทำได้ทีหลัง ไม่ใช่ blocker

---

## 7. JS — เปลี่ยน onclick แถว VIP ให้เปิด modal แทน scroll

**anchor:** `renderVipRanking()` บรรทัด 1426 (จาก v1) — เปลี่ยน:
```javascript
// เดิม (v1):
// onclick="filterCustomerTableByName('${c.name.replace(/'/g, "\\'")}')"

// v2:
onclick="openCustomerProfileModal('${c.name.replace(/'/g, "\\'")}')"
```

---

## 8. ข้อควรระวัง

- **ข้อมูลจำกัดตามช่วงที่ดึงไว้เท่านั้น** ไม่ใช่ประวัติทั้งชีวิตลูกค้า — label `cpm-range` ต้องแสดงชัดเจนทุกครั้งกันผู้ใช้เข้าใจผิดว่าลูกค้าคนนี้มียอดซื้อแค่นี้ตลอดกาล (ความเสี่ยง UX สำคัญที่สุดของแพตช์นี้)
- **cache เก่าไม่มี `breakdown`/`invoiceId`** ถ้าผู้ใช้ค้าง session จากก่อนแพตช์นี้ (ไม่น่าเกิดเพราะ cache หายตอน reload อยู่แล้ว) — โค้ด `r.breakdown || {}` กันไว้แล้วไม่ error แค่ไอคอนว่างเฉยๆ
- **กราฟรายเดือนใช้ปี ค.ศ. ตรงจากข้อมูล** (ไม่แปลง พ.ศ.) ตรงกับธรรมเนียมเดิมของหน้านี้ที่ไม่แปลงปีอยู่แล้ว ([[cknc-workflow]] เรื่อง พ.ศ. เป็นของ CKNC คนละแอป ไม่ปนกัน)
- **Modal ซ้อน**: ถ้าเปิด modal อยู่แล้วคลิกแถวอื่นในตาราง VIP ไม่ได้ (ตาราง VIP อยู่หลัง modal, backdrop กันคลิกทะลุ) ต้องปิด modal ก่อนถึงจะคลิกแถวใหม่ได้ — พฤติกรรมมาตรฐานถูกต้องอยู่แล้ว ไม่ต้องแก้อะไรเพิ่ม
- **ลบ `filterCustomerTableByName` ทิ้งจริง** อย่าลืมลบ ไม่ปล่อยเป็น dead code ค้างไว้
- read-only ล้วนเหมือน v1 ไม่มีการเขียนกลับ Firestore ความเสี่ยงต่ำ

## 9. Verify ที่บ้าน

1. ดึงข้อมูล VIP ตามปกติ (เหมือน v1) → คลิกแถวลูกค้าอันดับ 1 → modal เปิด ไม่ scroll แบบเดิมอีกต่อไป
2. ตัวเลขสรุปใน modal (ยอดสะสม/จำนวนบิล/เฉลี่ย) **ต้องตรงกับตัวเลขในแถวตาราง VIP เป๊ะ** (cross-check เลข)
3. กราฟรายเดือน: รวมยอดทุกแท่งในกราฟ = ยอดสะสมที่การ์ดบน (cross-check)
4. ประวัติบิล: จำนวนแถว = จำนวนบิลที่การ์ดบน, เรียงล่าสุดก่อนถูกต้อง, ไอคอนวิธีจ่ายตรงกับข้อมูลจริง
5. เปิด privacy mode → ชื่อ/ยอดในทุกจุดของ modal (การ์ด, กราฟ tooltip, ประวัติบิล) ซ่อนถูกต้อง
6. ปิด modal (ปุ่ม X และคลิก backdrop) แล้วเปิดลูกค้าคนอื่น → ข้อมูลรีเฟรชถูกต้อง ไม่ค้างของคนเก่า
7. ลูกค้าที่มีบิลเดียว → กราฟ 1 แท่งไม่พัง, modal ไม่ error
8. Dark mode + มือถือ 375px: modal ไม่ล้นจอ, กราฟ/ตารางประวัติ scroll ในกรอบตัวเองได้ปกติ
9. เช็ค `filterCustomerTableByName` ไม่มีเรียกใช้เหลือที่ไหนในไฟล์แล้ว (dead code หมด)

## 10. เช็คก่อนเริ่ม

- [ ] อยู่บนไฟล์จริงที่บ้าน (`D:\20_Code`) ไม่ใช่ OneDrive
- [ ] ยึด anchor string ไม่ใช่เลขบรรทัด — เลขบรรทัดในแผนนี้อ้างจาก V136.26 ปัจจุบัน ถ้ามีแพตช์อื่นลงก่อนต้องหาใหม่
- [ ] มีข้อมูลจริงบน cloud ให้ทดสอบ (มีแล้วจาก v1 ที่ deploy ไปแล้ว)
- [ ] backup ไฟล์เดิมก่อนแก้
- [ ] deploy ตาม workflow ปกติ (bump `?v=` ถ้ามี, firebase deploy) — push เฉพาะ "Go Online"
