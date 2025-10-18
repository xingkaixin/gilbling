import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

interface SearchButtonProps {
  onClick: () => void;
  shortcut?: string;
}

export const SearchButton: React.FC<SearchButtonProps> = ({ onClick, shortcut = 'Ctrl+K' }) => {
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <button
      ref={buttonRef}
      className="search-button"
      onClick={onClick}
      title={`搜索字段 (${shortcut})`}
    >
      <svg
        className="search-button-icon"
        width="16"
        height="16"
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
      <span className="search-button-text">搜索</span>
      <kbd className="search-shortcut">{shortcut}</kbd>
    </button>
  );
};

// 此函数已弃用，现在使用 enhance.tsx 中的 addSearchButton 函数
// 为了向后兼容保留此接口
export function createSearchButton(onClick: () => void): { destroy: () => void } {
  console.warn('createSearchButton is deprecated, use addSearchButton from enhance.tsx instead');

  return {
    destroy: () => {
      // 空实现，因为按钮现在由 enhance.tsx 管理
    }
  };
}