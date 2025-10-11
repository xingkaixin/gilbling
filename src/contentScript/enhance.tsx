import { createRoot } from "react-dom/client";
import { ExportButton } from "./components/ExportButton";

const ERROR_CONFIG = {
  logToConsole: true,
  silentMode: true
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
    "money"
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
    "long"
  ],
  datetime: [
    "date",
    "datetime",
    "timestamp",
    "time",
    "datetime2",
    "datetimeoffset",
    "smalldatetime"
  ],
  binary: ["blob", "binary", "varbinary", "raw", "image"],
  boolean: ["bit", "bool", "boolean"]
} as const;

const FIELD_TYPE_COLORS: Record<keyof typeof FIELD_TYPE_MAP, string> = {
  numeric: "#0000FF",
  string: "#008000",
  datetime: "#FF8C00",
  binary: "#800080",
  boolean: "#DC143C"
};

type FieldCategory = keyof typeof FIELD_TYPE_MAP;
type TableRow = HTMLTableRowElement;

declare global {
  interface Window {
    debugEnhance?: () => void;
    __gilblingInitialized?: boolean;
  }
}

function logError(message: string, error: unknown) {
  if (ERROR_CONFIG.logToConsole) {
    // eslint-disable-next-line no-console
    console.error("[Gilbling Error]", message, error);
  }
}

function extractBusinessKeys(): string[] {
  try {
    const element = document.querySelector('[ng-bind="index.columnName || \'无\'"]');
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
    const rows = document.querySelectorAll<HTMLTableRowElement>('tr[ng-repeat="column in columns"]');
    if (rows.length === 0) {
      return null;
    }

    const data: string[][] = [];
    rows.forEach((row) => {
      const cells = row.querySelectorAll<HTMLTableCellElement>("td");
      if (cells.length >= 6) {
        data.push(
          Array.from({ length: 7 }, (_, index) => cells[index]?.textContent?.trim() ?? "")
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
    const headers = ["序号", "列名", "中文名称", "有值率(%)", "类型", "空否", "备注"];
    const rows = data.map((rowData) => rowData.join("\t"));
    return [headers.join("\t"), ...rows].join("\n");
  } catch (error) {
    logError("格式化TSV数据失败", error);
    return "";
  }
}

function copyToClipboard(text: string) {
  navigator.clipboard
    .writeText(text)
    .then(() => {
      window.alert("表格数据已复制到剪贴板，可直接粘贴到Excel");
    })
    .catch(() => {
      window.alert(`复制失败，请手动复制以下内容：\n\n${text}`);
      logError("剪贴板复制失败", new Error("Clipboard permission denied or text too large"));
    });
}

function exportTableToClipboard() {
  try {
    const data = extractTableData();
    if (!data) {
      window.alert("没有找到表格数据");
      logError("导出表格失败", new Error("No table data found"));
      return;
    }

    const tsvData = formatAsTsv(data);
    if (!tsvData) {
      logError("导出表格失败", new Error("TSV formatting failed"));
      return;
    }

    copyToClipboard(tsvData);
  } catch (error) {
    logError("导出表格过程中发生未知错误", error);
  }
}

function getFieldTypeCategory(fieldType: string): FieldCategory | null {
  try {
    const [rawType] = fieldType.split(/[\(\s]/);
    const baseType = rawType?.toLowerCase();
    if (!baseType) {
      return null;
    }

    return (Object.entries(FIELD_TYPE_MAP) as [FieldCategory, readonly string[]][]).find(([, types]) =>
      types.includes(baseType)
    )?.[0] ?? null;
  } catch (error) {
    logError("字段类型分类失败", error);
    return null;
  }
}

function applyFieldStyling(
  row: TableRow,
  fieldType: string,
  columnName: string,
  businessKeys: readonly string[]
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
    if (category) {
      const color = FIELD_TYPE_COLORS[category];
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

    const table = document.querySelector<HTMLTableElement>("table");
    if (!table || !table.parentElement) {
      return;
    }

    const container = document.createElement("div");
    container.id = containerId;
    table.parentElement.insertBefore(container, table);

    const root = createRoot(container);
    root.render(<ExportButton onExport={exportTableToClipboard} />);
  } catch (error) {
    logError("添加导出按钮失败", error);
  }
}

function enhanceTable() {
  try {
    const businessKeys = extractBusinessKeys();
    addExportButton();

    document
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
  } catch (error) {
    logError("增强表格功能失败", error);
  }
}

const observer = new MutationObserver((mutations) => {
  try {
    const shouldEnhance = mutations.some((mutation) => {
      const node = mutation.target;
      const target = node instanceof Element ? node : null;
      if (target?.matches('tr[ng-repeat*="column"]')) {
        return true;
      }
      return Boolean(target?.querySelector('tr[ng-repeat*="column"]'));
    });

    if (shouldEnhance) {
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

function init() {
  enhanceTable();
  attachObserver();
  window.debugEnhance = enhanceTable;
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
