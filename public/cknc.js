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
  barPickerSearch: $("barPickerSearch"),
  barPickerShowAll: $("barPickerShowAll"),
  barPickerBody: $("barPickerBody"),
  barPickerClose: $("barPickerClose"),
  barPickerCancel: $("barPickerCancel"),
  barPickerApply: $("barPickerApply"),
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
  pasteAnalyzeModal: $("pasteAnalyzeModal"),
  closePasteAnalyze: $("closePasteAnalyze"),
  cancelPasteAnalyze: $("cancelPasteAnalyze"),
  pasteAnalyzeText: $("pasteAnalyzeText"),
  pasteAnalyzeClipboardBtn: $("pasteAnalyzeClipboardBtn"),
  pasteAnalyzeStatus: $("pasteAnalyzeStatus"),
  pasteAnalyzeWarnings: $("pasteAnalyzeWarnings"),
  pasteAnalyzeResults: $("pasteAnalyzeResults"),
  pasteAnalyzeSummary: $("pasteAnalyzeSummary"),
  applyPasteAnalyzeBtn: $("applyPasteAnalyzeBtn"),
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
  "clicknic-only": "tabCountClickOnly",
  "billing-only": "tabCountBillingOnly",
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
  // ตัดเลข BAR ออกก่อนหา AR — "BAR-00003-26-xxxx" มี "AR-..." ซ้อนอยู่ข้างใน จะได้ไม่กลายเป็นเลขเครดิตผี
  const arSource = text.replace(/BAR-\d{5}-\d{2}-\d+/gi, " ");
  return {
    ar: arSource.match(/AR-\d{5}-\d{2}-\d{4,}/g) || [],
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
  const lines = [];
  if (clean(bill.creditNos)) lines.push(`เครดิต ${bill.creditNos}`);
  if (clean(bill.barNo)) {
    const bars = clean(bill.barNo).split(",").map(clean).filter(Boolean);
    const count = bars.reduce((sum, bar) => sum + (barCredits?.get(bar)?.size || 0), 0);
    lines.push(`ใบวางบิล ${bill.barNo}${count ? ` (${number(count)} เครดิต)` : ""}`);
  } else if (!clean(bill.creditNos) && clean(bill.billingNo)) {
    // snapshot เก่าไม่มี barNo/creditNos: แสดง billingNo เดิมไว้ก่อน
    lines.push(`ใบวางบิล ${bill.billingNo}`);
  }
  return lines.map((line) => `<span class="bill-ref">${htmlEscape(line)}</span>`).join("");
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

function dedupeMlpRows(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = [row.referenceNo, row.invoice, Number(row.mlpCost || 0).toFixed(4), row.detail].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function dedupeBillingRows(rows) {
  const seen = new Set();
  return rows.filter((row) => {
    const key = [row.bar, row.ar, row.orw, row.inv, Number(row.amount || 0).toFixed(2), row.dueDate].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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

function parseBillingRecord(cells, sourceName, sheetName, rowNumber, contextBar = "") {
  const text = cells.map(clean).filter(Boolean).join(" ");
  const refs = extractRefs(text);
  if (!refs.orw.length && !refs.inv.length && !refs.ar.length) return null;
  return {
    bar: extractBarNo(sourceName) || extractBarNo(text) || contextBar,
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
    // เลข BAR ที่เจอล่าสุดในชีต (เช่นหัวกระดาษหน้าใบวางบิลลูกหนี้ที่ copy ทั้งหน้ามาวาง)
    // → ผูกให้รายการเครดิต (AR) ทุกแถวถัดไปที่ไม่มี BAR ของตัวเอง
    let contextBar = "";
    const flushPendingRecord = () => {
      if (!pendingRecord) return;
      const record = parseBillingRecord(pendingRecord.cells, sourceName, sheetName, pendingRecord.rowNumber, pendingRecord.contextBar);
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

      const record = parseBillingRecord(cells, sourceName, sheetName, index + 1, contextBar);
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
  // เพิ่มรายการยาเองใน drawer แล้ว: สถานะ "ไม่พบรายการยา" ไม่เป็นจริงอีกต่อไป → ถือว่าจับคู่ได้
  if (merged.status === "mlp-only" && merged.medicines?.length) merged.status = "matched";
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
  if (issues.some((issue) => issue.code === code)) return;
  issues.push({ level, code, text });
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
  if (bill.status === "clicknic-only") {
    pushIssue(issues, "danger", "CLICKNIC_NOT_IN_MLP", "รายการยาไม่มี MLP");
  }
  if (bill.profit < -Math.max(0, toNumeric(activeRuleConfig().negativeProfitTolerance))) {
    pushIssue(issues, "warn", "NEGATIVE_PROFIT", "กำไรติดลบ");
  }
  if (bill.clicknicDate && bill.mlpDate && dateKey(bill.clicknicDate) !== dateKey(bill.mlpDate)) {
    pushIssue(issues, "info", "DATE_MISMATCH", `วันที่ CKNC (${formatDisplayDate(bill.clicknicDate)}) ไม่ตรงกับ MLP (${formatDisplayDate(bill.mlpDate)})`);
  }
  if ((bill.status === "matched" || bill.status === "pending-billing") && toNumeric(bill.cost) + toNumeric(bill.mlpCost) <= 0) {
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
  if (toNumeric(bill.expectedClaim) > 0 && toNumeric(bill.billedAmount) > 0
    && moneyDiff(bill.expectedClaim, bill.billedAmount) > billingAmountTolerance()) {
    pushIssue(issues, "info", "EXPECTED_CLAIM_MISMATCH", `ยอดใบวางบิลไม่ตรงยอดเรียกเก็บ CKNC-INS/NHSO ${money(bill.expectedClaim)}`);
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
  const sale = bills.reduce((sum, bill) => sum + bill.sale, 0);
  // แยกยอดขายตามประเภทเคส (ตามช่วงวันที่ที่กรองอยู่) — สปสช / ประกัน / อื่น ๆ
  const saleNhso = bills.filter((bill) => bill.caseType === "nhso").reduce((sum, bill) => sum + bill.sale, 0);
  const saleInsurance = bills.filter((bill) => bill.caseType === "insurance").reduce((sum, bill) => sum + bill.sale, 0);
  const saleOther = sale - saleNhso - saleInsurance;
  const cost = bills.reduce((sum, bill) => sum + bill.cost, 0);
  const mlpCost = bills.reduce((sum, bill) => sum + bill.mlpCost, 0);
  const totalCost = cost + mlpCost;
  const profitBills = bills.filter((bill) => bill.status === "matched" || bill.status === "pending-billing");
  const profit = profitBills.reduce((sum, bill) => sum + bill.profit, 0);
  // แยกกำไรตามประเภทเคส (ตามช่วงวันที่ที่กรองอยู่) — สปสช / ประกัน / อื่น ๆ
  const profitNhso = profitBills.filter((bill) => bill.caseType === "nhso").reduce((sum, bill) => sum + bill.profit, 0);
  const profitInsurance = profitBills.filter((bill) => bill.caseType === "insurance").reduce((sum, bill) => sum + bill.profit, 0);
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
    autosaveStatusText("Autosave: ครบ CKNC+MLP+BARแล้ว — รอ login เพื่อบันทึกขึ้น cloud");
    return;
  }
  clearTimeout(state.autosaveTimer);
  autosaveStatusText("Autosave: ครบ CKNC+MLP+BAR กำลังบันทึกขึ้น cloud...");
  autosaveMonthlySession("all-steps-complete");
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
    const month = (dateKey(bill.clicknicDate || bill.mlpDate) || "").slice(0, 7);
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
      <span>${htmlEscape(monthShort)}</span><span>${entry.nhso ? number(entry.nhso) : "—"}</span><span>${entry.insurance ? number(entry.insurance) : "—"}</span>
    </button>`;
  }).join("");
  body.innerHTML = `<div class="monthly-cases-row head"><span></span><span>สปสช</span><span>ประกัน</span></div>${rows}`;
}

function toggleMonthFilter(month) {
  const range = monthRangeOf(month);
  const alreadyActive = elements.dateFrom.value === range.from && elements.dateTo.value === range.to;
  elements.dateField.value = "clicknicDate";
  elements.dateFrom.value = alreadyActive ? "" : range.from;
  elements.dateTo.value = alreadyActive ? "" : range.to;
  elements.targetDate.value = "";
  state.activeStatus = "all";
  renderMetrics();
  renderTabs();
  renderTable();
  renderQuickDateFilters();
}

function renderMetrics() {
  updateEmptyState();
  renderMonthlyCases();
  const metrics = calculateMetrics();
  Object.entries(metricIds).forEach(([key, id]) => {
    const el = $(id);
    if (!el) return; // การ์ดถูกเอาออกจากหน้า (เช่น MLP รอใบวางบิล) — ข้ามไป
    el.textContent = ["sale", "totalCost", "profit"].includes(key) ? money(metrics[key]) : number(metrics[key]);
    const card = el.closest(".metric");
    if (card) {
      card.dataset.summaryCard = key;
      card.tabIndex = 0;
      card.setAttribute("role", "button");
      card.setAttribute("aria-label", `ดูรายละเอียด ${card.querySelector("span")?.textContent || key}`);
      if (card.classList.contains("mini")) card.classList.toggle("is-zero", !toNumeric(metrics[key]));
    }
  });
  const period = activePeriodLabel();
  // การ์ดกำไร + ยอดขาย: ป้ายช่วงเวลา + chip แยก สปสช/ประกัน/อื่น ๆ ตามช่วงวันที่ที่กรองอยู่
  renderCaseBreakdown(elements.metricProfitPeriod, elements.metricProfitBreakdown, period, metrics.profitNhso, metrics.profitInsurance, metrics.profitOther);
  renderCaseBreakdown(elements.metricSalePeriod, elements.metricSaleBreakdown, period, metrics.saleNhso, metrics.saleInsurance, metrics.saleOther);
}

function renderCaseBreakdown(periodEl, breakdownEl, period, nhso, insurance, other) {
  if (periodEl) periodEl.textContent = period ? `· ${period}` : "";
  if (!breakdownEl) return;
  const parts = [
    { label: "สปสช", value: nhso, cls: "case-nhso" },
    { label: "ประกัน", value: insurance, cls: "case-insurance" },
    { label: "อื่น ๆ", value: other, cls: "case-other" },
  ].filter((part) => Math.abs(toNumeric(part.value)) >= 0.005);
  breakdownEl.innerHTML = parts
    .map((part) => `<span class="profit-breakdown-chip ${part.cls}"><em>${htmlEscape(part.label)}</em> ${money(part.value)}</span>`)
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
  const allMonths = clicknicMonthBuckets(buckets);
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

  // แถววัน: เลือกเดือน/ปีแล้วเหลือเฉพาะวันในช่วงนั้น
  const days = buckets.filter((bucket) => {
    if (activeMonth) return bucket.date.startsWith(activeMonth);
    if (activeYear) return bucket.date.startsWith(activeYear);
    return true;
  });
  const dayRow = `
    <div class="date-chip-row">
      <button class="date-chip ${!activeFrom && !activeTo ? "active" : ""}" type="button" data-clicknic-date="all">ทุกวัน CLICKNIC</button>
      ${days.map((bucket) => `
        <button class="date-chip ${activeFrom === bucket.date && activeTo === bucket.date ? "active" : ""}" type="button" data-clicknic-date="${bucket.date}">
          ${formatDisplayDate(bucket.date)} <span>(${number(bucket.orders.size)})</span>
        </button>
      `).join("")}
    </div>`;

  elements.quickDateFilters.innerHTML = yearRow + monthRow + dayRow;
}

// แถบ "ยังไม่ครบ" — โชว์เฉพาะกลุ่มที่ยัง match ไม่ครบ (กด chip = กรองไปที่กลุ่มนั้น) นับตามช่วงวันที่ที่กรอง
function renderMergeAssistant() {
  if (!elements.mergeAssistant) return;
  const counts = statusCounts();
  const gaps = [
    { status: "clicknic-only", label: "รายการยาไม่มี MLP", value: counts["clicknic-only"] || 0, tone: "danger" },
    { status: "mlp-only", label: "ไม่พบรายการยา", value: counts["mlp-only"] || 0, tone: "warning" },
    { status: "billing-only", label: "ใบวางบิลไม่เจอ MLP", value: counts["billing-only"] || 0, tone: "danger" },
    { status: "pending-billing", label: "รอใบวางบิล", value: counts["pending-billing"] || 0, tone: "warning" },
  ].filter((gap) => gap.value > 0);
  const totalGap = gaps.reduce((sum, gap) => sum + gap.value, 0);
  elements.mergeAssistant.innerHTML = `
    <div class="merge-line">
      <span class="merge-line-title" title="กลุ่มบิลที่ยังจับคู่ 3 ฝั่งไม่ครบ — กดเพื่อไปแก้">${totalGap ? `ยังไม่ครบ <strong>${number(totalGap)}</strong> รายการ` : "สถานะจับคู่ 3 ฝั่ง"}</span>
      ${totalGap
        ? gaps.map((gap) => `<button type="button" class="gap-chip ${gap.tone}${state.activeStatus === gap.status ? " active" : ""}" data-gap-status="${htmlEscape(gap.status)}" title="กดเพื่อกรองดูเฉพาะกลุ่มนี้">${htmlEscape(gap.label)} <strong>${number(gap.value)}</strong></button>`).join("")
        : '<span class="gap-all-clear"><i class="fa-solid fa-circle-check"></i> ครบทุกฝั่ง</span>'}
    </div>
  `;
}

const cardDetailConfigs = {
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
    text: (bill) => (bill.validationIssues || []).map(issueChipShortText).join(", ") || "-",
    html: (bill) => {
      const issues = bill.validationIssues || [];
      if (!issues.length) return "-";
      return `<div class="issue-chip-list">${issues.map(issueChipHtml).join("")}</div>`;
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
  renderTabs();
  renderTable();
  closeCardDetail();
}

function openCardDetail(cardKey) {
  const config = cardDetailConfigs[cardKey];
  if (!config || !elements.cardDetailModal) return;
  const cardChanged = state.currentCardKey !== cardKey;
  state.currentCardKey = cardKey;
  if (cardChanged) cardBulkSelected.clear();
  const rows = config.rows();
  // ตัดคีย์ที่เลือกไว้แต่ไม่อยู่ในกลุ่มนี้แล้ว (เช่นเปลี่ยนประเภทเคสแล้วบิลหลุดออกจากการ์ด)
  const rowKeys = new Set(rows.map((bill) => bill.billKey));
  [...cardBulkSelected].forEach((key) => { if (!rowKeys.has(key)) cardBulkSelected.delete(key); });
  const shownRows = rows.slice(0, 80);
  const { columns, chips } = visibleCardColumns(shownRows);
  elements.cardDetailTitle.textContent = config.title;
  elements.cardDetailSummary.textContent = `${activePeriodLabel() ? `${activePeriodLabel()} | ` : ""}${summarizeCardRows(rows)}${rows.length > 80 ? ` | แสดง 80 แถวแรก` : ""}`;
  elements.cardDetailHeadRow.innerHTML = columns
    .map((column) => `<th class="${cardColumnClass(column, false)}">${column.headHtml ? column.headHtml() : htmlEscape(column.label)}</th>`)
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
  renderCardBulkBar();
  if (!elements.cardDetailModal.open) elements.cardDetailModal.showModal();
}

// แถบแก้ bulk ในหน้า Card Detail — โผล่เมื่อมีบิลติ๊กเลือก
function renderCardBulkBar() {
  if (!elements.cardDetailBulkBar) return;
  const count = cardBulkSelected.size;
  elements.cardDetailBulkBar.hidden = count === 0;
  if (elements.cardBulkCount) elements.cardBulkCount.textContent = `เลือก ${number(count)} บิล`;
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

function renderBillingStageSelect(bill) {
  const value = bill.billingStage || "pending-review";
  return `
    <select class="billing-stage-select ${value}" data-billing-stage-key="${htmlEscape(bill.billKey)}" aria-label="สถานะงานวางบิล">
      ${billingStageOptions.map(([key, label]) => `<option value="${key}" ${key === value ? "selected" : ""}>${label}</option>`).join("")}
    </select>
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
  // ยอดรวมของชุดที่กรองอยู่ (ไม่นับบิล Exclude ยกเว้นกำลังดูแท็บ Exclude)
  const summaryRows = rows.filter((bill) => state.activeStatus === "excluded" || !bill.excluded);
  const totals = summaryRows.reduce((acc, bill) => {
    acc.sale += toNumeric(bill.sale);
    acc.cost += toNumeric(bill.cost) + toNumeric(bill.mlpCost);
    acc.profit += toNumeric(bill.profit);
    acc.billed += toNumeric(bill.billedAmount);
    return acc;
  }, { sale: 0, cost: 0, profit: 0, billed: 0 });
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
  const periodLabel = activePeriodLabel();
  elements.tableSummary.textContent = state.bills.length
    ? `${periodLabel ? `${periodLabel}: ` : ""}แสดง ${number(rows.length)} จาก ${number(state.bills.length)} บิล · ขาย ${money(totals.sale)} · ต้นทุน ${money(totals.cost)} · กำไร ${money(totals.profit)} · วางบิล ${money(totals.billed)}${caseText ? ` · ${caseText}` : ""}`
    : "ยังไม่มีข้อมูล";

  if (!rows.length) {
    elements.billTableBody.innerHTML = `<tr><td colspan="7" class="empty">ไม่พบข้อมูลตามตัวกรอง</td></tr>`;
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
          <button class="bill-analyze-btn" type="button" data-paste-analyze="${htmlEscape(bill.billKey)}" title="แก้ไขจากข้อความ paste (วิเคราะห์อัตโนมัติ)" aria-label="แก้ไขจากข้อความ paste"><i class="fa-solid fa-wand-magic-sparkles"></i></button>
        </span>
        <span class="bill-ref">${bill.orderId ? `${bill.orderId} <button class="copy-ref-btn" type="button" data-copy-text="${htmlEscape(bill.orderId)}" title="คัดลอกเลขที่ออเดอร์" aria-label="คัดลอกเลขที่ออเดอร์"><i class="fa-regular fa-copy"></i></button>` : "-"}</span>
        <span class="bill-ref">${htmlEscape(bill.orw || "ORW -")}${clean(bill.orw) ? ` <button class="copy-ref-btn" type="button" data-copy-text="${htmlEscape(clean(bill.orw.split(",")[0]))}" title="คัดลอก ORW" aria-label="คัดลอก ORW"><i class="fa-regular fa-copy"></i></button>` : ""}${caseSeqChipHtml(bill) ? ` ${caseSeqChipHtml(bill)}` : ""}</span>
        ${billRefLinesHtml(bill, barCredits)}
        ${bill.refId || bill.phone ? `<span class="bill-ref bill-contact">${htmlEscape([bill.refId, bill.phone].filter(Boolean).join(" · "))}</span>` : ""}
      </td>
      <td class="stack-cell">
        ${bill.status === "matched" ? "" : renderStatusSelect(bill)}
        ${renderBillingStageSelect(bill)}
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
        <span class="money-row"><span class="money-tag">ทุน</span>${renderInlineMoneyInput(bill, "totalCost", "ต้นทุน")}</span>
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

function renderMedsCell(bill) {
  const lines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  const addBtn = `<button class="med-add-btn" type="button" data-med-add="${htmlEscape(bill.billKey)}" title="เพิ่มรายการยาในบิลนี้">+ เพิ่มยา</button>`;
  if (!lines.length) return `<div class="meds-clamp" data-meds-body>-</div>${addBtn}`;
  const rowsHtml = lines.map((line, index) => {
    const qty = toNumeric(line.qty);
    const sale = toNumeric(line.sale);
    const unit = qty > 0 ? Math.round((sale / qty) * 100) / 100 : Math.round(sale * 100) / 100;
    const name = htmlEscape(line.medicine || "-");
    return `
      <div class="med-line">
        <span class="med-name" title="${name}">${name}</span>
        <input class="inline-cell-input med-input" type="text" inputmode="decimal" value="${qty}" data-med-key="${htmlEscape(bill.billKey)}" data-med-index="${index}" data-med-field="qty" aria-label="จำนวน ${name}" title="จำนวน" />
        <span class="med-x">×</span>
        <input class="inline-cell-input med-input med-price" type="text" inputmode="decimal" value="${unit > 0 ? unit : ""}" placeholder="ราคา" data-med-key="${htmlEscape(bill.billKey)}" data-med-index="${index}" data-med-field="unitPrice" aria-label="ราคาต่อหน่วย ${name}" title="ราคาต่อหน่วย" />
        <span class="med-line-total" title="ยอดขายบรรทัดนี้">${sale > 0 ? `= ${money(sale)}` : "= —"}</span>
      </div>
    `;
  }).join("");
  const collapsible = lines.length > 3;
  const fullLabel = `ดูทั้งหมด (${number(lines.length)} รายการ)`;
  return `
    <div class="med-lines${collapsible ? " collapsible" : ""}" data-meds-body>${rowsHtml}</div>
    ${collapsible ? `<button class="meds-toggle" type="button" data-meds-toggle data-label-full="${fullLabel}">${fullLabel}</button>` : ""}
    ${addBtn}
  `;
}

function quickUpdateMedicineLine(billKey, index, field, rawValue) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  const baseLines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  if (!baseLines[index]) return;
  const round2 = (value) => Math.round(value * 100) / 100;
  const lines = baseLines.map((line) => ({
    medicine: line.medicine || "",
    qty: toNumeric(line.qty),
    sale: toNumeric(line.sale),
    cost: toNumeric(line.cost),
  }));
  const pricedBefore = lines.some((line) => line.sale > 0);
  const line = lines[index];
  const originalQty = line.qty;
  const originalSale = line.sale;
  const prevUnit = originalQty > 0 ? originalSale / originalQty : 0;
  const value = Math.max(0, toNumeric(rawValue));
  if (field === "qty") {
    line.qty = value;
    line.sale = round2(value * prevUnit);
  } else if (field === "unitPrice") {
    line.sale = round2((originalQty || 1) * value);
  } else {
    return;
  }
  if (line.qty === originalQty && line.sale === originalSale) return;
  const newSale = round2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  // บิลจาก session เก่าที่ยังไม่มีราคาต่อหน่วยเลย: แก้จำนวนอย่างเดียวต้องไม่ทับยอดขายเดิมของบิล
  const shouldSetSale = pricedBefore || field === "unitPrice" || newSale > 0;
  const existing = state.billOverrides[bill.billKey] || {};
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      medicines: lines,
      medicineCount: lines.length,
      medicinesText: lines.map((item) => `${item.medicine} x${number(item.qty)}`).join(", "),
      ...(shouldSetSale ? { sale: newSale } : {}),
    },
    note: existing.note || "แก้รายการยาจากตาราง",
    updatedAt: new Date().toISOString(),
  };
  const afterUnit = line.qty > 0 ? round2(line.sale / line.qty) : line.sale;
  state.auditTrail.unshift({
    id: makeAuditId(),
    action: "edit_medicine_line",
    createdAt: new Date().toISOString(),
    orderId: bill.orderId,
    orw: bill.orw,
    invoice: bill.invoice,
    date: bill.clicknicDate || bill.mlpDate,
    lineCount: lines.length,
    totalSale: newSale,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: `${line.medicine}: x${number(originalQty)} @${money(round2(prevUnit))} -> x${number(line.qty)} @${money(afterUnit)}`,
    medicines: [{ medicine: line.medicine, qty: line.qty, sale: line.sale, cost: line.cost }],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("medicine-line-update");
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
    <input class="inline-cell-input med-input med-price" type="text" inputmode="decimal" placeholder="ราคา" data-new-med-field="unitPrice" aria-label="ราคาต่อหน่วย" title="ราคาต่อหน่วย" />
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
  quickAddMedicineLine(form.dataset.newMedForm, medicine, qty, unitPrice);
}

function quickAddMedicineLine(billKey, medicine, qty, unitPrice) {
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
  const newLine = { medicine, qty, sale: round2(qty * unitPrice), cost: 0 };
  lines.push(newLine);
  const newSale = round2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  // บิลเก่าที่ไม่มีราคาต่อหน่วยเลยและไม่ได้ใส่ราคา: อย่าทับยอดขายเดิมของบิล
  const shouldSetSale = pricedBefore || unitPrice > 0;
  const existing = state.billOverrides[bill.billKey] || {};
  state.billOverrides[bill.billKey] = {
    ...existing,
    values: {
      ...(existing.values || {}),
      medicines: lines,
      medicineCount: lines.length,
      medicinesText: lines.map((item) => `${item.medicine} x${number(item.qty)}`).join(", "),
      ...(shouldSetSale ? { sale: newSale } : {}),
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
    totalSale: newSale,
    totalCost: bill.cost,
    screenshotName: "summary-table",
    replacedLineCount: 0,
    note: `เพิ่ม ${medicine}: x${number(qty)}${unitPrice > 0 ? ` @${money(unitPrice)}` : ""}`,
    medicines: [newLine],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("medicine-line-add");
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
            <td class="seq-col"><input type="text" inputmode="numeric" class="inline-cell-input case-seq-input${isDup ? " case-seq-input-dup" : ""}" data-seq-row="${htmlEscape(item.billKey)}" value="${item.caseSeq}" title="${isDup ? `ลำดับ #${number(item.caseSeq)} ซ้ำกับบิลอื่น — แก้ให้ไม่ซ้ำ` : "เลขลำดับเคส — ว่าง = กลับไปนับอัตโนมัติ"}" aria-label="เลขลำดับเคส" /></td>
            <td><span class="case-seq-chip case-${htmlEscape(caseType)} case-seq-bar-chip" style="border-color:${barColor}" title="${htmlEscape(barTitle)}">${htmlEscape(caseSeqCode(caseType, item.caseSeq, monthNo))}${manual ? "*" : ""}</span>${bar ? "" : `<button type="button" class="case-seq-addbar-chip" data-bar-add="${htmlEscape(item.billKey)}" title="ยังไม่มีใบวางบิล (BAR) — กดเพื่อใส่ BAR ให้เคสนี้">+ BAR</button>`}</td>
            <td class="case-seq-date">${htmlEscape(formatDisplayDate(item.clicknicDate || item.mlpDate) || "-")}</td>
            <td class="case-seq-bill">
              <span class="case-seq-bill-line">
                <button type="button" class="case-seq-bill-link" data-seq-open="${htmlEscape(item.billKey)}" title="เปิดรายละเอียด / แก้ไขบิลนี้">${htmlEscape(item.orderId || item.orw || "-")}</button>
                ${clean(item.orderId || item.orw) ? `<button type="button" class="copy-ref-btn" data-copy-text="${htmlEscape(clean(item.orderId || item.orw))}" title="คัดลอกเลขที่ออเดอร์" aria-label="คัดลอกเลขที่ออเดอร์"><i class="fa-regular fa-copy"></i></button>` : ""}
              </span>
              <span class="case-seq-patient">${htmlEscape(item.patient || "-")}</span>
            </td>
            <td class="act-col"><button type="button" class="row-action icon-action" data-seq-open="${htmlEscape(item.billKey)}" title="รายละเอียด / แก้ไข" aria-label="รายละเอียด / แก้ไข"><i class="fa-solid fa-pen-to-square"></i></button></td>
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

async function importClipboardText(kind, text) {
  const workbook = workbookFromClipboardText(text, `Clipboard ${kind}`);
  const sourceName = `clipboard-${kind}`;
  const parsed = kind === "clicknic" ? parseClicknicWorkbook(workbook, sourceName)
    : kind === "mlp" ? parseMlpWorkbook(workbook, sourceName)
      : parseBillingWorkbook(workbook, sourceName);

  let mode = "replace";
  if (state.bills.length) {
    mode = await askImportMode(`ข้อมูลบนจอมี ${number(state.bills.length)} บิล — clipboard (${clipboardKindLabel(kind)}) มี ${number(parsed.length)} แถวข้อมูล (โหมดเพิ่ม: แถวซ้ำถูกตัดอัตโนมัติ และค่าที่แก้มือไว้คงอยู่)`);
    if (!mode) return false;
  }

  if (mode === "append") {
    mergeImportedIntoState({
      clicknicRows: kind === "clicknic" ? parsed : [],
      mlpRows: kind === "mlp" ? parsed : [],
      billingRows: kind === "billing" ? parsed : [],
    });
  } else {
    state.activeSessionId = "";
    state.snapshotMode = false;
    if (kind === "clicknic") {
      state.clicknicRows = dedupeClicknicRows(parsed);
    } else if (kind === "mlp") {
      state.mlpRows = dedupeMlpRows(parsed);
    } else if (kind === "billing") {
      state.billingRows = parsed;
    }
  }

  renderAll();
  scheduleAutosave(`clipboard-${kind}`);
  elements.statusText.textContent = `Imported ${clipboardKindLabel(kind)} from clipboard`;
  return true;
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
function mergeSelectedBills() {
  const members = state.bills.filter((bill) => state.selectedBillKeys.has(bill.billKey));
  if (members.length < 2) return;
  const ordered = [...members].sort((a, b) => billRichness(b) - billRichness(a));
  const label = (bill) => [bill.orderId || bill.orw || bill.billingNo || "(ไม่มีเลขที่)", bill.patient]
    .map(clean).filter(Boolean).join(" · ");
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
  state.billMergeGroups.push({
    id: `merge-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`,
    memberKeys: ordered.map((bill) => bill.billKey),
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
    screenshotName: "bulk-bar",
    replacedLineCount: 0,
    note: `รวมบิล ${number(ordered.length)} ใบ → ${label(ordered[0])}`,
    medicines: [],
  });
  rebuildBillsForCurrentMode();
  renderMetrics();
  renderTabs();
  renderTable();
  renderAuditTrail();
  scheduleAutosave("merge-bills");
  elements.statusText.textContent = `รวม ${number(ordered.length)} บิลเป็นบิลเดียว: ${label(ordered[0])}`;
}

// ---- ระบบแนะนำคู่บิลที่น่าจะรวมกัน (merge suggestions) --------------------
// คีย์ชื่อผู้รับบริการแบบ normalize: ตัดคำนำหน้า/ช่องว่าง เทียบกันได้ตรง ๆ
function normalizedPatientKey(name) {
  return clean(name).toLowerCase()
    .replace(/^(คุณ|นาย|นางสาว|นาง|ดช\.?|ดญ\.?|เด็กชาย|เด็กหญิง|บริษัท)\s*/g, "")
    .replace(/\s+/g, "");
}

// เลข ORW ทั้งหมดของบิล (จากช่อง orw และเลขที่ออเดอร์ที่เป็นรูปแบบ ORW)
function billOrwRefs(bill) {
  const refs = new Set();
  clean(bill.orw).split(",").map(clean).filter(Boolean).forEach((ref) => refs.add(ref.toUpperCase()));
  if (/^ORW-/i.test(clean(bill.orderId))) refs.add(clean(bill.orderId).toUpperCase());
  return refs;
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

// หา "คู่ที่น่าจะเป็นบิลเดียวกัน" — จับกลุ่มจากสัญญาณแรง (ORW/เบอร์/ชื่อ) ก่อน แล้วค่อยให้คะแนนรายคู่
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
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 8);
}

// เคส สปสช โดยปกติต้นทุน MLP = 0.00 — เคสที่ ≠ 0 ถือเป็นรายการต้องตรวจ (รวมที่ WARN)
function nhsoCostIssues() {
  return activeBills().filter((bill) => bill.caseType === "nhso" && Math.abs(toNumeric(bill.mlpCost)) >= 0.005);
}

function warnTotalCount() {
  return state.mergeSuggestions.length + nhsoCostIssues().length;
}

function renderMergeSuggestions() {
  // คำนวณใหม่เฉพาะเมื่อชุดบิลเปลี่ยน (state.bills ถูกสร้างใหม่ทุกครั้งที่ rebuild) — พิมพ์ค้นหาไม่ต้องคิดซ้ำ
  if (state.mergeSuggestCacheRef !== state.bills) {
    state.mergeSuggestCacheRef = state.bills;
    state.mergeSuggestions = computeMergeSuggestions();
  }
  const warnCount = warnTotalCount();
  // การ์ด WARN ในแถวการ์ดเล็ก — กดแล้วเปิด popup (ไม่มีอะไรเตือน = ซ่อนการ์ด)
  if (elements.mergeWarnCard) {
    elements.mergeWarnCard.hidden = warnCount === 0;
    if (elements.metricMergeWarn) elements.metricMergeWarn.textContent = number(warnCount);
  }
  // popup เปิดค้างอยู่ → ตามข้อมูลล่าสุด (เตือนหมดแล้วปิดเอง)
  if (elements.mergeWarnModal?.open) {
    if (warnCount === 0) elements.mergeWarnModal.close();
    else renderMergeWarnBody();
  }
}

function renderMergeWarnBody() {
  const suggestions = state.mergeSuggestions;
  const nhsoIssues = nhsoCostIssues();
  if (elements.mergeWarnTitle) elements.mergeWarnTitle.textContent = `รายการที่ต้องตรวจ (${number(suggestions.length + nhsoIssues.length)})`;
  if (!elements.mergeWarnBody) return;
  const pairSection = suggestions.length ? `
    <h3 class="warn-section-title">น่าจะเป็นบิลเดียวกัน ${number(suggestions.length)} คู่</h3>
    <table class="case-seq-table">
      <thead><tr><th>%</th><th>คู่บิล</th><th>เหตุผล</th><th class="act-col">จัดการ</th></tr></thead>
      <tbody>
        ${suggestions.map((item, index) => `
        <tr>
          <td><span class="merge-suggest-score">${item.score}%</span></td>
          <td class="merge-warn-names">${htmlEscape(item.aLabel)} ↔ ${htmlEscape(item.bLabel)}</td>
          <td class="merge-warn-reasons">${htmlEscape(item.reasons.join(" + "))}</td>
          <td class="act-col">
            <button class="ghost small" type="button" data-warn-compare="${index}" title="เปิดตารางเทียบสองบิล">เทียบ</button>
            <button class="ghost small" type="button" data-warn-merge="${index}" title="รวมสองบิลนี้ (มีสรุปให้ยืนยันก่อน)">รวม</button>
          </td>
        </tr>`).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">เทียบ = เปิดตารางเทียบสองบิล (มีปุ่มรวม/ซ่อนคู่พร้อมเหตุผลในนั้น) · รวม = เข้าขั้นตอนรวมบิล มีสรุปให้ยืนยันก่อนเสมอ</p>` : "";
  const nhsoSection = nhsoIssues.length ? `
    <h3 class="warn-section-title">สปสช ต้นทุน MLP ไม่ใช่ 0 — ${number(nhsoIssues.length)} บิล
      <button class="ghost small" type="button" data-nhso-fix-all title="ตั้งต้นทุน MLP = 0 ให้บิลสปสชทั้งหมดที่ผิด">Set MLP cost 0</button>
    </h3>
    <table class="case-seq-table">
      <thead><tr><th>ผู้รับบริการ</th><th>ออเดอร์ / ORW</th><th>ต้นทุน MLP</th><th class="act-col">จัดการ</th></tr></thead>
      <tbody>
        ${nhsoIssues.map((bill) => `
        <tr>
          <td>${htmlEscape(bill.patient || "-")}</td>
          <td>${htmlEscape(bill.orderId || bill.orw || "-")}</td>
          <td class="case-seq-code" style="color:#a12626">${money(bill.mlpCost)}</td>
          <td class="act-col"><button type="button" class="row-action icon-action" data-nhso-open="${htmlEscape(bill.billKey)}" title="เปิดรายละเอียด / แก้ไขบิลนี้" aria-label="เปิดรายละเอียด / แก้ไขบิลนี้"><i class="fa-solid fa-pen-to-square"></i></button></td>
        </tr>`).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">เคส สปสช ปกติต้นทุน MLP = 0.00 · กด "Set MLP cost 0" เพื่อแก้ทีเดียว หรือปุ่มดินสอเพื่อแก้รายบิลใน drawer</p>` : "";
  elements.mergeWarnBody.innerHTML = pairSection + nhsoSection;
}

function openMergeWarnModal() {
  if (!elements.mergeWarnModal || warnTotalCount() === 0) return;
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

function openSuggestPairModal(item) {
  const billA = state.bills.find((bill) => bill.billKey === item.aKey);
  const billB = state.bills.find((bill) => bill.billKey === item.bKey);
  if (!billA || !billB || !elements.suggestPairModal) return;
  suggestPairContext = item;
  elements.suggestPairTitle.textContent = item.titleText || `น่าจะเป็นบิลเดียวกัน (${item.score}%)`;
  const fields = [
    ["ผู้รับบริการ", (bill) => bill.patient || "-"],
    ["เลขที่ออเดอร์", (bill) => bill.orderId || "-", true],
    ["ORW", (bill) => bill.orw || "-"],
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
  elements.suggestPairBody.innerHTML = `
    <p class="suggest-pair-reasons">เหตุผลที่จับคู่: ${htmlEscape(item.reasons.join(" + "))}</p>
    <table class="suggest-pair-table">
      <thead>
        <tr>
          <th></th>
          <th>บิล 1 <button type="button" class="ghost small" data-pair-open="${htmlEscape(billA.billKey)}">ดูรายละเอียด</button></th>
          <th>บิล 2 <button type="button" class="ghost small" data-pair-open="${htmlEscape(billB.billKey)}">ดูรายละเอียด</button></th>
        </tr>
      </thead>
      <tbody>
        ${fields.map(([label, pick, copyable]) => {
    const valueA = pick(billA);
    const valueB = pick(billB);
    const diff = valueA !== valueB;
    const cell = (value) => {
      const copyBtn = (copyable && value && value !== "-")
        ? ` <button type="button" class="copy-ref-btn" data-copy-text="${htmlEscape(value)}" title="คัดลอกเลขที่ออเดอร์" aria-label="คัดลอกเลขที่ออเดอร์"><i class="fa-regular fa-copy"></i></button>`
        : "";
      return `${htmlEscape(value)}${copyBtn}`;
    };
    return `<tr>
            <th>${htmlEscape(label)}</th>
            <td class="${diff ? "pair-diff" : ""}">${cell(valueA)}</td>
            <td class="${diff ? "pair-diff" : ""}">${cell(valueB)}</td>
          </tr>`;
  }).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">ช่องพื้นเหลือง = ค่าสองฝั่งไม่ตรงกัน · สองบิลนี้ถูกติ๊กเลือกในตารางให้แล้ว · กด "รวมบิล" มีสรุปผลรวมให้ตรวจก่อนยืนยันเสมอ</p>
  `;
  if (!elements.suggestPairModal.open) elements.suggestPairModal.showModal();
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

    let mode = "replace";
    if (state.bills.length) {
      const importedCount = clicknicImportedRows.length + mlpImportedRows.length + billingImportedRows.length;
      mode = await askImportMode(`ข้อมูลบนจอมี ${number(state.bills.length)} บิล — ไฟล์ที่เลือกมี ${number(importedCount)} แถวข้อมูล (โหมดเพิ่ม: แถวซ้ำถูกตัดอัตโนมัติ และค่าที่แก้มือไว้คงอยู่)`);
      if (!mode) {
        elements.statusText.textContent = "ยกเลิกการนำเข้า — ข้อมูลเดิมคงอยู่";
        return;
      }
    }

    if (mode === "append") {
      mergeImportedIntoState({
        clicknicRows: clicknicImportedRows,
        mlpRows: mlpImportedRows,
        billingRows: billingImportedRows,
      });
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
    state.billMergeGroups = [];
    state.deletedBillKeys = [];
    state.dismissedSuggestions = [];
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
    "ref_id",
    "phone",
    "address",
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
};

function issueChipShortText(issue) {
  const def = issueChipDefs[issue.code];
  return def ? `${def.code} ${def.label}` : issue.text;
}

// chip ป้ายผลตรวจสอบ — hover เห็นข้อความเต็มเสมอ
function issueChipHtml(issue) {
  const def = issueChipDefs[issue.code];
  const tone = def?.tone || "gray";
  const content = def ? `<b>${def.code}</b> ${def.label}` : htmlEscape(issue.text);
  return `<span class="issue-chip tone-${tone}" title="${htmlEscape(issue.text)}">${content}</span>`;
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
  sorted.forEach((session) => {
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
  const bills = [...billMap.values()].map((bill) => ({
    ...bill,
    medicines: (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText),
    validationIssues: validationRulesForBill(bill),
  }));
  return { bills, overrides, mergeGroups, deletedKeys: [...deletedKeys], dismissed: [...dismissedByKey.values()], audit };
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
            topMeds: [],
          },
        };
      }
    }
    await applySessionSnapshot(latest);
    elements.statusText.textContent = `กู้คืนอัตโนมัติหลังเปิดหน้า: ${latest.name || latest.id} (${number(state.bills.length)} บิล)`;
    autosaveStatusText(`Autosave: กู้คืน${latest.source === "autosave" ? " autosave" : " session"} ล่าสุดให้แล้ว`);
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
      .map((bill) => ({
        ...bill,
        medicines: (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText),
        validationIssues: validationRulesForBill(bill),
      }));
    state.bills = [...state.bills, ...loadedBills];
    state.billOverrides = mergeOverrideMaps(state.billOverrides, payload.billOverrides || {});
    mergeBillMergeGroupsInto(payload.billMergeGroups);
    mergeDeletedBillKeysInto(payload.deletedBillKeys);
    mergeDismissedSuggestionsInto(payload.dismissedSuggestions);
    applyManualMergeGroups();
    applyDeletedBills();
    const auditIds = new Set(state.auditTrail.map((entry) => entry.id));
    state.auditTrail = [...state.auditTrail, ...(payload.auditTrail || []).filter((entry) => !auditIds.has(entry.id))];
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
  state.bills = (payload.bills || []).map((bill) => ({
    ...bill,
    medicines: (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText),
    validationIssues: validationRulesForBill(bill),
  }));
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

// ช่อง BAR ว่าง = พื้นส้มอ่อน เตือนให้ไล่เก็บเลขใบวางบิล
function updateBarEmptyHint() {
  if (!elements.editBarNo) return;
  elements.editBarNo.classList.toggle("input-empty-warn", !clean(elements.editBarNo.value));
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

  const baseLines = (bill.medicines && bill.medicines.length) ? bill.medicines : parseMedicinesTextLines(bill.medicinesText);
  state.drawerMedicines = baseLines.map((line) => ({
    medicine: line.medicine || "",
    qty: toNumeric(line.qty),
    sale: toNumeric(line.sale),
    cost: toNumeric(line.cost),
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
  elements.drawerMedicines.innerHTML = lines.map((line, index) => {
    const qty = toNumeric(line.qty);
    const sale = toNumeric(line.sale);
    const unit = qty > 0 ? Math.round((sale / qty) * 100) / 100 : Math.round(sale * 100) / 100;
    const name = htmlEscape(line.medicine || "");
    return `
    <div class="drawer-list-item med-line" title="${source}">
      <input class="inline-cell-input med-name-input" type="text" value="${name}" placeholder="ชื่อยา" data-drawer-med-index="${index}" data-drawer-med-field="medicine" aria-label="ชื่อยา" />
      <input class="inline-cell-input med-input" type="text" inputmode="decimal" value="${qty}" data-drawer-med-index="${index}" data-drawer-med-field="qty" aria-label="จำนวน ${name || "ยาใหม่"}" title="จำนวน" />
      <span class="med-x">×</span>
      <input class="inline-cell-input med-input med-price" type="text" inputmode="decimal" value="${unit > 0 ? unit : ""}" placeholder="ราคา" data-drawer-med-index="${index}" data-drawer-med-field="unitPrice" aria-label="ราคาต่อหน่วย ${name || "ยาใหม่"}" title="ราคาต่อหน่วย" />
      <span class="med-line-total" title="ยอดขายบรรทัดนี้">${sale > 0 ? `= ${money(sale)}` : "= —"}</span>
      <button class="icon-button med-remove-btn" type="button" data-drawer-med-remove="${index}" title="ลบรายการนี้" aria-label="ลบ ${name || "ยาใหม่"}">×</button>
    </div>`;
  }).join("");
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
];

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
  };

  result.refId = text.match(/Ref-?\s*ID\s*:?\s*(R-?\d+)/i)?.[1]
    || text.match(/(?:^|\s)#\s*(R-?\d+)/im)?.[1]
    || "";
  result.orderId = findOrderId(text);

  const nameMatch = text.match(/รายการของ\s*(.+?)\s*(?:\(([^)]*)\)|$)/m);
  if (nameMatch) {
    result.patient = clean(nameMatch[1]);
    const caseText = clean(nameMatch[2] || "");
    if (/ประกัน|เคลม|insurance/i.test(caseText)) result.caseType = "insurance";
    else if (/สปสช|บัตรทอง/i.test(caseText)) result.caseType = "nhso";
    else if (/เงินสด|ทั่วไป|general/i.test(caseText)) result.caseType = "general";
  }
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
      if (!result.patient) result.patient = clean(memoLine[1].split(/-(?=\d)/)[0]);
      // กันเลขที่หน้าตาเป็นเบอร์โทรถูกอ่านเป็นยอดขาย
      if (!/^0\d{8,9}$/.test(memoLine[2])) result.sale = toNumeric(memoLine[2]);
      if (!result.address) {
        const lineEnd = text.indexOf(memoLine[0]) + memoLine[0].length;
        result.address = clean(text.slice(lineEnd).replace(/\s+/g, " "));
      }
    }
  }

  const dtMatch = text.match(/(\d{1,2}\/\d{1,2}\/\d{4})\s+\d{1,2}[:.]\d{2}/);
  if (dtMatch) result.clicknicDate = dateKey(dtMatch[1]);

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

function openPasteAnalyze(billKey) {
  const bill = state.bills.find((item) => item.billKey === billKey);
  if (!bill) return;
  state.pasteAnalyzeKey = billKey;
  elements.pasteAnalyzeText.value = "";
  elements.pasteAnalyzeWarnings.innerHTML = "";
  elements.pasteAnalyzeResults.innerHTML = `<div class="empty">วางข้อความแล้วผลวิเคราะห์จะแสดงที่นี่</div>`;
  elements.pasteAnalyzeSummary.textContent = `บิล: ${bill.patient || bill.orderId || bill.orw || "-"}`;
  elements.pasteAnalyzeStatus.textContent = "วางข้อความรายการจาก CLICKNIC แล้วระบบจะวิเคราะห์อัตโนมัติ";
  elements.applyPasteAnalyzeBtn.disabled = true;
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

function updatePasteApplyState() {
  const anyChecked = Boolean(elements.pasteAnalyzeResults.querySelector("[data-paste-apply]:checked"));
  elements.applyPasteAnalyzeBtn.disabled = !anyChecked;
}

function runPasteAnalyze() {
  const bill = currentPasteAnalyzeBill();
  if (!bill) return;
  const parsed = parseBillPasteText(elements.pasteAnalyzeText.value);
  if (!parsed) {
    elements.pasteAnalyzeWarnings.innerHTML = "";
    elements.pasteAnalyzeResults.innerHTML = `<div class="empty">วางข้อความแล้วผลวิเคราะห์จะแสดงที่นี่</div>`;
    elements.pasteAnalyzeStatus.textContent = "วางข้อความรายการจาก CLICKNIC แล้วระบบจะวิเคราะห์อัตโนมัติ";
    elements.applyPasteAnalyzeBtn.disabled = true;
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
  elements.pasteAnalyzeSummary.textContent = `บิล: ${bill.patient || bill.orderId || bill.orw || "-"}`;
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
    barNo: elements.editBarNo ? clean(elements.editBarNo.value) : clean(bill.barNo),
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
  };
  // รายการยาจาก drawer: แถวว่าง (ไม่มีชื่อและไม่มียอด) ถูกตัดทิ้ง; ลบจนหมดก็บันทึกเป็นว่างได้ถ้าบิลเคยมีรายการ
  const drawerMeds = (state.drawerMedicines || [])
    .filter((line) => clean(line.medicine) || toNumeric(line.sale) > 0)
    .map((line) => ({
      medicine: clean(line.medicine) || "-",
      qty: toNumeric(line.qty) || 1,
      sale: toNumeric(line.sale),
      cost: toNumeric(line.cost),
    }));
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

$("monthlyCasesBody")?.addEventListener("click", (event) => {
  const row = event.target.closest("[data-month-filter]");
  if (!row) return;
  toggleMonthFilter(row.dataset.monthFilter);
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
elements.confirmClipboardImport.addEventListener("click", confirmClipboardImport);
elements.cancelClipboardImport.addEventListener("click", closeClipboardImport);
elements.closeClipboardModal.addEventListener("click", closeClipboardImport);
elements.searchInput.addEventListener("input", renderTable);
elements.caseTypeFilter.addEventListener("change", renderTable);
elements.billingStageFilter.addEventListener("change", renderTable);
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
  const chip = event.target.closest("[data-gap-status]");
  if (!chip) return;
  const status = chip.dataset.gapStatus;
  setActiveStatus(state.activeStatus === status ? "all" : status);
  renderMergeAssistant();
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
  const barValue = clean(elements.cardBulkBarNo?.value);
  if (!barValue) {
    elements.cardBulkBarNo?.focus();
    return;
  }
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
    quickUpdateBillingStage(billingStageSelect.dataset.billingStageKey, billingStageSelect.value);
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
  if (input.dataset.drawerMedField === "medicine") {
    line.medicine = clean(input.value);
    return;
  }
  const round2 = (value) => Math.round(value * 100) / 100;
  const pricedBefore = lines.some((item) => toNumeric(item.sale) > 0);
  const field = input.dataset.drawerMedField;
  const value = Math.max(0, toNumeric(input.value));
  const prevUnit = line.qty > 0 ? line.sale / line.qty : 0;
  if (field === "qty") {
    line.qty = value;
    line.sale = round2(value * prevUnit);
  } else if (field === "unitPrice") {
    line.sale = round2((line.qty || 1) * value);
  } else {
    return;
  }
  const newSale = round2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  // ยังไม่เคยกรอกราคาเลย: แก้จำนวนอย่างเดียวไม่ทับยอดขายเดิมของบิล
  if (pricedBefore || field === "unitPrice" || newSale > 0) {
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
  state.drawerMedicines.push({ medicine: "", qty: 1, sale: 0, cost: 0 });
  renderDrawerMedicines(bill);
  elements.drawerMedicines.querySelector(`[data-drawer-med-index="${state.drawerMedicines.length - 1}"][data-drawer-med-field="medicine"]`)?.focus();
});
elements.drawerMedicines.addEventListener("click", (event) => {
  const removeBtn = event.target.closest("[data-drawer-med-remove]");
  if (!removeBtn) return;
  const lines = state.drawerMedicines || [];
  const index = Number(removeBtn.dataset.drawerMedRemove);
  if (!lines[index]) return;
  const pricedBefore = lines.some((item) => toNumeric(item.sale) > 0);
  lines.splice(index, 1);
  if (pricedBefore) {
    elements.editSale.value = fixed2(lines.reduce((sum, item) => sum + toNumeric(item.sale), 0));
  }
  renderDrawerMedicines(currentDetailBill());
  updateEditProfitPreview();
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
    });
  }
});
elements.detailDrawer.addEventListener("close", () => {
  state.currentDetailKey = "";
});
elements.saveOverrideBtn.addEventListener("click", saveBillOverride);
elements.editSale?.addEventListener("input", updateEditProfitPreview);
elements.editCost?.addEventListener("input", updateEditProfitPreview);
elements.editMlpCost?.addEventListener("input", updateEditProfitPreview);
elements.editBarNo?.addEventListener("input", updateBarEmptyHint);
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
  const barValue = clean(elements.bulkBarNo.value);
  if (!barValue) {
    // ช่องว่างแล้วกดปุ่ม: บอกให้รู้แทนการเงียบเฉย ๆ (ดูเหมือนปุ่มพัง)
    elements.statusText.textContent = "พิมพ์เลขใบวางบิล (BAR-...) ในช่องก่อน แล้วกด ใส่ BAR";
    elements.bulkBarNo.focus();
    return;
  }
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

function openBarPicker(prefillBar, preselectKey) {
  if (!elements.barPickerModal) return;
  barPickerSelected.clear();
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
  elements.barPickerApply.textContent = `ใส่ BAR ให้ ${number(n)} บิล`;
  elements.barPickerApply.disabled = n === 0 || !clean(elements.barPickerInput?.value);
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
        ${rows.map((bill) => `
        <tr class="${barPickerSelected.has(bill.billKey) ? "case-seq-row-active" : ""}">
          <td class="seq-col"><input type="checkbox" data-bar-pick="${htmlEscape(bill.billKey)}" ${barPickerSelected.has(bill.billKey) ? "checked" : ""} aria-label="เลือกบิลนี้" /></td>
          <td>${htmlEscape(bill.patient || "-")}</td>
          <td class="case-seq-code">${htmlEscape(bill.creditNos || "-")}</td>
          <td>${htmlEscape(bill.orderId || bill.orw || "-")}</td>
          <td class="case-seq-date">${htmlEscape(formatDisplayDate(bill.clicknicDate || bill.mlpDate) || "-")}</td>
          <td>${clean(bill.barNo) ? `<span class="case-seq-chip case-${htmlEscape(bill.caseType || "unknown")}">${htmlEscape(bill.barNo)}</span>` : '<span class="bar-pick-nobar">— ยังไม่มี</span>'}</td>
        </tr>`).join("")}
      </tbody>
    </table>
    <p class="case-seq-hint">ติ๊กเลือกบิลที่ต้องใส่ BAR นี้ · BAR+AR ครบ = สถานะเปลี่ยนเป็น "วางบิลแล้ว" · แก้แล้วลง audit trail</p>
  ` : `<p class="case-seq-hint">${term ? "ไม่พบบิลที่ตรงกับคำค้นหา" : "ไม่มีบิลที่มี AR แต่ยังไม่มี BAR — ติ๊ก \"แสดงทุกบิล\" เพื่อดูทั้งหมด"}</p>`;
  updateBarPickerApplyBtn();
}

function applyBarPickerSelection() {
  const bar = clean(elements.barPickerInput?.value);
  if (!bar) {
    elements.barPickerInput?.focus();
    return;
  }
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
elements.mergeWarnBody?.addEventListener("click", (event) => {
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
  const openBill = event.target.closest("[data-nhso-open]");
  if (openBill) {
    elements.mergeWarnModal?.close();
    openDetailDrawer(openBill.dataset.nhsoOpen);
    return;
  }
  const button = event.target.closest("[data-warn-compare], [data-warn-merge]");
  if (!button) return;
  const isMerge = button.hasAttribute("data-warn-merge");
  const item = state.mergeSuggestions[Number(isMerge ? button.dataset.warnMerge : button.dataset.warnCompare)];
  if (!item) return;
  applySuggestionSelection(item);
  elements.mergeWarnModal?.close();
  if (isMerge) {
    mergeSelectedBills();
    return;
  }
  openSuggestPairModal(item);
});
elements.suggestPairClose?.addEventListener("click", () => elements.suggestPairModal?.close());
elements.suggestPairCancel?.addEventListener("click", () => elements.suggestPairModal?.close());
elements.suggestPairModal?.addEventListener("click", (event) => {
  if (event.target === elements.suggestPairModal) elements.suggestPairModal.close();
});
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
});
elements.suggestPairMerge?.addEventListener("click", () => {
  elements.suggestPairModal?.close();
  // สองบิลถูกติ๊กเลือกไว้แล้วตอนเปิด popup — วิ่งเข้า flow รวมบิลเดิม (มี confirm สรุปก่อน)
  mergeSelectedBills();
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
