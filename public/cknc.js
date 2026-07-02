const SAMPLE_FILES = {
  clicknic: [
    "export-salee-order-28_06_2569.xlsx",
    "export-salee-order-28_06_2569-2.xlsx",
  ],
  mlp: "mlpcknc.xlsx",
  billing: ["BillingNote.xlsx"],
};

const CKNC_LIFF_ID = "2008999002-KiowNNUL";
const CKNC_ALLOWED_ADMINS = ["medlifeplus@gmail.com"];

const state = {
  clicknicRows: [],
  manualClicknicRows: [],
  clicknicImportSummary: { rawRows: 0, uniqueRows: 0, duplicateRows: 0 },
  mlpRows: [],
  billingRows: [],
  bills: [],
  billOverrides: {},
  topMeds: [],
  activeStatus: "all",
  currentManualBill: null,
  currentDetailKey: "",
  screenshotObjectUrl: "",
  screenshotFile: null,
  auditTrail: [],
  authUser: null,
  activeSessionId: "",
  snapshotMode: false,
  activeClipboardKind: "",
  autosaveTimer: null,
  autosaveInFlight: false,
  autosavePending: false,
  lastAutosaveAt: "",
  masterProducts: [],
  medicineAliasMap: new Map(),
  medicineMappingLoaded: false,
  ruleConfig: null,
};

const $ = (id) => document.getElementById(id);

const elements = {
  clicknicFiles: $("clicknicFiles"),
  mlpFile: $("mlpFile"),
  billingFiles: $("billingFiles"),
  pasteClicknicBtn: $("pasteClicknicBtn"),
  pasteMlpBtn: $("pasteMlpBtn"),
  pasteBillingBtn: $("pasteBillingBtn"),
  clipboardModal: $("clipboardModal"),
  clipboardTitle: $("clipboardTitle"),
  closeClipboardModal: $("closeClipboardModal"),
  readClipboardBtn: $("readClipboardBtn"),
  clipboardStatus: $("clipboardStatus"),
  clipboardPreview: $("clipboardPreview"),
  clipboardPreviewHead: $("clipboardPreviewHead"),
  clipboardPreviewBody: $("clipboardPreviewBody"),
  clipboardSummary: $("clipboardSummary"),
  cancelClipboardImport: $("cancelClipboardImport"),
  confirmClipboardImport: $("confirmClipboardImport"),
  statusText: $("statusText"),
  autosaveStatus: $("autosaveStatus"),
  clicknicStatus: $("clicknicStatus"),
  mlpStatus: $("mlpStatus"),
  billingStatus: $("billingStatus"),
  exportCsvBtn: $("exportCsvBtn"),
  exportXlsxBtn: $("exportXlsxBtn"),
  exportPdfBtn: $("exportPdfBtn"),
  saveSessionBtn: $("saveSessionBtn"),
  openSessionsBtn: $("openSessionsBtn"),
  sessionModal: $("sessionModal"),
  closeSessionModal: $("closeSessionModal"),
  refreshSessionsBtn: $("refreshSessionsBtn"),
  sessionList: $("sessionList"),
  sessionStatus: $("sessionStatus"),
  loadSampleBtn: $("loadSampleBtn"),
  searchInput: $("searchInput"),
  caseTypeFilter: $("caseTypeFilter"),
  billingStageFilter: $("billingStageFilter"),
  dateField: $("dateField"),
  dateFrom: $("dateFrom"),
  dateTo: $("dateTo"),
  sortBy: $("sortBy"),
  expectedBillingAmount: $("expectedBillingAmount"),
  targetDate: $("targetDate"),
  showTargetDateBtn: $("showTargetDateBtn"),
  clearFiltersBtn: $("clearFiltersBtn"),
  quickDateFilters: $("quickDateFilters"),
  mergeAssistant: $("mergeAssistant"),
  cardDetailModal: $("cardDetailModal"),
  cardDetailTitle: $("cardDetailTitle"),
  cardDetailSummary: $("cardDetailSummary"),
  cardDetailBody: $("cardDetailBody"),
  cardDetailHeadRow: $("cardDetailHeadRow"),
  cardDetailChips: $("cardDetailChips"),
  cardDetailFilterBtn: $("cardDetailFilterBtn"),
  closeCardDetailModal: $("closeCardDetailModal"),
  billTableBody: $("billTableBody"),
  tableSummary: $("tableSummary"),
  topMedicines: $("topMedicines"),
  screenshotModal: $("screenshotModal"),
  screenshotForm: $("screenshotForm"),
  closeScreenshotModal: $("closeScreenshotModal"),
  cancelScreenshotEntry: $("cancelScreenshotEntry"),
  screenshotInput: $("screenshotInput"),
  screenshotPreview: $("screenshotPreview"),
  runOcrBtn: $("runOcrBtn"),
  ocrStatus: $("ocrStatus"),
  manualOrderId: $("manualOrderId"),
  manualOrw: $("manualOrw"),
  manualInv: $("manualInv"),
  manualDate: $("manualDate"),
  manualMedicineRows: $("manualMedicineRows"),
  addMedicineLineBtn: $("addMedicineLineBtn"),
  manualNote: $("manualNote"),
  manualEntrySummary: $("manualEntrySummary"),
  auditSummary: $("auditSummary"),
  auditList: $("auditList"),
  exportAuditBtn: $("exportAuditBtn"),
  detailDrawer: $("detailDrawer"),
  closeDetailDrawer: $("closeDetailDrawer"),
  drawerTitle: $("drawerTitle"),
  drawerSummary: $("drawerSummary"),
  drawerMedicines: $("drawerMedicines"),
  editStatus: $("editStatus"),
  editOrw: $("editOrw"),
  editInvoice: $("editInvoice"),
  editClicknicDate: $("editClicknicDate"),
  editMlpDate: $("editMlpDate"),
  editBillingDueDate: $("editBillingDueDate"),
  editPatient: $("editPatient"),
  editBillingStage: $("editBillingStage"),
  editMlpCost: $("editMlpCost"),
  editSale: $("editSale"),
  editProfit: $("editProfit"),
  editBilledAmount: $("editBilledAmount"),
  editExcluded: $("editExcluded"),
  editExcludeReason: $("editExcludeReason"),
  editOverrideNote: $("editOverrideNote"),
  saveOverrideBtn: $("saveOverrideBtn"),
  resetOverrideBtn: $("resetOverrideBtn"),
  yearEraToggleBtn: $("yearEraToggleBtn"),
  authGateTitle: $("authGateTitle"),
  authGateMessage: $("authGateMessage"),
  authGateAction: $("authGateAction"),
  masterMappingStatus: $("masterMappingStatus"),
  ruleInsuranceWords: $("ruleInsuranceWords"),
  ruleNhsoWords: $("ruleNhsoWords"),
  ruleGeneralWords: $("ruleGeneralWords"),
  ruleBillingTolerance: $("ruleBillingTolerance"),
  ruleProfitTolerance: $("ruleProfitTolerance"),
  ruleCostOverSaleBuffer: $("ruleCostOverSaleBuffer"),
  applyRulesBtn: $("applyRulesBtn"),
  resetRulesBtn: $("resetRulesBtn"),
  ruleSummary: $("ruleSummary"),
  ruleSuggestions: $("ruleSuggestions"),
};

const tabCountIds = {
  all: "tabCountAll",
  matched: "tabCountMatched",
  paid: "tabCountPaid",
  "case-insurance": "tabCountCaseInsurance",
  "case-nhso": "tabCountCaseNhso",
  "mlp-only": "tabCountMlpOnly",
  "pending-billing": "tabCountPendingBilling",
  "clicknic-only": "tabCountClickOnly",
  "billing-only": "tabCountBillingOnly",
  excluded: "tabCountExcluded",
};

const statusOptions = [
  ["matched", "จับคู่แล้ว"],
  ["mlp-only", "MLP ไม่มีรายการยา"],
  ["pending-billing", "รอใบวางบิล"],
  ["clicknic-only", "รายการยาไม่มี MLP"],
  ["billing-only", "ใบวางบิลไม่เจอ MLP"],
];

const caseTypeOptions = [
  ["unknown", "ไม่ทราบ"],
  ["insurance", "ประกัน"],
  ["nhso", "สปสช"],
  ["general", "ทั่วไป/อื่นๆ"],
];

// สปสช: ยอดขายเริ่มต้นต่อบิล (กำไรเริ่มที่ 10 ก่อนหักค่าใช้จ่าย MLP) ต้นทุนเริ่มต้น 0
const NHSO_DEFAULT_SALE = 10;

const billingStageOptions = [
  ["billed", "วางบิลแล้ว"],
  ["paid", "PAID"],
  ["insurance-review", "ประกันรอเอกสาร/อนุมัติ"],
  ["nhso-pending", "สปสชรอวางบิล"],
  ["general-pending", "ทั่วไปรอวางบิล"],
  ["pending-review", "รอตรวจสอบ"],
  ["billing-only", "ใบวางบิลไม่เจอ MLP"],
  ["no-mlp", "ยังไม่มี MLP"],
  ["cancelled", "ยกเลิก"],
];

const RULE_CONFIG_STORAGE_KEY = "cknc_rule_config_v1";

const DEFAULT_RULE_CONFIG = {
  caseKeywords: {
    insurance: ["ประกัน", "insurance", "claim", "เคลม", "aia", "allianz", "เมืองไทย", "กรุงเทพประกัน", "วิริยะ", "ทิพย", "axa", "chubb", "fwd"],
    nhso: ["สปสช", "nhso", "โรคทั่วไป", "บัตรทอง", "uc", "หลักประกันสุขภาพ"],
    general: ["ทั่วไป", "เงินสด", "cash", "self pay", "self-pay"],
  },
  billingAmountTolerance: 0.01,
  negativeProfitTolerance: 0,
  mlpCostOverSaleBuffer: 0,
};

const metricIds = {
  clickOrders: "metricClickOrders",
  matched: "metricMatched",
  mlpOnly: "metricMlpOnly",
  clickOnly: "metricClickOnly",
  sale: "metricSale",
  cost: "metricCost",
  mlpCost: "metricMlpCost",
  billingRows: "metricBillingRows",
  mlpNoBilling: "metricMlpNoBilling",
  billingOnly: "metricBillingOnly",
  profit: "metricProfit",
  caseInsurance: "metricCaseInsurance",
  caseNhso: "metricCaseNhso",
  caseUnknown: "metricCaseUnknown",
  billingInsurancePending: "metricBillingInsurancePending",
  billingNhsoPending: "metricBillingNhsoPending",
  billingReviewPending: "metricBillingReviewPending",
};

function money(value) {
  return Number(value || 0).toLocaleString("th-TH", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  });
}

function number(value) {
  return Number(value || 0).toLocaleString("th-TH");
}

function clean(value) {
  return value == null ? "" : String(value).trim();
}

function cloneDefaultRuleConfig() {
  return JSON.parse(JSON.stringify(DEFAULT_RULE_CONFIG));
}

function parseRuleWords(value) {
  return clean(value)
    .split(/[\n,|;]+/)
    .map((word) => clean(word).toLowerCase())
    .filter(Boolean);
}

function mergeRuleConfig(config = {}) {
  const base = cloneDefaultRuleConfig();
  const incomingKeywords = config.caseKeywords || {};
  return {
    caseKeywords: {
      insurance: parseRuleWords(incomingKeywords.insurance || base.caseKeywords.insurance),
      nhso: parseRuleWords(incomingKeywords.nhso || base.caseKeywords.nhso),
      general: parseRuleWords(incomingKeywords.general || base.caseKeywords.general),
    },
    billingAmountTolerance: toNumeric(config.billingAmountTolerance ?? base.billingAmountTolerance),
    negativeProfitTolerance: toNumeric(config.negativeProfitTolerance ?? base.negativeProfitTolerance),
    mlpCostOverSaleBuffer: toNumeric(config.mlpCostOverSaleBuffer ?? base.mlpCostOverSaleBuffer),
  };
}

function loadRuleConfigFromStorage() {
  try {
    const stored = localStorage.getItem(RULE_CONFIG_STORAGE_KEY);
    state.ruleConfig = mergeRuleConfig(stored ? JSON.parse(stored) : DEFAULT_RULE_CONFIG);
  } catch (error) {
    console.warn("Rule config load failed", error);
    state.ruleConfig = mergeRuleConfig(DEFAULT_RULE_CONFIG);
  }
}

function saveRuleConfigToStorage() {
  try {
    localStorage.setItem(RULE_CONFIG_STORAGE_KEY, JSON.stringify(state.ruleConfig));
  } catch (error) {
    console.warn("Rule config save failed", error);
  }
}

function activeRuleConfig() {
  if (!state.ruleConfig) state.ruleConfig = mergeRuleConfig(DEFAULT_RULE_CONFIG);
  return state.ruleConfig;
}

function normalizeMedicineKey(value) {
  return clean(value)
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[(){}\[\],;|]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function splitAliasText(value) {
  if (Array.isArray(value)) return value.map(clean).filter(Boolean);
  return clean(value).split(/[\n,|;]+/).map(clean).filter(Boolean);
}

function productAliases(product = {}) {
  return [
    product.id,
    product.name,
    product.canonicalName,
    product.companyProductId,
    product.mlpId,
    ...splitAliasText(product.aliases),
    ...splitAliasText(product.medicineAliases),
    ...splitAliasText(product.ckncAliases),
    ...splitAliasText(product.linemanAliases),
  ].filter(Boolean);
}

function rebuildMedicineAliasMap() {
  const aliasMap = new Map();
  state.masterProducts.forEach((product) => {
    const canonicalName = clean(product.canonicalName || product.name || product.id);
    if (!canonicalName) return;
    productAliases(product).forEach((alias) => {
      const key = normalizeMedicineKey(alias);
      if (key) aliasMap.set(key, { name: canonicalName, id: product.id || product.name || canonicalName });
    });
  });
  state.medicineAliasMap = aliasMap;
}

function resolveMedicineName(value) {
  const raw = clean(value);
  const match = state.medicineAliasMap.get(normalizeMedicineKey(raw));
  return {
    raw,
    medicine: match?.name || raw,
    masterProductId: match?.id || "",
    mapped: Boolean(match && match.name !== raw),
  };
}

function renderMasterMappingStatus() {
  if (!elements.masterMappingStatus) return;
  const mappedAliases = state.medicineAliasMap.size;
  elements.masterMappingStatus.textContent = state.medicineMappingLoaded
    ? `เชื่อม master_products จาก LINE MAN แล้ว ${number(state.masterProducts.length)} รายการ / alias ${number(mappedAliases)} ชื่อ`
    : "ยังไม่ได้โหลด master mapping จาก LINE MAN";
}

function setTextareaWords(textarea, words = []) {
  if (textarea) textarea.value = [...new Set(words.map(clean).filter(Boolean))].join("\n");
}

function populateRuleEditor() {
  const config = activeRuleConfig();
  setTextareaWords(elements.ruleInsuranceWords, config.caseKeywords.insurance);
  setTextareaWords(elements.ruleNhsoWords, config.caseKeywords.nhso);
  setTextareaWords(elements.ruleGeneralWords, config.caseKeywords.general);
  if (elements.ruleBillingTolerance) elements.ruleBillingTolerance.value = config.billingAmountTolerance;
  if (elements.ruleProfitTolerance) elements.ruleProfitTolerance.value = config.negativeProfitTolerance;
  if (elements.ruleCostOverSaleBuffer) elements.ruleCostOverSaleBuffer.value = config.mlpCostOverSaleBuffer;
}

function collectRuleEditorConfig() {
  return mergeRuleConfig({
    caseKeywords: {
      insurance: parseRuleWords(elements.ruleInsuranceWords?.value),
      nhso: parseRuleWords(elements.ruleNhsoWords?.value),
      general: parseRuleWords(elements.ruleGeneralWords?.value),
    },
    billingAmountTolerance: toNumeric(elements.ruleBillingTolerance?.value),
    negativeProfitTolerance: toNumeric(elements.ruleProfitTolerance?.value),
    mlpCostOverSaleBuffer: toNumeric(elements.ruleCostOverSaleBuffer?.value),
  });
}

function knownRuleWords() {
  const { caseKeywords } = activeRuleConfig();
  return new Set(Object.values(caseKeywords).flat().map((word) => normalizeMedicineKey(word)).filter(Boolean));
}

function ruleSuggestionCandidates() {
  const known = knownRuleWords();
  const ignored = new Set(["บริษัท", "จำกัด", "สาขา", "สำนักงาน", "ลูกค้า", "ขายสินค้าให้กับลูกค้า", "staff", "orw", "inv", "ar"]);
  const counts = new Map();
  state.bills
    .filter((bill) => (bill.caseType || "unknown") === "unknown")
    .forEach((bill) => {
      const text = [bill.caseText, bill.patient, bill.medicinesText, bill.medicineRawText].map(clean).join(" ").toLowerCase();
      const tokens = text.match(/[\p{L}\p{N}.+-]{3,}/gu) || [];
      tokens.forEach((token) => {
        const word = clean(token).replace(/^[,.;:()\[\]{}]+|[,.;:()\[\]{}]+$/g, "");
        const key = normalizeMedicineKey(word);
        if (!key || known.has(key) || ignored.has(key)) return;
        if (/^(orw|inv|ar)-/i.test(word) || /^020\d{13}$/.test(word) || /^\d+([./:-]\d+)*$/.test(word)) return;
        counts.set(word, (counts.get(word) || 0) + 1);
      });
    });
  return [...counts.entries()]
    .map(([word, count]) => ({ word, count }))
    .sort((a, b) => b.count - a.count || a.word.localeCompare(b.word))
    .slice(0, 12);
}

function renderRulePanel() {
  if (!elements.ruleSummary || !elements.ruleSuggestions) return;
  const metrics = calculateMetrics();
  const validationCount = validationReportRows().length;
  const suggestions = ruleSuggestionCandidates();
  elements.ruleSummary.textContent = `Unknown ${number(metrics.caseUnknown)} บิล | validation ${number(validationCount)} รายการ | tolerance ${money(billingAmountTolerance())}`;
  elements.ruleSuggestions.innerHTML = suggestions.length
    ? suggestions.map((item) => `
      <div class="rule-suggestion">
        <strong>${htmlEscape(item.word)}</strong>
        <span>${number(item.count)} บิล</span>
        <button type="button" data-add-rule-word="${htmlEscape(item.word)}" data-rule-type="insurance">ประกัน</button>
        <button type="button" data-add-rule-word="${htmlEscape(item.word)}" data-rule-type="nhso">สปสช</button>
        <button type="button" data-add-rule-word="${htmlEscape(item.word)}" data-rule-type="general">ทั่วไป</button>
      </div>
    `).join("")
    : `<div class="empty">ยังไม่มีคำแนะนำจากเคส unknown</div>`;
}

function applyRuleEditor() {
  state.ruleConfig = collectRuleEditorConfig();
  saveRuleConfigToStorage();
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderRulePanel();
  renderAuditTrail();
  scheduleAutosave("rule-tuning");
}

function resetRuleEditor() {
  state.ruleConfig = mergeRuleConfig(DEFAULT_RULE_CONFIG);
  populateRuleEditor();
  saveRuleConfigToStorage();
  applyRuleEditor();
}

function addRuleWord(caseType, word) {
  if (!["insurance", "nhso", "general"].includes(caseType) || !clean(word)) return;
  const textarea = {
    insurance: elements.ruleInsuranceWords,
    nhso: elements.ruleNhsoWords,
    general: elements.ruleGeneralWords,
  }[caseType];
  const words = parseRuleWords(textarea?.value);
  if (!words.some((item) => normalizeMedicineKey(item) === normalizeMedicineKey(word))) words.push(clean(word));
  setTextareaWords(textarea, words);
  applyRuleEditor();
}

async function loadMasterProductMappings() {
  if (!window.db) {
    renderMasterMappingStatus();
    return;
  }
  try {
    const snapshot = await window.db.collection("master_products").get();
    state.masterProducts = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    state.medicineMappingLoaded = true;
    rebuildMedicineAliasMap();
    renderMasterMappingStatus();
    if (state.clicknicRows.length || state.manualClicknicRows.length) renderAll();
  } catch (error) {
    console.warn("Master product mapping load failed", error);
    state.medicineMappingLoaded = false;
    renderMasterMappingStatus();
  }
}

function setAuthGate(title, message, showAction = false) {
  if (elements.authGateTitle) elements.authGateTitle.textContent = title;
  if (elements.authGateMessage) elements.authGateMessage.textContent = message;
  if (elements.authGateAction) elements.authGateAction.hidden = !showAction;
}

function unlockApp(message = "") {
  document.body.classList.remove("auth-pending");
  setSessionButtons();
  if (message) console.info(message);
  restoreLatestSnapshotOnStartup();
}

function waitForFirebaseUser() {
  if (!window.auth) return Promise.resolve(null);
  return new Promise((resolve) => {
    const unsubscribe = window.auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
}

function canAccessCknc(userData = {}) {
  return userData.role === "admin" || userData.access?.cknc === true;
}

async function verifyCkncAccess() {
  const isLocalDev = ["localhost", "127.0.0.1"].includes(window.location.hostname);
  if (isLocalDev) {
    const user = window.auth?.currentUser || null;
    state.authUser = user ? { uid: user.uid, email: user.email || "", displayName: user.displayName || "" } : { uid: "local-dev", email: "", displayName: "Local Dev" };
    unlockApp("CKNC local dev mode");
    return;
  }

  try {
    setAuthGate("กำลังตรวจสอบสิทธิ์ CKNC", "กรุณารอสักครู่ ระบบกำลังตรวจสอบสิทธิ์จาก MLP HUB");
    const user = await waitForFirebaseUser();
    if (user && CKNC_ALLOWED_ADMINS.includes(user.email)) {
      state.authUser = { uid: user.uid, email: user.email || "", displayName: user.displayName || "" };
      unlockApp(`CKNC access granted for ${user.email}`);
      return;
    }
    if (user && window.db) {
      const userDoc = await window.db.collection("users").doc(user.uid).get();
      if (userDoc.exists && canAccessCknc(userDoc.data())) {
        state.authUser = { uid: user.uid, email: user.email || "", displayName: user.displayName || "", role: userDoc.data().role || "" };
        unlockApp(`CKNC access granted for ${user.uid}`);
        return;
      }
    }
    if (window.liff && window.db) {
      await window.liff.init({ liffId: CKNC_LIFF_ID });
      if (window.liff.isLoggedIn()) {
        const profile = await window.liff.getProfile();
        const userDoc = await window.db.collection("users").doc(profile.userId).get();
        if (userDoc.exists && canAccessCknc(userDoc.data())) {
          state.authUser = { uid: profile.userId, email: "", displayName: profile.displayName || "", role: userDoc.data().role || "", source: "line" };
          unlockApp(`CKNC access granted for LINE user ${profile.userId}`);
          return;
        }
      }
    }
    setAuthGate("ไม่มีสิทธิ์เข้า CKNC", "กรุณากลับไป MLP HUB และให้ admin เปิดสิทธิ์ CKNC ให้บัญชีนี้", true);
  } catch (error) {
    console.error(error);
    setAuthGate("ตรวจสอบสิทธิ์ไม่สำเร็จ", "กรุณาลองเข้าใหม่จาก MLP HUB หรือแจ้งผู้ดูแลระบบ", true);
  }
}

function toNumeric(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(clean(value).replace(/,/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

function parseDateValue(value) {
  const text = clean(value);
  if (!text) return null;
  const serial = Number(text);
  if (Number.isFinite(serial) && serial > 20000 && serial < 80000) {
    const date = new Date(Date.UTC(1899, 11, 30 + serial));
    return Number.isNaN(date.getTime()) ? null : date;
  }
  const match = text.match(/(\d{1,4})[/-](\d{1,2})[/-](\d{1,4})/);
  if (!match) return null;
  let day;
  let month;
  let year;
  if (match[1].length === 4) {
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  } else {
    day = Number(match[1]);
    month = Number(match[2]);
    year = Number(match[3]);
  }
  if (year > 2400) year -= 543;
  const date = new Date(Date.UTC(year, month - 1, day));
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateKey(value) {
  const date = parseDateValue(value);
  return date ? date.toISOString().slice(0, 10) : "";
}

const YEAR_ERA_STORAGE_KEY = "cknc_year_era";
let yearEra = "be";
try {
  const savedYearEra = localStorage.getItem(YEAR_ERA_STORAGE_KEY);
  if (savedYearEra === "ce" || savedYearEra === "be") yearEra = savedYearEra;
} catch (error) {
  /* ignore */
}

function formatDisplayDate(value) {
  const date = parseDateValue(value);
  if (!date) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear() + (yearEra === "be" ? 543 : 0);
  return `${day}/${month}/${year}`;
}

function primaryBillDate(bill) {
  return dateKey(bill.clicknicDate || bill.mlpDate || bill.billingDueDate);
}

function isWithinDateRange(bill) {
  const from = elements.dateFrom.value;
  const to = elements.dateTo.value;
  if (!from && !to) return true;

  const fields = elements.dateField.value === "any"
    ? ["clicknicDate", "mlpDate", "billingDueDate"]
    : [elements.dateField.value];

  return fields.some((field) => {
    const key = dateKey(bill[field]);
    if (!key) return false;
    if (from && key < from) return false;
    if (to && key > to) return false;
    return true;
  });
}

function findOrderId(value) {
  const text = clean(value);
  const direct = text.match(/020\d{13}/);
  if (direct) return direct[0];
  const digits = text.replace(/\D/g, "");
  if (digits.length === 15 && digits.startsWith("2026")) return `0${digits}`;
  if (digits.length === 16 && digits.startsWith("020")) return digits;
  return "";
}

function extractRefs(value) {
  const text = clean(value);
  return {
    ar: text.match(/AR-\d{5}-\d{2}-\d{4,}/g) || [],
    orw: text.match(/ORW-\d{5}-\d{2}-\d{4,}/g) || [],
    inv: text.match(/INV-\d{5}-\d{2}-\d{4,}/g) || [],
  };
}

function caseTypeLabel(value) {
  return caseTypeOptions.find(([key]) => key === value)?.[1] || "ไม่ทราบ";
}

function billingStageLabel(value) {
  return billingStageOptions.find(([key]) => key === value)?.[1] || "รอตรวจสอบ";
}

function deriveBillingStage(status, caseType, billedAmount, billingNo) {
  if (status === "billing-only") return { billingStage: "billing-only", billingStageSource: "auto-status" };
  if (status === "clicknic-only") return { billingStage: "no-mlp", billingStageSource: "auto-status" };
  if (toNumeric(billedAmount) > 0 || clean(billingNo)) return { billingStage: "billed", billingStageSource: "auto-billing" };
  if (caseType === "insurance") return { billingStage: "insurance-review", billingStageSource: "auto-case-type" };
  if (caseType === "nhso") return { billingStage: "nhso-pending", billingStageSource: "auto-case-type" };
  if (caseType === "general") return { billingStage: "general-pending", billingStageSource: "auto-case-type" };
  return { billingStage: "pending-review", billingStageSource: "auto-no-billing" };
}

function detectCaseType(...parts) {
  const text = parts.map(clean).filter(Boolean).join(" ").toLowerCase();
  if (!text) return { caseType: "unknown", caseTypeSource: "auto-empty" };

  const { caseKeywords } = activeRuleConfig();
  const insuranceWords = caseKeywords.insurance || [];
  const nhsoWords = caseKeywords.nhso || [];
  const generalWords = caseKeywords.general || [];
  if (nhsoWords.some((word) => text.includes(word))) return { caseType: "nhso", caseTypeSource: "auto-keyword" };
  if (insuranceWords.some((word) => text.includes(word))) return { caseType: "insurance", caseTypeSource: "auto-keyword" };
  if (generalWords.some((word) => text.includes(word))) return { caseType: "general", caseTypeSource: "auto-keyword" };
  return { caseType: "unknown", caseTypeSource: "auto-no-match" };
}

// จุดสังเกตจากราคาหลังบวก%: สปสช มักเป็น 1, ประกัน/จ่ายจริง มักมากกว่า 1
function priceCaseSignal(click) {
  if (!click || !Array.isArray(click.medicines)) return null;
  const priced = click.medicines.filter((row) => toNumeric(row.unitSale) > 0);
  if (!priced.length) return null;
  if (priced.some((row) => toNumeric(row.unitSale) > 1)) return "insurance";
  if (priced.every((row) => toNumeric(row.unitSale) === 1)) return "nhso";
  return null;
}

function normalizeHeader(header) {
  return clean(header).replace(/\s+/g, "");
}

function sheetToRows(workbook) {
  const sheetName = workbook.SheetNames[0];
  return XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
    header: 1,
    defval: "",
    raw: false,
  });
}

async function readWorkbookFromFile(file) {
  const buffer = await file.arrayBuffer();
  return XLSX.read(buffer, { type: "array", cellDates: false });
}

async function readWorkbookFromPath(path) {
  const response = await fetch(`/sample/${encodeURIComponent(path)}`);
  if (!response.ok) throw new Error(`ไม่สามารถอ่านไฟล์ตัวอย่างได้: ${path}`);
  const buffer = await response.arrayBuffer();
  return XLSX.read(buffer, { type: "array", cellDates: false });
}

function parseDelimitedLine(line, delimiter) {
  const cells = [];
  let value = "";
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
      continue;
    }
    if (char === '"') {
      quoted = !quoted;
      continue;
    }
    if (char === delimiter && !quoted) {
      cells.push(value);
      value = "";
      continue;
    }
    value += char;
  }
  cells.push(value);
  return cells;
}

function clipboardTextToRows(text) {
  const normalized = clean(text).replace(/\r\n/g, "\n").replace(/\r/g, "\n");
  if (!normalized) return [];
  const lines = normalized.split("\n").filter((line) => clean(line));
  const delimiter = normalized.includes("\t") ? "\t" : ",";
  return lines.map((line) => parseDelimitedLine(line, delimiter));
}

function workbookFromClipboardText(text, sheetName = "Clipboard") {
  const rows = clipboardTextToRows(text);
  if (!rows.length) throw new Error("Clipboard is empty");
  return {
    SheetNames: [sheetName],
    Sheets: {
      [sheetName]: XLSX.utils.aoa_to_sheet(rows),
    },
  };
}

function parseClicknicWorkbook(workbook, sourceName) {
  const rows = sheetToRows(workbook);
  if (!rows.length) return [];
  const headers = rows[0].map(normalizeHeader);

  const findIndex = (...candidates) => {
    const normalized = candidates.map(normalizeHeader);
    return headers.findIndex((header) => normalized.includes(header));
  };

  const indexes = {
    order: findIndex("เลขที่รายการยา"),
    date: findIndex("วันที่สั่งซื้อ"),
    medicine: findIndex("ชื่อยา"),
    qty: findIndex("จำนวน"),
    unitSale: findIndex("ราคาต่อหน่วยหลังบวก%"),
    sale: findIndex("ราคารวมหลังบวก%"),
    unitCost: findIndex("ราคาต่อหน่วยก่อนบวก%"),
    cost: findIndex("รวมราคาก่อนบวก%"),
  };

  if (indexes.order < 0 || indexes.medicine < 0) {
    throw new Error(`ไฟล์ ${sourceName} ไม่พบหัวตาราง CLICKNIC ที่จำเป็น`);
  }

  return rows.slice(1).map((row) => {
    const orderId = findOrderId(row[indexes.order]);
    return {
      orderId,
      date: clean(row[indexes.date]),
      medicine: clean(row[indexes.medicine]),
      medicineRaw: clean(row[indexes.medicine]),
      qty: toNumeric(row[indexes.qty]),
      unitSale: toNumeric(row[indexes.unitSale]),
      sale: toNumeric(row[indexes.sale]),
      unitCost: toNumeric(row[indexes.unitCost]),
      cost: toNumeric(row[indexes.cost]),
      sourceName,
    };
  }).filter((row) => row.orderId && row.medicine);
}

function clicknicDuplicateKey(row) {
  return [
    row.orderId,
    clean(row.date).replace(/\s+/g, " "),
    clean(row.medicine).toLowerCase().replace(/\s+/g, " "),
    Number(row.qty || 0).toFixed(4),
    Number(row.sale || 0).toFixed(4),
    Number(row.cost || 0).toFixed(4),
  ].join("|");
}

function dedupeClicknicRows(rows) {
  const seen = new Map();
  const duplicates = [];
  rows.forEach((row) => {
    const key = clicknicDuplicateKey(row);
    if (seen.has(key)) {
      duplicates.push({ duplicate: row, original: seen.get(key) });
      return;
    }
    seen.set(key, row);
  });
  const uniqueRows = [...seen.values()];
  state.clicknicImportSummary = {
    rawRows: rows.length,
    uniqueRows: uniqueRows.length,
    duplicateRows: duplicates.length,
  };
  return uniqueRows;
}

function extractPatientFromMemo(value) {
  const text = clean(value).replace(/\s+/g, " ");
  if (!text) return "";
  const segments = text.split(/\s*-\s*/).map(clean).filter(Boolean);
  const phoneIndex = segments.findIndex((part) => /^0\d{8,9}$/.test(part));
  if (phoneIndex > 0) return segments[phoneIndex - 1];
  const orderIndex = segments.findIndex((part) => findOrderId(part));
  const afterOrder = orderIndex >= 0 ? segments.slice(orderIndex + 1) : segments;
  const candidate = afterOrder.find((part) => {
    if (!part || /^0\d{8,9}$/.test(part)) return false;
    if (findOrderId(part) || /^(ORW|INV|AR)-/i.test(part)) return false;
    if (/\d{4,}/.test(part)) return false;
    return /[A-Za-zก-๙]/.test(part);
  });
  return candidate || "";
}

function parseMlpWorkbook(workbook, sourceName) {
  const rows = sheetToRows(workbook);
  return rows.map((row, index) => {
    const joined = row.map(clean).filter(Boolean).join(" ");
    const detail = clean(row[5]) || joined;
    const orderId = findOrderId(joined);
    const refs = extractRefs(joined);
    const referenceNo = clean(row[0]) || refs.orw[0] || "";
    if (index === 0 && !orderId && !refs.orw.length && !refs.inv.length) return null;
    const detailParts = detail.split("-");
    const patientName = extractPatientFromMemo(detail);
    return {
      orderId,
      referenceNo,
      memoOrderId: orderId,
      orw: referenceNo,
      date: clean(row[1]),
      invoice: clean(row[2]),
      company: clean(row[3]),
      mlpCost: toNumeric(row[4]),
      detail,
      patient: patientName || (detailParts.length > 1 ? detailParts[1] : ""),
      phone: detailParts.find((part) => /^0\d{8,9}$/.test(part)) || "",
      staff: clean(row[6]),
      sourceName,
      rowNumber: index + 1,
    };
  }).filter((row) => row && (row.orderId || row.orw || row.detail));
}

function billingDueDateFromCells(cells) {
  return cells.find((cell) => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean(cell))) || "";
}

function billingAmountFromCells(cells) {
  const amountCandidates = cells
    .map((cell, index) => ({ value: toNumeric(cell), index, text: clean(cell) }))
    .filter((item) => item.value > 0 && !/^\d{1,3}$/.test(item.text));
  if (amountCandidates.length) return amountCandidates[amountCandidates.length - 1].value;

  const fallbackCandidates = cells
    .map((cell) => toNumeric(cell))
    .filter((value) => value > 0);
  return fallbackCandidates.length ? fallbackCandidates[fallbackCandidates.length - 1] : 0;
}

function extractBarNo(value) {
  const match = clean(value).toUpperCase().match(/BAR-\d{5}-\d{2}-\d+/);
  return match ? match[0] : "";
}

function parseBillingRecord(cells, sourceName, sheetName, rowNumber) {
  const text = cells.map(clean).filter(Boolean).join(" ");
  const refs = extractRefs(text);
  if (!refs.orw.length && !refs.inv.length && !refs.ar.length) return null;
  return {
    bar: extractBarNo(sourceName) || extractBarNo(text),
    ar: refs.ar[0] || "",
    orw: refs.orw[0] || "",
    inv: refs.inv[0] || "",
    dueDate: billingDueDateFromCells(cells),
    amount: billingAmountFromCells(cells),
    rawText: text,
    sourceName,
    sheetName,
    rowNumber,
  };
}

function parseBillingWorkbook(workbook, sourceName) {
  const parsed = [];
  workbook.SheetNames.forEach((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: false,
    });
    let pendingRecord = null;
    const flushPendingRecord = () => {
      if (!pendingRecord) return;
      const record = parseBillingRecord(pendingRecord.cells, sourceName, sheetName, pendingRecord.rowNumber);
      if (record) parsed.push(record);
      pendingRecord = null;
    };

    rows.forEach((row, index) => {
      const cells = row.map(clean).filter(Boolean);
      const text = cells.join(" ");
      const refs = extractRefs(text);
      if (!cells.length) return;

      if (refs.ar.length) {
        flushPendingRecord();
        pendingRecord = { cells: [...cells], rowNumber: index + 1 };
        return;
      }

      if (pendingRecord) {
        pendingRecord.cells.push(...cells);
        return;
      }

      const record = parseBillingRecord(cells, sourceName, sheetName, index + 1);
      if (record) parsed.push(record);
    });
    flushPendingRecord();
  });
  return parsed;
}

function aggregateClicknic(rows) {
  const byOrder = new Map();
  const medMap = new Map();

  rows.forEach((row) => {
    const resolved = resolveMedicineName(row.medicineRaw || row.medicine);
    const normalizedRow = {
      ...row,
      medicineRaw: row.medicineRaw || row.medicine,
      medicine: resolved.medicine,
      medicineMasterId: resolved.masterProductId,
      medicineMapped: resolved.mapped,
    };
    if (!byOrder.has(row.orderId)) {
      byOrder.set(row.orderId, {
        orderId: row.orderId,
        clicknicDate: row.date,
        medicines: [],
        qty: 0,
        sale: 0,
        cost: 0,
        sources: new Set(),
      });
    }
    const bill = byOrder.get(row.orderId);
    bill.medicines.push(normalizedRow);
    bill.qty += normalizedRow.qty;
    bill.sale += normalizedRow.sale;
    bill.cost += normalizedRow.cost;
    bill.sources.add(normalizedRow.sourceName);

    const key = normalizedRow.medicine || "ไม่ระบุชื่อยา";
    const med = medMap.get(key) || { medicine: key, qty: 0, sale: 0, cost: 0, lines: 0, rawNames: new Set(), mappedLines: 0 };
    med.qty += normalizedRow.qty;
    med.sale += normalizedRow.sale;
    med.cost += normalizedRow.cost;
    med.lines += 1;
    if (normalizedRow.medicineRaw && normalizedRow.medicineRaw !== key) med.rawNames.add(normalizedRow.medicineRaw);
    if (normalizedRow.medicineMapped) med.mappedLines += 1;
    medMap.set(key, med);
  });

  return {
    byOrder,
    topMeds: [...medMap.values()]
      .map((item) => ({ ...item, rawNames: [...item.rawNames] }))
      .sort((a, b) => b.qty - a.qty || b.sale - a.sale)
      .slice(0, 8),
  };
}

function aggregateMlp(rows) {
  const byOrder = new Map();
  rows.forEach((row) => {
    const key = row.orderId || `NO-ID-${row.rowNumber}`;
    if (!byOrder.has(key)) {
      byOrder.set(key, {
        orderId: row.orderId,
        orwList: [],
        invoiceList: [],
        referenceList: [],
        memoOrderIds: [],
        mlpDate: row.date,
        mlpCost: 0,
        patient: row.patient,
        rows: [],
      });
    }
    const bill = byOrder.get(key);
    bill.orwList.push(row.orw);
    if (row.invoice) bill.invoiceList.push(row.invoice);
    if (row.referenceNo) bill.referenceList.push(row.referenceNo);
    if (row.memoOrderId) bill.memoOrderIds.push(row.memoOrderId);
    bill.mlpCost += row.mlpCost;
    bill.rows.push(row);
  });
  return byOrder;
}

function aggregateBilling(rows) {
  const byRef = new Map();
  rows.forEach((row) => {
    [row.orw, row.inv].filter(Boolean).forEach((ref) => {
      if (!byRef.has(ref)) byRef.set(ref, []);
      byRef.get(ref).push(row);
    });
  });
  return byRef;
}

function billKeyForOrder(key) {
  return `order:${key}`;
}

function applyBillOverride(bill) {
  const override = state.billOverrides[bill.billKey];
  if (!override) return bill;
  const merged = { ...bill, ...override.values, hasOverride: true, overrideNote: override.note || "" };
  merged.profit = (merged.sale || 0) - (merged.cost || 0) - (merged.mlpCost || 0);
  return merged;
}

function moneyDiff(a, b) {
  return Math.abs(toNumeric(a) - toNumeric(b));
}

function billingAmountTolerance() {
  return Math.max(0, toNumeric(activeRuleConfig().billingAmountTolerance));
}

function expectedBillingForBill(bill) {
  const configured = toNumeric(elements.expectedBillingAmount?.value);
  return configured > 0 ? configured : toNumeric(bill.mlpCost);
}

function pushIssue(issues, level, code, text) {
  issues.push({ level, code, text });
}

function validationRulesForBill(bill) {
  const issues = [];
  if (bill.excluded) {
    pushIssue(issues, "info", "EXCLUDED", `ไม่นับคำนวณ${bill.excludeReason ? `: ${bill.excludeReason}` : ""}`);
  }
  if (bill.status === "mlp-only") {
    pushIssue(issues, "danger", "MLP_NO_MEDICINE", "MLP ไม่มีรายการยา");
  }
  if (bill.status === "pending-billing") {
    pushIssue(issues, "warn", "PENDING_BILLING", "รอใบวางบิล");
  }
  if (bill.status === "billing-only") {
    pushIssue(issues, "danger", "BILLING_NOT_IN_MLP", "ใบวางบิลไม่เจอ MLP");
  }
  if (bill.status === "clicknic-only") {
    pushIssue(issues, "danger", "CLICKNIC_NOT_IN_MLP", "รายการยาไม่มี MLP");
  }
  if (bill.profit < -Math.max(0, toNumeric(activeRuleConfig().negativeProfitTolerance))) {
    pushIssue(issues, "warn", "NEGATIVE_PROFIT", "กำไรติดลบ");
  }
  if (bill.clicknicDate && bill.mlpDate && dateKey(bill.clicknicDate) !== dateKey(bill.mlpDate)) {
    pushIssue(issues, "info", "DATE_MISMATCH", `วันที่ CKNC (${formatDisplayDate(bill.clicknicDate)}) ไม่ตรงกับ MLP (${formatDisplayDate(bill.mlpDate)})`);
  }
  if ((bill.status === "matched" || bill.status === "pending-billing") && toNumeric(bill.mlpCost) <= 0) {
    pushIssue(issues, "warn", "MISSING_MLP_COST", "ไม่มีค่าใช้จ่าย MLP");
  }
  if (bill.status === "matched" && toNumeric(bill.billedAmount) <= 0 && state.billingRows.length) {
    pushIssue(issues, "warn", "MISSING_BILLED_AMOUNT", "ยังไม่มียอดใบวางบิล");
  }
  if (bill.status === "billing-only" && !bill.billingNo) {
    pushIssue(issues, "warn", "MISSING_AR", "ใบวางบิลไม่มีเลข AR");
  }
  if (toNumeric(bill.mlpCost) > 0 && toNumeric(bill.sale) > 0 && toNumeric(bill.mlpCost) > toNumeric(bill.sale) + Math.max(0, toNumeric(activeRuleConfig().mlpCostOverSaleBuffer))) {
    pushIssue(issues, "danger", "MLP_COST_OVER_SALE", "ค่าใช้จ่าย MLP สูงกว่ายอดขายยา");
  }
  if (bill.billedAmount > 0) {
    const expected = expectedBillingForBill(bill);
    const tolerance = billingAmountTolerance();
    if (expected > 0 && moneyDiff(bill.billedAmount, expected) > tolerance) {
      pushIssue(issues, "warn", "BILLED_AMOUNT_EXPECTED_MISMATCH", `ยอดใบวางบิลไม่ตรงค่าที่คาดไว้ ${money(expected)}`);
    }
    if (toNumeric(bill.mlpCost) > 0 && moneyDiff(bill.billedAmount, bill.mlpCost) > tolerance) {
      pushIssue(issues, "info", "BILLED_AMOUNT_MLP_COST_MISMATCH", `ยอดใบวางบิลไม่ตรง MLP cost ${money(bill.mlpCost)}`);
    }
  }
  return issues;
}

function buildBills() {
  const allClicknicRows = [...state.clicknicRows, ...state.manualClicknicRows];
  const { byOrder: clicknicByOrder, topMeds } = aggregateClicknic(allClicknicRows);
  const mlpByOrder = aggregateMlp(state.mlpRows);
  const billingByRef = aggregateBilling(state.billingRows);
  const keys = new Set([...clicknicByOrder.keys(), ...mlpByOrder.keys()]);
  const usedBillingRows = new Set();

  state.topMeds = topMeds;
  state.bills = [...keys].map((key) => {
    const click = clicknicByOrder.get(key);
    const mlp = mlpByOrder.get(key);
    const hasManualMedicines = Boolean(click?.medicines.some((row) => row.sourceType === "screenshot"));
    const mlpRefs = [
      ...(mlp?.orwList || []),
      ...(mlp?.invoiceList || []),
    ].filter(Boolean);
    const billingMatches = mlpRefs.flatMap((ref) => billingByRef.get(ref) || []);
    const uniqueBilling = [...new Map(billingMatches.map((row) => [`${row.sourceName}:${row.sheetName}:${row.rowNumber}`, row])).values()];
    uniqueBilling.forEach((row) => usedBillingRows.add(`${row.sourceName}:${row.sheetName}:${row.rowNumber}`));
    const sale = click?.sale || 0;
    const cost = click?.cost || 0;
    const mlpCost = mlp?.mlpCost || 0;
    const billedAmount = uniqueBilling.reduce((sum, row) => sum + row.amount, 0);
    const barNos = [...new Set(uniqueBilling.map((row) => row.bar).filter(Boolean))];
    const arNos = [...new Set(uniqueBilling.map((row) => row.ar).filter(Boolean))];
    const billingNo = (barNos.length ? barNos : arNos).join(", ");
    let status = "matched";
    if (!click) status = "mlp-only";
    if (!mlp) status = "clicknic-only";
    if (click && mlp && state.billingRows.length && !uniqueBilling.length) status = "pending-billing";
    const caseTextParts = [
      mlp?.rows.map((row) => [row.detail, row.patient, row.company, row.staff].join(" ")).join(" "),
      click?.medicines.map((row) => [row.medicine, row.medicineRaw].filter(Boolean).join(" ")).join(" "),
      uniqueBilling.map((row) => row.rawText).join(" "),
    ];
    const caseDetection = detectCaseType(...caseTextParts);
    const priceSignal = priceCaseSignal(click);
    let caseType = caseDetection.caseType;
    let caseTypeSource = caseDetection.caseTypeSource;
    if (caseType === "unknown" && priceSignal) {
      caseType = priceSignal;
      caseTypeSource = "auto-price";
    }
    // รอใบวางบิล: ส่วนใหญ่เป็นเคสประกัน → ตั้งเริ่มต้นเมื่อยังจับประเภทไม่ได้
    if (caseType === "unknown" && status === "pending-billing") {
      caseType = "insurance";
      caseTypeSource = "auto-status";
    }
    // สปสช: CLICKNIC ส่งยาให้ MLP ฟรี → ต้นทุน 0 และตั้งยอดขายเริ่มต้น 10 (กำไรเริ่มที่ 10 ก่อนหักค่าใช้จ่าย MLP) แก้ไขได้
    let billSale = sale;
    let billCost = cost;
    if (caseType === "nhso") {
      billSale = NHSO_DEFAULT_SALE;
      billCost = 0;
    }
    const billingStageDetection = deriveBillingStage(status, caseType, billedAmount, billingNo);
    const bill = applyBillOverride({
      billKey: billKeyForOrder(key),
      status,
      caseType,
      caseTypeSource,
      priceSignal,
      billingStage: billingStageDetection.billingStage,
      billingStageSource: billingStageDetection.billingStageSource,
      caseText: caseTextParts.map(clean).filter(Boolean).join(" "),
      orderId: key.startsWith("NO-ID-") ? "" : key,
      orw: mlp?.orwList.filter(Boolean).join(", ") || "",
      invoice: mlp?.invoiceList.join(", ") || "",
      billingNo,
      billingRefs: uniqueBilling.map((row) => [row.ar, row.orw, row.inv].filter(Boolean).join(" / ")).join(", "),
      mlpReferenceNos: [...new Set(mlp?.referenceList || [])].filter(Boolean).join(", "),
      mlpMemoOrderIds: [...new Set(mlp?.memoOrderIds || [])].filter(Boolean).join(", "),
      clicknicDate: click?.clicknicDate || "",
      mlpDate: mlp?.mlpDate || "",
      billingDueDate: uniqueBilling.map((row) => row.dueDate).filter(Boolean)[0] || "",
      patient: mlp?.patient || "",
      medicineCount: click?.medicines.length || 0,
      medicinesText: click?.medicines.map((item) => `${item.medicine} x${number(item.qty)}`).join(", ") || "",
      medicineRawText: click?.medicines.map((item) => item.medicineRaw).filter(Boolean).join(", ") || "",
      hasManualMedicines,
      auditIds: [...new Set(click?.medicines.map((item) => item.auditId).filter(Boolean) || [])].join(", "),
      excluded: false,
      excludeReason: "",
      sale: billSale,
      cost: billCost,
      mlpCost,
      billedAmount,
      profit: billSale - billCost - mlpCost,
    });
    bill.validationIssues = validationRulesForBill(bill);
    return bill;
  });

  state.billingRows.forEach((row) => {
    const key = `${row.sourceName}:${row.sheetName}:${row.rowNumber}`;
    if (usedBillingRows.has(key)) return;
    const caseDetection = detectCaseType(row.rawText);
    const billingStageDetection = deriveBillingStage("billing-only", caseDetection.caseType, row.amount, row.ar);
    const bill = applyBillOverride({
      billKey: `billing:${key}`,
      status: "billing-only",
      caseType: caseDetection.caseType,
      caseTypeSource: caseDetection.caseTypeSource,
      billingStage: billingStageDetection.billingStage,
      billingStageSource: billingStageDetection.billingStageSource,
      caseText: row.rawText,
      orderId: "",
      orw: row.orw,
      invoice: row.inv,
      billingNo: row.bar || row.ar,
      billingRefs: [row.ar, row.orw, row.inv].filter(Boolean).join(" / "),
      mlpReferenceNos: "",
      mlpMemoOrderIds: "",
      clicknicDate: "",
      mlpDate: "",
      billingDueDate: row.dueDate,
      patient: "",
      medicineCount: 0,
      medicinesText: "",
      medicineRawText: "",
      hasManualMedicines: false,
      auditIds: "",
      excluded: false,
      excludeReason: "",
      sale: 0,
      cost: 0,
      mlpCost: 0,
      billedAmount: row.amount,
      profit: 0,
    });
    bill.validationIssues = validationRulesForBill(bill);
    state.bills.push(bill);
  });
}

function activeBills() {
  return state.bills.filter((bill) => !bill.excluded);
}

function calculateMetrics() {
  const bills = activeBills();
  const clickOrders = new Set([...state.clicknicRows, ...state.manualClicknicRows].map((row) => row.orderId)).size;
  const matched = bills.filter((bill) => bill.status === "matched").length;
  const mlpOnly = bills.filter((bill) => bill.status === "mlp-only").length;
  const clickOnly = bills.filter((bill) => bill.status === "clicknic-only").length;
  const billingRows = state.billingRows.length;
  const mlpNoBilling = bills.filter((bill) => bill.status === "pending-billing").length;
  const billingOnly = bills.filter((bill) => bill.status === "billing-only").length;
  const sale = bills.reduce((sum, bill) => sum + bill.sale, 0);
  const cost = bills.reduce((sum, bill) => sum + bill.cost, 0);
  const mlpCost = bills.reduce((sum, bill) => sum + bill.mlpCost, 0);
  const profit = bills
    .filter((bill) => bill.status === "matched" || bill.status === "pending-billing")
    .reduce((sum, bill) => sum + bill.profit, 0);
  const caseInsurance = bills.filter((bill) => bill.caseType === "insurance").length;
  const caseNhso = bills.filter((bill) => bill.caseType === "nhso").length;
  const caseUnknown = bills.filter((bill) => !bill.caseType || bill.caseType === "unknown").length;
  const billingInsurancePending = bills.filter((bill) => bill.billingStage === "insurance-review").length;
  const billingNhsoPending = bills.filter((bill) => bill.billingStage === "nhso-pending").length;
  const billingReviewPending = bills.filter((bill) => bill.billingStage === "pending-review").length;
  return { clickOrders, matched, mlpOnly, clickOnly, billingRows, mlpNoBilling, billingOnly, sale, cost, mlpCost, profit, caseInsurance, caseNhso, caseUnknown, billingInsurancePending, billingNhsoPending, billingReviewPending };
}

function updateEmptyState() {
  document.body.classList.toggle("cknc-has-data", state.bills.length > 0);
}

function setStepStatus(el, count) {
  if (!el) return;
  el.innerHTML = count
    ? `<i class="fa-solid fa-circle-check"></i> โหลดแล้ว ${number(count)} รายการ`
    : "ยังไม่ได้โหลด";
  el.classList.toggle("loaded", count > 0);
}

function renderStepStatuses() {
  setStepStatus(elements.clicknicStatus, state.clicknicRows.length + state.manualClicknicRows.length);
  setStepStatus(elements.mlpStatus, state.mlpRows.length);
  setStepStatus(elements.billingStatus, state.billingRows.length);
}

function allStepsLoaded() {
  return (state.clicknicRows.length + state.manualClicknicRows.length) > 0 && state.mlpRows.length > 0 && state.billingRows.length > 0;
}

// เมื่อข้อมูลครบทั้ง 3 step ครั้งแรก → บันทึกขึ้น cloud ทันที (ไม่รอ debounce)
function maybeAutosaveOnComplete() {
  if (state.snapshotMode) return;
  if (!allStepsLoaded()) {
    state.allStepsComplete = false;
    return;
  }
  if (state.allStepsComplete) return;
  state.allStepsComplete = true;
  if (!canPersistSessions()) {
    autosaveStatusText("Autosave: ครบ 3 ฝั่งแล้ว — รอ login เพื่อบันทึกขึ้น cloud");
    return;
  }
  clearTimeout(state.autosaveTimer);
  autosaveStatusText("Autosave: ครบ 3 ฝั่ง กำลังบันทึกขึ้น cloud...");
  autosaveMonthlySession("all-steps-complete");
}

function renderMetrics() {
  updateEmptyState();
  const metrics = calculateMetrics();
  Object.entries(metricIds).forEach(([key, id]) => {
    $(id).textContent = ["sale", "cost", "mlpCost", "profit"].includes(key) ? money(metrics[key]) : number(metrics[key]);
    const card = $(id)?.closest(".metric");
    if (card) {
      card.dataset.summaryCard = key;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `ดูรายละเอียด ${card.querySelector("span")?.textContent || key}`);
      if (card.classList.contains("mini")) card.classList.toggle("is-zero", !toNumeric(metrics[key]));
    }
  });
}

function clicknicDateBuckets() {
  const buckets = new Map();
  const sourceRows = [...state.clicknicRows, ...state.manualClicknicRows];
  if (sourceRows.length) {
    sourceRows.forEach((row) => {
      const key = dateKey(row.date);
      if (!key) return;
      const bucket = buckets.get(key) || { date: key, orders: new Set(), lines: 0 };
      bucket.orders.add(row.orderId);
      bucket.lines += 1;
      buckets.set(key, bucket);
    });
  } else {
    state.bills.forEach((bill) => {
      const key = dateKey(bill.clicknicDate);
      if (!key) return;
      const bucket = buckets.get(key) || { date: key, orders: new Set(), lines: 0 };
      if (bill.orderId) bucket.orders.add(bill.orderId);
      bucket.lines += bill.medicineCount || 1;
      buckets.set(key, bucket);
    });
  }
  return [...buckets.values()].sort((a, b) => b.date.localeCompare(a.date));
}

function renderQuickDateFilters() {
  if (!elements.quickDateFilters) return;
  const buckets = clicknicDateBuckets();
  if (!buckets.length) {
    elements.quickDateFilters.innerHTML = `<span class="date-chip-note">หลัง import CLICKNIC จะมีปุ่มเลือกวันจาก Excel ตรงนี้</span>`;
    return;
  }
  const activeFrom = elements.dateFrom.value;
  const activeTo = elements.dateTo.value;
  elements.quickDateFilters.innerHTML = [
    `<button class="date-chip ${!activeFrom && !activeTo ? "active" : ""}" type="button" data-clicknic-date="all">ทุกวัน CLICKNIC</button>`,
    ...buckets.map((bucket) => `
      <button class="date-chip ${activeFrom === bucket.date && activeTo === bucket.date ? "active" : ""}" type="button" data-clicknic-date="${bucket.date}">
        ${formatDisplayDate(bucket.date)} <span>(${number(bucket.orders.size)})</span>
      </button>
    `),
  ].join("");
}

function mergeAssistantData() {
  const bills = activeBills();
  const total = bills.length;
  const clickOrders = new Set([...state.clicknicRows, ...state.manualClicknicRows].map((row) => row.orderId).filter(Boolean)).size || bills.filter((bill) => bill.orderId).length;
  const withMlp = bills.filter((bill) => bill.status !== "clicknic-only" && bill.status !== "billing-only").length;
  const withBilling = bills.filter((bill) => clean(bill.billingNo) || toNumeric(bill.billedAmount) > 0).length;
  const exactOrderMatch = bills.filter((bill) => bill.orderId && bill.status !== "clicknic-only" && bill.status !== "billing-only").length;
  const refMatch = bills.filter((bill) => clean(bill.billingRefs)).length;
  const needsMlp = bills.filter((bill) => bill.status === "clicknic-only").length;
  const needsBilling = bills.filter((bill) => bill.status === "pending-billing").length;
  const billingOnly = bills.filter((bill) => bill.status === "billing-only").length;
  const confident = bills.filter((bill) => bill.orderId && bill.orw && (bill.billingNo || bill.status === "pending-billing")).length;
  return { total, clickOrders, withMlp, withBilling, exactOrderMatch, refMatch, needsMlp, needsBilling, billingOnly, confident };
}

function renderMergeAssistant() {
  if (!elements.mergeAssistant) return;
  const data = mergeAssistantData();
  const confidence = data.total ? Math.round((data.confident / data.total) * 100) : 0;
  const steps = [
    { key: "mergeClicknicBase", label: "CLICKNIC", value: data.clickOrders, hint: "1. CLICKNIC base: ใช้วันที่จาก Excel เป็นแกนรายวัน" },
    { key: "mergeMlpMemo", label: "MLP memo", value: data.exactOrderMatch, hint: "2. MLP by memo: จับจากเลขที่รายการยาในบันทึกช่วยจำ" },
    { key: "mergeBillingRef", label: "Billing ref", value: data.refMatch, hint: "3. Billing by ref: จับจาก ORW / INV / AR" },
  ];
  elements.mergeAssistant.innerHTML = `
    <div class="merge-line">
      <span class="merge-line-title" title="เส้นทางจับคู่ 3 ฝั่ง: CLICKNIC เลขที่รายการยา → MLP บันทึกช่วยจำ → Billing ORW/INV/AR">Merge 3 ฝั่ง</span>
      ${steps.map((step, index) => `
        ${index ? '<i class="fa-solid fa-arrow-right merge-step-arrow" aria-hidden="true"></i>' : ""}
        <span class="merge-step" data-summary-card="${step.key}" role="button" tabindex="0" title="${htmlEscape(step.hint)}">${step.label} <strong>${number(step.value)}</strong></span>
      `).join("")}
      <strong class="merge-confidence" title="ความมั่นใจการจับคู่ 3 ฝั่ง">${number(confidence)}%</strong>
    </div>
  `;
}

const cardDetailConfigs = {
  clickOrders: {
    title: "บิล CLICKNIC",
    rows: () => activeBills().filter((bill) => bill.orderId && bill.status !== "billing-only"),
    apply: () => ({ status: "all" }),
  },
  matched: {
    title: "ครบ 3 ฝั่ง",
    rows: () => activeBills().filter((bill) => bill.status === "matched"),
    apply: () => ({ status: "matched" }),
  },
  mlpOnly: {
    title: "MLP ไม่มีรายการยา",
    rows: () => activeBills().filter((bill) => bill.status === "mlp-only"),
    apply: () => ({ status: "mlp-only" }),
  },
  mlpNoBilling: {
    title: "MLP รอใบวางบิล",
    rows: () => activeBills().filter((bill) => bill.status === "pending-billing"),
    apply: () => ({ status: "pending-billing" }),
  },
  clickOnly: {
    title: "รายการยาไม่มี MLP",
    rows: () => activeBills().filter((bill) => bill.status === "clicknic-only"),
    apply: () => ({ status: "clicknic-only" }),
  },
  billingRows: {
    title: "มีข้อมูลใบวางบิล",
    rows: () => activeBills().filter((bill) => bill.billingNo || toNumeric(bill.billedAmount) > 0),
  },
  billingOnly: {
    title: "ใบวางบิลไม่เจอ MLP",
    rows: () => activeBills().filter((bill) => bill.status === "billing-only"),
    apply: () => ({ status: "billing-only" }),
  },
  caseInsurance: {
    title: "เคสประกัน",
    rows: () => activeBills().filter((bill) => bill.caseType === "insurance"),
    apply: () => ({ caseType: "insurance" }),
  },
  caseNhso: {
    title: "เคส สปสช",
    rows: () => activeBills().filter((bill) => bill.caseType === "nhso"),
    apply: () => ({ caseType: "nhso" }),
  },
  caseUnknown: {
    title: "ยังไม่ทราบประเภท",
    rows: () => activeBills().filter((bill) => !bill.caseType || bill.caseType === "unknown"),
    apply: () => ({ caseType: "unknown" }),
  },
  billingInsurancePending: {
    title: "ประกันรอเอกสาร",
    rows: () => activeBills().filter((bill) => bill.billingStage === "insurance-review"),
    apply: () => ({ billingStage: "insurance-review" }),
  },
  billingNhsoPending: {
    title: "สปสชรอวางบิล",
    rows: () => activeBills().filter((bill) => bill.billingStage === "nhso-pending"),
    apply: () => ({ billingStage: "nhso-pending" }),
  },
  billingReviewPending: {
    title: "รอตรวจสอบวางบิล",
    rows: () => activeBills().filter((bill) => bill.billingStage === "pending-review"),
    apply: () => ({ billingStage: "pending-review" }),
  },
  sale: {
    title: "ยอดขายยา",
    rows: () => activeBills().filter((bill) => toNumeric(bill.sale) > 0).sort((a, b) => b.sale - a.sale),
  },
  cost: {
    title: "ต้นทุนยา",
    rows: () => activeBills().filter((bill) => toNumeric(bill.cost) > 0).sort((a, b) => b.cost - a.cost),
  },
  mlpCost: {
    title: "ค่าใช้จ่าย MLP",
    rows: () => activeBills().filter((bill) => toNumeric(bill.mlpCost) > 0).sort((a, b) => b.mlpCost - a.mlpCost),
  },
  profit: {
    title: "กำไร matched หลัง MLP",
    rows: () => activeBills().filter((bill) => bill.status === "matched" || bill.status === "pending-billing").sort((a, b) => a.profit - b.profit),
  },
  mergeClicknicBase: {
    title: "Merge: CLICKNIC base",
    rows: () => activeBills().filter((bill) => bill.orderId && bill.status !== "billing-only"),
  },
  mergeMlpMemo: {
    title: "Merge: MLP by memo",
    rows: () => activeBills().filter((bill) => bill.orderId && bill.status !== "clicknic-only" && bill.status !== "billing-only"),
  },
  mergeBillingRef: {
    title: "Merge: Billing by ORW/INV/AR",
    rows: () => activeBills().filter((bill) => clean(bill.billingRefs)),
  },
  mergeNeedsMlp: {
    title: "Merge: ยังไม่มี MLP",
    rows: () => activeBills().filter((bill) => bill.status === "clicknic-only"),
    apply: () => ({ status: "clicknic-only" }),
  },
  mergeNeedsBilling: {
    title: "Merge: รอวางบิล",
    rows: () => activeBills().filter((bill) => bill.status === "pending-billing"),
    apply: () => ({ status: "pending-billing" }),
  },
  mergeBillingOnly: {
    title: "Merge: Billing ไม่เจอ MLP",
    rows: () => activeBills().filter((bill) => bill.status === "billing-only"),
    apply: () => ({ status: "billing-only" }),
  },
};

function summarizeCardRows(rows) {
  return [
    `${number(rows.length)} บิล`,
    `ยอดขาย ${money(rows.reduce((sum, bill) => sum + toNumeric(bill.sale), 0))}`,
    `MLP ${money(rows.reduce((sum, bill) => sum + toNumeric(bill.mlpCost), 0))}`,
    `วางบิล ${money(rows.reduce((sum, bill) => sum + toNumeric(bill.billedAmount), 0))}`,
  ].join(" | ");
}

function shortDisplayDate(value) {
  const full = formatDisplayDate(value);
  return full ? `${full.slice(0, 6)}${full.slice(8)}` : "";
}

function statusBadgesHtml(bill) {
  const badges = [`<span class="badge ${htmlEscape(bill.status || "")}">${htmlEscape(statusLabel(bill.status))}</span>`];
  if (bill.excluded) badges.push(`<span class="badge excluded">Exclude</span>`);
  return badges.join(" ");
}

const cardDetailColumns = [
  {
    label: "จัดการ",
    col: "col-action",
    cellClass: "card-action-cell",
    html: (bill) => `<button class="row-action" type="button" data-card-edit-key="${htmlEscape(bill.billKey)}" title="แก้ไข" aria-label="แก้ไข">✎</button>`,
  },
  {
    label: "บิล / ORW",
    col: "col-ref",
    html: (bill) => {
      const orw = clean(bill.orw);
      const order = clean(bill.orderId);
      const main = orw || order || "-";
      const sub = orw && order ? order : "";
      return `<span class="ref-main">${htmlEscape(main)}</span>${sub ? `<span class="ref-sub">${htmlEscape(sub)}</span>` : ""}`;
    },
  },
  { label: "ผู้รับบริการ", col: "col-patient", hideable: true, text: (bill) => bill.patient || "-" },
  {
    label: "ประเภทเคส",
    col: "col-case",
    hideable: true,
    text: (bill) => caseTypeLabel(bill.caseType),
    html: (bill) => `<span class="badge case-${htmlEscape(bill.caseType || "unknown")}">${htmlEscape(caseTypeLabel(bill.caseType))}</span>`,
    chipClass: (bill) => `case-${bill.caseType || "unknown"}`,
  },
  { label: "งานวางบิล", col: "col-stage", hideable: true, text: (bill) => billingStageLabel(bill.billingStage) },
  { label: "วางบิล", col: "col-num", num: true, text: (bill) => money(bill.billedAmount) },
  {
    label: "วันที่",
    col: "col-dates",
    hideable: true,
    text: (bill) => {
      const ck = shortDisplayDate(bill.clicknicDate);
      const mlp = shortDisplayDate(bill.mlpDate);
      return [ck && `CK ${ck}`, mlp && `MLP ${mlp}`].filter(Boolean).join(" ") || "-";
    },
    html: (bill) => {
      const ck = shortDisplayDate(bill.clicknicDate);
      const mlp = shortDisplayDate(bill.mlpDate);
      const lines = [
        ck ? `<span class="date-line"><em>CK</em>${htmlEscape(ck)}</span>` : "",
        mlp ? `<span class="date-line"><em>MLP</em>${htmlEscape(mlp)}</span>` : "",
      ].filter(Boolean);
      return lines.join("") || "-";
    },
  },
  { label: "ยอดขาย", col: "col-num", num: true, text: (bill) => money(bill.sale) },
  { label: "MLP", col: "col-num", num: true, text: (bill) => money(bill.mlpCost) },
  {
    label: "รายการยา",
    col: "col-meds",
    cellClass: "card-issue-cell",
    hideable: true,
    hideChipIfEmpty: true,
    text: (bill) => clean(bill.medicinesText) || "-",
    html: (bill) => {
      const text = clean(bill.medicinesText) || "-";
      return `<div class="card-issue-clamp" title="${htmlEscape(text)}">${htmlEscape(text)}</div>`;
    },
  },
  {
    label: "ตรวจสอบ",
    col: "col-issue",
    cellClass: "card-issue-cell",
    hideable: true,
    text: (bill) => issueText(bill) || "-",
    html: (bill) => {
      const text = issueText(bill) || "-";
      return `<div class="card-issue-clamp" title="${htmlEscape(text)}">${htmlEscape(text)}</div>`;
    },
  },
  {
    label: "สถานะ",
    col: "col-status",
    hideable: true,
    text: (bill) => `${statusLabel(bill.status)}${bill.excluded ? " | Exclude" : ""}`,
    html: (bill) => statusBadgesHtml(bill),
  },
];

function visibleCardColumns(rows) {
  if (rows.length < 2) return { columns: cardDetailColumns, chips: [] };
  const chips = [];
  const columns = cardDetailColumns.filter((column) => {
    if (!column.hideable || !column.text) return true;
    const first = column.text(rows[0]);
    if (rows.some((bill) => column.text(bill) !== first)) return true;
    if (!(column.hideChipIfEmpty && (!first || first === "-"))) {
      chips.push({ text: `${column.label}: ${first}`, className: column.chipClass ? column.chipClass(rows[0]) : "" });
    }
    return false;
  });
  return { columns, chips };
}

function cardColumnClass(column, isCell) {
  const classes = [column.col];
  if (column.num) classes.push("num");
  if (isCell && column.cellClass) classes.push(column.cellClass);
  return classes.join(" ");
}

function cardDetailRowHtml(bill, columns) {
  const cells = columns.map((column) => {
    const content = column.html ? column.html(bill) : htmlEscape(column.text(bill));
    return `<td class="${cardColumnClass(column, true)}">${content}</td>`;
  });
  return `<tr>${cells.join("")}</tr>`;
}

function applyCardFilter(config) {
  if (!config?.apply) return;
  const filter = config.apply();
  state.activeStatus = filter.status || "all";
  elements.caseTypeFilter.value = filter.caseType || "all";
  elements.billingStageFilter.value = filter.billingStage || "all";
  elements.searchInput.value = "";
  renderTabs();
  renderTable();
  closeCardDetail();
}

function openCardDetail(cardKey) {
  const config = cardDetailConfigs[cardKey];
  if (!config || !elements.cardDetailModal) return;
  state.currentCardKey = cardKey;
  const rows = config.rows();
  const shownRows = rows.slice(0, 80);
  const { columns, chips } = visibleCardColumns(shownRows);
  elements.cardDetailTitle.textContent = config.title;
  elements.cardDetailSummary.textContent = `${summarizeCardRows(rows)}${rows.length > 80 ? ` | แสดง 80 แถวแรก` : ""}`;
  elements.cardDetailHeadRow.innerHTML = columns
    .map((column) => `<th class="${cardColumnClass(column, false)}">${htmlEscape(column.label)}</th>`)
    .join("");
  elements.cardDetailChips.hidden = !chips.length;
  elements.cardDetailChips.innerHTML = chips.length
    ? `<span class="chip-note">ค่าเดียวกันทั้งการ์ด:</span>${chips.map((chip) => `<span class="chip ${htmlEscape(chip.className)}">${htmlEscape(chip.text)}</span>`).join("")}`
    : "";
  elements.cardDetailBody.innerHTML = shownRows.length
    ? shownRows.map((bill) => cardDetailRowHtml(bill, columns)).join("")
    : `<tr><td colspan="${columns.length}" class="empty">ไม่มีข้อมูลในกลุ่มนี้</td></tr>`;
  elements.cardDetailFilterBtn.hidden = !config.apply;
  elements.cardDetailFilterBtn.onclick = () => applyCardFilter(config);
  if (!elements.cardDetailModal.open) elements.cardDetailModal.showModal();
}

function refreshCardDetail() {
  if (elements.cardDetailModal?.open && state.currentCardKey) openCardDetail(state.currentCardKey);
}

function closeCardDetail() {
  elements.cardDetailModal?.close();
  state.currentCardKey = "";
}

function statusCounts() {
  return state.bills.reduce((counts, bill) => {
    counts.all += 1;
    counts[bill.status] = (counts[bill.status] || 0) + 1;
    if ((bill.billingStage || "") === "paid") counts.paid += 1;
    if ((bill.caseType || "unknown") === "insurance") counts["case-insurance"] += 1;
    if ((bill.caseType || "unknown") === "nhso") counts["case-nhso"] += 1;
    if (bill.excluded) counts.excluded += 1;
    return counts;
  }, {
    all: 0,
    matched: 0,
    paid: 0,
    "case-insurance": 0,
    "case-nhso": 0,
    "mlp-only": 0,
    "pending-billing": 0,
    "clicknic-only": 0,
    "billing-only": 0,
    excluded: 0,
  });
}

function renderTabs() {
  const counts = statusCounts();
  Object.entries(tabCountIds).forEach(([status, id]) => {
    const target = $(id);
    if (target) target.textContent = number(counts[status] || 0);
  });
  document.querySelectorAll("[data-status-tab]").forEach((button) => {
    button.classList.toggle("active", button.dataset.statusTab === state.activeStatus);
  });
}

function statusLabel(status) {
  return statusOptions.find(([value]) => value === status)?.[1] || "รายการยาไม่มี MLP";
}

function renderStatusSelect(bill) {
  return `
    <select class="status-select ${bill.status}" data-status-key="${htmlEscape(bill.billKey)}" aria-label="เปลี่ยนสถานะ">
      ${statusOptions.map(([value, label]) => `<option value="${value}" ${value === bill.status ? "selected" : ""}>${label}</option>`).join("")}
    </select>
  `;
}

function priceHintHtml(bill) {
  const signal = bill.priceSignal;
  if (!signal) return "";
  const caseType = bill.caseType || "unknown";
  // เตือนเฉพาะ conflict จริงรอบ ๆ ราคา=1 ของสปสช (ทั่วไป/เงินสดมีราคา>1 ปกติ ไม่เตือน)
  const conflict =
    (signal === "nhso" && (caseType === "insurance" || caseType === "general")) ||
    (signal === "insurance" && caseType === "nhso");
  if (conflict) {
    return `<span class="price-hint warn" title="ราคาหลังบวก% ไม่สอดคล้องกับประเภทที่จับได้ ควรตรวจสอบ">⚠ ราคาชี้: ${caseTypeLabel(signal)}</span>`;
  }
  if (bill.caseTypeSource === "auto-price") {
    return `<span class="price-hint" title="จับประเภทจากราคาหลังบวก% (=1 สปสช / >1 ประกัน)">จากราคา</span>`;
  }
  return "";
}

function renderCaseTypeSelect(bill) {
  const value = bill.caseType || "unknown";
  return `
    <select class="case-type-select ${value}" data-case-key="${htmlEscape(bill.billKey)}" aria-label="ประเภทเคส">
      ${caseTypeOptions.map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}
    </select>
    <span class="case-source">${bill.caseTypeSource === "manual" ? "แก้มือ" : bill.caseTypeSource === "auto-price" ? "auto·ราคา" : bill.caseTypeSource === "auto-status" ? "auto·รอบิล" : "auto"}</span>
    ${priceHintHtml(bill)}
  `;
}

function renderBillingStageSelect(bill) {
  const value = bill.billingStage || "pending-review";
  return `
    <select class="billing-stage-select ${value}" data-billing-stage-key="${htmlEscape(bill.billKey)}" aria-label="สถานะงานวางบิล">
      ${billingStageOptions.map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}
    </select>
    <span class="case-source">${bill.billingStageSource === "manual" ? "แก้มือ" : "auto"}</span>
  `;
}

function renderInlineDateInput(bill, field, label) {
  return `
    <span class="date-field table-date-field">
      <input
        class="inline-cell-input date-input"
        type="text"
        inputmode="numeric"
        placeholder="วว/ดด/ปปปป"
        value="${htmlEscape(formatDisplayDate(bill[field]))}"
        data-inline-key="${htmlEscape(bill.billKey)}"
        data-inline-field="${field}"
        data-inline-type="date"
        aria-label="${htmlEscape(label)}"
      />
      <button type="button" class="date-pick-btn" title="เลือกวันที่จากปฏิทิน" aria-label="เลือกวันที่จากปฏิทิน"><i class="fa-solid fa-calendar-days"></i></button>
      <input type="date" class="date-picker-hidden" tabindex="-1" aria-hidden="true" />
    </span>
  `;
}

function renderInlineMoneyInput(bill, field, label) {
  const value = Number(bill[field] || 0);
  return `
    <input
      class="inline-cell-input money-input"
      type="number"
      min="0"
      step="0.01"
      value="${Number.isFinite(value) ? value : 0}"
      data-inline-key="${htmlEscape(bill.billKey)}"
      data-inline-field="${field}"
      data-inline-type="number"
      aria-label="${htmlEscape(label)}"
    />
  `;
}

function filteredBills() {
  const query = clean(elements.searchInput.value).toLowerCase();
  const status = state.activeStatus;
  const caseType = elements.caseTypeFilter?.value || "all";
  const billingStage = elements.billingStageFilter?.value || "all";
  const sortBy = elements.sortBy.value;

  const filtered = state.bills.filter((bill) => {
    const matchesStatus = status === "all"
      || (status === "excluded" ? bill.excluded
        : status === "paid" ? (bill.billingStage || "") === "paid"
          : status === "case-insurance" ? (bill.caseType || "unknown") === "insurance"
            : status === "case-nhso" ? (bill.caseType || "unknown") === "nhso"
              : bill.status === status);
    const matchesCaseType = caseType === "all" || (bill.caseType || "unknown") === caseType;
    const matchesBillingStage = billingStage === "all" || (bill.billingStage || "pending-review") === billingStage;
    const haystack = [
      bill.orderId,
      bill.orw,
      bill.invoice,
      bill.billingNo,
      bill.billingRefs,
      bill.mlpReferenceNos,
      bill.mlpMemoOrderIds,
      caseTypeLabel(bill.caseType),
      billingStageLabel(bill.billingStage),
      bill.medicinesText,
      bill.medicineRawText,
      bill.patient,
    ].join(" ").toLowerCase();
    return matchesStatus && matchesCaseType && matchesBillingStage && isWithinDateRange(bill) && (!query || haystack.includes(query));
  });

  const sorters = {
    profitAsc: (a, b) => a.profit - b.profit,
    mlpCostDesc: (a, b) => b.mlpCost - a.mlpCost,
    saleDesc: (a, b) => b.sale - a.sale,
    dateDesc: (a, b) => primaryBillDate(b).localeCompare(primaryBillDate(a)),
  };
  return filtered.sort(sorters[sortBy] || sorters.profitAsc);
}

function updateAdvancedFilterState() {
  const details = document.getElementById("advancedFilters");
  if (!details) return;
  const active = Boolean(
    elements.dateFrom.value ||
    elements.dateTo.value ||
    elements.targetDate.value ||
    toNumeric(elements.expectedBillingAmount?.value) ||
    (elements.dateField.value && elements.dateField.value !== "clicknicDate")
  );
  const badge = details.querySelector(".advanced-badge");
  if (badge) badge.hidden = !active;
}

function renderTable() {
  updateAdvancedFilterState();
  const rows = filteredBills();
  elements.tableSummary.textContent = state.bills.length
    ? `แสดง ${number(rows.length)} จาก ${number(state.bills.length)} บิล`
    : "ยังไม่มีข้อมูล";

  if (!rows.length) {
    elements.billTableBody.innerHTML = `<tr><td colspan="18" class="empty">ไม่พบข้อมูลตามตัวกรอง</td></tr>`;
    return;
  }

  elements.billTableBody.innerHTML = rows.map((bill) => `
    <tr class="${bill.excluded ? "row-excluded" : ""}">
      <td class="action-cell">
        <button class="row-action" type="button" data-detail-key="${bill.billKey}">รายละเอียด</button>
        ${bill.status === "mlp-only" || bill.hasManualMedicines ? `<button class="row-action" type="button" data-manual-entry="${bill.orderId}">${bill.hasManualMedicines ? "แก้ยา" : "เพิ่มยา"}</button>` : ""}
        <button class="row-action ${bill.excluded ? "exclude-active" : ""}" type="button" data-toggle-exclude="${htmlEscape(bill.billKey)}">${bill.excluded ? "ยกเลิก Exclude" : "Exclude"}</button>
      </td>
      <td>${renderStatusSelect(bill)}</td>
      <td>${bill.orderId || "-"}</td>
      <td>${htmlEscape(bill.patient || "-")}</td>
      <td>${bill.orw || "-"}</td>
      <td>${bill.billingNo || "-"}</td>
      <td>${renderCaseTypeSelect(bill)}</td>
      <td>${renderBillingStageSelect(bill)}</td>
      <td>${renderInlineDateInput(bill, "clicknicDate", "วันที่ CLICKNIC")}</td>
      <td>${renderInlineDateInput(bill, "mlpDate", "วันที่ MLP")}</td>
      <td>${renderInlineDateInput(bill, "billingDueDate", "ครบกำหนดใบวางบิล")}</td>
      <td class="meds-cell">${bill.medicinesText || "-"}${bill.hasManualMedicines ? '<span class="source-note">เพิ่มจาก Screenshot</span>' : ""}${bill.hasOverride ? '<span class="source-note">แก้ไขแล้ว</span>' : ""}</td>
      <td class="num">${renderInlineMoneyInput(bill, "sale", "ยอดขายยา")}</td>
      <td class="num">${renderInlineMoneyInput(bill, "cost", "ต้นทุนยา")}</td>
      <td class="num">${renderInlineMoneyInput(bill, "mlpCost", "ค่าใช้จ่าย MLP")}</td>
      <td class="num">${renderInlineMoneyInput(bill, "billedAmount", "ยอดใบวางบิล")}</td>
      <td class="num ${bill.profit < 0 ? "profit-negative" : ""}">${money(bill.profit)}</td>
      <td><div class="validation-list">${(bill.validationIssues || []).length ? bill.validationIssues.map((issue) => `<span class="validation-chip ${issue.level}">${issue.text}</span>`).join("") : '<span class="validation-chip">ผ่าน</span>'}</div></td>
    </tr>
  `).join("");
}

function renderTopMedicines() {
  if (!state.topMeds.length) {
    elements.topMedicines.innerHTML = `<div class="empty">ยังไม่มีข้อมูลรายการยา</div>`;
    return;
  }
  elements.topMedicines.innerHTML = state.topMeds.map((item) => `
    <div class="rank-item">
      <div>
        <strong>${item.medicine}</strong>
        <span>${number(item.lines)} บรรทัด | ยอดขาย ${money(item.sale)}${medicineAliasSummary(item)}</span>
      </div>
      <strong>${number(item.qty)}</strong>
    </div>
  `).join("");
}

function medicineAliasSummary(item) {
  const aliases = (item.rawNames || []).filter(Boolean).slice(0, 3);
  return aliases.length ? ` | รวมชื่อ: ${htmlEscape(aliases.join(", "))}` : "";
}

function formatDateTime(value) {
  if (!value) return "-";
  return new Date(value).toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function renderAuditTrail() {
  elements.exportAuditBtn.disabled = !state.auditTrail.length;
  elements.auditSummary.textContent = state.auditTrail.length
    ? `${number(state.auditTrail.length)} รายการแก้ไข | ${number(state.manualClicknicRows.length)} บรรทัดยา manual`
    : "ยังไม่มีข้อมูลที่แก้ไข";

  if (!state.auditTrail.length) {
    elements.auditList.innerHTML = `<div class="empty">เมื่อบันทึกการแก้ไข ประวัติจะมาแสดงที่นี่</div>`;
    return;
  }

  elements.auditList.innerHTML = state.auditTrail.map((entry) => `
    <article class="audit-item">
      <div>
        <span class="audit-kicker">เวลา</span>
        <strong>${formatDateTime(entry.createdAt)}</strong>
        <p>${auditActionLabel(entry.action)}</p>
      </div>
      <div>
        <span class="audit-kicker">บิล</span>
        <strong>${entry.orderId}</strong>
        <p>${entry.orw || "-"} ${entry.invoice ? `| ${entry.invoice}` : ""}</p>
      </div>
      <div>
        <span class="audit-kicker">รายการยา</span>
        <strong>${number(entry.lineCount)} รายการ | ยอดขาย ${money(entry.totalSale)} | ต้นทุน ${money(entry.totalCost)}</strong>
        <p>${entry.medicines.map((item) => `${item.medicine} x${number(item.qty)}`).join(", ")}</p>
      </div>
      <div>
        <span class="audit-kicker">หลักฐาน</span>
        <strong>${entry.screenshotName}</strong>
        <p>${entry.note || "-"}</p>
      </div>
    </article>
  `).join("");
}

function auditActionLabel(action) {
  if (action === "replace_screenshot_medicines") return "แก้ทับรายการยา screenshot";
  if (action === "add_screenshot_medicines") return "เพิ่มรายการยา screenshot";
  if (action === "edit_bill_fields") return "แก้ข้อมูลแถว";
  if (action === "reset_bill_override") return "ล้างค่าที่แก้";
  if (action === "case_type_update") return "แก้ประเภทเคส";
  if (action === "billing_stage_update") return "แก้สถานะงานวางบิล";
  if (action === "toggle_excluded") return "แก้ไขไม่นับคำนวณ";
  return action;
}

function resetScreenshotPreview() {
  if (state.screenshotObjectUrl) URL.revokeObjectURL(state.screenshotObjectUrl);
  state.screenshotObjectUrl = "";
  state.screenshotFile = null;
  elements.screenshotInput.value = "";
  elements.runOcrBtn.disabled = true;
  elements.ocrStatus.textContent = "รอรูป screenshot";
  elements.screenshotPreview.innerHTML = `<span>Ctrl+V เพื่อวางรูปจาก clipboard ได้</span>`;
}

function setScreenshotPreview(file) {
  if (!file || !file.type.startsWith("image/")) return;
  if (state.screenshotObjectUrl) URL.revokeObjectURL(state.screenshotObjectUrl);
  state.screenshotFile = file;
  state.screenshotObjectUrl = URL.createObjectURL(file);
  elements.runOcrBtn.disabled = false;
  elements.ocrStatus.textContent = "พร้อม OCR";
  elements.screenshotPreview.innerHTML = `<img alt="Screenshot preview" src="${state.screenshotObjectUrl}" />`;
}

function medicineLineTemplate(line = {}) {
  return `
    <tr>
      <td class="col-line-action"><button class="line-remove" type="button" title="ลบแถวนี้" aria-label="ลบแถวนี้">ลบ</button></td>
      <td><input class="manual-med-name" type="text" value="${clean(line.medicine)}" placeholder="ชื่อยา" required /></td>
      <td><input class="manual-med-qty" type="number" min="0" step="0.01" value="${line.qty ?? 1}" /></td>
      <td><input class="manual-med-sale" type="number" min="0" step="0.01" value="${line.sale ?? ""}" placeholder="0.00" /></td>
      <td><input class="manual-med-cost" type="number" min="0" step="0.01" value="${line.cost ?? ""}" placeholder="0.00" /></td>
    </tr>
  `;
}

function addMedicineLine(line = {}) {
  elements.manualMedicineRows.insertAdjacentHTML("beforeend", medicineLineTemplate(line));
  updateManualEntrySummary();
}

function updateManualEntrySummary() {
  const rows = [...elements.manualMedicineRows.querySelectorAll("tr")];
  const totalSale = rows.reduce((sum, row) => {
    const qty = toNumeric(row.querySelector(".manual-med-qty")?.value);
    const sale = toNumeric(row.querySelector(".manual-med-sale")?.value);
    return sum + (qty * sale);
  }, 0);
  elements.manualEntrySummary.textContent = rows.length
    ? `${number(rows.length)} รายการ | ยอดขาย ${money(totalSale)}`
    : "ยังไม่มีรายการยา";
}

function normalizeOcrText(text) {
  return clean(text)
    .replace(/[|]/g, " ")
    .replace(/[０-９]/g, (char) => String.fromCharCode(char.charCodeAt(0) - 0xfee0))
    .replace(/\s+/g, " ");
}

function parseOcrDate(text) {
  const match = text.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
  if (!match) return "";
  let year = Number(match[3]);
  if (year > 2400) year -= 543;
  const month = String(Number(match[2])).padStart(2, "0");
  const day = String(Number(match[1])).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseMedicineLinesFromOcr(text) {
  const lines = text.split(/\r?\n/).map((line) => normalizeOcrText(line)).filter(Boolean);
  const skipWords = [
    "LOT",
    "ลำดับ",
    "จำนวน",
    "หน่วย",
    "ราคา",
    "ส่วนลด",
    "รวม",
    "แก้ไข",
    "รายการสินค้า",
    "ไม่มีรายการ",
  ];
  const candidates = [];

  lines.forEach((line) => {
    if (skipWords.some((word) => line.includes(word))) return;
    if (!/[A-Za-zก-ฮ]/.test(line)) return;
    if (!/\d/.test(line)) return;
    if (/^(ORW|INV|POS|SCB|C-\d)/i.test(line)) return;

    const numbers = [...line.matchAll(/\d+(?:\.\d+)?/g)].map((match) => ({
      value: Number(match[0]),
      index: match.index || 0,
      raw: match[0],
    }));
    if (!numbers.length) return;

    const totalCandidate = [...numbers].reverse().find((item) => item.value > 0 && item.value < 100000);
    if (!totalCandidate) return;
    const beforeTotal = numbers.filter((item) => item.index < totalCandidate.index);
    const possibleUnitSale = beforeTotal[beforeTotal.length - 1];
    const priceCandidate = possibleUnitSale && possibleUnitSale.index > line.length * 0.35
      ? possibleUnitSale
      : totalCandidate;
    const qtyCandidate = [...numbers]
      .reverse()
      .find((item) => item.index < priceCandidate.index && item.value > 0 && item.value <= 999 && !item.raw.includes(".")) || { value: 1, index: priceCandidate.index };
    let medicine = line.slice(0, qtyCandidate.index || priceCandidate.index).trim();
    medicine = medicine
      .replace(/^P[-\s]?\d+\s*/i, "")
      .replace(/\b\d+\s*(STRIPS|PIECES|TAB|CAP|BOX|ขวด|หลอด)?\b\s*$/i, "")
      .replace(/\s{2,}/g, " ")
      .trim();

    if (medicine.length < 3) return;
    candidates.push({
      medicine,
      qty: qtyCandidate.value || 1,
      sale: priceCandidate.value,
      cost: "",
    });
  });

  const unique = [];
  const seen = new Set();
  candidates.forEach((line) => {
    const key = `${line.medicine.toLowerCase()}|${line.sale}|${line.qty}`;
    if (seen.has(key)) return;
    seen.add(key);
    unique.push(line);
  });
  return unique.slice(0, 12);
}

function parseScreenshotOcr(text) {
  const normalized = normalizeOcrText(text);
  return {
    orderId: findOrderId(normalized),
    orw: normalized.match(/ORW-\d{5}-\d{2}-\d{4,}/)?.[0] || "",
    inv: normalized.match(/INV-\d{5}-\d{2}-\d{4,}/)?.[0] || "",
    date: parseOcrDate(normalized),
    medicines: parseMedicineLinesFromOcr(text),
    rawText: text,
  };
}

function applyOcrResult(result) {
  if (result.orderId) elements.manualOrderId.value = result.orderId;
  if (result.orw) elements.manualOrw.value = result.orw;
  if (result.inv) elements.manualInv.value = result.inv;
  if (result.date) elements.manualDate.value = result.date;
  if (result.medicines.length) {
    elements.manualMedicineRows.innerHTML = "";
    result.medicines.forEach((line) => addMedicineLine(line));
  }
  elements.manualNote.value = `${clean(elements.manualNote.value)}\nOCR จาก screenshot: กรุณาตรวจความถูกต้องก่อนบันทึก`.trim();
  updateManualEntrySummary();
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = [...document.scripts].find((script) => script.src === src);
    if (existing) {
      existing.addEventListener("load", resolve, { once: true });
      existing.addEventListener("error", reject, { once: true });
      if (window.Tesseract) resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.onload = resolve;
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

async function ensureTesseractLoaded() {
  if (window.Tesseract) return true;
  const sources = [
    "https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.min.js",
    "https://unpkg.com/tesseract.js@5/dist/tesseract.min.js",
  ];
  for (const src of sources) {
    try {
      await loadScript(src);
      if (window.Tesseract) return true;
    } catch {
      // Try the next CDN.
    }
  }
  return false;
}

async function runScreenshotOcr() {
  if (!state.screenshotFile) return;
  elements.runOcrBtn.disabled = true;
  elements.ocrStatus.textContent = "กำลังโหลด OCR...";
  const hasTesseract = await ensureTesseractLoaded();
  if (!hasTesseract) {
    elements.ocrStatus.textContent = "โหลด OCR library ไม่สำเร็จ";
    elements.runOcrBtn.disabled = false;
    return;
  }
  elements.ocrStatus.textContent = "กำลังอ่านรูป...";
  try {
    const result = await Tesseract.recognize(state.screenshotFile, "eng+tha", {
      logger: (message) => {
        if (message.status === "recognizing text") {
          elements.ocrStatus.textContent = `OCR ${Math.round((message.progress || 0) * 100)}%`;
        }
      },
    });
    const parsed = parseScreenshotOcr(result.data.text || "");
    applyOcrResult(parsed);
    elements.ocrStatus.textContent = parsed.medicines.length
      ? `อ่านสำเร็จ ${number(parsed.medicines.length)} รายการ`
      : "อ่านแล้ว แต่ไม่พบรายการยา ช่วยกรอกเอง";
  } catch (error) {
    console.error(error);
    elements.ocrStatus.textContent = "OCR ไม่สำเร็จ ลองกรอกเอง";
  } finally {
    elements.runOcrBtn.disabled = !state.screenshotFile;
  }
}

function openManualEntry(orderId) {
  const bill = state.bills.find((item) => item.orderId === orderId);
  if (!bill) return;
  const existingManualRows = state.manualClicknicRows.filter((row) => row.orderId === orderId);
  state.currentManualBill = bill;
  resetScreenshotPreview();
  elements.screenshotForm.reset();
  elements.manualMedicineRows.innerHTML = "";
  elements.manualOrderId.value = bill.orderId || "";
  elements.manualOrw.value = bill.orw.split(",")[0]?.trim() || "";
  elements.manualInv.value = bill.invoice.split(",")[0]?.trim() || "";
  elements.manualDate.value = primaryBillDate(bill);
  elements.manualNote.value = existingManualRows[0]?.note || `เพิ่มรายการยาจาก screenshot สำหรับ ${bill.orw || bill.orderId}`;
  if (existingManualRows.length) {
    existingManualRows.forEach((row) => addMedicineLine({
      medicine: row.medicine,
      qty: row.qty,
      sale: row.unitSale,
      cost: row.unitCost,
    }));
  } else {
    addMedicineLine();
  }
  elements.screenshotModal.showModal();
  elements.manualMedicineRows.querySelector(".manual-med-name")?.focus();
}

function closeManualEntry() {
  elements.screenshotModal.close();
  state.currentManualBill = null;
  resetScreenshotPreview();
}

function makeAuditId() {
  return `AUD-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function collectManualRows(auditId) {
  const orderId = findOrderId(elements.manualOrderId.value) || clean(elements.manualOrderId.value);
  const dateText = elements.manualDate.value;
  const note = clean(elements.manualNote.value);
  const rows = [...elements.manualMedicineRows.querySelectorAll("tr")].map((row) => {
    const medicine = clean(row.querySelector(".manual-med-name")?.value);
    const qty = toNumeric(row.querySelector(".manual-med-qty")?.value) || 1;
    const unitSale = toNumeric(row.querySelector(".manual-med-sale")?.value);
    const unitCost = toNumeric(row.querySelector(".manual-med-cost")?.value);
    return {
      orderId,
      date: dateText,
      medicine,
      medicineRaw: medicine,
      qty,
      unitSale,
      sale: qty * unitSale,
      unitCost,
      cost: qty * unitCost,
      sourceName: "Screenshot manual entry",
      sourceType: "screenshot",
      auditId,
      note,
      orw: clean(elements.manualOrw.value),
      invoice: clean(elements.manualInv.value),
    };
  }).filter((row) => row.orderId && row.medicine);
  return rows;
}

function saveManualEntry(event) {
  event.preventDefault();
  const orderId = findOrderId(elements.manualOrderId.value) || clean(elements.manualOrderId.value);
  const auditId = makeAuditId();
  const rows = collectManualRows(auditId);
  if (!orderId || !rows.length) {
    elements.manualEntrySummary.textContent = "กรุณาใส่เลขบิลและรายการยาอย่างน้อย 1 รายการ";
    return;
  }
  const replacedRows = state.manualClicknicRows.filter((row) => row.orderId === orderId);
  const totalSale = rows.reduce((sum, row) => sum + row.sale, 0);
  const totalCost = rows.reduce((sum, row) => sum + row.cost, 0);
  state.auditTrail.unshift({
    id: auditId,
    action: replacedRows.length ? "replace_screenshot_medicines" : "add_screenshot_medicines",
    createdAt: new Date().toISOString(),
    orderId,
    orw: clean(elements.manualOrw.value),
    invoice: clean(elements.manualInv.value),
    date: elements.manualDate.value,
    lineCount: rows.length,
    totalSale,
    totalCost,
    note: clean(elements.manualNote.value),
    screenshotName: state.screenshotFile?.name || "clipboard-image",
    replacedLineCount: replacedRows.length,
    medicines: rows.map((row) => ({
      medicine: row.medicine,
      qty: row.qty,
      sale: row.sale,
      cost: row.cost,
    })),
  });
  state.manualClicknicRows = state.manualClicknicRows.filter((row) => row.orderId !== orderId);
  state.manualClicknicRows.push(...rows);
  closeManualEntry();
  renderAll();
  scheduleAutosave("manual-medicine-entry");
  const updatedBill = state.bills.find((bill) => bill.orderId === orderId);
  setActiveStatus(updatedBill?.status || "all");
  elements.searchInput.value = orderId;
  renderTable();
}

function renderAll() {
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderStepStatuses();
  renderTabs();
  renderTable();
  renderQuickDateFilters();
  renderMergeAssistant();
  renderTopMedicines();
  renderAuditTrail();
  renderMasterMappingStatus();
  renderRulePanel();
  elements.exportCsvBtn.disabled = !state.bills.length;
  elements.exportXlsxBtn.disabled = !state.bills.length;
  elements.exportPdfBtn.disabled = !state.bills.length;
  setSessionButtons();
  const metrics = calculateMetrics();
  const issueCount = metrics.mlpOnly + metrics.clickOnly + metrics.mlpNoBilling + metrics.billingOnly;
  const duplicateNote = state.clicknicImportSummary.duplicateRows
    ? `, ตัด CLICKNIC ซ้ำ ${number(state.clicknicImportSummary.duplicateRows)} แถว`
    : "";
  elements.statusText.textContent = state.bills.length
    ? `พร้อมวิเคราะห์: ครบ 3 ฝั่ง ${number(metrics.matched)} บิล, ต้องตรวจสอบ ${number(issueCount)} บิล${duplicateNote}`
    : "รออัปโหลดไฟล์";
  maybeAutosaveOnComplete();
}

function renderSnapshot() {
  renderMetrics();
  renderStepStatuses();
  renderTabs();
  renderTable();
  renderQuickDateFilters();
  renderMergeAssistant();
  renderTopMedicines();
  renderAuditTrail();
  renderMasterMappingStatus();
  renderRulePanel();
  elements.exportCsvBtn.disabled = !state.bills.length;
  elements.exportXlsxBtn.disabled = !state.bills.length;
  elements.exportPdfBtn.disabled = !state.bills.length;
  setSessionButtons();
}

function rebuildBillsForCurrentMode() {
  if (!state.snapshotMode) {
    buildBills();
    return;
  }
  state.bills = state.bills.map((bill) => {
    const merged = applyBillOverride({ ...bill, hasOverride: false, overrideNote: "" });
    merged.validationIssues = validationRulesForBill(merged);
    return merged;
  });
}

function clipboardKindLabel(kind) {
  if (kind === "clicknic") return "CLICKNIC";
  if (kind === "mlp") return "MEDLIFE PLUS";
  if (kind === "billing") return "BILLING NOTE";
  return "Clipboard";
}

function previewClipboardText(text) {
  const rows = clipboardTextToRows(text);
  elements.confirmClipboardImport.disabled = !rows.length;
  elements.clipboardSummary.textContent = rows.length
    ? `${number(rows.length)} rows, ${number(Math.max(...rows.map((row) => row.length)))} columns`
    : "No clipboard data yet";
  if (!rows.length) {
    elements.clipboardPreviewHead.innerHTML = "";
    elements.clipboardPreviewBody.innerHTML = `<tr><td class="empty">No preview data</td></tr>`;
    return rows;
  }

  const previewRows = rows.slice(0, 8);
  const columnCount = Math.max(...previewRows.map((row) => row.length));
  const header = previewRows[0] || [];
  elements.clipboardPreviewHead.innerHTML = `<tr>${Array.from({ length: columnCount }, (_, index) => `<th>${htmlEscape(clean(header[index]) || `Column ${index + 1}`)}</th>`).join("")}</tr>`;
  elements.clipboardPreviewBody.innerHTML = previewRows.slice(1).map((row) => (
    `<tr>${Array.from({ length: columnCount }, (_, index) => `<td title="${htmlEscape(clean(row[index]))}">${htmlEscape(clean(row[index]))}</td>`).join("")}</tr>`
  )).join("") || `<tr><td colspan="${columnCount}" class="empty">Only header row detected</td></tr>`;
  return rows;
}

function importClipboardText(kind, text) {
  const workbook = workbookFromClipboardText(text, `Clipboard ${kind}`);
  const sourceName = `clipboard-${kind}`;

  state.activeSessionId = "";
  state.snapshotMode = false;
  if (kind === "clicknic") {
    state.clicknicRows = dedupeClicknicRows(parseClicknicWorkbook(workbook, sourceName));
  } else if (kind === "mlp") {
    state.mlpRows = parseMlpWorkbook(workbook, sourceName);
  } else if (kind === "billing") {
    state.billingRows = parseBillingWorkbook(workbook, sourceName);
  }

  renderAll();
  scheduleAutosave(`clipboard-${kind}`);
  elements.statusText.textContent = `Imported ${clipboardKindLabel(kind)} from clipboard`;
}

async function readClipboardIntoModal() {
  try {
    if (!navigator.clipboard?.readText) {
      throw new Error("Clipboard text is not available in this browser");
    }
    elements.clipboardStatus.textContent = "Reading clipboard...";
    const text = await navigator.clipboard.readText();
    elements.clipboardPreview.value = text;
    const rows = previewClipboardText(text);
    elements.clipboardStatus.textContent = rows.length
      ? "Clipboard loaded. Review before importing."
      : "Clipboard is empty. Paste table data into the box.";
  } catch (error) {
    console.error(error);
    elements.clipboardStatus.textContent = `${error.message || "Clipboard read failed"} Paste manually with Ctrl+V.`;
    elements.clipboardPreview.focus();
    previewClipboardText(elements.clipboardPreview.value);
  }
}

async function openClipboardImport(kind) {
  state.activeClipboardKind = kind;
  elements.clipboardTitle.textContent = `Paste ${clipboardKindLabel(kind)} Clipboard`;
  elements.clipboardPreview.value = "";
  elements.clipboardStatus.textContent = "Reading clipboard...";
  elements.clipboardSummary.textContent = "No clipboard data yet";
  elements.confirmClipboardImport.disabled = true;
  elements.clipboardPreviewHead.innerHTML = "";
  elements.clipboardPreviewBody.innerHTML = `<tr><td class="empty">No preview data</td></tr>`;
  elements.clipboardModal.showModal();
  await readClipboardIntoModal();
}

function closeClipboardImport() {
  elements.clipboardModal.close();
  state.activeClipboardKind = "";
}

function confirmClipboardImport() {
  try {
    const text = elements.clipboardPreview.value;
    const rows = previewClipboardText(text);
    if (!rows.length) throw new Error("Clipboard is empty");
    importClipboardText(state.activeClipboardKind, text);
    closeClipboardImport();
  } catch (error) {
    console.error(error);
    elements.clipboardStatus.textContent = error.message || "Clipboard import failed";
  }
}

async function handleFiles() {
  try {
    const clickFiles = [...elements.clicknicFiles.files];
    const mlpFile = elements.mlpFile.files[0];
    elements.statusText.textContent = "กำลังอ่านไฟล์...";

    state.clicknicRows = [];
    state.manualClicknicRows = [];
    state.auditTrail = [];
    state.billOverrides = {};
    state.mlpRows = [];
    state.billingRows = [];
    state.activeSessionId = "";
    state.snapshotMode = false;
    state.allStepsComplete = false;

    const clicknicImportedRows = [];
    for (const file of clickFiles) {
      const workbook = await readWorkbookFromFile(file);
      clicknicImportedRows.push(...parseClicknicWorkbook(workbook, file.name));
    }
    state.clicknicRows = dedupeClicknicRows(clicknicImportedRows);

    if (mlpFile) {
      const workbook = await readWorkbookFromFile(mlpFile);
      state.mlpRows = parseMlpWorkbook(workbook, mlpFile.name);
    }

    for (const file of [...elements.billingFiles.files]) {
      const workbook = await readWorkbookFromFile(file);
      state.billingRows.push(...parseBillingWorkbook(workbook, file.name));
    }

    renderAll();
    scheduleAutosave("file-import");
  } catch (error) {
    console.error(error);
    elements.statusText.textContent = error.message || "อ่านไฟล์ไม่สำเร็จ";
  }
}

async function loadSampleFiles() {
  try {
    elements.statusText.textContent = "กำลังโหลดไฟล์ตัวอย่างจาก Downloads...";
    state.clicknicRows = [];
    state.manualClicknicRows = [];
    state.auditTrail = [];
    state.billOverrides = {};
    state.billingRows = [];
    state.activeSessionId = "";
    state.snapshotMode = false;
    state.allStepsComplete = false;
    const clicknicImportedRows = [];
    for (const path of SAMPLE_FILES.clicknic) {
      const workbook = await readWorkbookFromPath(path);
      clicknicImportedRows.push(...parseClicknicWorkbook(workbook, path));
    }
    state.clicknicRows = dedupeClicknicRows(clicknicImportedRows);
    const mlpWorkbook = await readWorkbookFromPath(SAMPLE_FILES.mlp);
    state.mlpRows = parseMlpWorkbook(mlpWorkbook, SAMPLE_FILES.mlp);
    for (const path of SAMPLE_FILES.billing) {
      const workbook = await readWorkbookFromPath(path);
      state.billingRows.push(...parseBillingWorkbook(workbook, path));
    }
    renderAll();
    scheduleAutosave("sample-import");
  } catch (error) {
    console.error(error);
    elements.statusText.textContent = "โหลดไฟล์ตัวอย่างไม่ได้ กรุณาอัปโหลดไฟล์แทน";
  }
}

function exportCsv() {
  const rows = filteredBills().filter((bill) => state.activeStatus === "excluded" || !bill.excluded);
  const headers = [
    "status",
    "order_id",
    "patient",
    "orw",
    "invoice",
    "billing_no",
    "billing_refs",
    "mlp_reference_no",
    "mlp_memo_order_id",
    "case_type",
    "case_type_source",
    "billing_stage",
    "billing_stage_source",
    "clicknic_date",
    "mlp_date",
    "billing_due_date",
    "medicine_count",
    "medicines",
    "raw_medicines",
    "manual_source",
    "audit_ids",
    "has_override",
    "override_note",
    "excluded",
    "exclude_reason",
    "validation_issues",
    "drug_sale",
    "drug_cost",
    "mlp_cost",
    "billed_amount",
    "profit_after_mlp",
  ];
  const body = rows.map((bill) => [
    statusLabel(bill.status),
    bill.orderId,
    bill.patient,
    bill.orw,
    bill.invoice,
    bill.billingNo,
    bill.billingRefs,
    bill.mlpReferenceNos,
    bill.mlpMemoOrderIds,
    caseTypeLabel(bill.caseType),
    bill.caseTypeSource || "",
    billingStageLabel(bill.billingStage),
    bill.billingStageSource || "",
    bill.clicknicDate,
    bill.mlpDate,
    bill.billingDueDate,
    bill.medicineCount,
    bill.medicinesText,
    bill.medicineRawText,
    bill.hasManualMedicines ? "screenshot" : "",
    bill.auditIds || "",
    bill.hasOverride ? "yes" : "",
    bill.overrideNote || "",
    bill.excluded ? "yes" : "",
    bill.excludeReason || "",
    (bill.validationIssues || []).map((issue) => issue.text).join("; "),
    bill.sale,
    bill.cost,
    bill.mlpCost,
    bill.billedAmount,
    bill.profit,
  ]);
  const csv = [headers, ...body].map((row) => row.map((cell) => `"${clean(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `clicknic-medlife-analysis-${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function billReportRow(bill) {
  return {
    status: statusLabel(bill.status),
    order_id: bill.orderId,
    patient: bill.patient,
    orw: bill.orw,
    invoice: bill.invoice,
    billing_no: bill.billingNo,
    billing_refs: bill.billingRefs,
    mlp_reference_no: bill.mlpReferenceNos,
    mlp_memo_order_id: bill.mlpMemoOrderIds,
    case_type: caseTypeLabel(bill.caseType),
    case_type_source: bill.caseTypeSource || "",
    billing_stage: billingStageLabel(bill.billingStage),
    billing_stage_source: bill.billingStageSource || "",
    clicknic_date: bill.clicknicDate,
    mlp_date: bill.mlpDate,
    billing_due_date: bill.billingDueDate,
    medicine_count: bill.medicineCount,
    medicines: bill.medicinesText,
    raw_medicines: bill.medicineRawText,
    manual_source: bill.hasManualMedicines ? "screenshot" : "",
    audit_ids: bill.auditIds || "",
    has_override: bill.hasOverride ? "yes" : "",
    override_note: bill.overrideNote || "",
    excluded: bill.excluded ? "yes" : "",
    exclude_reason: bill.excludeReason || "",
    validation_issues: (bill.validationIssues || []).map((issue) => issue.text).join("; "),
    drug_sale: bill.sale,
    drug_cost: bill.cost,
    mlp_cost: bill.mlpCost,
    billed_amount: bill.billedAmount,
    profit_after_mlp: bill.profit,
  };
}

function statusSheetName(status) {
  if (status === "matched") return "Matched";
  if (status === "mlp-only") return "MLP No Medicine";
  if (status === "pending-billing") return "Pending Billing";
  if (status === "clicknic-only") return "Clicknic Only";
  if (status === "billing-only") return "Billing Only";
  return "All Bills";
}

function reportGeneratedAt() {
  return new Date().toLocaleString("th-TH", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function reportFileStamp() {
  const now = new Date();
  return `${now.toISOString().slice(0, 10)}-${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}`;
}

function reportScopeLabel() {
  const dateFieldLabel = {
    any: "ทุกชนิดวันที่",
    clicknicDate: "วันที่ CLICKNIC",
    mlpDate: "วันที่ MLP",
    billingDueDate: "ครบกำหนดใบวางบิล",
  }[elements.dateField.value] || "ทุกชนิดวันที่";
  const parts = [
    `สถานะ: ${state.activeStatus === "all" ? "ทั้งหมด" : state.activeStatus === "excluded" ? "Exclude" : state.activeStatus === "paid" ? "PAID" : state.activeStatus === "case-insurance" ? "เคสประกัน" : state.activeStatus === "case-nhso" ? "เคส สปสช" : statusLabel(state.activeStatus)}`,
    `วันที่: ${dateFieldLabel}`,
  ];
  if (elements.dateFrom.value || elements.dateTo.value) {
    parts.push(`${elements.dateFrom.value || "เริ่มต้น"} ถึง ${elements.dateTo.value || "ล่าสุด"}`);
  }
  if (clean(elements.searchInput.value)) parts.push(`ค้นหา: ${clean(elements.searchInput.value)}`);
  return parts.join(" | ");
}

function issueText(bill) {
  return (bill.validationIssues || []).map((issue) => `${issue.level || "info"}${issue.code ? `/${issue.code}` : ""}: ${issue.text}`).join("; ");
}

function validationReportRows() {
  return activeBills().flatMap((bill) => {
    if (!(bill.validationIssues || []).length) return [];
    return bill.validationIssues.map((issue) => ({
      severity: issue.level || "info",
      code: issue.code || "",
      issue: issue.text,
      status: statusLabel(bill.status),
      order_id: bill.orderId,
      orw: bill.orw,
      invoice: bill.invoice,
      billing_no: bill.billingNo,
      clicknic_date: bill.clicknicDate,
      mlp_date: bill.mlpDate,
      billing_due_date: bill.billingDueDate,
      drug_sale: bill.sale,
      drug_cost: bill.cost,
      mlp_cost: bill.mlpCost,
      billed_amount: bill.billedAmount,
      profit_after_mlp: bill.profit,
      medicines: bill.medicinesText,
      override_note: bill.overrideNote || "",
    }));
  });
}

function billBusinessDate(bill) {
  return primaryBillDate(bill);
}

function billOutstandingAmount(bill) {
  if (bill.billingStage === "billed") return 0;
  const expected = expectedBillingForBill(bill);
  if (expected > 0) return Math.max(0, expected - toNumeric(bill.billedAmount));
  return Math.max(0, toNumeric(bill.mlpCost) - toNumeric(bill.billedAmount));
}

function billAgingDays(bill) {
  const due = dateKey(bill.billingDueDate || bill.mlpDate || bill.clicknicDate);
  if (!due) return "";
  const today = new Date();
  const dueDate = new Date(`${due}T00:00:00`);
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  return Math.floor((todayDate - dueDate) / 86400000);
}

function agingBucket(days) {
  if (days === "") return "No date";
  if (days < 0) return "Not due";
  if (days <= 3) return "0-3 days";
  if (days <= 7) return "4-7 days";
  if (days <= 14) return "8-14 days";
  return "15+ days";
}

function managementBaseRows() {
  return activeBills().filter((bill) => bill.status !== "billing-only");
}

function managementActionPriority(bill) {
  if ((bill.validationIssues || []).some((issue) => issue.level === "danger")) return "P1";
  if (bill.billingStage === "insurance-review") return "P1";
  if (bill.billingStage === "pending-review" || bill.caseType === "unknown") return "P2";
  if (bill.status !== "matched" || bill.billingStage !== "billed") return "P3";
  return "P4";
}

function managementActionText(bill) {
  if (bill.billingStage === "insurance-review") return "ติดตามเอกสาร/อนุมัติเคสประกัน";
  if (bill.billingStage === "nhso-pending") return "รวบรวมเคส สปสช เพื่อวางบิล";
  if (bill.billingStage === "general-pending") return "วางบิลเคสทั่วไป";
  if (bill.billingStage === "pending-review") return "ตรวจสอบประเภทเคสและข้อมูลวางบิล";
  if (bill.status === "clicknic-only") return "ตรวจสอบว่ามีการลง MLP หรือยัง";
  if (bill.status === "mlp-only") return "เติม/ตรวจรายการยา CLICKNIC";
  return (bill.validationIssues || []).length ? "ตรวจ validation issue" : "ติดตามตามรอบปกติ";
}

function groupedManagementRows(labelFn) {
  const groups = new Map();
  managementBaseRows().forEach((bill) => {
    const label = labelFn(bill) || "-";
    const row = groups.get(label) || {
      group: label,
      bills: 0,
      drug_sale: 0,
      drug_cost: 0,
      mlp_cost: 0,
      billed_amount: 0,
      outstanding_amount: 0,
      profit_after_mlp: 0,
      validation_issues: 0,
    };
    row.bills += 1;
    row.drug_sale += toNumeric(bill.sale);
    row.drug_cost += toNumeric(bill.cost);
    row.mlp_cost += toNumeric(bill.mlpCost);
    row.billed_amount += toNumeric(bill.billedAmount);
    row.outstanding_amount += billOutstandingAmount(bill);
    row.profit_after_mlp += toNumeric(bill.profit);
    row.validation_issues += (bill.validationIssues || []).length;
    groups.set(label, row);
  });
  return [...groups.values()].sort((a, b) => b.bills - a.bills || b.outstanding_amount - a.outstanding_amount);
}

function managementSummaryRows() {
  const metrics = calculateMetrics();
  const base = managementBaseRows();
  const billed = base.filter((bill) => bill.billingStage === "billed").length;
  const outstanding = base.reduce((sum, bill) => sum + billOutstandingAmount(bill), 0);
  const actionRows = managementActionRows();
  return [
    ["Management Report", ""],
    ["Generated At", reportGeneratedAt()],
    ["Scope", reportScopeLabel()],
    ["", ""],
    ["KPI", "Value"],
    ["Total Bills", base.length],
    ["Matched Bills", metrics.matched],
    ["Billed Completion %", base.length ? `${((billed / base.length) * 100).toFixed(1)}%` : "0.0%"],
    ["Open Billing Work", base.length - billed],
    ["Outstanding Amount", outstanding],
    ["Insurance Pending", metrics.billingInsurancePending],
    ["NHSO Pending", metrics.billingNhsoPending],
    ["Unknown Case Type", metrics.caseUnknown],
    ["Validation Issues", validationReportRows().length],
    ["P1 Actions", actionRows.filter((row) => row.priority === "P1").length],
    ["Drug Sale", metrics.sale],
    ["Drug Cost", metrics.cost],
    ["MLP Cost", metrics.mlpCost],
    ["Profit After MLP", metrics.profit],
  ];
}

function managementAgingRows() {
  return groupedManagementRows((bill) => agingBucket(billAgingDays(bill)))
    .map((row) => ({ aging_bucket: row.group, ...row }));
}

function managementDailyRows() {
  return groupedManagementRows((bill) => billBusinessDate(bill) || "No date")
    .map((row) => ({ date: row.group, ...row }))
    .sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

function managementActionRows() {
  return activeBills()
    .filter((bill) => bill.status !== "matched" || bill.billingStage !== "billed" || (bill.validationIssues || []).length)
    .map((bill) => ({
      priority: managementActionPriority(bill),
      action: managementActionText(bill),
      status: statusLabel(bill.status),
      case_type: caseTypeLabel(bill.caseType),
      billing_stage: billingStageLabel(bill.billingStage),
      aging_days: billAgingDays(bill),
      order_id: bill.orderId,
      orw: bill.orw,
      invoice: bill.invoice,
      billing_no: bill.billingNo,
      due_date: bill.billingDueDate,
      mlp_date: bill.mlpDate,
      patient: bill.patient,
      outstanding_amount: billOutstandingAmount(bill),
      billed_amount: bill.billedAmount,
      mlp_cost: bill.mlpCost,
      profit_after_mlp: bill.profit,
      issues: issueText(bill),
      medicines: bill.medicinesText,
    }))
    .sort((a, b) => a.priority.localeCompare(b.priority) || Number(b.outstanding_amount) - Number(a.outstanding_amount));
}

function auditReportRows() {
  return state.auditTrail.map((entry) => ({
    audit_id: entry.id,
    created_at: entry.createdAt,
    action: entry.action,
    order_id: entry.orderId,
    orw: entry.orw,
    invoice: entry.invoice,
    date: entry.date,
    line_count: entry.lineCount,
    total_sale: entry.totalSale,
    total_cost: entry.totalCost,
    source: entry.screenshotName,
    replaced_line_count: entry.replacedLineCount,
    medicines: (entry.medicines || []).map((item) => `${item.medicine} x${item.qty} sale=${item.sale} cost=${item.cost}`).join("; "),
    note: entry.note,
  }));
}

function ruleConfigReportRows() {
  const config = activeRuleConfig();
  return [
    ["Rule", "Value"],
    ["insurance_keywords", (config.caseKeywords.insurance || []).join(", ")],
    ["nhso_keywords", (config.caseKeywords.nhso || []).join(", ")],
    ["general_keywords", (config.caseKeywords.general || []).join(", ")],
    ["billing_amount_tolerance", config.billingAmountTolerance],
    ["negative_profit_tolerance", config.negativeProfitTolerance],
    ["mlp_cost_over_sale_buffer", config.mlpCostOverSaleBuffer],
  ];
}

function setWorksheetLayout(sheet, widths) {
  sheet["!cols"] = widths.map((wch) => ({ wch }));
  if (sheet["!ref"]) sheet["!autofilter"] = { ref: sheet["!ref"] };
}

function appendAoaSheet(workbook, name, rows, widths = []) {
  const sheet = XLSX.utils.aoa_to_sheet(rows.length ? rows : [["No data"]]);
  if (widths.length) setWorksheetLayout(sheet, widths);
  XLSX.utils.book_append_sheet(workbook, sheet, name);
}

function appendJsonSheet(workbook, name, rows, widths = []) {
  const safeRows = rows.length ? rows : [{ note: "No data" }];
  const sheet = XLSX.utils.json_to_sheet(safeRows);
  if (widths.length) setWorksheetLayout(sheet, widths);
  XLSX.utils.book_append_sheet(workbook, sheet, name);
}

function exportXlsxReport() {
  const workbook = XLSX.utils.book_new();
  const metrics = calculateMetrics();
  const summaryRows = [
    ["CLICKNIC x MEDLIFE PLUS Reconciliation Report", ""],
    ["Generated At", reportGeneratedAt()],
    ["Scope", reportScopeLabel()],
    ["", ""],
    ["Metric", "Value"],
    ["CLICKNIC Raw Rows", state.clicknicImportSummary.rawRows],
    ["CLICKNIC Unique Rows", state.clicknicImportSummary.uniqueRows],
    ["CLICKNIC Duplicate Rows Removed", state.clicknicImportSummary.duplicateRows],
    ["Bills", activeBills().length],
    ["Excluded Bills", state.bills.length - activeBills().length],
    ["CLICKNIC Orders", metrics.clickOrders],
    ["Matched", metrics.matched],
    ["MLP No Medicine", metrics.mlpOnly],
    ["Pending Billing", metrics.mlpNoBilling],
    ["Clicknic Only", metrics.clickOnly],
    ["Billing Only", metrics.billingOnly],
    ["Insurance Cases", metrics.caseInsurance],
    ["NHSO Cases", metrics.caseNhso],
    ["Unknown Case Type", metrics.caseUnknown],
    ["Insurance Pending Documents/Approval", metrics.billingInsurancePending],
    ["NHSO Pending Billing", metrics.billingNhsoPending],
    ["Billing Pending Review", metrics.billingReviewPending],
    ["Drug Sale", metrics.sale],
    ["Drug Cost", metrics.cost],
    ["MLP Cost", metrics.mlpCost],
    ["Matched Profit After MLP", metrics.profit],
    ["Validation Issues", validationReportRows().length],
    ["Audit Entries", state.auditTrail.length],
  ];
  appendAoaSheet(workbook, "Dashboard", summaryRows, [34, 24]);
  appendAoaSheet(workbook, "Mgmt Summary", managementSummaryRows(), [34, 24]);
  appendJsonSheet(workbook, "Mgmt Case Mix", groupedManagementRows((bill) => caseTypeLabel(bill.caseType)).map((row) => ({ case_type: row.group, ...row })), [18, 12, 14, 14, 14, 14, 16, 16, 14]);
  appendJsonSheet(workbook, "Mgmt Billing Stage", groupedManagementRows((bill) => billingStageLabel(bill.billingStage)).map((row) => ({ billing_stage: row.group, ...row })), [24, 12, 14, 14, 14, 14, 16, 16, 14]);
  appendJsonSheet(workbook, "Mgmt Aging", managementAgingRows(), [16, 16, 12, 14, 14, 14, 14, 16, 16, 14]);
  appendJsonSheet(workbook, "Mgmt Daily", managementDailyRows(), [14, 16, 12, 14, 14, 14, 14, 16, 16, 14]);
  appendJsonSheet(workbook, "Mgmt Action List", managementActionRows(), [10, 34, 20, 16, 24, 12, 20, 20, 20, 18, 18, 18, 24, 16, 14, 14, 14, 46, 48]);
  appendAoaSheet(workbook, "Rule Config", ruleConfigReportRows(), [34, 80]);

  const reportRows = activeBills().map(billReportRow);
  appendJsonSheet(workbook, "All Bills", reportRows, [18, 20, 20, 20, 18, 24, 18, 16, 16, 44, 14, 16, 18, 14, 18, 36, 12, 12, 12, 12, 12]);
  appendJsonSheet(workbook, "Need Review", activeBills().filter((bill) => bill.status !== "matched" || (bill.validationIssues || []).length).map(billReportRow), [18, 20, 20, 20, 18, 24, 18, 16, 16, 44, 14, 16, 18, 14, 18, 36, 12, 12, 12, 12, 12]);
  ["matched", "mlp-only", "pending-billing", "clicknic-only", "billing-only"].forEach((status) => {
    appendJsonSheet(
      workbook,
      statusSheetName(status),
      activeBills().filter((bill) => bill.status === status).map(billReportRow),
      [18, 20, 20, 20, 18, 24, 18, 16, 16, 44, 14, 16, 18, 14, 18, 36, 12, 12, 12, 12, 12],
    );
  });
  appendJsonSheet(workbook, "Excluded", state.bills.filter((bill) => bill.excluded).map(billReportRow), [18, 20, 20, 20, 18, 24, 18, 16, 16, 44, 14, 16, 18, 14, 18, 36, 12, 12, 12, 12, 12]);
  appendJsonSheet(workbook, "Validation", validationReportRows(), [12, 34, 38, 18, 20, 20, 20, 18, 16, 16, 18, 12, 12, 12, 12, 12, 44, 32]);
  appendJsonSheet(workbook, "Audit Trail", auditReportRows(), [20, 22, 20, 20, 20, 20, 14, 12, 12, 12, 22, 14, 46, 40]);
  appendJsonSheet(workbook, "Top Medicines", state.topMeds.map((item, index) => ({
    rank: index + 1,
    medicine: item.medicine,
    aliases_merged: (item.rawNames || []).join("; "),
    mapped_lines: item.mappedLines || 0,
    quantity: item.qty,
    lines: item.lines,
    drug_sale: item.sale,
  })), [8, 44, 44, 14, 12, 12, 14]);
  appendJsonSheet(workbook, "Raw CLICKNIC", state.clicknicRows, [20, 16, 44, 10, 12, 12, 12, 20, 10]);
  appendJsonSheet(workbook, "Raw MLP", state.mlpRows, [20, 18, 20, 28, 12, 44, 20, 10]);
  appendJsonSheet(workbook, "Raw Billing", state.billingRows, [18, 24, 20, 18, 18, 12, 18, 10]);
  appendJsonSheet(workbook, "Manual Medicines", state.manualClicknicRows, [20, 16, 44, 10, 12, 12, 12, 24, 32]);
  workbook.Props = {
    Title: "CLICKNIC x MEDLIFE PLUS Reconciliation Report",
    Subject: reportScopeLabel(),
    Author: "MLP HUB CKNC",
    CreatedDate: new Date(),
  };
  XLSX.writeFile(workbook, `cknc-reconciliation-report-${reportFileStamp()}.xlsx`);
}

function htmlEscape(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function exportPdfReport() {
  const metrics = calculateMetrics();
  const issueRows = activeBills()
    .filter((bill) => bill.status !== "matched")
    .slice(0, 80);
  const matchedRows = activeBills()
    .filter((bill) => bill.status === "matched")
    .slice(0, 40);
  const style = `
    <style>
      body { font-family: "Segoe UI", Tahoma, sans-serif; margin: 24px; color: #1d2733; }
      h1 { margin: 0 0 4px; font-size: 24px; }
      h2 { margin: 22px 0 8px; font-size: 16px; }
      p { color: #667381; }
      .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 16px 0; }
      .metric { border: 1px solid #d9e1e7; border-left: 4px solid #246b5a; padding: 10px; border-radius: 6px; }
      .metric span { display: block; color: #667381; font-size: 11px; }
      .metric strong { display: block; font-size: 18px; margin-top: 4px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 10px; }
      th, td { border: 1px solid #d9e1e7; padding: 6px; text-align: left; vertical-align: top; }
      th { background: #eef4f1; }
      .num { text-align: right; }
      @media print { body { margin: 12mm; } button { display: none; } }
    </style>
  `;
  const metricHtml = [
    ["ครบ 3 ฝั่ง", metrics.matched],
    ["MLP ไม่มีรายการยา", metrics.mlpOnly],
    ["รอใบวางบิล", metrics.mlpNoBilling],
    ["กำไร matched หลัง MLP", money(metrics.profit)],
    ["ยอดขายยา", money(metrics.sale)],
    ["ต้นทุนยา", money(metrics.cost)],
    ["ค่าใช้จ่าย MLP", money(metrics.mlpCost)],
    ["Audit entries", state.auditTrail.length],
  ].map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  const tableHtml = (rows) => rows.map((bill) => `
    <tr>
      <td>${htmlEscape(statusLabel(bill.status))}</td>
      <td>${htmlEscape(bill.orderId)}</td>
      <td>${htmlEscape(bill.orw)}</td>
      <td>${htmlEscape(bill.billingNo)}</td>
      <td>${htmlEscape(bill.mlpDate || bill.clicknicDate)}</td>
      <td>${htmlEscape(bill.medicinesText)}</td>
      <td class="num">${money(bill.sale)}</td>
      <td class="num">${money(bill.cost)}</td>
      <td class="num">${money(bill.mlpCost)}</td>
      <td class="num">${money(bill.billedAmount)}</td>
      <td class="num">${money(bill.profit)}</td>
      <td>${htmlEscape((bill.validationIssues || []).map((issue) => issue.text).join("; "))}</td>
    </tr>
  `).join("");
  const report = `
    <!doctype html>
    <html>
      <head><meta charset="utf-8" /><title>CLICKNIC MEDLIFE Report</title>${style}</head>
      <body>
        <button onclick="window.print()">Print / Save PDF</button>
        <h1>CLICKNIC x MEDLIFE PLUS Reconciliation Report</h1>
        <p>Generated ${new Date().toLocaleString("th-TH")}</p>
        <section class="grid">${metricHtml}</section>
        <h2>รายการที่ต้องตรวจสอบ</h2>
        <table>
          <thead><tr><th>สถานะ</th><th>เลขบิล</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>MLP</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
          <tbody>${tableHtml(issueRows)}</tbody>
        </table>
        <h2>ตัวอย่างรายการที่จับคู่แล้ว</h2>
        <table>
          <thead><tr><th>สถานะ</th><th>เลขบิล</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>MLP</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
          <tbody>${tableHtml(matchedRows)}</tbody>
        </table>
      </body>
    </html>
  `;
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    alert("กรุณาอนุญาต pop-up เพื่อ export PDF");
    return;
  }
  reportWindow.document.open();
  reportWindow.document.write(report);
  reportWindow.document.close();
  reportWindow.focus();
}

function exportPdfReportV2() {
  const metrics = calculateMetrics();
  const reviewRows = activeBills()
    .filter((bill) => bill.status !== "matched" || (bill.validationIssues || []).length)
    .slice(0, 120);
  const matchedRows = activeBills().filter((bill) => bill.status === "matched").slice(0, 60);
  const allValidationRows = validationReportRows();
  const validationRows = allValidationRows.slice(0, 120);
  const severityCounts = allValidationRows.reduce((counts, row) => {
    counts[row.severity] = (counts[row.severity] || 0) + 1;
    return counts;
  }, {});
  const auditRows = auditReportRows().slice(0, 40);
  const actionRows = managementActionRows();
  const p1ActionRows = actionRows.filter((row) => row.priority === "P1").slice(0, 30);
  const caseMixRows = groupedManagementRows((bill) => caseTypeLabel(bill.caseType));
  const billingStageRows = groupedManagementRows((bill) => billingStageLabel(bill.billingStage));
  const agingRows = managementAgingRows();
  const outstandingAmount = managementBaseRows().reduce((sum, bill) => sum + billOutstandingAmount(bill), 0);
  const billedCompletion = managementBaseRows().length
    ? ((managementBaseRows().filter((bill) => bill.billingStage === "billed").length / managementBaseRows().length) * 100).toFixed(1)
    : "0.0";
  const style = `
    <style>
      @page { size: A4 landscape; margin: 12mm; }
      * { box-sizing: border-box; }
      body { font-family: "Segoe UI", "Noto Sans Thai", Tahoma, sans-serif; margin: 24px; color: #1d2733; }
      .actions { position: sticky; top: 0; z-index: 10; display: flex; justify-content: flex-end; gap: 8px; margin-bottom: 12px; padding: 8px; background: rgba(255,255,255,0.92); border-bottom: 1px solid #d9e1e7; }
      button { min-height: 36px; padding: 0 14px; border: 0; border-radius: 8px; background: #246b5a; color: #fff; font-weight: 800; cursor: pointer; }
      header { display: flex; justify-content: space-between; gap: 24px; padding-bottom: 12px; border-bottom: 3px solid #246b5a; }
      h1 { margin: 0 0 4px; font-size: 24px; line-height: 1.15; }
      h2 { margin: 22px 0 8px; font-size: 16px; page-break-after: avoid; }
      p { margin: 3px 0; color: #667381; }
      .scope { max-width: 560px; text-align: right; font-size: 11px; }
      .grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; margin: 16px 0; }
      .mgmt-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin: 14px 0; }
      .metric { border: 1px solid #d9e1e7; border-left: 4px solid #246b5a; padding: 9px; border-radius: 6px; min-height: 62px; }
      .metric span { display: block; color: #667381; font-size: 11px; }
      .metric strong { display: block; font-size: 17px; margin-top: 4px; }
      .note { font-size: 10px; color: #667381; margin-top: 6px; }
      table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 9.5px; page-break-inside: auto; }
      tr { page-break-inside: avoid; page-break-after: auto; }
      th, td { border: 1px solid #d9e1e7; padding: 5px; text-align: left; vertical-align: top; }
      th { background: #eef4f1; }
      .num { text-align: right; }
      .meds { max-width: 260px; }
      .issue { max-width: 300px; }
      .status { font-weight: 800; }
      .pill { display: inline-block; padding: 2px 6px; border-radius: 999px; background: #eef4f1; color: #246b5a; font-weight: 800; }
      .footer { margin-top: 18px; padding-top: 10px; border-top: 1px solid #d9e1e7; font-size: 10px; color: #667381; }
      @media print { body { margin: 0; } .actions { display: none; } }
    </style>
  `;
  const metricHtml = [
    ["ครบ 3 ฝั่ง", metrics.matched],
    ["MLP ไม่มีรายการยา", metrics.mlpOnly],
    ["รอใบวางบิล", metrics.mlpNoBilling],
    ["Critical/Danger", severityCounts.danger || 0],
    ["Warning", severityCounts.warn || 0],
    ["Info", severityCounts.info || 0],
    ["ยอดขายยา", money(metrics.sale)],
    ["กำไร matched หลัง MLP", money(metrics.profit)],
    ["ต้นทุนยา", money(metrics.cost)],
    ["ค่าใช้จ่าย MLP", money(metrics.mlpCost)],
    ["บิลทั้งหมด", state.bills.length],
    ["CLICKNIC ซ้ำที่ตัด", state.clicknicImportSummary.duplicateRows],
  ].map(([label, value]) => `<div class="metric"><span>${htmlEscape(label)}</span><strong>${htmlEscape(value)}</strong></div>`).join("");
  const managementMetricHtml = [
    ["Billed completion", `${billedCompletion}%`],
    ["Open action items", actionRows.length],
    ["P1 action items", actionRows.filter((row) => row.priority === "P1").length],
    ["Outstanding amount", money(outstandingAmount)],
  ].map(([label, value]) => `<div class="metric"><span>${htmlEscape(label)}</span><strong>${htmlEscape(value)}</strong></div>`).join("");
  const compactBreakdownHtml = (rows, labelName) => rows.map((row) => `
    <tr>
      <td>${htmlEscape(row.group || row.aging_bucket || "-")}</td>
      <td class="num">${number(row.bills)}</td>
      <td class="num">${money(row.outstanding_amount)}</td>
      <td class="num">${money(row.profit_after_mlp)}</td>
    </tr>
  `).join("") || `<tr><td colspan="4">No data</td></tr>`;
  const actionHtml = p1ActionRows.map((row) => `
    <tr>
      <td><span class="pill">${htmlEscape(row.priority)}</span></td>
      <td>${htmlEscape(row.action)}</td>
      <td>${htmlEscape(row.case_type)}</td>
      <td>${htmlEscape(row.billing_stage)}</td>
      <td>${htmlEscape(row.order_id)}</td>
      <td>${htmlEscape(row.orw)}</td>
      <td class="num">${money(row.outstanding_amount)}</td>
      <td class="issue">${htmlEscape(row.issues)}</td>
    </tr>
  `).join("");
  const tableHtml = (rows) => rows.map((bill) => `
    <tr>
      <td class="status">${htmlEscape(statusLabel(bill.status))}</td>
      <td>${htmlEscape(bill.orderId)}</td>
      <td>${htmlEscape(bill.orw)}</td>
      <td>${htmlEscape(bill.billingNo)}</td>
      <td>${htmlEscape(bill.mlpDate || bill.clicknicDate)}</td>
      <td class="meds">${htmlEscape(bill.medicinesText)}</td>
      <td class="num">${money(bill.sale)}</td>
      <td class="num">${money(bill.cost)}</td>
      <td class="num">${money(bill.mlpCost)}</td>
      <td class="num">${money(bill.billedAmount)}</td>
      <td class="num">${money(bill.profit)}</td>
      <td class="issue">${htmlEscape(issueText(bill))}</td>
    </tr>
  `).join("");
  const validationHtml = validationRows.map((row) => `
    <tr>
      <td>${htmlEscape(row.severity)}</td>
      <td>${htmlEscape(row.code)}</td>
      <td class="issue">${htmlEscape(row.issue)}</td>
      <td>${htmlEscape(row.status)}</td>
      <td>${htmlEscape(row.order_id)}</td>
      <td>${htmlEscape(row.orw)}</td>
      <td>${htmlEscape(row.mlp_date || row.clicknic_date)}</td>
      <td class="num">${money(row.mlp_cost)}</td>
      <td class="num">${money(row.billed_amount)}</td>
      <td class="num">${money(row.profit_after_mlp)}</td>
    </tr>
  `).join("");
  const auditHtml = auditRows.map((row) => `
    <tr>
      <td>${htmlEscape(row.created_at)}</td>
      <td>${htmlEscape(row.action)}</td>
      <td>${htmlEscape(row.order_id)}</td>
      <td>${htmlEscape(row.orw)}</td>
      <td class="issue">${htmlEscape(row.note)}</td>
    </tr>
  `).join("");
  const report = `
    <!doctype html>
    <html lang="th">
      <head><meta charset="utf-8" /><title>CKNC Reconciliation Report</title>${style}</head>
      <body>
        <div class="actions"><button onclick="window.print()">Print / Save PDF</button></div>
        <header>
          <div>
            <h1>CLICKNIC x MEDLIFE PLUS Reconciliation Report</h1>
            <p>Generated ${htmlEscape(reportGeneratedAt())}</p>
          </div>
          <div class="scope">
            <strong>Report scope</strong>
            <p>${htmlEscape(reportScopeLabel())}</p>
            <p>Expected billing amount: ${money(toNumeric(elements.expectedBillingAmount.value))}</p>
          </div>
        </header>
        <h2>Management Summary</h2>
        <section class="mgmt-grid">${managementMetricHtml}</section>
        <div style="display:grid; grid-template-columns: repeat(3, 1fr); gap: 10px;">
          <div>
            <h2>Case Mix</h2>
            <table><thead><tr><th>Case</th><th>Bills</th><th>Outstanding</th><th>Profit</th></tr></thead><tbody>${compactBreakdownHtml(caseMixRows)}</tbody></table>
          </div>
          <div>
            <h2>Billing Stage</h2>
            <table><thead><tr><th>Stage</th><th>Bills</th><th>Outstanding</th><th>Profit</th></tr></thead><tbody>${compactBreakdownHtml(billingStageRows)}</tbody></table>
          </div>
          <div>
            <h2>Aging</h2>
            <table><thead><tr><th>Bucket</th><th>Bills</th><th>Outstanding</th><th>Profit</th></tr></thead><tbody>${compactBreakdownHtml(agingRows)}</tbody></table>
          </div>
        </div>
        <h2>P1 Management Action List</h2>
        <table>
          <thead><tr><th>Priority</th><th>Action</th><th>Case</th><th>Billing stage</th><th>Order</th><th>ORW</th><th>Outstanding</th><th>Issues</th></tr></thead>
          <tbody>${actionHtml || '<tr><td colspan="8">No P1 action items</td></tr>'}</tbody>
        </table>
        <section class="grid">${metricHtml}</section>
        <h2>รายการที่ต้องตรวจสอบ</h2>
        <p class="note">แสดงสูงสุด 120 รายการแรกจากกลุ่มที่ยังไม่จับคู่ครบ หรือมี validation issue</p>
        <table>
          <thead><tr><th>สถานะ</th><th>เลขบิล</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>MLP</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
          <tbody>${tableHtml(reviewRows) || '<tr><td colspan="12">ไม่มีรายการที่ต้องตรวจสอบ</td></tr>'}</tbody>
        </table>
        <h2>Validation Issues</h2>
        <table>
          <thead><tr><th>Severity</th><th>Code</th><th>Issue</th><th>สถานะ</th><th>เลขบิล</th><th>ORW</th><th>วันที่</th><th>MLP</th><th>วางบิล</th><th>กำไร</th></tr></thead>
          <tbody>${validationHtml || '<tr><td colspan="10">ไม่มี validation issue</td></tr>'}</tbody>
        </table>
        <h2>ตัวอย่างรายการที่จับคู่แล้ว</h2>
        <table>
          <thead><tr><th>สถานะ</th><th>เลขบิล</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>MLP</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
          <tbody>${tableHtml(matchedRows) || '<tr><td colspan="12">ไม่มีรายการจับคู่แล้ว</td></tr>'}</tbody>
        </table>
        <h2>Audit ล่าสุด</h2>
        <table>
          <thead><tr><th>เวลา</th><th>Action</th><th>เลขบิล</th><th>ORW</th><th>หมายเหตุ</th></tr></thead>
          <tbody>${auditHtml || '<tr><td colspan="5">ยังไม่มี audit trail</td></tr>'}</tbody>
        </table>
        <div class="footer">Export from MLP HUB CKNC module. For full raw data, use Export XLSX.</div>
      </body>
    </html>
  `;
  const reportWindow = window.open("", "_blank");
  if (!reportWindow) {
    alert("กรุณาอนุญาต pop-up เพื่อ export PDF");
    return;
  }
  reportWindow.document.open();
  reportWindow.document.write(report);
  reportWindow.document.close();
  reportWindow.focus();
}

function downloadCsv(fileName, headers, rows) {
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${clean(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
  const blob = new Blob([`\ufeff${csv}`], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

function exportAuditCsv() {
  const headers = [
    "audit_id",
    "created_at",
    "action",
    "order_id",
    "orw",
    "invoice",
    "date",
    "line_count",
    "total_sale",
    "total_cost",
    "screenshot_name",
    "replaced_line_count",
    "medicines",
    "note",
  ];
  const rows = state.auditTrail.map((entry) => [
    entry.id,
    entry.createdAt,
    entry.action,
    entry.orderId,
    entry.orw,
    entry.invoice,
    entry.date,
    entry.lineCount,
    entry.totalSale,
    entry.totalCost,
    entry.screenshotName,
    entry.replacedLineCount,
    (entry.medicines || []).map((item) => `${item.medicine} x${item.qty} sale=${item.sale} cost=${item.cost}`).join("; "),
    entry.note,
  ]);
  downloadCsv(`clicknic-medlife-audit-${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
}

function canPersistSessions() {
  return Boolean(window.db && window.auth?.currentUser);
}

function setSessionButtons() {
  if (elements.saveSessionBtn) elements.saveSessionBtn.disabled = !state.bills.length || !canPersistSessions();
  if (elements.openSessionsBtn) elements.openSessionsBtn.disabled = !canPersistSessions();
  if (!state.bills.length) autosaveStatusText("Autosave: รอข้อมูล");
  else if (!canPersistSessions()) autosaveStatusText("Autosave: รอ login");
  else if (!state.lastAutosaveAt) autosaveStatusText("Autosave: พร้อมบันทึกแยกเดือน");
}

function safeJson(value) {
  return JSON.parse(JSON.stringify(value ?? null));
}

function currentSessionFilters() {
  return {
    activeStatus: state.activeStatus,
    search: clean(elements.searchInput.value),
    caseType: elements.caseTypeFilter.value,
    billingStage: elements.billingStageFilter.value,
    dateField: elements.dateField.value,
    dateFrom: elements.dateFrom.value,
    dateTo: elements.dateTo.value,
    sortBy: elements.sortBy.value,
    expectedBillingAmount: toNumeric(elements.expectedBillingAmount.value),
  };
}

function makeSessionPayload(name) {
  const metrics = calculateMetrics();
  const validationRows = validationReportRows();
  return safeJson({
    name,
    version: 1,
    createdAtIso: new Date().toISOString(),
    updatedAtIso: new Date().toISOString(),
    createdBy: state.authUser || null,
    metrics,
    filters: currentSessionFilters(),
    ruleConfig: state.ruleConfig,
    importSummary: state.clicknicImportSummary,
    billCount: state.bills.length,
    validationCount: validationRows.length,
    auditCount: state.auditTrail.length,
    payload: {
      bills: state.bills,
      billOverrides: state.billOverrides,
      auditTrail: state.auditTrail,
      topMeds: state.topMeds,
      ruleConfig: state.ruleConfig,
      clicknicImportSummary: state.clicknicImportSummary,
    },
  });
}

function autosaveStatusText(text) {
  if (elements.autosaveStatus) elements.autosaveStatus.textContent = text;
}

function monthsInCurrentBills() {
  const months = new Set();
  state.bills.forEach((bill) => {
    const key = primaryBillDate(bill);
    if (key) months.add(key.slice(0, 7));
  });
  if (!months.size) {
    const now = new Date();
    months.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  }
  return [...months].sort();
}

function monthlyAutosavePayload(month, basePayload) {
  const bills = state.bills.filter((bill) => primaryBillDate(bill).slice(0, 7) === month);
  const orderIds = new Set(bills.map((bill) => bill.orderId).filter(Boolean));
  const auditTrail = state.auditTrail.filter((entry) => !entry.orderId || orderIds.has(entry.orderId));
  const validationCount = bills.reduce((sum, bill) => sum + (bill.validationIssues || []).length, 0);
  return safeJson({
    ...basePayload,
    name: `CKNC Autosave ${month}`,
    month,
    primaryMonth: month,
    billCount: bills.length,
    validationCount,
    auditCount: auditTrail.length,
    payload: {
      ...basePayload.payload,
      bills,
      auditTrail,
      topMeds: basePayload.payload?.topMeds || [],
    },
  });
}

function scheduleAutosave(reason = "update") {
  if (!state.bills.length) return;
  clearTimeout(state.autosaveTimer);
  autosaveStatusText("Autosave: รอบันทึก...");
  state.autosaveTimer = setTimeout(() => autosaveMonthlySession(reason), 2000);
}

async function autosaveMonthlySession(reason = "update") {
  if (!canPersistSessions() || !state.bills.length) {
    autosaveStatusText(canPersistSessions() ? "Autosave: ยังไม่มีข้อมูล" : "Autosave: รอ login");
    return;
  }
  if (state.autosaveInFlight) {
    state.autosavePending = true;
    return;
  }
  state.autosaveInFlight = true;
  state.autosavePending = false;
  autosaveStatusText("Autosave: กำลังบันทึก...");
  try {
    const months = monthsInCurrentBills();
    const basePayload = makeSessionPayload(`CKNC Autosave ${months.join(", ")}`);
    await Promise.all(months.map((month) => window.db.collection("cknc_monthly_autosaves").doc(month).set({
      ...monthlyAutosavePayload(month, basePayload),
      source: "autosave",
      autosaveReason: reason,
      months,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      createdBy: state.authUser || basePayload.createdBy || null,
    }, { merge: true })));
    state.lastAutosaveAt = new Date().toISOString();
    autosaveStatusText(`Autosave: บันทึกแล้ว ${months.join(", ")} เวลา ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`);
  } catch (error) {
    console.error(error);
    autosaveStatusText(`Autosave: ไม่สำเร็จ ${error.message || ""}`.trim());
  } finally {
    state.autosaveInFlight = false;
    if (state.autosavePending) scheduleAutosave("pending-update");
  }
}

async function restoreLatestSnapshotOnStartup() {
  if (!canPersistSessions() || state.bills.length) return;
  autosaveStatusText("Autosave: กำลังหา session ล่าสุด...");
  try {
    const [sessionSnap, autosaveSnap] = await Promise.all([
      window.db.collection("cknc_sessions").orderBy("updatedAt", "desc").limit(1).get(),
      window.db.collection("cknc_monthly_autosaves").orderBy("updatedAt", "desc").limit(1).get(),
    ]);
    const candidates = [];
    sessionSnap.forEach((doc) => candidates.push({ id: doc.id, ...doc.data() }));
    autosaveSnap.forEach((doc) => candidates.push({ id: doc.id, ...doc.data(), source: "autosave" }));
    const latest = candidates
      .filter((item) => item.updatedAt?.toMillis)
      .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())[0];
    if (!latest || state.bills.length) {
      setSessionButtons();
      return;
    }
    applySessionSnapshot(latest);
    elements.statusText.textContent = `กู้คืนอัตโนมัติหลังเปิดหน้า: ${latest.name || latest.id} (${number(state.bills.length)} บิล)`;
    autosaveStatusText(`Autosave: กู้คืน${latest.source === "autosave" ? " autosave" : " session"} ล่าสุดให้แล้ว`);
  } catch (error) {
    console.error(error);
    setSessionButtons();
  }
}

function applySessionSnapshot(session) {
  const payload = session.payload || {};
  state.ruleConfig = mergeRuleConfig(session.ruleConfig || payload.ruleConfig || state.ruleConfig || DEFAULT_RULE_CONFIG);
  populateRuleEditor();
  saveRuleConfigToStorage();
  state.activeStatus = session.filters?.activeStatus || "all";
  elements.searchInput.value = session.filters?.search || "";
  elements.caseTypeFilter.value = session.filters?.caseType || "all";
  elements.billingStageFilter.value = session.filters?.billingStage || "all";
  elements.dateField.value = session.filters?.dateField || "clicknicDate";
  elements.dateFrom.value = session.filters?.dateFrom || "";
  elements.dateTo.value = session.filters?.dateTo || "";
  elements.sortBy.value = session.filters?.sortBy || "profitAsc";
  elements.expectedBillingAmount.value = session.filters?.expectedBillingAmount || "";
  state.bills = (payload.bills || []).map((bill) => ({
    ...bill,
    validationIssues: validationRulesForBill(bill),
  }));
  state.billOverrides = payload.billOverrides || {};
  state.auditTrail = payload.auditTrail || [];
  state.topMeds = payload.topMeds || [];
  state.clicknicImportSummary = payload.clicknicImportSummary || session.importSummary || { rawRows: 0, uniqueRows: 0, duplicateRows: 0 };
  state.clicknicRows = [];
  state.manualClicknicRows = [];
  state.mlpRows = [];
  state.billingRows = [];
  state.snapshotMode = true;
  state.activeSessionId = session.source === "autosave" ? "" : (session.id || "");
  renderSnapshot();
  elements.statusText.textContent = `โหลด session: ${session.name || session.id || "CKNC session"} (${number(state.bills.length)} บิล)`;
}

async function saveCurrentSession() {
  if (!canPersistSessions()) {
    alert("กรุณา login ด้วยบัญชีที่มีสิทธิ์ CKNC ก่อนบันทึก session");
    return;
  }
  if (!state.bills.length) return;
  const defaultName = `CKNC ${new Date().toLocaleDateString("th-TH")} ${new Date().toLocaleTimeString("th-TH", { hour: "2-digit", minute: "2-digit" })}`;
  const name = clean(prompt("ตั้งชื่อ session", defaultName));
  if (!name) return;
  elements.saveSessionBtn.disabled = true;
  elements.statusText.textContent = "กำลังบันทึก session...";
  try {
    const doc = makeSessionPayload(name);
    const approxBytes = new Blob([JSON.stringify(doc)]).size;
    if (approxBytes > 900000) {
      throw new Error("session มีขนาดใหญ่เกินไปสำหรับ Firestore กรุณาใช้ Export XLSX เก็บรายงานรอบนี้แทน");
    }
    doc.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    doc.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
    doc.createdByUid = window.auth.currentUser.uid;
    doc.createdByEmail = window.auth.currentUser.email || "";
    const ref = state.activeSessionId
      ? window.db.collection("cknc_sessions").doc(state.activeSessionId)
      : window.db.collection("cknc_sessions").doc();
    if (state.activeSessionId) {
      delete doc.createdAt;
      await ref.set(doc, { merge: true });
    } else {
      await ref.set(doc);
      state.activeSessionId = ref.id;
    }
    elements.statusText.textContent = `บันทึก session แล้ว: ${name}`;
  } catch (error) {
    console.error(error);
    alert(`บันทึก session ไม่สำเร็จ: ${error.message}`);
    elements.statusText.textContent = "บันทึก session ไม่สำเร็จ";
  } finally {
    setSessionButtons();
  }
}

function formatSessionDate(value, fallback) {
  if (value?.toDate) return value.toDate().toLocaleString("th-TH");
  if (fallback) return new Date(fallback).toLocaleString("th-TH");
  return "-";
}

async function loadSessionList() {
  if (!canPersistSessions()) {
    elements.sessionStatus.textContent = "ต้อง login ด้วยบัญชีที่มีสิทธิ์ CKNC ก่อน";
    elements.sessionList.innerHTML = `<div class="empty">ไม่มีสิทธิ์โหลด session</div>`;
    return;
  }
  elements.sessionStatus.textContent = "กำลังโหลด...";
  elements.sessionList.innerHTML = `<div class="empty">กำลังโหลด session</div>`;
  try {
    const [manualSnapshot, autosaveSnapshot] = await Promise.all([
      window.db.collection("cknc_sessions").orderBy("updatedAt", "desc").limit(30).get(),
      window.db.collection("cknc_monthly_autosaves").orderBy("updatedAt", "desc").limit(18).get(),
    ]);
    const sessions = manualSnapshot.docs.map((doc) => ({ id: doc.id, kind: "manual", ...doc.data() }));
    const autosaves = autosaveSnapshot.docs.map((doc) => ({ id: doc.id, kind: "autosave", ...doc.data() }));
    const rows = [...autosaves, ...sessions];
    elements.sessionStatus.textContent = `${number(sessions.length)} sessions | ${number(autosaves.length)} autosaves`;
    elements.sessionList.innerHTML = rows.length
      ? rows.map((session) => `
        <article class="session-item">
          <div>
            <h3>${htmlEscape(session.name || session.id)}${session.kind === "autosave" ? ' <span class="session-badge">Autosave</span>' : ""}</h3>
            <div class="session-meta">
              <span>${htmlEscape(formatSessionDate(session.updatedAt, session.updatedAtIso))}</span>
              ${session.month ? `<span>เดือน ${htmlEscape(session.month)}</span>` : ""}
              <span>${number(session.billCount || 0)} บิล</span>
              <span>${number(session.validationCount || 0)} validation</span>
              <span>${htmlEscape(session.createdByEmail || session.createdBy?.displayName || "-")}</span>
            </div>
          </div>
          <div class="session-actions">
            <button class="ghost small" type="button" ${session.kind === "autosave" ? `data-load-autosave="${session.id}"` : `data-load-session="${session.id}"`}>Load</button>
            ${session.kind === "manual" ? `<button class="ghost small" type="button" data-delete-session="${session.id}">Delete</button>` : ""}
          </div>
        </article>
      `).join("")
      : `<div class="empty">ยังไม่มี session ที่บันทึกไว้</div>`;
  } catch (error) {
    console.error(error);
    elements.sessionStatus.textContent = "โหลดไม่สำเร็จ";
    elements.sessionList.innerHTML = `<div class="empty">โหลด session ไม่สำเร็จ: ${htmlEscape(error.message)}</div>`;
  }
}

async function openSessionsModal() {
  elements.sessionModal.showModal();
  await loadSessionList();
}

function closeSessionsModal() {
  elements.sessionModal.close();
}

async function loadSavedSession(sessionId) {
  try {
    elements.sessionStatus.textContent = "กำลังโหลด session...";
    const doc = await window.db.collection("cknc_sessions").doc(sessionId).get();
    if (!doc.exists) throw new Error("ไม่พบ session");
    applySessionSnapshot({ id: doc.id, ...doc.data() });
    closeSessionsModal();
  } catch (error) {
    console.error(error);
    alert(`โหลด session ไม่สำเร็จ: ${error.message}`);
  }
}

async function loadAutosavedMonth(month) {
  try {
    elements.sessionStatus.textContent = "กำลังโหลด autosave...";
    const doc = await window.db.collection("cknc_monthly_autosaves").doc(month).get();
    if (!doc.exists) throw new Error("ไม่พบ autosave เดือนนี้");
    applySessionSnapshot({ id: doc.id, ...doc.data(), source: "autosave" });
    autosaveStatusText(`Autosave: โหลดเดือน ${month}`);
    closeSessionsModal();
  } catch (error) {
    console.error(error);
    alert(`โหลด autosave ไม่สำเร็จ: ${error.message}`);
  }
}

async function deleteSavedSession(sessionId) {
  if (!confirm("ลบ CKNC session นี้หรือไม่?")) return;
  try {
    await window.db.collection("cknc_sessions").doc(sessionId).delete();
    if (state.activeSessionId === sessionId) state.activeSessionId = "";
    await loadSessionList();
  } catch (error) {
    console.error(error);
    alert(`ลบ session ไม่สำเร็จ: ${error.message}`);
  }
}

function currentDetailBill() {
  return state.bills.find((bill) => bill.billKey === state.currentDetailKey);
}

function updateEditProfitPreview() {
  if (!elements.editProfit) return;
  const drugCost = toNumeric(currentDetailBill()?.cost);
  const profit = toNumeric(elements.editSale.value) - drugCost - toNumeric(elements.editMlpCost.value);
  elements.editProfit.value = money(profit);
  elements.editProfit.classList.toggle("profit-negative", profit < 0);
}

function openDetailDrawer(billKey) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  state.currentDetailKey = billKey;
  elements.drawerTitle.textContent = bill.orderId || bill.orw || bill.billingNo || "รายละเอียดบิล";
  elements.drawerSummary.innerHTML = [
    ["ผู้รับบริการ", htmlEscape(bill.patient || "-")],
    ["ORW", htmlEscape(bill.orw || "-")],
    ["INV", htmlEscape(bill.invoice || "-")],
    ["วันที่ CLICKNIC", formatDisplayDate(bill.clicknicDate) || "-"],
    ["วันที่ MLP", formatDisplayDate(bill.mlpDate) || "-"],
    ["งานวางบิล", htmlEscape(billingStageLabel(bill.billingStage))],
    ["ยอดขายยา", money(bill.sale)],
    ["ต้นทุนยา", money(bill.cost)],
    ["ค่าใช้จ่าย MLP", money(bill.mlpCost)],
    ["ยอดใบวางบิล", money(bill.billedAmount)],
    ["กำไรหลัง MLP", money(bill.profit)],
    ["ตรวจสอบ", htmlEscape(issueText(bill) || "-")],
    ["สถานะ", statusBadgesHtml(bill)],
  ].map(([label, value]) => `<div class="summary-tile"><span>${label}</span><strong>${value}</strong></div>`).join("");

  elements.editStatus.value = bill.status;
  if (elements.editBillingStage) elements.editBillingStage.value = bill.billingStage || "pending-review";
  if (elements.editPatient) elements.editPatient.value = bill.patient || "";
  elements.editOrw.value = bill.orw || "";
  elements.editInvoice.value = bill.invoice || "";
  elements.editClicknicDate.value = formatDisplayDate(bill.clicknicDate);
  elements.editMlpDate.value = formatDisplayDate(bill.mlpDate);
  elements.editBillingDueDate.value = formatDisplayDate(bill.billingDueDate);
  elements.editMlpCost.value = bill.mlpCost || 0;
  elements.editSale.value = bill.sale || 0;
  elements.editBilledAmount.value = bill.billedAmount || 0;
  updateEditProfitPreview();
  elements.editExcluded.checked = Boolean(bill.excluded);
  elements.editExcludeReason.value = bill.excludeReason || "";
  elements.editOverrideNote.value = bill.overrideNote || "";

  const medicines = bill.medicinesText
    ? bill.medicinesText.split(",").map((text) => clean(text)).filter(Boolean)
    : [];
  elements.drawerMedicines.innerHTML = medicines.length
    ? medicines.map((item) => `<div class="drawer-list-item"><strong>${item}</strong><span>${bill.hasManualMedicines ? " | จาก Screenshot/manual" : " | จาก Excel"}</span></div>`).join("")
    : `<div class="empty">ไม่มีรายการยา</div>`;

  if (!elements.detailDrawer.open) elements.detailDrawer.showModal();
}

function closeDetailDrawer() {
  if (elements.detailDrawer.open) elements.detailDrawer.close();
  state.currentDetailKey = "";
}

function quickUpdateStatus(billKey, status) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const existing = state.billOverrides[bill.billKey] || {};
  const currentStatus = existing.values?.status || bill.status;
  if (currentStatus === status) return;
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      status,
    },
    note: existing.note || "แก้สถานะจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "quick_status_update",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: `${statusLabel(currentStatus)} -> ${statusLabel(status)}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("status-update");
}

function quickToggleExcluded(billKey) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const existing = state.billOverrides[bill.billKey] || {};
  const nextExcluded = !bill.excluded;
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      excluded: nextExcluded,
    },
    note: existing.note || "แก้ไขจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "toggle_excluded",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: nextExcluded ? "ตั้งเป็นไม่นับคำนวณ" : "ยกเลิกไม่นับคำนวณ",
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("toggle-excluded");
}

function quickUpdateCaseType(billKey, caseType) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const existing = state.billOverrides[bill.billKey] || {};
  const currentCaseType = existing.values?.caseType || bill.caseType || "unknown";
  if (currentCaseType === caseType) return;
  const stageDetection = deriveBillingStage(bill.status, caseType, bill.billedAmount, bill.billingNo);
  const shouldUpdateStage = (existing.values?.billingStageSource || bill.billingStageSource) !== "manual";
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      caseType,
      caseTypeSource: "manual",
      ...(shouldUpdateStage ? { billingStage: stageDetection.billingStage, billingStageSource: stageDetection.billingStageSource } : {}),
    },
    note: existing.note || "แก้ประเภทเคสจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "case_type_update",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate || bill.billingDueDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: `${caseTypeLabel(currentCaseType)} -> ${caseTypeLabel(caseType)}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("case-type-update");
}

function quickUpdateBillingStage(billKey, billingStage) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const existing = state.billOverrides[bill.billKey] || {};
  const currentBillingStage = existing.values?.billingStage || bill.billingStage || "pending-review";
  if (currentBillingStage === billingStage) return;
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      billingStage,
      billingStageSource: "manual",
    },
    note: existing.note || "แก้สถานะงานวางบิลจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "billing_stage_update",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate || bill.billingDueDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: `${billingStageLabel(currentBillingStage)} -> ${billingStageLabel(billingStage)}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("billing-stage-update");
}

const inlineFieldLabels = {
  clicknicDate: "วันที่ CLICKNIC",
  mlpDate: "วันที่ MLP",
  billingDueDate: "ครบกำหนดใบวางบิล",
  sale: "ยอดขายยา",
  cost: "ต้นทุนยา",
  mlpCost: "ค่าใช้จ่าย MLP",
  billedAmount: "ยอดใบวางบิล",
};

function normalizeInlineValue(value, type) {
  if (type === "number") return toNumeric(value);
  if (type === "date") return dateKey(value);
  return clean(value);
}

function inlineValueChanged(oldValue, newValue, type) {
  if (type === "number") return toNumeric(oldValue) !== toNumeric(newValue);
  if (type === "date") return dateKey(oldValue) !== dateKey(newValue);
  return clean(oldValue) !== clean(newValue);
}

function quickUpdateInlineField(billKey, field, rawValue, type) {
  if (!Object.prototype.hasOwnProperty.call(inlineFieldLabels, field)) return;
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const value = normalizeInlineValue(rawValue, type);
  const existing = state.billOverrides[bill.billKey] || {};
  const currentValue = Object.prototype.hasOwnProperty.call(existing.values || {}, field) ? existing.values[field] : bill[field];
  if (!inlineValueChanged(currentValue, value, type)) return;
  const stagePatch = {};
  if (field === "billedAmount" && (existing.values?.billingStageSource || bill.billingStageSource) !== "manual") {
    const stageDetection = deriveBillingStage(
      existing.values?.status || bill.status,
      existing.values?.caseType || bill.caseType || "unknown",
      value,
      existing.values?.billingNo || bill.billingNo,
    );
    stagePatch.billingStage = stageDetection.billingStage;
    stagePatch.billingStageSource = stageDetection.billingStageSource;
  }
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      [field]: value,
      ...stagePatch,
    },
    note: existing.note || "แก้ข้อมูลจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  const beforeText = type === "number" ? money(currentValue) : (formatDisplayDate(currentValue) || "-");
  const afterText = type === "number" ? money(value) : (formatDisplayDate(value) || "-");
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "quick_field_update",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: field.toLowerCase().includes("date") ? value : (bill.clicknicDate || bill.mlpDate),
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: `${inlineFieldLabels[field]}: ${beforeText} -> ${afterText}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("inline-field-update");
}

function saveBillOverride() {
  const bill = currentDetailBill();
  if (!bill) return;
  const values = {
    status: elements.editStatus.value,
    caseType: bill.caseType || "unknown",
    caseTypeSource: bill.caseTypeSource || "",
    billingStage: elements.editBillingStage?.value || bill.billingStage || "pending-review",
    billingStageSource: elements.editBillingStage && elements.editBillingStage.value !== (bill.billingStage || "pending-review")
      ? "manual"
      : bill.billingStageSource || "",
    patient: clean(elements.editPatient?.value),
    orw: clean(elements.editOrw.value),
    invoice: clean(elements.editInvoice.value),
    clicknicDate: dateKey(elements.editClicknicDate.value),
    mlpDate: dateKey(elements.editMlpDate.value),
    billingDueDate: dateKey(elements.editBillingDueDate.value),
    mlpCost: toNumeric(elements.editMlpCost.value),
    sale: toNumeric(elements.editSale.value),
    billedAmount: toNumeric(elements.editBilledAmount.value),
    excluded: Boolean(elements.editExcluded.checked),
    excludeReason: clean(elements.editExcludeReason.value),
  };
  if (values.billingStageSource !== "manual") {
    const stageDetection = deriveBillingStage(values.status, values.caseType, values.billedAmount, bill.billingNo);
    values.billingStage = stageDetection.billingStage;
    values.billingStageSource = stageDetection.billingStageSource;
  }
  const note = clean(elements.editOverrideNote.value);
  state.billOverrides[bill.billKey] = {
    values,
    note,
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "edit_bill_fields",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: values.orw,
    invoice: values.invoice,
    date: values.clicknicDate || values.mlpDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "row-detail-drawer",
    replacedLineCount: 0,
    note,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("bill-override");
  closeDetailDrawer();
  refreshCardDetail();
}

function resetBillOverride() {
  const bill = currentDetailBill();
  if (!bill) return;
  delete state.billOverrides[bill.billKey];
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "reset_bill_override",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.mlpDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "row-detail-drawer",
    replacedLineCount: 0,
    note: "ล้างค่าที่แก้ใน drawer",
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("reset-bill-override");
  closeDetailDrawer();
  refreshCardDetail();
}

function setActiveStatus(status) {
  state.activeStatus = status;
  renderTabs();
  renderTable();
}

function clearFilters() {
  elements.searchInput.value = "";
  elements.caseTypeFilter.value = "all";
  elements.billingStageFilter.value = "all";
  elements.dateField.value = "clicknicDate";
  elements.dateFrom.value = "";
  elements.dateTo.value = "";
  elements.targetDate.value = "";
  elements.sortBy.value = "profitAsc";
  elements.expectedBillingAmount.value = "";
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  setActiveStatus("all");
  renderQuickDateFilters();
  renderMergeAssistant();
}

function showTargetDate() {
  const date = elements.targetDate.value;
  if (!date) return;
  elements.searchInput.value = "";
  elements.dateField.value = "clicknicDate";
  elements.dateFrom.value = date;
  elements.dateTo.value = date;
  state.activeStatus = "all";
  renderTabs();
  renderTable();
  renderQuickDateFilters();
}

elements.clicknicFiles.addEventListener("change", handleFiles);
elements.mlpFile.addEventListener("change", handleFiles);
elements.billingFiles.addEventListener("change", handleFiles);
elements.pasteClicknicBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openClipboardImport("clicknic");
});
elements.pasteMlpBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openClipboardImport("mlp");
});
elements.pasteBillingBtn.addEventListener("click", (event) => {
  event.preventDefault();
  event.stopPropagation();
  openClipboardImport("billing");
});
elements.readClipboardBtn.addEventListener("click", readClipboardIntoModal);
elements.clipboardPreview.addEventListener("input", () => {
  previewClipboardText(elements.clipboardPreview.value);
  elements.clipboardStatus.textContent = "Review pasted data before importing.";
});
elements.confirmClipboardImport.addEventListener("click", confirmClipboardImport);
elements.cancelClipboardImport.addEventListener("click", closeClipboardImport);
elements.closeClipboardModal.addEventListener("click", closeClipboardImport);
elements.searchInput.addEventListener("input", renderTable);
elements.caseTypeFilter.addEventListener("change", renderTable);
elements.billingStageFilter.addEventListener("change", renderTable);
elements.dateField.addEventListener("change", renderTable);
elements.dateFrom.addEventListener("change", renderTable);
elements.dateTo.addEventListener("change", renderTable);
elements.sortBy.addEventListener("change", renderTable);
elements.expectedBillingAmount.addEventListener("input", () => {
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
});
elements.showTargetDateBtn.addEventListener("click", showTargetDate);
elements.targetDate.addEventListener("keydown", (event) => {
  if (event.key === "Enter") showTargetDate();
});
elements.clearFiltersBtn.addEventListener("click", clearFilters);
document.addEventListener("click", (event) => {
  const card = event.target.closest("[data-summary-card]");
  if (!card) return;
  if (event.target.closest("button, input, select, textarea, a")) return;
  openCardDetail(card.dataset.summaryCard);
});
document.addEventListener("keydown", (event) => {
  if (!["Enter", " "].includes(event.key)) return;
  const card = event.target.closest?.("[data-summary-card]");
  if (!card) return;
  event.preventDefault();
  openCardDetail(card.dataset.summaryCard);
});
elements.closeCardDetailModal?.addEventListener("click", closeCardDetail);
elements.cardDetailModal?.addEventListener("click", (event) => {
  if (event.target === elements.cardDetailModal) closeCardDetail();
  const editButton = event.target.closest("[data-card-edit-key]");
  if (!editButton) return;
  const key = editButton.dataset.cardEditKey;
  openDetailDrawer(key);
});
document.addEventListener("click", (event) => {
  const button = event.target.closest(".date-pick-btn");
  if (!button) return;
  const field = button.closest(".date-field");
  const textInput = field?.querySelector("input[type='text']");
  const picker = field?.querySelector(".date-picker-hidden");
  if (!textInput || !picker) return;
  const parsed = parseDateValue(textInput.value);
  picker.value = parsed ? parsed.toISOString().slice(0, 10) : "";
  if (typeof picker.showPicker === "function") picker.showPicker();
  else picker.click();
});
document.addEventListener("change", (event) => {
  const picker = event.target.closest?.(".date-picker-hidden");
  if (!picker || !picker.value) return;
  const textInput = picker.closest(".date-field")?.querySelector("input[type='text']");
  if (!textInput) return;
  textInput.value = formatDisplayDate(picker.value);
  textInput.dispatchEvent(new Event("input", { bubbles: true }));
  textInput.dispatchEvent(new Event("change", { bubbles: true }));
});
elements.quickDateFilters?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-clicknic-date]");
  if (!button) return;
  const date = button.dataset.clicknicDate;
  elements.searchInput.value = "";
  elements.dateField.value = "clicknicDate";
  if (date === "all") {
    elements.dateFrom.value = "";
    elements.dateTo.value = "";
    elements.targetDate.value = "";
  } else {
    elements.dateFrom.value = date;
    elements.dateTo.value = date;
    elements.targetDate.value = date;
  }
  state.activeStatus = "all";
  renderTabs();
  renderTable();
  renderQuickDateFilters();
});
elements.applyRulesBtn?.addEventListener("click", applyRuleEditor);
elements.resetRulesBtn?.addEventListener("click", resetRuleEditor);
elements.ruleSuggestions?.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-rule-word][data-rule-type]");
  if (!button) return;
  addRuleWord(button.dataset.ruleType, button.dataset.addRuleWord);
});
elements.billTableBody.addEventListener("change", (event) => {
  const select = event.target.closest("[data-status-key]");
  if (select) {
    quickUpdateStatus(select.dataset.statusKey, select.value);
    return;
  }
  const caseSelect = event.target.closest("[data-case-key]");
  if (caseSelect) {
    quickUpdateCaseType(caseSelect.dataset.caseKey, caseSelect.value);
    return;
  }
  const billingStageSelect = event.target.closest("[data-billing-stage-key]");
  if (billingStageSelect) {
    quickUpdateBillingStage(billingStageSelect.dataset.billingStageKey, billingStageSelect.value);
    return;
  }
  const input = event.target.closest("[data-inline-key][data-inline-field]");
  if (!input) return;
  quickUpdateInlineField(input.dataset.inlineKey, input.dataset.inlineField, input.value, input.dataset.inlineType);
});
elements.billTableBody.addEventListener("click", (event) => {
  const detailButton = event.target.closest("[data-detail-key]");
  if (detailButton) {
    openDetailDrawer(detailButton.dataset.detailKey);
    return;
  }
  const excludeButton = event.target.closest("[data-toggle-exclude]");
  if (excludeButton) {
    quickToggleExcluded(excludeButton.dataset.toggleExclude);
    return;
  }
  const button = event.target.closest("[data-manual-entry]");
  if (button) openManualEntry(button.dataset.manualEntry);
});
elements.closeDetailDrawer.addEventListener("click", closeDetailDrawer);
elements.detailDrawer.addEventListener("click", (event) => {
  if (event.target === elements.detailDrawer) closeDetailDrawer();
});
elements.detailDrawer.addEventListener("close", () => {
  state.currentDetailKey = "";
});
elements.saveOverrideBtn.addEventListener("click", saveBillOverride);
elements.editSale?.addEventListener("input", updateEditProfitPreview);
elements.editMlpCost?.addEventListener("input", updateEditProfitPreview);
if (elements.editBillingStage) {
  elements.editBillingStage.innerHTML = billingStageOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
}
function syncYearEraButton() {
  if (!elements.yearEraToggleBtn) return;
  elements.yearEraToggleBtn.innerHTML = `<i class="fa-solid fa-calendar-day"></i> ${yearEra === "be" ? "พ.ศ." : "ค.ศ."}`;
  elements.yearEraToggleBtn.title = yearEra === "be" ? "กำลังแสดงปี พ.ศ. — กดเพื่อสลับเป็น ค.ศ." : "กำลังแสดงปี ค.ศ. — กดเพื่อสลับเป็น พ.ศ.";
}
elements.yearEraToggleBtn?.addEventListener("click", () => {
  yearEra = yearEra === "be" ? "ce" : "be";
  try {
    localStorage.setItem(YEAR_ERA_STORAGE_KEY, yearEra);
  } catch (error) {
    /* ignore */
  }
  syncYearEraButton();
  renderAll();
  refreshCardDetail();
  if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
});
syncYearEraButton();
elements.resetOverrideBtn.addEventListener("click", resetBillOverride);
elements.screenshotForm.addEventListener("submit", saveManualEntry);
elements.closeScreenshotModal.addEventListener("click", closeManualEntry);
elements.cancelScreenshotEntry.addEventListener("click", closeManualEntry);
elements.screenshotInput.addEventListener("change", () => setScreenshotPreview(elements.screenshotInput.files[0]));
elements.runOcrBtn.addEventListener("click", runScreenshotOcr);
elements.addMedicineLineBtn.addEventListener("click", () => addMedicineLine());
elements.manualMedicineRows.addEventListener("click", (event) => {
  const button = event.target.closest(".line-remove");
  if (!button) return;
  button.closest("tr")?.remove();
  if (!elements.manualMedicineRows.querySelector("tr")) addMedicineLine();
  updateManualEntrySummary();
});
elements.manualMedicineRows.addEventListener("input", updateManualEntrySummary);
document.addEventListener("paste", (event) => {
  if (!elements.screenshotModal.open) return;
  const imageItem = [...event.clipboardData?.items || []].find((item) => item.type.startsWith("image/"));
  if (!imageItem) return;
  event.preventDefault();
  setScreenshotPreview(imageItem.getAsFile());
});
document.querySelectorAll("[data-status-tab]").forEach((button) => {
  button.addEventListener("click", () => setActiveStatus(button.dataset.statusTab));
});
elements.exportCsvBtn.addEventListener("click", exportCsv);
elements.exportXlsxBtn.addEventListener("click", exportXlsxReport);
elements.exportPdfBtn.addEventListener("click", exportPdfReportV2);
elements.exportAuditBtn.addEventListener("click", exportAuditCsv);
elements.loadSampleBtn.addEventListener("click", loadSampleFiles);
elements.saveSessionBtn.addEventListener("click", saveCurrentSession);
elements.openSessionsBtn.addEventListener("click", openSessionsModal);
elements.closeSessionModal.addEventListener("click", closeSessionsModal);
elements.refreshSessionsBtn.addEventListener("click", loadSessionList);
elements.sessionList.addEventListener("click", (event) => {
  const loadButton = event.target.closest("[data-load-session]");
  if (loadButton) {
    loadSavedSession(loadButton.dataset.loadSession);
    return;
  }
  const autosaveButton = event.target.closest("[data-load-autosave]");
  if (autosaveButton) {
    loadAutosavedMonth(autosaveButton.dataset.loadAutosave);
    return;
  }
  const deleteButton = event.target.closest("[data-delete-session]");
  if (deleteButton) deleteSavedSession(deleteButton.dataset.deleteSession);
});
loadRuleConfigFromStorage();
populateRuleEditor();
verifyCkncAccess().then(loadMasterProductMappings);
renderTabs();
renderAuditTrail();
renderMasterMappingStatus();
renderRulePanel();
renderQuickDateFilters();
renderMergeAssistant();
renderStepStatuses();
setSessionButtons();
updateEmptyState();

function setActiveView(view) {
  const target = view === "tools" ? "tools" : "analyze";
  document.querySelectorAll("[data-view]").forEach((btn) => {
    const isActive = btn.dataset.view === target;
    btn.classList.toggle("active", isActive);
    btn.setAttribute("aria-selected", isActive ? "true" : "false");
  });
  document.querySelectorAll("[data-view-panel]").forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== target;
  });
  try {
    localStorage.setItem("cknc_view", target);
  } catch (error) {
    /* ignore */
  }
}

document.querySelectorAll("[data-view]").forEach((btn) => {
  btn.addEventListener("click", () => setActiveView(btn.dataset.view));
});

try {
  const savedView = localStorage.getItem("cknc_view");
  if (savedView) setActiveView(savedView);
} catch (error) {
  /* ignore */
}
