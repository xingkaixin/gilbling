// 搜索功能相关的工具函数

export interface FieldInfo {
  id: string;                    // 唯一标识
  columnName: string;            // 英文字段名
  chineseName: string;           // 中文名称
  tableName?: string;            // 所属表格名称
  element: HTMLElement;          // DOM 元素引用
  type?: string;                 // 字段类型
  isPrimaryKey?: boolean;        // 是否主键
}

export interface SearchResult {
  field: FieldInfo;
  matchType: 'column' | 'chinese' | 'both';
  matchText: string;             // 匹配的文本片段
  relevanceScore: number;        // 相关性评分
}

class SearchManager {
  private fieldIndex: Map<string, FieldInfo[]> = new Map();
  private isIndexBuilt = false;

  /**
   * 构建搜索索引
   * 扫描页面中的所有表格字段并建立索引
   */
  buildIndex(): void {
    if (this.isIndexBuilt) return;

    try {
      const fields: FieldInfo[] = [];

      // 查找所有表格行 - 使用与 enhance.tsx 相同的选择器
      const tableRows = document.querySelectorAll('tr[ng-repeat="column in columns"]');

      tableRows.forEach((row, index) => {
        try {
          const field = this.extractFieldFromRow(row as HTMLElement, index);
          if (field) {
            fields.push(field);
          }
        } catch (error) {
          console.warn('Failed to extract field from row:', error);
        }
      });

      // 建立索引
      this.fieldIndex.set('all', fields);
      this.isIndexBuilt = true;
    } catch (error) {
      console.error('Failed to build search index:', error);
    }
  }

  /**
   * 从表格行中提取字段信息
   */
  private extractFieldFromRow(row: HTMLElement, index: number): FieldInfo | null {
    try {
      // 获取所有单元格 - 与 enhance.tsx 中的方式保持一致
      const cells = row.querySelectorAll<HTMLTableCellElement>("td");
      if (cells.length < 6) {
        return null;
      }

      // 按照现有的列顺序提取数据
      // 序号 | 列名 | 中文名称 | 有值率(%) | 类型 | 空否 | 备注
      const serialNumber = cells[0]?.textContent?.trim() || '';
      const columnName = cells[1]?.textContent?.trim() || '';
      const chineseName = cells[2]?.textContent?.trim() || '';
      const hasValueRate = cells[3]?.textContent?.trim() || '';
      const fieldType = cells[4]?.textContent?.trim() || '';
      const isNullable = cells[5]?.textContent?.trim() || '';
      const remarks = cells[6]?.textContent?.trim() || '';

      if (!columnName || columnName === '无') {
        return null;
      }

      // 生成唯一ID
      const fieldId = `field_${index}_${columnName}`;

      // 检测是否主键 - 通过检查第一列是否有"主键"相关标识
      const isPrimaryKey = serialNumber.includes('★') ||
                          remarks.includes('主键') ||
                          chineseName.includes('ID') ||
                          columnName.toLowerCase().includes('id');

      return {
        id: fieldId,
        columnName,
        chineseName: chineseName === '无' ? '' : chineseName,
        element: row,
        type: fieldType,
        isPrimaryKey
      };
    } catch (error) {
      console.warn('Error extracting field from row:', error);
      return null;
    }
  }

  /**
   * 执行搜索
   * @param query 搜索关键词
   * @returns 搜索结果数组
   */
  search(query: string): SearchResult[] {
    if (!query.trim()) {
      return [];
    }

    if (!this.isIndexBuilt) {
      this.buildIndex();
    }

    const fields = this.fieldIndex.get('all') || [];
    const results: SearchResult[] = [];
    const normalizedQuery = query.toLowerCase().trim();

    fields.forEach(field => {
      const matchResult = this.matchField(field, normalizedQuery);
      if (matchResult) {
        results.push(matchResult);
      }
    });

    // 按相关性评分排序
    results.sort((a, b) => b.relevanceScore - a.relevanceScore);

    return results.slice(0, 20); // 限制结果数量
  }

  /**
   * 检查字段是否匹配搜索词
   */
  private matchField(field: FieldInfo, query: string): SearchResult | null {
    const { columnName, chineseName } = field;
    const normalizedColumnName = columnName.toLowerCase();
    const normalizedChineseName = chineseName.toLowerCase();

    // 精确匹配评分最高
    if (normalizedColumnName === query) {
      return {
        field,
        matchType: 'column',
        matchText: columnName,
        relevanceScore: 100
      };
    }

    if (normalizedChineseName === query) {
      return {
        field,
        matchType: 'chinese',
        matchText: chineseName,
        relevanceScore: 95
      };
    }

    // 前缀匹配
    if (normalizedColumnName.startsWith(query)) {
      return {
        field,
        matchType: 'column',
        matchText: columnName,
        relevanceScore: 80
      };
    }

    if (normalizedChineseName.startsWith(query)) {
      return {
        field,
        matchType: 'chinese',
        matchText: chineseName,
        relevanceScore: 75
      };
    }

    // 包含匹配
    if (normalizedColumnName.includes(query)) {
      return {
        field,
        matchType: 'column',
        matchText: columnName,
        relevanceScore: 60
      };
    }

    if (normalizedChineseName.includes(query)) {
      return {
        field,
        matchType: 'chinese',
        matchText: chineseName,
        relevanceScore: 55
      };
    }

    return null;
  }

  /**
   * 滚动到指定字段
   */
  scrollToField(fieldId: string): boolean {
    const field = this.findFieldById(fieldId);
    if (!field) {
      return false;
    }

    try {
      // 滚动到元素
      field.element.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });

      // 添加高亮效果
      this.highlightField(field.element);

      return true;
    } catch (error) {
      console.error('Failed to scroll to field:', error);
      return false;
    }
  }

  /**
   * 根据ID查找字段
   */
  private findFieldById(fieldId: string): FieldInfo | null {
    const fields = this.fieldIndex.get('all') || [];
    return fields.find(field => field.id === fieldId) || null;
  }

  /**
   * 高亮显示字段
   */
  private highlightField(element: HTMLElement): void {
    // 移除之前的高亮
    document.querySelectorAll('.search-highlight').forEach(el => {
      el.classList.remove('search-highlight');
    });

    // 添加新的高亮
    element.classList.add('search-highlight');

    // 3秒后移除高亮
    setTimeout(() => {
      element.classList.remove('search-highlight');
    }, 3000);
  }

  /**
   * 清除索引（当页面内容发生变化时调用）
   */
  clearIndex(): void {
    this.fieldIndex.clear();
    this.isIndexBuilt = false;
  }

  /**
   * 获取索引统计信息
   */
  getIndexStats(): { totalFields: number; isBuilt: boolean } {
    const fields = this.fieldIndex.get('all') || [];
    return {
      totalFields: fields.length,
      isBuilt: this.isIndexBuilt
    };
  }
}

// 创建全局搜索管理器实例
export const searchManager = new SearchManager();

/**
 * 搜索防抖函数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}