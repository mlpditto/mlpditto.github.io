# PLAN — v7: ค้นหาในตาราง VIP + ตรวจ/รวมชื่อลูกค้าซ้ำ (heuristic + alias ถาวร)

> วางแผน 2026-08-09 · ไฟล์: `public/Sales Analytics.html` (ปัจจุบัน V136.31 "Month Nav", live แล้ว)
> ต่อยอดจากการเจอเคส "MR. JASON ALAN SHIPMAN" ขึ้น 2 แถวเพราะ (1) พิมพ์ยอดเงินติดชื่อ (แก้บิลนั้นตรงๆ ไปแล้ว) และ (2) ปัญหาคลาสใหญ่กว่า: ชื่อเดียวกันสะกด/รูปแบบต่างกัน = แยกคนละแถวในอันดับ VIP เสมอ
> ยืนยันขอบเขตแล้ว: ค้นหาในตาราง + ปุ่ม "ตรวจชื่อซ้ำ" กดเอง (ไม่ auto-scan) + merge แบบ **heuristic** (ไม่เรียก AI จริง) + **จำถาวรผ่าน alias collection**

## 1. หลักการ

- **ไม่แตะ logic เดิมเลย**: `loadVipRanking` fetch loop, `openCustomerProfileModal`, `renderCustomerOrderList` ฯลฯ เหมือนเดิมทุกจุด
- alias เก็บเป็น **flat record ต่อคู่** ใน collection ใหม่ `sales_analytics_customer_aliases` (`{variantName, canonicalName, mergedAt}`) — ไม่ใช่ group-doc เพื่อกันปัญหา race condition ตอนอัปเดต array ซ้อนกัน, ใช้ `.add()` ล้วนๆ
- รองรับ **chain resolution** (ถ้า C merge เข้า B แล้ว B เคย merge เข้า A มาก่อน ต้องได้ A ไม่ใช่ B) ด้วยการไล่ตามลูกโซ่ตอนอ่าน ไม่ต้องเขียนซ้ำตอน merge
- Heuristic similarity ใช้ **Levenshtein ratio หลัง normalize** (ตัดแท็ก `[GW]`/`[I]` ฯลฯ, คำนำหน้า `LINE`/`LOA` ที่พบบ่อย, เว้นวรรค/จุด) + **bucket ก่อนเทียบ** กันคำนวณ O(n²) หนักเกินไปกับลูกค้าหลักพันราย

## 2. ค้นหาในตาราง VIP

### 2.1 HTML — ช่องค้นหา + ปุ่มตรวจชื่อซ้ำ
**anchor:** แทรกหลัง `<div id="vipRangeInfo" ...></div>` (บรรทัด 818) ก่อน `<div class="overflow-x-auto ...">`:
```html
<div class="mb-3 flex items-center gap-2 flex-wrap">
    <div class="relative flex-1 min-w-[180px]">
        <i class="ph-bold ph-magnifying-glass absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm"></i>
        <input type="text" id="vip-search" oninput="filterVipRanking(this.value)" placeholder="ค้นหาชื่อลูกค้า..."
            class="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-brand-500/30">
    </div>
    <button onclick="openMergeSuggestModal()"
        class="text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 px-3 py-1.5 rounded-lg border border-purple-200 dark:border-purple-800 transition-all flex items-center gap-1.5 shrink-0">
        <i class="ph-bold ph-link"></i> ตรวจชื่อซ้ำ
    </button>
</div>
```

### 2.2 JS — แยก tbody-render ออกมาให้ search เรียกซ้ำได้
**anchor:** แก้ `renderVipRanking()` (เดิม) — เพิ่มบรรทัดเก็บ full list + เคลียร์ช่องค้นหา, ย้าย loop สร้างแถวออกไปเป็นฟังก์ชันใหม่:
```javascript
function renderVipRanking(ranking, recordCount, dayCount) {
    vipRankingFull = ranking; // เก็บเต็มไว้ให้ search filter ใช้ (ไม่ query ซ้ำ)
    document.getElementById('vip-search').value = ''; // เคลียร์ช่องค้นหาทุกครั้งที่ fetch ช่วงใหม่
    document.getElementById('vipRangeInfo').innerText =
        `รวม ${recordCount} บิล จาก ${dayCount} วัน → พบลูกค้า ${ranking.length} ราย (ไม่รวมชื่อทั่วไป/ว่าง)`;
    renderVipTableRows(ranking);
}

function renderVipTableRows(ranking) {
    const tbody = document.getElementById('vipTableBody');
    if (ranking.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-8 text-slate-400">ไม่พบข้อมูลในช่วงนี้</td></tr>`;
        return;
    }
    tbody.innerHTML = ranking.map((c, i) => {
        const isVip = c.total >= VIP_SPEND_THRESHOLD;
        const displayName = isPrivacyMode ? maskCustomerName(c.name) : c.name;
        return `
        <tr class="hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer" onclick="openCustomerProfileModal('${c.name.replace(/'/g, "\\'")}')">
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

function filterVipRanking(query) {
    const q = query.trim().toLowerCase();
    const filtered = q ? vipRankingFull.filter(c => c.name.toLowerCase().includes(q)) : vipRankingFull;
    renderVipTableRows(filtered);
}
```
> เนื้อหาแถวใน `renderVipTableRows` เหมือนของเดิมเป๊ะ (ก็อปมาไม่ได้เปลี่ยน logic) แค่แยกออกมาเป็นฟังก์ชัน

### 2.3 Const ใหม่
**anchor:** ใกล้ `let vipLastFetchStart = null, vipLastFetchEnd = null;` เพิ่มต่อท้าย:
```javascript
let vipRankingFull = []; // ranking เต็มก่อน filter ค้นหา
```

---

## 3. ตรวจ/รวมชื่อลูกค้าซ้ำ (heuristic + alias ถาวร)

### 3.1 Const ใหม่
**anchor:** ต่อจาก `vipRankingFull` ด้านบน:
```javascript
const CUSTOMER_ALIAS_COLLECTION = 'sales_analytics_customer_aliases';
let vipCustomerAliasMap = {}; // variantName -> canonicalName (โหลดจาก Firestore ครั้งเดียว/session)
let vipAliasMapLoaded = false;
const MERGE_SIMILARITY_THRESHOLD = 0.82; // 0-1, ยิ่งสูงยิ่งเข้ม
```

### 3.2 JS — โหลด alias + resolve chain + normalize + similarity
**anchor:** วางท้ายบล็อก `aggregateVipCustomers`/ก่อน `renderVipRanking`:
```javascript
async function loadCustomerAliasMap() {
    try {
        const snap = await window.db.collection(CUSTOMER_ALIAS_COLLECTION).get();
        vipCustomerAliasMap = {};
        snap.forEach(doc => {
            const d = doc.data();
            if (d.variantName && d.canonicalName) vipCustomerAliasMap[d.variantName] = d.canonicalName;
        });
    } catch (e) {
        console.error("โหลด alias ลูกค้าไม่สำเร็จ", e);
    }
}

async function ensureAliasMapLoaded() {
    if (vipAliasMapLoaded) return;
    await loadCustomerAliasMap();
    vipAliasMapLoaded = true;
}

function resolveCanonicalName(name) {
    let current = name, hops = 0;
    while (vipCustomerAliasMap[current] && vipCustomerAliasMap[current] !== current && hops < 10) {
        current = vipCustomerAliasMap[current];
        hops++;
    }
    return current;
}

function normalizeCustomerName(name) {
    return name
        .replace(/\[.*?\]/g, '')
        .replace(/^(LINE|LOA|INT2022|INT2026)\s+/i, '')
        .replace(/[.,]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}

function stringSimilarity(a, b) {
    const la = a.length, lb = b.length;
    if (la === 0 || lb === 0) return 0;
    const dp = Array.from({ length: la + 1 }, () => new Array(lb + 1).fill(0));
    for (let i = 0; i <= la; i++) dp[i][0] = i;
    for (let j = 0; j <= lb; j++) dp[0][j] = j;
    for (let i = 1; i <= la; i++) {
        for (let j = 1; j <= lb; j++) {
            dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
    }
    return 1 - dp[la][lb] / Math.max(la, lb);
}

function findMergeCandidates(ranking) {
    const items = ranking
        .map(c => ({ original: c.name, norm: normalizeCustomerName(c.name) }))
        .filter(item => item.norm.length >= 3); // กันชื่อสั้นเกินไป false-positive ง่าย

    const buckets = {};
    items.forEach(item => {
        const key = (item.norm.split(' ')[0] || '').slice(0, 3);
        if (!buckets[key]) buckets[key] = [];
        buckets[key].push(item);
    });

    const candidates = [];
    const seen = new Set();
    Object.values(buckets).forEach(bucket => {
        for (let i = 0; i < bucket.length; i++) {
            for (let j = i + 1; j < bucket.length; j++) {
                const a = bucket[i], b = bucket[j];
                if (a.original === b.original) continue;
                const sim = stringSimilarity(a.norm, b.norm);
                if (sim >= MERGE_SIMILARITY_THRESHOLD && sim < 1) {
                    const key = [a.original, b.original].sort().join('|');
                    if (seen.has(key)) continue;
                    seen.add(key);
                    candidates.push({ nameA: a.original, nameB: b.original, similarity: sim });
                }
            }
        }
    });
    return candidates.sort((a, b) => b.similarity - a.similarity);
}
```

### 3.3 ใช้ alias ตอนรวมยอด (แก้ `aggregateVipCustomers` 1 บรรทัด)
**anchor:** ใน `aggregateVipCustomers(records)`:
```javascript
// เดิม: const name = (r.customerName || '').trim();
// v7:
const name = resolveCanonicalName((r.customerName || '').trim());
```

### 3.4 โหลด alias map ก่อนคำนวณทุกครั้งที่ fetch (แก้ `loadVipRanking` 1 บรรทัด)
**anchor:** ใน `loadVipRanking()` หลัง `await authReady;`:
```javascript
await ensureAliasMapLoaded();
```

### 3.5 HTML — Modal ตรวจชื่อซ้ำ
**anchor:** วางคู่กับ modal อื่นๆ ก่อน `<!-- Cloud Load Modal -->`:
```html
<!-- Merge Suggest Modal (v7) -->
<div id="mergeSuggestModal" class="fixed inset-0 bg-black/50 z-[100] hidden items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
    <div class="bg-white dark:bg-dark-800 rounded-2xl shadow-2xl w-full max-w-xl max-h-[80vh] overflow-hidden border border-slate-200 dark:border-slate-700 flex flex-col">
        <div class="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 flex justify-between items-center text-white shrink-0">
            <h3 class="text-base font-bold flex items-center gap-2"><i class="ph-bold ph-link"></i> ตรวจชื่อลูกค้าซ้ำ</h3>
            <button onclick="closeMergeSuggestModal()" class="text-white/80 hover:text-white"><i class="ph-bold ph-x text-xl"></i></button>
        </div>
        <div id="mergeSuggestBody" class="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-3"></div>
    </div>
</div>
```

### 3.6 JS — เปิด/ปิด modal + merge action
**anchor:** วางท้าย `findMergeCandidates`:
```javascript
function openMergeSuggestModal() {
    const candidates = findMergeCandidates(vipRankingFull);
    const body = document.getElementById('mergeSuggestBody');
    if (candidates.length === 0) {
        body.innerHTML = `<p class="text-center text-slate-400 py-8">ไม่พบชื่อที่คล้ายกันในรายการปัจจุบัน 🎉</p>`;
    } else {
        body.innerHTML = candidates.map((c, i) => `
            <div class="border border-slate-200 dark:border-slate-700 rounded-xl p-4" id="merge-candidate-${i}">
                <p class="text-xs text-slate-400 mb-2">คล้ายกัน ${(c.similarity * 100).toFixed(0)}%</p>
                <div class="flex items-center justify-between gap-2 mb-3 flex-wrap">
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${c.nameA}</span>
                    <i class="ph-bold ph-arrows-left-right text-slate-400"></i>
                    <span class="text-sm font-bold text-slate-700 dark:text-slate-200">${c.nameB}</span>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="mergeCustomerNames('${c.nameA.replace(/'/g, "\\'")}', '${c.nameB.replace(/'/g, "\\'")}', ${i})" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 rounded-lg" title="รวมเข้าเป็นชื่อซ้าย">ใช้ชื่อซ้าย</button>
                    <button onclick="mergeCustomerNames('${c.nameB.replace(/'/g, "\\'")}', '${c.nameA.replace(/'/g, "\\'")}', ${i})" class="flex-1 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold py-2 rounded-lg" title="รวมเข้าเป็นชื่อขวา">ใช้ชื่อขวา</button>
                    <button onclick="dismissMergeCandidate(${i})" class="text-slate-400 hover:text-red-500 text-xs px-3 py-2 shrink-0">ไม่ใช่คนเดียวกัน</button>
                </div>
            </div>`).join('');
    }
    document.getElementById('mergeSuggestModal').classList.remove('hidden');
    document.getElementById('mergeSuggestModal').classList.add('flex');
}

function closeMergeSuggestModal() {
    document.getElementById('mergeSuggestModal').classList.add('hidden');
    document.getElementById('mergeSuggestModal').classList.remove('flex');
}

function dismissMergeCandidate(i) {
    const el = document.getElementById('merge-candidate-' + i);
    if (el) el.remove();
}

async function mergeCustomerNames(canonicalName, variantName, candidateIdx) {
    try {
        await window.db.collection(CUSTOMER_ALIAS_COLLECTION).add({
            canonicalName, variantName,
            mergedAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        vipCustomerAliasMap[variantName] = canonicalName;
        showToast(`รวม "${variantName}" เข้ากับ "${canonicalName}" แล้ว (จำถาวร)`);
        dismissMergeCandidate(candidateIdx);

        // re-aggregate ranking ของช่วงที่ดูอยู่ให้เห็นผลทันที (ใช้ cache เดิม ไม่ fetch ซ้ำ)
        const docIds = dateRangeToDocIds(vipLastFetchStart, vipLastFetchEnd);
        const rangeRecords = docIds.flatMap(id => vipDayCache[id] || []);
        const ranking = aggregateVipCustomers(rangeRecords);
        renderVipRanking(ranking, rangeRecords.length, docIds.length);
    } catch (e) {
        showToast("รวมชื่อไม่สำเร็จ: " + e.message, "error");
        console.error(e);
    }
}
```

## 4. ข้อควรระวัง

- **Threshold 0.82 เป็นค่าประมาณ** อาจมี false positive/negative บ้าง — มีปุ่ม "ไม่ใช่คนเดียวกัน" ให้ dismiss ทิ้งได้ ไม่มีผลถาวร (dismiss แค่ระดับ session/modal เปิดครั้งนั้น เปิดใหม่จะเจอคู่เดิมอีกถ้ายังไม่ merge — ยอมรับได้ เพราะปุ่มกดเองอยู่แล้ว ไม่ auto)
- **bucket ตามคำแรกหลัง normalize** อาจพลาดคู่ที่ชื่อคล้ายกันแต่คำแรกต่างกันจริงๆ (เช่น พิมพ์ผิดตัวแรกไปเลย) — เป็น trade-off เพื่อความเร็ว ยอมรับได้ในสเกลลูกค้าหลักพันราย
- **alias เป็น global ไม่ผูกกับช่วงวันที่** — merge ครั้งเดียวมีผลกับทุกช่วง/ทุกเดือนที่ดูต่อจากนี้ไป (ตรงตามที่ขอ "จำถาวร")
- **ไม่แก้ `customerName` ในข้อมูลต้นทาง (`records[]`) เลย** — alias เป็นชั้น mapping แยก ปลอดภัยกว่าการไปแก้ข้อมูลจริงย้อนหลังจำนวนมาก ย้อนกลับได้ง่ายกว่าถ้า merge ผิด (แค่ลบ alias doc ทิ้ง)
- **merge ผิดแก้เองได้แค่ผ่าน Firestore Console** ตอนนี้ (ยังไม่มี UI "ยกเลิกการรวม" ในแอป) — ถ้าใช้บ่อยแล้วพลาดบ่อยค่อยเพิ่ม UI ลบ alias ทีหลัง
- read-heavy เพิ่มขึ้นเล็กน้อย (1 read เพิ่มต่อครั้งที่ fetch ช่วงใหม่ สำหรับโหลด alias collection ทั้งหมด — เล็กน้อยเพราะ collection นี้ขนาดเล็ก)

## 5. Verify ที่บ้าน

1. พิมพ์ค้นหาในตาราง VIP → กรองตรงชื่อ ไม่กระทบ `vipRangeInfo` (ตัวเลขรวมยังโชว์ของทั้งช่วงเดิม)
2. เคลียร์ช่องค้นหา → กลับมาเห็นครบเหมือนเดิม
3. fetch ช่วงใหม่ (เปลี่ยนเดือน/ช่วง) → ช่องค้นหาเคลียร์อัตโนมัติ
4. กด "ตรวจชื่อซ้ำ" → เจอคู่ที่คล้ายกันจริง (ทดสอบกับข้อมูลจริงที่มี LINE/[GW] ปนกัน) % ความคล้ายสมเหตุสมผล
5. กด "ใช้ชื่อซ้าย/ขวา" → ranking รวมเป็นแถวเดียวทันที (ยอด/จำนวนบิลรวมกันถูกต้อง) ไม่ต้อง fetch ใหม่
6. reload หน้าแล้วดึงข้อมูลช่วงเดิมอีกครั้ง → merge ที่ทำไว้ยังมีผล (ยืนยันว่า alias ถาวรจริง ไม่ใช่แค่ session)
7. กด "ไม่ใช่คนเดียวกัน" → การ์ดนั้นหายจาก modal ไม่มีผลกับ ranking
8. ทดสอบตอนไม่มีคู่คล้ายกันเลย → ข้อความ "ไม่พบชื่อที่คล้ายกัน" ไม่ error
9. Dark mode + มือถือ 375px: ช่องค้นหา/ปุ่ม/modal ไม่ล้น

## 6. เช็คก่อนเริ่ม

- [ ] backup เก็บที่ scratchpad เท่านั้น
- [ ] deploy ตาม workflow ปกติ — push เฉพาะ "Go Online"
