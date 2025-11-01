import {
  type FC,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";

type ExportButtonProps = {
  onExport: () => void;
  onCopyMarkdown: () => void;
};

const primaryButtonClasses =
  "group inline-flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:translate-y-0 active:scale-95";

const toggleButtonClasses =
  "inline-flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-500 px-3 py-2.5 text-white transition-all duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:translate-y-0 active:scale-95";

const menuButtonClasses =
  "flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-indigo-50 hover:text-indigo-600";

export const ExportButton: FC<ExportButtonProps> = ({
  onExport,
  onCopyMarkdown,
}) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (event: globalThis.MouseEvent) => {
      if (!containerRef.current) {
        return;
      }
      if (!containerRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("click", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen]);

  const handleExport = () => {
    setMenuOpen(false);
    onExport();
  };

  const handleToggleMenu = (event: ReactMouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setMenuOpen((prev) => !prev);
  };

  const handleCopyMarkdown = () => {
    setMenuOpen(false);
    onCopyMarkdown();
  };

  return (
    <div ref={containerRef} className="relative inline-flex items-center">
      <div className="inline-flex overflow-hidden rounded-lg shadow">
        <button
          id="table-export-btn"
          type="button"
          className={`${primaryButtonClasses} rounded-l-lg`}
          onClick={handleExport}
        >
          <svg
            className="h-4 w-4 text-white transition-transform duration-200 group-hover:-translate-y-0.5"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path d="m14 2 6 6" stroke="currentColor" strokeWidth="2" />
            <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
            <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
            <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
          </svg>
          导出表格
        </button>
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="更多导出选项"
          className={`${toggleButtonClasses} rounded-r-lg border-l border-white/30`}
          onClick={handleToggleMenu}
        >
          <svg
            className="h-4 w-4"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.086l3.71-3.854a.75.75 0 1 1 1.08 1.04l-4.24 4.4a.75.75 0 0 1-1.08 0l-4.24-4.4a.75.75 0 0 1 .02-1.06z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      {menuOpen ? (
        <div
          role="menu"
          aria-label="导出菜单"
          className="absolute right-0 top-full z-20 mt-2 w-48 origin-top-right rounded-lg border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black/5"
        >
          <button
            type="button"
            className={menuButtonClasses}
            onClick={handleExport}
            role="menuitem"
          >
            <span className="flex-1 text-left">导出表格</span>
            <span className="text-xs text-gray-400">默认</span>
          </button>
          <button
            type="button"
            className={menuButtonClasses}
            onClick={handleCopyMarkdown}
            role="menuitem"
          >
            <span className="flex-1 text-left">复制页面为 Markdown</span>
          </button>
        </div>
      ) : null}
    </div>
  );
};

ExportButton.displayName = "ExportButton";
