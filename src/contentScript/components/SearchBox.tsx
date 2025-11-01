import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { searchManager, SearchResult, debounce } from "../utils/search";
import { SearchResults } from "./SearchResults";

interface SearchBoxProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchBox: React.FC<SearchBoxProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isSearching, setIsSearching] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 防抖搜索函数
  const debouncedSearch = useCallback(
    debounce((searchQuery: string) => {
      if (searchQuery.trim()) {
        setIsSearching(true);
        try {
          const searchResults = searchManager.search(searchQuery.trim());
          setResults(searchResults);
          setSelectedIndex(searchResults.length > 0 ? 0 : -1);
        } catch (error) {
          console.error("Search failed:", error);
          setResults([]);
          setSelectedIndex(-1);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setSelectedIndex(-1);
      }
    }, 300),
    [],
  );

  // 处理输入变化
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    debouncedSearch(value);
  };

  // 处理键盘事件
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < results.length - 1 ? prev + 1 : results.length > 0 ? 0 : -1,
        );
        break;

      case "ArrowUp":
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev > 0 ? prev - 1 : results.length > 0 ? results.length - 1 : -1,
        );
        break;

      case "Enter":
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < results.length) {
          const result = results[selectedIndex];
          if (result) {
            handleSelectResult(result, selectedIndex);
          }
        }
        break;

      case "Escape":
        e.preventDefault();
        onClose();
        break;
    }
  };

  // 选择搜索结果
  const handleSelectResult = (result: SearchResult, index: number) => {
    try {
      const success = searchManager.scrollToField(result.field.id);
      if (success) {
        onClose();
      } else {
        console.warn("Failed to navigate to field:", result.field.id);
      }
    } catch (error) {
      console.error("Error selecting search result:", error);
    }
  };

  // 处理鼠标悬停
  const handleHover = (index: number) => {
    setSelectedIndex(index);
  };

  // 处理点击外部关闭
  const handleClickOutside = useCallback(
    (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    },
    [onClose],
  );

  // 自动聚焦输入框
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // 绑定点击外部事件
  useEffect(() => {
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen, handleClickOutside]);

  // 监听快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + K 打开搜索
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (!isOpen) {
          // 这里需要父组件来打开搜索框
        } else {
          onClose();
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="search-overlay">
      <div className="search-backdrop" onClick={onClose} />
      <div className="search-container" ref={containerRef}>
        <div className="search-input-wrapper">
          <div className="search-icon">
            <svg
              className="search-icon-svg"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            ref={inputRef}
            type="text"
            className="search-input"
            placeholder="搜索字段名或中文名称..."
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
          />

          {query && (
            <button
              className="search-clear"
              onClick={() => {
                setQuery("");
                setResults([]);
                setSelectedIndex(-1);
                inputRef.current?.focus();
              }}
              type="button"
              aria-label="清除搜索"
            >
              <svg
                className="search-clear-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}

          <button className="search-close" onClick={onClose} type="button">
            <span className="search-close-key">ESC</span>
          </button>
        </div>

        <div className="search-content">
          {isSearching ? (
            <div className="search-loading">
              <div className="search-status-text">搜索中...</div>
            </div>
          ) : (
            <SearchResults
              results={results}
              selectedIndex={selectedIndex}
              onSelectResult={handleSelectResult}
              onHover={handleHover}
            />
          )}
        </div>

        {query && (
          <div className="search-footer">
            <div className="search-footer-text">
              使用 ↑↓ 导航，Enter 选择，ESC 关闭
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 用于动态创建搜索框的辅助函数
export function createSearchBox(): {
  open: () => void;
  close: () => void;
  destroy: () => void;
} {
  let container: HTMLDivElement | null = null;
  let root: any = null;
  let isOpen = false;

  const open = () => {
    if (isOpen) return;

    if (!container) {
      container = document.createElement("div");
      container.id = "gilbling-search-box";
      document.body.appendChild(container);
      root = createRoot(container);
    }

    isOpen = true;
    root.render(<SearchBox isOpen={true} onClose={close} />);
  };

  const close = () => {
    if (!isOpen) return;
    isOpen = false;

    if (root && container) {
      root.render(<SearchBox isOpen={false} onClose={() => {}} />);
    }
  };

  const destroy = () => {
    if (container) {
      if (root) {
        root.unmount();
      }
      container.remove();
      container = null;
      root = null;
    }
    isOpen = false;
  };

  return { open, close, destroy };
}
