const sectorPresentation = {
  "Healthcare": { group: "social", groupTitle: "Social", icon: "healthcare" },
  "Culture, Ent. & Sports": { group: "social", groupTitle: "Social", icon: "culture" },
  "Education": { group: "social", groupTitle: "Social", icon: "education" },
  "Safety & Security": { group: "social", groupTitle: "Social", icon: "safety" },
  "Population & Demographics": { group: "social", groupTitle: "Social", icon: "population" },
  "Social Development": { group: "social", groupTitle: "Social", icon: "social-development" },
  "Transportation & Logistics": { group: "infrastructure", groupTitle: "Infrastructure", icon: "transportation" },
  "Water": { group: "infrastructure", groupTitle: "Infrastructure", icon: "water" },
  "Energy": { group: "infrastructure", groupTitle: "Infrastructure", icon: "energy" },
  "ICT": { group: "infrastructure", groupTitle: "Infrastructure", icon: "ict" },
  "Waste": { group: "infrastructure", groupTitle: "Infrastructure", icon: "waste" },
  "Economy": { group: "economic", groupTitle: "Economic", icon: "economy" },
  "Employment": { group: "economic", groupTitle: "Economic", icon: "employment" },
  "Hajj & Umrah": { group: "economic", groupTitle: "Economic", icon: "hajj-umrah" },
  "Tourism": { group: "economic", groupTitle: "Economic", icon: "tourism" },
  "Citizen Engagement": { group: "governance", groupTitle: "Governance", icon: "citizen-engagement" },
  "Government Finance": { group: "governance", groupTitle: "Governance", icon: "government-finance" },
  "Legislation & Policy": { group: "governance", groupTitle: "Governance", icon: "legislation-policy" },
  "Real Estate": { group: "housing", groupTitle: "Housing", icon: "real-estate" },
  "Settlement": { group: "housing", groupTitle: "Housing", icon: "settlement" },
  "Land Use": { group: "housing", groupTitle: "Housing", icon: "land-use" },
  "Climate": { group: "environment", groupTitle: "Environment", icon: "climate" },
  "Open & Green Spaces": { group: "environment", groupTitle: "Environment", icon: "open-green-spaces" },
  "Agriculture & Food": { group: "environment", groupTitle: "Environment", icon: "agriculture-food" },
  "Natural Assets": { group: "environment", groupTitle: "Environment", icon: "natural-assets" }
};

const groupOrder = ["social", "infrastructure", "economic", "governance", "housing", "environment", "other"];
const groupTitles = {
  social: "Social",
  infrastructure: "Infrastructure",
  economic: "Economic",
  governance: "Governance",
  housing: "Housing",
  environment: "Environment",
  other: "Other"
};

const state = {
  selected: new Set(),
  activeView: "dashboard",
  activeOutcomeIndicatorId: null,
  sectorCounts: new Map(),
  categories: [],
  uploads: [],
  pendingUploadTarget: null,
  pendingUploadRequest: null,
  activeUploadId: null,
  isLoading: true,
  isRefreshing: false,
  loadError: null,
  panelCollapsed: false,
  outcomeSelections: {},
  outcomeDraftSelections: {},
  outcomeModes: {},
  backendOutcomeLoaded: false,
  backendOutcomeError: null
};

const appShell = document.querySelector("#app-shell");
const viewTabs = document.querySelectorAll("[data-view-tab]");
const viewPanels = document.querySelectorAll("[data-view-panel]");
const board = document.querySelector("#category-board");
const selectedList = document.querySelector("#selected-list");
const selectionHelp = document.querySelector("#selection-help");
const clearSelectionButton = document.querySelector("#clear-selection");
const panelToggleButton = document.querySelector("#panel-toggle");
const panelRestoreButton = document.querySelector("#panel-restore");
const bulkFileInput = document.querySelector("#bulk-file-input");
const singleFileInput = document.querySelector("#single-file-input");
const dropzone = document.querySelector("#dropzone");
const fileList = document.querySelector("#file-list");
const clearFilesButton = document.querySelector("#clear-files");
const previewModal = document.querySelector("#file-preview-modal");
const previewForm = document.querySelector("#preview-form");
const previewTitle = document.querySelector("#preview-title");
const previewSummary = document.querySelector("#preview-summary");
const previewDetails = document.querySelector("#preview-details");
const previewContent = document.querySelector("#preview-content");
const previewCloseButton = document.querySelector("#preview-close");
const uploadMetadataModal = document.querySelector("#upload-metadata-modal");
const uploadMetadataForm = document.querySelector("#upload-metadata-form");
const uploadMetadataSummary = document.querySelector("#upload-metadata-summary");
const uploadEntityNameInput = document.querySelector("#upload-entity-name");
const uploadPeriodInput = document.querySelector("#upload-period");
const uploadMetadataError = document.querySelector("#upload-metadata-error");
const uploadMetadataCloseButton = document.querySelector("#upload-metadata-close");
const uploadMetadataCancelButton = document.querySelector("#upload-metadata-cancel");
const clearConfirmModal = document.querySelector("#clear-confirm-modal");
const clearConfirmCopy = document.querySelector("#clear-confirm-copy");
const clearConfirmCancelButton = document.querySelector("#clear-confirm-cancel");
const clearConfirmActionButton = document.querySelector("#clear-confirm-action");
const unsupportedFileModal = document.querySelector("#unsupported-file-modal");
const unsupportedFileList = document.querySelector("#unsupported-file-list");
const unsupportedFileCloseButton = document.querySelector("#unsupported-file-close");
const unsupportedFileActionButton = document.querySelector("#unsupported-file-action");
const outcomeHead = document.querySelector(".outcome-head");
const outcomeBackButton = document.querySelector(".outcome-head-back");
const outcomeKicker = document.querySelector("#outcome-kicker");
const outcomeTitle = document.querySelector("#outcome-title");
const outcomeDescription = document.querySelector("#outcome-description");
const outcomeAvailability = document.querySelector("#outcome-availability");
const outcomeStatus = document.querySelector("#outcome-status");
const outcomeMetrics = document.querySelector("#outcome-metrics");
const outcomeIndicatorStrip = document.querySelector(".indicator-strip");
const outcomeIndicatorTabs = document.querySelector("#outcome-indicator-tabs");
const outcomeIndicatorDetail = document.querySelector("#outcome-indicator-detail");
const outcomeContext = document.querySelector("#outcome-context");
const outcomeComparison = document.querySelector("#outcome-comparison");
const comparisonTitle = document.querySelector("#comparison-title");
const comparisonTable = document.querySelector("#comparison-table");
const outcomeGrid = document.querySelector(".outcome-grid");
const outcomeVariables = document.querySelector("#outcome-variables");
const outcomeAssumptions = document.querySelector("#outcome-assumptions");
const outcomeCalculation = document.querySelector("#outcome-calculation");

// Supabase configuration. The publishable key is safe for browser reads when RLS policies are configured.
const SUPABASE_URL = "https://neqaxhvlvzrdokkccrdy.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_NNKHOkrqxKHBz05yTRbfiw_g3F8v5Sd";
const INDICATORS_TABLE = "indicators";
const AUTO_REFRESH_MS = 5000;
const supabaseClient = window.supabase
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY)
  : null;

const outcomeModel = {
  title: "Outcome Indicators",
  geography: "",
  period: "",
  confidence: "",
  indicators: []
};
const makeIcon = (content) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round">${content}</svg>`;
const fallbackSectorIcon = makeIcon('<path d="m12 3.9 7.9 3.9-7.9 3.9-7.9-3.9z"/><path d="m4.1 12 7.9 3.9 7.9-3.9"/><path d="m4.1 16.4 7.9 3.9 7.9-3.9"/><path d="M12 11.7v8.6"/><path d="M7.8 9.9v4.2M16.2 9.9v4.2"/>');
const uploadButtonIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 15V3"/><path d="m7 8 5-5 5 5"/><path d="M5 15v4h14v-4"/></svg>';

const logoIconPath = (itemId) => `assets/icons/${itemId}.png`;
const allowedFileExtensions = new Set(["pdf", "xls", "xlsx", "doc", "docx", "ppt", "pptx"]);
const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation"
]);

function targetId(categoryId, itemId) {
  return itemId ? `${categoryId}:${itemId}` : categoryId;
}

function slugify(value) {
  return value
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "sector";
}

function normalizeSector(value) {
  return String(value || "").trim().toLowerCase();
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getFileExtension(fileName) {
  const parts = fileName.toLowerCase().split(".");
  return parts.length > 1 ? parts.pop() : "";
}

function isAllowedFile(file) {
  return allowedFileExtensions.has(getFileExtension(file.name)) || allowedMimeTypes.has(file.type);
}

function openUnsupportedFileModal(files) {
  unsupportedFileList.innerHTML = files.map((file) => {
    return `<span>${escapeHtml(file.name)}</span>`;
  }).join("");
  unsupportedFileModal.hidden = false;
  unsupportedFileActionButton.focus();
}

function closeUnsupportedFileModal() {
  unsupportedFileModal.hidden = true;
  unsupportedFileList.innerHTML = "";
}

function requestValidatedUpload(files, targetIds) {
  const normalizedFiles = [...files];
  const normalizedTargetIds = [...new Set(targetIds)].filter(Boolean);
  const invalidFiles = normalizedFiles.filter((file) => !isAllowedFile(file));

  if (!normalizedTargetIds.length) {
    alert("Select at least one sector before attaching files.");
    return;
  }

  if (invalidFiles.length) {
    openUnsupportedFileModal(invalidFiles);
    return;
  }

  openUploadMetadataModal(normalizedFiles, normalizedTargetIds);
}

function revokeUpload(upload) {
  if (upload?.objectUrl) {
    URL.revokeObjectURL(upload.objectUrl);
  }
}

function getTarget(id) {
  const [categoryId, itemId] = id.split(":");
  const category = state.categories.find((entry) => entry.id === categoryId);

  if (!category) {
    return null;
  }

  if (!itemId) {
    return {
      id,
      type: "category",
      category,
      label: category.title,
      count: category.items.length
    };
  }

  const item = category.items.find((entry) => entry.id === itemId);

  return item
    ? { id, type: "sector", category, item, label: item.label, count: item.count }
    : null;
}

function countIndicatorsBySector(indicators) {
  return indicators.reduce((counts, indicator) => {
    const sector = normalizeSector(indicator.sector);

    if (!sector) {
      return counts;
    }

    counts.set(sector, (counts.get(sector) || 0) + 1);
    return counts;
  }, new Map());
}

function buildCategoriesFromSectorCounts(sectorCounts) {
  const categoryMap = new Map();

  Object.entries(sectorPresentation)
    .forEach(([sector, presentation]) => {
      const groupId = presentation.group;

      if (!categoryMap.has(groupId)) {
        categoryMap.set(groupId, {
          id: groupId,
          title: presentation.groupTitle || groupTitles[groupId] || groupTitles.other,
          items: []
        });
      }

      categoryMap.get(groupId).items.push({
        id: slugify(sector),
        label: sector,
        icon: presentation.icon,
        count: sectorCounts.get(normalizeSector(sector)) || 0
      });
    });

  return groupOrder
    .map((groupId) => categoryMap.get(groupId))
    .filter(Boolean);
}

async function fetchSectorCounts() {
  if (!supabaseClient) {
    throw new Error("Supabase client is not available. Check that the Supabase CDN script loaded correctly.");
  }

  const pageSize = 1000;
  const indicators = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabaseClient
      .from(INDICATORS_TABLE)
      .select("name, sector", { count: "exact" })
      .order("sector", { ascending: true })
      .range(from, from + pageSize - 1);

    if (error) {
      throw error;
    }

    indicators.push(...(data || []));

    if (!data || data.length < pageSize) {
      break;
    }

    from += pageSize;
  }

  if (!indicators.length) {
    console.warn("Supabase returned 0 visible indicators to the publishable key. Counts will stay 0 until indicators rows are readable by this frontend.");
  }

  return countIndicatorsBySector(indicators);
}

function asList(value) {
  return Array.isArray(value) ? value : [];
}

function uniqueIds(values) {
  return [...new Set(values.filter((value) => value !== null && value !== undefined))];
}

function confidenceFromScore(confidence) {
  const score = Number(confidence);

  if (!Number.isFinite(score)) {
    return normalizeConfidence(confidence);
  }

  if (score >= 0.75) {
    return "High";
  }

  if (score >= 0.45) {
    return "Medium";
  }

  return "Low";
}

function formatPeriodLabel(period) {
  if (!period) {
    return "";
  }

  if (period.period_month) {
    return `${period.period_year}-${String(period.period_month).padStart(2, "0")}`;
  }

  if (period.period_quarter) {
    return `${period.period_year} Q${period.period_quarter}`;
  }

  return period.period_year ? String(period.period_year) : period.frequency_code;
}

function getSourceFileLabel(version) {
  const fileUri = String(version?.file_uri || "").trim();

  if (!fileUri) {
    return `Source version ${version?.version_id || ""}`.trim();
  }

  return fileUri.split(/[\\/]/).pop() || fileUri;
}

function getSourceFileHref(version) {
  const fileUri = String(version?.file_uri || "").trim();

  if (/^(https?:|blob:|data:)/i.test(fileUri) || fileUri.startsWith("/")) {
    return fileUri;
  }

  return "";
}

function buildBackendOutcomeIndicator({
  indicator,
  indicatorVariableRows,
  variables,
  variableValues,
  indicatorValues,
  geographies,
  periods,
  versions
}) {
  const requiredVariableIds = new Set(indicatorVariableRows.map((row) => row.variable_id));
  const variablesById = new Map(variables.map((variable) => [variable.variable_id, variable]));
  const geographiesById = new Map(geographies.map((geography) => [geography.geography_id, geography]));
  const periodsById = new Map(periods.map((period) => [period.period_id, period]));
  const versionsById = new Map(versions.map((version) => [version.version_id, version]));
  const requiredVariableValues = variableValues.filter((row) => requiredVariableIds.has(row.variable_id));
  const requiredValuesByContext = requiredVariableValues.reduce((groups, row) => {
    const key = `${row.geography_id}::${row.period_id}`;

    if (!groups.has(key)) {
      groups.set(key, new Set());
    }

    groups.get(key).add(row.variable_id);
    return groups;
  }, new Map());
  const completeContextKeys = [...requiredValuesByContext.entries()]
    .filter(([, variableIds]) => {
      return [...requiredVariableIds].every((variableId) => variableIds.has(variableId));
    })
    .map(([key]) => key);
  const contextKeys = uniqueIds([
    ...completeContextKeys,
    ...indicatorValues.map((row) => `${row.geography_id}::${row.period_id}`)
  ]);

  const contexts = contextKeys.map((key) => {
    const [geographyIdText, periodIdText] = key.split("::");
    const geographyId = Number(geographyIdText);
    const periodId = Number(periodIdText);
    const geography = geographiesById.get(geographyId);
    const period = periodsById.get(periodId);
    const storedIndicatorValue = indicatorValues.find((row) => {
      return row.geography_id === geographyId && row.period_id === periodId;
    });
    const contextVariables = [...requiredVariableIds].map((variableId) => {
      const variable = variablesById.get(variableId);
      const valueRows = variableValues
        .filter((row) => {
          return row.variable_id === variableId && row.geography_id === geographyId && row.period_id === periodId;
        })
        .sort((firstRow, secondRow) => {
          const firstVersion = versionsById.get(firstRow.version_id);
          const secondVersion = versionsById.get(secondRow.version_id);

          if (Boolean(firstVersion?.is_current) !== Boolean(secondVersion?.is_current)) {
            return firstVersion?.is_current ? -1 : 1;
          }

          return Number(secondRow.version_id || 0) - Number(firstRow.version_id || 0);
        });
      const valueRow = valueRows.find((row) => versionsById.get(row.version_id)?.is_current) || valueRows[0];

      if (!valueRow) {
        return {
          name: variable?.description || variable?.variable_key || `Variable ${variableId}`,
          key: variable?.variable_key,
          value: "Pending",
          unit: variable?.unit || "",
          confidence: "Low",
          sources: []
        };
      }

      return {
        name: variable?.description || variable?.variable_key || `Variable ${variableId}`,
        key: variable?.variable_key,
        value: valueRow.value,
        unit: variable?.unit || "",
        confidence: confidenceFromScore(valueRow.confidence),
        sources: valueRows.map((row) => {
          const sourceVersion = versionsById.get(row.version_id);

          return {
            name: getSourceFileLabel(sourceVersion),
            href: getSourceFileHref(sourceVersion),
            value: row.value,
            unit: variable?.unit || "",
            versionId: row.version_id,
            isPrimary: row === valueRow
          };
        })
      };
    });
    const context = {
      level: geography?.geography_level,
      geography: geography?.geography_name || `Geography ${geographyId}`,
      period: formatPeriodLabel(period),
      confidence: confidenceFromScore(Math.min(...contextVariables.map((variable) => {
        const rank = { Low: 0, Medium: 0.5, High: 1 };
        return rank[normalizeConfidence(variable.confidence)] ?? 1;
      }))),
      assumptions: [
        "Values are loaded from the current source file version stored in Supabase.",
        "The result is calculated from linked variable values for the selected geography and period."
      ],
      variables: contextVariables
    };
    const calculatedContext = createCalculatedContext(indicator, context);

    return storedIndicatorValue?.value !== null && storedIndicatorValue?.value !== undefined
      ? { ...calculatedContext, storedValue: storedIndicatorValue.value }
      : calculatedContext;
  });
  const baseContext = contexts[0] || {};

  return {
    id: indicator.uid || String(indicator.indicator_id),
    databaseId: indicator.indicator_id,
    name: indicator.name,
    value: baseContext.value || "Pending",
    formula: indicator.formula_description || indicator.formula_python_expr || "",
    formula_python_expr: indicator.formula_python_expr || "",
    geography: baseContext.geography || "",
    period: baseContext.period || "",
    confidence: baseContext.confidence || "High",
    source: versions[0]?.file_uri || "",
    variables: baseContext.variables || [],
    assumptions: baseContext.assumptions || [],
    contexts
  };
}

async function fetchBackendOutcomeIndicators() {
  if (!supabaseClient) {
    return [];
  }

  const { data: indicators, error: indicatorsError } = await supabaseClient
    .from("indicators")
    .select("indicator_id, uid, name, theme, sector, definition, unit, frequency, formula_description, formula_python_expr")
    .not("formula_python_expr", "is", null);

  if (indicatorsError) {
    throw indicatorsError;
  }

  const indicatorRows = asList(indicators).filter((indicator) => {
    return Boolean(getFormulaExpression(indicator));
  });
  const indicatorIds = indicatorRows.map((indicator) => indicator.indicator_id);

  if (!indicatorIds.length) {
    return [];
  }

  const [
    indicatorVariablesResponse,
    indicatorValuesResponse
  ] = await Promise.all([
    supabaseClient
      .from("indicator_variables")
      .select("indicator_id, variable_id")
      .in("indicator_id", indicatorIds),
    supabaseClient
      .from("indicator_values")
      .select("indicator_id, value, period_id, geography_id")
      .in("indicator_id", indicatorIds)
  ]);

  if (indicatorVariablesResponse.error) {
    throw indicatorVariablesResponse.error;
  }

  if (indicatorValuesResponse.error) {
    throw indicatorValuesResponse.error;
  }

  const indicatorVariableRows = asList(indicatorVariablesResponse.data);
  const variableIds = uniqueIds(indicatorVariableRows.map((row) => row.variable_id));

  if (!variableIds.length) {
    return [];
  }

  const [
    variablesResponse,
    variableValuesResponse
  ] = await Promise.all([
    supabaseClient
      .from("variables")
      .select("variable_id, variable_key, description, unit, data_type")
      .in("variable_id", variableIds),
    supabaseClient
      .from("variable_values")
      .select("variable_id, version_id, value, source_sheet, source_cell_ref, confidence, period_id, geography_id")
      .in("variable_id", variableIds)
  ]);

  if (variablesResponse.error) {
    throw variablesResponse.error;
  }

  if (variableValuesResponse.error) {
    throw variableValuesResponse.error;
  }

  const variableValues = asList(variableValuesResponse.data);
  const indicatorValues = asList(indicatorValuesResponse.data);
  const geographyIds = uniqueIds([
    ...variableValues.map((row) => row.geography_id),
    ...indicatorValues.map((row) => row.geography_id)
  ]);
  const periodIds = uniqueIds([
    ...variableValues.map((row) => row.period_id),
    ...indicatorValues.map((row) => row.period_id)
  ]);
  const versionIds = uniqueIds(variableValues.map((row) => row.version_id));
  const [
    geographiesResponse,
    periodsResponse,
    versionsResponse
  ] = await Promise.all([
    geographyIds.length
      ? supabaseClient.from("geographies").select("geography_id, geography_name, geography_level, parent_geography_id").in("geography_id", geographyIds)
      : Promise.resolve({ data: [] }),
    periodIds.length
      ? supabaseClient.from("periods").select("period_id, frequency_code, period_year, period_quarter, period_month").in("period_id", periodIds)
      : Promise.resolve({ data: [] }),
    versionIds.length
      ? supabaseClient.from("source_file_versions").select("version_id, version_no, file_uri, reference_period, is_current").in("version_id", versionIds)
      : Promise.resolve({ data: [] })
  ]);

  if (geographiesResponse.error) {
    throw geographiesResponse.error;
  }

  if (periodsResponse.error) {
    throw periodsResponse.error;
  }

  if (versionsResponse.error) {
    throw versionsResponse.error;
  }

  return indicatorRows
    .map((indicator) => buildBackendOutcomeIndicator({
      indicator,
      indicatorVariableRows: indicatorVariableRows.filter((row) => row.indicator_id === indicator.indicator_id),
      variables: asList(variablesResponse.data),
      variableValues,
      indicatorValues: indicatorValues.filter((row) => row.indicator_id === indicator.indicator_id),
      geographies: asList(geographiesResponse.data),
      periods: asList(periodsResponse.data),
      versions: asList(versionsResponse.data)
    }))
    .filter((indicator) => indicator.contexts.length && indicator.contexts.some((context) => Number.isFinite(context.rawValue)));
}

async function loadBackendOutcomeIndicators() {
  try {
    const backendIndicators = await fetchBackendOutcomeIndicators();

    outcomeModel.indicators = backendIndicators;
    if (!outcomeModel.indicators.some((indicator) => indicator.id === state.activeOutcomeIndicatorId)) {
      state.activeOutcomeIndicatorId = null;
    }
    state.backendOutcomeLoaded = backendIndicators.length > 0;
    state.backendOutcomeError = null;
  } catch (error) {
    console.error("Failed to load outcome indicators from Supabase:", error);
    outcomeModel.indicators = [];
    state.activeOutcomeIndicatorId = null;
    state.backendOutcomeLoaded = false;
    state.backendOutcomeError = error.message || "Could not load outcome indicators from Supabase.";
  }
}

async function loadIndicators({ showLoading = false } = {}) {
  if (state.isRefreshing) {
    return;
  }

  state.isRefreshing = true;
  state.isLoading = showLoading;
  state.loadError = null;
  render();

  try {
    state.sectorCounts = await fetchSectorCounts();
    await loadBackendOutcomeIndicators();
    state.categories = buildCategoriesFromSectorCounts(state.sectorCounts);
    state.selected = new Set([...state.selected].filter((id) => getTarget(id)));
  } catch (error) {
    console.error("Failed to load indicators:", error);
    state.sectorCounts = new Map();
    state.categories = buildCategoriesFromSectorCounts(state.sectorCounts);
    state.selected.clear();
    state.loadError = error.message || "Could not load indicators from Supabase.";
  } finally {
    state.isRefreshing = false;
    state.isLoading = false;
    render();
  }
}

function setCategorySelection(category, shouldSelect) {
  const categoryTarget = targetId(category.id);
  const sectorTargets = category.items.map((item) => targetId(category.id, item.id));

  if (shouldSelect) {
    state.selected.add(categoryTarget);
    sectorTargets.forEach((id) => state.selected.add(id));
  } else {
    state.selected.delete(categoryTarget);
    sectorTargets.forEach((id) => state.selected.delete(id));
  }
}

function toggleCategory(category) {
  const sectorTargets = category.items.map((item) => targetId(category.id, item.id));
  const allSelected = state.selected.has(targetId(category.id)) && sectorTargets.every((id) => state.selected.has(id));

  setCategorySelection(category, !allSelected);
  render();
}

function toggleSector(category, item) {
  const id = targetId(category.id, item.id);

  if (state.selected.has(id)) {
    state.selected.delete(id);
    state.selected.delete(targetId(category.id));
  } else {
    state.selected.add(id);

    const allSectorsSelected = category.items.every((entry) => state.selected.has(targetId(category.id, entry.id)));
    if (allSectorsSelected) {
      state.selected.add(targetId(category.id));
    }
  }

  render();
}

function getEffectiveSelectedTargetIds() {
  return [...state.selected].filter((id) => {
    const target = getTarget(id);

    if (!target || target.type === "category") {
      return Boolean(target);
    }

    return !state.selected.has(targetId(target.category.id));
  });
}

function hasVariableValue(variable) {
  return variable.value !== null
    && variable.value !== undefined
    && variable.value !== ""
    && variable.value !== "Pending";
}

function getOutcomeCompleteness(indicator = getActiveOutcomeIndicator()) {
  const requiredVariables = indicator?.variables || [];
  const completedVariables = requiredVariables.filter(hasVariableValue);

  return {
    required: requiredVariables.length,
    completed: completedVariables.length,
    isComplete: completedVariables.length === requiredVariables.length
  };
}

function getCompletenessTone(completeness) {
  if (!completeness.required) {
    return "is-low";
  }

  if (completeness.isComplete) {
    return "is-high";
  }

  return completeness.completed / completeness.required >= 0.5 ? "is-medium" : "is-low";
}

function getConfidenceTone(confidence) {
  const normalizedConfidence = String(confidence || "").trim().toLowerCase();

  if (normalizedConfidence === "high") {
    return "is-high";
  }

  if (normalizedConfidence === "medium") {
    return "is-medium";
  }

  return "is-low";
}

function getStatusTone(status) {
  const normalizedStatus = String(status || "").trim().toLowerCase();

  if (/(within|strong|complete|ready|healthy|on track|no immediate gap|no gap)/.test(normalizedStatus)) {
    return "is-high";
  }

  if (/(pressure|gap|risk|missing|below|over|low|critical)/.test(normalizedStatus)) {
    return "is-low";
  }

  if (/(moderate|review|watch|partial|temporary)/.test(normalizedStatus)) {
    return "is-medium";
  }

  return "is-high";
}

function normalizeConfidence(confidence) {
  const normalizedConfidence = String(confidence || "").trim().toLowerCase();

  if (normalizedConfidence === "low") {
    return "Low";
  }

  if (normalizedConfidence === "medium") {
    return "Medium";
  }

  return "High";
}

function getIndicatorConfidence(indicator) {
  const confidenceRank = {
    low: 0,
    medium: 1,
    high: 2
  };

  const variableConfidences = (indicator.variables || [])
    .map((variable) => normalizeConfidence(variable.confidence))
    .filter(Boolean);

  if (!variableConfidences.length) {
    return normalizeConfidence(indicator.confidence);
  }

  return variableConfidences.reduce((lowestConfidence, confidence) => {
    return confidenceRank[confidence.toLowerCase()] < confidenceRank[lowestConfidence.toLowerCase()]
      ? confidence
      : lowestConfidence;
  }, "High");
}

function getActiveOutcomeIndicator() {
  return outcomeModel.indicators.find((indicator) => indicator.id === state.activeOutcomeIndicatorId) || null;
}

function getContextKey(context) {
  return `${context.geography}::${context.period}`;
}

function toVariableKey(name) {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
}

function createFormulaInputs(variables = []) {
  return variables.reduce((inputs, variable) => {
    const key = variable.key || toVariableKey(variable.name);
    const numberValue = Number(variable.value);

    inputs[key] = Number.isFinite(numberValue) ? numberValue : variable.value;
    return inputs;
  }, {});
}

const FORMULA_FUNCTIONS = {
  abs: "Math.abs",
  ceil: "Math.ceil",
  floor: "Math.floor",
  greatest: "Math.max",
  least: "Math.min",
  max: "Math.max",
  min: "Math.min",
  round: "Math.round"
};

function getFormulaExpression(indicator) {
  const formula = String(indicator.formula_python_expr || indicator.formulaExpression || "").trim();

  if (!formula) {
    return "";
  }

  if (formula.includes("=")) {
    return formula.slice(formula.indexOf("=") + 1).trim();
  }

  return formula;
}

function getNextFormulaCharacter(expression, startIndex) {
  for (let index = startIndex; index < expression.length; index += 1) {
    if (!/\s/.test(expression[index])) {
      return expression[index];
    }
  }

  return "";
}

function compileFormulaExpression(expression, inputs) {
  let compiledExpression = "";
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];

    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    if (/[0-9.]/.test(character)) {
      const match = expression.slice(index).match(/^\d+(?:\.\d+)?/);

      if (!match) {
        return "";
      }

      compiledExpression += match[0];
      index += match[0].length;
      continue;
    }

    if (/[A-Za-z_]/.test(character)) {
      const match = expression.slice(index).match(/^[A-Za-z_][A-Za-z0-9_]*/);
      const token = match[0];
      const tokenKey = token.toLowerCase();
      const nextCharacter = getNextFormulaCharacter(expression, index + token.length);

      if (nextCharacter === "(" && FORMULA_FUNCTIONS[tokenKey]) {
        compiledExpression += FORMULA_FUNCTIONS[tokenKey];
      } else if (Object.prototype.hasOwnProperty.call(inputs, token) && Number.isFinite(inputs[token])) {
        compiledExpression += `(${inputs[token]})`;
      } else {
        return "";
      }

      index += token.length;
      continue;
    }

    if ("+-*/(),".includes(character)) {
      compiledExpression += character;
      index += 1;
      continue;
    }

    return "";
  }

  return compiledExpression;
}

function calculateIndicatorValue(indicator, variables) {
  const inputs = createFormulaInputs(variables);
  const formulaExpression = getFormulaExpression(indicator);
  const compiledExpression = compileFormulaExpression(formulaExpression, inputs);

  if (!compiledExpression) {
    return null;
  }

  try {
    const value = Function(`"use strict"; return (${compiledExpression});`)();

    return Number.isFinite(value) ? value : null;
  } catch (error) {
    console.warn("Formula calculation failed:", {
      indicator: indicator.id || indicator.uid || indicator.name,
      formulaExpression,
      error
    });
    return null;
  }
}

function formatNumber(value, decimals = 1) {
  const roundedValue = Number.isInteger(value) ? value : Number(value.toFixed(decimals));
  return roundedValue.toLocaleString("en-US");
}

function formatUnitLabel(unit = "") {
  const normalizedUnit = String(unit).trim();

  if (!normalizedUnit || normalizedUnit === "%") {
    return "";
  }

  if (/^number of units$/i.test(normalizedUnit)) {
    return "units";
  }

  if (/^rooms$/i.test(normalizedUnit)) {
    return "rooms";
  }

  if (/^million tourists$/i.test(normalizedUnit)) {
    return "million tourists";
  }

  if (/^number of establishments? per 100 000 inhabitants$/i.test(normalizedUnit)) {
    return "establishments per 100,000 inhabitants";
  }

  if (/^number of stays per 100 000 population$/i.test(normalizedUnit)) {
    return "stays per 100,000 population";
  }

  return normalizedUnit;
}

function formatIndicatorResult(indicator, value) {
  const indicatorId = indicator.id || indicator.uid;
  const unit = formatUnitLabel(indicator.unit);

  if (!Number.isFinite(value)) {
    return "Pending";
  }

  if (indicatorId === "average-students-school" || indicatorId === "new-schools-needed") {
    return formatNumber(Math.round(value), 0);
  }

  if (indicator.unit === "%") {
    return `${formatNumber(value)}%`;
  }

  return unit ? `${formatNumber(value)} ${unit}` : formatNumber(value);
}

function createCalculatedContext(indicator, context) {
  const rawValue = calculateIndicatorValue(indicator, context.variables || []);

  return {
    ...context,
    value: formatIndicatorResult(indicator, rawValue),
    rawValue
  };
}

function inferContextLevel(context) {
  const geography = String(context.geography || "").toLowerCase();

  if (context.level) {
    return context.level;
  }

  if (geography.includes("district")) {
    return "district";
  }

  if (geography.includes("governorate")) {
    return "governorate";
  }

  if (geography.includes("region")) {
    return "region";
  }

  return "national";
}

function getIndicatorContexts(indicator) {
  if (!indicator) {
    return [];
  }

  const baseContext = {
    geography: indicator.geography,
    period: indicator.period,
    value: indicator.value,
    status: indicator.status,
    confidence: indicator.confidence,
    variables: indicator.variables,
    assumptions: indicator.assumptions
  };
  const baseVariablesByName = new Map((indicator.variables || []).map((variable) => [variable.name, variable]));

  return (indicator.contexts && indicator.contexts.length ? indicator.contexts : [baseContext])
    .map((context) => {
      const normalizedContext = {
        ...baseContext,
        ...context,
        level: inferContextLevel(context),
        variables: (context.variables || baseContext.variables || []).map((variable) => {
          const baseVariable = baseVariablesByName.get(variable.name);

          return {
            ...baseVariable,
            ...variable,
            key: variable.key || baseVariable?.key || toVariableKey(variable.name),
            sources: variable.sources || baseVariable?.sources || []
          };
        }),
        key: getContextKey(context)
      };

      return createCalculatedContext(indicator, normalizedContext);
    });
}

function getUniqueContextValues(contexts, field) {
  return [...new Set(contexts.map((context) => context[field]).filter(Boolean))];
}

const contextModeOptions = [
  ["single", "Single location"],
  ["levelPeriod", "View by level & period"]
];

const levelLabels = {
  district: "District",
  governorate: "Governorate",
  region: "Region",
  national: "National"
};

function getAvailableLevels(contexts, includeNational = false) {
  const levelOrder = ["district", "governorate", "region", "national"];
  const levels = getUniqueContextValues(contexts, "level");

  return levelOrder.filter((level) => levels.includes(level) && (includeNational || level !== "national"));
}

function getDefaultModeState(indicator) {
  const contexts = getIndicatorContexts(indicator);
  const levels = getAvailableLevels(contexts, true);
  const periods = getUniqueContextValues(contexts, "period");
  const firstContext = contexts[0] || {};

  return {
    mode: "single",
    level: levels[0] || "district",
    geography: firstContext.geography || "",
    period: firstContext.period || "",
    selectedLevels: levels,
    selectedPeriods: periods
  };
}

function normalizeModeState(indicator, modeState = {}) {
  const contexts = getIndicatorContexts(indicator);
  const defaultState = getDefaultModeState(indicator);
  const periods = getUniqueContextValues(contexts, "period");
  const levels = getAvailableLevels(contexts, true);
  const normalizedState = {
    ...defaultState,
    ...modeState
  };

  if (!contextModeOptions.some(([mode]) => mode === normalizedState.mode)) {
    normalizedState.mode = defaultState.mode;
  }

  if (!levels.includes(normalizedState.level)) {
    normalizedState.level = defaultState.level;
  }

  normalizedState.selectedLevels = Array.isArray(normalizedState.selectedLevels)
    ? normalizedState.selectedLevels.filter((level) => levels.includes(level))
    : defaultState.selectedLevels;

  if (!normalizedState.selectedLevels.length) {
    normalizedState.selectedLevels = defaultState.selectedLevels;
  }

  if (!periods.includes(normalizedState.period)) {
    normalizedState.period = defaultState.period;
  }

  normalizedState.selectedPeriods = Array.isArray(normalizedState.selectedPeriods)
    ? normalizedState.selectedPeriods.filter((period) => periods.includes(period))
    : defaultState.selectedPeriods;

  if (!normalizedState.selectedPeriods.length) {
    normalizedState.selectedPeriods = defaultState.selectedPeriods;
  }

  const matchingGeography = contexts.some((context) => {
    return context.geography === normalizedState.geography && context.period === normalizedState.period;
  });

  if (!matchingGeography) {
    normalizedState.geography = defaultState.geography;
  }

  return normalizedState;
}

function getOutcomeModeState(indicator) {
  return normalizeModeState(indicator, state.outcomeModes[indicator.id]);
}

function setOutcomeModeState(indicatorId, modeState) {
  state.outcomeModes[indicatorId] = modeState;
}

function getContextsForMode(indicator, modeState) {
  const contexts = getIndicatorContexts(indicator);

  if (modeState.mode === "levelPeriod") {
    return contexts.filter((context) => {
      return modeState.selectedLevels.includes(context.level)
        && modeState.selectedPeriods.includes(context.period);
    });
  }

  return contexts.filter((context) => {
    return context.geography === modeState.geography && context.period === modeState.period;
  }).slice(0, 1);
}

function getGeographyOptionsForMode(indicator, modeState) {
  const contexts = getIndicatorContexts(indicator);

  return getUniqueContextValues(contexts.filter((context) => context.period === modeState.period), "geography");
}

function getModeComparisonTitle(indicator, modeState) {
  if (modeState.mode === "levelPeriod") {
    const levelText = modeState.selectedLevels
      .map((level) => levelLabels[level] || level)
      .join(", ");
    const periodText = modeState.selectedPeriods.join(", ");

    return `${indicator.name} by ${levelText} for ${periodText}`;
  }

  return `${indicator.name} comparison`;
}

function renderOutcomeAvailability(indicator) {
  const contexts = getIndicatorContexts(indicator);
  const levels = getAvailableLevels(contexts, true)
    .map((level) => levelLabels[level] || level);
  const periods = getUniqueContextValues(contexts, "period");

  outcomeAvailability.hidden = !indicator;
  outcomeAvailability.innerHTML = indicator
    ? `
      <span><strong>Available levels:</strong> ${escapeHtml(levels.join(", "))}</span>
      <span><strong>Available periods:</strong> ${escapeHtml(periods.join(", "))}</span>
    `
    : "";
}

function renderContextSelect(label, name, values, selectedValue, valueLabels = {}) {
  return `
    <label class="context-field">
      <span class="outcome-label">${escapeHtml(label)}</span>
      <select data-context-field="${name}">
        ${values.map((value) => `
          <option value="${escapeHtml(value)}" ${value === selectedValue ? "selected" : ""}>${escapeHtml(valueLabels[value] || value)}</option>
        `).join("")}
      </select>
    </label>
  `;
}

function renderContextCheckboxGroup(label, name, values, selectedValues, valueLabels = {}) {
  return `
    <fieldset class="context-check-group">
      <legend class="outcome-label">${escapeHtml(label)}</legend>
      <div class="context-check-options">
        ${values.map((value) => `
          <label class="context-check">
            <input
              type="checkbox"
              data-context-multi-field="${escapeHtml(name)}"
              value="${escapeHtml(value)}"
              ${selectedValues.includes(value) ? "checked" : ""}
            >
            <span>${escapeHtml(valueLabels[value] || value)}</span>
          </label>
        `).join("")}
      </div>
    </fieldset>
  `;
}

function renderContextControls(indicator, modeState) {
  const contexts = getIndicatorContexts(indicator);
  const levels = getAvailableLevels(contexts, true);
  const periods = getUniqueContextValues(contexts, "period");
  const geographies = getGeographyOptionsForMode(indicator, modeState);

  outcomeContext.hidden = !indicator;
  outcomeContext.innerHTML = `
    <div class="context-mode-bar" role="group" aria-label="View mode">
      ${contextModeOptions.map(([mode, label]) => `
        <button class="context-mode-button ${modeState.mode === mode ? "is-active" : ""}" type="button" data-context-mode="${mode}">
          ${escapeHtml(label)}
        </button>
      `).join("")}
    </div>
    <div class="context-filter-row">
      ${modeState.mode === "single"
        ? renderContextSelect("Location", "geography", geographies, modeState.geography)
        : ""}
      ${modeState.mode === "levelPeriod"
        ? renderContextCheckboxGroup("Levels", "selectedLevels", levels, modeState.selectedLevels, levelLabels)
        : ""}
      ${modeState.mode === "single"
        ? renderContextSelect("Period", "period", periods, modeState.period)
        : ""}
      ${modeState.mode === "levelPeriod"
        ? renderContextCheckboxGroup("Periods", "selectedPeriods", periods, modeState.selectedPeriods)
        : ""}
    </div>
  `;
}

function renderComparisonTable(indicator, contexts, title = `${indicator.name} comparison`) {
  const variableNames = [...new Set(contexts.flatMap((context) => {
    return (context.variables || []).map((variable) => variable.name);
  }))];

  const getVariableValue = (context, variableName) => {
    const variable = (context.variables || []).find((entry) => entry.name === variableName);

    if (!variable) {
      return "-";
    }

    return `${variable.value}${variable.unit ? ` ${variable.unit}` : ""}`;
  };

  comparisonTitle.textContent = title;
  comparisonTable.innerHTML = `
    <table class="comparison-table">
      <thead>
        <tr>
          <th>Location</th>
          <th>Level</th>
          <th>Period</th>
          <th>Value</th>
          <th>Confidence</th>
          ${variableNames.map((name) => `<th>${escapeHtml(name)}</th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${contexts.map((context) => `
          <tr>
            <td>${escapeHtml(context.geography)}</td>
            <td>${escapeHtml(levelLabels[context.level] || context.level)}</td>
            <td>${escapeHtml(context.period)}</td>
            <td><strong>${escapeHtml(context.value)}</strong></td>
            <td><span class="variable-confidence ${getConfidenceTone(context.confidence)}">${escapeHtml(normalizeConfidence(context.confidence))}</span></td>
            ${variableNames.map((name) => `<td>${escapeHtml(getVariableValue(context, name))}</td>`).join("")}
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
}

function formatVariableValue(variable) {
  return `${variable.value}${variable.unit ? ` ${variable.unit}` : ""}`;
}

function renderVariableSources(variable) {
  const alternateSources = (variable.sources || []).filter((source) => !source.isPrimary);

  if (!alternateSources.length) {
    return "";
  }

  return `
    <table class="variable-sources">
      <tbody>
      ${alternateSources.map((source) => `
        <tr>
          <td>
            <a
              href="${escapeHtml(source.href || "#")}"
              class="variable-source-link"
              aria-label="Source file ${escapeHtml(source.name)}"
              ${source.href ? 'target="_blank" rel="noreferrer"' : 'aria-disabled="true"'}
            >${escapeHtml(source.name)}</a>
          </td>
          <td class="variable-source-value">${escapeHtml(source.value)}${source.unit ? ` ${escapeHtml(source.unit)}` : ""}</td>
        </tr>
      `).join("")}
      </tbody>
    </table>
  `;
}

function summarizeAvailableValues(values, visibleCount = 2) {
  if (!values.length) {
    return "None";
  }

  const visibleValues = values.slice(0, visibleCount);
  const hiddenCount = values.length - visibleValues.length;

  return hiddenCount > 0
    ? `${visibleValues.join(", ")} + ${hiddenCount} more`
    : visibleValues.join(", ");
}

function renderAvailableChips(values, visibleCount = 4) {
  if (!values.length) {
    return '<span class="indicator-card-chip">None</span>';
  }

  const visibleValues = values.slice(0, visibleCount);
  const hiddenCount = values.length - visibleValues.length;

  return `
    ${visibleValues.map((value) => `<span class="indicator-card-chip">${escapeHtml(value)}</span>`).join("")}
    ${hiddenCount > 0 ? `<span class="indicator-card-chip">+ ${hiddenCount} more</span>` : ""}
  `;
}

function renderOutcomeIndicators() {
  const activeIndicator = getActiveOutcomeIndicator();
  const isDetailPage = Boolean(activeIndicator);

  outcomeIndicatorStrip.hidden = isDetailPage;
  outcomeIndicatorDetail.hidden = true;
  outcomeIndicatorDetail.innerHTML = "";

  if (!outcomeModel.indicators.length) {
    const isLoadingOutcomes = state.isLoading || state.isRefreshing;
    const title = state.backendOutcomeError
      ? "Outcome indicators could not load"
      : (isLoadingOutcomes ? "Loading formula-backed indicators" : "No formula-backed indicators yet");
    const copy = state.backendOutcomeError
      ? "Check Supabase access, RLS policies, and the outcome table rows used by this frontend."
      : (isLoadingOutcomes
        ? "The app is checking Supabase for indicators with complete formula inputs."
        : "Add indicators with formula_python_expr and complete variable values in Supabase to show them here.");

    outcomeIndicatorTabs.innerHTML = `
      <div class="indicator-empty" role="status">
        <strong>${escapeHtml(title)}</strong>
        <span>${escapeHtml(copy)}</span>
      </div>
    `;
    return;
  }

  outcomeIndicatorTabs.innerHTML = outcomeModel.indicators.map((indicator, index) => {
    const isActive = indicator.id === activeIndicator?.id;
    const contexts = getIndicatorContexts(indicator);
    const availableLevels = getAvailableLevels(contexts, true).map((level) => levelLabels[level] || level);
    const availablePeriods = getUniqueContextValues(contexts, "period");

    return `
      <button class="indicator-tab ${isActive ? "is-active" : ""}" type="button" role="tab" aria-selected="${isActive}" data-outcome-indicator-id="${indicator.id}">
        <span class="indicator-card-head">
          <span class="outcome-label">Indicator ${index + 1}</span>
        </span>
        <span class="indicator-tab-name">${escapeHtml(indicator.name)}</span>
        <span class="indicator-card-meta">
          <span>
            <span class="outcome-label">Available levels</span>
            <strong>${renderAvailableChips(availableLevels)}</strong>
          </span>
          <span>
            <span class="outcome-label">Available periods</span>
            <strong>${renderAvailableChips(availablePeriods, 3)}</strong>
          </span>
        </span>
        <span class="indicator-card-foot">
          <span class="indicator-card-action">View details</span>
        </span>
      </button>
    `;
  }).join("");

  if (!activeIndicator) {
    return;
  }
}

function renderOutcome() {
  const activeIndicator = getActiveOutcomeIndicator();
  const modeState = activeIndicator ? getOutcomeModeState(activeIndicator) : null;
  const selectedContexts = activeIndicator ? getContextsForMode(activeIndicator, modeState) : [];
  const activeContext = selectedContexts[0] || activeIndicator;
  const isComparison = Boolean(activeIndicator) && modeState.mode !== "single";
  const completeness = getOutcomeCompleteness(activeContext);
  const completenessTone = getCompletenessTone(completeness);
  const indicatorConfidence = activeContext ? getIndicatorConfidence(activeContext) : "";

  renderOutcomeIndicators();

  outcomeHead.classList.toggle("is-selected", Boolean(activeIndicator));
  outcomeBackButton.hidden = !activeIndicator;
  outcomeKicker.textContent = activeIndicator ? "Selected indicator" : "Outcome model";
  outcomeTitle.textContent = activeIndicator ? activeIndicator.name : "Formula-backed indicators";
  outcomeDescription.textContent = activeIndicator
    ? "Choose a view mode to inspect one location or compare by level, period, or both."
    : "Select a Supabase indicator to see its variables, formula, assumptions, and result.";
  renderOutcomeAvailability(activeIndicator);

  outcomeStatus.textContent = activeIndicator
    ? (completeness.isComplete ? "Inputs complete" : "Missing variables")
    : (state.backendOutcomeError ? "Load issue" : (outcomeModel.indicators.length ? "Select indicator" : "No indicators"));
  outcomeStatus.className = `outcome-status ${activeIndicator ? completenessTone : (state.backendOutcomeError ? "is-low" : "is-medium")}`;

  outcomeMetrics.hidden = !activeIndicator || isComparison;
  outcomeGrid.hidden = !activeIndicator || isComparison;
  outcomeComparison.hidden = !activeIndicator || !isComparison;

  if (!activeIndicator) {
    outcomeContext.hidden = true;
    outcomeComparison.hidden = true;
    outcomeAvailability.hidden = true;
    outcomeMetrics.innerHTML = "";
    outcomeVariables.innerHTML = "";
    outcomeAssumptions.innerHTML = "";
    outcomeCalculation.innerHTML = "";
    comparisonTable.innerHTML = "";
    return;
  }

  renderContextControls(activeIndicator, modeState);

  if (isComparison) {
    renderComparisonTable(activeIndicator, selectedContexts, getModeComparisonTitle(activeIndicator, modeState));
    outcomeMetrics.innerHTML = "";
    outcomeVariables.innerHTML = "";
    outcomeAssumptions.innerHTML = "";
    outcomeCalculation.innerHTML = "";
    return;
  }

  comparisonTable.innerHTML = "";
  outcomeMetrics.innerHTML = [
    ["Variables", `${completeness.completed}/${completeness.required}`, completenessTone],
    ["Geography", activeContext.geography, ""],
    ["Period", activeContext.period, ""],
    ["Confidence", indicatorConfidence, getConfidenceTone(indicatorConfidence)]
  ].map(([label, value, tone]) => `
    <div class="outcome-metric ${tone}">
      <span class="outcome-label">${escapeHtml(label)}</span>
      <span class="outcome-value">${escapeHtml(value)}</span>
    </div>
  `).join("");

  outcomeVariables.innerHTML = activeContext.variables.map((variable) => `
    <div class="variable-row">
      <span class="variable-main">
        <span class="chip-label">${escapeHtml(variable.name)}</span>
        ${renderVariableSources(variable)}
      </span>
      <span class="variable-side">
        <span class="variable-confidence ${getConfidenceTone(variable.confidence)}">${escapeHtml(normalizeConfidence(variable.confidence))}</span>
        <span class="variable-value">${escapeHtml(formatVariableValue(variable))}</span>
      </span>
    </div>
  `).join("");

  outcomeAssumptions.innerHTML = activeContext.assumptions.map((assumption) => `
    <div class="assumption-row">${escapeHtml(assumption)}</div>
  `).join("");

  outcomeCalculation.innerHTML = completeness.isComplete
    ? `
      <span class="outcome-label">Formula</span>
      <span class="calculation-formula">${escapeHtml(activeIndicator.name)} = ${escapeHtml(activeIndicator.formula)}</span>
      <span class="outcome-label">Result</span>
      <span>${escapeHtml(activeContext.value)}</span>
    `
    : `
      <span class="outcome-label">Calculation paused</span>
      <span class="calculation-formula">Add all required variable values to calculate ${escapeHtml(activeIndicator.name)}.</span>
      <span>${escapeHtml(completeness.completed)}/${escapeHtml(completeness.required)} variables available.</span>
    `;
}

function openSingleUpload(id) {
  state.pendingUploadTarget = id;
  singleFileInput.value = "";
  singleFileInput.click();
}

function openUploadMetadataModal(files, targetIds) {
  const normalizedTargets = [...new Set(targetIds)].map(getTarget).filter(Boolean);
  const targetLabel = normalizedTargets.length === 1
    ? normalizedTargets[0].label
    : `${normalizedTargets.length} targets`;

  state.pendingUploadRequest = {
    files: [...files],
    targetIds: [...new Set(targetIds)].filter(Boolean)
  };

  uploadMetadataSummary.textContent = `${files.length} file${files.length === 1 ? "" : "s"} will be attached to ${targetLabel}.`;
  uploadMetadataForm.reset();
  uploadMetadataError.hidden = true;
  uploadMetadataModal.hidden = false;
  uploadEntityNameInput.focus();
}

function closeUploadMetadataModal() {
  state.pendingUploadRequest = null;
  uploadMetadataModal.hidden = true;
  uploadMetadataForm.reset();
  uploadMetadataError.hidden = true;
}

function submitUploadMetadata() {
  const pendingUpload = state.pendingUploadRequest;
  const entityName = uploadEntityNameInput.value.trim();
  const period = uploadPeriodInput.value.trim();

  if (!pendingUpload) {
    closeUploadMetadataModal();
    return;
  }

  if (!entityName) {
    uploadMetadataError.hidden = false;
    uploadEntityNameInput.focus();
    return;
  }

  addUploads(pendingUpload.files, pendingUpload.targetIds, {
    entityName,
    period
  });
  closeUploadMetadataModal();
}

function addUploads(files, targetIds, metadata = {}) {
  const normalizedTargets = [...new Set(targetIds)].map(getTarget).filter(Boolean);

  if (!files.length || !normalizedTargets.length) {
    return;
  }

  [...files].forEach((file) => {
    state.uploads.unshift({
      id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
      name: file.name,
      size: file.size,
      type: file.type,
      extension: getFileExtension(file.name),
      file,
      objectUrl: URL.createObjectURL(file),
      targets: normalizedTargets,
      entityName: metadata.entityName || "",
      period: metadata.period || "",
      addedAt: new Date()
    });
  });

  render();
}

function renderFileList() {
  fileList.innerHTML = state.uploads.length
    ? state.uploads.map((upload) => {
        const targetLabel = upload.targets.length === 1
          ? upload.targets[0].label
          : `${upload.targets.length} targets`;
        const metadataLabel = [
          formatBytes(upload.size),
          upload.entityName ? `entity: ${upload.entityName}` : "",
          upload.period ? `period: ${upload.period}` : "",
          `attached to ${targetLabel}`
        ].filter(Boolean).join(" | ");

        return `
          <div class="file-item">
            <button class="file-open" type="button" data-preview-id="${upload.id}">
              <span class="file-name">${escapeHtml(upload.name)}</span>
              <span class="file-meta">${escapeHtml(metadataLabel)}</span>
            </button>
            <button class="file-delete" type="button" aria-label="Remove ${escapeHtml(upload.name)}" data-delete-upload-id="${upload.id}">x</button>
          </div>
        `;
      }).join("")
    : '<div class="empty-state">No files uploaded yet.</div>';
}

function getActiveUpload() {
  return state.uploads.find((upload) => upload.id === state.activeUploadId);
}

function closeFilePreview() {
  state.activeUploadId = null;
  previewModal.hidden = true;
  previewForm.reset();
  previewContent.innerHTML = "";
}

function renderFilePreview() {
  const upload = getActiveUpload();

  if (!upload) {
    closeFilePreview();
    return;
  }

  const targetNames = upload.targets.map((target) => target.label).join(", ");
  previewTitle.textContent = upload.name;
  previewSummary.textContent = `${formatBytes(upload.size)} attached to ${upload.targets.length} target${upload.targets.length === 1 ? "" : "s"}.`;
  previewDetails.innerHTML = `
    <div class="preview-detail">
      <strong>Filename</strong>
      <span>${escapeHtml(upload.name)}</span>
    </div>
    <div class="preview-detail">
      <strong>Size</strong>
      <span>${formatBytes(upload.size)}</span>
    </div>
    <div class="preview-detail">
      <strong>Type</strong>
      <span>${escapeHtml(upload.extension.toUpperCase())}</span>
    </div>
    <div class="preview-detail">
      <strong>Entity/source</strong>
      <span>${escapeHtml(upload.entityName || "Not provided")}</span>
    </div>
    <div class="preview-detail">
      <strong>Period</strong>
      <span>${escapeHtml(upload.period || "Not provided")}</span>
    </div>
    <div class="preview-detail">
      <strong>Assigned targets</strong>
      <span>${escapeHtml(targetNames)}</span>
    </div>
  `;

  if (upload.extension === "pdf") {
    previewContent.innerHTML = `<iframe title="Preview of ${escapeHtml(upload.name)}" src="${upload.objectUrl}"></iframe>`;
  } else {
    previewContent.innerHTML = `<p class="preview-unavailable">Preview is not available for ${escapeHtml(upload.extension.toUpperCase())} files. Assignment details are shown above.</p>`;
  }

  previewModal.hidden = false;
}

function openFilePreview(uploadId) {
  state.activeUploadId = uploadId;
  renderFilePreview();
}

function deleteUpload(uploadId) {
  const upload = state.uploads.find((entry) => entry.id === uploadId);
  revokeUpload(upload);
  state.uploads = state.uploads.filter((entry) => entry.id !== uploadId);

  if (state.activeUploadId === uploadId) {
    closeFilePreview();
  }

  render();
}

function openClearConfirm() {
  if (!state.uploads.length) {
    return;
  }

  clearConfirmCopy.textContent = `This will remove ${state.uploads.length} uploaded file${state.uploads.length === 1 ? "" : "s"} from this session. This cannot be undone.`;
  clearConfirmModal.hidden = false;
  clearConfirmCancelButton.focus();
}

function closeClearConfirm() {
  clearConfirmModal.hidden = true;
}

function clearAllUploads() {
  state.uploads.forEach(revokeUpload);
  state.uploads = [];
  closeFilePreview();
  closeClearConfirm();
  render();
}

function setActiveView(view) {
  state.activeView = view;
  if (view === "outcome") {
    state.activeOutcomeIndicatorId = null;
  }
  render();
}

function renderSectorIcon(item) {
  if (sectorPresentation[item.label]) {
    return `<img class="logo-${item.icon}" src="${logoIconPath(item.icon)}" alt="">`;
  }

  return fallbackSectorIcon;
}

function renderBoard() {
  board.innerHTML = state.categories.map((category) => {
    const categoryTarget = targetId(category.id);
    const categorySelected = state.selected.has(categoryTarget);

    const rows = category.items.map((item) => {
      const itemTarget = targetId(category.id, item.id);
      const isSelected = state.selected.has(itemTarget);

      return `
        <button class="category-row ${isSelected ? "is-selected" : ""}" type="button" data-row-id="${itemTarget}" aria-pressed="${isSelected}">
          <span class="count-cell">${item.count}</span>
          <span class="row-icon" aria-hidden="true">${renderSectorIcon(item)}</span>
          <span class="row-label"><span>${escapeHtml(item.label)}</span></span>
          <span class="row-actions">
            <span class="row-check" aria-hidden="true"></span>
            <span class="icon-button" role="button" tabindex="-1" title="Upload to ${escapeHtml(item.label)}" data-upload-id="${itemTarget}">
              ${uploadButtonIcon}
            </span>
          </span>
        </button>
      `;
    }).join("");

    return `
      <article class="category-column">
        <button class="category-header ${categorySelected ? "is-selected" : ""}" type="button" data-category-id="${category.id}" aria-pressed="${categorySelected}">
          <span class="category-title">${escapeHtml(category.title)}</span>
          <span class="header-upload" role="button" tabindex="-1" title="Upload to ${escapeHtml(category.title)}" data-upload-id="${categoryTarget}">
            ${uploadButtonIcon}
          </span>
          <span class="category-check" aria-hidden="true"></span>
        </button>
        <div class="row-list">${rows}</div>
      </article>
    `;
  }).join("");
}

function renderSelectedList() {
  const selectedTargets = getEffectiveSelectedTargetIds().map(getTarget).filter(Boolean);
  selectionHelp.textContent = selectedTargets.length
    ? `${selectedTargets.length} target${selectedTargets.length === 1 ? "" : "s"} selected`
    : state.loadError
      ? `Could not refresh counts: ${state.loadError}`
      : state.isLoading
        ? "Refreshing sector counts from Supabase."
        : "Choose one or more headers or sector rows.";

  selectedList.innerHTML = selectedTargets.length
    ? selectedTargets.map((target) => `
        <div class="selected-chip">
          <span>
            <span class="chip-kicker">${target.type === "category" ? "Category" : target.category.title}</span>
            <span class="chip-label">${escapeHtml(target.label)}</span>
          </span>
          <button class="chip-remove" type="button" aria-label="Remove ${escapeHtml(target.label)}" data-remove-id="${target.id}">x</button>
        </div>
      `).join("")
    : '<div class="empty-state">Select a category header to include all sectors, or select individual sector rows.</div>';
}

function render() {
  renderBoard();
  renderSelectedList();
  renderFileList();
  renderOutcome();
  appShell.classList.toggle("is-panel-collapsed", state.panelCollapsed);
  appShell.classList.toggle("is-outcome-view", state.activeView === "outcome");
  panelToggleButton.setAttribute("aria-expanded", String(!state.panelCollapsed));

  viewTabs.forEach((tab) => {
    const isActive = tab.dataset.viewTab === state.activeView;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  viewPanels.forEach((panel) => {
    panel.hidden = panel.dataset.viewPanel !== state.activeView;
  });
}

viewTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setActiveView(tab.dataset.viewTab);
  });
});

outcomeIndicatorTabs.addEventListener("click", (event) => {
  const indicatorTab = event.target.closest("[data-outcome-indicator-id]");
  if (!indicatorTab) {
    return;
  }

  state.activeOutcomeIndicatorId = indicatorTab.dataset.outcomeIndicatorId;
  render();
});

outcomeHead.addEventListener("click", (event) => {
  const backButton = event.target.closest("[data-outcome-back]");
  if (!backButton) {
    return;
  }

  state.activeOutcomeIndicatorId = null;
  render();
});

outcomeContext.addEventListener("change", (event) => {
  const field = event.target.closest("[data-context-field]");
  const multiField = event.target.closest("[data-context-multi-field]");
  const activeIndicator = getActiveOutcomeIndicator();

  if (!activeIndicator) {
    return;
  }

  const modeState = getOutcomeModeState(activeIndicator);

  if (multiField) {
    const fieldName = multiField.dataset.contextMultiField;
    const currentValues = Array.isArray(modeState[fieldName]) ? modeState[fieldName] : [];
    const nextValues = multiField.checked
      ? [...new Set([...currentValues, multiField.value])]
      : currentValues.filter((value) => value !== multiField.value);
    const nextState = normalizeModeState(activeIndicator, {
      ...modeState,
      [fieldName]: nextValues
    });

    setOutcomeModeState(activeIndicator.id, nextState);
    render();
    return;
  }

  if (!field) {
    return;
  }

  const nextState = normalizeModeState(activeIndicator, {
    ...modeState,
    [field.dataset.contextField]: field.value
  });

  setOutcomeModeState(activeIndicator.id, nextState);
  render();
});

outcomeContext.addEventListener("click", (event) => {
  const modeButton = event.target.closest("[data-context-mode]");
  const activeIndicator = getActiveOutcomeIndicator();

  if (!modeButton || !activeIndicator) {
    return;
  }

  const modeState = normalizeModeState(activeIndicator, {
    ...getOutcomeModeState(activeIndicator),
    mode: modeButton.dataset.contextMode
  });

  setOutcomeModeState(activeIndicator.id, modeState);
  render();
});

board.addEventListener("click", (event) => {
  const uploadButton = event.target.closest("[data-upload-id]");
  if (uploadButton) {
    event.stopPropagation();
    openSingleUpload(uploadButton.dataset.uploadId);
    return;
  }

  const header = event.target.closest("[data-category-id]");
  if (header) {
    const category = state.categories.find((entry) => entry.id === header.dataset.categoryId);
    if (category) {
      toggleCategory(category);
    }
    return;
  }

  const row = event.target.closest("[data-row-id]");
  if (row) {
    const target = getTarget(row.dataset.rowId);
    if (target) {
      toggleSector(target.category, target.item);
    }
  }
});

selectedList.addEventListener("click", (event) => {
  const removeButton = event.target.closest("[data-remove-id]");
  if (!removeButton) {
    return;
  }

  const target = getTarget(removeButton.dataset.removeId);
  if (!target) {
    return;
  }

  if (target.type === "category") {
    setCategorySelection(target.category, false);
  } else {
    state.selected.delete(target.id);
    state.selected.delete(targetId(target.category.id));
  }

  render();
});

clearSelectionButton.addEventListener("click", () => {
  state.selected.clear();
  render();
});

panelToggleButton.addEventListener("click", () => {
  state.panelCollapsed = true;
  render();
});

panelRestoreButton.addEventListener("click", () => {
  state.panelCollapsed = false;
  render();
});

dropzone.addEventListener("click", () => {
  if (getEffectiveSelectedTargetIds().length) {
    bulkFileInput.click();
  }
});

dropzone.addEventListener("keydown", (event) => {
  if ((event.key === "Enter" || event.key === " ") && getEffectiveSelectedTargetIds().length) {
    event.preventDefault();
    bulkFileInput.click();
  }
});

bulkFileInput.addEventListener("change", (event) => {
  requestValidatedUpload(event.target.files, getEffectiveSelectedTargetIds());
  bulkFileInput.value = "";
});

singleFileInput.addEventListener("change", (event) => {
  requestValidatedUpload(event.target.files, [state.pendingUploadTarget]);
  state.pendingUploadTarget = null;
  singleFileInput.value = "";
});

["dragenter", "dragover"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.add("is-over");
  });
});

["dragleave", "drop"].forEach((eventName) => {
  dropzone.addEventListener(eventName, (event) => {
    event.preventDefault();
    dropzone.classList.remove("is-over");
  });
});

dropzone.addEventListener("drop", (event) => {
  requestValidatedUpload(event.dataTransfer.files, getEffectiveSelectedTargetIds());
});

fileList.addEventListener("click", (event) => {
  const deleteButton = event.target.closest("[data-delete-upload-id]");
  if (deleteButton) {
    deleteUpload(deleteButton.dataset.deleteUploadId);
    return;
  }

  const previewButton = event.target.closest("[data-preview-id]");
  if (previewButton) {
    openFilePreview(previewButton.dataset.previewId);
  }
});

clearFilesButton.addEventListener("click", () => {
  openClearConfirm();
});

previewCloseButton.addEventListener("click", () => {
  closeFilePreview();
});

previewModal.addEventListener("click", (event) => {
  if (event.target === previewModal) {
    closeFilePreview();
  }
});

uploadMetadataForm.addEventListener("submit", (event) => {
  event.preventDefault();
  submitUploadMetadata();
});

uploadEntityNameInput.addEventListener("input", () => {
  uploadMetadataError.hidden = true;
});

uploadMetadataCloseButton.addEventListener("click", () => {
  closeUploadMetadataModal();
});

uploadMetadataCancelButton.addEventListener("click", () => {
  closeUploadMetadataModal();
});

uploadMetadataModal.addEventListener("click", (event) => {
  if (event.target === uploadMetadataModal) {
    closeUploadMetadataModal();
  }
});

clearConfirmCancelButton.addEventListener("click", () => {
  closeClearConfirm();
});

clearConfirmActionButton.addEventListener("click", () => {
  clearAllUploads();
});

clearConfirmModal.addEventListener("click", (event) => {
  if (event.target === clearConfirmModal) {
    closeClearConfirm();
  }
});

unsupportedFileCloseButton.addEventListener("click", () => {
  closeUnsupportedFileModal();
});

unsupportedFileActionButton.addEventListener("click", () => {
  closeUnsupportedFileModal();
});

unsupportedFileModal.addEventListener("click", (event) => {
  if (event.target === unsupportedFileModal) {
    closeUnsupportedFileModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !previewModal.hidden) {
    closeFilePreview();
  }

  if (event.key === "Escape" && !uploadMetadataModal.hidden) {
    closeUploadMetadataModal();
  }

  if (event.key === "Escape" && !clearConfirmModal.hidden) {
    closeClearConfirm();
  }

  if (event.key === "Escape" && !unsupportedFileModal.hidden) {
    closeUnsupportedFileModal();
  }
});

state.categories = buildCategoriesFromSectorCounts(state.sectorCounts);
loadIndicators({ showLoading: true });

setInterval(() => {
  loadIndicators();
}, AUTO_REFRESH_MS);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) {
    loadIndicators();
  }
});


