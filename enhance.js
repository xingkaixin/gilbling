// enhance.js - 修复版
(function () {
  "use strict";

  function extractBusinessKeys() {
    const element = document.querySelector(
      "[ng-bind=\"index.columnName || '无'\"]"
    );
    const keysText = element?.textContent?.trim();

    if (!keysText || keysText === "无") return ["ID"];

    return keysText.split(",").map((k) => k.trim());
  }

  function addExportButton() {
    if (document.querySelector('#table-export-btn')) return;

    const table = document.querySelector('table');
    if (!table) return;

    const exportBtn = document.createElement('button');
    exportBtn.id = 'table-export-btn';
    exportBtn.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="margin-right: 6px; vertical-align: middle;">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="2"/>
        <path d="m14,2 l6,6" stroke="currentColor" stroke-width="2"/>
        <path d="m16,13 l-8,0" stroke="currentColor" stroke-width="2"/>
        <path d="m16,17 l-8,0" stroke="currentColor" stroke-width="2"/>
        <path d="m10,9 l-2,0" stroke="currentColor" stroke-width="2"/>
      </svg>
      导出表格
    `;
    exportBtn.style.cssText = `
      margin: 12px 0;
      padding: 10px 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 14px;
      font-weight: 500;
      display: inline-flex;
      align-items: center;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      transition: all 0.3s ease;
      position: relative;
      overflow: hidden;
    `;
    
    exportBtn.addEventListener('mouseenter', () => {
      exportBtn.style.transform = 'translateY(-2px)';
      exportBtn.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.15)';
    });
    
    exportBtn.addEventListener('mouseleave', () => {
      exportBtn.style.transform = 'translateY(0)';
      exportBtn.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
    });
    
    exportBtn.addEventListener('mousedown', () => {
      exportBtn.style.transform = 'translateY(0) scale(0.98)';
    });
    
    exportBtn.addEventListener('mouseup', () => {
      exportBtn.style.transform = 'translateY(-2px) scale(1)';
    });

    exportBtn.addEventListener('click', exportTableToClipboard);
    table.parentNode.insertBefore(exportBtn, table);
  }

  function extractTableData() {
    const rows = document.querySelectorAll('tr[ng-repeat="column in columns"]');
    if (rows.length === 0) {
      return null;
    }

    const data = [];
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 6) {
        data.push([
          cells[0]?.textContent?.trim() || '',
          cells[1]?.textContent?.trim() || '',
          cells[2]?.textContent?.trim() || '',
          cells[3]?.textContent?.trim() || '',
          cells[4]?.textContent?.trim() || '',
          cells[5]?.textContent?.trim() || '',
          cells[6]?.textContent?.trim() || ''
        ]);
      }
    });
    return data;
  }

  function formatAsTsv(data) {
    const headers = ['序号', '列名', '中文名称', '有值率(%)', '类型', '空否', '备注'];
    let tsvData = headers.join('\t') + '\n';
    
    data.forEach(rowData => {
      tsvData += rowData.join('\t') + '\n';
    });
    
    return tsvData;
  }

  function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      alert('表格数据已复制到剪贴板，可直接粘贴到Excel');
    }).catch(() => {
      alert('复制失败，请手动复制以下内容：\n\n' + text);
    });
  }

  function exportTableToClipboard() {
    const data = extractTableData();
    if (!data) {
      alert('没有找到表格数据');
      return;
    }

    const tsvData = formatAsTsv(data);
    copyToClipboard(tsvData);
  }

  function enhanceTable() {
    const businessKeys = extractBusinessKeys();
    addExportButton();

    document
      .querySelectorAll('tr[ng-repeat="column in columns"]')
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

  const observer = new MutationObserver((mutations) => {
    const shouldEnhance = mutations.some(m => 
      m.target.matches && (
        m.target.matches('tr[ng-repeat*="column"]') ||
        m.target.querySelector('tr[ng-repeat*="column"]')
      )
    );
    if (shouldEnhance) enhanceTable();
  });
  
  function initEnhancement() {
    enhanceTable();
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener("DOMContentLoaded", initEnhancement);
  } else {
    initEnhancement();
  }
  window.debugEnhance = enhanceTable;
})();
