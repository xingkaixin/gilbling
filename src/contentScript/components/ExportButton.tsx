import { type FC, useState, type MouseEvent } from "react";

type ExportButtonProps = {
  onExport: () => Promise<boolean>;
  onCopyMarkdown: () => Promise<boolean>;
};

type ButtonState = {
  isSuccess: boolean;
  text: string;
};

export const ExportButton: FC<ExportButtonProps> = ({
  onExport,
  onCopyMarkdown,
}) => {
  const buttonClass = "gilbling-btn";

  const [exportBtn, setExportBtn] = useState<ButtonState>({
    isSuccess: false,
    text: "导出表格为TSV",
  });

  const [markdownBtn, setMarkdownBtn] = useState<ButtonState>({
    isSuccess: false,
    text: "导出页面为Markdown",
  });

  const handleButtonClick = async (
    event: MouseEvent<HTMLButtonElement>,
    callback: () => Promise<boolean>,
    setState: React.Dispatch<React.SetStateAction<ButtonState>>,
  ) => {
    const originalText = event.currentTarget.textContent || "";
    const success = await callback();

    if (success) {
      setState({
        isSuccess: true,
        text: "✓ 已复制",
      });

      setTimeout(() => {
        setState({
          isSuccess: false,
          text: originalText,
        });
      }, 2000);
    }
  };

  return (
    <div className="gilbling-button-group">
      <button
        id="table-export-btn"
        type="button"
        className={buttonClass}
        onClick={(e) => handleButtonClick(e, onExport, setExportBtn)}
      >
        <svg className="gilbling-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 3h18v18H3zM3 9h18M9 3v18M3 15h18" />
        </svg>
        <span className="gilbling-btn-text">{exportBtn.text}</span>
      </button>
      <button
        id="table-markdown-btn"
        type="button"
        className={buttonClass}
        onClick={(e) => handleButtonClick(e, onCopyMarkdown, setMarkdownBtn)}
      >
        <svg className="gilbling-btn-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" y1="13" x2="8" y2="13" />
          <line x1="16" y1="17" x2="8" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <span className="gilbling-btn-text">{markdownBtn.text}</span>
      </button>
    </div>
  );
};

ExportButton.displayName = "ExportButton";
