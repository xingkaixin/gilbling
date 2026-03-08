import { type FC, useEffect, useRef, useState } from "react";

type ExportButtonProps = {
  onExport: () => Promise<boolean>;
  onCopyMarkdown: () => Promise<boolean>;
};

type ButtonState = {
  isSuccess: boolean;
};

const EXPORT_BUTTON_TEXT = "导出表格为TSV";
const MARKDOWN_BUTTON_TEXT = "导出页面为Markdown";

function TableExportIcon({ isSuccess }: ButtonState) {
  if (isSuccess) {
    return (
      <svg
        className="gilbling-btn-icon gilbling-btn-icon-success"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  return (
    <svg
      className="gilbling-btn-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M3 3h18v18H3zM3 9h18M9 3v18M3 15h18" />
    </svg>
  );
}

function MarkdownExportIcon({ isSuccess }: ButtonState) {
  if (isSuccess) {
    return (
      <svg
        className="gilbling-btn-icon gilbling-btn-icon-success"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
    );
  }

  return (
    <svg
      className="gilbling-btn-icon"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}

export const ExportButton: FC<ExportButtonProps> = ({
  onExport,
  onCopyMarkdown,
}) => {
  const buttonClass = "gilbling-btn";
  const exportTimerRef = useRef<number | null>(null);
  const markdownTimerRef = useRef<number | null>(null);

  const [exportBtn, setExportBtn] = useState<ButtonState>({
    isSuccess: false,
  });

  const [markdownBtn, setMarkdownBtn] = useState<ButtonState>({
    isSuccess: false,
  });

  useEffect(() => {
    return () => {
      if (exportTimerRef.current !== null) {
        window.clearTimeout(exportTimerRef.current);
      }

      if (markdownTimerRef.current !== null) {
        window.clearTimeout(markdownTimerRef.current);
      }
    };
  }, []);

  const handleButtonClick = async (
    callback: () => Promise<boolean>,
    setState: React.Dispatch<React.SetStateAction<ButtonState>>,
    timerRef: React.MutableRefObject<number | null>,
  ) => {
    const success = await callback();

    if (success) {
      setState({
        isSuccess: true,
      });

      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
      }

      timerRef.current = window.setTimeout(() => {
        setState({
          isSuccess: false,
        });
        timerRef.current = null;
      }, 2000);
    }
  };

  return (
    <div className="gilbling-button-group">
      <button
        id="table-export-btn"
        type="button"
        className={buttonClass}
        onClick={() => handleButtonClick(onExport, setExportBtn, exportTimerRef)}
      >
        <TableExportIcon isSuccess={exportBtn.isSuccess} />
        <span className="gilbling-btn-text">{EXPORT_BUTTON_TEXT}</span>
      </button>
      <button
        id="table-markdown-btn"
        type="button"
        className={buttonClass}
        onClick={() =>
          handleButtonClick(onCopyMarkdown, setMarkdownBtn, markdownTimerRef)
        }
      >
        <MarkdownExportIcon isSuccess={markdownBtn.isSuccess} />
        <span className="gilbling-btn-text">{MARKDOWN_BUTTON_TEXT}</span>
      </button>
    </div>
  );
};

ExportButton.displayName = "ExportButton";
