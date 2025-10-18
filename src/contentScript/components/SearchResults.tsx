import React, { useRef, useEffect } from 'react';
import { SearchResult } from '../utils/search';

interface SearchResultsProps {
  results: SearchResult[];
  selectedIndex: number;
  onSelectResult: (result: SearchResult, index: number) => void;
  onHover: (index: number) => void;
}

export const SearchResults: React.FC<SearchResultsProps> = ({
  results,
  selectedIndex,
  onSelectResult,
  onHover
}) => {
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // 确保选中项在视图中可见
    if (resultsRef.current && selectedIndex >= 0 && selectedIndex < results.length) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex, results.length]);

  if (results.length === 0) {
    return (
      <div className="search-results-empty">
        <div className="text-gray-500 text-center py-4">
          {results.length === 0 ? '未找到匹配的字段' : '输入关键词搜索字段'}
        </div>
      </div>
    );
  }

  const getMatchTypeLabel = (matchType: string) => {
    switch (matchType) {
      case 'column':
        return '字段名';
      case 'chinese':
        return '中文名';
      case 'both':
        return '全部匹配';
      default:
        return '未知';
    }
  };

  const getMatchTypeColor = (matchType: string) => {
    switch (matchType) {
      case 'column':
        return 'text-blue-600 bg-blue-50';
      case 'chinese':
        return 'text-green-600 bg-green-50';
      case 'both':
        return 'text-purple-600 bg-purple-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div ref={resultsRef} className="search-results">
      <div className="search-results-header">
        <span className="text-sm text-gray-500">
          找到 {results.length} 个匹配结果
        </span>
      </div>

      <div className="search-results-list">
        {results.map((result, index) => (
          <div
            key={result.field.id}
            className={`search-result-item ${index === selectedIndex ? 'selected' : ''}`}
            onClick={() => onSelectResult(result, index)}
            onMouseEnter={() => onHover(index)}
          >
            <div className="search-result-content">
              <div className="search-result-primary">
                <div className="search-result-column">
                  <span className="font-medium text-gray-900">
                    {result.field.columnName}
                  </span>
                </div>

                {result.field.chineseName && (
                  <div className="search-result-chinese text-gray-600 text-sm mt-1">
                    {result.field.chineseName}
                  </div>
                )}
              </div>

              <div className="search-result-meta">
                <span className={`search-match-type ${getMatchTypeColor(result.matchType)}`}>
                  {getMatchTypeLabel(result.matchType)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};