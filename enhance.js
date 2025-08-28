// 针对聚源数据字典的精确匹配 - 动态业务主键版
(function () {
  "use strict";

  // 从页面动态提取业务唯一性字段
  function extractBusinessKeys() {
    const element = document.querySelector(
      "[ng-bind=\"index.columnName || '无'\"]"
    );
    const keysText = element?.textContent?.trim();

    if (!keysText || keysText === "无") return ["ID"];

    return keysText.split(",").map((k) => k.trim());
  }

  function enhanceTable() {
    const businessKeys = extractBusinessKeys();

    document
      .querySelectorAll(
        'tr[ng-repeat="column in columns"], .table-column tbody tr'
      )
      .forEach((row) => {
        const cells = row.querySelectorAll("td");
        if (cells.length < 5) return;

        const columnName = cells[1]?.textContent?.trim();
        if (!columnName) return;

        // 清理旧样式
        row.className = row.className
          .replace(/field-type-\w+/g, "")
          .replace(/field-(business-key|primary-key)/g, "");

        const typeText = cells[4]?.textContent?.toLowerCase()?.trim();
        if (typeText) {
          const baseType = typeText.split(/[\(\s]/)[0];
          row.classList.add(`field-type-${baseType}`);
        }

        // 动态业务主键匹配
        if (businessKeys.includes(columnName)) {
          row.classList.add("field-business-key");
        }
      });
  }

  // 延迟执行，确保Angular渲染完成
  setTimeout(() => {
    enhanceTable();
  }, 500);

  // 监听Angular动态内容
  const observer = new MutationObserver(() => {
    enhanceTable();
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
  } else {
    document.addEventListener("DOMContentLoaded", () => {
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

  // 每500ms检查一次新内容
  setInterval(enhanceTable, 500);

  // 暴露到全局供调试
  window.debugEnhance = enhanceTable;
})();
