# PLAN — เพิ่มปุ่มสลับวันด่วนในแท็บ Overview (LINE MAN-style)

> วางแผน 2026-08-09 · ไฟล์: `public/Sales Analytics.html` (ปัจจุบัน V136.28 "LINE MAN Nav", live แล้ว)
> feedback ต่อจาก v3: ภาพที่ผู้ใช้ส่งจริงๆ คือแท็บ **Overview** (ตารางบิลดิบหลัก) ไม่ใช่แท็บลูกค้าที่เพิ่งปรับ — ตอนนี้สลับวันได้ทางเดียวคือเปิด modal "Cloud" ทุกครั้ง ยืนยันแล้วว่าอยากได้แถบปุ่มสลับวันด่วนแบบ LINE MAN ตรงนี้ด้วย

## 1. เป้าหมาย

เพิ่มแถบปุ่มวันที่ล่าสุด (ดึงจาก `sales_analytics` collection, เรียงใหม่→เก่า) ไว้ใต้ป้ายวันที่ปัจจุบัน (`summaryDateRange`) ในแท็บ Overview — คลิกปุ่มไหนโหลดวันนั้นทันที (เรียก `loadCloudData` เดิมที่มีอยู่แล้ว ไม่ต้องเปิด modal Cloud) ปุ่มของวันที่กำลังดูอยู่ไฮไลต์ต่าง

## 2. หลักการ

- **ไม่แก้ `loadCloudData`/`renderCloudDateList`/modal Cloud เดิมเลย** — ปุ่ม Cloud เดิมยังอยู่ (ไว้ดูย้อนหลังได้ถึง 30 วัน/เดือนอื่น) แถบปุ่มใหม่เป็นแค่ทางลัดของวันล่าสุด (10 วัน)
- **query ด้วย `FieldPath.documentId()` ไม่ใช่ field `date`** — ต่างจาก `renderCloudDateList` เดิมที่ query ด้วย `orderBy('date','desc')` ซึ่งเป็น string sort ผิดหลักการ (เจอจริงจากข้อมูล cloud list เก่าที่เรียงมั่ว) เพราะ docId เป็น `YYYY-MM-DD` sort ตรงตามเวลาจริงอยู่แล้ว เป็นแพตช์เล็กๆ ที่ทำถูกตั้งแต่แรกโดยไม่ต้องแตะโค้ดเดิม
- ปุ่มโหลดครั้งเดียวตอน auth พร้อม (ไม่ query ซ้ำทุกครั้งที่สลับแท็บ) — cache รายการปุ่มไว้ในตัวแปร module-level เพื่อ re-render สถานะ active ได้เร็วโดยไม่ query ซ้ำ

## 3. HTML — แถบปุ่มวันที่

**anchor:** แทรกหลังปิด div ของ `summaryDateRange`/`flagCounterContainer` (หลัง `</div>` ที่ปิด `class="flex justify-between items-center"`) ก่อน `<div class="relative">` (ช่องค้นหา):
```html
<div id="recentDayPills" class="flex items-center gap-1.5 flex-wrap"></div>
```

## 4. Const/State ใหม่

**anchor:** ใกล้ `let vipDayCache = {};` เพิ่มต่อท้าย:
```javascript
let currentLoadedDocId = null; // docId ('YYYY-MM-DD') ของวันที่กำลังโหลดอยู่ ไว้ไฮไลต์ปุ่ม
let recentDayPillsCache = [];  // รายการ {id, date} ล่าสุดที่ query มา ไว้ re-render active state ไม่ต้อง query ซ้ำ
```

## 5. JS — โหลด+เรนเดอร์แถบปุ่ม

**anchor:** วางท้ายบล็อก Firebase Cloud Functions เดิม (หลัง `renderCloudDateList`):
```javascript
async function loadRecentDayPills() {
    try {
        await authReady;
        const snapshot = await window.db.collection('sales_analytics')
            .orderBy(firebase.firestore.FieldPath.documentId(), 'desc')
            .limit(10).get();
        recentDayPillsCache = [];
        snapshot.forEach(doc => recentDayPillsCache.push({ id: doc.id, date: doc.data().date }));
        renderRecentDayPills();
    } catch (e) {
        console.error("โหลดแถบวันล่าสุดไม่สำเร็จ", e);
    }
}

function renderRecentDayPills() {
    const container = document.getElementById('recentDayPills');
    if (!container) return;
    container.innerHTML = recentDayPillsCache.map(p => {
        const active = p.id === currentLoadedDocId;
        return `<button onclick="loadCloudData('${p.id}')" class="text-xs font-bold px-3 py-1.5 rounded-full transition-all ${active ? 'bg-brand-600 text-white' : 'bg-slate-100 dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'}">${p.date}</button>`;
    }).join('');
}
```

## 6. JS — เรียกตอน auth พร้อม (ครั้งเดียว)

**anchor:** ใน `authReady` promise ส่วน `if (ok) { document.getElementById('authGate').classList.add('hidden'); resolve(user); }` เพิ่มก่อน `resolve(user)`:
```javascript
loadRecentDayPills(); // โหลดแถบวันล่าสุด ครั้งเดียวตอน auth ผ่าน (ไม่ await กันบล็อก resolve)
```

## 7. JS — ไฮไลต์ปุ่มที่กำลังดูอยู่ (แก้ `loadCloudData` 1 จุด)

**anchor:** ใน `loadCloudData(docId)` หลังบรรทัด `showToast(...โหลดวันที่...)` (ในสาขา `allData.length > 0`) เพิ่ม:
```javascript
currentLoadedDocId = docId;
renderRecentDayPills(); // ไฮไลต์ปุ่มใหม่ (ใช้ cache เดิม ไม่ query ซ้ำ)
```

## 8. ข้อควรระวัง

- แถบปุ่มโชว์แค่ **10 วันล่าสุดที่มีข้อมูลบน cloud** ไม่ใช่ 10 วันปฏิทินติดกัน (วันไหนไม่มีข้อมูลจะไม่มีปุ่ม) — ตรงกับพฤติกรรม modal Cloud เดิมเป๊ะ แค่จำนวนน้อยกว่า (10 vs 30) เพราะเป็นทางลัด ไม่ใช่ตัวแทนแบบเต็ม
- ถ้าอยากได้วันที่เก่ากว่า 10 วันล่าสุด ยังต้องกดปุ่ม "Cloud" เดิมอยู่ (ไม่ได้ตัดออก)
- `currentLoadedDocId` ไม่ sync กับกรณีโหลดข้อมูลผ่าน paste/CSV (ไม่มี docId) — ตอนนั้นจะไม่มีปุ่มไหน active ซึ่งถูกต้องอยู่แล้ว (ไม่ใช่ข้อมูลจาก cloud)
- read-only ล้วน ไม่เขียนกลับ Firestore ความเสี่ยงต่ำ

## 9. Verify ที่บ้าน

1. เปิดหน้าเว็บ ล็อกอิน → แถบปุ่มวันล่าสุดขึ้นเองโดยไม่ต้องกด Cloud (สูงสุด 10 ปุ่ม เรียงใหม่→เก่าถูกต้องตามเวลาจริง ไม่ใช่ string sort มั่ว)
2. คลิกปุ่มวันไหน → โหลดวันนั้นถูกต้อง (เหมือนกดจาก modal Cloud เป๊ะ) ปุ่มนั้นไฮไลต์
3. คลิกปุ่มอื่นต่อ → ไฮไลต์ย้ายตาม ไม่มีค้าง 2 ปุ่ม active พร้อมกัน
4. เปิด modal "Cloud" แบบเดิมคู่กัน → ยังทำงานปกติ ไม่ชนกัน
5. Paste ข้อมูลเองแทน (ไม่ใช้ Cloud) → ไม่มีปุ่มไหน active (ถูกต้อง)
6. Dark mode + มือถือ 375px: ปุ่ม wrap ได้ปกติไม่ล้น

## 10. เช็คก่อนเริ่ม

- [ ] อยู่บนไฟล์จริงที่บ้าน (`D:\20_Code`) ไม่ใช่ OneDrive
- [ ] ยึด anchor string ไม่ใช่เลขบรรทัด
- [ ] backup ไฟล์เดิมก่อนแก้ **— เก็บไว้ที่ scratchpad เท่านั้น ห้ามเก็บใน `public/` อีก** (ดู [[fkb-backup-file-deploy-leak]])
- [ ] deploy ตาม workflow ปกติ — push เฉพาะ "Go Online"
