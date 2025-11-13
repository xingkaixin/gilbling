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
        {exportBtn.text}
      </button>
      <button
        id="table-markdown-btn"
        type="button"
        className={buttonClass}
        onClick={(e) => handleButtonClick(e, onCopyMarkdown, setMarkdownBtn)}
      >
        {markdownBtn.text}
      </button>
    </div>
  );
};

ExportButton.displayName = "ExportButton";
