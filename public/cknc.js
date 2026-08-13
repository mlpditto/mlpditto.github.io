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
  // ประวัติการโหลดต่อ step (เวลา/ไฟล์/จำนวนแถว) — ติดไปกับ session/autosave ให้การ์ด STEP บอกที่มาได้หลังกู้คืน
  sourceMeta: { clicknic: null, mlp: null, billing: null },
  // ที่มาของข้อมูลที่กู้คืน (autosave/session + เวลาบันทึก) — ใช้เป็น fallback เมื่อ payload เก่าไม่มี sourceMeta
  restoredInfo: null,
  mlpRows: [],
  billingRows: [],
  bills: [],
  billOverrides: {},
  billMergeGroups: [],
  deletedBillKeys: [],
  // คู่แนะนำรวมบิลที่ผู้ใช้ยืนยันแล้วว่า "ไม่ใช่บิลเดียวกัน" — ซ่อนถาวร ติดไปกับ session/autosave
  dismissedSuggestions: [],
  mergeSuggestions: [],
  mergeSuggestCacheRef: null,
  topMeds: [],
  activeStatus: "all",
  currentManualBill: null,
  currentDetailKey: "",
  pasteAnalyzeKey: "",
  // ค่าหัวใบวางบิลที่เติมให้อัตโนมัติล่าสุด — ไว้เทียบว่าผู้ใช้แก้เองหรือยัง จะได้ไม่เขียนทับ
  clipboardBillingAuto: { bar: "", dueDate: "", total: "" },
  drawerMedicines: [],
  screenshotObjectUrl: "",
  screenshotFile: null,
  auditTrail: [],
  authUser: null,
  activeSessionId: "",
  snapshotMode: false,
  showMergedAutosaves: false,
  selectedBillKeys: new Set(),
  activeClipboardKind: "",
  autosaveTimer: null,
  autosaveInFlight: false,
  autosavePending: false,
  lastAutosaveAt: "",
  masterProducts: [],
  medicineAliasMap: new Map(),
  medicineMappingLoaded: false,
  ckncAliasEntries: [], // [{ key, name, id }] mapping ชื่อยา CKNC -> master (จาก collection cknc_medicine_aliases)
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
  clipboardBillingFields: $("clipboardBillingFields"),
  clipboardBarNo: $("clipboardBarNo"),
  clipboardDueDate: $("clipboardDueDate"),
  clipboardExpectedTotal: $("clipboardExpectedTotal"),
  clipboardChecksum: $("clipboardChecksum"),
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
  cardQuickFilters: $("cardQuickFilters"),
  cardDetailBulkBar: $("cardDetailBulkBar"),
  cardBulkCount: $("cardBulkCount"),
  cardBulkBillingStage: $("cardBulkBillingStage"),
  cardBulkCaseType: $("cardBulkCaseType"),
  cardBulkBarNo: $("cardBulkBarNo"),
  cardBulkApplyBar: $("cardBulkApplyBar"),
  cardBulkExclude: $("cardBulkExclude"),
  cardBulkInclude: $("cardBulkInclude"),
  cardBulkClear: $("cardBulkClear"),
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
  metricProfitPeriod: $("metricProfitPeriod"),
  metricProfitBreakdown: $("metricProfitBreakdown"),
  metricSalePeriod: $("metricSalePeriod"),
  metricSaleBreakdown: $("metricSaleBreakdown"),
  editCaseSeqLabel: $("editCaseSeqLabel"),
  editCaseSeqHint: $("editCaseSeqHint"),
  drawerTitle: $("drawerTitle"),
  drawerTitleCopy: $("drawerTitleCopy"),
  drawerChecks: $("drawerChecks"),
  drawerMedicines: $("drawerMedicines"),
  drawerAddMedicineBtn: $("drawerAddMedicineBtn"),
  editBillingStageChips: $("editBillingStageChips"),
  editStatus: $("editStatus"),
  editOrw: $("editOrw"),
  editInvoice: $("editInvoice"),
  editBarNo: $("editBarNo"),
  editBarUsage: $("editBarUsage"),
  editCreditNos: $("editCreditNos"),
  caseSeqModal: $("caseSeqModal"),
  caseSeqModalTitle: $("caseSeqModalTitle"),
  caseSeqDupInline: $("caseSeqDupInline"),
  caseSeqModalBody: $("caseSeqModalBody"),
  caseSeqModalClose: $("caseSeqModalClose"),
  caseSeqSearch: $("caseSeqSearch"),
  suggestPairModal: $("suggestPairModal"),
  suggestPairTitle: $("suggestPairTitle"),
  suggestPairBody: $("suggestPairBody"),
  suggestPairClose: $("suggestPairClose"),
  suggestPairCancel: $("suggestPairCancel"),
  suggestPairDismiss: $("suggestPairDismiss"),
  suggestPairMerge: $("suggestPairMerge"),
  dismissReasonModal: $("dismissReasonModal"),
  dismissReasonChips: $("dismissReasonChips"),
  dismissReasonText: $("dismissReasonText"),
  dismissReasonClose: $("dismissReasonClose"),
  dismissReasonCancel: $("dismissReasonCancel"),
  dismissReasonConfirm: $("dismissReasonConfirm"),
  mergeWarnCard: $("mergeWarnCard"),
  metricMergeWarn: $("metricMergeWarn"),
  mergeWarnModal: $("mergeWarnModal"),
  mergeWarnTitle: $("mergeWarnTitle"),
  mergeWarnBody: $("mergeWarnBody"),
  mergeWarnClose: $("mergeWarnClose"),
  payoutModal: $("payoutModal"),
  payoutBody: $("payoutBody"),
  payoutClose: $("payoutClose"),
  openPayoutBtn: $("openPayoutBtn"),
  editClicknicDate: $("editClicknicDate"),
  editMlpDate: $("editMlpDate"),
  editBillingDueDate: $("editBillingDueDate"),
  editPatient: $("editPatient"),
  editRefId: $("editRefId"),
  editPhone: $("editPhone"),
  editAddress: $("editAddress"),
  editExpectedClaim: $("editExpectedClaim"),
  editExpectedClaimLabel: $("editExpectedClaimLabel"),
  editMlpCost: $("editMlpCost"),
  editBillingStage: $("editBillingStage"),
  editCaseSeq: $("editCaseSeq"),
  editCost: $("editCost"),
  editSale: $("editSale"),
  editProfit: $("editProfit"),
  editBilledAmount: $("editBilledAmount"),
  editExcluded: $("editExcluded"),
  editExcludeReason: $("editExcludeReason"),
  editOverrideNote: $("editOverrideNote"),
  editDiagnosis: $("editDiagnosis"),
  visitTimelineModal: $("visitTimelineModal"),
  visitTimelineTitle: $("visitTimelineTitle"),
  visitTimelineSummary: $("visitTimelineSummary"),
  visitTimelineSearch: $("visitTimelineSearch"),
  visitTimelineClose: $("visitTimelineClose"),
  visitTimelineBody: $("visitTimelineBody"),
  saveOverrideBtn: $("saveOverrideBtn"),
  resetOverrideBtn: $("resetOverrideBtn"),
  drawerPasteAnalyzeBtn: $("drawerPasteAnalyzeBtn"),
  mergeSessionsBtn: $("mergeSessionsBtn"),
  selectAllSessions: $("selectAllSessions"),
  bulkBar: $("bulkBar"),
  bulkCount: $("bulkCount"),
  bulkBillingStage: $("bulkBillingStage"),
  bulkCaseType: $("bulkCaseType"),
  bulkBarNo: $("bulkBarNo"),
  bulkMoneyBtn: $("bulkMoneyBtn"),
  bulkMoneyModal: $("bulkMoneyModal"),
  bulkMoneySale: $("bulkMoneySale"),
  bulkMoneyCostMode: $("bulkMoneyCostMode"),
  bulkMoneyCost: $("bulkMoneyCost"),
  bulkMoneyPreview: $("bulkMoneyPreview"),
  closeBulkMoney: $("closeBulkMoney"),
  cancelBulkMoney: $("cancelBulkMoney"),
  applyBulkMoney: $("applyBulkMoney"),
  bulkApplyBarNo: $("bulkApplyBarNo"),
  bulkBarPickerBtn: $("bulkBarPickerBtn"),
  editBarPickerBtn: $("editBarPickerBtn"),
  barPickerModal: $("barPickerModal"),
  barPickerInput: $("barPickerInput"),
  barPickerSmartPaste: $("barPickerSmartPaste"),
  barPickerSummary: $("barPickerSummary"),
  barPickerSearch: $("barPickerSearch"),
  barPickerShowAll: $("barPickerShowAll"),
  barPickerBody: $("barPickerBody"),
  barPickerClose: $("barPickerClose"),
  barPickerCancel: $("barPickerCancel"),
  barPickerApply: $("barPickerApply"),
  bulkMore: $("bulkMore"),
  bulkMergeBills: $("bulkMergeBills"),
  bulkDeleteBills: $("bulkDeleteBills"),
  bulkExclude: $("bulkExclude"),
  bulkInclude: $("bulkInclude"),
  bulkClear: $("bulkClear"),
  selectAllRows: $("selectAllRows"),
  mergeResultModal: $("mergeResultModal"),
  mergeResultBody: $("mergeResultBody"),
  mergeResultOk: $("mergeResultOk"),
  mergeResultCancel: $("mergeResultCancel"),
  mergeResultClose: $("mergeResultClose"),
  importModeModal: $("importModeModal"),
  importModeSummary: $("importModeSummary"),
  importModeAppend: $("importModeAppend"),
  importModeReplace: $("importModeReplace"),
  importModeCancel: $("importModeCancel"),
  importModeClose: $("importModeClose"),
  importResultModal: $("importResultModal"),
  importResultBody: $("importResultBody"),
  dupWarnModal: $("dupWarnModal"),
  dupWarnBody: $("dupWarnBody"),
  dupWarnOk: $("dupWarnOk"),
  dupWarnCancel: $("dupWarnCancel"),
  pasteAnalyzeModal: $("pasteAnalyzeModal"),
  closePasteAnalyze: $("closePasteAnalyze"),
  cancelPasteAnalyze: $("cancelPasteAnalyze"),
  pasteAnalyzeText: $("pasteAnalyzeText"),
  pasteAnalyzeClipboardBtn: $("pasteAnalyzeClipboardBtn"),
  pasteAnalyzeStatus: $("pasteAnalyzeStatus"),
  pasteAnalyzeWarnings: $("pasteAnalyzeWarnings"),
  pasteAnalyzeResults: $("pasteAnalyzeResults"),
  pasteAnalyzeSummary: $("pasteAnalyzeSummary"),
  pasteAnalyzeTarget: $("pasteAnalyzeTarget"),
  applyPasteAnalyzeBtn: $("applyPasteAnalyzeBtn"),
  authGateTitle: $("authGateTitle"),
  authGateMessage: $("authGateMessage"),
  authGateAction: $("authGateAction"),
  masterMappingStatus: $("masterMappingStatus"),
  ruleInsuranceWords: $("ruleInsuranceWords"),
  ruleNhsoWords: $("ruleNhsoWords"),
  ruleGeneralWords: $("ruleGeneralWords"),
  ruleBillingTolerance: $("ruleBillingTolerance"),
  ruleRepeatVisitDays: $("ruleRepeatVisitDays"),
  ruleProfitTolerance: $("ruleProfitTolerance"),
  ruleCostOverSaleBuffer: $("ruleCostOverSaleBuffer"),
  applyRulesBtn: $("applyRulesBtn"),
  resetRulesBtn: $("resetRulesBtn"),
  ruleSummary: $("ruleSummary"),
  ruleSuggestions: $("ruleSuggestions"),
};

// แท็บ = หมวดมุมมองหลักเท่านั้น — สถานะปัญหา (mlp-only/clicknic-only/billing-only) กรองจาก chip แถบ "ต้องจัดการ" ที่เดียว (ตัดแท็บที่ซ้ำออก)
const tabCountIds = {
  all: "tabCountAll",
  matched: "tabCountMatched",
  paid: "tabCountPaid",
  "case-insurance": "tabCountCaseInsurance",
  "case-nhso": "tabCountCaseNhso",
  excluded: "tabCountExcluded",
};

const statusOptions = [
  ["matched", "จับคู่แล้ว"],
  ["mlp-only", "ไม่พบรายการยา"],
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

// stage งานวางบิลที่มี "ชิปเฉพาะ" ในกลุ่มงานวางบิลค้าง (ประกันรอเอกสาร/สปสชรอวางบิล/รอตรวจสอบ)
// ใช้ตัดออกจากชิป "รอใบวางบิล" กันนับซ้ำ — บิลถูกจัดเข้าหมวดเฉพาะแล้วไม่ต้องโผล่ที่ "รอใบวางบิล" อีก
// (general-pending ไม่มีชิปเฉพาะ → ยังคงอยู่ใน "รอใบวางบิล" ตามเดิม)
const BILLING_WORKFLOW_STAGES = new Set(["insurance-review", "nhso-pending", "pending-review"]);

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
  // มาซ้ำเร็วกว่ากี่วันถึงจะเตือน (0 = ปิดการเตือน)
  repeatVisitWarnDays: 7,
};

const metricIds = {
  clickOrders: "metricClickOrders",
  mlpOnly: "metricMlpOnly",
  clickOnly: "metricClickOnly",
  sale: "metricSale",
  totalCost: "metricTotalCost",
  billingRows: "metricBillingRows",
  billingOnly: "metricBillingOnly",
  profit: "metricProfit",
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
    repeatVisitWarnDays: toNumeric(config.repeatVisitWarnDays ?? base.repeatVisitWarnDays),
  };
}

// จำนวนวันที่ถือว่า "มาซ้ำเร็ว" — ตั้งค่าได้ในแผงเครื่องมือ (0 = ไม่เตือน)
function repeatVisitWarnDays() {
  return Math.max(0, Math.round(toNumeric(activeRuleConfig().repeatVisitWarnDays)));
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
  // alias ที่แมปมือจาก CKNC (collection cknc_medicine_aliases) — set ท้ายสุดให้ชนะเมื่อ key ชนกับ master
  state.ckncAliasEntries.forEach((entry) => {
    if (entry.key) aliasMap.set(entry.key, { name: entry.name, id: entry.id });
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

// หา master product จากชื่อยา CKNC (ผ่าน alias map) แล้วดึงต้นทุน/ราคา — ใช้ auto-fill แถวยาในดรอเวอร์
function resolveMasterProduct(value) {
  const { masterProductId } = resolveMedicineName(value);
  if (!masterProductId) return null;
  return state.masterProducts.find((p) => clean(p.id || p.name) === masterProductId
    || clean(p.name) === masterProductId) || null;
}
const masterCostOf = (p) => Number((p && (p.cost || (p.prices && p.prices.COST))) || 0);      // ต้นทุนจริง (LINE MAN COST)
const masterLinemanOf = (p) => Number((p && p.prices && p.prices.LINEMAN) || 0);                // ราคา LINE MAN (= MLP คิด CKNC)

// ===== ทะเบียนเจ้า (collection suppliers) — port จาก lineman-mgr เพื่อให้ CKNC เรียกเจ้าชื่อ/โค้ดเดียวกัน =====
// reserved key ใน prices ที่ไม่ใช่ชื่อบริษัท (เป็นราคาขาย/ต้นทุนของ LINE MAN) ดู [[fkb-master-supplier-schema]]
const MASTER_RESERVED_PRICE_KEYS = ["LINEMAN", "COST", "RETAIL", "WHOLESALE", "STICKER"];
let supplierRegistry = [];
let supplierAliasToCode = new Map();

function supplierKeyOf(value) {
  return (value || "").toString().trim().toUpperCase().replace(/\s+/g, " ");
}

async function syncSuppliers() {
  if (!window.db) return;
  try {
    const snapshot = await window.db.collection("suppliers").get();
    supplierRegistry = snapshot.docs.map((doc) => ({ code: doc.id, ...doc.data() }));
    supplierAliasToCode = new Map();
    supplierRegistry.forEach((s) => {
      (s.aliasKeys && s.aliasKeys.length ? s.aliasKeys : [s.code]).forEach((k) => {
        supplierAliasToCode.set(supplierKeyOf(k), s.code);
      });
    });
    updateCkncSupplierDatalist();
  } catch (err) {
    console.warn("Supplier sync failed", err);
  }
}

// ชื่อดิบ -> โค้ดเจ้า; ไม่รู้จัก = คืนชื่อเดิม (ห้ามกลืนหาย ผู้ใช้ต้องเห็นว่ายังไม่มีในทะเบียน)
function normalizeSupplierName(raw) {
  const key = supplierKeyOf(raw);
  if (!key) return "";
  return supplierAliasToCode.get(key) || (raw || "").toString().trim();
}

// เจ้าที่ทุนต่ำสุดของสินค้า master (จาก prices["บริษัท_หน่วย"] ข้าม reserved; fallback suppliers[]) → โค้ด normalize
function masterSupplierOf(master) {
  if (!master) return "";
  let best = null;
  const prices = master.prices;
  if (prices && typeof prices === "object") {
    Object.keys(prices).forEach((key) => {
      const cost = prices[key];
      if (typeof cost !== "number" || !(cost > 0)) return;   // ข้าม 0 และ nested map เสียรูป
      const head = key.split("_")[0];
      if (MASTER_RESERVED_PRICE_KEYS.includes(head) || head === ":") return;
      const parts = key.split("_");
      const rawName = (parts.length > 1 ? parts.slice(0, -1).join("_") : parts[0]).trim();
      if (!rawName) return;
      if (!best || cost < best.cost) best = { name: normalizeSupplierName(rawName), cost };
    });
  }
  if (Array.isArray(master.suppliers)) {
    master.suppliers.forEach((s) => {
      const cost = Number(s && s.cost) || 0;
      const name = normalizeSupplierName(s && s.name);
      if (!name) return;
      if (s && s.primary) { best = { name, cost, primary: true }; return; }
      if (cost > 0 && (!best || (!best.primary && cost < best.cost))) best = { name, cost };
    });
  }
  return best ? best.name : "";
}

// รายการเจ้าสำหรับ dropdown ค้นหาเอง (แทน datalist — กติกา match ของ datalist ต่างกันตามเบราว์เซอร์
// และไม่รู้จัก aliases เช่นพิมพ์ "ยาไพ" ไม่เจอ YAPAIBOON) — port แนวเดียวกับ #supplier-suggest ใน lineman-mgr
let supplierSuggestItems = [];
function updateCkncSupplierDatalist() {
  const freq = {};
  ((state.masterProducts) || []).forEach((m) => (m.suppliers || []).forEach((s) => {
    const n = normalizeSupplierName(s && s.name);
    if (n) freq[n] = (freq[n] || 0) + 1;
  }));
  const fromRegistry = supplierRegistry.map((s) => ({
    code: s.code,
    label: s.name || "",
    keys: [s.code, s.name, ...(s.aliases || []), ...(s.aliasKeys || [])].map(supplierKeyOf).filter(Boolean),
  }));
  // เจ้าที่อยู่ใน master แต่ยังไม่มีในทะเบียน — ต้องโชว์ด้วย ไม่งั้นของเดิมหายจากตัวเลือกเงียบ ๆ
  const unknown = Object.keys(freq).filter((n) => !supplierAliasToCode.has(supplierKeyOf(n)))
    .map((n) => ({ code: n, label: "ยังไม่มีในทะเบียนเจ้า", keys: [supplierKeyOf(n)] }));
  supplierSuggestItems = [...fromRegistry, ...unknown]
    .map((o) => ({ ...o, freq: freq[o.code] || 0 }))
    .sort((a, b) => b.freq - a.freq || a.code.localeCompare(b.code));
}

// ===== dropdown แนะนำชื่อเจ้า (singleton ระดับ body, z สูงกว่า drawer/modal 9000) =====
let supplierSuggestFor = null;    // input ที่ dropdown ผูกอยู่
let supplierSuggestIndex = -1;    // แถวที่เลือกด้วยลูกศร
function supplierSuggestEl() {
  let el = document.getElementById("cknc-supplier-suggest");
  if (!el) {
    el = document.createElement("div");
    el.id = "cknc-supplier-suggest";
    el.hidden = true;
    document.body.appendChild(el);
    // pointerdown มาก่อน blur → เลือกได้ทั้งเมาส์และนิ้ว
    el.addEventListener("pointerdown", (e) => {
      const item = e.target.closest("[data-code]");
      if (!item) return;
      e.preventDefault();
      supplierSuggestPick(item.dataset.code);
    });
    // เลื่อน scroll ที่ไหนก็ตาม → ตำแหน่ง dropdown เพี้ยน ปิดทิ้ง
    document.addEventListener("scroll", () => supplierSuggestHide(), true);
  }
  return el;
}
function supplierSuggestMatches(q) {
  const key = supplierKeyOf(q);
  if (!key) return supplierSuggestItems.slice(0, 8);   // ยังไม่พิมพ์ = โชว์เจ้าที่ใช้บ่อย
  return supplierSuggestItems
    .map((o) => {
      const starts = o.keys.some((k) => k.startsWith(key));
      if (!starts && !o.keys.some((k) => k.includes(key))) return null;
      return { o, rank: starts ? 0 : 1 };
    })
    .filter(Boolean)
    .sort((a, b) => a.rank - b.rank || b.o.freq - a.o.freq || a.o.code.localeCompare(b.o.code))
    .slice(0, 8).map((x) => x.o);
}
function supplierSuggestShow(input) {
  const el = supplierSuggestEl();
  const list = supplierSuggestMatches(input.value);
  if (!list.length) return supplierSuggestHide();
  supplierSuggestFor = input;
  supplierSuggestIndex = -1;
  el.innerHTML = list.map((o) => `
    <div data-code="${htmlEscape(o.code)}" class="suggest-item">
      <span class="suggest-code">${htmlEscape(o.code)}</span>
      <span class="suggest-label">${htmlEscape(o.label)}</span>
    </div>`).join("");
  const r = input.getBoundingClientRect();
  el.style.left = `${Math.round(r.left)}px`;
  el.style.top = `${Math.round(r.bottom + 4)}px`;
  el.style.width = `${Math.round(Math.max(r.width, 230))}px`;
  el.hidden = false;
}
function supplierSuggestHide() {
  const el = document.getElementById("cknc-supplier-suggest");
  if (el) el.hidden = true;
  supplierSuggestFor = null;
  supplierSuggestIndex = -1;
}
function supplierSuggestPick(code) {
  const input = supplierSuggestFor;
  supplierSuggestHide();
  if (input) {
    input.value = code;
    // ให้ delegation change เดิมอัปเดต state + re-render แถว (เส้นทางเดียวกับผู้ใช้พิมพ์เอง)
    input.dispatchEvent(new Event("change", { bubbles: true }));
  }
}
function supplierSuggestBlur() { setTimeout(supplierSuggestHide, 150); }
function supplierSuggestKey(e, input) {
  const el = document.getElementById("cknc-supplier-suggest");
  if (!el || el.hidden) return;
  const items = [...el.querySelectorAll("[data-code]")];
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    supplierSuggestIndex = (supplierSuggestIndex + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
    items.forEach((it, i) => it.classList.toggle("active", i === supplierSuggestIndex));
    items[supplierSuggestIndex]?.scrollIntoView({ block: "nearest" });
  } else if (e.key === "Enter") {
    if (supplierSuggestIndex >= 0) {
      e.preventDefault();
      supplierSuggestPick(items[supplierSuggestIndex].dataset.code);
    } else supplierSuggestHide();
  } else if (e.key === "Escape") {
    e.stopPropagation(); // กัน Escape ทะลุไปปิด drawer ทั้งบาน
    supplierSuggestHide();
  }
}

// datalist ชื่อยาจาก master สำหรับ autocomplete แถวยาในดรอเวอร์ (1 ชื่อ/สินค้า)
function updateCkncMasterDatalist() {
  const dl = document.getElementById("cknc-master-list");
  if (!dl) return;
  const seen = new Set();
  const options = [];
  state.masterProducts.forEach((p) => {
    const display = clean(p.canonicalName || p.name || p.id);
    if (!display) return;
    const key = normalizeMedicineKey(display);
    if (!key || seen.has(key)) return;
    seen.add(key);
    options.push(`<option value="${htmlEscape(display)}"></option>`);
  });
  dl.innerHTML = options.join("");
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
  if (elements.ruleRepeatVisitDays) elements.ruleRepeatVisitDays.value = config.repeatVisitWarnDays;
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
    repeatVisitWarnDays: toNumeric(elements.ruleRepeatVisitDays?.value),
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
    updateCkncMasterDatalist();
    renderMasterMappingStatus();
    if (state.clicknicRows.length || state.manualClicknicRows.length) renderAll();
  } catch (error) {
    console.warn("Master product mapping load failed", error);
    state.medicineMappingLoaded = false;
    renderMasterMappingStatus();
  }
}

// โหลด mapping ชื่อยา CKNC -> master (collection แยก cknc_medicine_aliases) แล้ว merge เข้าดัชนี alias
async function loadCkncAliases() {
  if (!window.db) return;
  try {
    const snapshot = await window.db.collection("cknc_medicine_aliases").get();
    state.ckncAliasEntries = snapshot.docs
      .map((doc) => {
        const d = doc.data() || {};
        return { key: clean(d.key), name: clean(d.masterName), id: clean(d.masterProductId) };
      })
      .filter((entry) => entry.key && entry.id);
    rebuildMedicineAliasMap();
    renderMasterMappingStatus();
    if (state.clicknicRows.length || state.manualClicknicRows.length) renderAll();
  } catch (error) {
    console.warn("CKNC medicine alias load failed", error);
  }
}

// ลิงก์ชื่อยา CKNC เข้ากับสินค้าใน master: อัปเดตดัชนีทันที + บันทึกลง collection แยก (ไม่แตะ master_products)
async function linkMedicineToMaster(rawName, product) {
  const key = normalizeMedicineKey(rawName);
  const masterName = clean(product.canonicalName || product.name || product.id);
  const masterId = clean(product.id || product.name || masterName);
  if (!key || !masterId) return false;
  // อัปเดตหน่วยความจำก่อนให้เห็นผลทันที (ทุกบรรทัดที่ชื่อตรงกันจะ map ตาม)
  state.ckncAliasEntries = state.ckncAliasEntries.filter((entry) => entry.key !== key);
  state.ckncAliasEntries.push({ key, name: masterName, id: masterId });
  rebuildMedicineAliasMap();
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderMasterMappingStatus();
  if (elements.detailDrawer?.open) autofillDrawerMedicinesFromMaster(); // ลิงก์ตอนดรอเวอร์เปิด → ดึงต้นทุนเข้าแถวทันที
  scheduleAutosave("cknc-alias-link");
  // บันทึกถาวร (best-effort) — id = key ที่ encode ให้ปลอดภัยเป็น doc id, key จริงอยู่ใน field
  if (window.db && window.auth?.currentUser) {
    try {
      const docId = encodeURIComponent(key).slice(0, 500);
      await window.db.collection("cknc_medicine_aliases").doc(docId).set({
        key,
        ckncNameRaw: clean(rawName),
        masterProductId: masterId,
        masterName,
        updatedBy: state.authUser?.email || state.authUser?.uid || "",
        updatedAt: new Date().toISOString(),
      }, { merge: true });
    } catch (error) {
      console.warn("Save CKNC alias failed", error);
      showToast(`ลิงก์ในเครื่องแล้ว แต่บันทึกขึ้นระบบไม่สำเร็จ: ${clean(rawName)}`);
      return true;
    }
  }
  showToast(`ลิงก์ "${clean(rawName)}" → ${masterName} แล้ว`);
  return true;
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

// ตัดสัญลักษณ์เงินออกด้วย: ไฟล์ใบวางบิลจริง export ช่องจำนวนเงินเป็นรูปแบบสกุลเงิน ("$10.00")
// เดิม Number("$10.00") = NaN → คืน 0 → ยอดหายทั้งไฟล์ (ตกไปหยิบเลขลำดับแถวมาเป็นยอดแทน)
// ห้ามตัดตัวอักษร/"/" ทิ้ง — ต้องให้ "02/07/2026" ยังเป็น NaN คืน 0 ไม่งั้นวันที่จะกลายเป็นจำนวนเงิน
function toNumeric(value) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  const parsed = Number(clean(value).replace(/[,\s฿$]/g, ""));
  return Number.isFinite(parsed) ? parsed : 0;
}

// ค่าเงินในช่องกรอก drawer แสดงทศนิยม 2 ตำแหน่งเสมอ (ไม่ใส่ลูกน้ำ กันแก้ไขยาก — toNumeric ตัดลูกน้ำอยู่แล้ว)
function fixed2(value) {
  return toNumeric(value).toFixed(2);
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

// "วันนี้" เป็นคีย์ YYYY-MM-DD — ประกอบจากเวลาท้องถิ่นเอง
// อย่าใช้ dateKey(new Date()): String(date) เป็น "Fri Jul 17 2026 ... GMT+0700" ไม่มี / หรือ - ให้ parseDateValue จับ → คืน ""
// อย่าใช้ toISOString().slice(0,10): เป็น UTC ก่อน 07:00 ตามเวลาไทยจะได้วันก่อนหน้า
function todayKey(now = new Date()) {
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
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

// เซลล์ "ออเดอร์ / ORW" โชว์ทั้งสองค่า: ORW เด่น (ตรงกับเลขในใบวางบิล) / เลขออเดอร์ตัวเล็กจาง
// ใช้ร่วมกันใน bar picker + WARN popup (ตาราง case-seq-table)
// ปุ่มคัดลอกท้ายเลขแต่ละบรรทัด — แยกปุ่มต่อบรรทัดเพราะบางงานใช้ ORW บางงานใช้เลขที่ออเดอร์
// ⚠️ กล่องที่เอาเซลล์นี้ไปใช้ ต้องผ่าน attachCopyDelegate() ไม่งั้นปุ่มกดแล้วเงียบ
function copyRefBtnHtml(value, label) {
  return ` <button type="button" class="copy-ref-btn" data-copy-text="${htmlEscape(value)}" title="คัดลอก ${htmlEscape(label)}" aria-label="คัดลอก ${htmlEscape(label)}"><i class="fa-regular fa-copy"></i></button>`;
}

function orderOrwCellHtml(bill) {
  return [
    clean(bill.orw) ? `<div class="bar-pick-orw">${htmlEscape(bill.orw)}${copyRefBtnHtml(clean(bill.orw), "ORW")}</div>` : "",
    clean(bill.orderId) ? `<div class="bar-pick-order">${htmlEscape(bill.orderId)}${copyRefBtnHtml(clean(bill.orderId), "เลขที่ออเดอร์")}</div>` : "",
  ].join("") || "-";
}

// นับเข้ายอดขาย/ต้นทุน/กำไร เฉพาะบิลที่ PAID หรือ วางบิลแล้วและมีเลข BAR (รายได้ที่เกิดขึ้นจริง)
function countsInRevenue(bill) {
  const stage = bill.billingStage || "";
  return stage === "paid" || (stage === "billed" && Boolean(clean(bill.barNo)));
}

// วันที่ของบิลตามโหมด dateField ปัจจุบัน — "primary" = วันบิลหลัก (CLICKNIC ถ้าไม่มีใช้ MLP)
// ให้ตรงกับการนับเดือนในการ์ด; โหมด any บิลหนึ่งใบมีได้หลายวัน
function dateKeysForRange(bill) {
  if (elements.dateField.value === "primary") {
    const key = primaryBillDate(bill);
    return key ? [key] : [];
  }
  const fields = elements.dateField.value === "any"
    ? ["clicknicDate", "mlpDate", "billingDueDate"]
    : [elements.dateField.value];
  return [...new Set(fields.map((field) => dateKey(bill[field])).filter(Boolean))];
}

function isWithinDateRange(bill) {
  const from = elements.dateFrom.value;
  const to = elements.dateTo.value;
  if (!from && !to) return true;
  return dateKeysForRange(bill).some((key) => (!from || key >= from) && (!to || key <= to));
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

// อัปเปอร์เคสทั้งก้อนก่อนหา: เลขที่ copy มาบางทีเป็นตัวพิมพ์เล็ก (เดิม regex ไม่มี flag i เลยมองไม่เห็น
// จนแถวนั้นถูกยำรวมกับแถวก่อนหน้าและยอดเพี้ยน) — ผลพลอยได้คือเลขที่คืนออกไป normalize แล้วในตัว ใช้เป็นคีย์จับคู่ได้เลย
function extractRefs(value) {
  const text = clean(value).toUpperCase();
  // ตัดเลข BAR ออกก่อนหา AR — "BAR-00003-26-xxxx" มี "AR-..." ซ้อนอยู่ข้างใน จะได้ไม่กลายเป็นเลขเครดิตผี
  const arSource = text.replace(/BAR-\d{5}-\d{2}-\d+/g, " ");
  // ท้ายเลขรับตั้งแต่ 3 หลัก (เดิม 4) — เลขรุ่นแรก ๆ ต้นปีมีสามหลักจริง เช่น ORW-00003-26-152 /
  // INV-00003-26-142 (บิล ม.ค. 69 ของ บ.คลิกนิก เฮลท์) เดิมพาร์สได้ค่าว่างทั้งชุด = จับคู่ใบวางบิลไม่ติดตลอดกาล
  // ฝั่ง BAR (extractBarNo) ใช้ \d+ อยู่แล้ว การรับ 3 หลักตรงนี้จึงทำให้สองฝั่งกติกาเดียวกัน
  return {
    ar: arSource.match(/AR-\d{5}-\d{2}-\d{3,}/g) || [],
    orw: text.match(/ORW-\d{5}-\d{2}-\d{3,}/g) || [],
    inv: text.match(/INV-\d{5}-\d{2}-\d{3,}/g) || [],
  };
}

function caseTypeLabel(value) {
  return caseTypeOptions.find(([key]) => key === value)?.[1] || "ไม่ทราบ";
}

// ป้ายประเภทเคสในไทม์ไลน์: ใช้ชื่ออังกฤษที่สั้น/อ่านง่ายกว่าในบรรทัดเดียวกับวันที่
const caseTypeChipLabels = { nhso: "NHSO", insurance: "Insurance" };

function caseTypeChipLabel(value) {
  return caseTypeChipLabels[value] || caseTypeLabel(value);
}

function billingStageLabel(value) {
  return billingStageOptions.find(([key]) => key === value)?.[1] || "รอตรวจสอบ";
}

function displayBillingNo(bill) {
  return clean(bill.barNo) || clean(bill.billingNo);
}

// จำนวนเลขเครดิต (AR) ทั้งหมดที่เกาะ BAR เดียวกัน — นับข้ามทุกบิลที่ไม่ Exclude
function barCreditCountMap() {
  const map = new Map();
  state.bills.forEach((bill) => {
    if (bill.excluded) return;
    const bars = clean(bill.barNo).split(",").map(clean).filter(Boolean);
    if (!bars.length) return;
    const credits = clean(bill.creditNos).split(",").map(clean).filter(Boolean);
    bars.forEach((bar) => {
      if (!map.has(bar)) map.set(bar, new Set());
      credits.forEach((credit) => map.get(bar).add(credit));
    });
  });
  return map;
}

// บรรทัดอ้างอิงใต้ ORW: เครดิต (AR) ก่อน แล้ว ใบวางบิล (BAR) พร้อมจำนวนเครดิตที่เกาะ BAR เดียวกัน
function billRefLinesHtml(bill, barCredits) {
  const parts = [];
  if (clean(bill.creditNos)) parts.push(`เครดิต ${bill.creditNos}`);
  if (clean(bill.barNo)) {
    const bars = clean(bill.barNo).split(",").map(clean).filter(Boolean);
    const count = bars.reduce((sum, bar) => sum + (barCredits?.get(bar)?.size || 0), 0);
    parts.push(`ใบวางบิล ${bill.barNo}${count ? ` (${number(count)} เครดิต)` : ""}`);
  } else if (!clean(bill.creditNos) && clean(bill.billingNo)) {
    // snapshot เก่าไม่มี barNo/creditNos: แสดง billingNo เดิมไว้ก่อน
    parts.push(`ใบวางบิล ${bill.billingNo}`);
  }
  if (!parts.length) return "";
  // AR + BAR อยู่บรรทัดเดียวกัน — แต่ละก้อนเป็น inline-block จะได้ขึ้นบรรทัดใหม่ทั้งก้อนเมื่อที่ไม่พอ
  return `<span class="bill-ref">${parts.map((part) => `<span class="bill-ref-part">${htmlEscape(part)}</span>`).join(" ")}</span>`;
}

function deriveBillingStage(status, caseType, barNo, creditNos) {
  if (status === "billing-only") return { billingStage: "billing-only", billingStageSource: "auto-status" };
  if (status === "clicknic-only") return { billingStage: "no-mlp", billingStageSource: "auto-status" };
  // วางบิลแล้ว (auto): ต้องมีทั้งเลขใบวางบิล (BAR) และเลขที่เครดิต (AR) ครบก่อน — เลือกมือได้เสมอ
  if (clean(barNo) && clean(creditNos)) return { billingStage: "billed", billingStageSource: "auto-billing" };
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

// คีย์เทียบซ้ำต่อชนิดข้อมูล — ใช้ทั้ง dedupe และนับสถิติ import ให้ตรงกันเสมอ
function duplicateKeyForKind(kind, row) {
  if (kind === "clicknic") return clicknicDuplicateKey(row);
  if (kind === "mlp") return [row.referenceNo, row.invoice, Number(row.mlpCost || 0).toFixed(4), row.detail].join("|");
  return [row.bar, row.ar, row.orw, row.inv, Number(row.amount || 0).toFixed(2), row.dueDate].join("|");
}

function dedupeMlpRows(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = duplicateKeyForKind("mlp", row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeBillingRows(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = duplicateKeyForKind("billing", row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ---- สถิติ/เตือน การนำเข้าซ้ำ (STEP 1/2/3) --------------------------------
const DUP_WARN_RATIO = 0.8;      // ซ้ำ ≥ 80% ของไฟล์ = น่าจะเผลออัปไฟล์เดิม → เตือน
const DUP_WARN_MIN_ROWS = 5;     // ไฟล์เล็กกว่านี้ไม่เตือน (กันสัญญาณหลอกจากไฟล์ 1-2 แถว)

// raw = แถวที่อ่านได้, added = แถวใหม่ที่ยังไม่มี, dup = ซ้ำ (ในไฟล์เอง + ซ้ำกับของเดิม)
function computeImportStats(kind, existingRows, importedRows) {
  const existingKeys = new Set((existingRows || []).map((row) => duplicateKeyForKind(kind, row)));
  const seen = new Set();
  let added = 0;
  (importedRows || []).forEach((row) => {
    const key = duplicateKeyForKind(kind, row);
    if (existingKeys.has(key) || seen.has(key)) return;
    seen.add(key);
    added += 1;
  });
  const raw = (importedRows || []).length;
  return { raw, added, dup: raw - added };
}

function importStatsFor(existing, imported) {
  return {
    clicknic: computeImportStats("clicknic", existing.clicknic, imported.clicknicRows),
    mlp: computeImportStats("mlp", existing.mlp, imported.mlpRows),
    billing: computeImportStats("billing", existing.billing, imported.billingRows),
  };
}

// Modal สรุปผลนำเข้า (สไตล์เดียวกับ LINE MAN) — แสดงเฉพาะ STEP ที่มีแถวในไฟล์
const IMPORT_RESULT_LABEL = { clicknic: "CLICKNIC", mlp: "MEDLIFE PLUS", billing: "ใบวางบิล" };

function showImportResultModal(stats, fileNames = [], { sourceLabel = "ไฟล์ที่นำเข้า:" } = {}) {
  if (!elements.importResultModal || !elements.importResultBody) return;
  const groups = ["clicknic", "mlp", "billing"]
    .filter((kind) => stats[kind] && stats[kind].raw > 0)
    .map((kind) => {
      const s = stats[kind];
      return [
        `<section class="import-result-group">`,
        `<h3>${IMPORT_RESULT_LABEL[kind]}</h3>`,
        `<div class="import-result-row"><span>เพิ่มใหม่:</span><strong class="ok">${number(s.added)}</strong></div>`,
        `<div class="import-result-row"><span>ข้าม (ซ้ำ):</span><strong class="skip">${number(s.dup)}</strong></div>`,
        `</section>`,
      ].join("");
    });
  if (!groups.length) return;
  const filesHtml = fileNames.length
    ? `<div class="import-result-files"><span>${sourceLabel}</span><strong>${fileNames.map((name) => htmlEscape(name)).join("<br>")}</strong></div>`
    : "";
  elements.importResultBody.innerHTML = `<div class="import-result-box">${groups.join("")}${filesHtml}</div>`;
  if (!elements.importResultModal.open) elements.importResultModal.showModal();
}

// STEP ที่ซ้ำเกินเกณฑ์ → ถ้ามี เปิด modal ยืนยันก่อนนำเข้า (resolve true = ไปต่อ, false = ยกเลิก)
function confirmIfMostlyDuplicate(stats) {
  const flagged = ["clicknic", "mlp", "billing"]
    .map((kind) => ({ label: IMPORT_RESULT_LABEL[kind], s: stats[kind] }))
    .filter(({ s }) => s && s.raw >= DUP_WARN_MIN_ROWS && s.dup / s.raw >= DUP_WARN_RATIO);
  if (!flagged.length) return Promise.resolve(true);
  if (!elements.dupWarnModal || !elements.dupWarnBody) {
    // fallback confirm() เดิม เผื่อหน้าเก่าที่ยังไม่มี modal
    const lines = flagged.map(({ label, s }) =>
      `- ${label}: ซ้ำ ${Math.round((s.dup / s.raw) * 100)}% (${number(s.dup)}/${number(s.raw)} แถวมีอยู่แล้ว) → เพิ่มของใหม่ ${number(s.added)} แถว`);
    return Promise.resolve(confirm([
      "ไฟล์ที่อัปโหลดซ้ำกับข้อมูลเดิมเป็นส่วนใหญ่ — อาจเผลออัปไฟล์เดิมซ้ำ",
      "",
      ...lines,
      "",
      "กด OK เพื่อนำเข้าเฉพาะแถวใหม่ (แถวซ้ำถูกตัดอัตโนมัติอยู่แล้ว) · Cancel เพื่อยกเลิกทั้งหมด",
    ].join("\n")));
  }
  const groups = flagged.map(({ label, s }) => [
    `<section class="import-result-group">`,
    `<h3>${label}</h3>`,
    `<div class="import-result-row"><span>ซ้ำกับของเดิม:</span><strong class="warn">${number(s.dup)}/${number(s.raw)} แถว (${Math.round((s.dup / s.raw) * 100)}%)</strong></div>`,
    `<div class="import-result-row"><span>จะเพิ่มของใหม่:</span><strong class="ok">${number(s.added)}</strong></div>`,
    `</section>`,
  ].join("")).join("");
  elements.dupWarnBody.innerHTML = `<div class="import-result-box">${groups}</div>`;
  return new Promise((resolve) => {
    let settled = false;
    const finish = (goOn) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (elements.dupWarnModal.open) elements.dupWarnModal.close();
      resolve(goOn);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    // close event เป็น async — เช็ค open กัน event ค้างท่อจากรอบก่อนมาปิดรอบใหม่
    const onClose = () => { if (!elements.dupWarnModal.open) finish(false); };
    function cleanup() {
      elements.dupWarnOk.removeEventListener("click", onOk);
      elements.dupWarnCancel.removeEventListener("click", onCancel);
      elements.dupWarnModal.removeEventListener("close", onClose);
    }
    elements.dupWarnOk.addEventListener("click", onOk);
    elements.dupWarnCancel.addEventListener("click", onCancel);
    elements.dupWarnModal.addEventListener("close", onClose);
    elements.dupWarnModal.showModal();
  });
}

// STEP 2 (MLP) นำเข้าเฉพาะรายการของ บริษัท คลิกนิก เฮลท์ จำกัด — รายงาน MLP รวมทุกช่องทาง
// (AMED / LINEMAN / เงินสด / บริษัทอื่น) ซึ่งไม่ใช่บิลของบอร์ดนี้ จะกลายเป็นบิล "ไม่พบรายการยา" ปลอม
// แถวที่ช่องบริษัทว่าง (เช่นบรรทัดต่อของ detail) ให้ผ่าน เพื่อไม่ตัดข้อมูลแถว Clicknic ที่ wrap หลายบรรทัด
const MLP_IMPORT_COMPANY = /คลิกนิก\s*เฮลท์/;

function mlpCompanyImportable(company) {
  const value = clean(company);
  return !value || MLP_IMPORT_COMPANY.test(value);
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
  }).filter((row) => row && (row.orderId || row.orw || row.detail) && mlpCompanyImportable(row.company));
}

function billingDueDateFromCells(cells) {
  return cells.find((cell) => /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean(cell))) || "";
}

const DATE_CELL = /^\d{1,2}\/\d{1,2}\/\d{4}$/;

// ป้ายวันครบกำหนดที่ยอมรับ: มีคำว่า "ครบ" (= วันครบกำหนดแน่นอน) หรือเป็น "กำหนดชำระ" เป๊ะ ๆ ทั้งช่อง (ไฟล์ xlsx ใช้คำนี้)
// ⚠️ ห้ามยอม "วันกำหนดชำระ" — เป็นหัวคอลัมน์ในตาราง ค่าข้างในคือวันที่ทำรายการ ไม่ใช่วันครบกำหนด
const isHeadDueLabel = (text) => /ครบกำหนด/.test(text) || /^กำหนดชำระ[:：]?$/.test(text);

// วันครบกำหนดชำระจาก "หัวใบ" ของไฟล์ใบวางบิล — ต้องอ่านจาก rows ดิบ (ยังไม่ filter ช่องว่างทิ้ง) เพราะใช้ตำแหน่งคอลัมน์
// กติกา: เอาวันที่ตัวแรกที่อยู่ *ทางขวา* ของป้าย เพราะบรรทัดหัวใบมีวันที่ทำรายการอยู่ทางซ้ายด้วย
//   "วันที่ 02/07/2026 | ยอดเรียกเก็บ $660.00 | กำหนดชำระ 15/08/2026"  → ต้องได้ 15/08/2026 ไม่ใช่ 02/07/2026
// หัวตาราง ("ครบกำหนด") ไม่หลุดมาเพราะแถวหัวตารางไม่มีวันที่ในตัวเอง
function headDueDateFromRows(rows) {
  for (const row of rows) {
    if (!Array.isArray(row)) continue;
    const labelIndex = row.findIndex((cell) => isHeadDueLabel(clean(cell)));
    if (labelIndex < 0) continue;
    const date = row.slice(labelIndex + 1).map(clean).find((cell) => DATE_CELL.test(cell));
    if (date) return date;
  }
  return "";
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

// หัวใบวางบิลลูกหนี้: "วันครบกำหนดชำระ" (หัวใบ) ต่างจาก "วันกำหนดชำระ" (คอลัมน์ในตาราง = วันที่ทำรายการ)
// → บังคับให้มีคำว่า "ครบ" กันไปหยิบวันที่ในตารางมาผิด
const BILLING_HEAD_DUE_DATE = /วันครบกำหนด(?:ชำระ)?[\s:]*(\d{1,2}\/\d{1,2}\/\d{4})/;
const BILLING_HEAD_TOTAL = /ยอดเรียกเก็บ[\s:]*([\d,]+(?:\.\d{1,2})?)/;

// ค่าหัวใบที่ติดมากับข้อความ (ถ้า copy ทั้งหน้ามา) — ช่องที่เป็น input ของหน้าต้นทางจะไม่ติดมา ต้องกรอกเอง
function detectBillingHead(text) {
  const value = clean(text);
  return {
    bar: extractBarNo(value),
    dueDate: value.match(BILLING_HEAD_DUE_DATE)?.[1] || "",
    total: value.match(BILLING_HEAD_TOTAL)?.[1] || "",
  };
}

// วันครบกำหนดที่กรอกในโมดัล: รับได้ทั้ง พ.ศ./ค.ศ. แล้วเก็บเป็น วว/ดด/ปปปป (ค.ศ.) ให้รูปแบบตรงกับแถวที่อ่านจากไฟล์
function normalizeBillingDueDateInput(value) {
  const date = parseDateValue(value);
  if (!date) return "";
  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getUTCFullYear()}`;
}

function extractBarNo(value) {
  const match = clean(value).toUpperCase().match(/BAR-\d{5}-\d{2}-\d+/);
  return match ? match[0] : "";
}

// ตรวจ/normalize ค่าที่พิมพ์มือลงช่องใบวางบิล — ยึดรูปแบบเดียวกับทาง import (extractBarNo) เท่านั้น
// เหตุผลที่ต้องกัน: เจอจริง 8 บิลที่มี "AR-00003-26-3099" ค้างในช่อง BAR (ก๊อป AR วางผิดช่อง)
// 2 ใบในนั้นถูกเลื่อนเป็น "วางบิลแล้ว" เองแล้วไหลเข้ายอดขาย = รายได้ปลอม
// ผ่านแล้วคืนเฉพาะเลข BAR ที่ตัดออกมา — วางทั้งบรรทัดจากชีตมาก็ใช้ได้ ตัวพิมพ์เล็กก็ normalize ให้
function normalizeBarInput(value) {
  const raw = clean(value);
  if (!raw) return { ok: true, empty: true, value: "", bad: [] };
  const parts = raw.split(",").map(clean).filter(Boolean);
  const found = parts.map((part) => ({ part, bar: extractBarNo(part) }));
  // ชิ้นที่ไม่มี BAR นับเป็น "ผิด" เฉพาะเมื่อหน้าตาเป็นเลขอ้างอิง (AR-... / ORW-...) ที่ตั้งใจใส่มา
  // เศษข้อความจากการวางทั้งบรรทัดไม่นับ — เลขเงินหลักพันมีจุลภาคของตัวเอง ("ยอด 6,395.00")
  // ถ้านับหมดจะบล็อกการวางทั้งบรรทัดซึ่งเป็นวิธีใช้งานที่ตั้งใจรองรับ
  const bad = found.filter((item) => !item.bar && /[A-Z]{1,5}-\d/i.test(item.part)).map((item) => item.part);
  const value2 = [...new Set(found.filter((item) => item.bar).map((item) => item.bar))].join(", ");
  // ไม่มีทั้งเลขที่ใช้ได้และไม่มีชิ้นที่ระบุว่าผิด (เช่นพิมพ์ข้อความเปล่า ๆ) = ผิดทั้งก้อน
  if (!bad.length && !value2) return { ok: false, empty: false, value: "", bad: [raw] };
  return { ok: !bad.length && Boolean(value2), empty: false, value: value2, bad };
}

function barInputErrorText(check) {
  const bad = check.bad.join(", ");
  return `เลขใบวางบิลไม่ถูกรูปแบบ: ${bad} — ต้องเป็น BAR-00003-26-xxxx เท่านั้น (ถ้าเป็น AR-... นั่นคือเลขที่เครดิต ให้ใส่ช่อง AR)`;
}

// fallbackBar / dueDateOverride = ค่าที่กรอกในโมดัล paste (หัวใบวางบิล copy ไม่ติดมา)
// BAR: ใช้ต่อท้ายสุด — ที่เจอในไฟล์/ข้อความจริงชนะเสมอ
// วันครบกำหนด: ทับค่าในแถว เพราะคอลัมน์ "วันกำหนดชำระ" ของหน้า BAR คือวันที่ทำรายการ ไม่ใช่วันครบกำหนด
function parseBillingRecord(cells, sourceName, sheetName, rowNumber, contextBar = "", { fallbackBar = "", dueDateOverride = "" } = {}) {
  const text = cells.map(clean).filter(Boolean).join(" ");
  const refs = extractRefs(text);
  if (!refs.orw.length && !refs.inv.length && !refs.ar.length) return null;
  return {
    bar: extractBarNo(sourceName) || extractBarNo(text) || contextBar || fallbackBar,
    ar: refs.ar[0] || "",
    orw: refs.orw[0] || "",
    inv: refs.inv[0] || "",
    dueDate: dueDateOverride || billingDueDateFromCells(cells),
    amount: billingAmountFromCells(cells),
    rawText: text,
    sourceName,
    sheetName,
    rowNumber,
  };
}

function parseBillingWorkbook(workbook, sourceName, options = {}) {
  const parsed = [];
  workbook.SheetNames.forEach((sheetName) => {
    const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
      header: 1,
      defval: "",
      raw: false,
    });
    // วันครบกำหนดจริงอยู่หัวใบ ไม่ใช่ในแถว — คอลัมน์ "ครบกำหนด" ของแต่ละแถวคือวันที่ทำรายการ
    // ค่าที่กรอกในโมดัล paste ชนะเสมอ ถ้าไม่มีค่อยใช้หัวใบในไฟล์
    const sheetOptions = { ...options, dueDateOverride: options.dueDateOverride || headDueDateFromRows(rows) };
    let pendingRecord = null;
    // เลข BAR ที่เจอล่าสุดในชีต (เช่นหัวกระดาษหน้าใบวางบิลลูกหนี้ที่ copy ทั้งหน้ามาวาง)
    // → ผูกให้รายการเครดิต (AR) ทุกแถวถัดไปที่ไม่มี BAR ของตัวเอง
    let contextBar = "";
    const flushPendingRecord = () => {
      if (!pendingRecord) return;
      const record = parseBillingRecord(pendingRecord.cells, sourceName, sheetName, pendingRecord.rowNumber, pendingRecord.contextBar, sheetOptions);
      if (record) parsed.push(record);
      pendingRecord = null;
    };

    rows.forEach((row, index) => {
      const cells = row.map(clean).filter(Boolean);
      const text = cells.join(" ");
      const refs = extractRefs(text);
      if (!cells.length) return;

      const barInRow = extractBarNo(text);
      if (barInRow) contextBar = barInRow;

      if (refs.ar.length) {
        flushPendingRecord();
        pendingRecord = { cells: [...cells], rowNumber: index + 1, contextBar };
        return;
      }

      // แถวสรุป "รวม"/ส่วนการชำระเงินท้ายหน้า: ปิด record ก่อนหน้า กันยอดรวม/ยอดชำระไปทับยอดรายการ
      if (!refs.orw.length && !refs.inv.length && /(^|\s)(รวม|ยอดรวม|total|การชำระเงิน|ยอดเงินสุทธิ|ค้างชำระ)/i.test(text)) {
        flushPendingRecord();
        return;
      }

      if (pendingRecord) {
        pendingRecord.cells.push(...cells);
        return;
      }

      const record = parseBillingRecord(cells, sourceName, sheetName, index + 1, contextBar, sheetOptions);
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

// เลขที่อ้างอิงของกลุ่ม MLP ที่ใช้จับคู่ใบวางบิล — สกัดเลขออกจากค่าในคอลัมน์อีกชั้น
// เดิมเอาค่าดิบทั้งช่องไปเทียบตรง ๆ ถ้าช่องมีข้อความพ่วงมาด้วยคือ miss เงียบ
// (ฝั่งใบวางบิลเก็บเลขที่ผ่าน extractRefs มาแล้ว = normalize ทั้งคู่ คีย์จึงตรงกันได้)
function mlpRefKeys(mlp) {
  if (!mlp) return [];
  const refs = extractRefs([...(mlp.orwList || []), ...(mlp.invoiceList || [])].join(" "));
  return [...new Set([...refs.orw, ...refs.inv])];
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

// รายการยามีจริง → สถานะ "ไม่พบรายการยา" (mlp-only) ไม่เป็นจริง ถือว่าจับคู่ได้
// invariant นี้ต้องบังคับทุก pipeline (build / override / กู้คืน session / รวมถัง) ไม่ผูกกับการมี override
function reconcileMedicineStatus(bill) {
  if (bill.status === "mlp-only" && bill.medicines?.length) bill.status = "matched";
  return bill;
}

function applyBillOverride(bill) {
  const override = state.billOverrides[bill.billKey];
  if (!override) return reconcileMedicineStatus(bill);
  const merged = { ...bill, ...override.values, hasOverride: true, overrideNote: override.note || "" };
  reconcileMedicineStatus(merged);
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

// diff (ถ้าส่ง) = ส่วนต่างเป็นบาท เอาไปโชว์ท้าย chip ให้อ่านจบในตาเดียวโดยไม่ต้อง hover
// ใส่ field เฉพาะตอนเป็นตัวเลขจริงเท่านั้น — กัน undefined หลุดไปกับบิลที่เซฟลง Firestore
function pushIssue(issues, level, code, text, diff) {
  if (issues.some((issue) => issue.code === code)) return;
  const issue = { level, code, text };
  if (Number.isFinite(diff)) issue.diff = diff;
  issues.push(issue);
}

// มีข้อมูลต้นทุนแล้วไหม — ระดับบิล (cost/mlpCost จาก import หรือ drawer) หรือทุนจริงรายบรรทัด (realCost)
function billHasCostData(bill) {
  if (toNumeric(bill.cost) + toNumeric(bill.mlpCost) > 0) return true;
  return (bill.medicines || []).some((line) => toNumeric(line.realCost) > 0);
}

// บิล clicknic-only ที่วางบิลครบ (BAR+AR) = reconcile แล้ว นับเป็นจับคู่แล้ว ไม่เตือน "รายการยาไม่มี MLP"
// — สปสช: BAR+AR ก็พอ (MLP หายไม่กระทบ เพราะต้นทุน MLP = 0 โดยธรรมเนียม)
// — ประกัน: ต้องมีข้อมูลต้นทุนแล้วด้วย กันบิลทุนยังว่าง (กำไรเวอร์) หลุดจากเรดาร์ทั้งที่งานยังไม่จบ
// "รอใบวางบิล" ที่ยังรอจริง — ใช้กับชิปและแท็บเท่านั้น (ตัวนับดิบ metrics.mlpNoBilling ไม่แตะ)
// ตัดออก 2 กลุ่ม:
//   1. บิลที่ถูกจัดเข้าหมวดงานวางบิลเฉพาะแล้ว (กันนับซ้ำกับชิปกลุ่มงานวางบิลค้าง)
//   2. บิลที่มีเลข BAR+AR ครบแล้ว = วางบิลเสร็จจริง (กรอกมือ/AR2BAR) แม้ status จะยังเป็น pending-billing
// ข้อ 2 จำเป็นเพราะ status คำนวณครั้งเดียวตอน build จากการจับคู่ไฟล์ ไม่เคย re-derive จาก BAR/AR
// ถ้าไม่ตัด: กดปุ่ม "ปรับเป็นวางบิลแล้ว" (BAR+AR ครบ) แล้ว stage เป็น billed ซึ่งไม่อยู่ใน
// BILLING_WORKFLOW_STAGES → บิลจะเด้งเข้าชิป "รอใบวางบิล" แทนที่จะหายไป = ตัวเลขเพิ่มขึ้นสวนความคาดหมาย
// เลือกแก้ที่ชั้นแสดงผล ไม่แตะ status เอง เพราะกฎ validation + ตัวนับ/export ผูกกับ status อยู่หลายที่
function isPendingBillingOpen(bill) {
  if (bill.status !== "pending-billing") return false;
  if (BILLING_WORKFLOW_STAGES.has(bill.billingStage || "pending-review")) return false;
  return !(clean(bill.barNo) && clean(bill.creditNos));
}

function isReconciledClicknicOnly(bill) {
  if (bill.status !== "clicknic-only") return false;
  if (!clean(bill.barNo) || !clean(bill.creditNos)) return false;
  if (bill.caseType === "nhso") return true;
  if (bill.caseType === "insurance") return billHasCostData(bill);
  return false;
}

function validationRulesForBill(bill) {
  const issues = [];
  if (bill.excluded) {
    pushIssue(issues, "info", "EXCLUDED", `ไม่นับคำนวณ${bill.excludeReason ? `: ${bill.excludeReason}` : ""}`);
  }
  if (bill.status === "mlp-only" && !(bill.medicines && bill.medicines.length)) {
    pushIssue(issues, "danger", "MLP_NO_MEDICINE", "ไม่พบรายการยา");
  }
  if (bill.status === "pending-billing") {
    pushIssue(issues, "warn", "PENDING_BILLING", "รอใบวางบิล");
  }
  if (bill.status === "billing-only") {
    pushIssue(issues, "danger", "BILLING_NOT_IN_MLP", "ใบวางบิลไม่เจอ MLP");
  }
  if (bill.status === "clicknic-only" && !isReconciledClicknicOnly(bill)) {
    pushIssue(issues, "danger", "CLICKNIC_NOT_IN_MLP", "รายการยาไม่มี MLP");
  }
  if (bill.profit < -Math.max(0, toNumeric(activeRuleConfig().negativeProfitTolerance))) {
    pushIssue(issues, "warn", "NEGATIVE_PROFIT", "กำไรติดลบ");
  }
  if (bill.clicknicDate && bill.mlpDate && dateKey(bill.clicknicDate) !== dateKey(bill.mlpDate)) {
    pushIssue(issues, "info", "DATE_MISMATCH", `วันที่ CKNC (${formatDisplayDate(bill.clicknicDate)}) ไม่ตรงกับ MLP (${formatDisplayDate(bill.mlpDate)})`);
  }
  // สปสช ต้นทุนปกติ = 0 (CLICKNIC ส่งยาให้ฟรี) → ต้นทุน 0 ไม่ใช่เรื่องผิด ไม่ต้องเตือน NCO
  if ((bill.status === "matched" || bill.status === "pending-billing") && bill.caseType !== "nhso" && toNumeric(bill.cost) + toNumeric(bill.mlpCost) <= 0) {
    pushIssue(issues, "warn", "MISSING_MLP_COST", "ไม่มีต้นทุน");
  }
  if (bill.status === "matched" && toNumeric(bill.billedAmount) <= 0 && state.billingRows.length) {
    pushIssue(issues, "warn", "MISSING_BILLED_AMOUNT", "ยังไม่มียอดใบวางบิล");
  }
  if (bill.status === "billing-only" && !clean(bill.creditNos) && !clean(bill.billingNo)) {
    pushIssue(issues, "warn", "MISSING_AR", "ไม่มีเลขที่เครดิต (AR)");
  }
  // วางบิลแล้ว/PAID ต้องมีทั้งเลขใบวางบิล (BAR) และเลขที่เครดิต (AR) กำกับเสมอ
  if (["billed", "paid"].includes(bill.billingStage)) {
    const stageLabel = billingStageLabel(bill.billingStage);
    if (!clean(bill.barNo)) {
      pushIssue(issues, "warn", "MISSING_BAR", `${stageLabel} แต่ไม่มีเลขใบวางบิล (BAR)`);
    }
    if (!clean(bill.creditNos)) {
      pushIssue(issues, "warn", "MISSING_AR", `${stageLabel} แต่ไม่มีเลขที่เครดิต (AR)`);
    }
  }
  if (toNumeric(bill.mlpCost) > 0 && toNumeric(bill.sale) > 0 && toNumeric(bill.mlpCost) > toNumeric(bill.sale) + Math.max(0, toNumeric(activeRuleConfig().mlpCostOverSaleBuffer))) {
    pushIssue(issues, "danger", "MLP_COST_OVER_SALE", "ค่าใช้จ่าย MLP สูงกว่ายอดขายยา", toNumeric(bill.mlpCost) - toNumeric(bill.sale));
  }
  if (bill.billedAmount > 0) {
    const expected = expectedBillingForBill(bill);
    const tolerance = billingAmountTolerance();
    // เครื่องหมาย: + = วางบิลมากกว่าค่าที่เทียบ, − = วางบิลน้อยกว่า (ยึด "ยอดวางบิล" เป็นตัวตั้งเสมอทั้ง 3 กติกา)
    if (expected > 0 && moneyDiff(bill.billedAmount, expected) > tolerance) {
      pushIssue(issues, "warn", "BILLED_AMOUNT_EXPECTED_MISMATCH", `ยอดใบวางบิลไม่ตรงค่าที่คาดไว้ ${money(expected)}`, toNumeric(bill.billedAmount) - expected);
    }
    if (toNumeric(bill.mlpCost) > 0 && moneyDiff(bill.billedAmount, bill.mlpCost) > tolerance) {
      pushIssue(issues, "info", "BILLED_AMOUNT_MLP_COST_MISMATCH", `ยอดใบวางบิลไม่ตรง MLP cost ${money(bill.mlpCost)}`, toNumeric(bill.billedAmount) - toNumeric(bill.mlpCost));
    }
  }
  if (toNumeric(bill.expectedClaim) > 0 && toNumeric(bill.billedAmount) > 0
    && moneyDiff(bill.expectedClaim, bill.billedAmount) > billingAmountTolerance()) {
    pushIssue(issues, "info", "EXPECTED_CLAIM_MISMATCH", `ยอดใบวางบิลไม่ตรงยอดเรียกเก็บ CKNC-INS/NHSO ${money(bill.expectedClaim)}`, toNumeric(bill.billedAmount) - toNumeric(bill.expectedClaim));
  }
  return issues;
}

function buildBills() {
  const allClicknicRows = [...state.clicknicRows, ...state.manualClicknicRows];
  const { byOrder: clicknicByOrder, topMeds } = aggregateClicknic(allClicknicRows);
  const mlpByOrder = aggregateMlp(state.mlpRows);
  const billingByRef = aggregateBilling(state.billingRows);
  // ยา manual ที่คีย์เป็น ORW (บิล MLP ไม่มีเลขที่ออเดอร์): ย้ายกลุ่มไปคีย์ของแถว MLP ที่ ORW ตรงกัน
  [...clicknicByOrder.keys()].forEach((key) => {
    if (!/^ORW-/i.test(key) || mlpByOrder.has(key)) return;
    for (const [mlpKey, mlpGroup] of mlpByOrder) {
      if (clicknicByOrder.has(mlpKey)) continue;
      const orwMatch = (mlpGroup.orwList || []).some((orw) => clean(orw).toUpperCase() === key.toUpperCase());
      if (orwMatch) {
        clicknicByOrder.set(mlpKey, clicknicByOrder.get(key));
        clicknicByOrder.delete(key);
        break;
      }
    }
  });
  const keys = new Set([...clicknicByOrder.keys(), ...mlpByOrder.keys()]);
  const usedBillingRows = new Set();

  state.topMeds = topMeds;
  state.bills = [...keys].map((key) => {
    const click = clicknicByOrder.get(key);
    const mlp = mlpByOrder.get(key);
    const hasManualMedicines = Boolean(click?.medicines.some((row) => row.sourceType === "screenshot"));
    const billingMatches = mlpRefKeys(mlp).flatMap((ref) => billingByRef.get(ref) || []);
    const uniqueBilling = [...new Map(billingMatches.map((row) => [`${row.sourceName}:${row.sheetName}:${row.rowNumber}`, row])).values()];
    uniqueBilling.forEach((row) => usedBillingRows.add(`${row.sourceName}:${row.sheetName}:${row.rowNumber}`));
    const sale = click?.sale || 0;
    const cost = click?.cost || 0;
    const mlpCost = mlp?.mlpCost || 0;
    const billedAmount = uniqueBilling.reduce((sum, row) => sum + row.amount, 0);
    const barNos = [...new Set(uniqueBilling.map((row) => row.bar).filter(Boolean))];
    const arNos = [...new Set(uniqueBilling.map((row) => row.ar).filter(Boolean))];
    const barNo = barNos.join(", ");
    const creditNos = arNos.join(", ");
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
    const billingStageDetection = deriveBillingStage(status, caseType, barNo, creditNos);
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
      barNo,
      creditNos,
      billingRefs: uniqueBilling.map((row) => [row.ar, row.orw, row.inv].filter(Boolean).join(" / ")).join(", "),
      mlpReferenceNos: [...new Set(mlp?.referenceList || [])].filter(Boolean).join(", "),
      mlpMemoOrderIds: [...new Set(mlp?.memoOrderIds || [])].filter(Boolean).join(", "),
      clicknicDate: click?.clicknicDate || "",
      mlpDate: mlp?.mlpDate || "",
      billingDueDate: uniqueBilling.map((row) => row.dueDate).filter(Boolean)[0] || "",
      patient: mlp?.patient || "",
      refId: "",
      phone: "",
      address: "",
      diagnosis: "",
      expectedClaim: 0,
      medicineCount: click?.medicines.length || 0,
      medicines: (click?.medicines || []).map((item) => ({
        medicine: item.medicine || item.medicineRaw || "",
        qty: toNumeric(item.qty),
        sale: toNumeric(item.sale),
        cost: toNumeric(item.cost),
      })),
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
    const billingStageDetection = deriveBillingStage("billing-only", caseDetection.caseType, row.bar, row.ar);
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
      barNo: row.bar || "",
      creditNos: row.ar || "",
      billingRefs: [row.ar, row.orw, row.inv].filter(Boolean).join(" / "),
      mlpReferenceNos: "",
      mlpMemoOrderIds: "",
      clicknicDate: "",
      mlpDate: "",
      billingDueDate: row.dueDate,
      patient: "",
      refId: "",
      phone: "",
      address: "",
      diagnosis: "",
      expectedClaim: 0,
      medicineCount: 0,
      medicines: [],
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

  applyManualMergeGroups();
  applyDeletedBills();
}

function activeBills() {
  return state.bills.filter((bill) => !bill.excluded);
}

// ชุดบิลตามช่วงวันที่ที่กรองอยู่ — การ์ดสรุป chips แท็บ และ Card Detail ใช้ชุดเดียวกันให้เลขสอดคล้องกัน
function dateFilteredBills() {
  return activeBills().filter(isWithinDateRange);
}

// ป้ายบอกช่วงที่กรองอยู่ เช่น "พ.ค. 2569" / "ปี 2569" / "12/06/2569 – 15/06/2569"
function activePeriodLabel() {
  const from = elements.dateFrom.value;
  const to = elements.dateTo.value;
  if (!from && !to) return "";
  if (from && to) {
    if (from === to) return formatDisplayDate(from);
    const [year, month] = from.split("-").map(Number);
    const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
    if (from.slice(0, 7) === to.slice(0, 7) && from.endsWith("-01") && Number(to.slice(8)) === lastDay) {
      return monthChipLabel(from.slice(0, 7));
    }
    if (from.slice(0, 4) === to.slice(0, 4) && from.endsWith("-01-01") && to.endsWith("-12-31")) {
      return `ปี ${year + (yearEra === "be" ? 543 : 0)}`;
    }
  }
  return `${formatDisplayDate(from) || "…"} – ${formatDisplayDate(to) || "…"}`;
}

function calculateMetrics() {
  const bills = dateFilteredBills();
  const clickOrders = new Set([...state.clicknicRows, ...state.manualClicknicRows].map((row) => row.orderId)).size;
  const matched = bills.filter((bill) => bill.status === "matched").length;
  const mlpOnly = bills.filter((bill) => bill.status === "mlp-only").length;
  const clickOnly = bills.filter((bill) => bill.status === "clicknic-only").length;
  const billingRows = state.billingRows.length;
  const mlpNoBilling = bills.filter((bill) => bill.status === "pending-billing").length;
  const billingOnly = bills.filter((bill) => bill.status === "billing-only").length;
  // ยอดขาย/ต้นทุน/กำไร นับเฉพาะบิลที่ PAID หรือ วางบิลแล้วมีเลข BAR (รายได้ที่เกิดจริง)
  const revenueBills = bills.filter(countsInRevenue);
  const sale = revenueBills.reduce((sum, bill) => sum + bill.sale, 0);
  // แยกยอดขายตามประเภทเคส — สปสช / ประกัน / อื่น ๆ
  const saleNhso = revenueBills.filter((bill) => bill.caseType === "nhso").reduce((sum, bill) => sum + bill.sale, 0);
  const saleInsurance = revenueBills.filter((bill) => bill.caseType === "insurance").reduce((sum, bill) => sum + bill.sale, 0);
  const saleOther = sale - saleNhso - saleInsurance;
  const cost = revenueBills.reduce((sum, bill) => sum + bill.cost, 0);
  const mlpCost = revenueBills.reduce((sum, bill) => sum + bill.mlpCost, 0);
  const totalCost = cost + mlpCost;
  const profit = revenueBills.reduce((sum, bill) => sum + bill.profit, 0);
  // แยกกำไรตามประเภทเคส — สปสช / ประกัน / อื่น ๆ
  const profitNhso = revenueBills.filter((bill) => bill.caseType === "nhso").reduce((sum, bill) => sum + bill.profit, 0);
  const profitInsurance = revenueBills.filter((bill) => bill.caseType === "insurance").reduce((sum, bill) => sum + bill.profit, 0);
  const profitOther = profit - profitNhso - profitInsurance;
  const caseInsurance = bills.filter((bill) => bill.caseType === "insurance").length;
  const caseNhso = bills.filter((bill) => bill.caseType === "nhso").length;
  const caseUnknown = bills.filter((bill) => !bill.caseType || bill.caseType === "unknown").length;
  const billingInsurancePending = bills.filter((bill) => bill.billingStage === "insurance-review").length;
  const billingNhsoPending = bills.filter((bill) => bill.billingStage === "nhso-pending").length;
  const billingReviewPending = bills.filter((bill) => bill.billingStage === "pending-review").length;
  return { clickOrders, matched, mlpOnly, clickOnly, billingRows, mlpNoBilling, billingOnly, sale, saleNhso, saleInsurance, saleOther, cost, mlpCost, totalCost, profit, profitNhso, profitInsurance, profitOther, caseInsurance, caseNhso, caseUnknown, billingInsurancePending, billingNhsoPending, billingReviewPending };
}

function updateEmptyState() {
  document.body.classList.toggle("cknc-has-data", state.bills.length > 0);
}

// อัปเดตประวัติการโหลดของ step หลัง import สำเร็จ — rows นับจาก state ปัจจุบัน (หลัง dedupe แล้ว)
function updateSourceMeta(kind, fileNames = []) {
  const rows = kind === "clicknic" ? state.clicknicRows.length + state.manualClicknicRows.length
    : kind === "mlp" ? state.mlpRows.length
      : state.billingRows.length;
  const previous = state.sourceMeta?.[kind];
  const files = [...new Set([...(previous?.files || []), ...fileNames.map(clean).filter(Boolean)])];
  state.sourceMeta = { ...state.sourceMeta, [kind]: { lastLoadedAt: new Date().toISOString(), files, rows } };
}

function resetSourceMeta() {
  state.sourceMeta = { clicknic: null, mlp: null, billing: null };
}

function formatThaiDateTime(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("th-TH", { day: "numeric", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" });
}

// บรรทัดเล็กใต้สถานะการ์ด: เวลาอัปโหลด/ไฟล์/แถวจาก sourceMeta หรือ fallback เป็นเวลา autosave/session ที่กู้คืน
function stepMetaLine(meta) {
  if (meta?.lastLoadedAt) {
    const parts = [`อัปโหลดล่าสุด ${formatThaiDateTime(meta.lastLoadedAt)}`];
    if (meta.files?.length) parts.push(`${number(meta.files.length)} ไฟล์`);
    if (meta.rows) parts.push(`${number(meta.rows)} แถว`);
    return parts.join(" • ");
  }
  if (state.snapshotMode && state.restoredInfo?.savedAtIso) {
    return `ข้อมูล ณ ${formatThaiDateTime(state.restoredInfo.savedAtIso)} (${state.restoredInfo.source === "autosave" ? "autosave" : "session"})`;
  }
  return "";
}

function setStepStatus(el, count, meta, restoredText) {
  if (!el) return;
  const restored = Boolean(restoredText && count);
  const main = !count ? "ยังไม่ได้โหลด"
    : restored ? `<i class="fa-solid fa-clock-rotate-left"></i> กู้คืนแล้ว — ${restoredText}`
      : `<i class="fa-solid fa-circle-check"></i> โหลดแล้ว ${number(count)} รายการ`;
  const metaLine = count ? stepMetaLine(meta) : "";
  el.innerHTML = metaLine ? `${main}<span class="drop-status-meta">${htmlEscape(metaLine)}</span>` : main;
  el.classList.toggle("loaded", count > 0 && !restored);
  el.classList.toggle("restored", restored);
}

// snapshot ที่กู้คืนไม่มี source rows — นับข้อมูลแต่ละฝั่งจากตัวบิลแทน
function restoredStepCounts() {
  const bills = state.bills;
  const medBills = bills.filter((bill) => (bill.medicines || []).length);
  const medLines = medBills.reduce((sum, bill) => sum + bill.medicines.length, 0);
  const mlpBills = bills.filter((bill) => bill.status !== "clicknic-only" && bill.status !== "billing-only").length;
  const billingBills = bills.filter((bill) => bill.barNo || bill.creditNos || bill.billingNo || bill.billedAmount).length;
  const barCount = new Set(bills.flatMap((bill) => clean(bill.barNo).split(/\s*,\s*/).filter(Boolean))).size;
  return { medBills: medBills.length, medLines, mlpBills, billingBills, barCount };
}

function renderStepStatuses() {
  if (state.snapshotMode && state.bills.length) {
    const counts = restoredStepCounts();
    setStepStatus(elements.clicknicStatus, counts.medBills, state.sourceMeta?.clicknic,
      `${number(counts.medBills)} บิลมีรายการยา (${number(counts.medLines)} รายการ)`);
    setStepStatus(elements.mlpStatus, counts.mlpBills, state.sourceMeta?.mlp,
      `${number(counts.mlpBills)} บิล MLP`);
    setStepStatus(elements.billingStatus, counts.billingBills, state.sourceMeta?.billing,
      `${number(counts.billingBills)} บิลมีใบวางบิล${counts.barCount ? ` (BAR ${number(counts.barCount)} เลข)` : ""}`);
    return;
  }
  setStepStatus(elements.clicknicStatus, state.clicknicRows.length + state.manualClicknicRows.length, state.sourceMeta?.clicknic);
  setStepStatus(elements.mlpStatus, state.mlpRows.length, state.sourceMeta?.mlp);
  setStepStatus(elements.billingStatus, state.billingRows.length, state.sourceMeta?.billing);
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
    autosaveStatusText("Autosave: ครบ CKNC+MLP+BARแล้ว — รอ login เพื่อบันทึกขึ้น cloud");
    return;
  }
  clearTimeout(state.autosaveTimer);
  autosaveStatusText("Autosave: ครบ CKNC+MLP+BAR กำลังบันทึกขึ้น cloud...");
  autosaveMonthlySession("all-steps-complete");
}

// ช่องตัวเลขในตารางย่อยของการ์ด = chip กดได้ เปิด popup บิลของช่องนั้น (กดแถว = กรองเดือนทั้งจอเหมือนเดิม)
function monthDrillCell(metric, caseType, month, text) {
  return `<span class="month-drill-chip" data-month-drill="${metric}:${caseType}:${month}" title="ดูบิล${monthDrillMetrics[metric]?.label || ""} ${caseFocusNames[caseType] || ""} ${htmlEscape(monthChipLabel(month))}">${text}</span>`;
}

// การ์ดเคสรายเดือนของปีปัจจุบัน — นับจากบิลทั้งหมดบนจอ (ไม่ตามตัวกรอง) กดแถวเดือน = กรอง/ยกเลิกกรอง
function renderMonthlyCases() {
  const body = $("monthlyCasesBody");
  if (!body) return;
  const yearNow = new Date().getFullYear();
  const yearLabel = $("monthlyCasesYear");
  if (yearLabel) yearLabel.textContent = String(yearNow + (yearEra === "be" ? 543 : 0));
  const byMonth = new Map();
  activeBills().forEach((bill) => {
    if (!caseSeqNames[bill.caseType]) return;
    const month = (primaryBillDate(bill) || "").slice(0, 7);
    if (!month || Number(month.slice(0, 4)) !== yearNow) return;
    const entry = byMonth.get(month) || { nhso: 0, insurance: 0 };
    entry[bill.caseType] += 1;
    byMonth.set(month, entry);
  });
  const months = [...byMonth.keys()].sort();
  if (!months.length) {
    body.innerHTML = '<div class="monthly-cases-empty">ยังไม่มีเคส สปสช/ประกัน ในปีนี้</div>';
    return;
  }
  const rows = months.map((month) => {
    const entry = byMonth.get(month);
    const [year, monthNum] = month.split("-").map(Number);
    const monthShort = new Date(Date.UTC(year, monthNum - 1, 1)).toLocaleDateString("th-TH", { month: "short", timeZone: "UTC" });
    const range = monthRangeOf(month);
    const isActive = elements.dateFrom.value === range.from && elements.dateTo.value === range.to;
    return `<button type="button" class="monthly-cases-row${isActive ? " active" : ""}" data-month-filter="${month}" title="${isActive ? "กดอีกครั้งเพื่อยกเลิกกรอง" : `กรองทั้งจอเป็นเดือน ${htmlEscape(monthChipLabel(month))}`}">
      <span>${htmlEscape(monthShort)}</span><span>${entry.nhso ? monthDrillCell("cases", "nhso", month, number(entry.nhso)) : "—"}</span><span>${entry.insurance ? monthDrillCell("cases", "insurance", month, number(entry.insurance)) : "—"}</span>
    </button>`;
  }).join("");
  body.innerHTML = `<div class="monthly-cases-row head"><span></span><span>สปสช</span><span>ประกัน</span></div>${rows}`;
}

// การ์ดยอดขาย/ต้นทุน/กำไร: ตารางย่อ สปสช/ประกัน 3 เดือนล่าสุด (นับเฉพาะบิลที่เข้ารายได้ ไม่ขึ้นกับตัวกรอง) — กดแถวกรองเดือน
// โฟกัสประเภทจาก chip บนการ์ด: เหลือคอลัมน์เดียวของประเภทนั้น (รวม "อื่น ๆ" ที่ปกติไม่มีคอลัมน์)
function renderMoneyByMonth(bodyId, valueFn, emptyLabel) {
  const body = $(bodyId);
  if (!body) return;
  const metricKey = bodyId === "saleByMonthBody" ? "sale" : bodyId === "costByMonthBody" ? "cost" : "profit";
  const focus = caseFocus[metricKey] || "";
  const columns = focus ? [focus] : ["nhso", "insurance"];
  const inColumns = (bill) => (focus === "other" ? !caseSeqNames[bill.caseType]
    : focus ? bill.caseType === focus : Boolean(caseSeqNames[bill.caseType]));
  const byMonth = new Map();
  activeBills().forEach((bill) => {
    if (!inColumns(bill)) return;
    if (!countsInRevenue(bill)) return; // เฉพาะ PAID / วางบิลแล้วมี BAR (ให้ตรงกับการ์ด)
    const month = (primaryBillDate(bill) || "").slice(0, 7);
    if (!month) return;
    const entry = byMonth.get(month) || { nhso: 0, insurance: 0, other: 0, counts: { nhso: 0, insurance: 0, other: 0 } };
    const colKey = focus || bill.caseType;
    entry[colKey] += valueFn(bill);
    entry.counts[colKey] += 1; // นับบิลแยกจากยอด — ยอด 0 แต่มีบิล (เช่นต้นทุนสปสช) ต้องโชว์ 0 ไม่ใช่ —
    byMonth.set(month, entry);
  });
  body.classList.toggle("focus-one", Boolean(focus));
  const months = [...byMonth.keys()].sort().slice(-3); // 3 เดือนล่าสุด
  if (!months.length) {
    body.innerHTML = `<div class="monthly-cases-empty">${htmlEscape(focus ? `ยังไม่มี${monthDrillMetrics[metricKey]?.label || ""} ${caseFocusNames[focus]}` : emptyLabel)}</div>`;
    return;
  }
  const rows = months.map((month) => {
    const entry = byMonth.get(month);
    const [year, monthNum] = month.split("-").map(Number);
    const monthShort = new Date(Date.UTC(year, monthNum - 1, 1)).toLocaleDateString("th-TH", { month: "short", timeZone: "UTC" });
    const range = monthRangeOf(month);
    const isActive = elements.dateFrom.value === range.from && elements.dateTo.value === range.to;
    const cells = columns.map((col) => `<span>${entry.counts[col] ? monthDrillCell(metricKey, col, month, money(entry[col])) : "—"}</span>`).join("");
    return `<button type="button" class="monthly-cases-row${isActive ? " active" : ""}" data-month-filter="${month}" title="${isActive ? "กดอีกครั้งเพื่อยกเลิกกรอง" : `กรองทั้งจอเป็นเดือน ${htmlEscape(monthChipLabel(month))}`}">
      <span>${htmlEscape(monthShort)}</span>${cells}
    </button>`;
  }).join("");
  body.innerHTML = `<div class="monthly-cases-row head"><span></span>${columns.map((col) => `<span>${caseFocusNames[col]}</span>`).join("")}</div>${rows}`;
}

function toggleMonthFilter(month) {
  const range = monthRangeOf(month);
  const alreadyActive = elements.dateFrom.value === range.from && elements.dateTo.value === range.to;
  // กรองด้วยวันบิลหลัก (CLICKNIC→MLP) ให้ตรงกับการนับเดือนในการ์ด
  elements.dateField.value = "primary";
  elements.dateFrom.value = alreadyActive ? "" : range.from;
  elements.dateTo.value = alreadyActive ? "" : range.to;
  elements.targetDate.value = "";
  state.activeStatus = "all";
  renderMetrics();
  renderTabs();
  renderTable();
  renderQuickDateFilters();
}

// โฟกัสการ์ดยอดขาย/กำไรตาม chip ประเภทเคส — สถานะบนจอชั่วคราว ไม่บันทึกลง session
const caseFocus = { sale: "", profit: "" };
const caseFocusSuffix = { nhso: "Nhso", insurance: "Insurance", other: "Other" };
const caseFocusNames = { nhso: "สปสช", insurance: "ประกัน", other: "อื่น ๆ" };

function renderMetrics() {
  updateEmptyState();
  const metrics = calculateMetrics();
  // ประเภทที่โฟกัสไว้ไม่มียอดในช่วงนี้แล้ว (chip จะหายจากการ์ด) — กลับมุมมองรวม กันโฟกัสค้าง
  ["sale", "profit"].forEach((key) => {
    if (caseFocus[key] && Math.abs(toNumeric(metrics[key + caseFocusSuffix[caseFocus[key]]])) < 0.005) caseFocus[key] = "";
  });
  renderMonthlyCases();
  renderMoneyByMonth("saleByMonthBody", (bill) => toNumeric(bill.sale), "ยังไม่มียอดขาย สปสช/ประกัน");
  renderMoneyByMonth("costByMonthBody", (bill) => toNumeric(bill.cost) + toNumeric(bill.mlpCost), "ยังไม่มีต้นทุน สปสช/ประกัน");
  renderMoneyByMonth("profitByMonthBody", (bill) => toNumeric(bill.profit), "ยังไม่มีกำไร สปสช/ประกัน");
  Object.entries(metricIds).forEach(([key, id]) => {
    const el = $(id);
    if (!el) return; // การ์ดถูกเอาออกจากหน้า (เช่น MLP รอใบวางบิล) — ข้ามไป
    // การ์ดที่โฟกัสประเภทเคสอยู่ — เลขใหญ่แสดงเฉพาะประเภทนั้น
    const metricKey = caseFocus[key] ? key + caseFocusSuffix[caseFocus[key]] : key;
    el.textContent = ["sale", "totalCost", "profit"].includes(key) ? money(metrics[metricKey]) : number(metrics[metricKey]);
    const card = el.closest(".metric");
    if (card) {
      card.dataset.summaryCard = key;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `ดูรายละเอียด ${card.querySelector("span")?.textContent || key}`);
      if (card.classList.contains("mini")) card.classList.toggle("is-zero", !toNumeric(metrics[key]));
    }
  });
  // ต่อท้ายเลขใหญ่การ์ดกำไรด้วย (% กำไรต่อยอดขาย 2 ตำแหน่ง) — คิดตามประเภทเคสที่โฟกัสอยู่
  const profitEl = $(metricIds.profit);
  if (profitEl) {
    const focusSuffix = caseFocus.profit ? caseFocusSuffix[caseFocus.profit] : "";
    const saleBase = toNumeric(metrics["sale" + focusSuffix]);
    if (saleBase) profitEl.insertAdjacentHTML("beforeend", ` <small class="profit-pct">(${((toNumeric(metrics["profit" + focusSuffix]) / saleBase) * 100).toFixed(2)}%)</small>`);
  }
  const period = activePeriodLabel();
  // การ์ดกำไร + ยอดขาย: ป้ายช่วงเวลา + chip แยก สปสช/ประกัน/อื่น ๆ ตามช่วงวันที่ที่กรองอยู่
  renderCaseBreakdown(elements.metricProfitPeriod, elements.metricProfitBreakdown, period, metrics.profitNhso, metrics.profitInsurance, metrics.profitOther, "profit");
  renderCaseBreakdown(elements.metricSalePeriod, elements.metricSaleBreakdown, period, metrics.saleNhso, metrics.saleInsurance, metrics.saleOther, "sale");
}

// chip แยกประเภทเคสบนการ์ด — กดเพื่อโฟกัสการ์ดเฉพาะประเภทนั้น (เลขใหญ่ + ตารางรายเดือน) กดซ้ำ = มุมมองรวม
function renderCaseBreakdown(periodEl, breakdownEl, period, nhso, insurance, other, cardKey) {
  const focus = caseFocus[cardKey] || "";
  if (periodEl) periodEl.textContent = [caseFocusNames[focus], period].filter(Boolean).map((part) => `· ${part}`).join(" ");
  if (!breakdownEl) return;
  const parts = [
    { key: "nhso", label: "สปสช", value: nhso, cls: "case-nhso" },
    { key: "insurance", label: "ประกัน", value: insurance, cls: "case-insurance" },
    { key: "other", label: "อื่น ๆ", value: other, cls: "case-other" },
  ].filter((part) => Math.abs(toNumeric(part.value)) >= 0.005);
  breakdownEl.innerHTML = parts
    .map((part) => `<button type="button" class="profit-breakdown-chip ${part.cls}${focus === part.key ? " active" : ""}" data-case-focus="${cardKey}:${part.key}" aria-pressed="${focus === part.key}" title="${focus === part.key ? "กดอีกครั้งเพื่อกลับมุมมองรวม" : `ดูเฉพาะ${part.label} — เลขใหญ่ + ตารางรายเดือน`}"><em>${htmlEscape(part.label)}</em> ${money(part.value)}</button>`)
    .join("");
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

// วันที่เก็บเงินครบแล้ว = วันนั้นมีบิลอย่างน้อย 1 ใบ และ "ทุกใบ" เป็น PAID
// นับบิลที่ Exclude ด้วย (ตกลงกับ user 17 ก.ค. 2026: บิล Exclude ที่ยังไม่ PAID = ยังไม่ครบ)
// → บิลสถานะ "ยกเลิก" ก็บล็อกเช่นกัน เพราะไม่มีวันเป็น PAID
// วันที่มีออเดอร์ใน CLICKNIC แต่ยังไม่มีบิล = ไม่ครบ (Set ว่าง → ไม่เข้าเงื่อนไข)
function paidCompleteDates() {
  const byDate = new Map();
  state.bills.forEach((bill) => {
    const key = dateKey(bill.clicknicDate);
    if (!key) return;
    const entry = byDate.get(key) || { total: 0, paid: 0 };
    entry.total += 1;
    if ((bill.billingStage || "") === "paid") entry.paid += 1;
    byDate.set(key, entry);
  });
  const done = new Set();
  byDate.forEach((entry, key) => {
    if (entry.total > 0 && entry.total === entry.paid) done.add(key);
  });
  return done;
}

// วัน "เอกสารครบ" — ทุกบิลของวันนั้น PAID และลงวันที่ได้รับเงินครบ (เข้มกว่า paidCompleteDates ที่เช็คแค่สถานะ)
// บังคับ paid ด้วยเพื่อให้เซ็ตนี้เป็น subset ของ paidCompleteDates เสมอ (ขอบทองมาคู่พื้นเขียวเสมอ)
function paidDatedCompleteDates() {
  const byDate = new Map();
  state.bills.forEach((bill) => {
    const key = dateKey(bill.clicknicDate);
    if (!key) return;
    const entry = byDate.get(key) || { total: 0, dated: 0 };
    entry.total += 1;
    if ((bill.billingStage || "") === "paid" && clean(bill.paidDate)) entry.dated += 1;
    byDate.set(key, entry);
  });
  const done = new Set();
  byDate.forEach((entry, key) => {
    if (entry.total > 0 && entry.total === entry.dated) done.add(key);
  });
  return done;
}

// สรุปจำนวนออเดอร์รายเดือนจาก buckets รายวัน — คีย์ YYYY-MM เรียงใหม่ → เก่า
function clicknicMonthBuckets(dayBuckets) {
  const months = new Map();
  dayBuckets.forEach((bucket) => {
    const key = bucket.date.slice(0, 7);
    const month = months.get(key) || { month: key, orders: 0 };
    month.orders += bucket.orders.size;
    months.set(key, month);
  });
  return [...months.values()].sort((a, b) => b.month.localeCompare(a.month));
}

function monthChipLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const name = new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString("th-TH", { month: "short", timeZone: "UTC" });
  return `${name} ${year + (yearEra === "be" ? 543 : 0)}`;
}

function monthRangeOf(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate();
  return { from: `${monthKey}-01`, to: `${monthKey}-${String(lastDay).padStart(2, "0")}` };
}

// จำนวนบิลที่ตรงตัวกรอง (ไม่รวมช่วงวันที่) แยกตามวันที่ในโหมด dateField ปัจจุบัน
// คืน null เมื่อไม่มีตัวกรองทำงาน = ชิปโชว์ครบทุกวันแบบเดิม
function filteredDateChipCounts() {
  const query = clean(elements.searchInput.value).toLowerCase();
  const caseType = elements.caseTypeFilter?.value || "all";
  const billingStage = elements.billingStageFilter?.value || "all";
  if (state.activeStatus === "all" && caseType === "all" && billingStage === "all" && !query) return null;
  const counts = new Map();
  state.bills.forEach((bill) => {
    if (!billMatchesNonDateFilters(bill, { status: state.activeStatus, caseType, billingStage, query })) return;
    dateKeysForRange(bill).forEach((key) => counts.set(key, (counts.get(key) || 0) + 1));
  });
  return counts;
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
  // เดือน/ปีที่กำลังกรอง: ช่วงจาก-ถึงตกอยู่ในเดือน/ปีเดียวกัน (เลือกทั้งเดือนหรือเจาะรายวันก็นับ)
  const activeYear = activeFrom && activeTo && activeFrom.slice(0, 4) === activeTo.slice(0, 4) ? activeFrom.slice(0, 4) : "";
  const activeMonth = activeFrom && activeTo && activeFrom.slice(0, 7) === activeTo.slice(0, 7) ? activeFrom.slice(0, 7) : "";
  let allMonths = clicknicMonthBuckets(buckets);

  // ตัวกรองอื่นทำงานอยู่ (เช่นประเภทเคส ประกัน) → ซ่อนวัน/เดือน/ปีที่กดแล้วจะว่างเปล่า
  // และเปลี่ยนตัวเลขในชิปเป็นจำนวนบิลที่ตรงตัวกรอง (แทนจำนวนออเดอร์ CLICKNIC ทั้งหมด)
  const activeCounts = filteredDateChipCounts();
  if (activeCounts) {
    const monthCounts = new Map();
    activeCounts.forEach((count, date) => {
      const monthKey = date.slice(0, 7);
      monthCounts.set(monthKey, (monthCounts.get(monthKey) || 0) + count);
    });
    allMonths = allMonths.filter((item) => monthCounts.has(item.month))
      .map((item) => ({ ...item, orders: monthCounts.get(item.month) }));
  }
  const years = [...new Set(allMonths.map((item) => item.month.slice(0, 4)))];

  // แถวปี: โชว์เฉพาะเมื่อข้อมูลคร่อมหลายปี
  const yearRow = years.length > 1 ? `
    <div class="date-chip-row">
      <button class="date-chip year-chip ${!activeFrom && !activeTo ? "active" : ""}" type="button" data-clicknic-year="all">ทุกปี</button>
      ${years.map((year) => `
        <button class="date-chip year-chip ${activeYear === year ? "active" : ""}" type="button" data-clicknic-year="${year}">
          ${Number(year) + (yearEra === "be" ? 543 : 0)}
        </button>
      `).join("")}
    </div>` : "";

  // แถวเดือน: เลือกปีแล้วเหลือเฉพาะเดือนของปีนั้น (โชว์เมื่อมีมากกว่า 1 เดือน)
  const months = activeYear ? allMonths.filter((item) => item.month.startsWith(activeYear)) : allMonths;
  const monthRow = allMonths.length > 1 ? `
    <div class="date-chip-row">
      <button class="date-chip month-chip ${!activeFrom && !activeTo ? "active" : ""}" type="button" data-clicknic-month="all">ทุกเดือน</button>
      ${months.map((item) => `
        <button class="date-chip month-chip ${activeMonth === item.month ? "active" : ""}" type="button" data-clicknic-month="${item.month}">
          ${monthChipLabel(item.month)} <span>(${number(item.orders)})</span>
        </button>
      `).join("")}
    </div>` : "";

  // แถววัน: เลือกเดือน/ปีแล้วเหลือเฉพาะวันในช่วงนั้น; ตัวกรองอื่นทำงาน = ตัดวันที่ไม่มีบิลตรงตัวกรอง
  const days = buckets.filter((bucket) => {
    if (activeCounts && !activeCounts.has(bucket.date)) return false;
    if (activeMonth) return bucket.date.startsWith(activeMonth);
    if (activeYear) return bucket.date.startsWith(activeYear);
    return true;
  });
  const paidDone = paidCompleteDates();
  const datedDone = paidDatedCompleteDates();
  const dayRow = `
    <div class="date-chip-row">
      <button class="date-chip ${!activeFrom && !activeTo ? "active" : ""}" type="button" data-clicknic-date="all">ทุกวัน CLICKNIC</button>
      ${days.map((bucket) => {
        const done = paidDone.has(bucket.date);
        const dated = datedDone.has(bucket.date);
        const chipTitle = dated ? "เก็บเงินครบ + ลงวันรับเงินครบทุกใบ"
          : done ? "PAID ทุกใบแล้ว แต่ยังลงวันที่ได้รับเงินไม่ครบ"
          : "";
        return `
        <button class="date-chip ${done ? "paid-complete" : ""} ${dated ? "dates-complete" : ""} ${activeFrom === bucket.date && activeTo === bucket.date ? "active" : ""}" type="button" data-clicknic-date="${bucket.date}"${chipTitle ? ` title="${chipTitle}"` : ""}>
          ${formatDisplayDate(bucket.date)} <span>(${number(activeCounts ? activeCounts.get(bucket.date) : bucket.orders.size)})</span>
        </button>
      `;
      }).join("")}
    </div>`;

  elements.quickDateFilters.innerHTML = yearRow + monthRow + dayRow;
}

// แถบ "ยังไม่ครบ" — โชว์เฉพาะกลุ่มที่ยัง match ไม่ครบ (กด chip = กรองไปที่กลุ่มนั้น) นับตามช่วงวันที่ที่กรอง
// แถบ "ต้องจัดการ" รวมทุก chip เตือนไว้จุดเดียว ต่อท้ายแถวแท็บ — กด chip = กรองตาราง (WARN เปิด popup)
function renderMergeAssistant() {
  if (!elements.mergeAssistant) return;
  const counts = statusCounts();
  const metrics = calculateMetrics();
  const bs = elements.billingStageFilter?.value || "all";
  const ct = elements.caseTypeFilter?.value || "all";
  const chipHtml = (chip) => {
    const attr = chip.status ? `data-gap-status="${htmlEscape(chip.status)}"`
      : chip.billingStage ? `data-gap-billing="${htmlEscape(chip.billingStage)}"`
        : chip.caseType ? `data-gap-case="${htmlEscape(chip.caseType)}"` : "";
    return `<button type="button" class="gap-chip ${chip.tone}${chip.active ? " active" : ""}" ${attr} title="กดเพื่อกรองดูเฉพาะกลุ่มนี้">${htmlEscape(chip.label)} <strong>${number(chip.value)}</strong></button>`;
  };
  // กลุ่ม 1: จับคู่ 3 ฝั่ง (กรองด้วยสถานะ)
  // รอใบวางบิล: เกณฑ์เดียวกับแท็บ (ดู isPendingBillingOpen) — ให้ตรงกับ filteredBills
  const pendingBillingDedup = state.bills.filter(isWithinDateRange).filter(isPendingBillingOpen).length;
  // รายการยาไม่มี MLP: ไม่นับ สปสช ที่วางบิลครบ (BAR+AR) — reconcile แล้ว (ให้ตรงกับ filteredBills)
  const clicknicOnlyIssues = state.bills.filter(isWithinDateRange)
    .filter((b) => b.status === "clicknic-only" && !isReconciledClicknicOnly(b)).length;
  const matchGroup = [
    { status: "mlp-only", label: "ไม่พบรายการยา", value: counts["mlp-only"] || 0, tone: "warning", active: state.activeStatus === "mlp-only" },
    { status: "clicknic-only", label: "รายการยาไม่มี MLP", value: clicknicOnlyIssues, tone: "danger", active: state.activeStatus === "clicknic-only" },
    { status: "billing-only", label: "ใบวางบิลไม่เจอ MLP", value: counts["billing-only"] || 0, tone: "danger", active: state.activeStatus === "billing-only" },
    { status: "pending-billing", label: "รอใบวางบิล", value: pendingBillingDedup, tone: "warning", active: state.activeStatus === "pending-billing" },
  ].filter((chip) => chip.value > 0);
  // กลุ่ม 2: งานวางบิลค้าง (กรองด้วยงานวางบิล)
  const billingGroup = [
    { billingStage: "insurance-review", label: "ประกันรอเอกสาร", value: metrics.billingInsurancePending || 0, tone: "warning", active: bs === "insurance-review" },
    { billingStage: "nhso-pending", label: "สปสชรอวางบิล", value: metrics.billingNhsoPending || 0, tone: "warning", active: bs === "nhso-pending" },
    { billingStage: "pending-review", label: "รอตรวจสอบวางบิล", value: metrics.billingReviewPending || 0, tone: "warning", active: bs === "pending-review" },
  ].filter((chip) => chip.value > 0);
  // กลุ่ม 3: ประเภทเคส (กรองด้วยประเภทเคส)
  const caseGroup = [
    { caseType: "unknown", label: "ยังไม่ทราบประเภท", value: metrics.caseUnknown || 0, tone: "warning", active: ct === "unknown" },
  ].filter((chip) => chip.value > 0);
  // กลุ่ม 4: WARN (เปิด popup)
  const warnCount = warnTotalCount();
  const warnHtml = warnCount > 0
    ? `<button type="button" class="gap-chip warning gap-warn" data-gap-warn="1" title="คู่บิลที่น่าจะซ้ำ + สปสชต้นทุนผิด — กดดูรายละเอียด"><i class="fa-solid fa-triangle-exclamation"></i> WARN <strong>${number(warnCount)}</strong></button>`
    : "";
  // กลุ่ม 5: ลูกค้ามาหลายครั้ง — ข้อมูลดูแลลูกค้าประจำ ไม่ใช่งานค้าง (โทนม่วง) กด = กรองดูบิลของกลุ่มนี้
  const repeatCount = repeatCustomerCount();
  const repeatHtml = repeatCount > 0
    ? `<button type="button" class="gap-chip repeat${state.activeStatus === "repeat-customers" ? " active" : ""}" data-gap-status="repeat-customers" title="ลูกค้า ${number(repeatCount)} คนมารับบริการหลายครั้ง (นับคนละวัน ข้ามเดือนได้) — กดกรองดูบิลทั้งหมดของกลุ่มนี้"><i class="fa-solid fa-repeat"></i> มาหลายครั้ง <strong>${number(repeatCount)}</strong></button>`
    : "";
  const groups = [
    matchGroup.map(chipHtml).join(""),
    billingGroup.map(chipHtml).join(""),
    caseGroup.map(chipHtml).join(""),
    warnHtml,
    repeatHtml,
  ].filter(Boolean);
  elements.mergeAssistant.innerHTML = groups.length
    ? groups.join('<span class="gap-divider" aria-hidden="true"></span>')
    : '<span class="gap-all-clear" title="ไม่มีงานค้าง"><i class="fa-solid fa-circle-check"></i> ครบทุกอย่าง</span>';
}

// กด chip ในแถบต้องจัดการ — ตั้งตัวกรองมิติเดียว (รีเซ็ตมิติอื่น) กดซ้ำ = ยกเลิก
function applyGapFilter({ status, billingStage, caseType }) {
  const isSame = (status && state.activeStatus === status && (elements.billingStageFilter?.value || "all") === "all" && (elements.caseTypeFilter?.value || "all") === "all")
    || (billingStage && elements.billingStageFilter?.value === billingStage)
    || (caseType && elements.caseTypeFilter?.value === caseType);
  state.activeStatus = "all";
  if (elements.billingStageFilter) elements.billingStageFilter.value = "all";
  if (elements.caseTypeFilter) elements.caseTypeFilter.value = "all";
  if (!isSame) {
    if (status) state.activeStatus = status;
    if (billingStage && elements.billingStageFilter) elements.billingStageFilter.value = billingStage;
    if (caseType && elements.caseTypeFilter) elements.caseTypeFilter.value = caseType;
  }
  renderTabs();
  renderTable(); // renderTable → renderMergeSuggestions → renderMergeAssistant (อัปเดต active)
}

// เจาะดูบิลรายช่องจากตารางย่อยในการ์ด KPI (เดือน × สปสช/ประกัน) — ตั้ง state.monthDrill ก่อนเปิด openCardDetail("monthDrill")
const monthDrillMetrics = {
  cases: { label: "เคส", revenueOnly: false },
  sale: { label: "ยอดขาย", revenueOnly: true },
  cost: { label: "ต้นทุน", revenueOnly: true },
  profit: { label: "กำไร", revenueOnly: true },
};

function monthDrillRows() {
  const drill = state.monthDrill || {};
  const metric = monthDrillMetrics[drill.metric] || monthDrillMetrics.cases;
  // เงื่อนไขเดียวกับตัวเลขในการ์ด: เฉพาะประเภทเคส + เดือนนั้น (การ์ดเงินนับเฉพาะบิลรายได้จริง)
  // "other" = ทุกประเภทที่ไม่ใช่ สปสช/ประกัน (จากคอลัมน์โฟกัส อื่น ๆ)
  return activeBills().filter((bill) => (drill.caseType === "other" ? !caseSeqNames[bill.caseType] : bill.caseType === drill.caseType)
    && (primaryBillDate(bill) || "").slice(0, 7) === drill.month
    && (!metric.revenueOnly || countsInRevenue(bill)));
}

function openMonthDrill(metric, caseType, month) {
  state.monthDrill = { metric, caseType, month };
  state.currentCardKey = ""; // มองเป็นการ์ดใหม่เสมอ — ล้าง quick filter/การเลือกของ popup ก่อนเปิด
  openCardDetail("monthDrill");
}

// เลข BAR ที่กำลังเปิดดูอยู่ใน Card Detail (ตั้งตอนกดบรรทัดใต้ช่อง BAR ในโมดัลบิล)
let barBillsFocus = "";

const cardDetailConfigs = {
  barBills: {
    get title() { return `บิลในใบวางบิล ${barBillsFocus}`; },
    // ยึด activeBills() ไม่ผูกตัวกรองวันที่ — ให้ตรงกับตัวเลขที่โชว์ใต้ช่อง BAR เป๊ะ
    rows: () => activeBills().filter((bill) => clean(bill.barNo).split(",").map(clean)
      .some((bar) => bar.toUpperCase() === barBillsFocus)),
    // ไม่มี apply: ตัวกรองตารางใหญ่ไม่มีมิติ BAR → ปุ่ม "กรองตารางตามนี้" ซ่อนเอง
  },
  monthDrill: {
    get title() {
      const drill = state.monthDrill || {};
      const metricLabel = monthDrillMetrics[drill.metric]?.label || "";
      return `${metricLabel} ${caseFocusNames[drill.caseType] || ""} · ${drill.month ? monthChipLabel(drill.month) : ""}`.trim();
    },
    rows: monthDrillRows,
    // "other" ไม่มีค่าใน dropdown ประเภทเคส — ใช้ตัวกรองนี้จะได้เฉพาะเดือน (ประเภทเป็นทุกประเภท)
    apply: () => ({ caseType: caseSeqNames[state.monthDrill?.caseType] ? state.monthDrill.caseType : "", month: state.monthDrill?.month }),
  },
  clickOrders: {
    title: "บิล CLICKNIC",
    rows: () => dateFilteredBills().filter((bill) => bill.orderId && bill.status !== "billing-only"),
    apply: () => ({ status: "all" }),
  },
  matched: {
    title: "ครบ CKNC+MLP+BAR",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "matched"),
    apply: () => ({ status: "matched" }),
  },
  mlpOnly: {
    title: "ไม่พบรายการยา",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "mlp-only"),
    apply: () => ({ status: "mlp-only" }),
  },
  mlpNoBilling: {
    title: "MLP รอใบวางบิล",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "pending-billing"),
    apply: () => ({ status: "pending-billing" }),
  },
  clickOnly: {
    title: "รายการยาไม่มี MLP",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "clicknic-only"),
    apply: () => ({ status: "clicknic-only" }),
  },
  billingRows: {
    title: "มีข้อมูลใบวางบิล",
    rows: () => dateFilteredBills().filter((bill) => bill.billingNo || toNumeric(bill.billedAmount) > 0),
  },
  billingOnly: {
    title: "ใบวางบิลไม่เจอ MLP",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "billing-only"),
    apply: () => ({ status: "billing-only" }),
  },
  caseInsurance: {
    title: "เคสประกัน",
    rows: () => dateFilteredBills().filter((bill) => bill.caseType === "insurance"),
    apply: () => ({ caseType: "insurance" }),
  },
  caseNhso: {
    title: "เคส สปสช",
    rows: () => dateFilteredBills().filter((bill) => bill.caseType === "nhso"),
    apply: () => ({ caseType: "nhso" }),
  },
  caseUnknown: {
    title: "ยังไม่ทราบประเภท",
    rows: () => dateFilteredBills().filter((bill) => !bill.caseType || bill.caseType === "unknown"),
    apply: () => ({ caseType: "unknown" }),
  },
  billingInsurancePending: {
    title: "ประกันรอเอกสาร",
    rows: () => dateFilteredBills().filter((bill) => bill.billingStage === "insurance-review"),
    apply: () => ({ billingStage: "insurance-review" }),
  },
  billingNhsoPending: {
    title: "สปสชรอวางบิล",
    rows: () => dateFilteredBills().filter((bill) => bill.billingStage === "nhso-pending"),
    apply: () => ({ billingStage: "nhso-pending" }),
  },
  billingReviewPending: {
    title: "รอตรวจสอบวางบิล",
    rows: () => dateFilteredBills().filter((bill) => bill.billingStage === "pending-review"),
    apply: () => ({ billingStage: "pending-review" }),
  },
  sale: {
    title: "ยอดขายยา",
    rows: () => dateFilteredBills().filter((bill) => toNumeric(bill.sale) > 0).sort((a, b) => b.sale - a.sale),
  },
  totalCost: {
    title: "ต้นทุน",
    rows: () => dateFilteredBills()
      .filter((bill) => toNumeric(bill.cost) + toNumeric(bill.mlpCost) > 0)
      .sort((a, b) => (toNumeric(b.cost) + toNumeric(b.mlpCost)) - (toNumeric(a.cost) + toNumeric(a.mlpCost))),
  },
  profit: {
    title: "กำไร matched หลัง MLP",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "matched" || bill.status === "pending-billing").sort((a, b) => a.profit - b.profit),
  },
  mergeClicknicBase: {
    title: "Merge: CLICKNIC base",
    rows: () => dateFilteredBills().filter((bill) => bill.orderId && bill.status !== "billing-only"),
  },
  mergeMlpMemo: {
    title: "Merge: MLP by memo",
    rows: () => dateFilteredBills().filter((bill) => bill.orderId && bill.status !== "clicknic-only" && bill.status !== "billing-only"),
  },
  mergeBillingRef: {
    title: "Merge: Billing by ORW/INV/AR",
    rows: () => dateFilteredBills().filter((bill) => clean(bill.billingRefs)),
  },
  mergeNeedsMlp: {
    title: "Merge: ยังไม่มี MLP",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "clicknic-only"),
    apply: () => ({ status: "clicknic-only" }),
  },
  mergeNeedsBilling: {
    title: "Merge: รอวางบิล",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "pending-billing"),
    apply: () => ({ status: "pending-billing" }),
  },
  mergeBillingOnly: {
    title: "Merge: Billing ไม่เจอ MLP",
    rows: () => dateFilteredBills().filter((bill) => bill.status === "billing-only"),
    apply: () => ({ status: "billing-only" }),
  },
};

function summarizeCardRows(rows) {
  return [
    `${number(rows.length)} บิล`,
    `ยอดขาย ${money(rows.reduce((sum, bill) => sum + toNumeric(bill.sale), 0))}`,
    `ต้นทุน ${money(rows.reduce((sum, bill) => sum + toNumeric(bill.cost) + toNumeric(bill.mlpCost), 0))}`,
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

// บิลที่ติ๊กเลือกในหน้า Card Detail สำหรับแก้แบบ bulk ในตัว (แยกจาก state.selectedBillKeys ของตารางหลัก)
const cardBulkSelected = new Set();

// ปุ่ม one-click กรองดูข้อมูลในหน้า Card Detail (ไม่มีแท็บเหมือนตารางหลัก)
let cardQuickFilter = "all";
// แบ่งหน้าในตาราง Card Detail — รีเซ็ตเมื่อเปลี่ยนการ์ด/ตัวกรองด่วน
const CARD_DETAIL_PAGE_SIZE = 50;
let cardDetailPage = 1;
const cardQuickFilterDefs = [
  { key: "all", label: "ทั้งหมด", test: () => true },
  { key: "paid-nobar", label: "PAID woBAR", test: (bill) => (bill.billingStage === "paid" || bill.billingStage === "billed") && !clean(bill.barNo) },
  { key: "insurance", label: "ประกัน", test: (bill) => bill.caseType === "insurance" },
  { key: "nhso", label: "สปสช", test: (bill) => bill.caseType === "nhso" },
];

// validation ที่แค่ทวนสถานะเดิม (สถานะ → โค้ด issue ที่ยิงจากสถานะนั้นตรง ๆ)
const STATUS_ECHO_ISSUE = {
  "mlp-only": "MLP_NO_MEDICINE",
  "pending-billing": "PENDING_BILLING",
  "billing-only": "BILLING_NOT_IN_MLP",
  "clicknic-only": "CLICKNIC_NOT_IN_MLP",
};

// คอลัมน์ "ตรวจสอบ" ในการ์ด popup ตัด issue ที่แค่ทวนสถานะออก — chip สถานะบอกอยู่แล้ว ไม่ต้องซ้ำ
function cardBaseIssues(bill) {
  const echo = STATUS_ECHO_ISSUE[bill.status];
  return (bill.validationIssues || []).filter((issue) => issue.code !== echo);
}

// ลายเซ็น issue = code + ข้อความเต็ม — ยุบขึ้นหัวการ์ดได้เฉพาะตัวที่ "เหมือนกันจริง" ทุกแถว
// (ถ้าเทียบแค่ code ตัวที่พกข้อมูลรายบิล เช่น DMM วันที่ / BCM ส่วนต่าง จะถูกยุบแล้วเหลือค่าของแถวแรกแถวเดียว = ข้อมูลผิด)
function issueSignature(issue) {
  return `${issue.code || ""}\u0000${issue.text || ""}`;
}

// issue ที่ทุกแถวในหน้าเดียวกันติดเหมือนกันเป๊ะ — ยกขึ้นไปโชว์บนหัวการ์ดแทนการซ้ำทุกแถว
let cardCommonIssueSigs = new Set();

// จำนวน chip สูงสุดต่อแถว ที่เกินยุบเป็นปุ่ม +N
const CARD_ISSUE_CHIP_LIMIT = 2;

function commonIssueSigsOf(rows) {
  if (rows.length < 2) return new Set();
  const sigs = new Set(cardBaseIssues(rows[0]).map(issueSignature));
  for (const bill of rows.slice(1)) {
    if (!sigs.size) break;
    const own = new Set(cardBaseIssues(bill).map(issueSignature));
    sigs.forEach((sig) => { if (!own.has(sig)) sigs.delete(sig); });
  }
  return sigs;
}

function cardIssuesForBill(bill) {
  return sortIssuesBySeverity(cardBaseIssues(bill).filter((issue) => !cardCommonIssueSigs.has(issueSignature(issue))));
}

// chip "ทุกแถวติดเหมือนกัน" บนหัวการ์ด — เอาตัวจริงจากแถวแรกมาใช้ได้ เพราะเงื่อนไขคือ text ตรงกันทุกแถวอยู่แล้ว
function commonIssueChipsHtml(rows) {
  if (!cardCommonIssueSigs.size || !rows.length) return "";
  const issues = sortIssuesBySeverity(cardBaseIssues(rows[0]).filter((issue) => cardCommonIssueSigs.has(issueSignature(issue))));
  if (!issues.length) return "";
  return `<span class="chip-note">ทุกแถวติดเหมือนกัน:</span>${issues.map((issue) => issueChipHtml(issue, { count: rows.length })).join("")}`;
}

const cardDetailColumns = [
  {
    label: "จัดการ",
    col: "col-action",
    cellClass: "card-action-cell",
    headHtml: () => `<input type="checkbox" id="cardSelectAll" aria-label="เลือกทั้งหมด" title="เลือกทั้งหมด" />`,
    html: (bill) => `<span class="card-action-wrap"><input type="checkbox" class="card-row-pick" data-card-pick="${htmlEscape(bill.billKey)}" ${cardBulkSelected.has(bill.billKey) ? "checked" : ""} aria-label="เลือกบิลนี้" /><button class="row-action" type="button" data-card-edit-key="${htmlEscape(bill.billKey)}" title="แก้ไข" aria-label="แก้ไข">✎</button></span>`,
  },
  {
    label: "บิล / ORW",
    col: "col-ref",
    html: (bill) => {
      const orw = clean(bill.orw);
      const order = clean(bill.orderId);
      const main = orw || order || "-";
      const sub = orw && order ? order : "";
      const copyBtn = main !== "-"
        ? ` <button class="copy-ref-btn" type="button" data-copy-text="${htmlEscape(clean(main.split(",")[0]))}" title="คัดลอก" aria-label="คัดลอก"><i class="fa-regular fa-copy"></i></button>`
        : "";
      const seqChip = caseSeqChipHtml(bill);
      const subCopyBtn = sub
        ? ` <button class="copy-ref-btn" type="button" data-copy-text="${htmlEscape(sub)}" title="คัดลอกเลขที่ออเดอร์" aria-label="คัดลอกเลขที่ออเดอร์"><i class="fa-regular fa-copy"></i></button>`
        : "";
      return `<span class="ref-main">${htmlEscape(main)}${copyBtn}</span>${sub ? `<span class="ref-sub">${htmlEscape(sub)}${subCopyBtn}</span>` : ""}${seqChip ? `<span class="ref-sub">${seqChip}</span>` : ""}`;
    },
  },
  { label: "ผู้รับบริการ", col: "col-patient", hideable: true, text: (bill) => bill.patient || "-" },
  {
    label: "ประเภทเคส",
    col: "col-case",
    hideable: true,
    text: (bill) => caseTypeLabel(bill.caseType),
    // เปลี่ยนประเภทเคสได้จากในการ์ดเลย ไม่ต้องเข้าหน้าแก้ไข
    html: (bill) => `<select class="case-type-select ${htmlEscape(bill.caseType || "unknown")}" data-card-case-key="${htmlEscape(bill.billKey)}" aria-label="ประเภทเคส">${caseTypeOptions.map(([key, label]) => `<option value="${key}" ${key === (bill.caseType || "unknown") ? "selected" : ""}>${label}</option>`).join("")}</select>`,
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
  { label: "ต้นทุน", col: "col-num", num: true, text: (bill) => money(toNumeric(bill.cost) + toNumeric(bill.mlpCost)) },
  {
    label: "กำไร",
    col: "col-num",
    num: true,
    text: (bill) => money(bill.profit),
    html: (bill) => `<span class="${toNumeric(bill.profit) < 0 ? "profit-negative-text" : ""}">${money(bill.profit)}</span>`,
  },
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
    hideChipIfEmpty: true,
    text: (bill) => cardIssuesForBill(bill).map(issueChipShortText).join(", ") || "-",
    html: (bill) => {
      const issues = cardIssuesForBill(bill);
      if (!issues.length) return "-";
      const shown = issues.slice(0, CARD_ISSUE_CHIP_LIMIT);
      const extra = issues.slice(CARD_ISSUE_CHIP_LIMIT);
      // chip ส่วนเกินใส่ไว้ใน DOM เลย (ซ่อนด้วย css) — กด +N แล้วกางได้โดยไม่ต้อง re-render ทั้งตาราง
      const moreBtn = extra.length
        ? `<button type="button" class="issue-chip tone-gray issue-more" data-issue-more title="${htmlEscape(extra.map(issueChipShortText).join(" · "))}">+${extra.length}</button>`
        : "";
      const chips = [...shown.map((issue) => issueChipHtml(issue)), ...extra.map((issue) => issueChipHtml(issue, { extra: true }))].join("");
      return `<div class="issue-chip-list">${chips}${moreBtn}</div>`;
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
  const rowClass = `${(bill.billingStage || "") === "paid" ? "row-paid" : ""}${bill.excluded ? " row-excluded" : ""}`.trim();
  return `<tr${rowClass ? ` class="${rowClass}"` : ""}>${cells.join("")}</tr>`;
}

function applyCardFilter(config) {
  if (!config?.apply) return;
  const filter = config.apply();
  state.activeStatus = filter.status || "all";
  elements.caseTypeFilter.value = filter.caseType || "all";
  elements.billingStageFilter.value = filter.billingStage || "all";
  elements.searchInput.value = "";
  // drill รายเดือน: ตั้งช่วงวันที่ทั้งจอเป็นเดือนนั้นด้วย (วันบิลหลัก ให้ตรงกับการนับในการ์ด)
  if (filter.month) {
    const range = monthRangeOf(filter.month);
    elements.dateField.value = "primary";
    elements.dateFrom.value = range.from;
    elements.dateTo.value = range.to;
    elements.targetDate.value = "";
    renderMetrics();
    renderQuickDateFilters();
  }
  renderTabs();
  renderTable();
  closeCardDetail();
}

function openCardDetail(cardKey) {
  const config = cardDetailConfigs[cardKey];
  if (!config || !elements.cardDetailModal) return;
  const cardChanged = state.currentCardKey !== cardKey;
  state.currentCardKey = cardKey;
  if (cardChanged) {
    cardBulkSelected.clear();
    cardQuickFilter = "all"; // เปลี่ยนการ์ด = รีเซ็ตตัวกรองด่วน
    cardDetailPage = 1;
  }
  const allRows = config.rows();
  // ตัดคีย์ที่เลือกไว้แต่ไม่อยู่ในกลุ่มนี้แล้ว (เช่นเปลี่ยนประเภทเคสแล้วบิลหลุดออกจากการ์ด) — ยึดชุดเต็มของการ์ด
  const rowKeys = new Set(allRows.map((bill) => bill.billKey));
  [...cardBulkSelected].forEach((key) => { if (!rowKeys.has(key)) cardBulkSelected.delete(key); });
  // ตัวกรองด่วน (one-click) กรองเฉพาะที่แสดง — การเลือก bulk ยังยึดชุดเต็ม
  const quickDef = cardQuickFilterDefs.find((def) => def.key === cardQuickFilter) || cardQuickFilterDefs[0];
  const rows = allRows.filter(quickDef.test);
  // แบ่งหน้า สูงสุด 50 แถว/หน้า — clamp เผื่อจำนวนแถวลดลงหลังแก้ข้อมูล/เปลี่ยนตัวกรอง
  const totalPages = Math.max(1, Math.ceil(rows.length / CARD_DETAIL_PAGE_SIZE));
  cardDetailPage = Math.min(Math.max(1, cardDetailPage), totalPages);
  const shownRows = rows.slice((cardDetailPage - 1) * CARD_DETAIL_PAGE_SIZE, cardDetailPage * CARD_DETAIL_PAGE_SIZE);
  // ต้องคำนวณก่อน visibleCardColumns เสมอ — cardIssuesForBill() ที่ใช้ตัดสินว่าคอลัมน์ซ้ำไหม อ่านค่านี้
  cardCommonIssueSigs = commonIssueSigsOf(shownRows);
  const { columns, chips } = visibleCardColumns(shownRows);
  elements.cardDetailTitle.textContent = config.title;
  const filterNote = cardQuickFilter !== "all" ? ` · กรอง: ${quickDef.label}` : "";
  const pageNote = totalPages > 1 ? ` | หน้า ${number(cardDetailPage)}/${number(totalPages)}` : "";
  elements.cardDetailSummary.textContent = `${activePeriodLabel() ? `${activePeriodLabel()} | ` : ""}${summarizeCardRows(rows)}${pageNote}${filterNote}`;
  renderCardPager(rows.length, totalPages);
  renderCardQuickFilters();
  elements.cardDetailHeadRow.innerHTML = columns
    .map((column) => `<th class="${cardColumnClass(column, false)}">${column.headHtml ? column.headHtml() : htmlEscape(column.label)}</th>`)
    .join("");
  const sameValueHtml = chips.length
    ? `<span class="chip-note">ค่าเดียวกันทั้งการ์ด:</span>${chips.map((chip) => `<span class="chip ${htmlEscape(chip.className)}">${htmlEscape(chip.text)}</span>`).join("")}`
    : "";
  const commonIssueHtml = commonIssueChipsHtml(shownRows);
  elements.cardDetailChips.hidden = !sameValueHtml && !commonIssueHtml;
  elements.cardDetailChips.innerHTML = `${sameValueHtml}${commonIssueHtml}`;
  elements.cardDetailBody.innerHTML = shownRows.length
    ? shownRows.map((bill) => cardDetailRowHtml(bill, columns)).join("")
    : `<tr><td colspan="${columns.length}" class="empty">ไม่มีข้อมูลในกลุ่มนี้</td></tr>`;
  elements.cardDetailFilterBtn.hidden = !config.apply;
  elements.cardDetailFilterBtn.onclick = () => applyCardFilter(config);
  renderCardBulkBar();
  if (!elements.cardDetailModal.open) elements.cardDetailModal.showModal();
}

// แถบแบ่งหน้าใต้ตาราง Card Detail — โผล่เมื่อข้อมูลเกิน 1 หน้า
function renderCardPager(totalRows, totalPages) {
  const pager = $("cardDetailPager");
  if (!pager) return;
  pager.hidden = totalPages <= 1;
  if (pager.hidden) return;
  const info = $("cardPageInfo");
  if (info) {
    const from = (cardDetailPage - 1) * CARD_DETAIL_PAGE_SIZE + 1;
    const to = Math.min(cardDetailPage * CARD_DETAIL_PAGE_SIZE, totalRows);
    info.textContent = `${number(from)}–${number(to)} จาก ${number(totalRows)} บิล · หน้า ${number(cardDetailPage)}/${number(totalPages)}`;
  }
  pager.querySelector('[data-card-page="prev"]').disabled = cardDetailPage <= 1;
  pager.querySelector('[data-card-page="next"]').disabled = cardDetailPage >= totalPages;
}

// ปุ่ม one-click กรองดูข้อมูลในหน้า Card Detail
function renderCardQuickFilters() {
  if (!elements.cardQuickFilters) return;
  elements.cardQuickFilters.innerHTML = cardQuickFilterDefs
    .map((def) => `<button type="button" class="card-quick-chip${cardQuickFilter === def.key ? " active" : ""}" data-card-quick="${def.key}">${htmlEscape(def.label)}</button>`)
    .join("");
}

// แถบแก้ bulk ในหน้า Card Detail — โผล่เมื่อมีบิลติ๊กเลือก
function renderCardBulkBar() {
  if (!elements.cardDetailBulkBar) return;
  const count = cardBulkSelected.size;
  elements.cardDetailBulkBar.hidden = count === 0;
  if (elements.cardBulkCount) elements.cardBulkCount.textContent = `เลือก ${number(count)} บิล`;
  applyBulkExcludeVisibility(cardBulkSelected, elements.cardBulkExclude, elements.cardBulkInclude);
  // sync select-all ตามสถานะแถวที่แสดง
  const picks = elements.cardDetailBody?.querySelectorAll(".card-row-pick") || [];
  const selectAll = elements.cardDetailBody?.closest(".modal-card")?.querySelector("#cardSelectAll") || document.getElementById("cardSelectAll");
  if (selectAll && picks.length) {
    selectAll.checked = [...picks].every((pick) => pick.checked);
  }
}

// แก้ bulk จากหน้า Card Detail: apply ผ่าน applyBulkOverride (key set ของ Card Detail) แล้ว refresh
function applyCardBulk(makeValues, noteLabel) {
  if (!cardBulkSelected.size) return;
  applyBulkOverride(makeValues, noteLabel, new Set(cardBulkSelected));
  refreshCardDetail();
}

function refreshCardDetail() {
  if (elements.cardDetailModal?.open && state.currentCardKey) openCardDetail(state.currentCardKey);
}

function closeCardDetail() {
  elements.cardDetailModal?.close();
  state.currentCardKey = "";
  cardBulkSelected.clear();
}

function statusCounts() {
  return state.bills.filter(isWithinDateRange).reduce((counts, bill) => {
    counts.all += 1;
    counts[bill.status] = (counts[bill.status] || 0) + 1;
    // สปสช clicknic-only ที่วางบิลครบ (BAR+AR) = reconcile แล้ว → นับเป็น "จับคู่แล้ว" ด้วย
    if (isReconciledClicknicOnly(bill)) counts.matched += 1;
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
    const status = button.dataset.statusTab;
    button.classList.toggle("active", status === state.activeStatus);
    // แท็บค่า 0 ซ่อนอัตโนมัติ — คง "ทั้งหมด" และแท็บที่เปิดอยู่ไว้เสมอ (สลับออกได้ ไม่หายคามือ)
    button.hidden = status !== "all" && status !== state.activeStatus && !(counts[status] || 0);
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
    ${bill.caseTypeSource === "manual" ? '<span class="case-source">แก้มือ</span>'
      : bill.caseTypeSource === "manual-paste" ? '<span class="case-source">แก้มือ·paste</span>'
        : ""}
    ${priceHintHtml(bill)}
  `;
}

// งานวางบิลที่แค่ทวนสถานะ (ระบบเดาให้ ไม่ได้แก้มือ) — ไม่ต้องโชว์ dropdown ซ้ำกับ dropdown สถานะ
// billing-only → "ใบวางบิลไม่เจอ MLP" (ซ้ำเป๊ะ) · clicknic-only → "ยังไม่มี MLP" (ทวนความหมายเดียวกัน)
function billingStageEchoesStatus(bill) {
  if ((bill.billingStageSource || "") === "manual") return false;
  return (bill.status === "billing-only" && bill.billingStage === "billing-only")
    || (bill.status === "clicknic-only" && bill.billingStage === "no-mlp");
}

function renderBillingStageSelect(bill) {
  const value = bill.billingStage || "pending-review";
  return `
    <span class="billing-stage-row">
      <select class="billing-stage-select ${value}" data-billing-stage-key="${htmlEscape(bill.billKey)}" aria-label="สถานะงานวางบิล">
        ${billingStageOptions.map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}
      </select>
      ${value === "paid"
        ? `<button type="button" class="paid-date-chip${bill.paidDate ? "" : " empty"}" data-paid-date-edit="${htmlEscape(bill.billKey)}" title="วันที่ได้รับเงิน · คลิกเพื่อแก้"><i class="fa-solid fa-hand-holding-dollar"></i> ${bill.paidDate ? htmlEscape(formatDisplayDate(bill.paidDate)) : "ใส่วันรับเงิน"}</button>`
        : `<button type="button" class="quick-paid-btn" data-quick-paid="${htmlEscape(bill.billKey)}" title="ตั้งเป็น PAID + กรอกวันที่ได้รับเงิน" aria-label="ตั้งเป็น PAID">✓ PAID</button>`}
    </span>
    ${bill.billingStageSource === "manual" ? '<span class="case-source">แก้มือ</span>' : ""}
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
  const value = field === "totalCost"
    ? Math.round((toNumeric(bill.cost) + toNumeric(bill.mlpCost)) * 100) / 100
    : Number(bill[field] || 0);
  return `
    <input
      class="inline-cell-input money-input"
      type="text"
      inputmode="decimal"
      value="${Number.isFinite(value) ? value : 0}"
      data-inline-key="${htmlEscape(bill.billKey)}"
      data-inline-field="${field}"
      data-inline-type="number"
      aria-label="${htmlEscape(label)}"
    />
  `;
}

// รวมต้นทุนจริงจาก master ของยาในบิล (COST × qty) — สำหรับปุ่มเติมทุนในตาราง
function billMasterCostTotal(bill) {
  const meds = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  let total = 0;
  meds.forEach((line) => {
    const master = resolveMasterProduct(line.medicine);
    if (!master) return;
    const c = masterCostOf(master);
    if (c > 0) total += c * (toNumeric(line.qty) || 1);
  });
  return Math.round(total * 100) / 100;
}

// ปุ่ม 🪄 เติมต้นทุนจาก master — โชว์เฉพาะบิลที่ยังไม่มีทุน (cost 0) และหาทุนจาก master ได้
function autoCostBtnHtml(bill) {
  const cur = Math.round((toNumeric(bill.cost) + toNumeric(bill.mlpCost)) * 100) / 100;
  if (cur > 0) return "";
  const master = billMasterCostTotal(bill);
  if (master <= 0) return "";
  return `<button type="button" class="auto-cost-btn" data-auto-cost="${htmlEscape(bill.billKey)}" title="เติมต้นทุนจาก master = ฿${number(master)}" aria-label="เติมต้นทุนจาก master"><i class="fa-solid fa-wand-magic-sparkles"></i></button>`;
}

// เงื่อนไขตัวกรองที่ไม่ใช่ช่วงวันที่ (แท็บสถานะ/ประเภทเคส/งานวางบิล/ค้นหา)
// แยกออกมาให้ชิปวัน-เดือนใช้กติกาเดียวกับตาราง (filteredDateChipCounts)
function billMatchesNonDateFilters(bill, { status, caseType, billingStage, query }) {
  const matchesStatus = status === "all"
    || (status === "excluded" ? bill.excluded
      : status === "paid" ? (bill.billingStage || "") === "paid"
        : status === "case-insurance" ? (bill.caseType || "unknown") === "insurance"
          : status === "case-nhso" ? (bill.caseType || "unknown") === "nhso"
            : status === "repeat-customers" ? (bill.customerVisitCount >= 2 && !bill.excluded)
              : status === "pending-billing" ? isPendingBillingOpen(bill)
                : status === "clicknic-only" ? (bill.status === "clicknic-only" && !isReconciledClicknicOnly(bill))
                  : status === "matched" ? (bill.status === "matched" || isReconciledClicknicOnly(bill))
                    : bill.status === status);
  if (!matchesStatus) return false;
  if (!(caseType === "all" || (bill.caseType || "unknown") === caseType)) return false;
  if (!(billingStage === "all" || (bill.billingStage || "pending-review") === billingStage)) return false;
  if (!query) return true;
  const haystack = [
    bill.orderId,
    bill.orw,
    bill.invoice,
    bill.billingNo,
    bill.barNo,
    bill.creditNos,
    bill.billingRefs,
    bill.mlpReferenceNos,
    bill.mlpMemoOrderIds,
    caseTypeLabel(bill.caseType),
    billingStageLabel(bill.billingStage),
    bill.medicinesText,
    bill.medicineRawText,
    bill.patient,
    bill.phone,
  ].join(" ").toLowerCase();
  return haystack.includes(query);
}

function filteredBills() {
  const query = clean(elements.searchInput.value).toLowerCase();
  const status = state.activeStatus;
  const caseType = elements.caseTypeFilter?.value || "all";
  const billingStage = elements.billingStageFilter?.value || "all";
  const sortBy = elements.sortBy.value;

  const filtered = state.bills.filter((bill) =>
    billMatchesNonDateFilters(bill, { status, caseType, billingStage, query }) && isWithinDateRange(bill));

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
  // ยอดรวมของชุดที่กรองอยู่ (ไม่นับบิล Exclude ยกเว้นกำลังดูแท็บ Exclude)
  const summaryRows = rows.filter((bill) => state.activeStatus === "excluded" || !bill.excluded);
  // เงิน ขาย/ต้นทุน/กำไร ในบรรทัดสรุป นับเฉพาะบิลรายได้จริง (PAID/วางบิลมี BAR) ให้ตรงกับการ์ด KPI
  const revenueRows = summaryRows.filter(countsInRevenue);
  const totals = revenueRows.reduce((acc, bill) => {
    acc.sale += toNumeric(bill.sale);
    acc.cost += toNumeric(bill.cost) + toNumeric(bill.mlpCost);
    acc.profit += toNumeric(bill.profit);
    return acc;
  }, { sale: 0, cost: 0, profit: 0 });
  // กำไรแยกตามประเภทเคส (เฉพาะรายได้จริง เช่นเดียวกับการ์ดกำไร)
  const profitByCase = revenueRows.reduce((acc, bill) => {
    const key = bill.caseType || "unknown";
    acc[key] = (acc[key] || 0) + toNumeric(bill.profit);
    return acc;
  }, {});
  const md = (v) => (Math.abs(v) < 0.005 ? "—" : money(v));
  const profitSplit = [
    `สปสช ${md(profitByCase.nhso || 0)}`,
    `ประกัน ${md(profitByCase.insurance || 0)}`,
    Math.abs(profitByCase.general || 0) >= 0.005 ? `ทั่วไป ${md(profitByCase.general)}` : "",
    Math.abs(profitByCase.unknown || 0) >= 0.005 ? `ไม่ทราบ ${md(profitByCase.unknown)}` : "",
  ].filter(Boolean).join(" · ");
  // ยอดวางบิล (billedAmount) นับทุกบิลที่แสดง — เป็นความคืบหน้าการวางบิล ไม่ใช่รายได้
  const billedTotal = summaryRows.reduce((sum, bill) => sum + toNumeric(bill.billedAmount), 0);
  // นับประเภทเคสของชุดที่กรองอยู่ + ป้ายช่วงวันที่ ให้เลขอ่านสอดคล้องกับตัวกรอง
  const caseCounts = summaryRows.reduce((acc, bill) => {
    const key = bill.caseType || "unknown";
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  const caseText = [
    caseCounts.nhso ? `สปสช ${number(caseCounts.nhso)} เคส` : "",
    caseCounts.insurance ? `ประกัน ${number(caseCounts.insurance)} เคส` : "",
    caseCounts.general ? `ทั่วไป ${number(caseCounts.general)} เคส` : "",
    caseCounts.unknown ? `ไม่ทราบ ${number(caseCounts.unknown)} เคส` : "",
  ].filter(Boolean).join(" · ");
  // นับลูกค้าไม่ซ้ำในชุดที่แสดง (คีย์เบอร์/ชื่อ) + บิลไม่มีตัวตนนับเป็นรายคน; "มาซ้ำ" = ลูกค้าที่มี ≥2 ครั้ง
  const customerKeys = new Set();
  const repeatKeys = new Set();
  let unidentified = 0;
  summaryRows.forEach((bill) => {
    if (bill.customerKey) {
      customerKeys.add(bill.customerKey);
      if (bill.customerVisitCount >= 2) repeatKeys.add(bill.customerKey);
    } else {
      unidentified += 1;
    }
  });
  const customerCount = customerKeys.size + unidentified;
  const customerText = `${number(customerCount)} ลูกค้า${repeatKeys.size ? ` · ${number(repeatKeys.size)} คนมาซ้ำ` : ""}`;
  const periodLabel = activePeriodLabel();
  const totalBills = state.bills.length;
  // ตัวส่วนอิงช่วงที่กรอง: "<ช่วง>: X บิล · (ทั้งหมด Y)" — ซ่อน "(ทั้งหมด)" เมื่อไม่ได้กรองให้แคบลง (X=Y)
  const scopePrefix = periodLabel ? `${periodLabel}: ` : "";
  const countText = rows.length === totalBills
    ? `${scopePrefix}${number(rows.length)} บิล`
    : `${scopePrefix}${number(rows.length)} บิล · (ทั้งหมด ${number(totalBills)})`;
  elements.tableSummary.textContent = totalBills
    ? `${countText} · ${customerText} · รายได้จริง: ขาย ${money(totals.sale)} · ต้นทุน ${money(totals.cost)} · กำไร ${money(totals.profit)} (${profitSplit}) · วางบิล ${money(billedTotal)}${caseText ? ` · ${caseText}` : ""}`
    : "ยังไม่มีข้อมูล";

  if (!rows.length) {
    // บอกว่าติดตัวกรองไหนอยู่ + ปุ่มล้างในตัว — กันงงเวลาแท็บนับได้แต่ตารางว่าง (แท็บไม่นับ dropdown งานวางบิล/ค้นหา)
    const activeFilters = [];
    if (state.activeStatus !== "all") {
      activeFilters.push(`แท็บ: ${state.activeStatus === "excluded" ? "Exclude" : state.activeStatus === "paid" ? "PAID" : state.activeStatus === "case-insurance" ? "ประกัน" : state.activeStatus === "case-nhso" ? "สปสช" : statusLabel(state.activeStatus)}`);
    }
    const caseTypeValue = elements.caseTypeFilter?.value || "all";
    if (caseTypeValue !== "all") activeFilters.push(`ประเภทเคส: ${caseTypeLabel(caseTypeValue)}`);
    const stageValue = elements.billingStageFilter?.value || "all";
    if (stageValue !== "all") activeFilters.push(`งานวางบิล: ${billingStageLabel(stageValue)}`);
    const query = clean(elements.searchInput.value);
    if (query) activeFilters.push(`ค้นหา "${query}"`);
    if (activePeriodLabel()) activeFilters.push(`ช่วง ${activePeriodLabel()}`);
    elements.billTableBody.innerHTML = `<tr><td colspan="7" class="empty">ไม่พบข้อมูลตามตัวกรอง${activeFilters.length
      ? `<span class="empty-filter-note">ตัวกรองที่ทำงาน: ${activeFilters.map(htmlEscape).join(" · ")}</span><button class="ghost small" type="button" data-clear-filters>ล้างตัวกรอง</button>`
      : ""}</td></tr>`;
    return;
  }

  const barCredits = barCreditCountMap();
  elements.billTableBody.innerHTML = rows.map((bill) => {
    return `
    <tr class="${bill.excluded ? "row-excluded" : (bill.billingStage || "") === "paid" ? "row-paid" : ""}${wasJustEdited(bill) ? " row-flash" : ""}">
      <td class="action-cell">
        <input type="checkbox" class="row-pick" data-pick-key="${htmlEscape(bill.billKey)}" ${state.selectedBillKeys.has(bill.billKey) ? "checked" : ""} aria-label="เลือกบิลนี้" />
        <button class="row-action icon-action" type="button" data-detail-key="${bill.billKey}" title="รายละเอียด / แก้ไข" aria-label="รายละเอียด / แก้ไข"><i class="fa-solid fa-pen-to-square"></i></button>
        ${bill.status === "mlp-only" || bill.hasManualMedicines ? `<button class="row-action icon-action" type="button" data-manual-entry="${htmlEscape(bill.orderId || bill.billKey)}" title="${bill.hasManualMedicines ? "แก้ยา" : "เพิ่มยา"}" aria-label="${bill.hasManualMedicines ? "แก้ยา" : "เพิ่มยา"}"><i class="fa-solid fa-pills"></i></button>` : ""}
        <button class="row-action icon-action ${bill.excluded ? "exclude-active" : ""}" type="button" data-toggle-exclude="${htmlEscape(bill.billKey)}" title="${bill.excluded ? "ยกเลิก Exclude" : "Exclude"}" aria-label="${bill.excluded ? "ยกเลิก Exclude" : "Exclude"}"><i class="fa-solid fa-ban"></i></button>
      </td>
      <td class="bill-cell">
        <span class="bill-patient-row">
          <strong class="bill-patient">${htmlEscape(bill.patient || "-")}</strong>
          ${clean(bill.phone) ? `<span class="bill-patient-phone">${htmlEscape(bill.phone)}</span>` : ""}
          ${repeatVisitBadgeHtml(bill)}
          ${visitGapChipHtml(bill)}
          <button class="bill-analyze-btn" type="button" data-paste-analyze="${htmlEscape(bill.billKey)}" title="แก้ไขจากข้อความ paste (วิเคราะห์อัตโนมัติ)" aria-label="แก้ไขจากข้อความ paste"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
        </span>
        <span class="bill-dx-row">${diagnosisChipHtml(bill)}</span>
        <span class="bill-ref">${bill.orderId ? `<span class="bill-ref-part">${bill.orderId} <button class="copy-ref-btn" type="button" data-copy-text="${htmlEscape(bill.orderId)}" title="คัดลอกเลขที่ออเดอร์" aria-label="คัดลอกเลขที่ออเดอร์"><i class="fa-regular fa-copy"></i></button></span>` : "-"}${clean(bill.refId) ? ` <span class="bill-ref-part">${htmlEscape(bill.refId)} <button class="copy-ref-btn" type="button" data-copy-text="${htmlEscape(clean(bill.refId))}" title="คัดลอก Ref ID" aria-label="คัดลอก Ref ID"><i class="fa-regular fa-copy"></i></button></span>` : ""}</span>
        <span class="bill-ref">${htmlEscape(bill.orw || "ORW -")}${clean(bill.orw) ? ` <button class="copy-ref-btn" type="button" data-copy-text="${htmlEscape(clean(bill.orw.split(",")[0]))}" title="คัดลอก ORW" aria-label="คัดลอก ORW"><i class="fa-regular fa-copy"></i></button>` : ""}${caseSeqChipHtml(bill) ? ` ${caseSeqChipHtml(bill)}` : ""}</span>
        ${billRefLinesHtml(bill, barCredits)}
      </td>
      <td class="stack-cell">
        ${bill.status === "matched" ? "" : renderStatusSelect(bill)}
        ${bill.status === "billing-only" && orwMergeableKeySet().has(bill.billKey) ? `<button type="button" class="orw-merge-hint" data-orw-merge-hint="${htmlEscape(bill.billKey)}" title="พบบิลฝั่งยาที่ ORW ตรงกัน — คลิกเพื่อรวม (มีสรุปให้ยืนยัน)"><i class="fa-solid fa-link"></i> รวมได้</button>` : ""}
        ${billingStageEchoesStatus(bill) ? "" : renderBillingStageSelect(bill)}
        ${renderCaseTypeSelect(bill)}
      </td>
      <td class="dates-cell">
        <span class="date-row"><span class="date-tag">CKNC</span>${renderInlineDateInput(bill, "clicknicDate", "วันที่ CLICKNIC")}</span>
        <span class="date-row"><span class="date-tag">MLP</span>${renderInlineDateInput(bill, "mlpDate", "วันที่ MLP")}</span>
        <span class="date-row"><span class="date-tag">ครบ</span>${renderInlineDateInput(bill, "billingDueDate", "ครบกำหนดใบวางบิล")}</span>
      </td>
      <td class="meds-cell">
        ${renderMedsCell(bill)}
        ${bill.hasManualMedicines ? '<span class="source-note">เพิ่มจาก Screenshot</span>' : ""}
        ${bill.hasOverride ? '<span class="source-note">แก้ไขแล้ว</span>' : ""}
      </td>
      <td class="num money-cell">
        <span class="money-row"><span class="money-tag">ขาย</span>${renderInlineMoneyInput(bill, "sale", "ยอดขายยา")}</span>
        <span class="money-row"><span class="money-tag">ทุน</span>${renderInlineMoneyInput(bill, "totalCost", "ต้นทุน")}${autoCostBtnHtml(bill)}</span>
        <span class="profit-line ${bill.profit < 0 ? "profit-negative" : ""}${Math.abs(toNumeric(bill.profit) - 10) < 0.005 ? " profit-nhso" : ""}" title="กำไร = ยอดขายยา − ต้นทุน (แก้ยอดใบวางบิลได้ในหน้ารายละเอียด)">กำไร ${money(bill.profit)}</span>
      </td>
      <td class="check-cell">${renderCheckCell(bill)}</td>
    </tr>
  `;
  }).join("");
  updateBulkBar();
  renderMergeSuggestions();
}

// แถวที่เพิ่งถูกแก้ (override ภายใน 2.5 วิ) → กะพริบเขียวให้เห็นว่าค่าติดแล้ว
function wasJustEdited(bill) {
  const updatedAt = state.billOverrides[bill.billKey]?.updatedAt;
  if (!updatedAt) return false;
  const elapsed = Date.now() - new Date(updatedAt).getTime();
  return elapsed >= 0 && elapsed < 2500;
}

// ซ่อนปุ่ม Exclude / ยกเลิก Exclude ที่ใช้ไม่ได้กับชุดที่เลือกอยู่
// ⚠️ ธรรมเนียม Exclude เดิมไม่หาย — ยังกดได้ทุกเมื่อที่มีบิลให้กด แค่ไม่โชว์ปุ่มที่กดไปก็ไม่เกิดอะไร
// ใช้ hidden ล้วน ๆ ได้เพราะปุ่ม .ghost ไม่ได้ตั้ง display ที่คลาส (ต่างจาก .bulk-bar ดู [hidden] pitfall)
function applyBulkExcludeVisibility(keySet, excludeBtn, includeBtn) {
  if (!excludeBtn && !includeBtn) return;
  const picked = state.bills.filter((bill) => keySet.has(bill.billKey));
  const hasIncluded = picked.some((bill) => !bill.excluded);
  const hasExcluded = picked.some((bill) => bill.excluded);
  // ไม่ได้เลือกอะไรเลย = แถบซ่อนอยู่แล้ว ไม่ต้องตัดสินใจ
  if (excludeBtn) excludeBtn.hidden = picked.length > 0 && !hasIncluded;
  if (includeBtn) includeBtn.hidden = picked.length > 0 && !hasExcluded;
}

function updateBulkBar() {
  if (!elements.bulkBar) return;
  // ตัดคีย์ของบิลที่ไม่อยู่แล้วออกจากการเลือก
  const validKeys = new Set(state.bills.map((bill) => bill.billKey));
  [...state.selectedBillKeys].forEach((key) => {
    if (!validKeys.has(key)) state.selectedBillKeys.delete(key);
  });
  const count = state.selectedBillKeys.size;
  elements.bulkBar.hidden = count === 0;
  elements.bulkCount.textContent = `เลือก ${number(count)} บิล`;
  if (elements.bulkMergeBills) {
    elements.bulkMergeBills.disabled = count < 2;
    elements.bulkMergeBills.title = count < 2 ? "เลือกอย่างน้อย 2 บิลก่อนจึงรวมได้" : "รวมบิลที่เลือกเป็นบิลเดียว (เก็บข้อมูลมากที่สุด)";
  }
  applyBulkExcludeVisibility(state.selectedBillKeys, elements.bulkExclude, elements.bulkInclude);
  // เลือกชุดใหม่ = ปิดเมนูเพิ่มเติมที่อาจค้างเปิดอยู่
  if (elements.bulkMore) elements.bulkMore.open = false;
  if (elements.selectAllRows) {
    const visible = [...document.querySelectorAll("#billTableBody .row-pick")];
    const checkedVisible = visible.filter((pick) => pick.checked).length;
    elements.selectAllRows.checked = visible.length > 0 && checkedVisible === visible.length;
    elements.selectAllRows.indeterminate = checkedVisible > 0 && checkedVisible < visible.length;
  }
}

// แก้บิลที่ติ๊กเลือกทั้งชุดในครั้งเดียว — makeValues(bill, existingOverride) คืนฟิลด์ที่จะ override
function applyBulkOverride(makeValues, noteLabel, keySet) {
  const keys = keySet || state.selectedBillKeys;
  const bills = state.bills.filter((bill) => keys.has(bill.billKey));
  if (!bills.length) return;
  bills.forEach((bill) => {
    const existing = state.billOverrides[bill.billKey] || {};
    state.billOverrides[bill.billKey] = {
      ...existing,
      values: { ...(existing.values || {}), ...makeValues(bill, existing) },
      note: existing.note || "แก้แบบกลุ่ม",
      updatedAt: new Date().toISOString(),
    };
  });
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "bulk_update",
    createdAt: new Date().toISOString(),
    orderId: "",
    orw: "",
    invoice: "",
    date: "",
    lineCount: 0,
    totalSale: 0,
    totalCost: 0,
    screenshotName: "bulk-bar",
    replacedLineCount: 0,
    note: `${noteLabel} (${number(bills.length)} บิล)`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("bulk-update");
}

function parseMedicinesTextLines(medicinesText) {
  const text = clean(medicinesText || "");
  if (!text || text === "-") return [];
  return text.split(", ").map((chunk) => {
    const match = chunk.match(/^(.*)\sx([\d,.]+)$/);
    if (match) return { medicine: clean(match[1]), qty: toNumeric(match[2]), sale: 0, cost: 0 };
    return { medicine: clean(chunk), qty: 1, sale: 0, cost: 0 };
  }).filter((line) => line.medicine);
}

// ราคา 2 ฝั่งต่อบรรทัด: line.sale = CKNC เรียกประกัน (หลังบวก%), line.cost = MLP คิด CKNC (ก่อนบวก%)
// ยอดขายของบิล (MLP เรียกเก็บ) ตามผลรวมฝั่ง MLP เมื่อมีการกรอก — ฝั่ง CKNC เป็นตัวเลขอ้างอิงเทียบยอดเคลม
function renderMedsCell(bill) {
  const lines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  const addBtn = `<button class="med-add-btn" type="button" data-med-add="${htmlEscape(bill.billKey)}" title="เพิ่มรายการยาในบิลนี้">+ เพิ่มยา</button>`;
  if (!lines.length) return `<div class="meds-clamp" data-meds-body>-</div>${addBtn}`;
  const rowsHtml = lines.map((line, index) => {
    const qty = toNumeric(line.qty);
    const sale = toNumeric(line.sale);
    const mlp = toNumeric(line.cost);
    const realCost = toNumeric(line.realCost);
    const unit = qty > 0 ? Math.round((sale / qty) * 100) / 100 : Math.round(sale * 100) / 100;
    const mlpUnit = qty > 0 ? Math.round((mlp / qty) * 100) / 100 : Math.round(mlp * 100) / 100;
    const costUnit = qty > 0 ? Math.round((realCost / qty) * 100) / 100 : Math.round(realCost * 100) / 100;
    const name = htmlEscape(line.medicine || "-");
    const linked = state.medicineAliasMap.has(normalizeMedicineKey(line.medicine || ""));
    const linkBtn = `<button class="med-link-btn${linked ? " linked" : ""}" type="button" data-med-link="${htmlEscape(bill.billKey)}" data-med-index="${index}" data-med-name="${htmlEscape(line.medicine || "")}" title="${linked ? "ลิงก์ master แล้ว · คลิกเพื่อเปลี่ยน" : "ลิงก์ยานี้เข้า master"}" aria-label="ลิงก์เข้า master"><i class="fa-solid fa-link"></i></button>`;
    return `
      <div class="med-line">
        <span class="med-name" title="${name}">${name}</span>
        ${linkBtn}
        <input class="inline-cell-input med-input" type="text" inputmode="decimal" value="${qty}" data-med-key="${htmlEscape(bill.billKey)}" data-med-index="${index}" data-med-field="qty" aria-label="จำนวน ${name}" title="จำนวน" />
        <span class="med-x">×</span>
        <span class="med-tag med-tag-ck" title="ราคาที่ CKNC เรียกจากประกัน">CKNC</span>
        <input class="inline-cell-input med-input med-price" type="text" inputmode="decimal" value="${unit > 0 ? unit : ""}" placeholder="ราคา" data-med-key="${htmlEscape(bill.billKey)}" data-med-index="${index}" data-med-field="unitPrice" aria-label="ราคา CKNC ต่อหน่วย ${name}" title="ราคา CKNC เรียกประกัน (ต่อหน่วย)" />
        <span class="med-tag med-tag-mlp" title="ราคาที่ MLP คิดกับ CKNC">MLP</span>
        <input class="inline-cell-input med-input med-price med-price-mlp" type="text" inputmode="decimal" value="${mlpUnit > 0 ? mlpUnit : ""}" placeholder="ราคา" data-med-key="${htmlEscape(bill.billKey)}" data-med-index="${index}" data-med-field="mlpUnitPrice" aria-label="ราคา MLP ต่อหน่วย ${name}" title="ราคา MLP คิด CKNC (ต่อหน่วย)" />
        <span class="med-tag med-tag-cost" title="ต้นทุนจริงต่อหน่วย (จาก master COST / ดรอเวอร์)">ทุน</span>
        <input class="inline-cell-input med-input med-price med-price-cost" type="text" inputmode="decimal" value="${costUnit > 0 ? costUnit : ""}" placeholder="ทุน" data-med-key="${htmlEscape(bill.billKey)}" data-med-index="${index}" data-med-field="realCost" aria-label="ต้นทุนจริงต่อหน่วย ${name}" title="ต้นทุนจริง (ต่อหน่วย)" />
        <span class="med-line-total" title="รวมบรรทัดนี้ CKNC / MLP">= ${sale > 0 ? money(sale) : "—"}${mlp > 0 ? ` <span class="med-mlp-val">/ ${money(mlp)}</span>` : ""}</span>
      </div>
    `;
  }).join("");
  const collapsible = lines.length > 3;
  const fullLabel = `ดูทั้งหมด (${number(lines.length)} รายการ)`;
  const round2 = (value) => Math.round(value * 100) / 100;
  const totalCk = round2(lines.reduce((sum, line) => sum + toNumeric(line.sale), 0));
  const totalMlp = round2(lines.reduce((sum, line) => sum + toNumeric(line.cost), 0));
  const totalCost = round2(lines.reduce((sum, line) => sum + toNumeric(line.realCost), 0));
  const sumParts = [];
  if (totalCk > 0) sumParts.push(`<span class="med-sum-ck">CKNC ${money(totalCk)}</span>`);
  if (totalMlp > 0) sumParts.push(`<span class="med-sum-mlp">MLP ${money(totalMlp)}</span>`);
  if (totalCost > 0) sumParts.push(`<span class="med-sum-cost">ทุน ${money(totalCost)}</span>`);
  if (totalMlp > 0 && totalCost > 0) sumParts.push(`กำไร ${money(round2(totalMlp - totalCost))}`);
  else if (totalCk > 0 && totalMlp > 0) sumParts.push(`ส่วนต่าง ${money(round2(totalCk - totalMlp))}`);
  const sumNote = sumParts.length
    ? `<div class="med-sum-note" title="รวมฝั่ง CKNC เรียกประกัน / MLP คิด CKNC / ต้นทุนจริง / กำไร = MLP − ทุน">${sumParts.join(" · ")}</div>`
    : "";
  return `
    <div class="med-lines${collapsible ? " collapsible" : ""}" data-meds-body>${rowsHtml}</div>
    ${collapsible ? `<button class="meds-toggle" type="button" data-meds-toggle data-label-full="${fullLabel}">${fullLabel}</button>` : ""}
    ${sumNote}
    ${addBtn}
  `;
}

function quickUpdateMedicineLine(billKey, index, field, rawValue) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const baseLines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  if (!baseLines[index]) return;
  const round2 = (value) => Math.round(value * 100) / 100;
  const lines = baseLines.map((line) => {
    const o = {
      medicine: line.medicine || "",
      qty: toNumeric(line.qty),
      sale: toNumeric(line.sale),
      cost: toNumeric(line.cost),
      realCost: toNumeric(line.realCost), // คงต้นทุนจริงไว้ (เดิม map ตกไป → แก้ในตารางแล้วทุนหาย)
    };
    if (clean(line.supplier)) o.supplier = clean(line.supplier); // คงเจ้าไว้ด้วย
    return o;
  });
  const pricedBefore = lines.some((line) => line.sale > 0);
  const line = lines[index];
  const originalQty = line.qty;
  const originalSale = line.sale;
  const originalMlp = line.cost;
  const originalRealCost = line.realCost;
  const prevUnit = originalQty > 0 ? originalSale / originalQty : 0;
  const prevMlpUnit = originalQty > 0 ? originalMlp / originalQty : 0;
  const prevCostUnit = originalQty > 0 ? originalRealCost / originalQty : 0;
  const value = Math.max(0, toNumeric(rawValue));
  if (field === "qty") {
    line.qty = value;
    line.sale = round2(value * prevUnit);
    line.cost = round2(value * prevMlpUnit);
    line.realCost = round2(value * prevCostUnit); // ทุนสเกลตามจำนวนด้วย
  } else if (field === "unitPrice") {
    line.sale = round2((originalQty || 1) * value);
  } else if (field === "mlpUnitPrice") {
    line.cost = round2((originalQty || 1) * value);
  } else if (field === "realCost") {
    line.realCost = round2((originalQty || 1) * value);
  } else {
    return;
  }
  if (line.qty === originalQty && line.sale === originalSale && line.cost === originalMlp && line.realCost === originalRealCost) return;
  const newSale = round2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  const newMlpTotal = round2(lines.reduce((sum, item) => sum + toNumeric(item.cost), 0));
  // ยอดขายบิล = ยอดที่ MLP เรียกเก็บ: ถ้ามีราคา MLP ต่อบรรทัด ให้ตามผลรวมฝั่ง MLP ก่อนเสมอ
  // ไม่มีราคา MLP เลย → พฤติกรรมเดิม (ตามฝั่ง CKNC) และกันการทับยอดเดิมของบิลจาก session เก่า
  const shouldSetSale = newMlpTotal > 0 || pricedBefore || field === "unitPrice" || newSale > 0;
  const billSaleValue = newMlpTotal > 0 ? newMlpTotal : newSale;
  const existing = state.billOverrides[bill.billKey] || {};
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      medicines: lines,
      medicineCount: lines.length,
      medicinesText: lines.map((item) => `${item.medicine} x${number(item.qty)}`).join(", "),
      ...(shouldSetSale ? { sale: billSaleValue } : {}),
    },
    note: existing.note || "แก้รายการยาจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  const afterUnit = line.qty > 0 ? round2(line.sale / line.qty) : line.sale;
  const afterMlpUnit = line.qty > 0 ? round2(line.cost / line.qty) : line.cost;
  const noteText = field === "mlpUnitPrice"
    ? `${line.medicine}: MLP @${money(round2(prevMlpUnit))} -> @${money(afterMlpUnit)}`
    : `${line.medicine}: x${number(originalQty)} @${money(round2(prevUnit))} -> x${number(line.qty)} @${money(afterUnit)}`;
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "edit_medicine_line",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate,
    lineCount: lines.length,
    totalSale: billSaleValue,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: noteText,
    medicines: [{ medicine: line.medicine, qty: line.qty, sale: line.sale, cost: line.cost }],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("medicine-line-update");
}

// ===== ตัวช่วย Suggest / ตรวจซ้ำ / merge ใน picker ลิงก์ยา =====
function masterCodeOf(value) {
  const m = clean(value).match(/\[\s*(\d{2,})\s*\]/);
  return m ? m[1] : "";
}
// คำ pack/หน่วยที่ไม่ใช่ชื่อยา — ตัดออกก่อนวัดความคล้าย/จับซ้ำ
const MED_NOISE_WORDS = new Set(["tab", "tabs", "tablet", "cap", "caps", "capsule", "แผง", "เม็ด", "ขวด", "กล่อง", "หลอด", "ชิ้น", "box", "bottle", "strip", "strips", "pieces", "pcs", "tube", "sachet", "amp", "vial", "set", "mg", "g", "ml", "mcg"]);
// ชื่อแกน (ตัดรหัส/จำนวน/pack/หน่วย) — ใช้วัดความคล้าย + จับกลุ่มซ้ำ
function masterCoreKey(value) {
  let s = normalizeMedicineKey(value)
    .replace(/\[\s*\d{2,}\s*\]/g, " ")     // รหัส [NNNN]
    .replace(/\b\d+\s*x\s*\d+\b/g, " ")     // 5x1 10x10
    .replace(/\b\d+\s*s\b/g, " ");          // 10s 70s
  const tokens = s.split(/\s+/).filter((t) => t && !MED_NOISE_WORDS.has(t));
  return tokens.join(" ").trim();
}
function medTokens(value) {
  return masterCoreKey(value).split(/\s+/).filter(Boolean);
}
// เซตโดสเป็นตัวเลข (ตัด 0 นำหน้า) เช่น 90MG/090 -> 90 ใช้ boost คะแนน
function doseSet(value) {
  const set = new Set();
  (normalizeMedicineKey(value).match(/\d+(?:\.\d+)?/g) || []).forEach((tok) => {
    const n = parseFloat(tok);
    if (!isNaN(n) && n > 0) set.add(n);
  });
  return set;
}
// dice bigram coefficient (0..1) — ทนพิมพ์ต่าง/เว้นวรรค
function stringDice(a, b) {
  a = (a || "").replace(/\s+/g, "");
  b = (b || "").replace(/\s+/g, "");
  if (a.length < 2 || b.length < 2) return a && a === b ? 1 : 0;
  const bigrams = (s) => { const m = new Map(); for (let i = 0; i < s.length - 1; i++) { const g = s.slice(i, i + 2); m.set(g, (m.get(g) || 0) + 1); } return m; };
  const A = bigrams(a), B = bigrams(b);
  let inter = 0, total = 0;
  A.forEach((c, g) => { total += c; if (B.has(g)) inter += Math.min(c, B.get(g)); });
  B.forEach((c) => { total += c; });
  return total ? (2 * inter) / total : 0;
}
// คะแนนความคล้ายชื่อ CKNC กับ master (0..1) — dice + token jaccard + boost โดส/คำแรก
function similarityScore(ckncName, product) {
  const coreA = masterCoreKey(ckncName);
  const tokA = new Set(medTokens(ckncName));
  const doseA = doseSet(ckncName);
  let best = 0;
  productAliases(product).forEach((alias) => {
    const coreB = masterCoreKey(alias);
    if (!coreB) return;
    const tokB = medTokens(alias);
    let inter = 0;
    tokB.forEach((t) => { if (tokA.has(t)) inter++; });
    const uni = new Set([...tokA, ...tokB]).size || 1;
    let score = 0.55 * stringDice(coreA, coreB) + 0.45 * (inter / uni);
    const doseB = doseSet(alias);
    if (doseA.size && [...doseA].some((d) => doseB.has(d))) score += 0.12; // โดสตรง
    if (tokB[0] && tokA.has(tokB[0])) score += 0.08;                       // คำแรก(ชื่อยา)ตรง
    if (score > best) best = score;
  });
  return Math.min(1, best);
}
// key จับกลุ่มซ้ำ: รหัส [NNNN] > ชื่อแกน (ตรงกับ scanDuplicateMasters ของ LINE MAN)
function masterDupKey(product) {
  const code = masterCodeOf(product.name || product.id);
  return code ? "c:" + code : "n:" + masterCoreKey(product.canonicalName || product.name || product.id);
}

function downloadJSON(filename, obj) {
  const blob = new Blob([JSON.stringify(obj, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// สร้างสเปก merge master หลายตัว (logic ตรงกับ buildMergeSpec ของ lineman-mgr)
function buildMasterMergeSpec(group) {
  if (!group || group.length < 2) return null;
  const scored = group.map((p) => ({ p, s: (masterCodeOf(p.name || p.id) ? 4 : 0) + (masterCostOf(p) > 0 ? 2 : 0) + (masterLinemanOf(p) > 0 ? 1 : 0) }));
  const survivor = scored.slice().sort((a, b) => b.s - a.s)[0].p;
  const survivorName = clean(survivor.name || survivor.id);
  const names = new Set();
  group.forEach((p) => productAliases(p).forEach((n) => { const t = clean(n); if (t) names.add(t); }));
  names.delete(survivorName);
  const toDelete = group.filter((p) => p.id !== survivor.id).map((p) => p.id);
  const RESERVED = new Set(["COST", "LINEMAN", "RETAIL", "WHOLESALE", "STICKER"]);
  const mergedPrices = { ...(survivor.prices || {}) };
  let maxCost = masterCostOf(survivor), maxPrice = masterLinemanOf(survivor);
  group.forEach((p) => {
    maxCost = Math.max(maxCost, masterCostOf(p));
    maxPrice = Math.max(maxPrice, masterLinemanOf(p));
    const pr = p.prices || {};
    Object.keys(pr).forEach((k) => {
      if (RESERVED.has(k.split("_")[0])) return;      // reserved จัดการแยก
      const v = Number(pr[k]) || 0;
      if (v > (Number(mergedPrices[k]) || 0)) mergedPrices[k] = v;
    });
  });
  if (maxCost > 0) mergedPrices.COST = maxCost;
  if (maxPrice > 0) mergedPrices.LINEMAN = maxPrice;
  return { group, survivor, survivorName, cost: maxCost, aliasArr: [...names], toDelete, mergedPrices };
}

// เขียน survivor + ลบตัวซ้ำใน master_products (cross-app: LINE MAN ใช้ร่วม) + อัปเดต cache ในเครื่อง
async function applyMasterMerge(spec) {
  await window.db.collection("master_products").doc(spec.survivor.id).set({
    name: spec.survivorName,
    cost: spec.cost,
    prices: spec.mergedPrices,
    aliases: spec.aliasArr,
  }, { merge: true });
  for (const id of spec.toDelete) {
    await window.db.collection("master_products").doc(id).delete();
  }
  const survivorLocal = state.masterProducts.find((p) => p.id === spec.survivor.id);
  if (survivorLocal) {
    survivorLocal.name = spec.survivorName;
    survivorLocal.cost = spec.cost;
    survivorLocal.prices = spec.mergedPrices;
    survivorLocal.aliases = spec.aliasArr;
  }
  state.masterProducts = state.masterProducts.filter((p) => !spec.toDelete.includes(p.id));
  rebuildMedicineAliasMap();
  updateCkncMasterDatalist();
  renderMasterMappingStatus();
}

// Picker เลือกสินค้า master เพื่อลิงก์ชื่อยา CKNC (ระดับ body ตามธรรมเนียม modal)
function openMedLinkPicker(rawName) {
  document.querySelector(".med-link-modal")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "med-link-modal";
  overlay.innerHTML = `
    <div class="med-link-panel" role="dialog" aria-label="ลิงก์ยาเข้า master">
      <div class="med-link-head">
        <div>
          <div class="med-link-title"><i class="fa-solid fa-link"></i> ลิงก์ยาเข้า master</div>
          <div class="med-link-sub">CKNC: <strong>${htmlEscape(rawName || "-")}</strong></div>
        </div>
        <button class="med-link-close" type="button" aria-label="ปิด">×</button>
      </div>
      <input class="med-link-search" type="text" placeholder="ค้นหาชื่อยาใน master…" aria-label="ค้นหา master" />
      <div class="med-link-results" data-results></div>
      <div class="med-link-footer" data-footer></div>
    </div>
  `;
  document.body.appendChild(overlay);
  const search = overlay.querySelector(".med-link-search");
  const results = overlay.querySelector("[data-results]");
  const footer = overlay.querySelector("[data-footer]");
  const selected = new Set(); // เลือกหลายตัวเพื่อ merge (เก็บ id ที่ clean แล้ว)
  let byId = new Map();
  let dupCount = new Map();
  const close = () => { overlay.remove(); document.removeEventListener("keydown", onKey); };
  function onKey(e) { if (e.key === "Escape") close(); }

  // สร้างดัชนี id + นับกลุ่มซ้ำใหม่ทุกครั้ง (master เปลี่ยนหลัง merge)
  const rebuildIndex = () => {
    byId = new Map(state.masterProducts.map((p) => [clean(p.id), p]));
    dupCount = new Map();
    state.masterProducts.forEach((p) => { const k = masterDupKey(p); dupCount.set(k, (dupCount.get(k) || 0) + 1); });
  };

  const rowHtml = (p, scorePct) => {
    const id = clean(p.id);
    const nm = htmlEscape(clean(p.name || p.id));
    const idText = clean(p.name) && clean(p.id) && clean(p.id) !== clean(p.name) ? `<span class="med-link-id">${htmlEscape(clean(p.id))}</span>` : "";
    const unit = clean(p.unit) ? `<span class="med-link-unit">${htmlEscape(clean(p.unit))}</span>` : "";
    const dup = (dupCount.get(masterDupKey(p)) || 0) >= 2 ? `<span class="med-dup-badge" title="มี master รหัส/ชื่อแกนตรงกันมากกว่า 1 — ติ๊กเลือกแล้วกดรวมได้">อาจซ้ำ</span>` : "";
    const score = scorePct != null ? `<span class="med-sugg-score">${scorePct}%</span>` : "";
    return `
      <div class="med-link-row${selected.has(id) ? " picked" : ""}">
        <input type="checkbox" class="med-link-check" data-sel-id="${htmlEscape(id)}" ${selected.has(id) ? "checked" : ""} aria-label="เลือกเพื่อรวม ${nm}" />
        <button class="med-link-item" type="button" data-pick-id="${htmlEscape(id)}"><span class="med-link-nm">${nm}${dup}</span>${idText}${unit}${score}</button>
      </div>`;
  };

  const renderResults = (q) => {
    rebuildIndex();
    const query = normalizeMedicineKey(q);
    let html = "";
    if (!query) {
      // แนะนำ: จัดอันดับความคล้ายชื่อ CKNC (ไม่ต้องพิมพ์)
      const suggestions = state.masterProducts
        .map((p) => ({ p, s: similarityScore(rawName, p) }))
        .filter((x) => x.s >= 0.18)
        .sort((a, b) => b.s - a.s)
        .slice(0, 8);
      if (suggestions.length) {
        html += `<div class="med-link-secthead"><i class="fa-solid fa-wand-magic-sparkles"></i> แนะนำ (คล้าย "${htmlEscape(rawName || "-")}")</div>`;
        html += suggestions.map((x) => rowHtml(x.p, Math.round(x.s * 100))).join("");
        html += `<div class="med-link-secthead muted">ทั้งหมด</div>`;
      }
      html += state.masterProducts.slice(0, 50).map((p) => rowHtml(p)).join("");
    } else {
      const list = state.masterProducts.filter((p) => normalizeMedicineKey(`${p.name || ""} ${p.id || ""}`).includes(query)).slice(0, 50);
      html = list.length ? list.map((p) => rowHtml(p)).join("") : `<div class="med-link-empty">ไม่พบสินค้าใน master ตามคำค้น</div>`;
    }
    results.innerHTML = html;
  };

  const renderFooter = () => {
    if (selected.size < 2) { footer.innerHTML = ""; footer.classList.remove("active"); return; }
    footer.classList.add("active");
    footer.innerHTML = `
      <span class="med-link-selcount">เลือก ${selected.size} รายการ</span>
      <button type="button" class="ghost small" data-merge-clear>ล้าง</button>
      <button type="button" class="primary small" data-merge-go><i class="fa-solid fa-object-group"></i> รวมเป็นตัวเดียว</button>`;
  };

  // ยืนยัน + backup + รวม (inline ในแถบล่าง)
  function confirmMerge() {
    const group = [...selected].map((id) => byId.get(id)).filter(Boolean);
    const spec = buildMasterMergeSpec(group);
    if (!spec) { renderFooter(); return; }
    footer.classList.add("active");
    footer.innerHTML = `
      <div class="med-merge-confirm">
        <div class="med-merge-line">เก็บเป็นหลัก: <strong>${htmlEscape(spec.survivorName)}</strong>${spec.cost > 0 ? ` · ทุน ฿${number(spec.cost)}` : ""}</div>
        <div class="med-merge-del">ลบถาวร ${spec.toDelete.length}: ${spec.toDelete.map((id) => htmlEscape(clean(id))).join(" · ")}</div>
        <div class="med-merge-note">ชื่อเดิมทั้งหมดเก็บเป็น alias · แตะ master กลาง (LINE MAN ใช้ร่วม) · ดาวน์โหลด backup ก่อนลบ</div>
        <div class="med-merge-actions">
          <button type="button" class="ghost small" data-merge-cancel>ยกเลิก</button>
          <button type="button" class="primary small" data-merge-confirm><i class="fa-solid fa-shield-halved"></i> backup + รวม</button>
        </div>
      </div>`;
    footer.querySelector("[data-merge-cancel]").addEventListener("click", renderFooter);
    footer.querySelector("[data-merge-confirm]").addEventListener("click", async (ev) => {
      if (!window.db || !window.auth?.currentUser) { showToast("ต้อง login ก่อนถึงจะรวม master ได้"); return; }
      const btn = ev.currentTarget;
      btn.disabled = true;
      btn.innerHTML = "กำลังรวม…";
      const stamp = new Date().toISOString().replace(/[:.]/g, "").slice(0, 15);
      downloadJSON(`master-merge-cknc-${stamp}.json`, {
        mergedAt: new Date().toISOString(), survivorId: spec.survivor.id, deletedIds: spec.toDelete, docs: spec.group,
      });
      try {
        await applyMasterMerge(spec);
        selected.clear();
        renderResults(search.value);
        renderFooter();
        showToast(`รวมสำเร็จ: เก็บ "${spec.survivorName}" · ลบซ้ำ ${spec.toDelete.length} รายการ`);
      } catch (err) {
        console.error("master merge failed", err);
        showToast("รวมไม่สำเร็จ: " + (err.message || err));
        renderFooter();
      }
    });
  }

  renderResults("");
  renderFooter();
  search.addEventListener("input", () => renderResults(search.value));

  results.addEventListener("change", (e) => {
    const chk = e.target.closest("[data-sel-id]");
    if (!chk) return;
    if (chk.checked) selected.add(chk.dataset.selId); else selected.delete(chk.dataset.selId);
    chk.closest(".med-link-row")?.classList.toggle("picked", chk.checked);
    renderFooter();
  });

  results.addEventListener("click", async (e) => {
    const pick = e.target.closest("[data-pick-id]");
    if (!pick) return;
    const product = byId.get(pick.dataset.pickId);
    if (!product) return;
    close();
    await linkMedicineToMaster(rawName, product);
  });

  footer.addEventListener("click", (e) => {
    if (e.target.closest("[data-merge-clear]")) { selected.clear(); renderResults(search.value); renderFooter(); return; }
    if (e.target.closest("[data-merge-go]")) { confirmMerge(); return; }
  });

  overlay.querySelector(".med-link-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", onKey);
  setTimeout(() => search.focus(), 30);
}

// prompt เล็ก ๆ กรอก "วันที่ได้รับเงิน" ตอนกด PAID (หรือแก้ทีหลัง) — overlay ระดับ body ใช้สไตล์เดียวกับ med-link
function openPaidDatePrompt(defaultKey, onConfirm, options = {}) {
  document.querySelector(".paid-date-modal")?.remove();
  const overlay = document.createElement("div");
  overlay.className = "med-link-modal paid-date-modal";
  const initial = /^\d{4}-\d{2}-\d{2}$/.test(defaultKey || "") ? defaultKey : todayKey();
  // ถ้ามีบิลอื่น BAR เดียวกัน → เสนอตั้ง PAID ทั้ง BAR วันเดียวกัน (ปกติจ่ายมาพร้อมกันทั้งใบวางบิล)
  const barNo = clean(options.barNo);
  const sameBarCount = Number(options.sameBarCount) || 0;
  const sameBarUi = (barNo && sameBarCount > 1) ? `
      <label class="paid-bar-all"><input type="checkbox" class="paid-bar-all-check" checked /><span class="paid-bar-all-text">ใช้กับทุกบิลใบวางบิล ${htmlEscape(barNo)} <strong>(${number(sameBarCount)} บิล)</strong></span></label>` : "";
  overlay.innerHTML = `
    <div class="med-link-panel paid-date-panel" role="dialog" aria-label="วันที่ได้รับเงิน">
      <div class="med-link-head">
        <div>
          <div class="med-link-title"><i class="fa-solid fa-hand-holding-dollar"></i> วันที่ได้รับเงิน</div>
          <div class="med-link-sub">ตั้งเป็น PAID · เลือกวันที่เงินเข้าจริง</div>
        </div>
        <button class="med-link-close" type="button" aria-label="ปิด">×</button>
      </div>
      <div class="paid-date-body">
        <span class="date-field paid-date-field">
          <input class="paid-date-input" type="text" inputmode="numeric" placeholder="วว/ดด/ปปปป" value="${initial ? formatDisplayDate(initial) : ""}" aria-label="วันที่ได้รับเงิน" />
          <button type="button" class="date-pick-btn" title="เลือกวันที่จากปฏิทิน" aria-label="เลือกวันที่จากปฏิทิน"><i class="fa-solid fa-calendar-days"></i></button>
          <input type="date" class="date-picker-hidden" tabindex="-1" aria-hidden="true" />
        </span>
        ${sameBarUi}
        <div class="paid-date-actions">
          <button type="button" class="ghost paid-date-cancel">ยกเลิก</button>
          <button type="button" class="primary paid-date-confirm">บันทึก</button>
        </div>
      </div>
    </div>
  `;
  document.body.appendChild(overlay);
  const input = overlay.querySelector(".paid-date-input");
  let confirmed = false;
  const close = () => {
    overlay.remove();
    document.removeEventListener("keydown", onKey);
    if (!confirmed && typeof options.onCancel === "function") options.onCancel();
  };
  const confirm = () => {
    const key = dateKey(input.value);
    if (!key) { input.focus(); return; }
    const applyToAllBar = Boolean(overlay.querySelector(".paid-bar-all-check")?.checked);
    confirmed = true;
    close();
    onConfirm(key, applyToAllBar);
  };
  function onKey(e) {
    if (e.key === "Escape") close();
    else if (e.key === "Enter") confirm();
  }
  overlay.querySelector(".paid-date-confirm").addEventListener("click", confirm);
  overlay.querySelector(".paid-date-cancel").addEventListener("click", close);
  overlay.querySelector(".med-link-close").addEventListener("click", close);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) close(); });
  document.addEventListener("keydown", onKey);
  setTimeout(() => { input.focus(); }, 30);
}

// ฟอร์มเพิ่มรายการยาใหม่ในเซลล์ตาราง — ไม่ต้องเปิด drawer แก้ไข
function openInlineMedForm(addBtn) {
  const cell = addBtn.closest("td");
  if (!cell) return;
  const existing = cell.querySelector("[data-new-med-form]");
  if (existing) {
    existing.querySelector('[data-new-med-field="medicine"]')?.focus();
    return;
  }
  const form = document.createElement("div");
  form.className = "med-line med-new-line";
  form.dataset.newMedForm = addBtn.dataset.medAdd;
  form.innerHTML = `
    <input class="inline-cell-input med-name-input" type="text" placeholder="ชื่อยา" data-new-med-field="medicine" aria-label="ชื่อยาใหม่" />
    <input class="inline-cell-input med-input" type="text" inputmode="decimal" value="1" data-new-med-field="qty" aria-label="จำนวน" title="จำนวน" />
    <span class="med-x">×</span>
    <span class="med-tag med-tag-ck" title="ราคาที่ CKNC เรียกจากประกัน">CKNC</span>
    <input class="inline-cell-input med-input med-price" type="text" inputmode="decimal" placeholder="ราคา" data-new-med-field="unitPrice" aria-label="ราคา CKNC ต่อหน่วย" title="ราคา CKNC เรียกประกัน (ต่อหน่วย)" />
    <span class="med-tag med-tag-mlp" title="ราคาที่ MLP คิดกับ CKNC">MLP</span>
    <input class="inline-cell-input med-input med-price med-price-mlp" type="text" inputmode="decimal" placeholder="ราคา" data-new-med-field="mlpUnitPrice" aria-label="ราคา MLP ต่อหน่วย" title="ราคา MLP คิด CKNC (ต่อหน่วย)" />
    <button class="icon-button med-confirm-btn" type="button" data-new-med-confirm title="บันทึก (Enter)" aria-label="บันทึกรายการยาใหม่">✓</button>
    <button class="icon-button med-remove-btn" type="button" data-new-med-cancel title="ยกเลิก (Esc)" aria-label="ยกเลิกรายการยาใหม่">×</button>
  `;
  addBtn.before(form);
  form.querySelector('[data-new-med-field="medicine"]').focus();
}

function commitInlineMedForm(form) {
  if (!form) return;
  const nameInput = form.querySelector('[data-new-med-field="medicine"]');
  const medicine = clean(nameInput?.value || "");
  if (!medicine) {
    nameInput?.focus();
    return;
  }
  const qty = Math.max(0, toNumeric(form.querySelector('[data-new-med-field="qty"]')?.value)) || 1;
  const unitPrice = Math.max(0, toNumeric(form.querySelector('[data-new-med-field="unitPrice"]')?.value));
  const mlpUnitPrice = Math.max(0, toNumeric(form.querySelector('[data-new-med-field="mlpUnitPrice"]')?.value));
  quickAddMedicineLine(form.dataset.newMedForm, medicine, qty, unitPrice, mlpUnitPrice);
}

function quickAddMedicineLine(billKey, medicine, qty, unitPrice, mlpUnitPrice = 0) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const round2 = (value) => Math.round(value * 100) / 100;
  const baseLines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  const lines = baseLines.map((line) => ({
    medicine: line.medicine || "",
    qty: toNumeric(line.qty),
    sale: toNumeric(line.sale),
    cost: toNumeric(line.cost),
  }));
  const pricedBefore = lines.some((line) => line.sale > 0);
  const newLine = { medicine, qty, sale: round2(qty * unitPrice), cost: round2(qty * mlpUnitPrice) };
  lines.push(newLine);
  const newSale = round2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  const newMlpTotal = round2(lines.reduce((sum, item) => sum + toNumeric(item.cost), 0));
  // ยอดขายบิล = ยอด MLP เรียกเก็บ: มีราคา MLP → ตามผลรวม MLP; ไม่มี → พฤติกรรมเดิมฝั่ง CKNC
  // บิลเก่าที่ไม่มีราคาต่อหน่วยเลยและไม่ได้ใส่ราคา: อย่าทับยอดขายเดิมของบิล
  const shouldSetSale = newMlpTotal > 0 || pricedBefore || unitPrice > 0;
  const billSaleValue = newMlpTotal > 0 ? newMlpTotal : newSale;
  const existing = state.billOverrides[bill.billKey] || {};
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      medicines: lines,
      medicineCount: lines.length,
      medicinesText: lines.map((item) => `${item.medicine} x${number(item.qty)}`).join(", "),
      ...(shouldSetSale ? { sale: billSaleValue } : {}),
    },
    note: existing.note || "เพิ่มรายการยาจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "add_medicine_line",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate,
    lineCount: lines.length,
    totalSale: billSaleValue,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: `เพิ่ม ${medicine}: x${number(qty)}${unitPrice > 0 ? ` @${money(unitPrice)}` : ""}${mlpUnitPrice > 0 ? ` MLP@${money(mlpUnitPrice)}` : ""}`,
    medicines: [newLine],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("medicine-line-add");
}

// ป้ายลูกค้ามาซ้ำใต้ชื่อ — กดแล้วเปิดไทม์ไลน์ทุกครั้งที่มาของลูกค้าคนนี้
function repeatVisitBadgeHtml(bill) {
  if (!(bill.customerVisitCount >= 2)) return "";
  const title = `ลูกค้าเดิม มารับบริการ ${number(bill.customerVisitCount)} ครั้ง (เลขที่ออเดอร์เดียวกัน/วันเดียวกัน = ครั้งเดียว) — ครั้งนี้เป็นครั้งที่ ${number(bill.customerVisitIndex)} · กดดูไทม์ไลน์ทุกครั้งที่มา`;
  return `<button type="button" class="repeat-visit-badge" data-visit-timeline="${htmlEscape(bill.billKey)}" title="${htmlEscape(title)}"><i class="fa-solid fa-repeat"></i> ครั้งที่ ${number(bill.customerVisitIndex)}/${number(bill.customerVisitCount)}</button>`;
}

// ป้ายระยะห่างจากการมาครั้งก่อน — เหลืองเมื่อเร็วกว่าเกณฑ์ที่ตั้งไว้ (แผงเครื่องมือ)
function visitGapChipHtml(bill) {
  const gap = toNumeric(bill.visitGapDays);
  if (!(bill.customerVisitIndex >= 2) || gap <= 0) return "";
  const warnDays = repeatVisitWarnDays();
  const soon = warnDays > 0 && gap <= warnDays;
  const title = `ห่างจากการมาครั้งก่อน ${number(gap)} วัน${soon ? ` — เร็วกว่าเกณฑ์ ${number(warnDays)} วัน` : ""}${(bill.visitRepeatMeds || []).length ? ` · ยาซ้ำ: ${bill.visitRepeatMeds.join(", ")}` : ""} · กดดูไทม์ไลน์`;
  return `<button type="button" class="visit-gap-chip${soon ? " soon" : ""}" data-visit-timeline="${htmlEscape(bill.billKey)}" title="${htmlEscape(title)}"><i class="fa-regular fa-clock"></i> ห่าง ${number(gap)} วัน</button>`;
}

// ป้ายคำวินิจฉัยใต้ชื่อ — ว่างก็ยังกดได้เพื่อพิมพ์ (เปิดไทม์ไลน์ที่โฟกัสบิลนี้)
function diagnosisChipHtml(bill) {
  const dx = billDiagnosis(bill);
  if (!dx) {
    return `<button type="button" class="dx-chip dx-empty" data-dx-edit="${htmlEscape(bill.billKey)}" title="ยังไม่มีคำวินิจฉัย — กดเพื่อบันทึก"><i class="fa-solid fa-stethoscope"></i> + Dx</button>`;
  }
  const short = dx.length > 34 ? `${dx.slice(0, 34)}…` : dx;
  return `<button type="button" class="dx-chip" data-dx-edit="${htmlEscape(bill.billKey)}" title="${htmlEscape(`คำวินิจฉัย: ${dx} · กดเพื่อแก้ไข`)}"><i class="fa-solid fa-stethoscope"></i> Dx: ${htmlEscape(short)}</button>`;
}

// เขียนคำวินิจฉัยลง override ของบิล (1 เลขที่ออเดอร์ = 1 บิล จึงเขียนใบเดียวพอ)
function quickUpdateDiagnosis(billKey, text) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const diagnosis = clean(text);
  if (diagnosis === billDiagnosis(bill)) return;
  const existing = state.billOverrides[bill.billKey] || {};
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      diagnosis,
    },
    note: existing.note || "บันทึกคำวินิจฉัย",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "diagnosis_update",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "visit-timeline",
    replacedLineCount: 0,
    note: `คำวินิจฉัย: ${diagnosis || "(ลบออก)"}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  refreshCardDetail();
  scheduleAutosave("diagnosis-update");
  if (elements.visitTimelineModal?.open) renderVisitTimeline();
}

// ป๊อปอัพไทม์ไลน์การมารับบริการของลูกค้าคนหนึ่ง — ดูระยะห่าง/ยาซ้ำ และพิมพ์คำวินิจฉัยรายครั้งได้ในตัว
let visitTimelineContext = null;

function openVisitTimeline(billKey, focusDx = false) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  visitTimelineContext = { billKey, focusDx };
  renderVisitTimeline();
  if (elements.visitTimelineModal && !elements.visitTimelineModal.open) elements.visitTimelineModal.showModal();
  if (focusDx) {
    const input = elements.visitTimelineBody?.querySelector(`[data-dx-input="${CSS.escape(billKey)}"]`);
    if (input) {
      input.focus();
      input.setSelectionRange(input.value.length, input.value.length);
    }
  }
}

// บิลทุกใบของลูกค้าคนเดียวกับบิลนี้ (ระบุตัวไม่ได้ = บิลใบเดียว)
function billsForCustomerOf(bill) {
  if (!bill.customerKey) return [bill];
  return state.bills.filter((item) => item.customerKey === bill.customerKey);
}

function renderVisitTimeline() {
  if (!visitTimelineContext || !elements.visitTimelineBody) return;
  const anchor = state.bills.find((item) => item.billKey === visitTimelineContext.billKey);
  if (!anchor) return;
  const visits = groupBillsIntoVisits(billsForCustomerOf(anchor));
  const gaps = visits.map((visit, index) => (index > 0 && visit.date && visits[index - 1].date ? daysBetween(visits[index - 1].date, visit.date) : 0)).filter((gap) => gap > 0);
  const avgGap = gaps.length ? Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length) : 0;
  const warnDays = repeatVisitWarnDays();

  elements.visitTimelineTitle.textContent = anchor.patient || anchor.orderId || "(ไม่ระบุชื่อ)";
  elements.visitTimelineSummary.textContent = [
    clean(anchor.phone) || (anchor.customerKey ? "ไม่มีเบอร์โทร (จับคู่ด้วยชื่อ)" : "ระบุตัวลูกค้าไม่ได้"),
    `มารับบริการ ${number(visits.length)} ครั้ง`,
    avgGap > 0 ? `ห่างเฉลี่ย ${number(avgGap)} วัน` : "",
  ].filter(Boolean).join(" · ");

  elements.visitTimelineBody.innerHTML = visits.map((visit, index) => {
    const previous = index > 0 ? visits[index - 1] : null;
    const gap = previous && previous.date && visit.date ? daysBetween(previous.date, visit.date) : 0;
    const soon = warnDays > 0 && gap > 0 && gap <= warnDays;
    const previousMeds = previous ? medicineKeySet(previous.bills) : new Set();
    const repeatMeds = previous
      ? [...medicineKeySet(visit.bills)].filter((key) => previousMeds.has(key)).map((key) => medicineLabelFor(visit.bills, key))
      : [];
    const gapText = index === 0
      ? "ครั้งแรก"
      : gap > 0 ? `ห่างจากครั้งก่อน ${number(gap)} วัน` : "ไม่ทราบระยะห่าง (ไม่มีวันที่)";
    return `
      <div class="visit-entry${soon ? " visit-entry-soon" : ""}">
        <div class="visit-entry-head">
          <span class="visit-index">${number(index + 1)}</span>
          <span class="visit-date">${htmlEscape(formatDisplayDate(visit.date) || "ไม่มีวันที่")}</span>
          <span class="visit-gap${soon ? " soon" : ""}">${htmlEscape(gapText)}</span>
          <span class="visit-case case-${htmlEscape(visit.bills[0].caseType || "unknown")}">${htmlEscape(caseTypeChipLabel(visit.bills[0].caseType))}</span>
        </div>
        ${visit.bills.map((bill) => `
          <div class="visit-bill${bill.billKey === anchor.billKey ? " visit-bill-active" : ""}">
            <div class="visit-bill-head">
              <button type="button" class="case-seq-bill-link" data-visit-open="${htmlEscape(bill.billKey)}" title="เปิดรายละเอียด / แก้ไขบิลนี้">${htmlEscape(bill.orderId || bill.orw || "(ไม่มีเลขที่)")}</button>
              ${clean(bill.refId) ? `<span class="visit-ref">Ref-ID ${htmlEscape(clean(bill.refId))} <button type="button" class="copy-ref-btn" data-copy-text="${htmlEscape(clean(bill.refId))}" title="คัดลอก Ref-ID" aria-label="คัดลอก Ref-ID"><i class="fa-regular fa-copy"></i></button></span>` : ""}
              <span class="visit-meds">${htmlEscape(bill.medicinesText || "ไม่มีรายการยา")}</span>
            </div>
            <label class="visit-dx">
              <span class="visit-dx-tag"><i class="fa-solid fa-stethoscope"></i> Dx</span>
              <input type="text" class="inline-cell-input" data-dx-input="${htmlEscape(bill.billKey)}" value="${htmlEscape(billDiagnosis(bill))}" placeholder="พิมพ์คำวินิจฉัยครั้งนี้… (Enter บันทึก)" aria-label="คำวินิจฉัยของบิล ${htmlEscape(bill.orderId || bill.orw || "")}" />
            </label>
          </div>
        `).join("")}
        ${repeatMeds.length ? `<div class="visit-warn"><i class="fa-solid fa-triangle-exclamation"></i> ยาซ้ำกับครั้งก่อน: ${htmlEscape(repeatMeds.join(", "))}</div>` : ""}
      </div>`;
  }).join("");
}

function commitVisitDxInput(input) {
  if (input.dataset.done) return;
  const billKey = input.dataset.dxInput;
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill || clean(input.value) === billDiagnosis(bill)) return;
  input.dataset.done = "1";
  quickUpdateDiagnosis(billKey, input.value);
}

function renderCheckCell(bill) {
  const issues = bill.validationIssues || [];
  if (!issues.length) return '<span class="validation-chip" title="ผ่านการตรวจสอบ">ผ่าน</span>';
  const rank = { danger: 3, warn: 2, info: 1 };
  const worst = issues.reduce((acc, issue) => ((rank[issue.level] || 0) > (rank[acc] || 0) ? issue.level : acc), "info");
  const titleText = issues.map((issue) => issue.text).join(" | ");
  return `<span class="validation-chip ${worst}" title="${htmlEscape(titleText)}">${issues.length} จุด</span>`;
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
        <p>${(entry.medicines || []).map((item) => `${item.medicine} x${number(item.qty)}`).join(", ")}</p>
      </div>
      <div>
        <span class="audit-kicker">หลักฐาน</span>
        <strong>${entry.screenshotName}</strong>
        <p>${entry.note || "-"}</p>
        ${mergeGroupExists(entry.mergeGroupId)
          ? `<button class="ghost small audit-unmerge-btn" type="button" data-unmerge-group="${htmlEscape(entry.mergeGroupId)}">เลิกรวมบิลนี้</button>`
          : ""}
        ${mergeBatchExists(entry.mergeBatchId)
          ? `<button class="ghost small audit-unmerge-btn" type="button" data-unmerge-batch="${htmlEscape(entry.mergeBatchId)}" title="คืนบิลต้นฉบับของทุกกลุ่มที่รวมในครั้งนั้น">เลิกรวมทั้งชุด (${number(mergeGroupsOfBatch(entry.mergeBatchId).length)} กลุ่ม)</button>`
          : ""}
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
  if (action === "edit_medicine_line") return "แก้จำนวน/ราคายา";
  if (action === "add_medicine_line") return "เพิ่มรายการยาจากตาราง";
  if (action === "case_seq_update") return "แก้เลขลำดับเคส";
  if (action === "suggestion_dismiss") return "ซ่อนคู่แนะนำรวมบิล";
  if (action === "paste_analyze_apply") return "แก้ข้อมูลจากข้อความ paste";
  if (action === "merge_bills") return "รวมบิลเป็นใบเดียว";
  if (action === "unmerge_bills") return "เลิกรวมบิล";
  if (action === "delete_bills") return "ลบบิลออกจากงานบนจอ";
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
    orw: normalized.match(/ORW-\d{5}-\d{2}-\d{3,}/)?.[0] || "",
    inv: normalized.match(/INV-\d{5}-\d{2}-\d{3,}/)?.[0] || "",
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

function openManualEntry(refId) {
  const bill = state.bills.find((item) => (item.orderId && item.orderId === refId) || item.billKey === refId);
  if (!bill) return;
  // บิลไม่มีเลขที่ออเดอร์ (memo ไม่มีเลข 16 หลัก): ผูกยา manual ด้วย ORW แทน
  const manualKey = bill.orderId || clean(bill.orw.split(",")[0]) || "";
  const existingManualRows = state.manualClicknicRows.filter((row) => row.orderId === manualKey);
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
  const orderId = findOrderId(elements.manualOrderId.value) || clean(elements.manualOrderId.value) || clean(elements.manualOrw.value);
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
  // ไม่มีเลขที่ออเดอร์: ใช้ ORW เป็นคีย์ผูกยาแทน (buildBills จะย้ายกลุ่มไปรวมกับแถว MLP ที่ ORW ตรงกัน)
  const orderId = findOrderId(elements.manualOrderId.value) || clean(elements.manualOrderId.value) || clean(elements.manualOrw.value);
  const auditId = makeAuditId();
  const rows = collectManualRows(auditId);
  if (!orderId || !rows.length) {
    elements.manualEntrySummary.textContent = "กรุณาใส่เลขที่ออเดอร์ (หรือ ORW) และรายการยาอย่างน้อย 1 รายการ";
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
    ? `พร้อมวิเคราะห์: ครบ CKNC+MLP+BAR ${number(metrics.matched)} บิล, ต้องตรวจสอบ ${number(issueCount)} บิล${duplicateNote}`
    : "รออัปโหลดไฟล์";
  maybeAutosaveOnComplete();
}

// สะสางบิลจาก snapshot เก่า: แตกเลขจากฟิลด์เดิม billingNo เข้า barNo/creditNos + stage auto คิดใหม่ตามกติกาปัจจุบัน
function normalizeSnapshotBills() {
  state.bills.forEach((bill) => {
    let changed = false;
    if (!clean(bill.barNo) && !clean(bill.creditNos) && clean(bill.billingNo)) {
      const tokens = clean(bill.billingNo).split(",").map(clean).filter(Boolean);
      const bars = tokens.filter((token) => /^bar/i.test(token));
      const credits = tokens.filter((token) => /^ar/i.test(token));
      if (bars.length || credits.length) {
        bill.barNo = bars.join(", ");
        bill.creditNos = credits.join(", ");
        changed = true;
      }
    }
    if ((bill.billingStageSource || "") !== "manual" && bill.billingStage !== "paid") {
      const stage = deriveBillingStage(bill.status, bill.caseType || "unknown", bill.barNo, bill.creditNos);
      if (stage.billingStage !== bill.billingStage) {
        bill.billingStage = stage.billingStage;
        bill.billingStageSource = stage.billingStageSource;
        changed = true;
      }
    }
    if (changed) bill.validationIssues = validationRulesForBill(bill);
  });
}

function renderSnapshot() {
  // เส้นทางโหลด session/autosave ตั้ง state.bills ตรง ๆ โดยไม่ผ่าน rebuild — สะสาง + คำนวณลำดับเคสที่นี่เสมอ
  normalizeSnapshotBills();
  assignCaseSequences();
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

// เลขลำดับเคสต่อเดือน (สปสช/ประกัน) ไว้ช่วยนับยอดส่งเบิก — เรียงตามวันที่ CLICKNIC (ไม่มีใช้ MLP)
// เลขคำนวณใหม่ทุกครั้งที่ rebuild; แก้มือทับรายบิลได้ผ่าน override caseSeqManual (0/ว่าง = อัตโนมัติ)
const caseSeqNames = { nhso: "สปสช", insurance: "ประกัน" };
const caseSeqCodes = { nhso: "NHSO", insurance: "INS" };

// โค้ดลำดับเคส เช่น NHSO-006-06 (ลำดับ 3 หลัก - เลขเดือน 2 หลัก)
function caseSeqCode(caseType, seq, monthNo) {
  return `${caseSeqCodes[caseType] || ""}-${String(Math.max(0, Math.round(toNumeric(seq)))).padStart(3, "0")}-${String(monthNo).padStart(2, "0")}`;
}

function caseSeqDate(bill) {
  return dateKey(bill.clicknicDate || bill.mlpDate);
}

// เลขลำดับว่างถัดไปของประเภทเคส+เดือน = จำนวนเต็มบวกน้อยสุดที่ยังไม่มีบิลใดใช้ (เติมช่องว่างก่อน)
function nextFreeCaseSeq(caseType, month) {
  const used = new Set(state.bills
    .filter((bill) => bill.caseType === caseType && bill.caseSeqMonth === month && bill.caseSeq)
    .map((bill) => bill.caseSeq));
  let next = 1;
  while (used.has(next)) next += 1;
  return next;
}

function assignCaseSequences() {
  const counters = new Map();
  state.bills.forEach((bill) => {
    bill.caseSeq = 0;
    bill.caseSeqMonth = "";
  });
  state.bills
    .filter((bill) => caseSeqNames[bill.caseType] && !bill.excluded && caseSeqDate(bill))
    .sort((a, b) => caseSeqDate(a).localeCompare(caseSeqDate(b))
      || clean(a.orw || a.orderId).localeCompare(clean(b.orw || b.orderId)))
    .forEach((bill) => {
      const month = caseSeqDate(bill).slice(0, 7);
      const key = `${bill.caseType}|${month}`;
      const next = (counters.get(key) || 0) + 1;
      counters.set(key, next);
      bill.caseSeqMonth = month;
      // บิลที่ตอกเลขเองยังกินลำดับ auto ของตัวเองไว้ เลขบิลอื่นจะได้ไม่ขยับ
      bill.caseSeq = toNumeric(bill.caseSeqManual) > 0 ? Math.round(toNumeric(bill.caseSeqManual)) : next;
    });
  // ทุก pipeline finalize บิลผ่านที่นี่ (rebuild ทั้ง 2 โหมด + renderSnapshot) — คำนวณรอบการมาของลูกค้าที่เดียว
  annotateCustomerVisits(state.bills);
}

function caseSeqChipHtml(bill) {
  if (!bill.caseSeq || !caseSeqNames[bill.caseType] || !bill.caseSeqMonth) return "";
  const monthNo = Number(bill.caseSeqMonth.split("-")[1]);
  const manual = toNumeric(bill.caseSeqManual) > 0;
  const title = `เคส${caseSeqNames[bill.caseType]} ลำดับที่ ${number(bill.caseSeq)} ของเดือน ${monthChipLabel(bill.caseSeqMonth)}${manual ? " (กำหนดเลขเอง)" : ""} — คลิกดูตารางลำดับทั้งเดือน / แก้เลขได้`;
  return `<button type="button" class="case-seq-chip case-${bill.caseType}" data-seq-edit="${htmlEscape(bill.billKey)}" title="${htmlEscape(title)}">${caseSeqCode(bill.caseType, bill.caseSeq, monthNo)}${manual ? "*" : ""}</button>`;
}

// คลิก chip ลำดับเคส = เปิด popup ตารางลำดับทั้งเดือนของประเภทนั้น — แก้เลขได้ในช่องลำดับ
let caseSeqModalContext = null;

function openCaseSeqTable(chip) {
  const bill = state.bills.find((item) => item.billKey === chip.dataset.seqEdit);
  if (!bill || !caseSeqNames[bill.caseType] || !bill.caseSeqMonth) return;
  caseSeqModalContext = { caseType: bill.caseType, month: bill.caseSeqMonth, activeKey: bill.billKey };
  if (elements.caseSeqSearch) elements.caseSeqSearch.value = "";
  renderCaseSeqModal();
  if (elements.caseSeqModal && !elements.caseSeqModal.open) elements.caseSeqModal.showModal();
}

// สีขอบ chip ตามกลุ่ม BAR — ใบวางบิลเดียวกันได้สีเดียวกัน (ส้มสงวนไว้ให้ "ยังไม่มี BAR")
const caseSeqBarPalette = ["#15803d", "#7c3aed", "#0284c7", "#db2777", "#0d9488", "#4338ca", "#b91c1c", "#475569"];

function renderCaseSeqModal() {
  if (!caseSeqModalContext || !elements.caseSeqModal) return;
  const { caseType, month, activeKey } = caseSeqModalContext;
  const allRows = state.bills
    .filter((item) => item.caseType === caseType && item.caseSeqMonth === month && item.caseSeq)
    .sort((a, b) => a.caseSeq - b.caseSeq || caseSeqDate(a).localeCompare(caseSeqDate(b)));
  const monthNo = Number(month.split("-")[1]);
  // สีกลุ่ม BAR คิดจากทุกแถวของเดือน (ค้นหาแล้วสียังคงที่)
  const barColors = new Map();
  allRows.forEach((item) => {
    const bar = clean(item.barNo);
    if (bar && !barColors.has(bar)) barColors.set(bar, caseSeqBarPalette[barColors.size % caseSeqBarPalette.length]);
  });
  // ลำดับซ้ำ = เลข caseSeq เดียวกันเกิน 1 บิลในเดือน (มักเกิดจากตอกเลขเองชนกับ auto) — เตือน + ไฮไลต์
  const seqTally = new Map();
  allRows.forEach((item) => seqTally.set(item.caseSeq, (seqTally.get(item.caseSeq) || 0) + 1));
  const dupSeqs = [...seqTally.entries()].filter(([, count]) => count > 1).map(([seq]) => seq).sort((a, b) => a - b);
  const dupSet = new Set(dupSeqs);
  // เลขว่างถัดไปของเดือน (สำหรับปุ่มแก้อัตโนมัติแถวซ้ำ) — เลขบวกน้อยสุดที่ยังไม่มีใครใช้
  const dupNextFree = dupSet.size ? nextFreeCaseSeq(caseType, month) : 0;
  const term = clean(elements.caseSeqSearch?.value).toLowerCase();
  const rows = term
    ? allRows.filter((item) => [item.orderId, item.orw, item.patient, caseSeqCode(caseType, item.caseSeq, monthNo)]
        .some((field) => clean(field).toLowerCase().includes(term)))
    : allRows;
  elements.caseSeqModalTitle.textContent = `ลำดับเคส${caseSeqNames[caseType]} · ${monthChipLabel(month)} (${number(term ? rows.length : allRows.length)}${term ? ` จาก ${number(allRows.length)}` : ""} เคส)`;
  // เตือนลำดับซ้ำ = chip ต่อท้ายหัวข้อ (อยู่ในหัว modal ที่ไม่เลื่อน) กด chip = jump ไปแถวนั้น
  if (elements.caseSeqDupInline) {
    elements.caseSeqDupInline.innerHTML = dupSeqs.length
      ? `<span class="case-seq-dup-inline-warn" title="แก้เลขให้ไม่ซ้ำก่อนส่งเบิก"><i class="fa-solid fa-triangle-exclamation"></i> ซ้ำ:</span> ${dupSeqs.map((seq) => `<button type="button" class="case-seq-dup-chip" data-dup-seq="${htmlEscape(String(seq))}" title="ไปที่ลำดับ #${number(seq)}">#${number(seq)}</button>`).join(" ")}`
      : "";
  }
  elements.caseSeqModalBody.innerHTML = rows.length ? `
    <table class="case-seq-table">
      <thead><tr><th class="seq-col">ลำดับ</th><th>โค้ด</th><th>วันที่ CKNC</th><th>บิล / ผู้รับบริการ</th><th class="act-col">จัดการ</th></tr></thead>
      <tbody>
        ${rows.map((item) => {
    const manual = toNumeric(item.caseSeqManual) > 0;
    const bar = clean(item.barNo);
    const barColor = bar ? barColors.get(bar) : "#f59e0b";
    const barTitle = bar ? `ใบวางบิล ${bar}` : "ยังไม่มีใบวางบิล (BAR)";
    const isDup = dupSet.has(item.caseSeq);
    return `<tr data-row-seq="${item.caseSeq}" class="${item.billKey === activeKey ? "case-seq-row-active" : ""}${isDup ? " case-seq-row-dup" : ""}">
            <td class="seq-col"><span class="seq-edit-wrap"><input type="text" inputmode="numeric" class="inline-cell-input case-seq-input${isDup ? " case-seq-input-dup" : ""}" data-seq-row="${htmlEscape(item.billKey)}" value="${item.caseSeq}" title="${isDup ? `ลำดับ #${number(item.caseSeq)} ซ้ำกับบิลอื่น — คลิกพิมพ์แก้เลขได้เลย` : "คลิกพิมพ์แก้เลขลำดับได้เลย · เว้นว่าง = นับอัตโนมัติ"}" aria-label="เลขลำดับเคส" /><i class="fa-solid fa-pen seq-edit-hint" aria-hidden="true"></i></span></td>
            <td><span class="case-seq-chip case-${htmlEscape(caseType)} case-seq-bar-chip" style="border-color:${barColor}" title="${htmlEscape(barTitle)}">${htmlEscape(caseSeqCode(caseType, item.caseSeq, monthNo))}${manual ? "*" : ""}</span>${bar ? "" : `<button type="button" class="case-seq-addbar-chip" data-bar-add="${htmlEscape(item.billKey)}" title="ยังไม่มีใบวางบิล (BAR) — กดเพื่อใส่ BAR ให้เคสนี้">+ BAR</button>`}</td>
            <td class="case-seq-date">${htmlEscape(formatDisplayDate(item.clicknicDate || item.mlpDate) || "-")}</td>
            <td class="case-seq-bill">
              <span class="case-seq-bill-line">
                <button type="button" class="case-seq-bill-link" data-seq-open="${htmlEscape(item.billKey)}" title="เปิดรายละเอียด / แก้ไขบิลนี้">${htmlEscape(item.orderId || item.orw || "-")}</button>
                ${clean(item.orderId || item.orw) ? `<button type="button" class="copy-ref-btn" data-copy-text="${htmlEscape(clean(item.orderId || item.orw))}" title="คัดลอกเลขที่ออเดอร์" aria-label="คัดลอกเลขที่ออเดอร์"><i class="fa-regular fa-copy"></i></button>` : ""}
              </span>
              <span class="case-seq-patient">${htmlEscape(item.patient || "-")}</span>
            </td>
            <td class="act-col">${isDup ? `<button type="button" class="case-seq-autofix" data-seq-autofix="${htmlEscape(item.billKey)}" title="แก้เป็นเลขว่างถัดไป #${number(dupNextFree)} (อัตโนมัติ)"><i class="fa-solid fa-wand-magic-sparkles"></i> #${number(dupNextFree)}</button>` : ""}<button type="button" class="row-action icon-action" data-seq-open="${htmlEscape(item.billKey)}" title="รายละเอียด / แก้ไข" aria-label="รายละเอียด / แก้ไข"><i class="fa-solid fa-pen-to-square"></i></button></td>
          </tr>`;
  }).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">แก้เลขในช่องลำดับ (Enter บันทึก · เว้นว่าง = กลับไปนับอัตโนมัติ · * = กำหนดเลขเอง) · กดเลขบิลหรือปุ่มดินสอเพื่อเปิดแก้ไขรายละเอียด · สีขอบโค้ด = กลุ่มใบวางบิล (BAR) เดียวกัน, ขอบส้ม = ยังไม่มี BAR</p>
  ` : `<p class="case-seq-hint">${term ? "ไม่พบเคสที่ตรงกับคำค้นหา" : "ไม่มีเคสในเดือนนี้"}</p>`;
}

function commitCaseSeqRow(input) {
  if (input.dataset.done) return;
  const billKey = input.dataset.seqRow;
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const currentManual = Math.max(0, Math.round(toNumeric(bill.caseSeqManual)));
  const manual = Math.max(0, Math.round(toNumeric(input.value)));
  // ไม่ได้แก้อะไร (ค่าเดิม หรือพิมพ์เลข auto เดิมทั้งที่ไม่เคยตอกเอง) = ไม่บันทึก
  if (manual === currentManual || (currentManual === 0 && manual === (bill.caseSeq || 0))) return;
  input.dataset.done = "1";
  quickUpdateCaseSeq(billKey, manual);
  renderCaseSeqModal();
}

function quickUpdateCaseSeq(billKey, manual) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const existing = state.billOverrides[bill.billKey] || {};
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      caseSeqManual: manual,
    },
    note: existing.note || "แก้เลขลำดับเคสจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "case_seq_update",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate,
    lineCount: 0,
    totalSale: bill.sale,
    totalCost: bill.cost,
    screenshotName: "case-seq-chip",
    replacedLineCount: 0,
    note: `ลำดับเคส: #${number(bill.caseSeq)} -> ${manual > 0 ? `#${number(manual)}` : "อัตโนมัติ"}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  refreshCardDetail();
  scheduleAutosave("case-seq-update");
}

function rebuildBillsForCurrentMode() {
  if (!state.snapshotMode) {
    buildBills();
    assignCaseSequences();
    return;
  }
  state.bills = state.bills.map((bill) => {
    const merged = applyBillOverride({ ...bill, hasOverride: false, overrideNote: "" });
    merged.validationIssues = validationRulesForBill(merged);
    return merged;
  });
  applyManualMergeGroups();
  applyDeletedBills();
  assignCaseSequences();
}

function clipboardKindLabel(kind) {
  if (kind === "clicknic") return "CLICKNIC";
  if (kind === "mlp") return "MEDLIFE PLUS";
  if (kind === "billing") return "BILLING NOTE";
  return "Clipboard";
}

// ค่าหัวใบที่กรอกในโมดัล → ส่งต่อให้ parseBillingWorkbook
function billingImportOptions() {
  return {
    fallbackBar: clean(elements.clipboardBarNo?.value).toUpperCase(),
    dueDateOverride: normalizeBillingDueDateInput(elements.clipboardDueDate?.value),
  };
}

function billingRowsFromText(text) {
  if (!clean(text)) return [];
  try {
    return parseBillingWorkbook(workbookFromClipboardText(text, "Clipboard billing"), "clipboard-billing", billingImportOptions());
  } catch (error) {
    return [];
  }
}

// เติมช่องหัวใบให้อัตโนมัติถ้าหาเจอในข้อความ แต่ไม่ทับค่าที่ผู้ใช้พิมพ์เอง
function autofillBillingHead(text) {
  const found = detectBillingHead(text);
  const auto = state.clipboardBillingAuto;
  const apply = (input, key, value) => {
    if (!input || !value) return;
    const current = clean(input.value);
    if (current && current !== auto[key]) return;
    input.value = value;
    auto[key] = value;
  };
  apply(elements.clipboardBarNo, "bar", found.bar);
  apply(elements.clipboardDueDate, "dueDate", found.dueDate);
  apply(elements.clipboardExpectedTotal, "total", found.total);
}

// เทียบยอดรวมของแถวที่วาง กับ "ยอดเรียกเก็บ" หัวใบ — จับเคส copy มาไม่ครบ (คืน null = ไม่ได้กรอกยอดไว้ตรวจ)
function billingChecksum(text) {
  const expected = toNumeric(elements.clipboardExpectedTotal?.value);
  if (!(expected > 0)) return null;
  const rows = billingRowsFromText(text);
  const actual = rows.reduce((sum, row) => sum + toNumeric(row.amount), 0);
  const diff = Number((expected - actual).toFixed(2));
  return { expected, actual, rowCount: rows.length, diff, ok: Math.abs(diff) < 0.005 };
}

function billingChecksumMessage(check) {
  if (check.ok) return `ยอดครบ — ${number(check.rowCount)} รายการ รวม ${money(check.actual)} ตรงกับยอดเรียกเก็บ`;
  const side = check.diff > 0 ? "วางมาไม่ครบ" : "เกินยอดเรียกเก็บ";
  return `ยอดไม่ตรง (${side}) — ${number(check.rowCount)} รายการ รวม ${money(check.actual)} ต่างจากยอดเรียกเก็บ ${money(Math.abs(check.diff))}`;
}

function renderBillingChecksum(text) {
  const el = elements.clipboardChecksum;
  if (!el) return;
  const check = billingChecksum(text);
  if (!check) {
    el.textContent = "";
    el.className = "clipboard-checksum";
    return;
  }
  el.className = `clipboard-checksum ${check.ok ? "checksum-ok" : "checksum-warn"}`;
  el.textContent = billingChecksumMessage(check);
}

// ยอดไม่ตรง = เตือนแต่ไม่บล็อก (บางครั้งตั้งใจวางแค่บางส่วน) — คืน true = ไปต่อ
function confirmIfChecksumMismatch(text) {
  const check = billingChecksum(text);
  if (!check || check.ok) return true;
  return confirm([
    billingChecksumMessage(check),
    "",
    `ยอดเรียกเก็บที่กรอกไว้: ${money(check.expected)}`,
    `ยอดรวมจากข้อความที่วาง: ${money(check.actual)} (${number(check.rowCount)} รายการ)`,
    "",
    "กด OK เพื่อนำเข้าตามที่วางมา · Cancel เพื่อกลับไปวางใหม่ให้ครบ",
  ].join("\n"));
}

// พรีวิว BILLING NOTE: โชว์ record ที่ parser ประกอบเสร็จแล้ว ไม่ใช่บรรทัดดิบ —
// หน้าใบวางบิลลูกหนี้ copy มา 1 แถวเว็บแตกเป็น 3 บรรทัด (AR / ORW+INV / วันที่+ยอด)
// โชว์บรรทัดดิบดูเหมือนข้อมูลพังทั้งที่ import ถูก; ตารางนี้ = สิ่งที่จะถูก import จริง
function previewBillingRecords(text) {
  const records = billingRowsFromText(text);
  elements.confirmClipboardImport.disabled = !records.length;
  const total = records.reduce((sum, row) => sum + toNumeric(row.amount), 0);
  elements.clipboardSummary.textContent = records.length
    ? `${number(records.length)} รายการเครดิต · รวม ${money(total)}`
    : "No clipboard data yet";
  if (!records.length) {
    elements.clipboardPreviewHead.innerHTML = "";
    elements.clipboardPreviewBody.innerHTML = `<tr><td class="empty">No preview data</td></tr>`;
    return records;
  }
  const headers = ["ที่", "BAR", "เลขที่เครดิต (AR)", "ORW", "INV", "วันที่", "ยอดชำระ"];
  elements.clipboardPreviewHead.innerHTML = `<tr>${headers.map((h) => `<th>${h}</th>`).join("")}</tr>`;
  elements.clipboardPreviewBody.innerHTML = records.map((row, index) => (
    `<tr><td>${number(index + 1)}</td><td>${htmlEscape(row.bar)}</td><td>${htmlEscape(row.ar)}</td><td>${htmlEscape(row.orw)}</td><td>${htmlEscape(row.inv)}</td><td>${htmlEscape(row.dueDate)}</td><td>${money(toNumeric(row.amount))}</td></tr>`
  )).join("");
  return records;
}

function previewClipboardText(text) {
  if (state.activeClipboardKind === "billing") {
    autofillBillingHead(text);
    renderBillingChecksum(text);
    return previewBillingRecords(text);
  }
  const rows = clipboardTextToRows(text);
  // MLP: บอกจำนวนที่จะนำเข้าจริงหลังกรองเฉพาะ คลิกนิก เฮลท์ ให้เห็นก่อนกด Import
  const mlpImportable = state.activeClipboardKind === "mlp"
    ? rows.filter((row) => mlpCompanyImportable(row[3])).length
    : -1;
  elements.confirmClipboardImport.disabled = !rows.length || mlpImportable === 0;
  elements.clipboardSummary.textContent = rows.length
    ? `${number(rows.length)} rows, ${number(Math.max(...rows.map((row) => row.length)))} columns${mlpImportable >= 0 ? ` — จะนำเข้าเฉพาะ คลิกนิก เฮลท์ ${number(mlpImportable)} แถว` : ""}`
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

async function importClipboardText(kind, text) {
  const workbook = workbookFromClipboardText(text, `Clipboard ${kind}`);
  const sourceName = `clipboard-${kind}`;
  const parsed = kind === "clicknic" ? parseClicknicWorkbook(workbook, sourceName)
    : kind === "mlp" ? parseMlpWorkbook(workbook, sourceName)
      : parseBillingWorkbook(workbook, sourceName, billingImportOptions());

  // มีข้อมูลอยู่แล้ว = เพิ่มเข้าข้อมูลเดิมเสมอ (แถวซ้ำถูกตัดอัตโนมัติ ค่าที่แก้มือคงอยู่) — ไม่ถามโหมด
  const mode = state.bills.length ? "append" : "replace";
  const imported = { clicknicRows: kind === "clicknic" ? parsed : [], mlpRows: kind === "mlp" ? parsed : [], billingRows: kind === "billing" ? parsed : [] };
  const importStats = importStatsFor(
    mode === "append" ? { clicknic: state.clicknicRows, mlp: state.mlpRows, billing: state.billingRows } : { clicknic: [], mlp: [], billing: [] },
    imported,
  );
  if (mode === "append" && !(await confirmIfMostlyDuplicate(importStats))) {
    elements.statusText.textContent = "ยกเลิกการนำเข้า (ข้อมูลซ้ำกับของเดิมเป็นส่วนใหญ่)";
    return false;
  }

  if (mode === "append") {
    mergeImportedIntoState(imported);
  } else {
    state.activeSessionId = "";
    state.snapshotMode = false;
    state.restoredInfo = null;
    resetSourceMeta();
    if (kind === "clicknic") {
      state.clicknicRows = dedupeClicknicRows(parsed);
    } else if (kind === "mlp") {
      state.mlpRows = dedupeMlpRows(parsed);
    } else if (kind === "billing") {
      state.billingRows = parsed;
    }
  }

  if (parsed.length) updateSourceMeta(kind, [sourceName]);

  renderAll();
  scheduleAutosave(`clipboard-${kind}`);
  elements.statusText.textContent = `Imported ${clipboardKindLabel(kind)} from clipboard`;
  showImportResultModal(importStats, [`Clipboard — ${clipboardKindLabel(kind)}`], { sourceLabel: "นำเข้าจาก:" });
  return true;
}

// ช่องหัวใบโผล่เฉพาะ STEP 3 และล้างทุกครั้งที่เปิดโมดัล กันค่ารอบก่อนติดมากับใบใหม่
function resetClipboardBillingFields(kind) {
  const isBilling = kind === "billing";
  if (elements.clipboardBillingFields) elements.clipboardBillingFields.hidden = !isBilling;
  state.clipboardBillingAuto = { bar: "", dueDate: "", total: "" };
  [elements.clipboardBarNo, elements.clipboardDueDate, elements.clipboardExpectedTotal].forEach((input) => {
    if (input) input.value = "";
  });
  if (elements.clipboardChecksum) {
    elements.clipboardChecksum.textContent = "";
    elements.clipboardChecksum.className = "clipboard-checksum";
  }
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
  // BILLING NOTE รับข้อความทั้งหน้าใบวางบิลลูกหนี้ได้ (Ctrl+A ที่หน้า BAR แล้ว copy มาวาง)
  elements.clipboardPreview.placeholder = kind === "billing"
    ? "Ctrl+V — วางได้ทั้งตารางจาก Excel และทั้งหน้าใบวางบิลลูกหนี้ (Ctrl+A ที่หน้า BAR แล้ว copy) ระบบจะผูกเลข BAR ให้ทุกรายการเครดิตในหน้านั้นอัตโนมัติ"
    : "Ctrl+V here if the browser blocks automatic clipboard reading.";
  resetClipboardBillingFields(kind);
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

async function confirmClipboardImport() {
  try {
    const text = elements.clipboardPreview.value;
    const rows = previewClipboardText(text);
    if (!rows.length) throw new Error("Clipboard is empty");
    if (state.activeClipboardKind === "billing" && !confirmIfChecksumMismatch(text)) {
      elements.clipboardStatus.textContent = "ยกเลิกการนำเข้า (ยอดรวมไม่ตรงยอดเรียกเก็บ)";
      return;
    }
    const imported = await importClipboardText(state.activeClipboardKind, text);
    // ผู้ใช้ยกเลิกตอนเลือกโหมด: คง modal เดิมไว้ ไม่ทิ้งข้อความที่วางมา
    if (imported === false) return;
    closeClipboardImport();
  } catch (error) {
    console.error(error);
    elements.clipboardStatus.textContent = error.message || "Clipboard import failed";
  }
}

// รวมบิลสองเวอร์ชันแบบ "ข้อมูลมากที่สุด": ตัวใหม่ชนะเมื่อมีค่า ช่องว่าง/ศูนย์เติมจากตัวเก่า รายการยาเอาชุดที่ยาวกว่า
// บิลจาก session/รวมถัง (ไม่มี override): เติม medicines จาก text, ยืนยัน invariant สถานะ แล้วค่อยคำนวณ validation
function finalizeRestoredBill(bill) {
  const medicines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  const normalized = reconcileMedicineStatus({ ...bill, medicines });
  normalized.validationIssues = validationRulesForBill(normalized);
  return normalized;
}

function mergeBillRecords(newerBill, olderBill) {
  const merged = { ...olderBill, ...newerBill };
  Object.keys(merged).forEach((key) => {
    if (key === "profit" || key === "validationIssues") return;
    const newer = newerBill[key];
    const older = olderBill[key];
    if (Array.isArray(newer) || Array.isArray(older)) {
      const newerLen = Array.isArray(newer) ? newer.length : 0;
      const olderLen = Array.isArray(older) ? older.length : 0;
      merged[key] = newerLen >= olderLen ? (newer || []) : older;
      return;
    }
    const newerEmpty = newer === undefined || newer === null || newer === "" || newer === 0;
    const olderHasValue = older !== undefined && older !== null && older !== "" && older !== 0;
    if (newerEmpty && olderHasValue) merged[key] = older;
  });
  if (merged.medicines?.length) {
    merged.medicineCount = merged.medicines.length;
    if (!clean(merged.medicinesText)) {
      merged.medicinesText = merged.medicines.map((item) => `${item.medicine} x${number(item.qty)}`).join(", ");
    }
  }
  // รวมบิลข้ามถัง: ฝั่งใหม่อาจสถานะ mlp-only (ยังไม่เจอยา) ฝั่งเก่ามีรายการยา → status ต้องไม่ค้าง "ไม่พบรายการยา"
  reconcileMedicineStatus(merged);
  merged.profit = toNumeric(merged.sale) - toNumeric(merged.cost) - toNumeric(merged.mlpCost);
  return merged;
}

// รวม override สองชุด: ตัวใหม่ชนะรายฟิลด์ ฟิลด์ที่อีกฝั่งเคยแก้ไว้ไม่หาย
function mergeOverrideMaps(newerMap, olderMap) {
  const merged = { ...(olderMap || {}) };
  Object.entries(newerMap || {}).forEach(([key, override]) => {
    const older = merged[key];
    merged[key] = older
      ? { ...older, ...override, values: { ...(older.values || {}), ...(override.values || {}) } }
      : override;
  });
  return merged;
}

// นับความ "แน่น" ของข้อมูลบิล ไว้เลือกบิลหลักตอนรวมมือ — ฟิลด์ที่มีค่า +1, รายการยานับตามจำนวนบรรทัด
function billRichness(bill) {
  let score = bill.medicines?.length || 0;
  Object.entries(bill).forEach(([key, value]) => {
    if (key === "billKey" || key === "status" || key === "profit" || key === "validationIssues") return;
    if (Array.isArray(value)) {
      if (value.length) score += 1;
      return;
    }
    if (value !== undefined && value !== null && value !== "" && value !== 0 && value !== false) score += 1;
  });
  return score;
}

// รวมบิลหลายใบที่ผู้ใช้สั่งรวมเอง — ตัวแรกใน members คือบิลหลัก (ชนะรายฟิลด์) ที่เหลือเติมช่องว่าง
function mergeManualBillGroup(members) {
  const merged = members.slice(1).reduce((acc, bill) => mergeBillRecords(acc, bill), { ...members[0] });
  merged.billKey = members[0].billKey;
  // ประเภทเคส: unknown ถือว่าว่าง — เอาของสมาชิกที่รู้ประเภทมาแทน และค่าที่แก้มือไว้ชนะเสมอ
  if ((merged.caseType || "unknown") === "unknown") {
    const known = members.find((bill) => bill.caseType && bill.caseType !== "unknown");
    if (known) {
      merged.caseType = known.caseType;
      merged.caseTypeSource = known.caseTypeSource;
    }
  }
  const manualCase = members.find((bill) => bill.caseTypeSource === "manual");
  if (manualCase) {
    merged.caseType = manualCase.caseType;
    merged.caseTypeSource = "manual";
  }
  // มีข้อมูลครบทั้งฝั่ง CLICKNIC และ MLP แล้ว → ถือว่าจับคู่ได้
  const hasClick = (merged.medicines?.length || 0) > 0 || toNumeric(merged.sale) > 0 || Boolean(clean(merged.clicknicDate));
  const hasMlp = Boolean(clean(merged.mlpDate)) || toNumeric(merged.mlpCost) > 0 || Boolean(clean(merged.orw)) || Boolean(clean(merged.invoice));
  if (hasClick && hasMlp) {
    merged.status = state.billingRows.length && toNumeric(merged.billedAmount) <= 0 && !clean(merged.billingNo)
      ? "pending-billing"
      : "matched";
  }
  const manualStage = members.find((bill) => bill.billingStageSource === "manual");
  if (manualStage) {
    merged.billingStage = manualStage.billingStage;
    merged.billingStageSource = "manual";
  } else {
    const stage = deriveBillingStage(merged.status, merged.caseType || "unknown", merged.barNo, merged.creditNos);
    merged.billingStage = stage.billingStage;
    merged.billingStageSource = stage.billingStageSource;
  }
  merged.profit = toNumeric(merged.sale) - toNumeric(merged.cost) - toNumeric(merged.mlpCost);
  merged.validationIssues = validationRulesForBill(merged);
  return merged;
}

// ใช้กลุ่มรวมบิลที่ผู้ใช้สั่งไว้กับ state.bills — ต้องเรียกซ้ำหลัง buildBills เพราะบิลถูกสร้างใหม่จาก
// source rows ทุกครั้ง เรียกซ้ำได้ปลอดภัย (กลุ่มที่รวมไปแล้ว/สมาชิกหายเหลือใบเดียวจะถูกข้าม)
function applyManualMergeGroups() {
  (state.billMergeGroups || []).forEach((group) => {
    const byKey = new Map(state.bills.map((bill) => [bill.billKey, bill]));
    const members = (group.memberKeys || []).map((key) => byKey.get(key)).filter(Boolean);
    if (members.length < 2) return;
    const merged = mergeManualBillGroup(members);
    const memberSet = new Set(group.memberKeys);
    const index = state.bills.findIndex((bill) => memberSet.has(bill.billKey));
    const remaining = state.bills.filter((bill) => !memberSet.has(bill.billKey));
    remaining.splice(index, 0, merged);
    state.bills = remaining;
  });
}

// กลุ่มยังรวมอยู่ไหม — ใช้ตัดสินว่าจะโชว์ปุ่ม "เลิกรวม" ในแถวประวัติหรือไม่ (เลิกรวมไปแล้ว = ไม่ต้องโชว์)
function mergeGroupExists(groupId) {
  return Boolean(groupId) && (state.billMergeGroups || []).some((group) => group.id === groupId);
}

// ตัดบิลที่ผู้ใช้สั่งลบออกจากจอ — เก็บเป็นรายการคีย์เพราะบิลถูกสร้างใหม่จาก source rows ทุกครั้ง
function applyDeletedBills() {
  if (!state.deletedBillKeys?.length) return;
  const deleted = new Set(state.deletedBillKeys);
  state.bills = state.bills.filter((bill) => !deleted.has(bill.billKey));
}

// รับรายการคีย์ที่ถูกลบจาก session อื่นเข้ามารวม (กันซ้ำ)
function mergeDeletedBillKeysInto(keys) {
  const known = new Set(state.deletedBillKeys || []);
  (keys || []).forEach((key) => {
    if (!key || known.has(key)) return;
    known.add(key);
    state.deletedBillKeys.push(key);
  });
}

// ลบบิลที่ติ๊กเลือกออกจากงานบนจอ — ต้นฉบับใน session/ไฟล์เดิมไม่ถูกแก้
function deleteSelectedBills() {
  const members = state.bills.filter((bill) => state.selectedBillKeys.has(bill.billKey));
  if (!members.length) return;
  const label = (bill) => [bill.orderId || bill.orw || bill.billingNo || "(ไม่มีเลขที่)", bill.patient]
    .map(clean).filter(Boolean).join(" · ");
  const ok = confirm([
    `ลบ ${number(members.length)} บิลออกจากงานบนจอ?`,
    "",
    ...members.slice(0, 10).map((bill) => `- ${label(bill)}`),
    ...(members.length > 10 ? [`... และอีก ${number(members.length - 10)} บิล`] : []),
    "",
    "บิลที่ลบจะหายจากตาราง/ยอดรวม/autosave ของงานนี้ และไม่กลับมาแม้แก้ค่าอื่นต่อ (ต้นฉบับใน session/ไฟล์เดิมไม่ถูกแก้ — เริ่มใหม่จากไฟล์/โหลด session เดิมจะได้คืน)",
  ].join("\n"));
  if (!ok) return;
  mergeDeletedBillKeysInto(members.map((bill) => bill.billKey));
  state.selectedBillKeys.clear();
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "delete_bills",
    createdAt: new Date().toISOString(),
    orderId: members[0].orderId || "",
    orw: members[0].orw || "",
    invoice: members[0].invoice || "",
    date: "",
    lineCount: 0,
    totalSale: 0,
    totalCost: 0,
    screenshotName: "bulk-bar",
    replacedLineCount: 0,
    note: `ลบบิล ${number(members.length)} ใบ: ${members.slice(0, 5).map(label).join(", ")}${members.length > 5 ? " ..." : ""}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("delete-bills");
  elements.statusText.textContent = `ลบ ${number(members.length)} บิลออกจากงานบนจอแล้ว`;
}

// รับรายการคู่แนะนำที่ถูกซ่อนจาก session อื่นเข้ามาต่อท้าย (กันซ้ำด้วย pairKey)
function mergeDismissedSuggestionsInto(list) {
  if (!Array.isArray(list)) return;
  state.dismissedSuggestions = state.dismissedSuggestions || [];
  const known = new Set(state.dismissedSuggestions.map((entry) => entry.pairKey));
  list.forEach((entry) => {
    if (!entry?.pairKey || known.has(entry.pairKey)) return;
    known.add(entry.pairKey);
    state.dismissedSuggestions.push(entry);
  });
}

// รับกลุ่มรวมบิลจาก session อื่นเข้ามาต่อท้าย (กันซ้ำด้วย id)
function mergeBillMergeGroupsInto(groups) {
  const known = new Set((state.billMergeGroups || []).map((group) => group.id));
  (groups || []).forEach((group) => {
    if (!group || !Array.isArray(group.memberKeys) || known.has(group.id)) return;
    known.add(group.id);
    state.billMergeGroups.push(group);
  });
}

// รวมบิลที่ติ๊กเลือกเป็นบิลเดียวแบบ "ข้อมูลมากที่สุด" — บิลที่ข้อมูลเยอะสุดเป็นบิลหลัก
// skipConfirm = ข้าม confirm (ใช้จากป๊อปอัพเทียบที่มีคอลัมน์ "ผลรวม" ให้ดูก่อนแล้ว) — มีปุ่มเลิกรวมกันพลาด
function mergeSelectedBills(skipConfirm = false) {
  const members = state.bills.filter((bill) => state.selectedBillKeys.has(bill.billKey));
  if (members.length < 2) return;
  const ordered = [...members].sort((a, b) => billRichness(b) - billRichness(a));
  const label = (bill) => [bill.orderId || bill.orw || bill.billingNo || "(ไม่มีเลขที่)", bill.patient]
    .map(clean).filter(Boolean).join(" · ");
  if (!skipConfirm) {
    const ok = confirm([
      `รวม ${number(ordered.length)} บิลเป็นบิลเดียว?`,
      "",
      `บิลหลัก (ข้อมูลเยอะสุด): ${label(ordered[0])}`,
      `รวมกับ:`,
      ...ordered.slice(1).map((bill) => `- ${label(bill)}`),
      "",
      "กติกา: บิลหลักชนะรายฟิลด์ ช่องว่าง/ศูนย์เติมจากบิลอื่น รายการยาเอาชุดที่ยาวกว่า (ข้อมูลใน session/ไฟล์ต้นทางไม่ถูกแก้)",
    ].join("\n"));
    if (!ok) return;
  }
  // สำเนาบิลต้นฉบับก่อนรวม — เก็บไว้ "ในตัวกลุ่ม" ไม่ใช่ใน closure ของ toast
  // กลุ่มถูกเซฟลง session (payload.billMergeGroups) → เลิกรวมได้ข้ามวัน/ข้ามเครื่อง แม้ในโหมด snapshot ที่ rebuild ไม่สร้างบิลใหม่จาก source
  // ตัด validationIssues ทิ้ง: ฟิลด์ยาวสุดและถูกคำนวณใหม่ทุก rebuild อยู่แล้ว เก็บไปก็โดนทับ
  const originalMembers = ordered.map(({ validationIssues, ...bill }) => bill);
  const groupId = `merge-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  state.billMergeGroups.push({
    id: groupId,
    memberKeys: ordered.map((bill) => bill.billKey),
    members: originalMembers,
    createdAt: new Date().toISOString(),
  });
  state.selectedBillKeys.clear();
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "merge_bills",
    createdAt: new Date().toISOString(),
    orderId: ordered[0].orderId || "",
    orw: ordered[0].orw || "",
    invoice: ordered[0].invoice || "",
    date: "",
    lineCount: 0,
    totalSale: 0,
    totalCost: 0,
    screenshotName: skipConfirm ? "compare-popup" : "bulk-bar",
    replacedLineCount: 0,
    note: `รวมบิล ${number(ordered.length)} ใบ → ${label(ordered[0])}`,
    medicines: [],
    // ผูกแถวประวัติกับกลุ่ม → ปุ่ม "เลิกรวม" ในประวัติหาเจอแม้ toast หายไปนานแล้ว
    mergeGroupId: groupId,
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("merge-bills");
  elements.statusText.textContent = `รวม ${number(ordered.length)} บิลเป็นบิลเดียว: ${label(ordered[0])}`;
  showUndoToast(`รวม ${number(ordered.length)} บิลเป็นบิลเดียวแล้ว`, () => unmergeGroup(groupId));
  return ordered[0].billKey; // คีย์บิลที่รวมแล้ว (บิลหลัก) — ให้ผู้เรียกเปิด drawer แก้ต่อได้
}

// เลิกรวมบิล — อ่านสำเนาสมาชิกจากตัวกลุ่ม (ไม่ใช่ closure ของ toast) → เรียกจากที่ไหนเมื่อไหร่ก็ได้
// คืนบิลต้นฉบับของกลุ่มกลับเข้า state.bills ที่ตำแหน่งเดิม — ใช้ร่วมทั้งเลิกรวมทีละกลุ่มและทั้งชุด
// คืนอาร์เรย์สมาชิกที่คืนได้ (ว่าง = กลุ่มเก่าที่ไม่มีสำเนา)
function restoreMergeGroupBills(group) {
  const originalMembers = (group?.members || []).map((bill) => ({ ...bill }));
  if (!originalMembers.length) return [];
  // ตัดทั้งบิลที่รวมแล้วและสมาชิกที่อาจค้างอยู่ออกก่อน แล้วแทรกต้นฉบับกลับที่ตำแหน่งเดิม
  const memberKeys = new Set(originalMembers.map((bill) => bill.billKey));
  const idx = state.bills.findIndex((bill) => memberKeys.has(bill.billKey));
  const rest = state.bills.filter((bill) => !memberKeys.has(bill.billKey));
  if (idx >= 0) rest.splice(idx, 0, ...originalMembers);
  else rest.push(...originalMembers);
  state.bills = rest;
  return originalMembers;
}

const NO_MEMBERS_COPY_MSG = "ถูกรวมไว้ก่อนระบบเก็บสำเนาสมาชิก — เลิกรวมได้เฉพาะตอนโหลดไฟล์ต้นทาง (STEP 1-3) เข้ามาก่อน แล้วลองใหม่";

function unmergeGroup(groupId) {
  const group = (state.billMergeGroups || []).find((item) => item.id === groupId);
  if (!group) return false;
  // กลุ่มที่บันทึกไว้ก่อนระบบเก็บสำเนา — โหมด snapshot ไม่มี source ให้สร้างบิลใหม่ = กู้ไม่ได้ บอกไปตรง ๆ ดีกว่าลบกลุ่มทิ้งแล้วบิลหาย
  if (!(group.members || []).length && state.snapshotMode) {
    alert(`กลุ่มนี้${NO_MEMBERS_COPY_MSG}`);
    return false;
  }
  state.billMergeGroups = (state.billMergeGroups || []).filter((item) => item.id !== groupId);
  const originalMembers = restoreMergeGroupBills(group);
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "unmerge_bills",
    createdAt: new Date().toISOString(),
    orderId: originalMembers[0]?.orderId || "",
    orw: originalMembers[0]?.orw || "",
    invoice: "",
    date: "",
    lineCount: 0,
    totalSale: 0,
    totalCost: 0,
    screenshotName: "undo-toast",
    replacedLineCount: 0,
    note: `เลิกรวม ${number(originalMembers.length)} บิล`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("unmerge-bills");
  elements.statusText.textContent = `เลิกรวม ${number(originalMembers.length)} บิลแล้ว`;
  return true;
}

// กลุ่มทั้งหมดที่เกิดจากการกดรวมแบบ bulk ครั้งเดียวกัน ใช้ batchId ร่วมกัน
function mergeGroupsOfBatch(batchId) {
  if (!batchId) return [];
  return (state.billMergeGroups || []).filter((group) => group.batchId === batchId);
}

function mergeBatchExists(batchId) {
  return mergeGroupsOfBatch(batchId).length > 0;
}

// เลิกรวมทั้งชุดที่กดครั้งเดียว — audit แถวเดียว + rebuild ครั้งเดียว
// (วนเรียก unmergeGroup ทีละกลุ่มจะได้ประวัติ 129 แถวและ rebuild 129 รอบ)
function unmergeBatch(batchId) {
  const groups = mergeGroupsOfBatch(batchId);
  if (!groups.length) return false;
  // ชุดเก่าที่ไม่มีสำเนา — เงื่อนไขเดียวกับรายกลุ่ม: โหมด snapshot กู้ไม่ได้ ห้ามลบกลุ่มทิ้ง
  if (groups.some((group) => !(group.members || []).length) && state.snapshotMode) {
    alert(`ชุดนี้${NO_MEMBERS_COPY_MSG}`);
    return false;
  }
  const ids = new Set(groups.map((group) => group.id));
  state.billMergeGroups = (state.billMergeGroups || []).filter((group) => !ids.has(group.id));
  let billCount = 0;
  groups.forEach((group) => { billCount += restoreMergeGroupBills(group).length; });
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "unmerge_bills",
    createdAt: new Date().toISOString(),
    orderId: "",
    orw: "",
    invoice: "",
    date: "",
    lineCount: 0,
    totalSale: 0,
    totalCost: 0,
    screenshotName: "unmerge-batch",
    replacedLineCount: 0,
    note: `เลิกรวมทั้งชุด ${number(groups.length)} กลุ่ม · ${number(billCount)} บิล`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("unmerge-batch");
  elements.statusText.textContent = `เลิกรวมทั้งชุดแล้ว — คืนมา ${number(billCount)} บิล`;
  if (elements.mergeWarnModal?.open) renderMergeWarnBody();
  return true;
}

// toast แจ้งเตือนมุมล่าง — สร้าง element ครั้งเดียว, ซ่อนอัตโนมัติ; actionLabel = ปุ่มลัดเสริม (เช่น "เลิกรวม")
let ckncToastTimer = null;
function showToast(message, { actionLabel = "", onAction = null, duration = 9000 } = {}) {
  let toast = document.getElementById("ckncUndoToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "ckncUndoToast";
    toast.className = "cknc-undo-toast";
    document.body.appendChild(toast);
  }
  const actionHtml = actionLabel
    ? `<button type="button" class="cknc-undo-btn" data-toast-action>${htmlEscape(actionLabel)}</button>`
    : "";
  toast.innerHTML = `<span class="cknc-undo-msg">${htmlEscape(message)}</span>${actionHtml}<button type="button" class="cknc-undo-close" data-toast-close aria-label="ปิด">×</button>`;
  toast.hidden = false;
  clearTimeout(ckncToastTimer);
  const hide = () => { toast.hidden = true; };
  ckncToastTimer = setTimeout(hide, duration);
  const actionBtn = toast.querySelector("[data-toast-action]");
  if (actionBtn) actionBtn.onclick = () => { hide(); onAction?.(); };
  toast.querySelector("[data-toast-close]").onclick = hide;
}

function showUndoToast(message, onUndo) {
  showToast(message, { actionLabel: "เลิกรวม", onAction: onUndo });
}

// ---- ระบบแนะนำคู่บิลที่น่าจะรวมกัน (merge suggestions) --------------------
// คีย์ชื่อผู้รับบริการแบบ normalize: ตัดคำนำหน้า/ช่องว่าง เทียบกันได้ตรง ๆ
function normalizedPatientKey(name) {
  return clean(name).toLowerCase()
    .replace(/^(คุณ|นาย|นางสาว|นาง|ดช\.?|ดญ\.?|เด็กชาย|เด็กหญิง|บริษัท)\s*/g, "")
    .replace(/\s+/g, "");
}

// คีย์ตัวตนลูกค้า: เบอร์โทรก่อน (แม่นสุด) ไม่มีเบอร์ค่อย fallback ชื่อ normalize ที่ยาวพอ; ระบุตัวไม่ได้ = ""
// คำวินิจฉัยผูกกับบิล (1 เลขที่ออเดอร์ = 1 บิล = 1 Dx) เก็บใน override.values.diagnosis
// → ไหลเข้า session / export / merge เองผ่าน applyBillOverride ไม่ต้องเก็บ state แยก
// ห้ามใช้ override.note เก็บ เพราะการแก้ inline เขียนทับ note เสมอ
function billDiagnosis(bill) {
  return clean(bill?.diagnosis);
}

function customerIdentityKey(bill) {
  const phone = clean(bill.phone).replace(/\D/g, "");
  if (phone.length >= 9) return `phone:${phone}`;
  const name = normalizedPatientKey(bill.patient);
  if (name.length > 3) return `name:${name}`;
  return "";
}

// จัดบิลของลูกค้าคนหนึ่งเป็น "การมาแต่ละครั้ง" — union-find: เลขที่ออเดอร์เดียวกัน = ครั้งเดียวกัน
// (แม้วัน CKNC/MLP ต่างกัน) และวันเดียวกัน = ครั้งเดียวกัน (บิล CKNC/MLP ของการมาครั้งเดียวที่ถูกแยกเป็นคนละใบ)
// คืน visit เรียงตามวันที่ ครั้งแรกก่อน: { key, date, bills }
function groupBillsIntoVisits(bills) {
  const parent = bills.map((_, index) => index);
  const find = (index) => {
    while (parent[index] !== index) {
      parent[index] = parent[parent[index]];
      index = parent[index];
    }
    return index;
  };
  const union = (a, b) => {
    const rootA = find(a);
    const rootB = find(b);
    if (rootA !== rootB) parent[rootB] = rootA;
  };
  const byOrder = new Map();
  const byDate = new Map();
  bills.forEach((bill, index) => {
    const orderId = clean(bill.orderId).toUpperCase();
    if (orderId) {
      if (byOrder.has(orderId)) union(byOrder.get(orderId), index);
      else byOrder.set(orderId, index);
    }
    const date = dateKey(primaryBillDate(bill));
    if (date) {
      if (byDate.has(date)) union(byDate.get(date), index);
      else byDate.set(date, index);
    }
  });
  const visits = new Map();
  bills.forEach((bill, index) => {
    const root = find(index);
    const visit = visits.get(root) || { key: "", date: "", bills: [] };
    visit.bills.push(bill);
    const date = dateKey(primaryBillDate(bill));
    if (date && (!visit.date || date < visit.date)) visit.date = date;
    visits.set(root, visit);
  });
  return [...visits.values()]
    .sort((a, b) => (a.date || "9999").localeCompare(b.date || "9999"))
    .map((visit) => ({
      ...visit,
      key: clean(visit.bills[0].orderId) ? `ord:${clean(visit.bills[0].orderId).toUpperCase()}` : `date:${visit.date || visit.bills[0].billKey}`,
    }));
}

function daysBetween(fromDate, toDate) {
  const from = new Date(`${fromDate}T00:00:00`);
  const to = new Date(`${toDate}T00:00:00`);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime())) return 0;
  return Math.round((to - from) / 86400000);
}

// ชุดคีย์ชื่อยาของบิล — ใช้เทียบยาซ้ำกับการมาครั้งก่อน
function medicineKeySet(bills) {
  const keys = new Set();
  bills.forEach((bill) => {
    (bill.medicines || []).forEach((line) => {
      const key = normalizeMedicineKey(line.medicine);
      if (key && key !== "-") keys.add(key);
    });
  });
  return keys;
}

function medicineLabelFor(bills, medKey) {
  for (const bill of bills) {
    const line = (bill.medicines || []).find((item) => normalizeMedicineKey(item.medicine) === medKey);
    if (line) return clean(line.medicine);
  }
  return medKey;
}

// นับรอบการมาของลูกค้า + ระยะห่างจากครั้งก่อน แล้วเติม issue "มาซ้ำเร็ว / ยาซ้ำ" เข้าผลตรวจสอบ
// ติดค่า customerKey / customerVisitCount / customerVisitIndex / visitKey / visitGapDays / visitRepeatMeds ให้ทุกบิล
function annotateCustomerVisits(bills) {
  const groups = new Map();
  bills.forEach((bill) => {
    bill.customerKey = "";
    bill.customerVisitCount = 0;
    bill.customerVisitIndex = 0;
    bill.visitKey = "";
    bill.visitGapDays = 0;
    bill.visitRepeatMeds = [];
    if (bill.excluded) return;
    const key = customerIdentityKey(bill);
    if (!key) return;
    bill.customerKey = key;
    const arr = groups.get(key) || [];
    arr.push(bill);
    groups.set(key, arr);
  });
  const warnDays = repeatVisitWarnDays();
  groups.forEach((arr) => {
    const visits = groupBillsIntoVisits(arr);
    visits.forEach((visit, index) => {
      const previous = index > 0 ? visits[index - 1] : null;
      const gap = previous && previous.date && visit.date ? daysBetween(previous.date, visit.date) : 0;
      const previousMeds = previous ? medicineKeySet(previous.bills) : new Set();
      const repeatMeds = previous
        ? [...medicineKeySet(visit.bills)].filter((key) => previousMeds.has(key)).map((key) => medicineLabelFor(visit.bills, key))
        : [];
      visit.bills.forEach((bill) => {
        bill.customerVisitCount = visits.length;
        bill.customerVisitIndex = index + 1;
        bill.visitKey = visit.key;
        bill.visitGapDays = gap;
        bill.visitRepeatMeds = repeatMeds;
        if (!Array.isArray(bill.validationIssues)) return;
        if (warnDays > 0 && index > 0 && gap > 0 && gap <= warnDays) {
          pushIssue(bill.validationIssues, "warn", "REPEAT_SOON", `มาซ้ำใน ${number(gap)} วัน (ครั้งก่อน ${formatDisplayDate(previous.date)})`);
        }
        if (index > 0 && repeatMeds.length) {
          pushIssue(bill.validationIssues, "info", "REPEAT_SAME_MED", `ยาซ้ำกับครั้งก่อน: ${repeatMeds.slice(0, 3).join(", ")}${repeatMeds.length > 3 ? " ..." : ""}`);
        }
      });
    });
  });
}

// จำนวน "ลูกค้า" (ไม่ใช่บิล) ที่มารับบริการหลายครั้ง ภายในชุดที่กรองช่วงวันอยู่ — ตรงกับ chip/บรรทัดสรุป
function repeatCustomerCount() {
  const keys = new Set();
  dateFilteredBills().forEach((bill) => {
    if (!bill.excluded && bill.customerKey && bill.customerVisitCount >= 2) keys.add(bill.customerKey);
  });
  return keys.size;
}

// เลข ORW ทั้งหมดของบิล (จากช่อง orw และเลขที่ออเดอร์ที่เป็นรูปแบบ ORW)
function billOrwRefs(bill) {
  const refs = new Set();
  clean(bill.orw).split(",").map(clean).filter(Boolean).forEach((ref) => refs.add(ref.toUpperCase()));
  if (/^ORW-/i.test(clean(bill.orderId))) refs.add(clean(bill.orderId).toUpperCase());
  return refs;
}

// normalize เลขอ้างอิง (BAR/AR) — ตัดช่องว่าง, พิมพ์ใหญ่, เรียงหลายเลขให้เทียบได้
function normRef(value) {
  return clean(value).toUpperCase().split(/[,\s/]+/).filter(Boolean).sort().join(",");
}

// ให้คะแนนความคล้ายของบิลคู่หนึ่ง (0-99%) พร้อมเหตุผลที่ตรงกัน
function mergeSimilarity(a, b) {
  let score = 0;
  const reasons = [];
  const orwA = billOrwRefs(a);
  const orwB = billOrwRefs(b);
  if ([...orwA].some((ref) => orwB.has(ref))) {
    score += 45;
    reasons.push("ORW เดียวกัน");
  }
  // ใบวางบิล (BAR) / เลขเครดิต (AR) ตรงกัน = สัญญาณแรงมาก (เลขบิลจริงตรงกัน)
  const barA = normRef(a.barNo), barB = normRef(b.barNo);
  if (barA && barA === barB) {
    score += 15;
    reasons.push("ใบวางบิล (BAR) ตรงกัน");
  }
  const arA = normRef(a.creditNos), arB = normRef(b.creditNos);
  if (arA && arA === arB) {
    score += 15;
    reasons.push("เลขเครดิต (AR) ตรงกัน");
  }
  const nameA = normalizedPatientKey(a.patient);
  const nameB = normalizedPatientKey(b.patient);
  if (nameA && nameA === nameB) {
    score += 25;
    reasons.push("ชื่อผู้รับบริการตรงกัน");
  }
  if (clean(a.phone) && clean(a.phone) === clean(b.phone)) {
    score += 20;
    reasons.push("เบอร์โทรตรงกัน");
  }
  const dateA = dateKey(a.clicknicDate || a.mlpDate);
  const dateB = dateKey(b.clicknicDate || b.mlpDate);
  if (dateA && dateA === dateB) {
    score += 10;
    reasons.push("วันที่ตรงกัน");
  }
  const complementary = (a.status === "clicknic-only" && b.status === "mlp-only")
    || (a.status === "mlp-only" && b.status === "clicknic-only");
  if (complementary) {
    score += 15;
    reasons.push("ข้อมูลคนละฝั่งเติมกันพอดี (CKNC ↔ MLP)");
  }
  // ใบวางบิลไม่เจอ MLP ↔ บิลฝั่งยา/ออเดอร์ (ORW เดียวกัน) = คนละครึ่งของบิลเดียว → ดันให้ทะลุ threshold
  // (billing-only ไม่มีชื่อ/เบอร์/วันที่ให้บวกคะแนน สัญญาณเดียวคือ ORW=45 ยังไม่ถึง 50)
  const billingComplement = ((a.status === "billing-only") !== (b.status === "billing-only"))
    && [...orwA].some((ref) => orwB.has(ref));
  if (billingComplement) {
    score += 25;
    reasons.push("ใบวางบิลไม่เจอ MLP ↔ ORW ฝั่งยาตรงกัน");
  }
  if (toNumeric(a.sale) > 0 && Math.abs(toNumeric(a.sale) - toNumeric(b.sale)) < 0.005) {
    score += 10;
    reasons.push("ยอดขายเท่ากัน");
  }
  return { score: Math.min(score, 99), reasons };
}

function mergeSuggestBillLabel(bill) {
  return [clean(bill.patient) || "(ไม่มีชื่อ)", clean(bill.orderId) || clean(bill.orw.split(",")[0]) || ""]
    .filter(Boolean).join(" · ");
}

// กลุ่มบิลที่ "แน่นอนว่าซ้ำ" — ORW + ใบวางบิล(BAR) + เครดิต(AR) ตรงกันครบ (เลขบิลจริงตรงหมด)
function certainMergeGroups() {
  const bills = state.bills.filter((bill) => !bill.excluded);
  if (bills.length < 2) return [];
  const buckets = new Map();
  bills.forEach((bill) => {
    const bar = normRef(bill.barNo);
    const ar = normRef(bill.creditNos);
    const orws = billOrwRefs(bill);
    if (!bar || !ar || !orws.size) return; // ต้องมีครบทั้ง ORW/BAR/AR
    orws.forEach((orw) => {
      const key = `${orw}|${bar}|${ar}`;
      const arr = buckets.get(key) || [];
      if (!arr.includes(bill)) arr.push(bill);
      buckets.set(key, arr);
    });
  });
  return [...buckets.values()].filter((arr) => arr.length >= 2);
}

// รวมหลายกลุ่มรวดเดียว — ยืนยันครั้งเดียว + undo ได้ (ใช้ร่วมทั้ง "รวมที่แน่นอน" และ "รวมคู่ ORW")
function bulkMergeGroups(groups, { confirmTitle, doneLabel, emptyMsg, auditTag }) {
  if (!groups.length) { showToast(emptyMsg); return; }
  const totalBills = groups.reduce((sum, g) => sum + g.length, 0);
  const ok = confirm([
    confirmTitle,
    "",
    `${number(groups.length)} กลุ่ม · ${number(totalBills)} บิล → ${number(groups.length)} บิล`,
    "",
    "แต่ละกลุ่มเก็บบิลข้อมูลเยอะสุดเป็นหลัก ที่เหลือรวมเข้า · กด \"เลิกรวม\" ในแถบแจ้งเตือนเพื่อยกเลิกได้",
  ].join("\n"));
  if (!ok) return;
  // ทุกกลุ่มที่เกิดจากการกดครั้งนี้ใช้ batchId ร่วมกัน → เลิกรวมทั้งชุดทีเดียวได้จากประวัติ
  const batchId = `batch-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
  const createdAt = new Date().toISOString();
  groups.forEach((members, groupIndex) => {
    const ordered = [...members].sort((a, b) => billRichness(b) - billRichness(a));
    // ใส่ลำดับในชุดด้วย — รวมทีเดียว 129 กลุ่มจะเกิดใน ms เดียวกันหมด สุ่ม 6 หลักอย่างเดียวมีโอกาสชนกันเงียบ ๆ
    const groupId = `merge-${Date.now()}-${groupIndex}-${Math.random().toString(16).slice(2, 8)}`;
    state.billMergeGroups.push({
      id: groupId,
      memberKeys: ordered.map((bill) => bill.billKey),
      // สำเนาอยู่ในตัวกลุ่ม ไม่ใช่ closure ของ toast → เลิกรวมได้ข้ามวัน/ข้ามเครื่อง เหมือนการรวมทีละคู่
      // ตัด validationIssues ทิ้ง: ถูกคำนวณใหม่ทุก rebuild อยู่แล้ว และเป็นฟิลด์ที่ยาวสุด (สำคัญมากตอนรวมทีละ 129 กลุ่ม)
      members: ordered.map(({ validationIssues, ...bill }) => bill),
      batchId,
      createdAt,
    });
  });
  state.auditTrail.unshift({
    id: makeAuditId(), action: "merge_bills", createdAt: new Date().toISOString(),
    orderId: "", orw: "", invoice: "", date: "", lineCount: 0, totalSale: 0, totalCost: 0,
    screenshotName: auditTag, replacedLineCount: 0,
    note: `${doneLabel} ${number(groups.length)} กลุ่ม · ${number(totalBills)} บิล`,
    medicines: [],
    // ผูกแถวประวัติกับชุด → ปุ่ม "เลิกรวมทั้งชุด" หาเจอแม้ toast หายไปนานแล้ว
    mergeBatchId: batchId,
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("bulk-merge");
  elements.statusText.textContent = `${doneLabel} ${number(groups.length)} กลุ่มแล้ว`;
  if (elements.mergeWarnModal?.open) {
    if (warnTotalCount() === 0) elements.mergeWarnModal.close();
    else renderMergeWarnBody();
  }
  // toast ใช้เส้นทางเดียวกับปุ่มในประวัติ — ไม่มีสำเนาซ้อนใน closure อีกแล้ว
  showUndoToast(`${doneLabel} ${number(groups.length)} กลุ่ม (${number(totalBills)} บิล) แล้ว`, () => unmergeBatch(batchId));
}

// รวมทุกกลุ่มที่แน่นอน (ORW+BAR+AR ตรง) รวดเดียว
function mergeCertainGroups() {
  bulkMergeGroups(certainMergeGroups(), {
    confirmTitle: "รวมบิลที่แน่นอนว่าซ้ำ (ORW + ใบวางบิล BAR + เครดิต AR ตรงกันครบ)?",
    doneLabel: "รวมบิลแน่นอน (ORW+BAR+AR)",
    emptyMsg: "ไม่พบคู่บิลที่ ORW + BAR + AR ตรงกันครบ",
    auditTag: "certain-merge",
  });
}

// รวมทุกคู่ ORW ที่เป็น "ใบวางบิลไม่เจอ MLP ↔ บิลฝั่งยา" รวดเดียว
function mergeOrwComplementGroups() {
  bulkMergeGroups(orwComplementGroups(), {
    confirmTitle: "รวมคู่บิลที่ ORW ตรงกันแต่จับคู่ยังไม่ครบ (ใบวางบิล↔ยา, ไม่มี MLP↔ไม่พบยา) ทั้งหมด?",
    doneLabel: "รวมคู่ ORW",
    emptyMsg: "ไม่พบคู่ ORW ที่จับคู่ยังไม่ครบ",
    auditTag: "orw-complement-merge",
  });
}

// หา "คู่ที่น่าจะเป็นบิลเดียวกัน" — จับกลุ่มจากสัญญาณแรง (ORW/เบอร์/ชื่อ) ก่อน แล้วค่อยให้คะแนนรายคู่
// แบ่งหน้ารายการคู่ซ้ำในโมดัล WARN — module-level เหมือน cardDetailPage ของ Card Detail
const MERGE_SUGGEST_PAGE_SIZE = 10;
let mergeSuggestPage = 1;

function computeMergeSuggestions() {
  const bills = state.bills.filter((bill) => !bill.excluded);
  if (bills.length < 2 || bills.length > 800) return [];
  const buckets = new Map();
  const push = (key, bill) => {
    if (!key) return;
    const arr = buckets.get(key) || [];
    if (!arr.includes(bill)) arr.push(bill);
    buckets.set(key, arr);
  };
  bills.forEach((bill) => {
    billOrwRefs(bill).forEach((ref) => push(`orw:${ref}`, bill));
    const phone = clean(bill.phone);
    if (phone) push(`phone:${phone}`, bill);
    const name = normalizedPatientKey(bill.patient);
    if (name && name.length > 3) push(`name:${name}`, bill);
  });
  const seenPairs = new Set();
  const dismissedPairs = new Set((state.dismissedSuggestions || []).map((entry) => entry.pairKey));
  const suggestions = [];
  buckets.forEach((arr) => {
    // กลุ่มใหญ่เกิน = สัญญาณกว้างเกินไป (เช่นชื่อบริษัทเดียวกันทั้งไฟล์) ข้ามไป
    if (arr.length < 2 || arr.length > 6) return;
    for (let i = 0; i < arr.length; i += 1) {
      for (let j = i + 1; j < arr.length; j += 1) {
        const pairKey = [arr[i].billKey, arr[j].billKey].sort().join("|");
        if (seenPairs.has(pairKey) || dismissedPairs.has(pairKey)) continue;
        seenPairs.add(pairKey);
        const { score, reasons } = mergeSimilarity(arr[i], arr[j]);
        if (score < 50) continue;
        suggestions.push({
          aKey: arr[i].billKey,
          bKey: arr[j].billKey,
          aLabel: mergeSuggestBillLabel(arr[i]),
          bLabel: mergeSuggestBillLabel(arr[j]),
          score,
          reasons,
        });
      }
    }
  });
  state.mergeSuggestionsTotal = suggestions.length; // จำนวนคู่จริง — โชว์ progress (ตอนนี้เท่ากับความยาวที่คืนไป ตั้งแต่เลิกตัดเหลือ 8)
  // คืนทั้งหมด — การตัดจำนวนที่แสดงเป็นเรื่องของชั้นแสดงผล (แบ่งหน้า) ไม่ใช่ของตัวคำนวณ
  // state.mergeSuggestionsTotal ด้านบนยังเป็นค่าเดิม → mergeSuggestTotal()/warnTotalCount() ไม่เปลี่ยนพฤติกรรม
  return suggestions.sort((a, b) => b.score - a.score);
}

// กลุ่ม ORW เดียวกันที่ "จับคู่ยังไม่ครบ" — คนละครึ่งของบิลเดียว ควรรวม:
// billing-only↔ฝั่งยา, รายการยาไม่มี MLP (clicknic-only)↔ไม่พบรายการยา (mlp-only), ฯลฯ
// เงื่อนไข: ORW ตรง + มีสถานะต่างกัน (mixed) + มีอย่างน้อย 1 ตัวที่ยัง match ไม่ครบ
const INCOMPLETE_MATCH_STATUSES = new Set(["clicknic-only", "mlp-only", "billing-only"]);
function orwComplementGroups() {
  const bills = state.bills.filter((bill) => !bill.excluded);
  if (bills.length < 2) return [];
  const buckets = new Map();
  bills.forEach((bill) => {
    billOrwRefs(bill).forEach((orw) => {
      const arr = buckets.get(orw) || [];
      if (!arr.includes(bill)) arr.push(bill);
      buckets.set(orw, arr);
    });
  });
  return [...buckets.values()].filter((arr) => arr.length >= 2
    && new Set(arr.map((b) => b.status)).size >= 2
    && arr.some((b) => INCOMPLETE_MATCH_STATUSES.has(b.status)));
}

// cache: billKeys ที่อยู่ในกลุ่ม ORW จับคู่ไม่ครบ (ใช้โชว์ป้าย "🔗 รวมได้" ในตาราง — O(1) ต่อแถว)
function orwMergeableKeySet() {
  if (state.orwMergeableCacheRef !== state.bills) {
    state.orwMergeableCacheRef = state.bills;
    const set = new Set();
    orwComplementGroups().forEach((group) => group.forEach((bill) => set.add(bill.billKey)));
    state.orwMergeableKeys = set;
  }
  return state.orwMergeableKeys;
}
// กลุ่ม ORW ที่บิลนี้อยู่ (สำหรับปุ่ม "🔗 รวมได้" — เลือกทั้งกลุ่มแล้วรวม)
function orwGroupFor(billKey) {
  return orwComplementGroups().find((group) => group.some((bill) => bill.billKey === billKey)) || [];
}

// เคส สปสช โดยปกติต้นทุน MLP = 0.00 — เคสที่ ≠ 0 ถือเป็นรายการต้องตรวจ (รวมที่ WARN)
function nhsoCostIssues() {
  return activeBills().filter((bill) => bill.caseType === "nhso" && Math.abs(toNumeric(bill.mlpCost)) >= 0.005);
}

// สถานะ "รอ..." ที่ยกขึ้นเป็นวางบิลแล้วได้เมื่อเลขครบ — ไม่รวม paid/billed/cancelled/billing-only
// (paid = ปลายทางแล้ว, cancelled = ตั้งใจยกเลิก, billing-only เป็นผลการจับคู่ไม่ใช่สถานะงาน)
const BILLED_PROMOTABLE_STAGES = new Set(["pending-review", "insurance-review", "nhso-pending", "general-pending"]);

// บิลที่มีเลขครบทั้ง BAR และ AR แล้ว แต่สถานะงานยังค้างที่ "รอ..." — ปกติ deriveBillingStage ยกให้เอง
// แต่ถ้า billingStageSource เป็น manual ทุกจุด re-derive จะข้ามไป ค่าจึงค้างอยู่อย่างนั้นตลอด
//
// รวม "no-mlp" (clicknic-only) ที่ isReconciledClicknicOnly() ยืนยันว่าครบจริงด้วย — เดิม deriveBillingStage()
// เช็ก status==="clicknic-only" ก่อนเช็ก barNo/creditNos เสมอ เลยล็อกเป็น no-mlp ถาวรแม้กรอก BAR+AR มือครบแล้ว
// (สปสช: isReconciledClicknicOnly ไม่ต้องมีต้นทุน MLP ก็ถือว่าครบ — ปกติของสปสชคือทุน 0 CLICKNIC ส่งยาฟรี
//  ประกัน: ยังต้องมีต้นทุนจริงถึงจะนับครบ กันเคสประกันที่จับคู่ไม่สำเร็จจริง ๆ หลุดเข้ามานับเป็นรายได้)
function billedReadyBills() {
  return activeBills().filter((bill) => clean(bill.barNo) && clean(bill.creditNos)
    && (BILLED_PROMOTABLE_STAGES.has(bill.billingStage || "") || isReconciledClicknicOnly(bill)));
}

// จำนวนคู่แนะนำจริง (ไม่ตัดเหลือ 8) — ใช้โชว์ progress ให้เห็นว่าลดลงจริงตอนรวม
function mergeSuggestTotal() {
  return state.mergeSuggestionsTotal != null ? state.mergeSuggestionsTotal : state.mergeSuggestions.length;
}

function warnTotalCount() {
  return mergeSuggestTotal() + nhsoCostIssues().length + billedReadyBills().length;
}

function renderMergeSuggestions() {
  // คำนวณใหม่เฉพาะเมื่อชุดบิลเปลี่ยน (state.bills ถูกสร้างใหม่ทุกครั้งที่ rebuild) — พิมพ์ค้นหาไม่ต้องคิดซ้ำ
  if (state.mergeSuggestCacheRef !== state.bills) {
    state.mergeSuggestCacheRef = state.bills;
    state.mergeSuggestions = computeMergeSuggestions();
  }
  // WARN ย้ายไปเป็น chip ในแถบ "ต้องจัดการ" แล้ว — อัปเดตแถบนั้น
  renderMergeAssistant();
  // popup เปิดค้างอยู่ → ตามข้อมูลล่าสุด (เตือนหมดแล้วปิดเอง)
  if (elements.mergeWarnModal?.open) {
    if (warnTotalCount() === 0) elements.mergeWarnModal.close();
    else renderMergeWarnBody();
  }
}

function renderMergeWarnBody() {
  const suggestions = state.mergeSuggestions;
  const nhsoIssues = nhsoCostIssues();
  const suggTotal = mergeSuggestTotal(); // จำนวนคู่จริง (ไม่ตัดเหลือ 8)
  const billedReady = billedReadyBills();
  // ใช้ warnTotalCount() ตัวเดียวกับที่อื่น จะได้ไม่มีสูตรนับสองชุดให้หลุดกันทีหลัง
  if (elements.mergeWarnTitle) elements.mergeWarnTitle.textContent = `รายการที่ต้องตรวจ (${number(warnTotalCount())})`;
  if (!elements.mergeWarnBody) return;
  const certainCount = certainMergeGroups().length; // คู่/กลุ่มที่ ORW+BAR+AR ตรงครบ = แน่นอนซ้ำ
  const orwCount = orwComplementGroups().length;     // คู่ ORW ใบวางบิล↔ฝั่งยา
  // clamp ทุกครั้งที่ render — จำนวนคู่ลดลงได้ตลอด (รวม/ซ่อนคู่ไปแล้ว) หน้าที่ค้างอยู่อาจเกินขอบ
  const pairTotalPages = Math.max(1, Math.ceil(suggestions.length / MERGE_SUGGEST_PAGE_SIZE));
  mergeSuggestPage = Math.min(Math.max(1, mergeSuggestPage), pairTotalPages);
  const pairStart = (mergeSuggestPage - 1) * MERGE_SUGGEST_PAGE_SIZE;
  const pairRows = suggestions.slice(pairStart, pairStart + MERGE_SUGGEST_PAGE_SIZE);
  const moreNote = pairRows.length < suggestions.length
    ? ` <span class="warn-more-note">(แสดง ${number(pairStart + 1)}–${number(pairStart + pairRows.length)} จาก ${number(suggestions.length)})</span>`
    : "";
  const pairSection = suggestions.length ? `
    <h3 class="warn-section-title">น่าจะเป็นบิลเดียวกัน ${number(suggTotal)} คู่${moreNote}
      ${orwCount ? `<button class="ghost small" type="button" data-merge-orw title="รวมทุกคู่ที่ ORW ตรงกันแต่จับคู่ยังไม่ครบ (ใบวางบิล↔ฝั่งยา, รายการยาไม่มี MLP↔ไม่พบรายการยา) รวดเดียว">รวมคู่ ORW ทั้งหมด (${number(orwCount)})</button>` : ""}
      ${certainCount ? `<button class="ghost small" type="button" data-merge-certain title="รวมทุกกลุ่มที่ ORW + ใบวางบิล(BAR) + เครดิต(AR) ตรงกันครบ — แน่นอนว่าซ้ำ">รวมที่แน่นอน (${number(certainCount)})</button>` : ""}
    </h3>
    <table class="case-seq-table merge-pair-table">
      <thead><tr><th>%</th><th>คู่บิล</th><th>เหตุผล</th><th class="act-col">จัดการ</th></tr></thead>
      <tbody>
        ${pairRows.map((item, offset) => {
          // ⚠️ index ที่ส่งให้ปุ่มต้องเป็นตำแหน่งใน state.mergeSuggestions ทั้งก้อน ไม่ใช่ตำแหน่งในหน้า
          // (handler หยิบด้วย state.mergeSuggestions[index] — ใช้ index ของหน้าจะรวมผิดคู่โดยไม่มีสัญญาณเตือน)
          const index = pairStart + offset;
          return `
        <tr>
          <td><span class="merge-suggest-score">${item.score}%</span></td>
          <td class="merge-warn-names">${htmlEscape(item.aLabel)} ↔ ${htmlEscape(item.bLabel)}</td>
          <td class="merge-warn-reasons">${htmlEscape(item.reasons.join(" + "))}</td>
          <td class="act-col">
            <button class="ghost small" type="button" data-warn-compare="${index}" title="เปิดตารางเทียบสองบิล">เทียบ</button>
            <button class="ghost small" type="button" data-warn-merge="${index}" title="รวมสองบิลนี้ (มีสรุปให้ยืนยันก่อน)">รวม</button>
          </td>
        </tr>`;
        }).join("")}
      </tbody>
    </table>
    ${pairTotalPages > 1 ? `
    <div class="card-detail-pager">
      <button class="ghost small" type="button" data-merge-page="prev" ${mergeSuggestPage <= 1 ? "disabled" : ""}>← ก่อนหน้า</button>
      <span>หน้า ${number(mergeSuggestPage)}/${number(pairTotalPages)}</span>
      <button class="ghost small" type="button" data-merge-page="next" ${mergeSuggestPage >= pairTotalPages ? "disabled" : ""}>ถัดไป →</button>
    </div>` : ""}
    <p class="case-seq-hint">เทียบ = เปิดตารางเทียบสองบิล (มีปุ่มรวม/ซ่อนคู่พร้อมเหตุผลในนั้น) · รวม = เข้าขั้นตอนรวมบิล มีสรุปให้ยืนยันก่อนเสมอ</p>` : "";
  // ตัด key ที่เลือกไว้แต่ไม่อยู่ในรายการปัญหาแล้ว (ถูกแก้ไปแล้ว)
  const nhsoKeys = new Set(nhsoIssues.map((b) => b.billKey));
  [...nhsoWarnSelected].forEach((k) => { if (!nhsoKeys.has(k)) nhsoWarnSelected.delete(k); });
  const allNhsoChecked = nhsoIssues.length > 0 && nhsoIssues.every((b) => nhsoWarnSelected.has(b.billKey));
  const round2 = (v) => Math.round(v * 100) / 100;
  const nhsoSection = nhsoIssues.length ? `
    <h3 class="warn-section-title">สปสช ต้นทุน MLP ไม่ใช่ 0 — ${number(nhsoIssues.length)} บิล
      <button class="ghost small" type="button" data-nhso-fix-all title="ตั้งต้นทุน MLP = 0 ให้บิลสปสชทั้งหมดที่ผิด">Set MLP cost 0</button>
    </h3>
    <div class="nhso-bulk-editor">
      <span class="nhso-be-label">แก้กลุ่มที่เลือก:</span>
      <label class="nhso-be-field">ต้นทุน<input type="number" step="0.01" min="0" data-nhso-edit="cost" placeholder="ไม่แก้" /></label>
      <label class="nhso-be-field">ยอดขาย<input type="number" step="0.01" min="0" data-nhso-edit="sale" placeholder="ไม่แก้" /></label>
      <label class="nhso-be-field">MLP cost<input type="number" step="0.01" min="0" data-nhso-edit="mlpCost" placeholder="ไม่แก้" /></label>
      <span class="nhso-be-hint" data-nhso-hint></span>
      <button class="primary small" type="button" data-nhso-apply-custom disabled>ใช้กับที่เลือก (0)</button>
    </div>
    <table class="case-seq-table">
      <thead><tr>
        <th class="seq-col"><input type="checkbox" data-nhso-check-all ${allNhsoChecked ? "checked" : ""} aria-label="เลือกทั้งหมด" /></th>
        <th>ผู้รับบริการ</th><th>ออเดอร์ / ORW</th><th>ต้นทุน</th><th>ยอดขาย</th><th>ต้นทุน MLP</th><th>กำไร</th><th class="act-col">จัดการ</th>
      </tr></thead>
      <tbody>
        ${nhsoIssues.map((bill) => {
          const profit = round2(toNumeric(bill.sale) - toNumeric(bill.cost) - toNumeric(bill.mlpCost));
          const on = nhsoWarnSelected.has(bill.billKey);
          return `
        <tr data-nhso-row="${htmlEscape(bill.billKey)}" class="${on ? "case-seq-row-active" : ""}">
          <td class="seq-col"><input type="checkbox" data-nhso-check="${htmlEscape(bill.billKey)}" ${on ? "checked" : ""} aria-label="เลือกบิลนี้" /></td>
          <td>${htmlEscape(bill.patient || "-")}</td>
          <td>${orderOrwCellHtml(bill)}</td>
          <td>${money(bill.cost)}</td>
          <td>${money(bill.sale)}</td>
          <td class="case-seq-code" style="color:#a12626">${money(bill.mlpCost)}</td>
          <td class="nhso-profit" data-profit-cell>${money(profit)}</td>
          <td class="act-col"><button type="button" class="row-action icon-action" data-nhso-open="${htmlEscape(bill.billKey)}" title="เปิดรายละเอียด / แก้ไขบิลนี้" aria-label="เปิดรายละเอียด / แก้ไขบิลนี้"><i class="fa-solid fa-pen-to-square"></i></button></td>
        </tr>`;
        }).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">ติ๊กเลือกบิล → กรอกค่า (เว้นว่าง = ไม่แก้) → "ใช้กับที่เลือก" · เช่น ต้นทุน 0 · ยอดขาย 10 · MLP 0 = กำไร 10 · หรือ "Set MLP cost 0" แก้ MLP ทั้งหมด · ดินสอ = แก้รายบิล</p>` : "";
  // ส่วนที่ 3 วางท้ายสุดตั้งใจ — เป็นงานกดปุ่มเดียวจบ ไม่ต้องแย่งที่กับรายการที่ต้องอ่านทีละแถว
  const billedSection = billedReady.length ? `
    <h3 class="warn-section-title">BAR+AR ครบแต่ยังไม่ "วางบิลแล้ว" — ${number(billedReady.length)} บิล
      <button class="ghost small" type="button" data-billed-fix-all title="ปรับงานวางบิลเป็น วางบิลแล้ว ให้ทุกใบในรายการนี้">ปรับเป็นวางบิลแล้ว</button>
    </h3>
    <table class="case-seq-table">
      <thead><tr><th>ผู้รับบริการ</th><th>ออเดอร์ / ORW</th><th>ใบวางบิล (BAR)</th><th>งานวางบิลตอนนี้</th><th class="act-col">จัดการ</th></tr></thead>
      <tbody>
        ${billedReady.map((bill) => `
        <tr>
          <td>${htmlEscape(bill.patient || "-")}</td>
          <td>${orderOrwCellHtml(bill)}</td>
          <td class="case-seq-code">${htmlEscape(bill.barNo || "-")}</td>
          <td>${htmlEscape(billingStageLabel(bill.billingStage))}${(bill.billingStageSource || "") === "manual" ? ' <span class="case-source">แก้มือ</span>' : ""}</td>
          <td class="act-col"><button type="button" class="row-action icon-action" data-billed-open="${htmlEscape(bill.billKey)}" title="เปิดรายละเอียด / แก้ไขบิลนี้" aria-label="เปิดรายละเอียด / แก้ไขบิลนี้"><i class="fa-solid fa-pen-to-square"></i></button></td>
        </tr>`).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">มีเลขใบวางบิล (BAR) และเลขที่เครดิต (AR) ครบแล้ว = วางบิลเสร็จจริง · ป้าย "แก้มือ" คือใบที่เคยเลือกสถานะเองไว้ ระบบจึงไม่ยกให้อัตโนมัติ · ปรับแล้วบิลจะถูกนับเป็นรายได้</p>` : "";
  elements.mergeWarnBody.innerHTML = pairSection + nhsoSection + billedSection;
  if (nhsoIssues.length) { updateNhsoApplyBtn(); updateNhsoPreview(); }
}

// ===== NHSO bulk editor (แก้ต้นทุน/ยอดขาย/MLP หลายบิลพร้อมกัน) =====
let nhsoWarnSelected = new Set();

function nhsoEditorValues() {
  const body = elements.mergeWarnBody;
  const vals = {};
  if (!body) return vals;
  body.querySelectorAll("[data-nhso-edit]").forEach((inp) => {
    const raw = clean(inp.value);
    if (raw !== "") vals[inp.dataset.nhsoEdit] = Math.max(0, toNumeric(raw)); // "0" = ตั้งเป็น 0; ว่าง = ไม่แก้
  });
  return vals;
}

function updateNhsoApplyBtn() {
  const body = elements.mergeWarnBody;
  if (!body) return;
  const btn = body.querySelector("[data-nhso-apply-custom]");
  const hint = body.querySelector("[data-nhso-hint]");
  const n = nhsoWarnSelected.size;
  const edit = nhsoEditorValues();
  const hasEdit = Object.keys(edit).length > 0;
  if (btn) { btn.disabled = n === 0 || !hasEdit; btn.textContent = `ใช้กับที่เลือก (${n})`; }
  if (hint) {
    const parts = [];
    if ("cost" in edit) parts.push(`ต้นทุน ${money(edit.cost)}`);
    if ("sale" in edit) parts.push(`ยอดขาย ${money(edit.sale)}`);
    if ("mlpCost" in edit) parts.push(`MLP ${money(edit.mlpCost)}`);
    hint.textContent = parts.length ? `จะตั้ง: ${parts.join(" · ")}` : "เว้นว่าง = ไม่แก้ฟิลด์นั้น";
  }
}

// preview กำไรต่อบิลที่เลือก: current → after (ตามค่าที่กรอก, ช่องว่าง = ใช้ค่าปัจจุบันของบิล)
function updateNhsoPreview() {
  const body = elements.mergeWarnBody;
  if (!body) return;
  const edit = nhsoEditorValues();
  const hasEdit = Object.keys(edit).length > 0;
  const round2 = (v) => Math.round(v * 100) / 100;
  body.querySelectorAll("[data-nhso-row]").forEach((tr) => {
    const bill = state.bills.find((b) => b.billKey === tr.dataset.nhsoRow);
    const cell = tr.querySelector("[data-profit-cell]");
    if (!bill || !cell) return;
    const cur = round2(toNumeric(bill.sale) - toNumeric(bill.cost) - toNumeric(bill.mlpCost));
    if (hasEdit && nhsoWarnSelected.has(bill.billKey)) {
      const cost = "cost" in edit ? edit.cost : toNumeric(bill.cost);
      const sale = "sale" in edit ? edit.sale : toNumeric(bill.sale);
      const mlp = "mlpCost" in edit ? edit.mlpCost : toNumeric(bill.mlpCost);
      const next = round2(sale - cost - mlp);
      cell.innerHTML = `<span class="nhso-profit-cur">${money(cur)}</span> <span class="nhso-arrow">→</span> <strong>${money(next)}</strong>`;
      cell.classList.add("preview");
    } else {
      cell.textContent = money(cur);
      cell.classList.remove("preview");
    }
  });
}

function openMergeWarnModal() {
  if (!elements.mergeWarnModal) return;
  mergeSuggestPage = 1; // เปิดใหม่ = เริ่มจากคู่คะแนนสูงสุดเสมอ
  // คำนวณคู่แนะนำใหม่ให้สดก่อนเปิดเสมอ — กันรายการค้างที่อ้างบิลซึ่งถูกรวม/แก้/หายไปแล้ว
  renderMergeSuggestions();
  if (warnTotalCount() === 0) return;
  renderMergeWarnBody();
  if (!elements.mergeWarnModal.open) elements.mergeWarnModal.showModal();
}

// เลือก/รวมจากแผงแนะนำ — "รวม" วิ่งเข้าปุ่มรวมบิลเดิม (มี confirm สรุปก่อนเสมอ)
function applySuggestionSelection(item) {
  state.selectedBillKeys.clear();
  state.selectedBillKeys.add(item.aKey);
  state.selectedBillKeys.add(item.bKey);
  renderTable();
}

// "เลือก" เปิด popup เทียบสองบิลข้าง ๆ กัน พร้อมปุ่ม action ต่อ (รวม/เปิดรายละเอียด/ไม่ใช่คู่เดียวกัน)
// — บิลอาจถูกตัวกรอง/ค้นหาซ่อนอยู่ในตาราง popup ทำให้เห็นคู่เสมอ
let suggestPairContext = null;
// ที่มาของ popup เทียบคู่บิล ("warn" = เปิดจากรายการ WARN, ""/"caseseq" = จากที่อื่น)
// ใช้ตัดสินใจว่าหลังรวม/ซ่อนคู่เสร็จ ควรเด้งกลับไปที่ WARN popup ให้ไล่ตรวจคู่ที่เหลือต่อไหม
let suggestPairOrigin = "";
// ปิด drawer ที่เปิดจากป๊อปอัพเทียบ → รันงานต่อ 1 ครั้ง (กลับป๊อปอัพเทียบ / กลับ WARN) แล้วเคลียร์
let drawerCloseCallback = null;

function openSuggestPairModal(item, origin = "") {
  const billA = state.bills.find((bill) => bill.billKey === item.aKey);
  const billB = state.bills.find((bill) => bill.billKey === item.bKey);
  if (!billA || !billB || !elements.suggestPairModal) return false;
  suggestPairContext = item;
  suggestPairOrigin = origin;
  elements.suggestPairTitle.textContent = item.titleText || `น่าจะเป็นบิลเดียวกัน (${item.score}%)`;
  // [ป้าย, ดึงค่า, ก๊อปได้, ซ่อนเมื่อว่างทั้งคู่]
  // เลขระบุตัวเรียงติดกันหมด: ออเดอร์ → Ref-ID → ORW → INV (ตัดสินว่าใบเดียวกันหรือไม่ ดูจากชุดนี้เป็นหลัก)
  const fields = [
    ["ผู้รับบริการ", (bill) => bill.patient || "-"],
    ["เลขที่ออเดอร์", (bill) => bill.orderId || "-", true],
    ["Ref-ID", (bill) => bill.refId || "-", true, true],
    ["ORW", (bill) => bill.orw || "-", true],
    ["INV", (bill) => bill.invoice || "-", true, true],
    ["สถานะ", (bill) => statusLabel(bill.status)],
    ["งานวางบิล", (bill) => billingStageLabel(bill.billingStage)],
    ["ประเภทเคส", (bill) => caseTypeLabel(bill.caseType)],
    ["วันที่ CKNC", (bill) => formatDisplayDate(bill.clicknicDate) || "-"],
    ["วันที่ MLP", (bill) => formatDisplayDate(bill.mlpDate) || "-"],
    ["ยอดขายยา", (bill) => money(bill.sale)],
    ["ต้นทุนรวม", (bill) => money(toNumeric(bill.cost) + toNumeric(bill.mlpCost))],
    ["กำไร", (bill) => money(bill.profit)],
    ["รายการยา", (bill) => {
      const count = bill.medicines?.length || bill.medicineCount || 0;
      return count ? `${number(count)} รายการ` : (clean(bill.medicinesText) ? bill.medicinesText : "-");
    }],
    ["ใบวางบิล (BAR)", (bill) => bill.barNo || "-"],
    ["เลขที่เครดิต (AR)", (bill) => bill.creditNos || "-"],
    ["เบอร์โทร", (bill) => bill.phone || "-"],
  ];
  // ผลลัพธ์ที่จะได้หลังกดรวม — คำนวณแบบเดียวกับตอนรวมจริง (บิลข้อมูลเยอะสุดเป็นหลัก) ไว้ให้ดูก่อนยืนยัน
  const ordered = [billA, billB].sort((a, b) => billRichness(b) - billRichness(a));
  const mergedBill = mergeManualBillGroup(ordered);
  elements.suggestPairBody.innerHTML = `
    <p class="suggest-pair-reasons">เหตุผลที่จับคู่: ${htmlEscape(item.reasons.join(" + "))}</p>
    <table class="suggest-pair-table">
      <thead>
        <tr>
          <th></th>
          <th>บิล 1 <button type="button" class="ghost small" data-pair-open="${htmlEscape(billA.billKey)}">ดูรายละเอียด</button></th>
          <th>บิล 2 <button type="button" class="ghost small" data-pair-open="${htmlEscape(billB.billKey)}">ดูรายละเอียด</button></th>
          <th class="pair-merged-head">ผลรวม (หลังรวม)</th>
        </tr>
      </thead>
      <tbody>
        ${fields.filter(([, pick, , hideWhenEmpty]) => {
    if (!hideWhenEmpty) return true;
    // ว่างทั้งสองใบ = ไม่ช่วยตัดสินอะไร ไม่ต้องกินความสูงตาราง (ผลรวมไม่มีทางมีค่าถ้าต้นทางว่างทั้งคู่)
    const a = clean(pick(billA));
    const b = clean(pick(billB));
    return (a && a !== "-") || (b && b !== "-");
  }).map(([label, pick, copyable]) => {
    const valueA = pick(billA);
    const valueB = pick(billB);
    const valueM = pick(mergedBill);
    const diff = valueA !== valueB;
    const cell = (value) => {
      const copyBtn = (copyable && value && value !== "-")
        ? ` <button type="button" class="copy-ref-btn" data-copy-text="${htmlEscape(value)}" title="คัดลอก ${htmlEscape(label)}" aria-label="คัดลอก ${htmlEscape(label)}"><i class="fa-regular fa-copy"></i></button>`
        : "";
      return `${htmlEscape(value)}${copyBtn}`;
    };
    return `<tr>
            <th>${htmlEscape(label)}</th>
            <td class="${diff ? "pair-diff" : ""}">${cell(valueA)}</td>
            <td class="${diff ? "pair-diff" : ""}">${cell(valueB)}</td>
            <td class="pair-merged">${cell(valueM)}</td>
          </tr>`;
  }).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">ช่องพื้นเหลือง = ค่าสองฝั่งไม่ตรงกัน · คอลัมน์ <b>ผลรวม</b> = ค่าที่จะได้หลังกดรวม (บิลข้อมูลเยอะสุดเป็นหลัก ช่องว่างเติมจากอีกใบ รายการยาเอาชุดยาวกว่า) · กด "รวมบิล" = รวมทันทีตามนี้ มีปุ่ม "เลิกรวม" ให้กดกลับได้ · แก้รายช่องได้ในตารางหลังรวม</p>
  `;
  if (!elements.suggestPairModal.open) elements.suggestPairModal.showModal();
  return true;
}

// ยืนยันว่า "ไม่ใช่บิลเดียวกัน" — ซ่อนคู่นี้ถาวรพร้อมเหตุผล (ติดไปกับ session/autosave + audit trail)
function dismissSuggestionPair(item, reason) {
  const pairKey = [item.aKey, item.bKey].sort().join("|");
  state.dismissedSuggestions = state.dismissedSuggestions || [];
  if (!state.dismissedSuggestions.some((entry) => entry.pairKey === pairKey)) {
    state.dismissedSuggestions.push({
      pairKey,
      aLabel: item.aLabel,
      bLabel: item.bLabel,
      reason,
      createdAt: new Date().toISOString(),
    });
  }
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "suggestion_dismiss",
    createdAt: new Date().toISOString(),
    orderId: "",
    orw: "",
    invoice: "",
    date: "",
    lineCount: 0,
    totalSale: 0,
    totalCost: 0,
    screenshotName: "merge-suggest",
    replacedLineCount: 0,
    note: `ไม่ใช่บิลเดียวกัน: ${item.aLabel} ↔ ${item.bLabel} — เหตุผล: ${reason}`,
    medicines: [],
  });
  elements.suggestPairModal?.close();
  state.selectedBillKeys.clear();
  state.mergeSuggestCacheRef = null; // บังคับคำนวณคู่แนะนำใหม่ (ตัดคู่ที่ซ่อนออก)
  renderTable();
  renderMergeAssistant();
  renderAuditTrail();
  scheduleAutosave("suggestion-dismiss");
  elements.statusText.textContent = `ซ่อนคู่แนะนำแล้ว: ${item.aLabel} ↔ ${item.bLabel}`;
}

// ถามผู้ใช้ว่าจะ "เพิ่มเข้าข้อมูลเดิม" หรือ "เริ่มใหม่ทั้งหมด" — คืน null เมื่อยกเลิก
function askImportMode(summaryText) {
  return new Promise((resolve) => {
    if (!elements.importModeModal) {
      resolve("replace");
      return;
    }
    elements.importModeSummary.textContent = summaryText;
    let settled = false;
    const finish = (mode) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (elements.importModeModal.open) elements.importModeModal.close();
      resolve(mode);
    };
    const onAppend = () => finish("append");
    const onReplace = () => finish("replace");
    const onCancel = () => finish(null);
    const onClose = () => finish(null);
    function cleanup() {
      elements.importModeAppend.removeEventListener("click", onAppend);
      elements.importModeReplace.removeEventListener("click", onReplace);
      elements.importModeCancel.removeEventListener("click", onCancel);
      elements.importModeClose.removeEventListener("click", onCancel);
      elements.importModeModal.removeEventListener("close", onClose);
    }
    elements.importModeAppend.addEventListener("click", onAppend);
    elements.importModeReplace.addEventListener("click", onReplace);
    elements.importModeCancel.addEventListener("click", onCancel);
    elements.importModeClose.addEventListener("click", onCancel);
    elements.importModeModal.addEventListener("close", onClose);
    elements.importModeModal.showModal();
  });
}

// โหมดเพิ่มข้อมูล: รวม rows ใหม่กับของเดิม + ตัดแถวซ้ำ โดยคง override/audit/รายการยา manual ไว้ทั้งหมด
function mergeImportedIntoState(imported) {
  if (state.snapshotMode) {
    // ข้อมูลบนจอมาจาก session ที่กู้คืน (ไม่มี source rows): สร้างบิลจากข้อมูลใหม่ แล้วรวมกับบิลเดิม (คีย์ซ้ำใช้ของใหม่)
    const previousBills = state.bills;
    state.clicknicRows = dedupeClicknicRows(imported.clicknicRows);
    state.mlpRows = dedupeMlpRows(imported.mlpRows);
    state.billingRows = dedupeBillingRows(imported.billingRows);
    state.snapshotMode = false;
    buildBills();
    // คีย์ซ้ำ: รวมแบบข้อมูลมากที่สุด (บิลจากไฟล์ใหม่ชนะเมื่อมีค่า ช่องว่างเติมจากบิลเดิม)
    const previousByKey = new Map(previousBills.map((bill) => [bill.billKey, bill]));
    state.bills = state.bills.map((bill) => {
      const previous = previousByKey.get(bill.billKey);
      if (!previous) return bill;
      const merged = mergeBillRecords(bill, previous);
      merged.validationIssues = validationRulesForBill(merged);
      return merged;
    });
    const importedKeys = new Set(state.bills.map((bill) => bill.billKey));
    state.bills = [...state.bills, ...previousBills.filter((bill) => !importedKeys.has(bill.billKey))];
    state.snapshotMode = true;
    return;
  }
  state.clicknicRows = dedupeClicknicRows([...state.clicknicRows, ...imported.clicknicRows]);
  state.mlpRows = dedupeMlpRows([...state.mlpRows, ...imported.mlpRows]);
  state.billingRows = dedupeBillingRows([...state.billingRows, ...imported.billingRows]);
}

async function handleFiles() {
  try {
    const clickFiles = [...elements.clicknicFiles.files];
    const mlpFiles = [...elements.mlpFile.files];
    const billingFiles = [...elements.billingFiles.files];
    elements.statusText.textContent = "กำลังอ่านไฟล์...";

    // อ่านทุกไฟล์ให้สำเร็จก่อน ค่อยแทนที่ข้อมูลเดิม — ไฟล์พัง/ผิดช่องจะไม่ล้างงานบนจอ
    const clicknicImportedRows = [];
    for (const file of clickFiles) {
      const workbook = await readWorkbookFromFile(file);
      clicknicImportedRows.push(...parseClicknicWorkbook(workbook, file.name));
    }
    const mlpImportedRows = [];
    for (const file of mlpFiles) {
      const workbook = await readWorkbookFromFile(file);
      mlpImportedRows.push(...parseMlpWorkbook(workbook, file.name));
    }
    const billingImportedRows = [];
    for (const file of billingFiles) {
      const workbook = await readWorkbookFromFile(file);
      billingImportedRows.push(...parseBillingWorkbook(workbook, file.name));
    }

    // มีข้อมูลอยู่แล้ว = เพิ่มเข้าข้อมูลเดิมเสมอ (แถวซ้ำถูกตัดอัตโนมัติ ค่าที่แก้มือคงอยู่) — ไม่ถามโหมด
    const mode = state.bills.length ? "append" : "replace";
    const imported = { clicknicRows: clicknicImportedRows, mlpRows: mlpImportedRows, billingRows: billingImportedRows };
    const importStats = importStatsFor(
      mode === "append" ? { clicknic: state.clicknicRows, mlp: state.mlpRows, billing: state.billingRows } : { clicknic: [], mlp: [], billing: [] },
      imported,
    );
    // ซ้ำเกินเกณฑ์ (น่าจะอัปไฟล์เดิม) → ถามยืนยันก่อน; ยกเลิก = ไม่แตะข้อมูลเดิม
    if (mode === "append" && !(await confirmIfMostlyDuplicate(importStats))) {
      elements.statusText.textContent = "ยกเลิกการนำเข้า (ไฟล์ซ้ำกับข้อมูลเดิมเป็นส่วนใหญ่)";
      return;
    }

    if (mode === "append") {
      mergeImportedIntoState(imported);
    } else {
      state.clicknicRows = dedupeClicknicRows(clicknicImportedRows);
      state.manualClicknicRows = [];
      state.auditTrail = [];
      state.billOverrides = {};
      state.billMergeGroups = [];
      state.deletedBillKeys = [];
      state.dismissedSuggestions = [];
      state.mlpRows = dedupeMlpRows(mlpImportedRows);
      state.billingRows = billingImportedRows;
      state.activeSessionId = "";
      state.snapshotMode = false;
      state.allStepsComplete = false;
      state.restoredInfo = null;
      resetSourceMeta();
    }

    if (clicknicImportedRows.length) updateSourceMeta("clicknic", clickFiles.map((file) => file.name));
    if (mlpImportedRows.length) updateSourceMeta("mlp", mlpFiles.map((file) => file.name));
    if (billingImportedRows.length) updateSourceMeta("billing", billingFiles.map((file) => file.name));

    renderAll();
    scheduleAutosave("file-import");
    showImportResultModal(importStats, [...clickFiles, ...mlpFiles, ...billingFiles].map((file) => file.name));
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
    state.billMergeGroups = [];
    state.deletedBillKeys = [];
    state.dismissedSuggestions = [];
    state.billingRows = [];
    state.activeSessionId = "";
    state.snapshotMode = false;
    state.allStepsComplete = false;
    state.restoredInfo = null;
    resetSourceMeta();
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
    updateSourceMeta("clicknic", SAMPLE_FILES.clicknic);
    updateSourceMeta("mlp", [SAMPLE_FILES.mlp]);
    updateSourceMeta("billing", SAMPLE_FILES.billing);
    renderAll();
    scheduleAutosave("sample-import");
    const sampleStats = importStatsFor(
      { clicknic: [], mlp: [], billing: [] },
      { clicknicRows: clicknicImportedRows, mlpRows: state.mlpRows, billingRows: state.billingRows },
    );
    const sampleNames = [...SAMPLE_FILES.clicknic, SAMPLE_FILES.mlp, ...SAMPLE_FILES.billing]
      .map((path) => String(path).split("/").pop());
    showImportResultModal(sampleStats, sampleNames);
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
    "ref_id",
    "phone",
    "address",
    "diagnosis",
    "visit_index",
    "visit_count",
    "visit_gap_days",
    "orw",
    "invoice",
    "billing_no",
    "credit_no",
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
    "expected_claim",
    "profit_after_mlp",
  ];
  const body = rows.map((bill) => [
    statusLabel(bill.status),
    bill.orderId,
    bill.patient,
    bill.refId || "",
    bill.phone || "",
    bill.address || "",
    billDiagnosis(bill),
    bill.customerVisitIndex || "",
    bill.customerVisitCount || "",
    toNumeric(bill.visitGapDays) > 0 ? bill.visitGapDays : "",
    bill.orw,
    bill.invoice,
    displayBillingNo(bill),
    bill.creditNos || "",
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
    bill.expectedClaim || 0,
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
    ref_id: bill.refId || "",
    phone: bill.phone || "",
    address: bill.address || "",
    diagnosis: billDiagnosis(bill),
    visit_index: bill.customerVisitIndex || "",
    visit_count: bill.customerVisitCount || "",
    visit_gap_days: toNumeric(bill.visitGapDays) > 0 ? bill.visitGapDays : "",
    orw: bill.orw,
    invoice: bill.invoice,
    billing_no: displayBillingNo(bill),
    credit_no: bill.creditNos || "",
    billing_refs: bill.billingRefs,
    mlp_reference_no: bill.mlpReferenceNos,
    mlp_memo_order_id: bill.mlpMemoOrderIds,
    case_type: caseTypeLabel(bill.caseType),
    case_type_source: bill.caseTypeSource || "",
    case_seq: bill.caseSeq ? `${caseSeqNames[bill.caseType] || ""} ${bill.caseSeq}/${bill.caseSeqMonth}` : "",
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
    expected_claim: bill.expectedClaim || 0,
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
    primary: "วันบิลหลัก (CLICKNIC→MLP)",
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

// ป้ายย่อผลตรวจสอบ: โค้ดสั้น + ข้อความกระชับ + โทนสี (ตกลงกับผู้ใช้: NGP แดง, NMR ส้มอ่อน, DMM เทา)
const issueChipDefs = {
  NEGATIVE_PROFIT: { code: "NGP", label: "กำไรติดลบ", tone: "red" },
  MLP_NO_MEDICINE: { code: "NMR", label: "ขาดรายการยา", tone: "orange" },
  DATE_MISMATCH: { code: "DMM", label: "วันที่ไม่ตรงกัน", tone: "gray" },
  CLICKNIC_NOT_IN_MLP: { code: "CNM", label: "ยาไม่มี MLP", tone: "red" },
  BILLING_NOT_IN_MLP: { code: "BNM", label: "บิลไม่เจอ MLP", tone: "red" },
  MLP_COST_OVER_SALE: { code: "COS", label: "ทุนเกินยอดขาย", tone: "red" },
  PENDING_BILLING: { code: "PDB", label: "รอใบวางบิล", tone: "blue" },
  MISSING_MLP_COST: { code: "NCO", label: "ไม่มีต้นทุน", tone: "amber" },
  MISSING_BILLED_AMOUNT: { code: "NBA", label: "ไม่มียอดวางบิล", tone: "amber" },
  MISSING_AR: { code: "NAR", label: "ไม่มีเลข AR", tone: "amber" },
  MISSING_BAR: { code: "NBR", label: "ไม่มีเลข BAR", tone: "amber" },
  BILLED_AMOUNT_EXPECTED_MISMATCH: { code: "BEM", label: "ยอดวางบิลไม่ตรงคาด", tone: "gray" },
  BILLED_AMOUNT_MLP_COST_MISMATCH: { code: "BCM", label: "ยอดไม่ตรง MLP", tone: "gray" },
  EXPECTED_CLAIM_MISMATCH: { code: "ECM", label: "ไม่ตรง CKNC-INS/NHSO", tone: "gray" },
  EXCLUDED: { code: "EXC", label: "ไม่นับคำนวณ", tone: "gray" },
  REPEAT_SOON: { code: "RPT", label: "มาซ้ำเร็ว", tone: "amber" },
  REPEAT_SAME_MED: { code: "RSM", label: "ยาซ้ำครั้งก่อน", tone: "gray" },
};

// เรียงตามความรุนแรงก่อนเสมอ (danger → warn → info) ที่เท่ากันคงลำดับ rule เดิม (Array.sort เสถียร)
const ISSUE_LEVEL_RANK = { danger: 0, warn: 1, info: 2 };

function sortIssuesBySeverity(issues) {
  return issues.slice().sort((a, b) => (ISSUE_LEVEL_RANK[a.level] ?? 3) - (ISSUE_LEVEL_RANK[b.level] ?? 3));
}

// ส่วนต่างเป็นบาทท้าย chip — ใช้ − (U+2212) ไม่ใช่ hyphen จะได้ไม่อ่านเป็นขีดคั่น
function issueDiffText(issue) {
  if (!Number.isFinite(issue.diff) || Math.abs(issue.diff) < 0.005) return "";
  return `${issue.diff > 0 ? "+" : "−"}${money(Math.abs(issue.diff))}`;
}

function issueChipShortText(issue) {
  const def = issueChipDefs[issue.code];
  const base = def ? `${def.code} ${def.label}` : issue.text;
  const diff = issueDiffText(issue);
  return diff ? `${base} ${diff}` : base;
}

// chip ป้ายผลตรวจสอบ — hover เห็นข้อความเต็มเสมอ
// options.extra = chip ตัวที่เกินลิมิต (ซ่อนไว้รอกด +N) · options.count = จำนวนแถวที่ติดเหมือนกัน (chip บนหัวการ์ด)
function issueChipHtml(issue, options = {}) {
  const def = issueChipDefs[issue.code];
  const tone = def?.tone || "gray";
  const content = def ? `<b>${def.code}</b> ${def.label}` : htmlEscape(issue.text);
  const diff = issueDiffText(issue);
  const suffix = `${diff ? `<em>${htmlEscape(diff)}</em>` : ""}${options.count ? `<em>×${number(options.count)}</em>` : ""}`;
  return `<span class="issue-chip tone-${tone}${options.extra ? " is-extra" : ""}" title="${htmlEscape(issue.text)}">${content}${suffix}</span>`;
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
      billing_no: displayBillingNo(bill),
      credit_no: bill.creditNos || "",
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
    ["Total Cost", metrics.totalCost],
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
      billing_no: displayBillingNo(bill),
      credit_no: bill.creditNos || "",
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
    ["repeat_visit_warn_days", config.repeatVisitWarnDays],
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
    ["Total Cost", metrics.totalCost],
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
    ["ครบ CKNC+MLP+BAR", metrics.matched],
    ["ไม่พบรายการยา", metrics.mlpOnly],
    ["รอใบวางบิล", metrics.mlpNoBilling],
    ["กำไร matched หลัง MLP", money(metrics.profit)],
    ["ยอดขายยา", money(metrics.sale)],
    ["ต้นทุน", money(metrics.totalCost)],
    ["Audit entries", state.auditTrail.length],
  ].map(([label, value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join("");
  const tableHtml = (rows) => rows.map((bill) => `
    <tr>
      <td>${htmlEscape(statusLabel(bill.status))}</td>
      <td>${htmlEscape(bill.orderId)}</td>
      <td>${htmlEscape(bill.orw)}</td>
      <td>${htmlEscape(displayBillingNo(bill))}</td>
      <td>${htmlEscape(bill.mlpDate || bill.clicknicDate)}</td>
      <td>${htmlEscape(bill.medicinesText)}</td>
      <td class="num">${money(bill.sale)}</td>
      <td class="num">${money(toNumeric(bill.cost) + toNumeric(bill.mlpCost))}</td>
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
          <thead><tr><th>สถานะ</th><th>เลขที่ออเดอร์</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
          <tbody>${tableHtml(issueRows)}</tbody>
        </table>
        <h2>ตัวอย่างรายการที่จับคู่แล้ว</h2>
        <table>
          <thead><tr><th>สถานะ</th><th>เลขที่ออเดอร์</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
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
    ["ครบ CKNC+MLP+BAR", metrics.matched],
    ["ไม่พบรายการยา", metrics.mlpOnly],
    ["รอใบวางบิล", metrics.mlpNoBilling],
    ["Critical/Danger", severityCounts.danger || 0],
    ["Warning", severityCounts.warn || 0],
    ["Info", severityCounts.info || 0],
    ["ยอดขายยา", money(metrics.sale)],
    ["กำไร matched หลัง MLP", money(metrics.profit)],
    ["ต้นทุน", money(metrics.totalCost)],
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
      <td>${htmlEscape(displayBillingNo(bill))}</td>
      <td>${htmlEscape(bill.mlpDate || bill.clicknicDate)}</td>
      <td class="meds">${htmlEscape(bill.medicinesText)}</td>
      <td class="num">${money(bill.sale)}</td>
      <td class="num">${money(toNumeric(bill.cost) + toNumeric(bill.mlpCost))}</td>
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
      <td class="num">${money(toNumeric(row.drug_cost) + toNumeric(row.mlp_cost))}</td>
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
          <thead><tr><th>สถานะ</th><th>เลขที่ออเดอร์</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
          <tbody>${tableHtml(reviewRows) || '<tr><td colspan="11">ไม่มีรายการที่ต้องตรวจสอบ</td></tr>'}</tbody>
        </table>
        <h2>Validation Issues</h2>
        <table>
          <thead><tr><th>Severity</th><th>Code</th><th>Issue</th><th>สถานะ</th><th>เลขที่ออเดอร์</th><th>ORW</th><th>วันที่</th><th>ต้นทุน</th><th>วางบิล</th><th>กำไร</th></tr></thead>
          <tbody>${validationHtml || '<tr><td colspan="10">ไม่มี validation issue</td></tr>'}</tbody>
        </table>
        <h2>ตัวอย่างรายการที่จับคู่แล้ว</h2>
        <table>
          <thead><tr><th>สถานะ</th><th>เลขที่ออเดอร์</th><th>ORW</th><th>ใบวางบิล</th><th>วันที่</th><th>รายการยา</th><th>ขาย</th><th>ต้นทุน</th><th>วางบิล</th><th>กำไร</th><th>ตรวจสอบ</th></tr></thead>
          <tbody>${tableHtml(matchedRows) || '<tr><td colspan="11">ไม่มีรายการจับคู่แล้ว</td></tr>'}</tbody>
        </table>
        <h2>Audit ล่าสุด</h2>
        <table>
          <thead><tr><th>เวลา</th><th>Action</th><th>เลขที่ออเดอร์</th><th>ORW</th><th>หมายเหตุ</th></tr></thead>
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
      billMergeGroups: state.billMergeGroups,
      deletedBillKeys: state.deletedBillKeys,
      dismissedSuggestions: state.dismissedSuggestions,
      auditTrail: state.auditTrail,
      topMeds: state.topMeds,
      ruleConfig: state.ruleConfig,
      clicknicImportSummary: state.clicknicImportSummary,
      sourceMeta: state.sourceMeta,
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
      // เดือนนี้มีข้อมูลใหม่หลังถูกรวม → เอาป้าย "รวมแล้ว" ออก ให้กลับมาแสดงในรายการ
      mergedInto: firebase.firestore.FieldValue.delete(),
      mergedAt: firebase.firestore.FieldValue.delete(),
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

// รวม payload จากหลาย session/autosave docs เป็นชุดเดียว — เรียงเก่า → ใหม่ ให้ตัวที่อัปเดตล่าสุดชนะ
// เมื่อบิลเลขซ้ำ/override ชนกัน (กติกา "ข้อมูลมากที่สุด" เดียวกับรวม sessions)
function combineSessionPayloads(sessions) {
  const sorted = [...sessions].sort((a, b) => (a.updatedAt?.toMillis?.() || 0) - (b.updatedAt?.toMillis?.() || 0));
  const billMap = new Map();
  let overrides = {};
  const auditIds = new Set();
  const audit = [];
  const mergeGroupIds = new Set();
  const mergeGroups = [];
  const deletedKeys = new Set();
  const dismissedByKey = new Map();
  let sourceMeta = { clicknic: null, mlp: null, billing: null };
  sorted.forEach((session) => {
    // เรียงเก่า → ใหม่: meta ของถังที่อัปเดตหลังสุดชนะ
    const meta = session.payload?.sourceMeta || {};
    sourceMeta = {
      clicknic: meta.clicknic || sourceMeta.clicknic,
      mlp: meta.mlp || sourceMeta.mlp,
      billing: meta.billing || sourceMeta.billing,
    };
    (session.payload?.bills || []).forEach((bill) => {
      const existing = billMap.get(bill.billKey);
      billMap.set(bill.billKey, existing ? mergeBillRecords(bill, existing) : bill);
    });
    overrides = mergeOverrideMaps(session.payload?.billOverrides || {}, overrides);
    (session.payload?.billMergeGroups || []).forEach((group) => {
      if (!group || !Array.isArray(group.memberKeys) || mergeGroupIds.has(group.id)) return;
      mergeGroupIds.add(group.id);
      mergeGroups.push(group);
    });
    (session.payload?.deletedBillKeys || []).forEach((key) => {
      if (key) deletedKeys.add(key);
    });
    (session.payload?.dismissedSuggestions || []).forEach((entry) => {
      if (entry?.pairKey && !dismissedByKey.has(entry.pairKey)) dismissedByKey.set(entry.pairKey, entry);
    });
    (session.payload?.auditTrail || []).forEach((entry) => {
      if (!entry || auditIds.has(entry.id)) return;
      auditIds.add(entry.id);
      audit.push(entry);
    });
  });
  const bills = [...billMap.values()].map(finalizeRestoredBill);
  return { bills, overrides, mergeGroups, deletedKeys: [...deletedKeys], dismissed: [...dismissedByKey.values()], audit, sourceMeta };
}

// ย่อรายชื่อเดือน autosave เป็นช่วงไทยสั้น ๆ: ["2026-01","2026-05","2026-06","2026-07"] → "ม.ค. + พ.ค.–ก.ค. 69" (ปีตาม BE/CE)
function shortMonthsLabel(months) {
  const names = ["ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.", "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."];
  const sorted = [...new Set(months)].sort();
  const order = (key) => { const [y, m] = key.split("-").map(Number); return y * 12 + m; };
  const monthName = (key) => names[Number(key.slice(5)) - 1] || key;
  const runs = [];
  sorted.forEach((key) => {
    const run = runs[runs.length - 1];
    if (run && order(key) === order(run[run.length - 1]) + 1) run.push(key);
    else runs.push([key]);
  });
  const parts = runs.map((run) => (run.length > 1 ? `${monthName(run[0])}–${monthName(run[run.length - 1])}` : monthName(run[0])));
  const years = [...new Set(sorted.map((key) => key.slice(0, 4)))].map((y) => String(Number(y) + (yearEra === "be" ? 543 : 0)).slice(-2));
  return `${parts.join(" + ")} ${years.join("/")}`;
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
    let latest = candidates
      .filter((item) => item.updatedAt?.toMillis)
      .sort((a, b) => b.updatedAt.toMillis() - a.updatedAt.toMillis())[0];
    if (!latest || state.bills.length) {
      setSessionButtons();
      return;
    }
    // autosave แบ่งถังรายเดือน: งานล่าสุดที่คร่อมหลายเดือนต้องกู้ทุกถังของรอบเดียวกันมารวมกัน
    // ไม่งั้นได้งานกลับมาแค่เดือนเดียว (ถังที่อัปเดตล่าสุด) ที่เหลือต้องไปกดโหลดเอง
    if (latest.source === "autosave" && Array.isArray(latest.months) && latest.months.length > 1) {
      const monthDocs = await Promise.all(latest.months.map((month) =>
        window.db.collection("cknc_monthly_autosaves").doc(month).get()));
      const parts = monthDocs.filter((doc) => doc.exists).map((doc) => ({ id: doc.id, ...doc.data(), source: "autosave" }));
      if (parts.length > 1) {
        const combined = combineSessionPayloads(parts);
        latest = {
          ...latest,
          name: `CKNC Autosave ${latest.months.join(" + ")}`,
          payload: {
            ...(latest.payload || {}),
            bills: combined.bills,
            billOverrides: combined.overrides,
            billMergeGroups: combined.mergeGroups,
            deletedBillKeys: combined.deletedKeys,
            dismissedSuggestions: combined.dismissed,
            auditTrail: combined.audit,
            sourceMeta: combined.sourceMeta,
            topMeds: [],
          },
        };
      }
    }
    await applySessionSnapshot(latest);
    // ข้อความกู้คืนแบบย่อ ให้พอดีบรรทัดสถานะเล็กใน topbar
    const restoredLabel = latest.source === "autosave" && Array.isArray(latest.months) && latest.months.length
      ? `กู้คืน autosave ล่าสุด · ${shortMonthsLabel(latest.months)}`
      : `กู้คืน${latest.source === "autosave" ? " autosave" : " session"}: ${latest.name || latest.id}`;
    elements.statusText.textContent = `${restoredLabel} · ${number(state.bills.length)} บิล`;
    autosaveStatusText("Autosave: กู้คืนให้แล้วหลังเปิดหน้า");
  } catch (error) {
    console.error(error);
    setSessionButtons();
  }
}

async function applySessionSnapshot(session) {
  const payload = session.payload || {};
  let mode = "replace";
  if (state.bills.length) {
    mode = await askImportMode(`ข้อมูลบนจอมี ${number(state.bills.length)} บิล — session "${session.name || session.id}" มี ${number((payload.bills || []).length)} บิล (โหมดเพิ่ม: บิลเลขซ้ำรวมข้อมูลให้มากที่สุด ค่าที่แก้ไว้คงอยู่)`);
    if (!mode) return false;
  }
  if (mode === "append") {
    // รวมบิลจาก session เข้ากับงานบนจอแบบ "ข้อมูลมากที่สุด": ของบนจอชนะเมื่อมีค่า ช่องว่างเติมจาก session
    const loadedByKey = new Map((payload.bills || []).map((bill) => [bill.billKey, bill]));
    state.bills = state.bills.map((bill) => {
      const loaded = loadedByKey.get(bill.billKey);
      if (!loaded) return bill;
      const merged = mergeBillRecords(bill, loaded);
      merged.validationIssues = validationRulesForBill(merged);
      return merged;
    });
    const currentKeys = new Set(state.bills.map((bill) => bill.billKey));
    const loadedBills = (payload.bills || [])
      .filter((bill) => !currentKeys.has(bill.billKey))
      .map(finalizeRestoredBill);
    state.bills = [...state.bills, ...loadedBills];
    state.billOverrides = mergeOverrideMaps(state.billOverrides, payload.billOverrides || {});
    mergeBillMergeGroupsInto(payload.billMergeGroups);
    mergeDeletedBillKeysInto(payload.deletedBillKeys);
    mergeDismissedSuggestionsInto(payload.dismissedSuggestions);
    applyManualMergeGroups();
    applyDeletedBills();
    const auditIds = new Set(state.auditTrail.map((entry) => entry.id));
    state.auditTrail = [...state.auditTrail, ...(payload.auditTrail || []).filter((entry) => !auditIds.has(entry.id))];
    // ประวัติโหลดต่อ step: ของบนจอชนะ ช่องว่างเติมจาก session
    state.sourceMeta = {
      clicknic: state.sourceMeta?.clicknic || payload.sourceMeta?.clicknic || null,
      mlp: state.sourceMeta?.mlp || payload.sourceMeta?.mlp || null,
      billing: state.sourceMeta?.billing || payload.sourceMeta?.billing || null,
    };
    state.snapshotMode = true;
    state.activeSessionId = "";
    renderSnapshot();
    elements.statusText.textContent = `รวม session: ${session.name || session.id} → รวมเป็น ${number(state.bills.length)} บิล`;
    return true;
  }
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
  state.bills = (payload.bills || []).map(finalizeRestoredBill);
  state.billOverrides = payload.billOverrides || {};
  state.billMergeGroups = payload.billMergeGroups || [];
  state.deletedBillKeys = payload.deletedBillKeys || [];
  state.dismissedSuggestions = payload.dismissedSuggestions || [];
  // กลุ่มรวม/รายการลบต้องถูก apply ซ้ำเสมอ — กันบิลที่รวม/ลบไปแล้วโผล่กลับจากถังเดือนเก่า
  applyManualMergeGroups();
  applyDeletedBills();
  state.auditTrail = payload.auditTrail || [];
  state.topMeds = payload.topMeds || [];
  state.clicknicImportSummary = payload.clicknicImportSummary || session.importSummary || { rawRows: 0, uniqueRows: 0, duplicateRows: 0 };
  state.sourceMeta = {
    clicknic: payload.sourceMeta?.clicknic || null,
    mlp: payload.sourceMeta?.mlp || null,
    billing: payload.sourceMeta?.billing || null,
  };
  // เก็บที่มา/เวลาบันทึกของชุดที่กู้คืน — การ์ด STEP ใช้เป็น fallback เมื่อ payload เก่าไม่มี sourceMeta
  state.restoredInfo = {
    source: session.source === "autosave" ? "autosave" : "session",
    savedAtIso: session.updatedAt?.toDate?.()?.toISOString?.() || session.updatedAtIso || payload.updatedAtIso || "",
  };
  state.clicknicRows = [];
  state.manualClicknicRows = [];
  state.mlpRows = [];
  state.billingRows = [];
  state.snapshotMode = true;
  state.activeSessionId = session.source === "autosave" ? "" : (session.id || "");
  renderSnapshot();
  elements.statusText.textContent = `โหลด session: ${session.name || session.id || "CKNC session"} (${number(state.bills.length)} บิล)`;
  return true;
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
    const autosavesAll = autosaveSnapshot.docs.map((doc) => ({ id: doc.id, kind: "autosave", ...doc.data() }));
    // autosave ที่ถูกรวมเป็น session เดียวไปแล้ว: ซ่อนไว้ (กดดูย้อนได้ และจะโผล่กลับเองเมื่อเดือนนั้นมีข้อมูลใหม่)
    const hiddenMergedCount = autosavesAll.filter((item) => item.mergedInto).length;
    const autosaves = state.showMergedAutosaves ? autosavesAll : autosavesAll.filter((item) => !item.mergedInto);
    const rows = [...autosaves, ...sessions];
    elements.sessionStatus.textContent = `${number(sessions.length)} sessions | ${number(autosavesAll.length)} autosaves${!state.showMergedAutosaves && hiddenMergedCount ? ` (ซ่อนที่รวมแล้ว ${number(hiddenMergedCount)})` : ""}`;
    elements.sessionList.innerHTML = rows.length
      ? rows.map((session) => `
        <article class="session-item">
          <label class="session-pick" title="เลือกเพื่อรวม">
            <input type="checkbox" class="session-merge-pick" data-kind="${session.kind}" data-id="${htmlEscape(session.id)}" aria-label="เลือก ${htmlEscape(session.name || session.id)} เพื่อรวม" />
          </label>
          <div>
            <h3>${htmlEscape(session.name || session.id)}${session.kind === "autosave" ? ' <span class="session-badge">Autosave</span>' : ""}${session.mergedInto ? ` <span class="session-badge merged" title="รวมเข้า ${htmlEscape(session.mergedInto)} แล้ว">รวมแล้ว</span>` : ""}</h3>
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
    if (hiddenMergedCount && !state.showMergedAutosaves) {
      elements.sessionList.innerHTML += `<button class="ghost small show-merged-toggle" type="button" data-toggle-merged="show">แสดง autosave ที่รวมแล้ว (${number(hiddenMergedCount)})</button>`;
    } else if (hiddenMergedCount && state.showMergedAutosaves) {
      elements.sessionList.innerHTML += `<button class="ghost small show-merged-toggle" type="button" data-toggle-merged="hide">ซ่อน autosave ที่รวมแล้ว</button>`;
    }
    updateMergeSessionsButton();
  } catch (error) {
    console.error(error);
    elements.sessionStatus.textContent = "โหลดไม่สำเร็จ";
    elements.sessionList.innerHTML = `<div class="empty">โหลด session ไม่สำเร็จ: ${htmlEscape(error.message)}</div>`;
  }
}

function updateMergeSessionsButton() {
  if (!elements.mergeSessionsBtn) return;
  const picks = elements.sessionList.querySelectorAll(".session-merge-pick");
  const count = elements.sessionList.querySelectorAll(".session-merge-pick:checked").length;
  elements.mergeSessionsBtn.disabled = count < 2;
  elements.mergeSessionsBtn.textContent = count >= 2
    ? `รวมที่เลือก (${number(count)}) เป็น session เดียว`
    : "รวมที่เลือกเป็น session เดียว";
  if (elements.selectAllSessions) {
    elements.selectAllSessions.checked = picks.length > 0 && count === picks.length;
    elements.selectAllSessions.indeterminate = count > 0 && count < picks.length;
  }
}

// แสดงผลก่อน/หลังให้ตรวจ "ก่อน" ยืนยันรวม — คืน true เมื่อกดตกลง
function confirmMergePreview(sessions, mergedBills, mergedOverrides, mergedAudit) {
  return new Promise((resolve) => {
    if (!elements.mergeResultModal) {
      resolve(true);
      return;
    }
    const rawCount = sessions.reduce((sum, session) => sum + ((session.payload?.bills || []).length), 0);
    const mergedDuplicates = rawCount - mergedBills.length;
    const beforeList = sessions
      .map((session) => `<li>${htmlEscape(session.name || session.id)} — ${number((session.payload?.bills || []).length)} บิล</li>`)
      .join("");
    elements.mergeResultBody.innerHTML = `
      <p><strong>ก่อนรวม</strong> — ${number(sessions.length)} sessions (รวมดิบ ${number(rawCount)} บิล)</p>
      <ul>${beforeList}</ul>
      <p><strong>หลังรวม</strong> — <strong>${number(mergedBills.length)} บิล</strong>${mergedDuplicates > 0
        ? ` (บิลเลขซ้ำถูกรวมข้อมูลเข้าด้วยกัน ${number(mergedDuplicates)} ใบ แบบเก็บข้อมูลมากที่สุด)`
        : " (ไม่มีบิลเลขซ้ำ)"}</p>
      <p>ค่าที่แก้มือ ${number(Object.keys(mergedOverrides).length)} รายการ · ประวัติ audit ${number(mergedAudit.length)} รายการ</p>
      <p class="merge-warning">${state.bills.length
        ? `กดตกลงแล้วผลรวมจะแทนที่ข้อมูลบนจอ (${number(state.bills.length)} บิล) และให้ตั้งชื่อบันทึกเป็น session ใหม่ (ต้นฉบับไม่ถูกลบ)`
        : "กดตกลงแล้วให้ตั้งชื่อเพื่อบันทึกเป็น session ใหม่ (ต้นฉบับไม่ถูกลบ)"}</p>
    `;
    let settled = false;
    const finish = (ok) => {
      if (settled) return;
      settled = true;
      cleanup();
      if (elements.mergeResultModal.open) elements.mergeResultModal.close();
      resolve(ok);
    };
    const onOk = () => finish(true);
    const onCancel = () => finish(false);
    function cleanup() {
      elements.mergeResultOk.removeEventListener("click", onOk);
      elements.mergeResultCancel.removeEventListener("click", onCancel);
      elements.mergeResultClose.removeEventListener("click", onCancel);
      elements.mergeResultModal.removeEventListener("close", onCancel);
    }
    elements.mergeResultOk.addEventListener("click", onOk);
    elements.mergeResultCancel.addEventListener("click", onCancel);
    elements.mergeResultClose.addEventListener("click", onCancel);
    elements.mergeResultModal.addEventListener("close", onCancel);
    elements.mergeResultModal.showModal();
  });
}

async function mergeSelectedSessions() {
  const picks = [...elements.sessionList.querySelectorAll(".session-merge-pick:checked")]
    .map((checkbox) => ({ kind: checkbox.dataset.kind, id: checkbox.dataset.id }));
  if (picks.length < 2) return;
  try {
    elements.sessionStatus.textContent = "กำลังเตรียมผลรวม...";
    const docs = await Promise.all(picks.map((pick) => (
      pick.kind === "autosave" ? window.db.collection("cknc_monthly_autosaves") : window.db.collection("cknc_sessions")
    ).doc(pick.id).get()));
    const sessions = docs.filter((doc) => doc.exists).map((doc) => ({ id: doc.id, ...doc.data() }));
    if (sessions.length < 2) throw new Error("โหลดข้อมูล session ที่เลือกได้ไม่ครบ");
    const combined = combineSessionPayloads(sessions);

    // แสดงผลก่อน/หลังให้ตรวจ ก่อนลงมือจริง
    const confirmed = await confirmMergePreview(sessions, combined.bills, combined.overrides, combined.audit);
    if (!confirmed) {
      elements.sessionStatus.textContent = "ยกเลิกการรวม — ไม่มีอะไรเปลี่ยน";
      return;
    }

    state.bills = combined.bills;
    state.billOverrides = combined.overrides;
    state.billMergeGroups = combined.mergeGroups;
    state.deletedBillKeys = combined.deletedKeys;
    state.dismissedSuggestions = combined.dismissed;
    applyManualMergeGroups();
    applyDeletedBills();
    state.auditTrail = combined.audit;
    state.topMeds = [];
    state.clicknicRows = [];
    state.manualClicknicRows = [];
    state.mlpRows = [];
    state.billingRows = [];
    state.snapshotMode = true;
    state.activeSessionId = "";
    renderSnapshot();

    // บันทึกผลรวมเป็น session ใหม่อันเดียว (session ต้นทางไม่ถูกลบ)
    const monthLabels = [...new Set(sessions.map((session) => session.month).filter(Boolean))].join("+");
    const name = clean(prompt("ตั้งชื่อ session ที่รวมแล้ว", `CKNC Merge ${monthLabels || new Date().toISOString().slice(0, 10)} (${number(state.bills.length)} บิล)`) || "");
    if (name) {
      const doc = makeSessionPayload(name);
      const approxBytes = new Blob([JSON.stringify(doc)]).size;
      if (approxBytes > 900000) {
        alert("ผลรวมใหญ่เกินกว่าจะบันทึกเป็น session เดียวใน Firestore — ข้อมูลรวมยังอยู่บนจอ ใช้ Export XLSX เก็บแทนได้");
      } else {
        doc.createdAt = firebase.firestore.FieldValue.serverTimestamp();
        doc.updatedAt = firebase.firestore.FieldValue.serverTimestamp();
        doc.createdByUid = window.auth.currentUser.uid;
        doc.createdByEmail = window.auth.currentUser.email || "";
        const ref = window.db.collection("cknc_sessions").doc();
        await ref.set(doc);
        state.activeSessionId = ref.id;
        setSessionButtons();
        // ทำเครื่องหมาย autosave ที่รวมแล้ว → ซ่อนจากรายการ (จะโผล่กลับเองเมื่อเดือนนั้นมีข้อมูลใหม่)
        await Promise.all(picks.filter((pick) => pick.kind === "autosave").map((pick) =>
          window.db.collection("cknc_monthly_autosaves").doc(pick.id).set({
            mergedInto: name,
            mergedAt: firebase.firestore.FieldValue.serverTimestamp(),
          }, { merge: true })));
      }
    }
    elements.statusText.textContent = `รวม ${number(sessions.length)} sessions → ${number(state.bills.length)} บิล${name ? ` (บันทึก "${name}")` : ""}`;
    await loadSessionList();
  } catch (error) {
    console.error(error);
    alert(`รวม session ไม่สำเร็จ: ${error.message}`);
    elements.sessionStatus.textContent = "รวม session ไม่สำเร็จ";
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
    const applied = await applySessionSnapshot({ id: doc.id, ...doc.data() });
    if (!applied) {
      elements.sessionStatus.textContent = "ยกเลิกการโหลด — ข้อมูลเดิมคงอยู่";
      return;
    }
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
    const applied = await applySessionSnapshot({ id: doc.id, ...doc.data(), source: "autosave" });
    if (!applied) {
      elements.sessionStatus.textContent = "ยกเลิกการโหลด — ข้อมูลเดิมคงอยู่";
      return;
    }
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

// สรุปว่าเลข BAR ที่พิมพ์อยู่มีของเกาะอยู่เท่าไหร่ — 1 BAR : N AR โดยการออกแบบ
// นับรวมบิลใบที่เปิดอยู่ และไม่ผูกตัวกรองวันที่ ให้ตรงกับรายการที่กดเข้าไปดู
function barUsageSummary(value) {
  const bars = clean(value).split(",").map(clean).filter(Boolean).map((bar) => bar.toUpperCase());
  if (!bars.length) return { text: "", bills: 0 };
  const credits = new Set();
  let billCount = 0;
  activeBills().forEach((bill) => {
    const own = clean(bill.barNo).split(",").map(clean).filter(Boolean).map((bar) => bar.toUpperCase());
    if (!bars.some((bar) => own.includes(bar))) return;
    billCount += 1;
    clean(bill.creditNos).split(",").map(clean).filter(Boolean).forEach((ar) => credits.add(ar.toUpperCase()));
  });
  if (!billCount) return { text: "ยังไม่มีบิลไหนใช้เลขนี้", bills: 0 };
  return { text: `ใบวางบิลนี้: ${number(credits.size)} เครดิต (AR) · ${number(billCount)} บิล`, bills: billCount };
}

// ช่อง BAR ว่าง = พื้นส้มอ่อน เตือนให้ไล่เก็บเลขใบวางบิล · รูปแบบผิด = พื้นแดง (บันทึกไม่ผ่าน)
// บรรทัดใต้ช่องบอกจำนวน AR/บิลที่เกาะเลขนี้ — AR ≠ บิล เมื่อไหร่ = สัญญาณว่าเลขผิด
function updateBarEmptyHint() {
  if (!elements.editBarNo) return;
  const check = normalizeBarInput(elements.editBarNo.value);
  elements.editBarNo.classList.toggle("input-empty-warn", check.empty);
  elements.editBarNo.classList.toggle("input-bad-format", !check.empty && !check.ok);
  elements.editBarNo.title = check.ok ? "" : barInputErrorText(check);
  if (elements.editBarUsage) {
    const usage = barUsageSummary(elements.editBarNo.value);
    elements.editBarUsage.textContent = usage.text;
    // ไม่มีบิลให้ดู = ปุ่มกดไม่ได้ (ยังโชว์ข้อความอยู่)
    elements.editBarUsage.disabled = usage.bills === 0;
  }
}

// ช่องลำดับเคสใน drawer: label บอกเดือน/ปี + chip โค้ดเต็ม + เตือนแดงถ้าลำดับซ้ำกับบิลอื่น (เช็คสดตอนพิมพ์)
function updateCaseSeqDrawerHint(bill) {
  const input = elements.editCaseSeq;
  if (!input) return;
  const isSeqCase = Boolean(caseSeqNames[bill.caseType] && bill.caseSeqMonth);
  if (elements.editCaseSeqLabel) {
    elements.editCaseSeqLabel.textContent = isSeqCase
      ? `ลำดับเคสของเดือน · ${monthChipLabel(bill.caseSeqMonth)}`
      : "ลำดับเคสของเดือน";
  }
  input.classList.remove("case-seq-input-dup-red");
  if (!elements.editCaseSeqHint) return;
  if (!isSeqCase) {
    elements.editCaseSeqHint.innerHTML = "";
    return;
  }
  const monthNo = Number(bill.caseSeqMonth.split("-")[1]);
  // เลขที่กำลังจะใช้: พิมพ์ในช่อง = ใช้ตัวนั้น, ว่าง = เลข auto ปัจจุบัน
  const typed = Math.max(0, Math.round(toNumeric(input.value)));
  const effectiveSeq = typed > 0 ? typed : (bill.caseSeq || 0);
  const codeChip = effectiveSeq > 0
    ? `<span class="case-seq-chip case-${htmlEscape(bill.caseType)}">${htmlEscape(caseSeqCode(bill.caseType, effectiveSeq, monthNo))}</span>`
    : "";
  const dups = effectiveSeq > 0
    ? state.bills.filter((other) => other.billKey !== bill.billKey
        && other.caseType === bill.caseType
        && other.caseSeqMonth === bill.caseSeqMonth
        && other.caseSeq === effectiveSeq)
    : [];
  if (dups.length) {
    input.classList.add("case-seq-input-dup-red");
    const first = dups[0];
    const firstLabel = clean(first.orderId || first.orw) || "-";
    const extra = dups.length > 1 ? ` และอีก ${number(dups.length - 1)} ใบ` : "";
    elements.editCaseSeqHint.innerHTML = `${codeChip}
      <span class="case-seq-drawer-warn"><i class="fa-solid fa-triangle-exclamation"></i> ลำดับ #${number(effectiveSeq)} ซ้ำกับ ${htmlEscape(firstLabel)}${extra}</span>
      <button type="button" class="ghost small" data-caseseq-compare="${htmlEscape(bill.billKey)}" data-caseseq-dup="${htmlEscape(first.billKey)}" data-caseseq-dupcount="${dups.length}">เทียบข้อมูล</button>`;
  } else {
    elements.editCaseSeqHint.innerHTML = codeChip;
  }
}

function updateEditProfitPreview() {
  if (!elements.editProfit) return;
  const bill = currentDetailBill();
  const totalCost = elements.editCost
    ? toNumeric(elements.editCost.value) + toNumeric(elements.editMlpCost?.value)
    : toNumeric(bill?.cost) + toNumeric(bill?.mlpCost);
  const profit = toNumeric(elements.editSale.value) - totalCost;
  elements.editProfit.value = Number(profit).toLocaleString("th-TH", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  elements.editProfit.classList.toggle("profit-negative", profit < 0);
}

function openDetailDrawer(billKey) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  state.currentDetailKey = billKey;
  const drawerTitleText = bill.orderId || bill.orw || bill.billingNo || "รายละเอียดบิล";
  elements.drawerTitle.textContent = drawerTitleText;
  if (elements.drawerTitleCopy) {
    const copyable = clean(bill.orderId) || clean(bill.orw) || clean(bill.billingNo);
    elements.drawerTitleCopy.hidden = !copyable;
    elements.drawerTitleCopy.dataset.copyText = copyable;
  }
  const drawerIssues = bill.validationIssues || [];
  elements.drawerChecks.innerHTML = `
    ${statusBadgesHtml(bill)}
    ${drawerIssues.length
      ? drawerIssues.map((issue) => `<span class="validation-chip ${issue.level}">${htmlEscape(issue.text)}</span>`).join("")
      : '<span class="validation-chip">ตรวจสอบ: ผ่าน</span>'}
  `;

  elements.editStatus.value = bill.status;
  if (elements.editBillingStage) elements.editBillingStage.value = bill.billingStage || "pending-review";
  renderEditBillingStageChips();
  if (elements.editPatient) elements.editPatient.value = bill.patient || "";
  if (elements.editRefId) elements.editRefId.value = bill.refId || "";
  if (elements.editPhone) elements.editPhone.value = bill.phone || "";
  if (elements.editAddress) elements.editAddress.value = bill.address || "";
  if (elements.editExpectedClaim) elements.editExpectedClaim.value = fixed2(bill.expectedClaim);
  if (elements.editExpectedClaimLabel) {
    // label ตามประเภทเคส: สปสช = CKNC-NHSO, ประกัน = CKNC-INS, อื่น ๆ = รวม
    const claimCode = bill.caseType === "nhso" ? "CKNC-NHSO" : bill.caseType === "insurance" ? "CKNC-INS" : "CKNC-INS/NHSO";
    elements.editExpectedClaimLabel.textContent = `ยอดเรียกเก็บ (${claimCode})`;
  }
  elements.editOrw.value = bill.orw || "";
  elements.editInvoice.value = bill.invoice || "";
  if (elements.editBarNo) {
    elements.editBarNo.value = bill.barNo || "";
    updateBarEmptyHint();
  }
  if (elements.editCreditNos) elements.editCreditNos.value = bill.creditNos || "";
  if (elements.editCaseSeq) {
    elements.editCaseSeq.value = toNumeric(bill.caseSeqManual) > 0 ? Math.round(toNumeric(bill.caseSeqManual)) : "";
    elements.editCaseSeq.placeholder = bill.caseSeq ? `เว้นว่าง = นับอัตโนมัติ (ตอนนี้ #${number(bill.caseSeq)})` : "เว้นว่าง = นับอัตโนมัติ";
    updateCaseSeqDrawerHint(bill);
  }
  elements.editClicknicDate.value = formatDisplayDate(bill.clicknicDate);
  elements.editMlpDate.value = formatDisplayDate(bill.mlpDate);
  elements.editBillingDueDate.value = formatDisplayDate(bill.billingDueDate);
  if (elements.editCost) elements.editCost.value = fixed2(bill.cost);
  if (elements.editMlpCost) elements.editMlpCost.value = fixed2(bill.mlpCost);
  elements.editSale.value = fixed2(bill.sale);
  elements.editBilledAmount.value = fixed2(bill.billedAmount);
  updateEditProfitPreview();
  elements.editExcluded.checked = Boolean(bill.excluded);
  elements.editExcludeReason.value = bill.excludeReason || "";
  elements.editOverrideNote.value = bill.overrideNote || "";
  if (elements.editDiagnosis) elements.editDiagnosis.value = billDiagnosis(bill);

  const baseLines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  state.drawerMedicines = baseLines.map((line) => ({
    medicine: line.medicine || "",
    qty: toNumeric(line.qty),
    sale: toNumeric(line.sale),
    cost: toNumeric(line.cost),
    realCost: toNumeric(line.realCost),
    realCostEdited: toNumeric(line.realCost) > 0, // ต้นทุนที่เคยเซฟ = ถือว่าผู้ใช้กำหนดแล้ว ไม่ให้ autofill ทับ
    supplier: line.supplier || "",                // เจ้า/ผู้ขาย (โค้ดทะเบียน suppliers หรือชื่อดิบ)
  }));
  renderDrawerMedicines(bill);

  if (!elements.detailDrawer.open) elements.detailDrawer.showModal();
}

function closeDetailDrawer() {
  if (elements.detailDrawer.open) elements.detailDrawer.close();
  state.currentDetailKey = "";
  state.drawerMedicines = [];
}

function renderDrawerMedicines(bill) {
  const lines = state.drawerMedicines || [];
  if (!lines.length) {
    elements.drawerMedicines.innerHTML = `<div class="empty">ไม่มีรายการยา — กด "+ เพิ่มรายการยา" เพื่อใส่เอง</div>`;
    return;
  }
  const source = bill?.hasManualMedicines ? "จาก Screenshot/manual" : "จาก Excel";
  const round2 = (v) => Math.round(v * 100) / 100;
  const rowsHtml = lines.map((line, index) => {
    const qty = toNumeric(line.qty);
    const sale = toNumeric(line.sale);
    const mlp = toNumeric(line.cost);
    const realCost = toNumeric(line.realCost);
    const unit = qty > 0 ? round2(sale / qty) : round2(sale);
    const mlpUnit = qty > 0 ? round2(mlp / qty) : round2(mlp);
    const costUnit = qty > 0 ? round2(realCost / qty) : round2(realCost);
    const name = htmlEscape(line.medicine || "");
    const linked = state.medicineAliasMap.has(normalizeMedicineKey(line.medicine || ""));
    const lineProfit = round2(mlp - realCost); // กำไรบรรทัด = MLP คิด CKNC − ต้นทุนจริง
    return `
    <div class="drawer-list-item med-line" title="${source}">
      <input class="inline-cell-input med-name-input" type="text" value="${name}" placeholder="ชื่อยา" list="cknc-master-list" data-drawer-med-index="${index}" data-drawer-med-field="medicine" aria-label="ชื่อยา" />
      <button class="med-link-btn${linked ? " linked" : ""}" type="button" data-drawer-med-link="${index}" title="${linked ? "ลิงก์ master แล้ว · คลิกเพื่อเปลี่ยน" : "ลิงก์ยานี้เข้า master (แล้วดึงต้นทุนอัตโนมัติ)"}" aria-label="ลิงก์เข้า master"><i class="fa-solid fa-link"></i></button>
      <input class="inline-cell-input med-input" type="text" inputmode="decimal" value="${qty}" data-drawer-med-index="${index}" data-drawer-med-field="qty" aria-label="จำนวน ${name || "ยาใหม่"}" title="จำนวน" />
      <span class="med-x">×</span>
      <span class="med-tag med-tag-ck" title="ราคาที่ CKNC เรียกจากประกัน">CKNC</span>
      <input class="inline-cell-input med-input med-price" type="text" inputmode="decimal" value="${unit > 0 ? unit : ""}" placeholder="ราคา" data-drawer-med-index="${index}" data-drawer-med-field="unitPrice" aria-label="ราคา CKNC ต่อหน่วย ${name || "ยาใหม่"}" title="ราคา CKNC เรียกประกัน (ต่อหน่วย)" />
      <span class="med-tag med-tag-mlp" title="ราคาที่ MLP คิดกับ CKNC">MLP</span>
      <input class="inline-cell-input med-input med-price med-price-mlp" type="text" inputmode="decimal" value="${mlpUnit > 0 ? mlpUnit : ""}" placeholder="ราคา" data-drawer-med-index="${index}" data-drawer-med-field="mlpUnitPrice" aria-label="ราคา MLP ต่อหน่วย ${name || "ยาใหม่"}" title="ราคา MLP คิด CKNC (ต่อหน่วย)" />
      <span class="med-tag med-tag-cost" title="ต้นทุนจริงต่อหน่วย (ดึงจาก master COST)">ทุน</span>
      <input class="inline-cell-input med-input med-price med-price-cost" type="text" inputmode="decimal" value="${costUnit > 0 ? costUnit : ""}" placeholder="ทุน" ${line.realCostEdited ? 'data-user-edited="1"' : ""} data-drawer-med-index="${index}" data-drawer-med-field="realCost" aria-label="ต้นทุนจริงต่อหน่วย ${name || "ยาใหม่"}" title="ต้นทุนจริง (ต่อหน่วย) ดึงจาก master" />
      <span class="med-supplier-cell">
        <span class="med-tag med-tag-supplier" title="เจ้า/ผู้ขายของยานี้ (ทะเบียน suppliers)">เจ้า</span>
        <input class="inline-cell-input med-input med-supplier-input" type="text" value="${htmlEscape(line.supplier || "")}" placeholder="เจ้า" autocomplete="off" data-drawer-med-index="${index}" data-drawer-med-field="supplier" aria-label="เจ้า/ผู้ขาย ${name || "ยาใหม่"}" title="เจ้า/ผู้ขาย — เลือกจากทะเบียน หรือพิมพ์เอง (ชื่อดิบจะแปลงเป็นโค้ดให้)" />
      </span>
      <span class="med-line-total" title="กำไรบรรทัด = MLP คิด CKNC − ต้นทุนจริง">${realCost > 0 ? `กำไร ${money(lineProfit)}` : (mlp > 0 ? `= ${money(mlp)}` : "")}</span>
      <button class="icon-button med-remove-btn" type="button" data-drawer-med-remove="${index}" title="ลบรายการนี้" aria-label="ลบ ${name || "ยาใหม่"}">×</button>
    </div>`;
  }).join("");
  // แถวสรุปต้นทุนจริง + ปุ่มคัดลอกไปช่อง "ต้นทุน CKNC" (ไม่แตะ bill.cost อัตโนมัติ — money field กดเองชัดเจน)
  const totalRealCost = round2(lines.reduce((s, l) => s + toNumeric(l.realCost), 0));
  const footerHtml = totalRealCost > 0
    ? `<div class="med-costsum-row">
        <span class="med-costsum-label">ต้นทุนจริงรวม <strong>${money(totalRealCost)}</strong></span>
        <button type="button" class="ghost small med-apply-cost-btn" data-drawer-apply-cost="${totalRealCost}" title="คัดลอกยอดนี้ไปช่อง 'ต้นทุน CKNC' ด้านบน">↑ ใช้เป็นต้นทุน CKNC</button>
      </div>`
    : "";
  elements.drawerMedicines.innerHTML = rowsHtml + footerHtml;
}

// เติมราคา MLP + ต้นทุนจริงจาก master ให้ทุกแถวที่ map ได้ (ช่องว่าง/ยังไม่แก้เอง) — เรียกหลังลิงก์ยาเข้า master
function autofillDrawerMedicinesFromMaster() {
  const lines = state.drawerMedicines || [];
  if (!lines.length) return;
  const round2 = (v) => Math.round(v * 100) / 100;
  lines.forEach((line) => {
    const master = resolveMasterProduct(line.medicine);
    if (!master) return;
    const qtyN = toNumeric(line.qty) || 1;
    if (toNumeric(line.cost) <= 0) {
      const lm = masterLinemanOf(master);
      if (lm > 0) line.cost = round2(qtyN * lm);
    }
    if (!line.realCostEdited && toNumeric(line.realCost) <= 0) {
      const mc = masterCostOf(master);
      if (mc > 0) line.realCost = round2(qtyN * mc);
    }
    if (!line.supplier) { const sup = masterSupplierOf(master); if (sup) line.supplier = sup; } // เจ้าทุนต่ำสุดจาก master
  });
  const mlpTotal = round2(lines.reduce((s, l) => s + toNumeric(l.cost), 0));
  if (mlpTotal > 0) elements.editSale.value = fixed2(mlpTotal);
  renderDrawerMedicines(currentDetailBill());
  updateEditProfitPreview();
}

const pasteAnalyzeFieldDefs = [
  { key: "patient", label: "ผู้รับบริการ", type: "text" },
  { key: "clicknicDate", label: "วันที่ CLICKNIC", type: "date" },
  { key: "caseType", label: "ประเภทเคส", type: "case" },
  { key: "refId", label: "Ref-ID", type: "text" },
  { key: "phone", label: "เบอร์โทร", type: "text" },
  { key: "address", label: "ที่อยู่", type: "text" },
  { key: "expectedClaim", label: "ยอดเรียกเก็บ (CKNC-INS/NHSO)", type: "number" },
  { key: "sale", label: "ยอดขายยา (MLP เรียกเก็บ)", type: "number" },
  { key: "diagnosis", label: "คำวินิจฉัย", type: "text" },
];

// ประเภทเคสจากข้อความในวงเล็บ — สปสช ต้องตรวจก่อน general เพราะ "(สปสช โรคทั่วไป)" มีคำว่า "ทั่วไป" ด้วย
function caseTypeFromPasteText(caseText) {
  if (/ประกัน|เคลม|insurance/i.test(caseText)) return "insurance";
  if (/สปสช|บัตรทอง/i.test(caseText)) return "nhso";
  if (/เงินสด|ทั่วไป|general/i.test(caseText)) return "general";
  return "";
}

// ตัดจุดไข่ปลา/เครื่องหมายคั่นท้ายคำวินิจฉัย ("Acute sinusitis ..." -> "Acute sinusitis")
function trimDiagnosis(value) {
  return clean(value).replace(/[\s.·:;,\-–—…]+$/u, "");
}

// วันที่แบบไทย "12 กรกฎาคม 2569" (ชื่อเดือน + ปี พ.ศ.) -> "2026-07-12"
const TH_MONTHS = { "มกราคม": 1, "กุมภาพันธ์": 2, "มีนาคม": 3, "เมษายน": 4, "พฤษภาคม": 5, "มิถุนายน": 6, "กรกฎาคม": 7, "สิงหาคม": 8, "กันยายน": 9, "ตุลาคม": 10, "พฤศจิกายน": 11, "ธันวาคม": 12 };
const TH_MONTH_ALT = Object.keys(TH_MONTHS).join("|");
function parseThaiDateKey(text) {
  const m = String(text || "").match(new RegExp(`(\\d{1,2})\\s*(${TH_MONTH_ALT})\\s*(\\d{4})`));
  if (!m) return "";
  const day = Number(m[1]), month = TH_MONTHS[m[2]], year = Number(m[3]);
  const ce = year > 2400 ? year - 543 : year; // 2569 พ.ศ. -> 2026 ค.ศ.
  return `${ce}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseBillPasteText(rawText) {
  const text = String(rawText || "").replace(/\r/g, "");
  if (!clean(text)) return null;
  const result = {
    patient: "",
    refId: "",
    orderId: "",
    phone: "",
    address: "",
    caseType: "",
    clicknicDate: "",
    expectedClaim: 0,
    sale: 0,
    diagnosis: "",
  };

  // คำวินิจฉัย: รองรับหัวข้อชัดเจน "วินิจฉัย: ..." / "Dx: ..." / "อาการ: ..." (บรรทัดเดียว)
  result.diagnosis = trimDiagnosis(text.match(/(?:^|\n)\s*(?:คำวินิจฉัย|การวินิจฉัย|วินิจฉัย|อาการ|diagnosis|dx)\s*[:：]\s*(.+)/i)?.[1]);

  result.refId = text.match(/Ref-?\s*ID\s*:?\s*(R-?\d+)/i)?.[1]
    || text.match(/(?:^|\s)#\s*(R-?\d+)/im)?.[1]
    || "";
  result.orderId = findOrderId(text);

  // ชื่อหยุดที่วงเล็บประเภท หรือคำว่า "ประเภท" (อยู่บรรทัดเดียวกันหรือคนละบรรทัดก็ได้)
  const nameMatch = text.match(/รายการของ\s*(.+?)\s*(?:ประเภท|\(|$)/m);
  if (nameMatch) result.patient = clean(nameMatch[1]);
  // รูปแบบ "[Ref-ID : R-xxx] ชื่อ (ประเภท ...)" — ชื่ออยู่ระหว่าง ] กับ ( บรรทัดแรก
  if (!result.patient) {
    const bracketName = text.match(/\]\s*([^()\[\]\n]+?)\s*\(/);
    if (bracketName) result.patient = clean(bracketName[1]);
  }

  // ประเภทเคสอยู่ในวงเล็บ: "(สปสช โรคทั่วไป)" — ท้ายชื่อ หรือหลัง "ประเภท:" คนละบรรทัดก็ได้
  // ข้อความหลังวงเล็บบนบรรทัด "ประเภท:" คือคำวินิจฉัย เช่น "ประเภท: (สปสช โรคทั่วไป) Acute sinusitis"
  // ไม่มีวงเล็บ ("ประเภท: สปสช โรคทั่วไป") ใช้อ่านประเภทได้ แต่ห้ามเอาไปเป็นคำวินิจฉัย
  const typeLine = text.match(/ประเภท\s*[:：]?\s*\(([^)]*)\)\s*(.*)/);
  const caseText = clean(typeLine?.[1]
    || text.match(/รายการของ\s*.+?\s*\(([^)]*)\)/m)?.[1]
    || text.match(/\]\s*[^()\[\]\n]+?\s*\(([^)]*)\)/)?.[1]   // "[Ref-ID : R-xxx] ชื่อ (ประเภท ...)"
    || text.match(/ประเภท\s*[:：]\s*(.*)/)?.[1]
    || "");
  result.caseType = caseTypeFromPasteText(caseText);
  if (!result.diagnosis && typeLine) result.diagnosis = trimDiagnosis(typeLine[2]);
  // บรรทัด "เลขบิล-ชื่อ-เบอร์โทร-n" ใช้เป็น fallback ของชื่อ และเป็นแหล่งเบอร์โทรหลัก
  const orderLineMatch = text.match(/^.*?0?20\d{13,14}-(.+?)-(0\d{8,9})(?:-\d+)?\s*$/m);
  if (orderLineMatch) {
    if (!result.patient) result.patient = clean(orderLineMatch[1]);
    result.phone = orderLineMatch[2];
  }
  if (!result.phone) {
    // ตัด Ref-ID ทิ้งก่อน กันเลขใน R-0xxxxxxxxx ถูกอ่านเป็นเบอร์โทร
    const textWithoutRefId = text.replace(/R-?\d+/gi, " ");
    const loosePhone = textWithoutRefId.match(/(?:^|[\s-])(0\d{9})(?!\d)/m);
    if (loosePhone && !findOrderId(loosePhone[1])) result.phone = loosePhone[1];
  }
  // รูปแบบ memo "#R-xxx": บรรทัด "เลขบิล-ชื่อ(-รหัสไปรษณีย์)-ยอด-จำนวน" ไม่มีเบอร์โทร/วันที่
  if (!orderLineMatch) {
    const memoLine = text.match(/^.*?020\d{13}-(.+?)-([\d,]+(?:\.\d+)?)(?:-(\d+))?(?:\s+\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\s+\d{1,2}[:.]\d{2})?\s*$/m);
    if (memoLine) {
      const memoField1 = clean(memoLine[1].split(/-(?=\d)/)[0]);
      // ฟิลด์แรกหลังเลขบิลเป็นเบอร์โทร (รูปแบบ เลขบิล-เบอร์-ยอด-จำนวน) ไม่ใช่ชื่อ
      if (/^0\d{8,9}$/.test(memoField1)) {
        if (!result.phone) result.phone = memoField1;
      } else if (!result.patient) {
        result.patient = memoField1;
      }
      // กันเลขที่หน้าตาเป็นเบอร์โทรถูกอ่านเป็นยอดขาย
      if (!/^0\d{8,9}$/.test(memoLine[2])) result.sale = toNumeric(memoLine[2]);
      if (!result.address) {
        const lineEnd = text.indexOf(memoLine[0]) + memoLine[0].length;
        let addr = text.slice(lineEnd).replace(/\s+/g, " ");
        // ตัดวันที่ไทย/เวลาท้ายที่อยู่ออก ("... 10530 12 กรกฎาคม 2569 เวลา 10:09" -> "... 10530")
        addr = addr.replace(new RegExp(`\\s*\\d{1,2}\\s*(?:${TH_MONTH_ALT})\\s*\\d{4}.*$`), "")
          .replace(/\s*(?:เวลา\s*)?\d{1,2}[:.]\d{2}.*$/, "")
          .replace(/\s*\d{1,2}[/.]\d{1,2}[/.]\d{2,4}\s*$/, "");
        result.address = clean(addr);
      }
    }
  }

  const dtMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+\d{1,2}[:.]\d{2}/);
  if (dtMatch) result.clicknicDate = dateKey(dtMatch[1]);
  // วันที่แบบไทย "12 กรกฎาคม 2569"
  if (!result.clicknicDate) result.clicknicDate = parseThaiDateKey(text);
  // สำรอง: วันที่ฝังในเลขบิล CLICKNIC (0-YYYY-MM-DD...)
  if (!result.clicknicDate && result.orderId) result.clicknicDate = orderIdEmbeddedDate(result.orderId);

  const amountMatch = text.match(/\d{1,2}[:.]\d{2}\s+([\d,]+(?:\.\d+)?)\s*-\s*([\d,]+(?:\.\d+)?)/)
    || text.match(/([\d,]+(?:\.\d+)?)\s*-\s*([\d,]+(?:\.\d+)?)\s*$/);
  if (amountMatch) {
    result.expectedClaim = toNumeric(amountMatch[1]);
    result.sale = toNumeric(amountMatch[2]);
  }

  // ที่อยู่ = ข้อความระหว่างบรรทัดเลขบิล กับตำแหน่งวันที่/เวลา
  if (dtMatch) {
    let from = 0;
    if (orderLineMatch) {
      const orderLineEnd = text.indexOf(orderLineMatch[0]) + orderLineMatch[0].length;
      if (orderLineEnd > 0 && orderLineEnd < dtMatch.index) from = orderLineEnd;
    }
    if (!from) from = text.lastIndexOf("\n", dtMatch.index) + 1;
    const addressCandidate = clean(text.slice(from, dtMatch.index));
    // มีเลขบิลปนอยู่ = ตัดมาไม่ถูกช่วง ไม่ใช่ที่อยู่
    if (!result.address && addressCandidate && !findOrderId(addressCandidate)) {
      result.address = addressCandidate;
    }
  }

  return result;
}

// เลขบิล CLICKNIC ฝังวันที่ไว้: 0 + ค.ศ. 4 หลัก + เดือน 2 + วัน 2 เช่น 0202606161077945 -> 2026-06-16
function orderIdEmbeddedDate(orderId) {
  const match = clean(orderId).match(/^0(20\d{2})(\d{2})(\d{2})/);
  if (!match) return "";
  const [, year, month, day] = match;
  if (Number(month) < 1 || Number(month) > 12 || Number(day) < 1 || Number(day) > 31) return "";
  return `${year}-${month}-${day}`;
}

function currentPasteAnalyzeBill() {
  return state.bills.find((bill) => bill.billKey === state.pasteAnalyzeKey);
}

// ชื่อบิลที่กำลังแก้ — อยู่ใต้หัวข้อโมดัล (มีที่ให้ยาว) ไม่ใช่ในแถวปุ่มที่จะไปเบียดปุ่มจนห่อบรรทัด
// เลขที่ออเดอร์มาก่อนชื่อคน เพราะเป็นตัวระบุที่สั้นและไม่ซ้ำ ส่วนชื่อบางใบปนข้อความดิบมาทั้งบรรทัด
function setPasteAnalyzeTarget(bill) {
  if (!elements.pasteAnalyzeTarget) return;
  const id = clean(bill.orderId) || clean(bill.orw) || "-";
  const name = clean(bill.patient);
  elements.pasteAnalyzeTarget.textContent = name ? `${id} · ${name}` : id;
  elements.pasteAnalyzeTarget.title = name ? `${id} · ${name}` : id;
}

function openPasteAnalyze(billKey) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  state.pasteAnalyzeKey = billKey;
  elements.pasteAnalyzeText.value = "";
  elements.pasteAnalyzeWarnings.innerHTML = "";
  elements.pasteAnalyzeResults.innerHTML = `<div class="empty">วางข้อความแล้วผลวิเคราะห์จะแสดงที่นี่</div>`;
  setPasteAnalyzeTarget(bill);
  elements.pasteAnalyzeStatus.textContent = "วางข้อความรายการจาก CLICKNIC แล้วระบบจะวิเคราะห์อัตโนมัติ";
  // ใช้ตัวเดียวกับตอนติ๊ก/เอาติ๊กออก — ผลวิเคราะห์เพิ่งถูกล้าง นับได้ 0 → ปุ่ม disabled + ป้ายกลับเป็นค่าเริ่มต้นเอง
  updatePasteApplyState();
  if (!elements.pasteAnalyzeModal.open) elements.pasteAnalyzeModal.showModal();
  elements.pasteAnalyzeText.focus();
}

function closePasteAnalyzeModal() {
  if (elements.pasteAnalyzeModal.open) elements.pasteAnalyzeModal.close();
  state.pasteAnalyzeKey = "";
}

function pasteFieldNormalized(def, value) {
  if (def.type === "date") return dateKey(value);
  if (def.type === "number") return toNumeric(value);
  return clean(value || "");
}

function pasteFieldCurrentDisplay(bill, def) {
  if (def.type === "date") return formatDisplayDate(bill[def.key]) || "-";
  if (def.type === "number") return money(toNumeric(bill[def.key]));
  if (def.type === "case") return caseTypeLabel(bill.caseType);
  return clean(bill[def.key]) || "-";
}

function renderPasteAnalyzeWarnings(bill, parsed) {
  const chips = [];
  if (parsed.orderId && bill.orderId && parsed.orderId !== bill.orderId) {
    chips.push(`<span class="validation-chip danger">เลขที่ออเดอร์ในข้อความ (${htmlEscape(parsed.orderId)}) ไม่ตรงกับแถวนี้ (${htmlEscape(bill.orderId)})</span>`);
    const target = state.bills.find((item) => item.orderId === parsed.orderId);
    if (target) {
      chips.push(`<button class="ghost small" type="button" data-paste-switch="${htmlEscape(target.billKey)}">สลับไปใช้กับบิล ${htmlEscape(target.patient || target.orderId)}</button>`);
    }
  }
  const embeddedDate = orderIdEmbeddedDate(parsed.orderId || bill.orderId);
  if (embeddedDate && parsed.clicknicDate && embeddedDate !== parsed.clicknicDate) {
    chips.push(`<span class="validation-chip warn">วันที่ในข้อความ (${formatDisplayDate(parsed.clicknicDate)}) ไม่ตรงกับวันที่ในเลขที่ออเดอร์ (${formatDisplayDate(embeddedDate)})</span>`);
  }
  elements.pasteAnalyzeWarnings.innerHTML = chips.join("");
}

// ปุ่มหลักบอก "จะเกิดอะไร" ไม่ใช่แค่ "ทำอะไร" — และตอบในตัวว่าทำไมตอนนี้ถึงกดไม่ได้
function updatePasteApplyState() {
  const count = elements.pasteAnalyzeResults.querySelectorAll("[data-paste-apply]:checked").length;
  elements.applyPasteAnalyzeBtn.disabled = count === 0;
  elements.applyPasteAnalyzeBtn.textContent = count ? `นำไปใช้ ${number(count)} ช่อง` : "เลือกช่องที่จะใช้";
  if (elements.pasteAnalyzeSummary) {
    elements.pasteAnalyzeSummary.textContent = count ? `เลือกไว้ ${number(count)} ช่อง` : "ยังไม่ได้เลือกช่อง";
  }
}

function runPasteAnalyze() {
  const bill = currentPasteAnalyzeBill();
  if (!bill) return;
  const parsed = parseBillPasteText(elements.pasteAnalyzeText.value);
  if (!parsed) {
    elements.pasteAnalyzeWarnings.innerHTML = "";
    elements.pasteAnalyzeResults.innerHTML = `<div class="empty">วางข้อความแล้วผลวิเคราะห์จะแสดงที่นี่</div>`;
    elements.pasteAnalyzeStatus.textContent = "วางข้อความรายการจาก CLICKNIC แล้วระบบจะวิเคราะห์อัตโนมัติ";
    updatePasteApplyState();
    return;
  }
  renderPasteAnalyzeWarnings(bill, parsed);

  let foundCount = 0;
  elements.pasteAnalyzeResults.innerHTML = pasteAnalyzeFieldDefs.map((def) => {
    const parsedValue = parsed[def.key];
    const hasValue = def.type === "number" ? toNumeric(parsedValue) > 0 : Boolean(clean(parsedValue));
    if (hasValue) foundCount += 1;
    const changed = hasValue && pasteFieldNormalized(def, parsedValue) !== pasteFieldNormalized(def, def.type === "case" ? bill.caseType : bill[def.key]);
    const checked = changed ? "checked" : "";
    let valueInput = "";
    if (def.type === "case") {
      const selectedCase = clean(parsedValue) || bill.caseType || "unknown";
      valueInput = `<select data-paste-value="${def.key}">${caseTypeOptions.map(([key, label]) => `<option value="${key}" ${key === selectedCase ? "selected" : ""}>${label}</option>`).join("")}</select>`;
    } else if (def.type === "number") {
      valueInput = `<input type="text" inputmode="decimal" data-paste-value="${def.key}" value="${hasValue ? toNumeric(parsedValue) : ""}" placeholder="ไม่พบ" />`;
    } else if (def.type === "date") {
      valueInput = `<span class="date-field">
        <input type="text" inputmode="numeric" data-paste-value="${def.key}" value="${hasValue ? formatDisplayDate(parsedValue) : ""}" placeholder="วว/ดด/ปปปป" />
        <button type="button" class="date-pick-btn" title="เลือกวันที่จากปฏิทิน" aria-label="เลือกวันที่จากปฏิทิน"><i class="fa-solid fa-calendar-days"></i></button>
        <input type="date" class="date-picker-hidden" tabindex="-1" aria-hidden="true" />
      </span>`;
    } else {
      valueInput = `<input type="text" data-paste-value="${def.key}" value="${htmlEscape(clean(parsedValue) || "")}" placeholder="ไม่พบ" />`;
    }
    // สถานะแถวช่วยกวาดตา: เขียว = ค่าจะเปลี่ยน, จางเท่ากันทั้งคู่ = ค่าเท่าเดิม, จางมาก = วิเคราะห์ไม่พบ
    const stateClass = !hasValue ? "paste-field-empty" : (changed ? "paste-field-changed" : "paste-field-same");
    return `
    <label class="paste-field ${stateClass}">
      <input type="checkbox" data-paste-apply="${def.key}" ${checked} aria-label="ใช้ค่า ${def.label}" />
      <span class="paste-field-label">${def.label}</span>
      <span class="paste-field-old" title="ค่าปัจจุบันของบิลนี้">เดิม: ${htmlEscape(pasteFieldCurrentDisplay(bill, def))}${hasValue && !changed ? " · เท่าเดิม" : ""}</span>
      ${valueInput}
    </label>`;
  }).join("");

  elements.pasteAnalyzeStatus.textContent = foundCount
    ? `วิเคราะห์พบ ${number(foundCount)} ฟิลด์ ติ๊กเลือกแล้วกดนำไปใช้`
    : "วิเคราะห์ไม่พบข้อมูล ลองตรวจรูปแบบข้อความ";
  updatePasteApplyState();
}

function switchPasteAnalyzeTarget(billKey) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  state.pasteAnalyzeKey = billKey;
  setPasteAnalyzeTarget(bill);
  runPasteAnalyze();
}

function applyPasteAnalyzeToBill() {
  const bill = currentPasteAnalyzeBill();
  if (!bill) return;
  const values = {};
  const appliedLabels = [];
  pasteAnalyzeFieldDefs.forEach((def) => {
    const checkbox = elements.pasteAnalyzeResults.querySelector(`[data-paste-apply="${def.key}"]`);
    if (!checkbox || !checkbox.checked) return;
    const input = elements.pasteAnalyzeResults.querySelector(`[data-paste-value="${def.key}"]`);
    if (!input) return;
    let value;
    if (def.type === "number") {
      value = toNumeric(input.value);
    } else if (def.type === "date") {
      value = dateKey(input.value);
      if (!value) return;
    } else {
      value = clean(input.value);
      if (!value) return;
    }
    values[def.key] = value;
    if (def.key === "caseType") values.caseTypeSource = "manual-paste";
    appliedLabels.push(def.label);
  });
  if (!appliedLabels.length) return;

  const existing = state.billOverrides[bill.billKey] || {};
  // เปลี่ยนประเภทเคสแล้ว งานวางบิลที่ไม่ได้แก้มือ ให้คำนวณใหม่ตามประเภทเคส (เหมือน quickUpdateCaseType)
  if (values.caseType && (existing.values?.billingStageSource || bill.billingStageSource) !== "manual") {
    const stageDetection = deriveBillingStage(bill.status, values.caseType, bill.barNo, bill.creditNos);
    values.billingStage = stageDetection.billingStage;
    values.billingStageSource = stageDetection.billingStageSource;
  }
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      ...values,
    },
    note: existing.note || "วิเคราะห์จากข้อความ paste",
    updatedAt: new Date().toISOString(),
  };
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "paste_analyze_apply",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: values.clicknicDate || bill.clicknicDate || bill.mlpDate,
    lineCount: 0,
    totalSale: values.sale !== undefined ? values.sale : bill.sale,
    totalCost: bill.cost,
    screenshotName: "paste-analyze",
    replacedLineCount: 0,
    note: `วิเคราะห์จากข้อความ paste: ${appliedLabels.join(", ")}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("paste-analyze");
  closePasteAnalyzeModal();
  // เปิดจากปุ่มใน drawer: โหลดค่าใหม่เข้า drawer ให้เห็นผลทันที
  if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
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
  const stageDetection = deriveBillingStage(bill.status, caseType, bill.barNo, bill.creditNos);
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

function quickUpdateBillingStage(billKey, billingStage, paidDate = null) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const existing = state.billOverrides[bill.billKey] || {};
  const currentBillingStage = existing.values?.billingStage || bill.billingStage || "pending-review";
  if (currentBillingStage === billingStage && !paidDate) return;
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      billingStage,
      billingStageSource: "manual",
      ...(paidDate ? { paidDate } : {}), // วันที่ได้รับเงิน (เก็บตอนกด PAID) — ไหลเข้า bill.paidDate ผ่าน applyBillOverride
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
    note: `${billingStageLabel(currentBillingStage)} -> ${billingStageLabel(billingStage)}${paidDate ? ` · รับเงิน ${formatDisplayDate(paidDate)}` : ""}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("billing-stage-update");
}

// แก้เฉพาะ "วันที่ได้รับเงิน" ของบิลที่ PAID แล้ว (กดชิปวันรับเงินในตาราง) — ไม่แตะสถานะ
function setBillPaidDate(billKey, paidDate) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const existing = state.billOverrides[bill.billKey] || {};
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: { ...(existing.values || {}), paidDate },
    note: existing.note || "แก้วันที่ได้รับเงิน",
    updatedAt: new Date().toISOString(),
  };
  rebuildBillsForCurrentMode();
  renderTable();
  scheduleAutosave("paid-date-update");
  showToast(`ตั้งวันที่ได้รับเงิน ${formatDisplayDate(paidDate)} แล้ว`);
}

// บิลทั้งหมดที่ใช้ใบวางบิล (BAR) เดียวกัน — ปกติจ่ายมาพร้อมกันทั้ง BAR
function billsSharingBar(barNo) {
  const target = normRef(barNo);
  if (!target) return [];
  return state.bills.filter((bill) => !bill.excluded && normRef(bill.barNo) === target);
}

// ตั้ง PAID + วันที่ได้รับเงิน ให้ทุกบิลของ BAR นี้รวดเดียว
function markBarPaid(barNo, paidDate) {
  const bills = billsSharingBar(barNo);
  if (!bills.length) return 0;
  const keys = new Set(bills.map((bill) => bill.billKey));
  applyBulkOverride(() => ({
    billingStage: "paid",
    billingStageSource: "manual",
    paidDate,
  }), `จ่าย PAID ทั้ง BAR ${clean(barNo)} · รับเงิน ${formatDisplayDate(paidDate)}`, keys);
  return keys.size;
}

const inlineFieldLabels = {
  clicknicDate: "วันที่ CLICKNIC",
  mlpDate: "วันที่ MLP",
  billingDueDate: "ครบกำหนดใบวางบิล",
  sale: "ยอดขายยา",
  cost: "ต้นทุนยา",
  mlpCost: "ค่าใช้จ่าย MLP",
  totalCost: "ต้นทุน",
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
  // ต้นทุนรวม: บิลถูก merge override แล้ว ค่าปัจจุบัน = ต้นทุนยา + ค่าใช้จ่าย MLP; แก้แล้วเก็บรวมไว้ที่ cost ช่องเดียว
  const isTotalCost = field === "totalCost";
  const currentValue = isTotalCost
    ? toNumeric(bill.cost) + toNumeric(bill.mlpCost)
    : (Object.prototype.hasOwnProperty.call(existing.values || {}, field) ? existing.values[field] : bill[field]);
  if (!inlineValueChanged(currentValue, value, type)) return;
  const fieldPatch = isTotalCost ? { cost: value, mlpCost: 0 } : { [field]: value };
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      ...fieldPatch,
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
  // เลขใบวางบิลผิดรูปแบบ = ไม่บันทึกทั้งใบ (ปล่อยผ่าน = ได้ BAR ปลอมที่นับเป็นรายได้จริง)
  const barCheck = normalizeBarInput(elements.editBarNo?.value);
  if (!barCheck.ok) {
    updateBarEmptyHint();
    elements.editBarNo?.focus();
    alert(barInputErrorText(barCheck));
    return;
  }
  const values = {
    status: elements.editStatus.value,
    caseType: bill.caseType || "unknown",
    caseTypeSource: bill.caseTypeSource || "",
    billingStage: elements.editBillingStage?.value || bill.billingStage || "pending-review",
    billingStageSource: elements.editBillingStage && elements.editBillingStage.value !== (bill.billingStage || "pending-review")
      ? "manual"
      : bill.billingStageSource || "",
    patient: clean(elements.editPatient?.value),
    refId: clean(elements.editRefId?.value),
    phone: clean(elements.editPhone?.value),
    address: clean(elements.editAddress?.value),
    expectedClaim: elements.editExpectedClaim ? toNumeric(elements.editExpectedClaim.value) : toNumeric(bill.expectedClaim),
    orw: clean(elements.editOrw.value),
    invoice: clean(elements.editInvoice.value),
    barNo: elements.editBarNo ? barCheck.value : clean(bill.barNo),
    creditNos: elements.editCreditNos ? clean(elements.editCreditNos.value) : clean(bill.creditNos),
    // 0 = กลับไปนับอัตโนมัติ
    caseSeqManual: elements.editCaseSeq ? Math.max(0, Math.round(toNumeric(elements.editCaseSeq.value))) : toNumeric(bill.caseSeqManual),
    clicknicDate: dateKey(elements.editClicknicDate.value),
    mlpDate: dateKey(elements.editMlpDate.value),
    billingDueDate: dateKey(elements.editBillingDueDate.value),
    cost: elements.editCost ? toNumeric(elements.editCost.value) : toNumeric(bill.cost),
    mlpCost: elements.editMlpCost ? toNumeric(elements.editMlpCost.value) : toNumeric(bill.mlpCost),
    sale: toNumeric(elements.editSale.value),
    billedAmount: toNumeric(elements.editBilledAmount.value),
    excluded: Boolean(elements.editExcluded.checked),
    excludeReason: clean(elements.editExcludeReason.value),
    diagnosis: elements.editDiagnosis ? clean(elements.editDiagnosis.value) : billDiagnosis(bill),
  };
  // รายการยาจาก drawer: แถวว่าง (ไม่มีชื่อและไม่มียอด) ถูกตัดทิ้ง; ลบจนหมดก็บันทึกเป็นว่างได้ถ้าบิลเคยมีรายการ
  const drawerMeds = (state.drawerMedicines || [])
    .filter((line) => clean(line.medicine) || toNumeric(line.sale) > 0)
    .map((line) => {
      const med = {
        medicine: clean(line.medicine) || "-",
        qty: toNumeric(line.qty) || 1,
        sale: toNumeric(line.sale),
        cost: toNumeric(line.cost),
        realCost: toNumeric(line.realCost),
      };
      const supplier = clean(line.supplier);
      if (supplier) med.supplier = supplier; // เก็บเฉพาะเมื่อมีค่า กัน noise บิลที่ไม่เคยระบุเจ้า
      return med;
    });
  const hadMedicines = Boolean((bill.medicines || []).length)
    || Boolean(clean(bill.medicinesText) && clean(bill.medicinesText) !== "-");
  if (drawerMeds.length || hadMedicines) {
    values.medicines = drawerMeds;
    values.medicineCount = drawerMeds.length;
    values.medicinesText = drawerMeds.map((item) => `${item.medicine} x${number(item.qty)}`).join(", ");
  }
  if (values.billingStageSource !== "manual") {
    const stageDetection = deriveBillingStage(values.status, values.caseType, values.barNo, values.creditNos);
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
  renderQuickDateFilters(); // แท็บก็เป็นตัวกรอง — ชิปวันต้องซ่อน/นับใหม่ตาม
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
  renderMetrics();
  renderTabs();
  renderTable();
  renderQuickDateFilters();
}

// ตารางย่อยในการ์ด: กด chip ตัวเลข = popup บิลของช่องนั้น, กดที่อื่นในแถว = กรองเดือนทั้งจอ
function handleMonthTableClick(event) {
  const chip = event.target.closest("[data-month-drill]");
  if (chip) {
    const [metric, caseType, month] = chip.dataset.monthDrill.split(":");
    openMonthDrill(metric, caseType, month);
    return;
  }
  const row = event.target.closest("[data-month-filter]");
  if (!row) return;
  toggleMonthFilter(row.dataset.monthFilter);
}
["monthlyCasesBody", "costByMonthBody", "saleByMonthBody", "profitByMonthBody"].forEach((id) => {
  $(id)?.addEventListener("click", handleMonthTableClick);
});
// กด chip ประเภทเคสบนการ์ดยอดขาย/กำไร = โฟกัสการ์ดเฉพาะประเภทนั้น กดซ้ำ = กลับมุมมองรวม
[elements.metricSaleBreakdown, elements.metricProfitBreakdown].forEach((el) => {
  el?.addEventListener("click", (event) => {
    const chip = event.target.closest("[data-case-focus]");
    if (!chip) return;
    const [cardKey, caseKey] = chip.dataset.caseFocus.split(":");
    caseFocus[cardKey] = caseFocus[cardKey] === caseKey ? "" : caseKey;
    renderMetrics();
  });
});
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
elements.clipboardExpectedTotal?.addEventListener("input", () => {
  renderBillingChecksum(elements.clipboardPreview.value);
});
// แก้ BAR/วันครบกำหนดที่หัวโมดัล → คอลัมน์ BAR/วันที่ในพรีวิว billing ต้องตามทันที
[elements.clipboardBarNo, elements.clipboardDueDate].forEach((input) => {
  input?.addEventListener("input", () => {
    if (state.activeClipboardKind === "billing") previewClipboardText(elements.clipboardPreview.value);
  });
});
elements.confirmClipboardImport.addEventListener("click", confirmClipboardImport);
elements.cancelClipboardImport.addEventListener("click", closeClipboardImport);
elements.closeClipboardModal.addEventListener("click", closeClipboardImport);
// ตัวกรองที่ไม่ใช่วันที่เปลี่ยน = ตารางและชิปวัน/เดือนต้องตามกัน (ชิปซ่อนวันที่ไม่มีบิลตรงตัวกรอง)
function renderFilterScopedViews() {
  renderTable();
  renderQuickDateFilters();
}
elements.searchInput.addEventListener("input", renderFilterScopedViews);
elements.caseTypeFilter.addEventListener("change", renderFilterScopedViews);
elements.billingStageFilter.addEventListener("change", renderFilterScopedViews);
// เปลี่ยนช่วงวันที่ = ตัวเลขทุกจุดต้องนับใหม่ (การ์ด chips แท็บ ตาราง)
function renderDateScopedViews() {
  renderMetrics();
  renderTabs();
  renderTable();
}
elements.dateField.addEventListener("change", renderDateScopedViews);
elements.dateFrom.addEventListener("change", renderDateScopedViews);
elements.dateTo.addEventListener("change", renderDateScopedViews);
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
// แถบ "ยังไม่ครบ": กด chip = กรองไปที่กลุ่มนั้น (สลับกลับเป็น ทั้งหมด ถ้ากดซ้ำ)
elements.mergeAssistant?.addEventListener("click", (event) => {
  if (event.target.closest("[data-gap-warn]")) {
    openMergeWarnModal();
    return;
  }
  const chip = event.target.closest("[data-gap-status], [data-gap-billing], [data-gap-case]");
  if (!chip) return;
  applyGapFilter({ status: chip.dataset.gapStatus, billingStage: chip.dataset.gapBilling, caseType: chip.dataset.gapCase });
  elements.billTableBody?.closest("table")?.scrollIntoView({ block: "start", behavior: "smooth" });
});
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
  // ปุ่มภายในการ์ด (chip ประเภทเคส/แถวเดือน) มี action ของตัวเอง — อย่าเปิด popup ซ้อน
  if (event.target.closest("button, input, select, textarea, a")) return;
  event.preventDefault();
  openCardDetail(card.dataset.summaryCard);
});
// เปลี่ยนประเภทเคสจากตารางใน Card Detail ได้เลย
elements.cardDetailModal?.addEventListener("change", (event) => {
  // ติ๊กเลือกบิลรายแถวในหน้า Card Detail
  const pick = event.target.closest(".card-row-pick");
  if (pick) {
    if (pick.checked) cardBulkSelected.add(pick.dataset.cardPick);
    else cardBulkSelected.delete(pick.dataset.cardPick);
    pick.closest("tr")?.classList.toggle("row-selected", pick.checked);
    renderCardBulkBar();
    return;
  }
  // เลือกทั้งหมดในกลุ่ม
  if (event.target.id === "cardSelectAll") {
    const checked = event.target.checked;
    elements.cardDetailBody.querySelectorAll(".card-row-pick").forEach((box) => {
      box.checked = checked;
      if (checked) cardBulkSelected.add(box.dataset.cardPick);
      else cardBulkSelected.delete(box.dataset.cardPick);
      box.closest("tr")?.classList.toggle("row-selected", checked);
    });
    renderCardBulkBar();
    return;
  }
  const select = event.target.closest("[data-card-case-key]");
  if (!select) return;
  quickUpdateCaseType(select.dataset.cardCaseKey, select.value);
  refreshCardDetail();
});
// Card Detail bulk bar: ตั้งประเภทเคส / งานวางบิล / ใส่ BAR / Exclude ให้บิลที่ติ๊ก (reuse applyBulkOverride)
if (elements.cardBulkBillingStage) {
  elements.cardBulkBillingStage.innerHTML = `<option value="">งานวางบิล…</option>${billingStageOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
}
if (elements.cardBulkCaseType) {
  elements.cardBulkCaseType.innerHTML = `<option value="">ประเภทเคส…</option>${caseTypeOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
}
elements.cardBulkBillingStage?.addEventListener("change", () => {
  const value = elements.cardBulkBillingStage.value;
  if (!value) return;
  applyCardBulk(() => ({ billingStage: value, billingStageSource: "manual" }), `งานวางบิล → ${billingStageLabel(value)}`);
  elements.cardBulkBillingStage.value = "";
});
elements.cardBulkCaseType?.addEventListener("change", () => {
  const value = elements.cardBulkCaseType.value;
  if (!value) return;
  applyCardBulk((bill, existing) => {
    const values = { caseType: value, caseTypeSource: "manual" };
    if ((existing.values?.billingStageSource || bill.billingStageSource) !== "manual") {
      const stage = deriveBillingStage(bill.status, value, bill.barNo, bill.creditNos);
      values.billingStage = stage.billingStage;
      values.billingStageSource = stage.billingStageSource;
    }
    return values;
  }, `ประเภทเคส → ${caseTypeLabel(value)}`);
  elements.cardBulkCaseType.value = "";
});
function applyCardBulkBarNo() {
  // ที่นี่ใช้ alert เพราะ Card Detail เป็นโมดัลเต็มจอ — statusText อยู่หลังโมดัล มองไม่เห็น
  const check = normalizeBarInput(elements.cardBulkBarNo?.value);
  if (check.empty || !check.ok) {
    if (!check.ok) alert(barInputErrorText(check));
    elements.cardBulkBarNo?.focus();
    return;
  }
  const barValue = check.value;
  applyCardBulk((bill, existing) => {
    const values = { barNo: barValue };
    if ((existing.values?.billingStageSource || bill.billingStageSource) !== "manual") {
      const stage = deriveBillingStage(bill.status, bill.caseType || "unknown", barValue, existing.values?.creditNos || bill.creditNos);
      values.billingStage = stage.billingStage;
      values.billingStageSource = stage.billingStageSource;
    }
    return values;
  }, `ใส่ใบวางบิล ${barValue}`);
  if (elements.cardBulkBarNo) elements.cardBulkBarNo.value = "";
}
elements.cardBulkApplyBar?.addEventListener("click", applyCardBulkBarNo);
elements.cardBulkBarNo?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  applyCardBulkBarNo();
});
elements.cardBulkExclude?.addEventListener("click", () => applyCardBulk(() => ({ excluded: true }), "Exclude"));
elements.cardBulkInclude?.addEventListener("click", () => applyCardBulk(() => ({ excluded: false }), "ยกเลิก Exclude"));
elements.cardBulkClear?.addEventListener("click", () => {
  cardBulkSelected.clear();
  elements.cardDetailBody.querySelectorAll(".card-row-pick").forEach((box) => { box.checked = false; box.closest("tr")?.classList.remove("row-selected"); });
  renderCardBulkBar();
});
elements.caseSeqModalClose?.addEventListener("click", () => elements.caseSeqModal?.close());
elements.caseSeqModal?.addEventListener("click", (event) => {
  if (event.target === elements.caseSeqModal) elements.caseSeqModal.close();
});
elements.caseSeqSearch?.addEventListener("input", renderCaseSeqModal);
// กัน Enter submit form dialog (จะปิด popup) — ช่องค้นหาอยู่ในฟอร์ม method="dialog"
elements.caseSeqSearch?.addEventListener("keydown", (event) => {
  if (event.key === "Enter") event.preventDefault();
});
elements.visitTimelineClose?.addEventListener("click", () => elements.visitTimelineModal?.close());
elements.visitTimelineModal?.addEventListener("click", (event) => {
  if (event.target === elements.visitTimelineModal) elements.visitTimelineModal.close();
});
elements.visitTimelineModal?.addEventListener("close", () => { visitTimelineContext = null; });
// ปุ่มค้นหาบิลทั้งหมดของลูกค้าคนนี้ (พฤติกรรมเดิมของป้าย "มาซ้ำ") — เบอร์ก่อน ไม่มีค่อยใช้ชื่อ
elements.visitTimelineSearch?.addEventListener("click", () => {
  const bill = state.bills.find((item) => item.billKey === visitTimelineContext?.billKey);
  if (!bill) return;
  elements.searchInput.value = clean(bill.phone) || clean(bill.patient);
  state.activeStatus = "all";
  elements.visitTimelineModal?.close();
  renderTabs();
  renderTable();
});
// mousedown บนปุ่มเลขที่บิลจะดึงโฟกัสออกจากช่อง Dx → focusout → บันทึก → renderVisitTimeline()
// เขียน innerHTML ใหม่ → ปุ่มที่กำลังกดหายไปก่อน click จะยิง → ป๊อปอัพค้างไม่ปิด
// กันด้วยการบล็อกการย้ายโฟกัส แล้วค่อยบันทึก Dx เองใน click ตามลำดับที่คุมได้
elements.visitTimelineBody?.addEventListener("mousedown", (event) => {
  if (event.target.closest("[data-visit-open]")) event.preventDefault();
});
elements.visitTimelineBody?.addEventListener("click", (event) => {
  const copyBtn = event.target.closest("[data-copy-text]");
  if (copyBtn) {
    navigator.clipboard?.writeText(copyBtn.dataset.copyText).then(() => {
      const icon = copyBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-check";
        setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
      }
    }).catch(() => {});
    return;
  }
  const openBtn = event.target.closest("[data-visit-open]");
  if (!openBtn) return;
  const billKey = openBtn.dataset.visitOpen; // อ่านก่อน — commit ด้านล่างอาจวาดปุ่มนี้ทิ้ง
  // ใช้ activeElement ไม่ใช่ :focus — :focus ไม่ match ตอนหน้าต่างเบราว์เซอร์ไม่ได้โฟกัส
  const active = document.activeElement;
  const pendingDx = active?.matches?.("[data-dx-input]") && elements.visitTimelineBody.contains(active) ? active : null;
  if (pendingDx) commitVisitDxInput(pendingDx);
  elements.visitTimelineModal?.close();
  openDetailDrawer(billKey);
});
// Enter บันทึกทันที (กัน Enter ไป submit form dialog แล้วปิด popup) · blur ก็บันทึก
elements.visitTimelineBody?.addEventListener("keydown", (event) => {
  const input = event.target.closest("[data-dx-input]");
  if (!input || event.key !== "Enter") return;
  event.preventDefault();
  commitVisitDxInput(input);
});
elements.visitTimelineBody?.addEventListener("focusout", (event) => {
  const input = event.target.closest("[data-dx-input]");
  if (input) commitVisitDxInput(input);
});

// chip เลขซ้ำ (ในหัว modal) → เลื่อนไปแถวแรกของลำดับนั้น + ไฮไลต์ทุกแถวที่ซ้ำ + โฟกัสช่องแก้
elements.caseSeqDupInline?.addEventListener("click", (event) => {
  const dupChip = event.target.closest("[data-dup-seq]");
  if (!dupChip || !elements.caseSeqModalBody) return;
  const dupRows = elements.caseSeqModalBody.querySelectorAll(`tr[data-row-seq="${CSS.escape(dupChip.dataset.dupSeq)}"]`);
  if (!dupRows.length) return;
  dupRows[0].scrollIntoView({ block: "center", behavior: "smooth" });
  dupRows.forEach((row) => {
    row.classList.remove("case-seq-row-jump");
    void row.offsetWidth; // รีสตาร์ท animation
    row.classList.add("case-seq-row-jump");
  });
  dupRows[0].querySelector("[data-seq-row]")?.focus();
});
elements.caseSeqModalBody?.addEventListener("click", (event) => {
  const copyBtn = event.target.closest("[data-copy-text]");
  if (copyBtn) {
    navigator.clipboard?.writeText(copyBtn.dataset.copyText).then(() => {
      const icon = copyBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-check";
        setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
      }
    }).catch(() => {});
    return;
  }
  const autofix = event.target.closest("[data-seq-autofix]");
  if (autofix) {
    const bill = state.bills.find((item) => item.billKey === autofix.dataset.seqAutofix);
    if (!bill || !bill.caseSeqMonth) return;
    quickUpdateCaseSeq(bill.billKey, nextFreeCaseSeq(bill.caseType, bill.caseSeqMonth));
    renderCaseSeqModal();
    return;
  }
  const addBar = event.target.closest("[data-bar-add]");
  if (addBar) {
    elements.caseSeqModal?.close();
    openBarPicker("", addBar.dataset.barAdd);
    return;
  }
  const openBtn = event.target.closest("[data-seq-open]");
  if (!openBtn) return;
  elements.caseSeqModal?.close();
  openDetailDrawer(openBtn.dataset.seqOpen);
});
elements.caseSeqModalBody?.addEventListener("keydown", (event) => {
  const input = event.target.closest("[data-seq-row]");
  if (!input) return;
  if (event.key === "Enter") {
    event.preventDefault();
    commitCaseSeqRow(input);
  } else if (event.key === "Escape") {
    // คืนค่าเดิมทั้งตาราง (กัน Esc เผลอปิด dialog ทั้งบาน)
    event.preventDefault();
    renderCaseSeqModal();
  }
});
elements.caseSeqModalBody?.addEventListener("focusout", (event) => {
  const input = event.target.closest("[data-seq-row]");
  if (input) commitCaseSeqRow(input);
});
elements.closeCardDetailModal?.addEventListener("click", closeCardDetail);
elements.cardDetailModal?.addEventListener("click", (event) => {
  if (event.target === elements.cardDetailModal) closeCardDetail();
  const pageBtn = event.target.closest("[data-card-page]");
  if (pageBtn) {
    cardDetailPage += pageBtn.dataset.cardPage === "next" ? 1 : -1;
    if (state.currentCardKey) {
      openCardDetail(state.currentCardKey);
      // เปลี่ยนหน้าแล้วเลื่อนกลับไปหัวตาราง
      elements.cardDetailBody?.closest(".card-detail-table")?.scrollTo({ top: 0 });
    }
    return;
  }
  // กาง chip ที่ถูกตัดออกไป — แก้ DOM ตรง ๆ ไม่ re-render (re-render ทีเดียวก็หุบกลับหมด)
  const moreBtn = event.target.closest("[data-issue-more]");
  if (moreBtn) {
    moreBtn.closest(".issue-chip-list")?.classList.add("show-all");
    moreBtn.remove();
    return;
  }
  const quickChip = event.target.closest("[data-card-quick]");
  if (quickChip) {
    // กดตัวกรองที่เปิดอยู่ซ้ำ = ยกเลิก กลับมาดูทั้งหมด
    const key = quickChip.dataset.cardQuick;
    cardQuickFilter = key === cardQuickFilter && key !== "all" ? "all" : key;
    cardDetailPage = 1; // เปลี่ยนตัวกรอง = กลับหน้าแรก
    if (state.currentCardKey) openCardDetail(state.currentCardKey);
    return;
  }
  const seqChip = event.target.closest("[data-seq-edit]");
  if (seqChip) {
    openCaseSeqTable(seqChip);
    return;
  }
  const copyBtn = event.target.closest("[data-copy-text]");
  if (copyBtn) {
    navigator.clipboard?.writeText(copyBtn.dataset.copyText).then(() => {
      const icon = copyBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-check";
        setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
      }
    }).catch(() => {});
    return;
  }
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
  const button = event.target.closest("[data-clicknic-date], [data-clicknic-month], [data-clicknic-year]");
  if (!button) return;
  const { clicknicDate: date, clicknicMonth: month, clicknicYear: year } = button.dataset;
  elements.searchInput.value = "";
  elements.dateField.value = "clicknicDate";
  if (date === "all" || month === "all" || year === "all") {
    elements.dateFrom.value = "";
    elements.dateTo.value = "";
    elements.targetDate.value = "";
  } else if (date) {
    elements.dateFrom.value = date;
    elements.dateTo.value = date;
    elements.targetDate.value = date;
  } else if (month) {
    const range = monthRangeOf(month);
    elements.dateFrom.value = range.from;
    elements.dateTo.value = range.to;
    elements.targetDate.value = "";
  } else if (year) {
    elements.dateFrom.value = `${year}-01-01`;
    elements.dateTo.value = `${year}-12-31`;
    elements.targetDate.value = "";
  }
  state.activeStatus = "all";
  renderMetrics();
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
// Enter = บันทึก / Esc = ยกเลิก ในฟอร์มเพิ่มยาใหม่บนตาราง
elements.billTableBody.addEventListener("keydown", (event) => {
  const input = event.target.closest("[data-new-med-field]");
  if (!input) return;
  if (event.key === "Enter") {
    event.preventDefault();
    commitInlineMedForm(input.closest("[data-new-med-form]"));
  } else if (event.key === "Escape") {
    event.preventDefault();
    input.closest("[data-new-med-form]")?.remove();
  }
});
elements.billTableBody.addEventListener("change", (event) => {
  const pick = event.target.closest(".row-pick");
  if (pick) {
    if (pick.checked) state.selectedBillKeys.add(pick.dataset.pickKey);
    else state.selectedBillKeys.delete(pick.dataset.pickKey);
    updateBulkBar();
    return;
  }
  const medInput = event.target.closest("[data-med-key][data-med-field]");
  if (medInput) {
    quickUpdateMedicineLine(medInput.dataset.medKey, Number(medInput.dataset.medIndex), medInput.dataset.medField, medInput.value);
    return;
  }
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
    const key = billingStageSelect.dataset.billingStageKey;
    const stage = billingStageSelect.value;
    if (stage === "paid") {
      // ตั้ง PAID จาก dropdown → เด้งถามวันรับเงิน (พร้อมตัวเลือกทั้ง BAR); ยกเลิก = คืนค่า dropdown เดิม
      const bill = state.bills.find((b) => b.billKey === key);
      const sameBar = bill?.barNo ? billsSharingBar(bill.barNo) : [];
      openPaidDatePrompt(dateKey(bill?.paidDate) || todayKey(), (chosen, applyAllBar) => {
        if (applyAllBar && bill?.barNo && sameBar.length > 1) markBarPaid(bill.barNo, chosen);
        else quickUpdateBillingStage(key, "paid", chosen);
      }, { barNo: bill?.barNo, sameBarCount: sameBar.length, onCancel: () => renderTable() });
    } else {
      quickUpdateBillingStage(key, stage);
    }
    return;
  }
  const input = event.target.closest("[data-inline-key][data-inline-field]");
  if (!input) return;
  quickUpdateInlineField(input.dataset.inlineKey, input.dataset.inlineField, input.value, input.dataset.inlineType);
});
// พิมพ์ขาย/ทุนแล้วเห็นกำไรขยับทันที — คำนวณสดเฉพาะบนจอ ค่าจริงบันทึกเมื่อออกจากช่อง (change)
elements.billTableBody.addEventListener("input", (event) => {
  const input = event.target.closest("[data-inline-key][data-inline-type='number']");
  if (!input) return;
  const field = input.dataset.inlineField;
  if (field !== "sale" && field !== "totalCost") return;
  const bill = state.bills.find((item) => item.billKey === input.dataset.inlineKey);
  if (!bill) return;
  const value = toNumeric(input.value);
  const sale = field === "sale" ? value : toNumeric(bill.sale);
  const totalCost = field === "totalCost" ? value : toNumeric(bill.cost) + toNumeric(bill.mlpCost);
  const profit = sale - totalCost;
  const line = input.closest("tr")?.querySelector(".profit-line");
  if (!line) return;
  line.textContent = `กำไร ${money(profit)}`;
  line.classList.toggle("profit-negative", profit < 0);
  line.classList.toggle("profit-nhso", Math.abs(profit - 10) < 0.005);
});
elements.billTableBody.addEventListener("click", (event) => {
  // ปุ่มล้างตัวกรองในแถวว่าง "ไม่พบข้อมูลตามตัวกรอง"
  if (event.target.closest("[data-clear-filters]")) {
    clearFilters();
    return;
  }
  // ปุ่ม 🪄 เติมต้นทุนจาก master ในตาราง
  const autoCost = event.target.closest("[data-auto-cost]");
  if (autoCost) {
    const bill = state.bills.find((b) => b.billKey === autoCost.dataset.autoCost);
    const master = bill ? billMasterCostTotal(bill) : 0;
    if (master > 0) quickUpdateInlineField(bill.billKey, "totalCost", master, "number");
    return;
  }
  // ป้าย "🔗 รวมได้" บนบิล billing-only ที่มีคู่ ORW ฝั่งยา — เลือกทั้งกลุ่มแล้วรวม (มี confirm)
  const orwHint = event.target.closest("[data-orw-merge-hint]");
  if (orwHint) {
    const group = orwGroupFor(orwHint.dataset.orwMergeHint);
    if (group.length >= 2) {
      state.selectedBillKeys = new Set(group.map((bill) => bill.billKey));
      mergeSelectedBills();
    }
    return;
  }
  // ปุ่ม one-click ตั้งงานวางบิลเป็น PAID + กรอกวันที่ได้รับเงิน
  const quickPaidBtn = event.target.closest("[data-quick-paid]");
  if (quickPaidBtn) {
    const key = quickPaidBtn.dataset.quickPaid;
    const bill = state.bills.find((item) => item.billKey === key);
    const sameBar = bill?.barNo ? billsSharingBar(bill.barNo) : [];
    openPaidDatePrompt(dateKey(bill?.paidDate) || todayKey(), (chosen, applyAllBar) => {
      if (applyAllBar && bill?.barNo && sameBar.length > 1) {
        const n = markBarPaid(bill.barNo, chosen);
        elements.statusText.textContent = `ตั้ง PAID ${number(n)} บิล (BAR ${clean(bill.barNo)}) · รับเงิน ${formatDisplayDate(chosen)}`;
      } else {
        quickUpdateBillingStage(key, "paid", chosen);
      }
      if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
    }, { barNo: bill?.barNo, sameBarCount: sameBar.length });
    return;
  }
  // ชิปวันที่ได้รับเงิน (บิล PAID แล้ว) — คลิกเพื่อแก้วันรับเงิน
  const paidDateEditBtn = event.target.closest("[data-paid-date-edit]");
  if (paidDateEditBtn) {
    const key = paidDateEditBtn.dataset.paidDateEdit;
    const bill = state.bills.find((item) => item.billKey === key);
    const sameBar = bill?.barNo ? billsSharingBar(bill.barNo) : [];
    openPaidDatePrompt(dateKey(bill?.paidDate) || todayKey(), (chosen, applyAllBar) => {
      if (applyAllBar && bill?.barNo && sameBar.length > 1) markBarPaid(bill.barNo, chosen);
      else setBillPaidDate(key, chosen);
      if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
    }, { barNo: bill?.barNo, sameBarCount: sameBar.length });
    return;
  }
  const copyBtn = event.target.closest("[data-copy-text]");
  if (copyBtn) {
    navigator.clipboard?.writeText(copyBtn.dataset.copyText).then(() => {
      const icon = copyBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-check";
        setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
      }
    }).catch(() => {});
    return;
  }
  const seqChip = event.target.closest("[data-seq-edit]");
  if (seqChip) {
    openCaseSeqTable(seqChip);
    return;
  }
  const addMedBtn = event.target.closest("[data-med-add]");
  if (addMedBtn) {
    openInlineMedForm(addMedBtn);
    return;
  }
  const medLinkBtn = event.target.closest("[data-med-link]");
  if (medLinkBtn) {
    openMedLinkPicker(medLinkBtn.dataset.medName);
    return;
  }
  const newMedConfirm = event.target.closest("[data-new-med-confirm]");
  if (newMedConfirm) {
    commitInlineMedForm(newMedConfirm.closest("[data-new-med-form]"));
    return;
  }
  const newMedCancel = event.target.closest("[data-new-med-cancel]");
  if (newMedCancel) {
    newMedCancel.closest("[data-new-med-form]")?.remove();
    return;
  }
  const medsToggle = event.target.closest("[data-meds-toggle]");
  if (medsToggle) {
    const bodyEl = medsToggle.closest("td")?.querySelector("[data-meds-body]");
    if (bodyEl) {
      const expanded = bodyEl.classList.toggle("expanded");
      medsToggle.textContent = expanded ? "ย่อ" : (medsToggle.dataset.labelFull || "ดูทั้งหมด");
    }
    return;
  }
  const pasteAnalyzeButton = event.target.closest("[data-paste-analyze]");
  if (pasteAnalyzeButton) {
    openPasteAnalyze(pasteAnalyzeButton.dataset.pasteAnalyze);
    return;
  }
  // กดป้าย "มาซ้ำ" / "ห่าง N วัน" = เปิดไทม์ไลน์ทุกครั้งที่มาของลูกค้าคนนี้
  const visitBadge = event.target.closest("[data-visit-timeline]");
  if (visitBadge) {
    openVisitTimeline(visitBadge.dataset.visitTimeline);
    return;
  }
  // กดป้าย Dx = เปิดไทม์ไลน์แล้วโฟกัสช่องคำวินิจฉัยของบิลนี้
  const dxChip = event.target.closest("[data-dx-edit]");
  if (dxChip) {
    openVisitTimeline(dxChip.dataset.dxEdit, true);
    return;
  }
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
elements.drawerMedicines.addEventListener("change", (event) => {
  const input = event.target.closest("[data-drawer-med-index][data-drawer-med-field]");
  if (!input) return;
  const lines = state.drawerMedicines || [];
  const line = lines[Number(input.dataset.drawerMedIndex)];
  if (!line) return;
  const round2 = (value) => Math.round(value * 100) / 100;
  if (input.dataset.drawerMedField === "medicine") {
    line.medicine = clean(input.value);
    // auto-fill จาก master: ราคา MLP (LINE MAN price) + ต้นทุนจริง (COST) เข้าช่องที่ยังว่าง/ผู้ใช้ยังไม่แก้เอง
    const master = resolveMasterProduct(line.medicine);
    if (master) {
      const qtyN = toNumeric(line.qty) || 1;
      if (toNumeric(line.cost) <= 0) {
        const lm = masterLinemanOf(master);
        if (lm > 0) line.cost = round2(qtyN * lm);
      }
      if (!line.realCostEdited && toNumeric(line.realCost) <= 0) {
        const mc = masterCostOf(master);
        if (mc > 0) line.realCost = round2(qtyN * mc);
      }
      if (!line.supplier) { const sup = masterSupplierOf(master); if (sup) line.supplier = sup; } // เจ้าทุนต่ำสุดจาก master
      const mlpTotal = round2(lines.reduce((sum, item) => sum + toNumeric(item.cost), 0));
      if (mlpTotal > 0) elements.editSale.value = fixed2(mlpTotal);
    }
    renderDrawerMedicines(currentDetailBill());
    updateEditProfitPreview();
    return;
  }
  if (input.dataset.drawerMedField === "supplier") {
    line.supplier = normalizeSupplierName(input.value); // ชื่อดิบ -> โค้ดทะเบียน (ไม่รู้จัก = คงชื่อเดิม)
    renderDrawerMedicines(currentDetailBill());
    return;
  }
  const pricedBefore = lines.some((item) => toNumeric(item.sale) > 0);
  const field = input.dataset.drawerMedField;
  const value = Math.max(0, toNumeric(input.value));
  const prevUnit = line.qty > 0 ? line.sale / line.qty : 0;
  const prevMlpUnit = line.qty > 0 ? line.cost / line.qty : 0;
  const prevCostUnit = line.qty > 0 ? line.realCost / line.qty : 0;
  if (field === "qty") {
    line.qty = value;
    line.sale = round2(value * prevUnit);
    line.cost = round2(value * prevMlpUnit);
    line.realCost = round2(value * prevCostUnit);
  } else if (field === "unitPrice") {
    line.sale = round2((line.qty || 1) * value);
  } else if (field === "mlpUnitPrice") {
    line.cost = round2((line.qty || 1) * value);
  } else if (field === "realCost") {
    line.realCost = round2((line.qty || 1) * value);
    line.realCostEdited = true; // ผู้ใช้แก้ต้นทุนเอง → autofill จะไม่เขียนทับ
  } else {
    return;
  }
  const newSale = round2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  const newMlpTotal = round2(lines.reduce((sum, item) => sum + toNumeric(item.cost), 0));
  // ยอดขายบิล = ยอด MLP เรียกเก็บ: มีราคา MLP → ตามผลรวม MLP; ไม่มี → ตามฝั่ง CKNC (เดิม)
  // ยังไม่เคยกรอกราคาเลย: แก้จำนวนอย่างเดียวไม่ทับยอดขายเดิมของบิล
  if (newMlpTotal > 0) {
    elements.editSale.value = fixed2(newMlpTotal);
  } else if (pricedBefore || field === "unitPrice" || newSale > 0) {
    elements.editSale.value = fixed2(newSale);
  }
  renderDrawerMedicines(currentDetailBill());
  updateEditProfitPreview();
});
// เพิ่ม/ลบรายการยาจากใน drawer — บันทึกจริงเมื่อกด "บันทึกการแก้ไข"
elements.drawerAddMedicineBtn?.addEventListener("click", () => {
  const bill = currentDetailBill();
  if (!bill) return;
  state.drawerMedicines = state.drawerMedicines || [];
  state.drawerMedicines.push({ medicine: "", qty: 1, sale: 0, cost: 0, realCost: 0, supplier: "" });
  renderDrawerMedicines(bill);
  elements.drawerMedicines.querySelector(`[data-drawer-med-index="${state.drawerMedicines.length - 1}"][data-drawer-med-field="medicine"]`)?.focus();
});
elements.drawerMedicines.addEventListener("click", (event) => {
  // 🔗 ลิงก์ยาเข้า master (หลังลิงก์ดึงต้นทุนอัตโนมัติ ผ่าน autofillDrawerMedicinesFromMaster ใน linkMedicineToMaster)
  const linkBtn = event.target.closest("[data-drawer-med-link]");
  if (linkBtn) {
    const idx = Number(linkBtn.dataset.drawerMedLink);
    const line = (state.drawerMedicines || [])[idx];
    if (line) openMedLinkPicker(line.medicine || "");
    return;
  }
  // ↑ คัดลอกต้นทุนจริงรวม → ช่อง "ต้นทุน CKNC" (money field เปลี่ยนเมื่อกดเองเท่านั้น)
  const applyCostBtn = event.target.closest("[data-drawer-apply-cost]");
  if (applyCostBtn) {
    if (elements.editCost) {
      elements.editCost.value = fixed2(Math.max(0, toNumeric(applyCostBtn.dataset.drawerApplyCost)));
      updateEditProfitPreview();
      showToast(`ตั้งต้นทุน CKNC = ${money(toNumeric(elements.editCost.value))} จากต้นทุนจริงรายบรรทัด`);
    }
    return;
  }
  const removeBtn = event.target.closest("[data-drawer-med-remove]");
  if (!removeBtn) return;
  const lines = state.drawerMedicines || [];
  const index = Number(removeBtn.dataset.drawerMedRemove);
  if (!lines[index]) return;
  const pricedBefore = lines.some((item) => toNumeric(item.sale) > 0);
  const mlpPricedBefore = lines.some((item) => toNumeric(item.cost) > 0);
  lines.splice(index, 1);
  const newMlpTotal = lines.reduce((sum, item) => sum + toNumeric(item.cost), 0);
  // ลบบรรทัด: ยอดขายตามฝั่ง MLP ก่อนถ้าเคยมีราคา MLP ไม่งั้นตามฝั่ง CKNC (เดิม)
  if (mlpPricedBefore) {
    elements.editSale.value = fixed2(newMlpTotal);
  } else if (pricedBefore) {
    elements.editSale.value = fixed2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  }
  renderDrawerMedicines(currentDetailBill());
  updateEditProfitPreview();
});
// dropdown แนะนำเจ้าในช่อง "เจ้า" — delegation เพราะแถวยา re-render บ่อย (แทน datalist เดิม)
elements.drawerMedicines.addEventListener("focusin", (e) => {
  if (e.target.classList?.contains("med-supplier-input")) supplierSuggestShow(e.target);
});
elements.drawerMedicines.addEventListener("input", (e) => {
  if (e.target.classList?.contains("med-supplier-input")) supplierSuggestShow(e.target);
});
elements.drawerMedicines.addEventListener("focusout", (e) => {
  if (e.target.classList?.contains("med-supplier-input")) supplierSuggestBlur();
});
elements.drawerMedicines.addEventListener("keydown", (e) => {
  if (e.target.classList?.contains("med-supplier-input")) supplierSuggestKey(e, e.target);
});
// งานวางบิลใน drawer เป็น chips กดเลือกได้ทันที — ค่าจริงยังเก็บใน select เดิม (ซ่อนไว้)
function renderEditBillingStageChips() {
  if (!elements.editBillingStageChips || !elements.editBillingStage) return;
  const active = elements.editBillingStage.value || "pending-review";
  elements.editBillingStageChips.innerHTML = billingStageOptions
    .map(([value, label]) => `<button type="button" class="stage-chip ${value === active ? "active" : ""}" data-stage-chip="${value}">${label}</button>`)
    .join("");
}
elements.editBillingStageChips?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-stage-chip]");
  if (!chip) return;
  event.preventDefault();
  elements.editBillingStage.value = chip.dataset.stageChip;
  renderEditBillingStageChips();
});
elements.closeDetailDrawer.addEventListener("click", closeDetailDrawer);
elements.detailDrawer.addEventListener("click", (event) => {
  if (event.target === elements.detailDrawer) closeDetailDrawer();
  // data-copy-input = อ่านค่าสดจากช่องกรอกตอนกด (ช่องที่แก้ได้ เช่น Ref-ID/ORW/INV/BAR/AR) — กันก๊อปค่าเก่าหลังผู้ใช้พิมพ์แก้
  const copyBtn = event.target.closest("[data-copy-text], [data-copy-input]");
  if (copyBtn) {
    const copySource = copyBtn.dataset.copyInput
      ? document.getElementById(copyBtn.dataset.copyInput)?.value
      : copyBtn.dataset.copyText;
    const copyValue = clean(copySource);
    if (!copyValue) return;
    navigator.clipboard?.writeText(copyValue).then(() => {
      const icon = copyBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-check";
        setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
      }
    }).catch(() => {});
    return;
  }
  const compareBtn = event.target.closest("[data-caseseq-compare]");
  if (compareBtn) {
    const bill = state.bills.find((item) => item.billKey === compareBtn.dataset.caseseqCompare);
    const dupCount = Number(compareBtn.dataset.caseseqDupcount);
    if (!bill) return;
    if (dupCount > 1) {
      // ซ้ำหลายใบ = เปิดตารางลำดับทั้งเดือน (ไฮไลต์แถวซ้ำอยู่แล้ว)
      openCaseSeqTable({ dataset: { seqEdit: bill.billKey } });
      return;
    }
    const other = state.bills.find((item) => item.billKey === compareBtn.dataset.caseseqDup);
    if (!other) return;
    openSuggestPairModal({
      aKey: bill.billKey,
      bKey: other.billKey,
      aLabel: mergeSuggestBillLabel(bill),
      bLabel: mergeSuggestBillLabel(other),
      reasons: [`ลำดับเคส #${number(bill.caseSeq)} ซ้ำกัน`],
      titleText: `เทียบข้อมูลบิล — ลำดับ #${number(bill.caseSeq)} ซ้ำกัน`,
    }, "caseseq");
  }
});
elements.detailDrawer.addEventListener("close", () => {
  state.currentDetailKey = "";
  // เปิด drawer มาจากป๊อปอัพเทียบ (ดูรายละเอียด/รวมบิล) → รันงานต่อ 1 ครั้ง เช่นกลับป๊อปอัพเทียบหรือกลับ WARN
  const cb = drawerCloseCallback;
  drawerCloseCallback = null;
  if (cb) cb();
});
elements.saveOverrideBtn.addEventListener("click", saveBillOverride);
elements.editSale?.addEventListener("input", updateEditProfitPreview);
elements.editCost?.addEventListener("input", updateEditProfitPreview);
elements.editMlpCost?.addEventListener("input", updateEditProfitPreview);
elements.editBarNo?.addEventListener("input", updateBarEmptyHint);
// กดบรรทัดสรุป = เปิด Card Detail ทับโมดัลบิล (ทั้งคู่เป็น <dialog> ซ้อนกันได้ ปิดแล้วกลับมาที่โมดัลบิลเดิม
// ค่าที่พิมพ์ค้างไว้ไม่หาย — ทดสอบกับของจริงแล้ว) จึงไม่ปิด drawer
elements.editBarUsage?.addEventListener("click", () => {
  const bars = clean(elements.editBarNo?.value).split(",").map(clean).filter(Boolean);
  if (!bars.length) return;
  barBillsFocus = bars[0].toUpperCase(); // หลาย BAR ในช่องเดียว: ดูใบแรกก่อน
  openCardDetail("barBills");
});
elements.editCaseSeq?.addEventListener("input", () => {
  const bill = currentDetailBill();
  if (bill) updateCaseSeqDrawerHint(bill);
});
if (elements.editBillingStage) {
  elements.editBillingStage.innerHTML = billingStageOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`)
    .join("");
}
if (elements.bulkBillingStage) {
  elements.bulkBillingStage.innerHTML = `<option value="">งานวางบิล…</option>${billingStageOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
}
if (elements.bulkCaseType) {
  elements.bulkCaseType.innerHTML = `<option value="">ประเภทเคส…</option>${caseTypeOptions
    .map(([value, label]) => `<option value="${value}">${label}</option>`).join("")}`;
}
elements.selectAllRows?.addEventListener("change", () => {
  const checked = elements.selectAllRows.checked;
  document.querySelectorAll("#billTableBody .row-pick").forEach((pick) => {
    pick.checked = checked;
    if (checked) state.selectedBillKeys.add(pick.dataset.pickKey);
    else state.selectedBillKeys.delete(pick.dataset.pickKey);
  });
  updateBulkBar();
});
elements.bulkBillingStage?.addEventListener("change", () => {
  const value = elements.bulkBillingStage.value;
  if (!value) return;
  applyBulkOverride(() => ({ billingStage: value, billingStageSource: "manual" }), `งานวางบิล → ${billingStageLabel(value)}`);
  elements.bulkBillingStage.value = "";
});
elements.bulkCaseType?.addEventListener("change", () => {
  const value = elements.bulkCaseType.value;
  if (!value) return;
  applyBulkOverride((bill, existing) => {
    const values = { caseType: value, caseTypeSource: "manual" };
    if ((existing.values?.billingStageSource || bill.billingStageSource) !== "manual") {
      const stage = deriveBillingStage(bill.status, value, bill.billedAmount, bill.billingNo);
      values.billingStage = stage.billingStage;
      values.billingStageSource = stage.billingStageSource;
    }
    return values;
  }, `ประเภทเคส → ${caseTypeLabel(value)}`);
  elements.bulkCaseType.value = "";
});
function applyBulkBarNo() {
  const check = normalizeBarInput(elements.bulkBarNo.value);
  if (check.empty) {
    // ช่องว่างแล้วกดปุ่ม: บอกให้รู้แทนการเงียบเฉย ๆ (ดูเหมือนปุ่มพัง)
    elements.statusText.textContent = "พิมพ์เลขใบวางบิล (BAR-...) ในช่องก่อน แล้วกด ใส่ BAR";
    elements.bulkBarNo.focus();
    return;
  }
  // อยู่หน้าหลัก statusText เห็นชัดอยู่แล้ว ไม่ต้อง alert
  if (!check.ok) {
    elements.statusText.textContent = barInputErrorText(check);
    elements.bulkBarNo.focus();
    return;
  }
  const barValue = check.value;
  const count = state.selectedBillKeys.size;
  applyBulkOverride((bill, existing) => {
    const values = { barNo: barValue };
    if ((existing.values?.billingStageSource || bill.billingStageSource) !== "manual") {
      const stage = deriveBillingStage(bill.status, bill.caseType || "unknown", barValue, existing.values?.creditNos || bill.creditNos);
      values.billingStage = stage.billingStage;
      values.billingStageSource = stage.billingStageSource;
    }
    return values;
  }, `ใส่ใบวางบิล ${barValue}`);
  elements.bulkBarNo.value = "";
  elements.statusText.textContent = `ใส่ใบวางบิล ${barValue} ให้ ${number(count)} บิลแล้ว`;
}
elements.bulkApplyBarNo?.addEventListener("click", applyBulkBarNo);
// กด Enter ในช่อง BAR = กดปุ่ม ใส่ BAR
elements.bulkBarNo?.addEventListener("keydown", (event) => {
  if (event.key !== "Enter") return;
  event.preventDefault();
  applyBulkBarNo();
});

// ปุ่มลัด "ใส่ BAR ให้หลายบิล" — พิมพ์ BAR ครั้งเดียว แล้วติ๊กเลือกบิล (ตาม AR) ในตัว modal
// default: โชว์เฉพาะบิลที่มี AR แต่ยังไม่มี BAR (มี toggle แสดงทุกบิล)
const barPickerSelected = new Set();
// บิลที่ smart paste เจอแต่ติด BAR อื่นอยู่ — ไฮไลต์เตือน ไม่ติ๊กอัตโนมัติ (ติ๊กมือได้ถ้าตั้งใจย้าย)
const barPickerSmartWarn = new Set();

function setBarPickerSummary(html) {
  if (!elements.barPickerSummary) return;
  elements.barPickerSummary.innerHTML = html;
  elements.barPickerSummary.hidden = !html;
}

function openBarPicker(prefillBar, preselectKey) {
  if (!elements.barPickerModal) return;
  barPickerSelected.clear();
  barPickerSmartWarn.clear();
  setBarPickerSummary("");
  if (elements.barPickerInput) elements.barPickerInput.value = clean(prefillBar);
  if (elements.barPickerSearch) elements.barPickerSearch.value = "";
  if (elements.barPickerShowAll) elements.barPickerShowAll.checked = false;
  if (preselectKey) {
    barPickerSelected.add(preselectKey);
    // บิลที่ pre-select ถ้าไม่มี AR จะไม่โผล่ในรายการ default → เปิด "แสดงทุกบิล" ให้เห็น
    const target = state.bills.find((bill) => bill.billKey === preselectKey);
    if (target && !clean(target.creditNos) && elements.barPickerShowAll) elements.barPickerShowAll.checked = true;
  }
  renderBarPicker();
  if (!elements.barPickerModal.open) elements.barPickerModal.showModal();
  elements.barPickerInput?.focus();
}

function barPickerCandidates() {
  const showAll = Boolean(elements.barPickerShowAll?.checked);
  const term = clean(elements.barPickerSearch?.value).toLowerCase();
  return state.bills
    .filter((bill) => {
      if (bill.excluded) return false;
      // default = เฉพาะบิลที่มีเลขเครดิต (AR) แต่ยังไม่มี BAR
      if (!showAll && (!clean(bill.creditNos) || clean(bill.barNo))) return false;
      if (term) {
        const hay = [bill.patient, bill.creditNos, bill.orderId, bill.orw].map(clean).join(" ").toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    })
    .sort((a, b) => dateKey(a.clicknicDate || a.mlpDate).localeCompare(dateKey(b.clicknicDate || b.mlpDate))
      || clean(a.orderId || a.orw).localeCompare(clean(b.orderId || b.orw)));
}

function updateBarPickerApplyBtn() {
  if (!elements.barPickerApply) return;
  const n = barPickerSelected.size;
  const check = normalizeBarInput(elements.barPickerInput?.value);
  elements.barPickerApply.textContent = `ใส่ BAR ให้ ${number(n)} บิล`;
  elements.barPickerApply.disabled = n === 0 || check.empty || !check.ok;
  // บอกเหตุผลที่ปุ่มกดไม่ได้ ไม่งั้นดูเหมือนปุ่มพัง
  elements.barPickerApply.title = check.empty || check.ok ? "" : barInputErrorText(check);
  if (elements.barPickerInput) {
    elements.barPickerInput.classList.toggle("input-bad-format", !check.empty && !check.ok);
  }
}

function renderBarPicker() {
  if (!elements.barPickerBody) return;
  const rows = barPickerCandidates();
  const allChecked = rows.length > 0 && rows.every((bill) => barPickerSelected.has(bill.billKey));
  const term = clean(elements.barPickerSearch?.value);
  elements.barPickerBody.innerHTML = rows.length ? `
    <table class="case-seq-table">
      <thead><tr>
        <th class="seq-col"><input type="checkbox" data-bar-pick-all ${allChecked ? "checked" : ""} aria-label="เลือกทั้งหมดในรายการ" /></th>
        <th>ผู้รับบริการ</th><th>เลขที่เครดิต (AR)</th><th>ออเดอร์ / ORW</th><th>วันที่</th><th>BAR เดิม</th>
      </tr></thead>
      <tbody>
        ${rows.map((bill) => {
          const orderCell = orderOrwCellHtml(bill);
          const warn = barPickerSmartWarn.has(bill.billKey);
          return `
        <tr class="${barPickerSelected.has(bill.billKey) ? "case-seq-row-active" : ""}${warn ? " bar-pick-warn-row" : ""}"${warn ? ` title="Smart Paste เจอบิลนี้ แต่มี BAR อื่นอยู่แล้ว — ติ๊กเองถ้าตั้งใจย้าย"` : ""}>
          <td class="seq-col"><input type="checkbox" data-bar-pick="${htmlEscape(bill.billKey)}" ${barPickerSelected.has(bill.billKey) ? "checked" : ""} aria-label="เลือกบิลนี้" /></td>
          <td>${htmlEscape(bill.patient || "-")}</td>
          <td class="case-seq-code">${htmlEscape(bill.creditNos || "-")}</td>
          <td>${orderCell}</td>
          <td class="case-seq-date">${htmlEscape(formatDisplayDate(bill.clicknicDate || bill.mlpDate) || "-")}</td>
          <td>${clean(bill.barNo) ? `<span class="case-seq-chip case-${htmlEscape(bill.caseType || "unknown")}">${htmlEscape(bill.barNo)}</span>` : '<span class="bar-pick-nobar">— ยังไม่มี</span>'}</td>
        </tr>`;
        }).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">ติ๊กเลือกบิลที่ต้องใส่ BAR นี้ · BAR+AR ครบ = สถานะเปลี่ยนเป็น "วางบิลแล้ว" · แก้แล้วลง audit trail</p>
  ` : `<p class="case-seq-hint">${term ? "ไม่พบบิลที่ตรงกับคำค้นหา" : "ไม่มีบิลที่มี AR แต่ยังไม่มี BAR — ติ๊ก \"แสดงทุกบิล\" เพื่อดูทั้งหมด"}</p>`;
  updateBarPickerApplyBtn();
}

function applyBarPickerSelection() {
  // ปุ่มถูก disable ไว้แล้วเมื่อรูปแบบผิด — ด่านนี้กันทาง Enter/โค้ดเรียกตรง
  const check = normalizeBarInput(elements.barPickerInput?.value);
  if (check.empty || !check.ok) {
    if (!check.ok) alert(barInputErrorText(check));
    elements.barPickerInput?.focus();
    return;
  }
  const bar = check.value;
  if (!barPickerSelected.size) return;
  const keys = new Set(barPickerSelected);
  applyBulkOverride((bill, existing) => {
    const values = { barNo: bar };
    if ((existing.values?.billingStageSource || bill.billingStageSource) !== "manual") {
      const stage = deriveBillingStage(bill.status, bill.caseType || "unknown", bar, existing.values?.creditNos || bill.creditNos);
      values.billingStage = stage.billingStage;
      values.billingStageSource = stage.billingStageSource;
    }
    return values;
  }, `ใส่ใบวางบิล ${bar}`, keys);
  const count = keys.size;
  elements.barPickerModal?.close();
  elements.statusText.textContent = `ใส่ใบวางบิล ${bar} ให้ ${number(count)} บิลแล้ว`;
  // drawer เปิดอยู่ = โหลดค่าใหม่ (BAR/สถานะอาจเปลี่ยน)
  if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
}

// Smart Paste: วางทั้งหน้า "วางบิลลูกหนี้" (Ctrl+A จากระบบ AR — แหล่งเดียวกับ Paste BILLING NOTE)
// → เติม BAR จากหัวใบ + ติ๊กบิลที่ตรงตามลำดับความแม่น AR → ORW → INV + สรุปตัวที่หาไม่เจอ
function barPickerApplySmartText(text) {
  let records = [];
  try {
    records = parseBillingWorkbook(workbookFromClipboardText(text, "Smart paste"), "barpicker-smartpaste", {});
  } catch (error) {
    records = [];
  }
  if (!records.length) {
    setBarPickerSummary(`<span class="bar-pick-sum-warn">ไม่พบรายการเครดิต (AR/ORW/INV) ในข้อความที่วาง</span>`);
    return;
  }
  const norm = (value) => clean(value).toUpperCase();
  const bar = norm(records.find((r) => clean(r.bar))?.bar || extractBarNo(text));
  if (bar && elements.barPickerInput) elements.barPickerInput.value = bar;

  const byAr = new Map();
  const byOrw = new Map();
  const byInv = new Map();
  state.bills.forEach((bill) => {
    if (bill.excluded) return;
    String(bill.creditNos || "").split(/[\s,]+/).map(norm).filter(Boolean)
      .forEach((ar) => { if (!byAr.has(ar)) byAr.set(ar, bill); });
    if (norm(bill.orw) && !byOrw.has(norm(bill.orw))) byOrw.set(norm(bill.orw), bill);
    if (norm(bill.invoice) && !byInv.has(norm(bill.invoice))) byInv.set(norm(bill.invoice), bill);
  });

  barPickerSmartWarn.clear();
  const seen = new Set();
  let matchedCount = 0;
  const blocked = [];
  const unmatched = [];
  records.forEach((record) => {
    const bill = byAr.get(norm(record.ar)) || byOrw.get(norm(record.orw)) || byInv.get(norm(record.inv));
    if (!bill) {
      unmatched.push(record.ar || record.orw || record.inv);
      return;
    }
    if (seen.has(bill.billKey)) return;
    seen.add(bill.billKey);
    const existingBar = norm(bill.barNo);
    if (existingBar && bar && existingBar !== bar) {
      blocked.push(bill);
      barPickerSmartWarn.add(bill.billKey);
      return;
    }
    barPickerSelected.add(bill.billKey);
    matchedCount += 1;
  });

  // บิลที่เจอแต่ตัวกรอง default (มี AR + ยังไม่มี BAR) ซ่อนอยู่ → เปิดแสดงทุกบิลให้เห็นครบ
  const needShowAll = [...barPickerSelected, ...barPickerSmartWarn].some((key) => {
    const bill = state.bills.find((item) => item.billKey === key);
    return bill && (!clean(bill.creditNos) || clean(bill.barNo));
  });
  if (needShowAll && elements.barPickerShowAll) elements.barPickerShowAll.checked = true;

  const parts = [`<span class="bar-pick-sum-ok">จับคู่ได้ ${number(matchedCount)}/${number(records.length)} รายการ</span>`];
  if (bar) parts.push(`BAR: <strong>${htmlEscape(bar)}</strong>`);
  if (blocked.length) parts.push(`<span class="bar-pick-sum-warn">ติด BAR อื่น ${number(blocked.length)} บิล (ไฮไลต์เหลือง — ติ๊กเองถ้าตั้งใจย้าย)</span>`);
  if (unmatched.length) {
    const shown = unmatched.slice(0, 6).map((ref) => htmlEscape(ref)).join(", ");
    parts.push(`<span class="bar-pick-sum-warn">ไม่เจอในระบบ ${number(unmatched.length)} รายการ: ${shown}${unmatched.length > 6 ? ` และอีก ${number(unmatched.length - 6)}` : ""}</span>`);
  }
  setBarPickerSummary(parts.join(" · "));
  renderBarPicker();
}

elements.barPickerSmartPaste?.addEventListener("click", async () => {
  try {
    const text = navigator.clipboard?.readText ? await navigator.clipboard.readText() : "";
    if (!clean(text)) throw new Error("clipboard empty");
    barPickerApplySmartText(text);
  } catch (error) {
    setBarPickerSummary(`<span class="bar-pick-sum-warn">อ่านคลิปบอร์ดอัตโนมัติไม่ได้ — กด Ctrl+V ในหน้าต่างนี้แทน</span>`);
  }
});
// Ctrl+V ที่ไหนก็ได้ในโมดัล: ถ้าข้อความมีเลขอ้างอิงหลายตัวหรือมี BAR = smart paste
// (วางเลขเดี่ยวในช่องค้นหา/ช่อง BAR ยังทำงานปกติ)
elements.barPickerModal?.addEventListener("paste", (event) => {
  const text = event.clipboardData?.getData("text") || "";
  const refs = extractRefs(text);
  if ((refs.ar.length + refs.orw.length + refs.inv.length) >= 2 || extractBarNo(text)) {
    event.preventDefault();
    barPickerApplySmartText(text);
  }
});

elements.bulkBarPickerBtn?.addEventListener("click", () => openBarPicker(clean(elements.bulkBarNo?.value)));
elements.editBarPickerBtn?.addEventListener("click", () => openBarPicker(clean(elements.editBarNo?.value)));
elements.barPickerClose?.addEventListener("click", () => elements.barPickerModal?.close());
elements.barPickerCancel?.addEventListener("click", () => elements.barPickerModal?.close());
elements.barPickerModal?.addEventListener("click", (event) => {
  if (event.target === elements.barPickerModal) elements.barPickerModal.close();
});
elements.barPickerInput?.addEventListener("input", updateBarPickerApplyBtn);
elements.barPickerInput?.addEventListener("keydown", (event) => { if (event.key === "Enter") event.preventDefault(); });
elements.barPickerSearch?.addEventListener("input", renderBarPicker);
elements.barPickerSearch?.addEventListener("keydown", (event) => { if (event.key === "Enter") event.preventDefault(); });
elements.barPickerShowAll?.addEventListener("change", renderBarPicker);
elements.barPickerApply?.addEventListener("click", applyBarPickerSelection);
elements.barPickerBody?.addEventListener("change", (event) => {
  const all = event.target.closest("[data-bar-pick-all]");
  if (all) {
    const keys = barPickerCandidates().map((bill) => bill.billKey);
    if (all.checked) keys.forEach((key) => barPickerSelected.add(key));
    else keys.forEach((key) => barPickerSelected.delete(key));
    renderBarPicker();
    return;
  }
  const pick = event.target.closest("[data-bar-pick]");
  if (pick) {
    if (pick.checked) barPickerSelected.add(pick.dataset.barPick);
    else barPickerSelected.delete(pick.dataset.barPick);
    // อัปเดต highlight แถว + ปุ่ม โดยไม่ re-render ทั้งตาราง (กันโฟกัส/เลื่อนกระตุก)
    pick.closest("tr")?.classList.toggle("case-seq-row-active", pick.checked);
    const allBox = elements.barPickerBody.querySelector("[data-bar-pick-all]");
    if (allBox) {
      const rows = barPickerCandidates();
      allBox.checked = rows.length > 0 && rows.every((bill) => barPickerSelected.has(bill.billKey));
    }
    updateBarPickerApplyBtn();
  }
});
// แก้เงินแบบกลุ่ม: ยอดขาย + ต้นทุน 3 โหมด (ค่าคงที่ / % ของยอดขาย / กำไรคงที่)
function bulkMoneyInputs() {
  const saleRaw = clean(elements.bulkMoneySale.value);
  const costRaw = clean(elements.bulkMoneyCost.value);
  return {
    saleRaw,
    costRaw,
    mode: elements.bulkMoneyCostMode.value,
    saleValue: toNumeric(saleRaw),
    costValue: toNumeric(costRaw),
  };
}

function bulkMoneyValuesForBill(bill, input) {
  const round2 = (value) => Math.round(value * 100) / 100;
  const values = {};
  const newSale = input.saleRaw === "" ? toNumeric(bill.sale) : Math.max(0, input.saleValue);
  if (input.saleRaw !== "") values.sale = round2(newSale);
  if (input.costRaw !== "") {
    let cost;
    if (input.mode === "percent") cost = (newSale * input.costValue) / 100;
    else if (input.mode === "profit") cost = newSale - input.costValue;
    else cost = input.costValue;
    // ต้นทุนรวมเก็บที่ cost ช่องเดียวแบบเดียวกับการแก้รายตัว (mlpCost ถูกยุบเป็น 0)
    values.cost = round2(Math.max(0, cost));
    values.mlpCost = 0;
  }
  return values;
}

function bulkMoneyNote(input) {
  const parts = [];
  if (input.saleRaw !== "") parts.push(`ขาย ${money(Math.max(0, input.saleValue))}`);
  if (input.costRaw !== "") {
    parts.push(input.mode === "percent" ? `ทุน ${number(input.costValue)}% ของขาย`
      : input.mode === "profit" ? `ทุน = ขาย − กำไร ${money(input.costValue)}`
        : `ทุน ${money(input.costValue)}`);
  }
  return parts.join(", ");
}

function renderBulkMoneyPreview() {
  const input = bulkMoneyInputs();
  const bills = state.bills.filter((bill) => state.selectedBillKeys.has(bill.billKey));
  if (!bills.length) {
    elements.bulkMoneyPreview.textContent = "ยังไม่ได้เลือกบิล";
    return;
  }
  if (input.saleRaw === "" && input.costRaw === "") {
    elements.bulkMoneyPreview.textContent = `เลือกไว้ ${number(bills.length)} บิล — กรอกเฉพาะช่องที่อยากแก้ (เว้นว่าง = คงเดิม)`;
    return;
  }
  const sample = bills[0];
  const values = bulkMoneyValuesForBill(sample, input);
  const sale = Object.prototype.hasOwnProperty.call(values, "sale") ? values.sale : toNumeric(sample.sale);
  const cost = Object.prototype.hasOwnProperty.call(values, "cost") ? values.cost : toNumeric(sample.cost) + toNumeric(sample.mlpCost);
  elements.bulkMoneyPreview.textContent = `จะแก้ ${number(bills.length)} บิล — ตัวอย่างบิลแรก (${sample.orw || sample.orderId || "-"}): ขาย ${money(sale)} · ทุน ${money(cost)} · กำไร ${money(sale - cost)}`;
}

function openBulkMoneyModal() {
  if (!state.selectedBillKeys.size) {
    elements.statusText.textContent = "ติ๊กเลือกบิลก่อน แล้วค่อยกด แก้เงิน";
    return;
  }
  elements.bulkMoneySale.value = "";
  elements.bulkMoneyCost.value = "";
  elements.bulkMoneyCostMode.value = "fixed";
  renderBulkMoneyPreview();
  elements.bulkMoneyModal.showModal();
  elements.bulkMoneySale.focus();
}

function applyBulkMoneyEdit() {
  const input = bulkMoneyInputs();
  if (input.saleRaw === "" && input.costRaw === "") {
    elements.bulkMoneyPreview.textContent = "กรอกยอดขายหรือต้นทุนอย่างน้อยหนึ่งช่องก่อนบันทึก";
    elements.bulkMoneySale.focus();
    return;
  }
  const count = state.selectedBillKeys.size;
  const note = bulkMoneyNote(input);
  applyBulkOverride((bill) => bulkMoneyValuesForBill(bill, input), `แก้เงิน: ${note}`);
  elements.bulkMoneyModal.close();
  elements.statusText.textContent = `แก้เงิน (${note}) ให้ ${number(count)} บิลแล้ว`;
}

// เมนู "เพิ่มเติม" — <details> ไม่ปิดเองเวลาคลิกที่อื่น ต้องปิดให้
// กดปุ่มในเมนูก็ปิด (ทุกปุ่มเปิดโมดัล/ทำงานทันที ไม่มีอันไหนต้องกดซ้ำ)
document.addEventListener("click", (event) => {
  const more = elements.bulkMore;
  if (!more?.open) return;
  if (!more.contains(event.target) || event.target.closest(".bulk-more-panel button")) more.open = false;
});
elements.bulkMoneyBtn?.addEventListener("click", openBulkMoneyModal);
elements.closeBulkMoney?.addEventListener("click", () => elements.bulkMoneyModal.close());
elements.cancelBulkMoney?.addEventListener("click", () => elements.bulkMoneyModal.close());
elements.applyBulkMoney?.addEventListener("click", applyBulkMoneyEdit);
[elements.bulkMoneySale, elements.bulkMoneyCost].forEach((inputEl) => {
  inputEl?.addEventListener("input", renderBulkMoneyPreview);
  // Enter = บันทึกเลย ไม่ต้องเอื้อมไปกดปุ่ม
  inputEl?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    applyBulkMoneyEdit();
  });
});
elements.bulkMoneyCostMode?.addEventListener("change", renderBulkMoneyPreview);
elements.bulkMergeBills?.addEventListener("click", mergeSelectedBills);
elements.bulkDeleteBills?.addEventListener("click", deleteSelectedBills);
elements.mergeWarnCard?.addEventListener("click", openMergeWarnModal);
elements.mergeWarnCard?.addEventListener("keydown", (event) => {
  if (event.key === "Enter" || event.key === " ") {
    event.preventDefault();
    openMergeWarnModal();
  }
});
elements.mergeWarnClose?.addEventListener("click", () => elements.mergeWarnModal?.close());
elements.mergeWarnModal?.addEventListener("click", (event) => {
  if (event.target === elements.mergeWarnModal) elements.mergeWarnModal.close();
});

// ===== รายงานยอดเงินเข้า (ตามวันรับเงิน × ใบวางบิล BAR) =====
function payoutBills() {
  return state.bills.filter((bill) => !bill.excluded && bill.billingStage === "paid" && clean(bill.paidDate));
}
function renderPayoutReport() {
  const body = elements.payoutBody;
  if (!body) return;
  const bills = payoutBills();
  if (!bills.length) {
    body.innerHTML = `<p class="case-seq-hint">ยังไม่มีบิลที่ตั้ง PAID + วันรับเงิน — กด "✓ PAID" ที่บิลแล้วใส่วันที่ได้รับเงิน</p>`;
    return;
  }
  const round2 = (v) => Math.round(v * 100) / 100;
  const groups = new Map();
  bills.forEach((bill) => {
    const d = dateKey(bill.paidDate);
    const bar = clean(bill.barNo) || "(ไม่มี BAR)";
    const key = `${d}|${bar}`;
    if (!groups.has(key)) groups.set(key, { date: d, bar, count: 0, sale: 0, profit: 0 });
    const g = groups.get(key);
    g.count += 1; g.sale += toNumeric(bill.sale); g.profit += toNumeric(bill.profit);
  });
  const rows = [...groups.values()].sort((a, b) => b.date.localeCompare(a.date) || a.bar.localeCompare(b.bar));
  const totalSale = round2(bills.reduce((s, b) => s + toNumeric(b.sale), 0));
  const totalProfit = round2(bills.reduce((s, b) => s + toNumeric(b.profit), 0));

  // สรุปรายเดือน — คิดจากบิลตรง ๆ ไม่ใช่จาก rows เพราะ rows ยุบตาม วัน×BAR แล้ว
  // นับ BAR แบบไม่ซ้ำต่อเดือน (ใบวางบิลใบเดียวอาจได้เงินหลายวัน)
  const monthMap = new Map();
  bills.forEach((bill) => {
    const key = dateKey(bill.paidDate).slice(0, 7);
    if (!key) return;
    if (!monthMap.has(key)) monthMap.set(key, { month: key, count: 0, sale: 0, profit: 0, bars: new Set() });
    const m = monthMap.get(key);
    m.count += 1;
    m.sale += toNumeric(bill.sale);
    m.profit += toNumeric(bill.profit);
    m.bars.add(clean(bill.barNo) || "(ไม่มี BAR)");
  });
  const months = [...monthMap.values()].sort((a, b) => b.month.localeCompare(a.month));
  const monthSection = months.length ? `
    <table class="case-seq-table payout-month-table">
      <thead><tr><th>เดือนที่ได้รับเงิน</th><th>บิล</th><th>ใบวางบิล</th><th class="num">ยอดขาย</th><th class="num">กำไร</th></tr></thead>
      <tbody>
        ${months.map((m) => `
        <tr>
          <td><strong>${htmlEscape(monthChipLabel(m.month))}</strong></td>
          <td>${number(m.count)}</td>
          <td>${number(m.bars.size)}</td>
          <td class="num">${money(round2(m.sale))}</td>
          <td class="num">${money(round2(m.profit))}</td>
        </tr>`).join("")}
      </tbody>
    </table>` : "";
  // ยอดต่อวัน (รวมทุก BAR) — โชว้เป็นหัวข้อคั่น
  let lastDate = null;
  const bodyRows = rows.map((g) => {
    const dateHead = g.date !== lastDate ? (() => {
      lastDate = g.date;
      const dayBills = rows.filter((r) => r.date === g.date);
      const daySale = round2(dayBills.reduce((s, r) => s + r.sale, 0));
      const dayCount = dayBills.reduce((s, r) => s + r.count, 0);
      return `<tr class="payout-date-row"><td colspan="4"><strong>${htmlEscape(formatDisplayDate(g.date))}</strong> · ${number(dayCount)} บิล · ยอดขาย ${money(daySale)}</td></tr>`;
    })() : "";
    return `${dateHead}<tr>
      <td class="case-seq-code">${htmlEscape(g.bar)}</td>
      <td>${number(g.count)}</td>
      <td class="num">${money(round2(g.sale))}</td>
      <td class="num">${money(round2(g.profit))}</td>
    </tr>`;
  }).join("");
  body.innerHTML = `
    <div class="payout-summary">รวม <strong>${number(bills.length)}</strong> บิล · ยอดขาย <strong>${money(totalSale)}</strong> · กำไร <strong>${money(totalProfit)}</strong> · ${number(rows.length)} รายการ (วัน × BAR)</div>
    <h3 class="payout-section-title">สรุปรายเดือน</h3>
    ${monthSection}
    <h3 class="payout-section-title">รายวัน × ใบวางบิล</h3>
    <table class="case-seq-table">
      <thead><tr><th>ใบวางบิล (BAR)</th><th>บิล</th><th class="num">ยอดขาย</th><th class="num">กำไร</th></tr></thead>
      <tbody>${bodyRows}</tbody>
    </table>
    <p class="case-seq-hint">นับเฉพาะบิลสถานะ PAID ที่มีวันรับเงิน · จัดกลุ่มตามวันรับเงิน แล้วแยกตามใบวางบิล (BAR) · เรียงวันล่าสุดก่อน</p>
  `;
}
function openPayoutModal() {
  renderPayoutReport();
  if (elements.payoutModal && !elements.payoutModal.open) elements.payoutModal.showModal();
}
elements.openPayoutBtn?.addEventListener("click", openPayoutModal);
elements.payoutClose?.addEventListener("click", () => elements.payoutModal?.close());
elements.payoutModal?.addEventListener("click", (event) => {
  if (event.target === elements.payoutModal) elements.payoutModal.close();
});
elements.mergeWarnBody?.addEventListener("click", (event) => {
  if (event.target.closest("[data-merge-certain]")) {
    mergeCertainGroups();
    return;
  }
  if (event.target.closest("[data-merge-orw]")) {
    mergeOrwComplementGroups();
    return;
  }
  const billedFixAll = event.target.closest("[data-billed-fix-all]");
  if (billedFixAll) {
    const ready = billedReadyBills();
    if (!ready.length) return;
    // ต่างจากปุ่ม Set MLP cost 0 ตรงที่อันนี้ขยับตัวเลขรายได้ (countsInRevenue นับ billed+BAR) → ต้องเห็นจำนวนก่อน
    const ok = confirm([
      `ปรับงานวางบิลเป็น "วางบิลแล้ว" ให้ ${number(ready.length)} บิล?`,
      "",
      "ทุกใบมีเลขใบวางบิล (BAR) และเลขที่เครดิต (AR) ครบแล้ว",
      `ในนี้เป็นใบที่เคยเลือกสถานะเองไว้ ${number(ready.filter((bill) => (bill.billingStageSource || "") === "manual").length)} ใบ — ค่าที่เลือกไว้จะถูกแทนที่`,
      "",
      "ผลข้างเคียง: บิลเหล่านี้จะถูกนับเป็นรายได้ ยอดขาย/กำไรบนการ์ดจะเพิ่มขึ้น",
    ].join("\n"));
    if (!ok) return;
    const keys = new Set(ready.map((bill) => bill.billKey));
    // ตั้ง source เป็น auto-billing ไม่ใช่ manual = คืนบิลให้ระบบดูแลต่อ (ถ้าลบ BAR/AR ทีหลัง สถานะจะถอยกลับเอง)
    applyBulkOverride(() => ({ billingStage: "billed", billingStageSource: "auto-billing" }), "ปรับเป็นวางบิลแล้ว (BAR+AR ครบ)", keys);
    elements.statusText.textContent = `ปรับเป็น "วางบิลแล้ว" ให้ ${number(keys.size)} บิลแล้ว`;
    // drawer เปิดอยู่ = โหลดค่าใหม่ · ส่วนโมดัล WARN ไม่ต้องสั่งเอง:
    // applyBulkOverride → renderTable() → renderMergeSuggestions() รีเฟรช/ปิด popup ให้แล้ว (กติกาเดียวกับปุ่ม Set MLP cost 0)
    if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
    return;
  }
  const billedOpen = event.target.closest("[data-billed-open]");
  if (billedOpen) {
    elements.mergeWarnModal?.close();
    openDetailDrawer(billedOpen.dataset.billedOpen);
    return;
  }
  const fixAll = event.target.closest("[data-nhso-fix-all]");
  if (fixAll) {
    const issues = nhsoCostIssues();
    if (!issues.length) return;
    const keys = new Set(issues.map((bill) => bill.billKey));
    // applyBulkOverride คาสเคด render ต่อ (รวม renderMergeSuggestions → อัปเดต/ปิด popup เอง)
    applyBulkOverride(() => ({ mlpCost: 0 }), "ตั้งต้นทุน MLP = 0 (สปสช)", keys);
    elements.statusText.textContent = `ตั้งต้นทุน MLP = 0 ให้ ${number(keys.size)} บิล สปสช แล้ว`;
    // drawer เปิดอยู่ = โหลดค่าใหม่
    if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
    return;
  }
  const applyCustom = event.target.closest("[data-nhso-apply-custom]");
  if (applyCustom) {
    const edit = nhsoEditorValues();
    if (!Object.keys(edit).length) { showToast("กรอกค่าที่ต้องการอย่างน้อย 1 ช่อง"); return; }
    const keys = new Set([...nhsoWarnSelected]);
    if (!keys.size) return;
    nhsoWarnSelected.clear();
    applyBulkOverride(() => ({ ...edit }), `แก้กลุ่ม สปสช (${Object.keys(edit).join("/")})`, keys);
    elements.statusText.textContent = `แก้ ${number(keys.size)} บิล สปสช แล้ว (${Object.keys(edit).join("/")})`;
    if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
    return;
  }
  const openBill = event.target.closest("[data-nhso-open]");
  if (openBill) {
    elements.mergeWarnModal?.close();
    openDetailDrawer(openBill.dataset.nhsoOpen);
    return;
  }
  const pageBtn = event.target.closest("[data-merge-page]");
  if (pageBtn) {
    mergeSuggestPage += pageBtn.dataset.mergePage === "next" ? 1 : -1;
    renderMergeWarnBody(); // clamp อยู่ในตัว render แล้ว ไม่ต้องเช็กขอบตรงนี้
    return;
  }
  const button = event.target.closest("[data-warn-compare], [data-warn-merge]");
  if (!button) return;
  const isMerge = button.hasAttribute("data-warn-merge");
  const item = state.mergeSuggestions[Number(isMerge ? button.dataset.warnMerge : button.dataset.warnCompare)];
  if (!item) return;
  // คู่นี้อ้างบิลที่ไม่มีในจอแล้ว (ข้อมูลเปลี่ยนหลังคำนวณ) → รีเฟรชรายการ WARN คงเปิดไว้ ไม่ปิดหมด
  const billsExist = state.bills.some((bill) => bill.billKey === item.aKey) && state.bills.some((bill) => bill.billKey === item.bKey);
  if (!billsExist) {
    state.mergeSuggestCacheRef = null;
    renderMergeSuggestions();
    if (warnTotalCount() === 0) elements.mergeWarnModal?.close();
    else renderMergeWarnBody();
    return;
  }
  applySuggestionSelection(item);
  if (isMerge) {
    elements.mergeWarnModal?.close();
    mergeSelectedBills();
    return;
  }
  // ปิด WARN เฉพาะเมื่อ popup เทียบเปิดได้จริง — กันกรณีเปิดไม่สำเร็จแล้วเหลือปิดหมด
  if (openSuggestPairModal(item, "warn")) elements.mergeWarnModal?.close();
});
// เลือกรายบิล / เลือกทั้งหมด ในกลุ่ม NHSO (ไม่ re-render เต็ม เพื่อรักษาค่าที่กรอกในตัวแก้)
elements.mergeWarnBody?.addEventListener("change", (event) => {
  const all = event.target.closest("[data-nhso-check-all]");
  if (all) {
    const checked = all.checked;
    nhsoWarnSelected.clear();
    if (checked) nhsoCostIssues().forEach((b) => nhsoWarnSelected.add(b.billKey));
    elements.mergeWarnBody.querySelectorAll("[data-nhso-check]").forEach((cb) => {
      cb.checked = checked;
      cb.closest("tr")?.classList.toggle("case-seq-row-active", checked);
    });
    updateNhsoApplyBtn();
    updateNhsoPreview();
    return;
  }
  const one = event.target.closest("[data-nhso-check]");
  if (one) {
    if (one.checked) nhsoWarnSelected.add(one.dataset.nhsoCheck); else nhsoWarnSelected.delete(one.dataset.nhsoCheck);
    one.closest("tr")?.classList.toggle("case-seq-row-active", one.checked);
    const allBox = elements.mergeWarnBody.querySelector("[data-nhso-check-all]");
    if (allBox) allBox.checked = nhsoCostIssues().every((b) => nhsoWarnSelected.has(b.billKey));
    updateNhsoApplyBtn();
    updateNhsoPreview();
  }
});
// พิมพ์ค่าในตัวแก้กลุ่ม → อัปเดตปุ่ม + preview กำไรสด
elements.mergeWarnBody?.addEventListener("input", (event) => {
  if (event.target.closest("[data-nhso-edit]")) { updateNhsoApplyBtn(); updateNhsoPreview(); }
});
elements.suggestPairClose?.addEventListener("click", () => elements.suggestPairModal?.close());
elements.suggestPairCancel?.addEventListener("click", () => elements.suggestPairModal?.close());
elements.suggestPairModal?.addEventListener("click", (event) => {
  if (event.target === elements.suggestPairModal) elements.suggestPairModal.close();
});
// ตัวจัดการปุ่มคัดลอกแบบ delegate — ก้อนเดียวกับที่ก๊อปวางไว้อีก 5 ที่ในไฟล์นี้
// ใช้กับกล่องที่เพิ่มใหม่เท่านั้น (ของเดิมปล่อยไว้ ยุบทีเดียวตอน refactor)
function attachCopyDelegate(el) {
  el?.addEventListener("click", (event) => {
    const copyBtn = event.target.closest("[data-copy-text]");
    if (!copyBtn) return;
    const value = clean(copyBtn.dataset.copyText);
    if (!value) return;
    navigator.clipboard?.writeText(value).then(() => {
      const icon = copyBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-check";
        setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
      }
    }).catch(() => {});
  });
}
attachCopyDelegate(elements.mergeWarnBody);
attachCopyDelegate(elements.barPickerBody);

elements.suggestPairBody?.addEventListener("click", (event) => {
  const copyBtn = event.target.closest("[data-copy-text]");
  if (copyBtn) {
    navigator.clipboard?.writeText(copyBtn.dataset.copyText).then(() => {
      const icon = copyBtn.querySelector("i");
      if (icon) {
        icon.className = "fa-solid fa-check";
        setTimeout(() => { icon.className = "fa-regular fa-copy"; }, 1200);
      }
    }).catch(() => {});
    return;
  }
  const openBtn = event.target.closest("[data-pair-open]");
  if (!openBtn) return;
  // ปิด drawer แล้วเด้งกลับป๊อปอัพเทียบพร้อมค่าล่าสุด (เผื่อแก้ใน drawer)
  const item = suggestPairContext;
  const origin = suggestPairOrigin;
  drawerCloseCallback = () => openSuggestPairModal(item, origin);
  elements.suggestPairModal?.close();
  openDetailDrawer(openBtn.dataset.pairOpen);
});
// คู่ที่กำลังจะซ่อน (เก็บไว้ระหว่างเปิด modal ระบุเหตุผล — suggestPairContext อาจเปลี่ยนถ้าเปิด popup อื่น)
let pendingDismissItem = null;
elements.suggestPairDismiss?.addEventListener("click", () => {
  if (!suggestPairContext || !elements.dismissReasonModal) return;
  pendingDismissItem = suggestPairContext;
  elements.dismissReasonText.value = "";
  if (!elements.dismissReasonModal.open) elements.dismissReasonModal.showModal();
  elements.dismissReasonText.focus();
});
elements.dismissReasonChips?.addEventListener("click", (event) => {
  const chip = event.target.closest("[data-reason]");
  if (!chip) return;
  // กดปุ่มเหตุผลสำเร็จรูป: เติมต่อท้าย (คั่นด้วย ", ") เผื่อเลือกหลายเหตุผล
  const current = clean(elements.dismissReasonText.value);
  const picked = chip.dataset.reason;
  const parts = current ? current.split(",").map(clean).filter(Boolean) : [];
  if (!parts.includes(picked)) parts.push(picked);
  elements.dismissReasonText.value = parts.join(", ");
  elements.dismissReasonText.focus();
});
elements.dismissReasonClose?.addEventListener("click", () => elements.dismissReasonModal?.close());
elements.dismissReasonCancel?.addEventListener("click", () => elements.dismissReasonModal?.close());
elements.dismissReasonModal?.addEventListener("click", (event) => {
  if (event.target === elements.dismissReasonModal) elements.dismissReasonModal.close();
});
elements.dismissReasonConfirm?.addEventListener("click", () => {
  if (!pendingDismissItem) return;
  const reason = clean(elements.dismissReasonText.value) || "-";
  elements.dismissReasonModal?.close();
  dismissSuggestionPair(pendingDismissItem, reason);
  pendingDismissItem = null;
  // มาจากรายการ WARN → เด้งกลับไปไล่ตรวจคู่ที่เหลือต่อ (ปิดเองถ้าไม่มี WARN แล้ว)
  if (suggestPairOrigin === "warn") openMergeWarnModal();
});
elements.suggestPairMerge?.addEventListener("click", () => {
  const origin = suggestPairOrigin;
  elements.suggestPairModal?.close();
  // คอลัมน์ "ผลรวม" ในป๊อปอัพยืนยันให้ดูแล้ว → รวมทันทีไม่ต้อง confirm ซ้ำ (มีปุ่มเลิกรวมกันพลาด)
  const mergedKey = mergeSelectedBills(true);
  if (mergedKey) {
    // เปิด drawer บิลที่รวมให้แก้รายช่องต่อทันที ปิด drawer แล้วค่อยกลับ WARN (ถ้ามาจากรายการ WARN)
    drawerCloseCallback = origin === "warn" ? () => openMergeWarnModal() : null;
    openDetailDrawer(mergedKey);
  } else if (origin === "warn") {
    openMergeWarnModal();
  }
});
elements.bulkExclude?.addEventListener("click", () => {
  applyBulkOverride(() => ({ excluded: true }), "Exclude");
});
elements.bulkInclude?.addEventListener("click", () => {
  applyBulkOverride(() => ({ excluded: false }), "ยกเลิก Exclude");
});
elements.bulkClear?.addEventListener("click", () => {
  state.selectedBillKeys.clear();
  document.querySelectorAll("#billTableBody .row-pick").forEach((pick) => {
    pick.checked = false;
  });
  updateBulkBar();
});
// สวิตช์ BE|CE มีหลายจุด (header + popup) — sync ฝั่ง active พร้อมกันทุกตัว
function syncEraToggles() {
  document.querySelectorAll("[data-era-toggle] [data-era]").forEach((button) => {
    button.classList.toggle("active", button.dataset.era === yearEra);
  });
}
function setYearEra(era) {
  if (era !== "be" && era !== "ce") return;
  if (era === yearEra) return;
  yearEra = era;
  try {
    localStorage.setItem(YEAR_ERA_STORAGE_KEY, yearEra);
  } catch (error) {
    /* ignore */
  }
  syncEraToggles();
  renderAll();
  refreshCardDetail();
  if (elements.detailDrawer?.open && state.currentDetailKey) openDetailDrawer(state.currentDetailKey);
}
document.addEventListener("click", (event) => {
  const eraButton = event.target.closest("[data-era-toggle] [data-era]");
  if (eraButton) setYearEra(eraButton.dataset.era);
});
syncEraToggles();
elements.resetOverrideBtn.addEventListener("click", resetBillOverride);
elements.drawerPasteAnalyzeBtn?.addEventListener("click", () => {
  if (state.currentDetailKey) openPasteAnalyze(state.currentDetailKey);
});
elements.closePasteAnalyze?.addEventListener("click", closePasteAnalyzeModal);
elements.cancelPasteAnalyze?.addEventListener("click", closePasteAnalyzeModal);
elements.pasteAnalyzeModal?.addEventListener("click", (event) => {
  if (event.target === elements.pasteAnalyzeModal) closePasteAnalyzeModal();
});
elements.pasteAnalyzeModal?.addEventListener("close", () => {
  state.pasteAnalyzeKey = "";
});
// กัน Enter ในช่องผลวิเคราะห์ไป submit form แล้วปิด dialog โดยไม่ตั้งใจ
elements.pasteAnalyzeModal?.querySelector("form")?.addEventListener("submit", (event) => event.preventDefault());
elements.pasteAnalyzeText?.addEventListener("input", runPasteAnalyze);
elements.pasteAnalyzeClipboardBtn?.addEventListener("click", async () => {
  try {
    const text = await navigator.clipboard.readText();
    if (text) {
      elements.pasteAnalyzeText.value = text;
      runPasteAnalyze();
    } else {
      elements.pasteAnalyzeStatus.textContent = "clipboard ว่าง กด Ctrl+V ในช่องแทน";
    }
  } catch {
    elements.pasteAnalyzeStatus.textContent = "อ่าน clipboard ไม่ได้ กด Ctrl+V ในช่องแทน";
  }
});
elements.pasteAnalyzeResults?.addEventListener("change", updatePasteApplyState);
elements.pasteAnalyzeWarnings?.addEventListener("click", (event) => {
  const switchBtn = event.target.closest("[data-paste-switch]");
  if (switchBtn) switchPasteAnalyzeTarget(switchBtn.dataset.pasteSwitch);
});
elements.applyPasteAnalyzeBtn?.addEventListener("click", applyPasteAnalyzeToBill);
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
// ปุ่ม "เลิกรวมบิลนี้" ในแถวประวัติ — delegate เพราะรายการถูก re-render ทุกครั้งที่ข้อมูลเปลี่ยน
elements.auditList?.addEventListener("click", (event) => {
  const batchBtn = event.target.closest("[data-unmerge-batch]");
  if (batchBtn) {
    const groups = mergeGroupsOfBatch(batchBtn.dataset.unmergeBatch);
    // ชุดใหญ่ = คืนหลายร้อยบิลรวดเดียว ถามก่อน (ต่างจากรายกลุ่มที่คืนแค่ 2 ใบ)
    if (!confirm(`เลิกรวมทั้งชุด ${number(groups.length)} กลุ่ม — บิลต้นฉบับจะกลับมาทั้งหมด?`)) return;
    unmergeBatch(batchBtn.dataset.unmergeBatch);
    return;
  }
  const btn = event.target.closest("[data-unmerge-group]");
  if (!btn) return;
  unmergeGroup(btn.dataset.unmergeGroup);
});
elements.loadSampleBtn.addEventListener("click", loadSampleFiles);
elements.saveSessionBtn.addEventListener("click", saveCurrentSession);
elements.openSessionsBtn.addEventListener("click", openSessionsModal);
elements.closeSessionModal.addEventListener("click", closeSessionsModal);
elements.refreshSessionsBtn.addEventListener("click", loadSessionList);
elements.mergeSessionsBtn?.addEventListener("click", mergeSelectedSessions);
elements.selectAllSessions?.addEventListener("change", () => {
  const checked = elements.selectAllSessions.checked;
  elements.sessionList.querySelectorAll(".session-merge-pick").forEach((pick) => {
    pick.checked = checked;
  });
  updateMergeSessionsButton();
});
elements.sessionList.addEventListener("change", (event) => {
  if (event.target.closest(".session-merge-pick")) updateMergeSessionsButton();
});
elements.sessionList.addEventListener("click", (event) => {
  const mergedToggle = event.target.closest("[data-toggle-merged]");
  if (mergedToggle) {
    state.showMergedAutosaves = mergedToggle.dataset.toggleMerged === "show";
    loadSessionList();
    return;
  }
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
verifyCkncAccess().then(loadMasterProductMappings).then(loadCkncAliases).then(syncSuppliers);
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
