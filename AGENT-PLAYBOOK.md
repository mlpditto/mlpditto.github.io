# Agent Playbook — how to work on this repo at Fable-5 level

Purpose: this file encodes the *working method* and *project knowledge* that produced
high-quality results on this codebase. Load it as context (or reference it from CLAUDE.md)
so any model — Opus, Sonnet, or newer — reproduces the same discipline. Raw model
capability differs; most of the observed quality comes from the loop below, which any
capable model can follow.

---

## 1. The core loop

Every task, no exceptions:

```
Understand intent → Ground in real code → Propose (if design) → Implement → Verify empirically → Report outcome first
```

1. **Understand intent, not just the words.** Ask: what is the user actually trying to
   *see or do*? Example from history: user asked "click chip → show only that type's
   profit". The literal reading (swap the big number) added nothing — the number was
   already on the chip. The real value was that the monthly table had no "อื่น ๆ" column
   at all. Find the gap the request is circling around, and say it out loud before coding.
2. **Ground every claim in the actual code.** Never propose from memory of a file.
   Grep/read the exact functions, CSS blocks, and event bindings involved *before*
   answering. If you catch yourself writing "probably" about this codebase, go read it.
3. **Propose → approve for anything with design tradeoffs.** This user (Thai speaker,
   lean-UI taste) wants options with a clear recommendation, then a go-ahead. Small
   mechanical fixes: just do them. New interactions, layout changes, semantics changes:
   propose first, with the tradeoffs of each option and which one you'd pick and why.
4. **Implement with full blast-radius awareness** (checklist in §3).
5. **Verify by running it, not by re-reading it** (recipes in §4).
6. **Report the outcome in the first sentence**, then the evidence. Never end with an
   unverified "should work".

## 2. Thinking principles that mattered here

- **Question the semantics of every conditional.** `entry[col] ? value : "—"` treats a
  0-sum as "no data". But NHSO bills legitimately have cost 0 — so "—" and "0" mean
  different things (no bills vs. bills summing to zero) and must render differently.
  Whenever a truthiness check guards display logic, ask: is falsy really "absent"?
- **Redundancy is a design smell to act on.** Two bars that both filter the same table
  belong together; the reason they felt cluttered was location, not styling. Look for
  "these two things are the same job" before polishing either one separately.
- **Make the important thing the only loud thing.** Five amber chips = a wall, and the
  WARN chip (most important) drowned. Lean UI here = neutral by default, one focal
  element keeps full color, active/pressed states earn their fill.
- **Edge cases are part of the feature, not follow-ups.** When adding the chip-focus
  feature, the same change included: focus auto-reset when the focused type vanishes
  from the date range, Enter-key not bubbling into the card popup, drill popup support
  for the new "other" column, and the empty-state label. Ship the feature *with* its
  edges or it will come back as bugs.
- **When a tool result looks wrong, verify before reacting.** A grep once showed `\`
  where the file had `//` — reading the actual file showed a display artifact. Never
  "fix" the codebase based on one suspicious tool output.
- **Honesty about what happened.** If the screenshot tool hangs, say so and verify
  another way (DOM inspection). If a mock triggers WARN as a side effect, label it a
  mock artifact. Report failures plainly; never paper over them.

## 3. Before-editing checklist (blast radius)

This codebase is a single large HTML/CSS/JS app with global state. Before changing UI:

- [ ] **CSS has TWO layers.** `public/cknc.css` has base styles (top ~4100 lines) and a
      redesign/theme layer (`/* --- Surfaces --- */` onward, ~line 4150+). Many selectors
      (`.tab-button`, surfaces groups) are defined in BOTH. Grep the selector across the
      whole file and update every occurrence.
- [ ] **Dark mode is manual.** Every color change needs its `html.dark ...` counterpart.
      Vars that flip automatically: `--mint`, `--green-dark`, `--muted`, `--line`,
      `--panel`, `--amber-soft`. Hardcoded hexes do NOT flip.
- [ ] **Generic `button` styles are heavy** (min-height 40px, padding 0 15px, border,
      hover translateY+shadow). Turning any element into a `<button>` requires explicit
      resets (`min-height: 0`, `transform: none`, `box-shadow: none` on hover).
- [ ] **Event delegation + interactive nesting.** KPI cards are `role="button"` with a
      document-level click handler that skips `button, input, select, textarea, a`
      targets — and a keydown handler that needs the SAME skip (this was a real bug).
      Any new clickable inside a clickable needs both paths checked.
- [ ] **Render functions rebuild innerHTML.** Attach listeners to stable containers
      (delegation), never to rendered children. Transient UI state lives in module-level
      objects (e.g. `caseFocus`), NOT in `state` (which gets serialized to sessions).
- [ ] **Grid column counts are hardcoded** in `.monthly-cases-row` variants. Changing
      the number of rendered `<span>`s requires a matching `grid-template-columns` rule
      (see `.focus-one`). Modal cards have a similar pitfall — grid rows that stack
      children; override with flex column when adding children.
- [ ] **Check media queries** for the selectors you touch (`@media` blocks exist in both
      CSS layers).

## 4. Verification recipes (this project)

Static site — serve `public/` (there is `.claude/launch.json` → `cknc-static`, port 4173).

**Mock data to exercise the analyze view** (paste into browser console / preview_eval):

```js
let n = 0;
const mk = (caseType, month, sale, cost) => ({
  orderId: 'ORD' + (++n), billNo: 'B' + n, billKey: 'K' + n, status: 'matched',
  billingStage: 'billed', barNo: 'BAR' + n, creditNos: 'AR' + n, caseType,
  sale, cost, mlpCost: 0, profit: sale - cost,
  clicknicDate: '2026-' + month + '-15', items: [], drugName: 'ยา' + n,
});
state.bills = [ mk('nhso','06',10,0), mk('insurance','05',700,499.67), /* ... */ ];
state.billOverrides = {};
state.snapshotMode = true; // สำคัญ: ไม่ตั้ง = rebuildBillsForCurrentMode() เรียก buildBills() จาก raw rows แล้ว mock หายทันทีที่แก้อะไรในตาราง
document.querySelectorAll('.view-panel').forEach(p => p.hidden = p.id !== 'viewAnalyze');
renderMetrics(); renderTabs(); renderTable();
```

Note: autosave-restore เป็น async — inject mock + จำลอง event + assert ให้จบใน eval เดียว
(state.bills อาจถูก restore ทับระหว่าง eval สองครั้ง). Bills ที่มี `medicines` ให้ใส่
`{ medicine, qty, sale, cost }` ต่อบรรทัด (sale = ราคา CKNC เรียกประกัน, cost = ราคา MLP คิด CKNC).

Key facts for building mocks:
- Revenue counting (`countsInRevenue`): `billingStage === "paid"` OR
  (`"billed"` AND non-empty `barNo`). Without `barNo`, sale/cost/profit are all 0.
- `primaryBillDate` = `clicknicDate || mlpDate || billingDueDate`.
- Statuses: `matched | mlp-only | clicknic-only | pending-billing | billing-only`.
- Case types: `nhso | insurance | general | unknown`; "อื่น ๆ" in cards = NOT nhso/insurance.
- Identical mock rows trigger the WARN duplicate detector — vary `drugName` if that noise matters.

**Verification standard**: reproduce the user's exact reported scenario, click through
the interaction (on AND off states, toggling, keyboard), check dark + light and a wide
(1600px) + default viewport. `preview_screenshot` is flaky/hangs — when it times out,
verify via DOM/`getComputedStyle` inspection instead and say you did.

## 5. Communication contract (this user)

- **Thai** for all user-facing text; code comments in the repo are Thai — match them.
- **พ.ศ. (Buddhist era)** for displayed dates by default.
- Lead with the outcome/answer, then reasoning. Explain *cause* before *fix* when
  answering "ทำไม" questions — and for pure questions, assess first, don't auto-fix
  unless the fix is small and clearly wanted.
- For UI proposals, a visual mockup comparing "ปัจจุบัน vs แนวทาง 1/2" communicates far
  better than prose; give 2–3 options + a recommendation with structural reasoning.
- Keep changes lean; delete dead code you orphan (and grep to prove it's dead first).

## 6. Domain model (billing reconciliation)

- Three data sources reconciled: **CLICKNIC** (orders), **MEDLIFE PLUS / MLP** (drug
  items), **Billing Note / BAR** (invoices).
- **BAR** = เลขใบวางบิล (from file name), **AR** = เลขที่เครดิต; 1 BAR : N AR.
- Billing stages: `billed` (needs BAR + AR), `paid`, `insurance-review`,
  `nhso-pending`, `general-pending`, `pending-review`, `no-mlp`, `cancelled`.
- NHSO (สปสช) economics: default sale 10/bill, cost usually 0 — this is why
  zero-vs-absent display distinctions matter.

## 7. Deploy workflow ("Go Online")

1. Bump `?v=` cache-busters in `public/cknc.html` (both the CSS link and JS script tag)
   with every behavioral change — format `yyyymmddHHMMSS`-ish.
2. `firebase deploy --only hosting` (project: fkb-front-kanban).
3. `git commit` + `git push` ONLY when the user says **"Go Online"** — deploy and push
   happen together at that point, not before.

## 8. Anti-patterns observed to avoid

- Implementing the literal request without surfacing the higher-value adjacent fix.
- Editing one CSS layer and shipping a light-mode-only change.
- Trusting a single flaky tool result (screenshot, odd grep rendering) over the file.
- Asking permission for reversible small steps mid-task (just do them), or conversely
  executing a redesign without the propose→approve step.
- Ending a turn with "น่าจะใช้ได้" — if it wasn't run, it isn't done.
