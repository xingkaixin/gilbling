import { createRoot } from "react-dom/client";
import { ExportButton } from "./components/ExportButton";
import { SearchButton } from "./components/SearchButton";
import { createSearchBox } from "./components/SearchBox";
import { searchManager } from "./utils/search";
import {
  getFieldColorConfig,
  type FieldColorConfig,
} from "../storage/config";

const ERROR_CONFIG = {
  logToConsole: true,
  silentMode: true,
} as const;

const FIELD_TYPE_MAP = {
  numeric: [
    "int",
    "bigint",
    "tinyint",
    "smallint",
    "mediumint",
    "decimal",
    "numeric",
    "float",
    "double",
    "number",
    "integer",
    "real",
    "binary_float",
    "binary_double",
    "smallmoney",
    "money",
  ],
  string: [
    "varchar",
    "char",
    "text",
    "varchar2",
    "nvarchar",
    "nvarchar2",
    "nchar",
    "char2",
    "long",
  ],
  datetime: [
    "date",
    "datetime",
    "timestamp",
    "time",
    "datetime2",
    "datetimeoffset",
    "smalldatetime",
  ],
  binary: ["blob", "binary", "varbinary", "raw", "image"],
  boolean: ["bit", "bool", "boolean"],
} as const;

const FIELD_TYPE_COLORS: Record<keyof typeof FIELD_TYPE_MAP, string> = {
  numeric: "#0000FF",
  string: "#008000",
  datetime: "#FF8C00",
  binary: "#800080",
  boolean: "#DC143C",
};

// 全局配置状态
let fieldColorConfig: FieldColorConfig | null = null;

const TABLE_HEADERS = [
  "序号",
  "列名",
  "中文名称",
  "有值率(%)",
  "类型",
  "空否",
  "备注",
] as const;

type TableMeta = {
  chineseName?: string;
  englishName?: string;
  authStatus?: string;
  endDate?: string;
  description?: string;
  updateFrequency?: string;
  businessKeyText?: string;
  tableStatus?: string;
  lastModified?: string;
};

type TableRemark = {
  label: string;
  text: string;
};

type FieldCategory = keyof typeof FIELD_TYPE_MAP;
type TableRow = HTMLTableRowElement;
type GroupInfo = {
  id: string;
  title: string;
  headerRow: TableRow;
  fieldRows: TableRow[];
};
type DirectoryItem = {
  id: string;
  title: string;
  targetElement: HTMLElement;
  kind: "page-info" | "field-group" | "slave-table" | "remarks";
  groupId?: string;
};
type DirectorySection = {
  id: string;
  title: string;
  items: DirectoryItem[];
};

const GROUP_NAV_ROOT_ID = "gilbling-group-nav-root";
const GROUP_ATTRIBUTE = "data-gilbling-group-id";
const GROUP_ROW_ATTRIBUTE = "data-gilbling-group-row";
const GROUP_TOGGLE_CLASS = "gilbling-group-toggle";
const GROUP_HIDDEN_CLASS = "gilbling-group-hidden";
const SYNTHETIC_GROUP_ATTRIBUTE = "data-gilbling-synthetic-group";
const DEFAULT_GROUP_TITLE = "未分组";
const DIRECTORY_PANEL_TITLE = "目录";

const collapsedGroupIds = new Set<string>();
let activeDirectoryItemId: string | null = null;
let isEnhancing = false;
let isGroupNavExpanded = false;

declare global {
  interface Window {
    debugEnhance?: () => void;
    __gilblingInitialized?: boolean;
    __gilblingSearch?: {
      open: () => void;
      close: () => void;
      destroy: () => void;
    };
    __gilblingGroupActions?: {
      expandGroupForElement: (element: HTMLElement) => void;
    };
  }
}

function logError(message: string, error: unknown) {
  if (ERROR_CONFIG.logToConsole) {
    // eslint-disable-next-line no-console
    console.error("[Gilbling Error]", message, error);
  }
}

function normalizeWhitespace(
  value: string,
  preserveLineBreaks = false,
): string {
  const replaced = value.replace(/\u00a0/g, " ");
  if (preserveLineBreaks) {
    return replaced
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .join("\n");
  }
  return replaced.replace(/\s+/g, " ").trim();
}

function getElementText(
  element: HTMLElement | null,
  preserveLineBreaks = false,
): string | null {
  if (!element) {
    return null;
  }

  if (preserveLineBreaks) {
    const clone = element.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("br").forEach((br) => {
      br.replaceWith("\n");
    });
    return normalizeWhitespace(clone.textContent ?? "", true);
  }

  return normalizeWhitespace(element.textContent ?? "");
}

function extractTableMeta(): TableMeta {
  try {
    const meta: TableMeta = {};

    const header = document.getElementById("table-name-title");
    if (header) {
      meta.chineseName =
        getElementText(
          header.querySelector<HTMLElement>(
            '[ng-bind-html*="table.tableChiName"]',
          ),
        ) ?? undefined;
      meta.englishName =
        getElementText(
          header.querySelector<HTMLElement>(
            '[ng-bind-html*="table.tableName"]',
          ),
        ) ?? undefined;
      meta.authStatus =
        getElementText(header.querySelector<HTMLElement>(".point-icon")) ??
        undefined;
      meta.endDate =
        getElementText(header.querySelector<HTMLElement>(".end-date-tip")) ??
        undefined;
    }

    const headInfo = document.getElementById("tableHeadInfo");
    if (headInfo) {
      meta.description =
        getElementText(
          headInfo.querySelector<HTMLElement>(
            '[ng-bind-html*="table.description"]',
          ),
          true,
        ) ?? undefined;
      meta.updateFrequency =
        getElementText(
          headInfo.querySelector<HTMLElement>(
            '[ng-bind="table.tableUpdateTime"]',
          ),
        ) ?? undefined;
      meta.tableStatus =
        getElementText(headInfo.querySelector<HTMLElement>(".table-status")) ??
        undefined;

      const businessKeyElement = headInfo.querySelector<HTMLElement>(
        "[ng-bind=\"index.columnName || '无'\"]",
      );
      const businessKeyText = getElementText(businessKeyElement);
      if (businessKeyText && businessKeyText !== "无") {
        meta.businessKeyText = businessKeyText;
      }
    }

    const lastModifiedElement = document.querySelector<HTMLElement>(
      '[ng-bind="lastModifyDateToShow"]',
    );
    meta.lastModified = getElementText(lastModifiedElement) ?? undefined;

    return meta;
  } catch (error) {
    logError("提取表信息失败", error);
    return {};
  }
}

function extractRemarkEntries(): TableRemark[] {
  try {
    const rows = document.querySelectorAll<HTMLTableRowElement>(
      ".table-remark tbody tr",
    );
    if (rows.length === 0) {
      return [];
    }

    const remarks: TableRemark[] = [];

    rows.forEach((row) => {
      const cells = row.querySelectorAll<HTMLTableCellElement>("td");
      if (cells.length < 2) {
        return;
      }

      const labelCell = cells.item(0);
      const detailCell = cells.item(1);
      const label = getElementText(labelCell) ?? "";
      const toggleContainer =
        detailCell?.querySelector<HTMLElement>("[toggle-remark]");
      const textSource =
        toggleContainer?.getAttribute("toggle-data") ??
        toggleContainer?.textContent ??
        detailCell?.textContent ??
        "";
      const text = normalizeWhitespace(textSource, true);

      if (!label && !text) {
        return;
      }

      remarks.push({ label, text });
    });

    return remarks;
  } catch (error) {
    logError("提取备注说明失败", error);
    return [];
  }
}

function findMainTable(): HTMLTableElement | null {
  const selectors = [
    "#table-info table.table-column",
    "#table-info table.table-interval-bg",
    "#table-info table",
    "#main-content-block table.table-column",
    "#main-content-block table.table-interval-bg",
    "#main-content-block table",
    "table.table-column",
    "table.table-interval-bg",
    "table",
  ];

  for (const selector of selectors) {
    const table = document.querySelector<HTMLTableElement>(selector);
    if (table && table.querySelector('tr[ng-repeat="column in columns"]')) {
      return table;
    }
  }

  return null;
}

function extractBusinessKeys(): string[] {
  try {
    const element = document.querySelector(
      "[ng-bind=\"index.columnName || '无'\"]",
    );
    const keysText = element?.textContent?.trim();

    if (!keysText || keysText === "无") {
      return ["ID"];
    }

    return keysText.split(",").map((key) => key.trim());
  } catch (error) {
    logError("提取业务主键失败", error);
    return ["ID"];
  }
}

function extractTableData(): string[][] | null {
  try {
    const table = findMainTable();
    if (!table) {
      return null;
    }

    const rows = table.querySelectorAll<HTMLTableRowElement>(
      'tr[ng-repeat="column in columns"]',
    );
    if (rows.length === 0) {
      return null;
    }

    const data: string[][] = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll<HTMLTableCellElement>("td");
      if (cells.length >= 6) {
        data.push(
          Array.from(
            { length: 7 },
            (_, index) => cells[index]?.textContent?.trim() ?? "",
          ),
        );
      }
    });

    return data;
  } catch (error) {
    logError("提取表格数据失败", error);
    return null;
  }
}

function formatAsTsv(data: string[][]): string {
  try {
    const rows = data.map((rowData) => rowData.join("\t"));
    return [TABLE_HEADERS.join("\t"), ...rows].join("\n");
  } catch (error) {
    logError("格式化TSV数据失败", error);
    return "";
  }
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (error) {
    logError(
      "剪贴板复制失败",
      new Error("Clipboard permission denied or text too large"),
    );
    return false;
  }
}

async function copyMarkdownToClipboard(markdown: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(markdown);
    return true;
  } catch (error) {
    logError(
      "复制 Markdown 失败",
      new Error("Clipboard permission denied or text too large"),
    );
    return false;
  }
}

async function exportTableToClipboard(): Promise<boolean> {
  try {
    const data = extractTableData();
    if (!data) {
      logError("导出表格失败", new Error("No table data found"));
      return false;
    }

    const tsvData = formatAsTsv(data);
    if (!tsvData) {
      logError("导出表格失败", new Error("TSV formatting failed"));
      return false;
    }

    return await copyToClipboard(tsvData);
  } catch (error) {
    logError("导出表格过程中发生未知错误", error);
    return false;
  }
}

function sanitizeMarkdownCell(value: string): string {
  return value
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s{2,}/g, " ")
    .replace(/\|/g, "\\|")
    .trim();
}

function buildMarkdownTable(data: string[][]): string {
  const headerLine = `| ${TABLE_HEADERS.join(" | ")} |`;
  const dividerLine = `| ${TABLE_HEADERS.map(() => "---").join(" | ")} |`;
  const bodyLines = data
    .map((row) => row.map((cell) => sanitizeMarkdownCell(cell)))
    .map((row) => `| ${row.join(" | ")} |`);
  return [headerLine, dividerLine, ...bodyLines].join("\n");
}

function buildRemarksMarkdown(remarks: TableRemark[]): string {
  if (remarks.length === 0) {
    return "";
  }

  const headerLine = "| 标记 | 说明 |";
  const dividerLine = "| --- | --- |";
  const bodyLines = remarks.map(({ label, text }) => {
    const safeLabel = sanitizeMarkdownCell(label);
    const safeText = sanitizeMarkdownCell(text);
    return `| ${safeLabel} | ${safeText} |`;
  });

  return [headerLine, dividerLine, ...bodyLines].join("\n");
}

function getTextContentBySelectors(
  selectors: string[],
  preserveLineBreaks = false,
): string | null {
  for (const selector of selectors) {
    const element = document.querySelector<HTMLElement>(selector);
    const text = getElementText(element ?? null, preserveLineBreaks);
    if (text) {
      return text;
    }
  }
  return null;
}

function extractPageTitle(): string {
  const title =
    getTextContentBySelectors([
      '[ng-bind-html*="table.tableChiName"]',
      '[ng-bind-html*="table.tableName"]',
      '[ng-bind*="tableName"]',
      '[ng-bind*="table_name"]',
      "header h1",
      "header h2",
      "h1",
      "h2",
    ]) ?? document.title?.trim();
  return title && title.length > 0 ? title : "未命名表";
}

function extractPageDescription(): string {
  const description = getTextContentBySelectors(
    [
      '[ng-bind-html*="table.description"]',
      '[ng-bind*="tableDesc"]',
      '[ng-bind*="table_desc"]',
      ".table-desc",
      ".table-description",
      ".description",
    ],
    true,
  );

  if (!description) {
    return "";
  }

  const normalized = description.replace(/\s{2,}/g, " ").trim();

  if (!normalized || normalized === "无" || normalized === "暂无") {
    return "";
  }

  return normalized;
}

async function copyPageAsMarkdown(): Promise<boolean> {
  try {
    const data = extractTableData();
    if (!data) {
      logError("复制页面为Markdown失败", new Error("No table data found"));
      return false;
    }

    const meta = extractTableMeta();
    const markdownTable = buildMarkdownTable(data);
    const remarks = extractRemarkEntries();

    const fallbackTitle = extractPageTitle();
    const title = meta.chineseName ?? fallbackTitle;
    const description = meta.description ?? extractPageDescription();
    const englishName = meta.englishName;

    const lines = [`# ${title}`, ""];

    if (englishName && englishName !== title) {
      lines.push(`**英文名称：** ${englishName}`, "");
    }

    if (description) {
      if (description.includes("\n")) {
        lines.push("**说明：**", "");
        lines.push(description, "");
      } else {
        lines.push(`**说明：** ${description}`, "");
      }
    }

    const infoItems: string[] = [];
    if (meta.authStatus) {
      infoItems.push(`- **权限状态：** ${meta.authStatus}`);
    }
    if (meta.endDate) {
      infoItems.push(`- **到期时间：** ${meta.endDate}`);
    }
    if (meta.updateFrequency) {
      infoItems.push(`- **表数据更新频率：** ${meta.updateFrequency}`);
    }
    if (meta.tableStatus) {
      infoItems.push(`- **表状态：** ${meta.tableStatus}`);
    }
    if (meta.businessKeyText) {
      infoItems.push(`- **业务唯一性：** ${meta.businessKeyText}`);
    }
    if (meta.lastModified) {
      infoItems.push(`- **最后修改日期：** ${meta.lastModified}`);
    }

    if (infoItems.length > 0) {
      lines.push("## 表信息", "", ...infoItems, "");
    }

    lines.push("## 字段定义", "", markdownTable, "");

    if (remarks.length > 0) {
      const remarksMarkdown = buildRemarksMarkdown(remarks);
      if (remarksMarkdown) {
        lines.push("## 备注说明", "", remarksMarkdown, "");
      }
    }

    lines.push(`> 生成时间：${new Date().toLocaleString()}`);

    return await copyMarkdownToClipboard(lines.join("\n"));
  } catch (error) {
    logError("复制页面为Markdown失败", error);
    return false;
  }
}

function getFieldTypeCategory(fieldType: string): FieldCategory | null {
  try {
    const [rawType] = fieldType.split(/[\(\s]/);
    const baseType = rawType?.toLowerCase();
    if (!baseType) {
      return null;
    }

    return (
      (
        Object.entries(FIELD_TYPE_MAP) as [FieldCategory, readonly string[]][]
      ).find(([, types]) => types.includes(baseType))?.[0] ?? null
    );
  } catch (error) {
    logError("字段类型分类失败", error);
    return null;
  }
}

function getFieldColor(category: FieldCategory): string {
  const customColors = fieldColorConfig?.customColors;
  if (customColors && customColors[category]) {
    return customColors[category];
  }
  return FIELD_TYPE_COLORS[category];
}

function toGroupSlug(value: string): string {
  const normalized = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\u4e00-\u9fa5-_]/g, "");

  return normalized || "group";
}

function getGroupHeaderCell(row: TableRow): HTMLTableCellElement | null {
  return row.querySelector<HTMLTableCellElement>("td.column-group[colspan]");
}

function createSyntheticGroupRow(anchorRow: TableRow, title: string): TableRow {
  const row = document.createElement("tr");
  row.setAttribute(SYNTHETIC_GROUP_ATTRIBUTE, "true");

  const cell = document.createElement("td");
  cell.colSpan = 7;
  cell.className = "column-group gilbling-synthetic-group";
  cell.textContent = title;

  row.appendChild(cell);
  anchorRow.parentElement?.insertBefore(row, anchorRow);
  return row;
}

function parseGroups(table: HTMLTableElement | null): GroupInfo[] {
  if (!table) {
    return [];
  }

  const rows = Array.from(
    table.querySelectorAll<TableRow>('tr[ng-repeat="column in columns"]'),
  );

  const groups: GroupInfo[] = [];
  let currentGroup: GroupInfo | null = null;
  let groupIndex = 0;
  let ungroupedRows: TableRow[] = [];

  const flushUngroupedRows = () => {
    if (ungroupedRows.length === 0) {
      return;
    }

    const firstUngroupedRow = ungroupedRows[0];
    if (!firstUngroupedRow) {
      ungroupedRows = [];
      return;
    }

    groupIndex += 1;
    const headerRow = createSyntheticGroupRow(
      firstUngroupedRow,
      DEFAULT_GROUP_TITLE,
    );
    groups.push({
      id: `${toGroupSlug(DEFAULT_GROUP_TITLE)}-${groupIndex}`,
      title: DEFAULT_GROUP_TITLE,
      headerRow,
      fieldRows: [...ungroupedRows],
    });
    ungroupedRows = [];
  };

  rows.forEach((row) => {
    const headerCell = getGroupHeaderCell(row);
    if (headerCell) {
      flushUngroupedRows();
      groupIndex += 1;
      const title = getElementText(headerCell) ?? `字段分组 ${groupIndex}`;
      currentGroup = {
        id: `${toGroupSlug(title)}-${groupIndex}`,
        title,
        headerRow: row,
        fieldRows: [],
      };
      groups.push(currentGroup);
      return;
    }

    const cells = row.querySelectorAll<HTMLTableCellElement>("td");
    if (cells.length >= 5) {
      if (currentGroup) {
        currentGroup.fieldRows.push(row);
      } else {
        ungroupedRows.push(row);
      }
    }
  });

  flushUngroupedRows();
  return groups;
}

function cleanupGroupEnhancements() {
  document
    .querySelectorAll<HTMLTableRowElement>(`tr[${SYNTHETIC_GROUP_ATTRIBUTE}]`)
    .forEach((row) => {
      row.remove();
    });

  document
    .querySelectorAll<HTMLElement>(`[${GROUP_ATTRIBUTE}]`)
    .forEach((element) => {
      element.removeAttribute(GROUP_ATTRIBUTE);
      element.removeAttribute(GROUP_ROW_ATTRIBUTE);
      element.classList.remove(
        "gilbling-group-header-row",
        "gilbling-group-field-row",
        GROUP_HIDDEN_CLASS,
      );
      if (element instanceof HTMLTableRowElement) {
        element.onclick = null;
        element.onkeydown = null;
        element.removeAttribute("role");
        element.removeAttribute("tabindex");
        element.removeAttribute("aria-expanded");
      }
    });

  document
    .querySelectorAll<HTMLElement>(".gilbling-group-title, .gilbling-group-cell")
    .forEach((element) => {
      element.classList.remove("gilbling-group-title", "gilbling-group-cell");
    });

  document.querySelectorAll(`.${GROUP_TOGGLE_CLASS}`).forEach((toggle) => {
    toggle.remove();
  });
}

function setActiveDirectoryItem(itemId: string | null) {
  activeDirectoryItemId = itemId;

  document
    .querySelectorAll<HTMLButtonElement>(".gilbling-directory-item")
    .forEach((button) => {
      const isActive = itemId !== null && button.dataset.itemId === itemId;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-current", isActive ? "true" : "false");
    });
}

function setGroupCollapsed(group: GroupInfo, collapsed: boolean) {
  if (collapsed) {
    collapsedGroupIds.add(group.id);
  } else {
    collapsedGroupIds.delete(group.id);
  }

  group.fieldRows.forEach((row) => {
    row.classList.toggle(GROUP_HIDDEN_CLASS, collapsed);
  });

  group.headerRow.setAttribute("aria-expanded", collapsed ? "false" : "true");
  group.headerRow.classList.toggle("is-collapsed", collapsed);
}

function expandGroupById(groupId: string | null) {
  if (!groupId) {
    return;
  }

  const headerRow = document.querySelector<TableRow>(
    `tr[${GROUP_ATTRIBUTE}="${groupId}"].gilbling-group-header-row`,
  );
  if (!headerRow) {
    return;
  }

  const fieldRows = Array.from(
    document.querySelectorAll<TableRow>(
      `tr[${GROUP_ATTRIBUTE}="${groupId}"].gilbling-group-field-row`,
    ),
  );

  fieldRows.forEach((row) => {
    row.classList.remove(GROUP_HIDDEN_CLASS);
  });

  headerRow.setAttribute("aria-expanded", "true");
  headerRow.classList.remove("is-collapsed");
  collapsedGroupIds.delete(groupId);
}

function enhanceGroups(groups: GroupInfo[]) {
  const validGroupIds = new Set(groups.map((group) => group.id));
  Array.from(collapsedGroupIds).forEach((groupId) => {
    if (!validGroupIds.has(groupId)) {
      collapsedGroupIds.delete(groupId);
    }
  });

  groups.forEach((group) => {
    group.headerRow.setAttribute(GROUP_ATTRIBUTE, group.id);
    group.headerRow.setAttribute(GROUP_ROW_ATTRIBUTE, "header");
    group.headerRow.classList.add("gilbling-group-header-row");
    group.headerRow.setAttribute("role", "button");
    group.headerRow.setAttribute("tabindex", "0");

    const headerCell = getGroupHeaderCell(group.headerRow);
    if (headerCell) {
      headerCell.classList.add("gilbling-group-cell");
      const toggle = document.createElement("span");
      toggle.className = GROUP_TOGGLE_CLASS;
      toggle.setAttribute("aria-hidden", "true");
      toggle.innerHTML =
        '<svg viewBox="0 0 16 16" focusable="false"><path d="M5 3.5 9.5 8 5 12.5" /></svg>';
      headerCell.prepend(toggle);

      const title = document.createElement("span");
      title.className = "gilbling-group-title";
      title.textContent = getElementText(headerCell) ?? group.title;

      Array.from(headerCell.childNodes).forEach((node) => {
        if (node !== toggle) {
          headerCell.removeChild(node);
        }
      });
      headerCell.append(toggle, title);
    }

    group.headerRow.onclick = () => {
      const nextCollapsed = !collapsedGroupIds.has(group.id);
      setGroupCollapsed(group, nextCollapsed);
      setActiveDirectoryItem(`field-${group.id}`);
    };

    group.headerRow.onkeydown = (event: KeyboardEvent) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        group.headerRow.click();
      }
    };

    group.fieldRows.forEach((row) => {
      row.setAttribute(GROUP_ATTRIBUTE, group.id);
      row.setAttribute(GROUP_ROW_ATTRIBUTE, "field");
      row.classList.add("gilbling-group-field-row");
    });

    setGroupCollapsed(group, collapsedGroupIds.has(group.id));
  });
}

function findPageInfoAnchor(): HTMLElement | null {
  return (
    document.getElementById("table-name-title") ??
    document.getElementById("tableHeadInfo") ??
    findMainTable()?.parentElement ??
    findMainTable()
  );
}

function findSlaveTableInfo(): DirectoryItem | null {
  const slaveTable = document.querySelector<HTMLTableElement>("table.table-slave");
  if (!slaveTable) {
    return null;
  }

  const titleCell =
    slaveTable.querySelector<HTMLElement>("thead tr:first-child th[id]") ??
    slaveTable.querySelector<HTMLElement>("thead tr:first-child th:nth-child(2)");

  return {
    id: "slave-table",
    title: "从表",
    targetElement: titleCell ?? slaveTable,
    kind: "slave-table",
  };
}

function findRemarksInfo(): DirectoryItem | null {
  const remarksTable = document.querySelector<HTMLTableElement>("table.table-remark");
  if (!remarksTable) {
    return null;
  }

  const titleCell =
    remarksTable.querySelector<HTMLElement>("thead .title") ?? remarksTable;

  return {
    id: "remarks",
    title: "备注说明",
    targetElement: titleCell,
    kind: "remarks",
  };
}

function collectDirectorySections(groups: GroupInfo[]): DirectorySection[] {
  const sections: DirectorySection[] = [];
  const pageInfoAnchor = findPageInfoAnchor();

  if (pageInfoAnchor) {
    sections.push({
      id: "page-info",
      title: "表信息",
      items: [
        {
          id: "page-info",
          title: "表信息",
          targetElement: pageInfoAnchor,
          kind: "page-info",
        },
      ],
    });
  }

  if (groups.length > 0) {
    sections.push({
      id: "fields",
      title: "字段",
      items: groups.map((group) => ({
        id: `field-${group.id}`,
        title: group.title,
        targetElement: group.headerRow,
        kind: "field-group",
        groupId: group.id,
      })),
    });
  }

  const slaveTableItem = findSlaveTableInfo();
  if (slaveTableItem) {
    sections.push({
      id: "slave-table",
      title: "从表",
      items: [slaveTableItem],
    });
  }

  const remarksItem = findRemarksInfo();
  if (remarksItem) {
    sections.push({
      id: "remarks",
      title: "备注说明",
      items: [remarksItem],
    });
  }

  return sections;
}

function renderDirectoryNavigation(groups: GroupInfo[]) {
  document.getElementById(GROUP_NAV_ROOT_ID)?.remove();

  if (!fieldColorConfig?.directoryEnabled) {
    return;
  }

  const sections = collectDirectorySections(groups);
  if (sections.length === 0) {
    return;
  }

  const container = document.createElement("aside");
  container.id = GROUP_NAV_ROOT_ID;
  container.className = "gilbling-group-nav";
  container.classList.toggle("is-expanded", isGroupNavExpanded);

  const panel = document.createElement("div");
  panel.className = "gilbling-group-nav-panel";

  sections.forEach((section) => {
    const sectionElement = document.createElement("section");
    sectionElement.className = "gilbling-directory-section";

    const list = document.createElement("div");
    list.className = "gilbling-group-nav-list";

    section.items.forEach((item) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "gilbling-directory-item";
      button.dataset.itemId = item.id;
      button.textContent = item.title;
      button.onclick = () => {
        if (item.kind === "field-group") {
          expandGroupById(item.groupId ?? null);
        }
        item.targetElement.scrollIntoView({
          behavior: "smooth",
          block: item.kind === "page-info" ? "start" : "start",
        });
        setActiveDirectoryItem(item.id);
      };
      list.appendChild(button);
    });

    sectionElement.appendChild(list);
    panel.appendChild(sectionElement);
  });
  container.appendChild(panel);

  const handle = document.createElement("button");
  handle.type = "button";
  handle.className = "gilbling-group-nav-handle";
  handle.textContent = "目录";
  handle.setAttribute("aria-label", "切换目录");
  handle.setAttribute("aria-expanded", isGroupNavExpanded ? "true" : "false");
  handle.onclick = () => {
    isGroupNavExpanded = !isGroupNavExpanded;
    container.classList.toggle("is-expanded", isGroupNavExpanded);
    handle.setAttribute("aria-expanded", isGroupNavExpanded ? "true" : "false");
  };
  container.appendChild(handle);

  document.body.appendChild(container);
  setActiveDirectoryItem(activeDirectoryItemId ?? sections[0]?.items[0]?.id ?? null);
}

function isGilblingManagedNode(node: Node): boolean {
  if (!(node instanceof Element)) {
    return false;
  }

  return Boolean(
    node.closest(`#${GROUP_NAV_ROOT_ID}`) ??
      node.closest("#gilbling-export-root") ??
      node.closest("#gilbling-search-button-root") ??
      node.closest(".search-overlay"),
  );
}

function applyFieldStyling(
  row: TableRow,
  fieldType: string,
  columnName: string,
  businessKeys: readonly string[],
) {
  try {
    const cells = row.querySelectorAll<HTMLTableCellElement>("td");
    if (cells.length < 5) {
      return;
    }

    row.classList.add("gilbling-row");

    cells.forEach((cell) => {
      cell.style.color = "";
      cell.style.fontWeight = "";
    });

    const category = getFieldTypeCategory(fieldType);
    // 只有在配置开启时才应用颜色（业务主键样式不受影响）
    if (fieldColorConfig?.enabled && category) {
      const color = getFieldColor(category);
      cells.forEach((cell) => {
        cell.style.color = color;
      });
    }

    if (businessKeys.includes(columnName)) {
      row.style.fontWeight = "bold";
      row.style.borderLeft = "3px solid #007acc";
    } else {
      row.style.fontWeight = "";
      row.style.borderLeft = "";
    }
  } catch (error) {
    logError("应用字段样式失败", error);
  }
}

function addExportButton() {
  try {
    const containerId = "gilbling-export-root";
    if (document.getElementById(containerId)) {
      return;
    }

    const table = findMainTable();
    if (!table || !table.parentElement) {
      return;
    }

    const container = document.createElement("div");
    container.id = containerId;
    table.parentElement.insertBefore(container, table);

    const root = createRoot(container);
    root.render(
      <ExportButton
        onExport={exportTableToClipboard}
        onCopyMarkdown={copyPageAsMarkdown}
      />,
    );
  } catch (error) {
    logError("添加导出按钮失败", error);
  }
}

function addSearchButton() {
  try {
    const containerId = "gilbling-search-button-root";
    if (document.getElementById(containerId)) {
      return;
    }

    const exportContainer = document.getElementById("gilbling-export-root");
    if (!exportContainer) {
      setTimeout(() => {
        addSearchButton();
      }, 100);
      return;
    }

    const buttonGroup =
      exportContainer.querySelector<HTMLElement>(".gilbling-button-group");

    if (!buttonGroup) {
      setTimeout(() => {
        addSearchButton();
      }, 100);
      return;
    }

    const container = document.createElement("span");
    container.id = containerId;
    buttonGroup.appendChild(container);

    const root = createRoot(container);
    root.render(<SearchButton onClick={() => searchBox?.open()} />);
  } catch (error) {
    logError("添加搜索按钮失败", error);
  }
}

let searchBox: ReturnType<typeof createSearchBox> | null = null;

function initSearchFunctionality() {
  try {
    // 初始化搜索管理器索引
    searchManager.buildIndex();

    // 创建搜索框实例
    if (!searchBox) {
      searchBox = createSearchBox();
    }

    // 添加搜索按钮（与导出按钮并排）
    addSearchButton();

    // 全局快捷键支持
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchBox?.open();
      }
    };

    document.addEventListener("keydown", handleGlobalKeyDown);

    // 保存清理函数到全局
    window.__gilblingSearch = searchBox;

    return () => {
      document.removeEventListener("keydown", handleGlobalKeyDown);
    };
  } catch (error) {
    logError("初始化搜索功能失败", error);
  }
}

function cleanupSearchFunctionality() {
  try {
    if (searchBox) {
      searchBox.destroy();
      searchBox = null;
    }

    // 清理搜索按钮容器
    const searchButtonContainer = document.getElementById(
      "gilbling-search-button-root",
    );
    if (searchButtonContainer) {
      searchButtonContainer.remove();
    }

    delete window.__gilblingSearch;
  } catch (error) {
    logError("清理搜索功能失败", error);
  }
}

function expandGroupForElement(element: HTMLElement) {
  const row = element.closest<HTMLTableRowElement>(`tr[${GROUP_ATTRIBUTE}]`);
  const groupId = row?.getAttribute(GROUP_ATTRIBUTE) ?? null;
  expandGroupById(groupId);
}

function enhanceTable() {
  try {
    isEnhancing = true;
    const table = findMainTable();
    cleanupGroupEnhancements();
    document.getElementById(GROUP_NAV_ROOT_ID)?.remove();

    if (!table) {
      window.__gilblingGroupActions = {
        expandGroupForElement,
      };
      return;
    }

    const businessKeys = extractBusinessKeys();
    addExportButton();
    addSearchButton();

    // 初始化搜索功能（只在第一次调用时初始化）
    initSearchFunctionality();

    table
      .querySelectorAll<TableRow>('tr[ng-repeat="column in columns"]')
      .forEach((row) => {
        const cells = row.querySelectorAll<HTMLTableCellElement>("td");
        if (cells.length < 5) {
          return;
        }

        const columnName = cells[1]?.textContent?.trim();
        const typeText = cells[4]?.textContent?.toLowerCase()?.trim();

        if (columnName && typeText) {
          applyFieldStyling(row, typeText, columnName, businessKeys);
        }
      });

    const groups = parseGroups(table);
    enhanceGroups(groups);
    renderDirectoryNavigation(groups);
    window.__gilblingGroupActions = {
      expandGroupForElement,
    };
  } catch (error) {
    logError("增强表格功能失败", error);
  } finally {
    isEnhancing = false;
  }
}

const observer = new MutationObserver((mutations) => {
  try {
    if (isEnhancing) {
      return;
    }

    const shouldEnhance = mutations.some((mutation) => {
      const changedNodes = [
        ...Array.from(mutation.addedNodes),
        ...Array.from(mutation.removedNodes),
      ];

      return changedNodes.some((node) => {
        if (isGilblingManagedNode(node)) {
          return false;
        }

        if (!(node instanceof Element)) {
          return false;
        }

        if (node.matches('tr[ng-repeat*="column"]')) {
          return true;
        }

        return Boolean(node.querySelector('tr[ng-repeat*="column"]'));
      });
    });

    if (shouldEnhance) {
      // 清理搜索索引，因为页面内容可能已经改变
      searchManager.clearIndex();
      enhanceTable();
    }
  } catch (error) {
    logError("MutationObserver处理失败", error);
  }
});

function attachObserver() {
  try {
    if (!document.body) {
      return;
    }

    observer.observe(document.body, { childList: true, subtree: true });
  } catch (error) {
    logError("初始化MutationObserver失败", error);
  }
}

async function init() {
  try {
    // 初始化配置
    fieldColorConfig = await getFieldColorConfig();

    // 监听配置变更
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local' && changes.fieldColorConfig) {
        const newConfig = changes.fieldColorConfig
          .newValue as Partial<FieldColorConfig> | undefined;
        if (newConfig) {
          const directoryEnabled =
            typeof newConfig.directoryEnabled === "boolean"
              ? newConfig.directoryEnabled
              : typeof newConfig.groupOutlineEnabled === "boolean"
                ? newConfig.groupOutlineEnabled
                : true;
          fieldColorConfig = {
            enabled: true,
            ...newConfig,
            directoryEnabled,
          };
          // 重新应用样式
          enhanceTable();
          console.log('[Gilbling] 字段着色配置已更新:', newConfig.enabled ? '已开启' : '已关闭');
        }
      }
    });

    enhanceTable();
    attachObserver();
    window.debugEnhance = enhanceTable;
  } catch (error) {
    // 错误处理：如果读取配置失败，使用默认值并继续
    fieldColorConfig = { enabled: true, directoryEnabled: true };
    console.warn('[Gilbling] 配置初始化失败，使用默认值:', error);
    enhanceTable();
    attachObserver();
    window.debugEnhance = enhanceTable;
  }
}

export function initEnhancement() {
  if (window.__gilblingInitialized) {
    return;
  }

  window.__gilblingInitialized = true;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
}
