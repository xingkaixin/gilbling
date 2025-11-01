import { type FC } from "react";

type ExportButtonProps = {
  onExport: () => void;
  onCopyMarkdown: () => void;
};

export const ExportButton: FC<ExportButtonProps> = ({
  onExport,
  onCopyMarkdown,
}) => {
  const buttonClass = "gilbling-btn";

  return (
    <div className="gilbling-button-group">
      <button
        id="table-export-btn"
        type="button"
        className={buttonClass}
        onClick={onExport}
      >
        导出表格
      </button>
      <button
        id="table-markdown-btn"
        type="button"
        className={buttonClass}
        onClick={onCopyMarkdown}
      >
        导出页面为 Markdown
      </button>
    </div>
  );
};

ExportButton.displayName = "ExportButton";
