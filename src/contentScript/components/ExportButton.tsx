import { type FC } from "react";

type ExportButtonProps = {
  onExport: () => void;
};

const buttonClasses =
  "group inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-2.5 text-sm font-medium text-white shadow transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400 active:translate-y-0 active:scale-95";

export const ExportButton: FC<ExportButtonProps> = ({ onExport }) => (
  <button id="table-export-btn" type="button" className={buttonClasses} onClick={onExport}>
    <svg
      className="h-4 w-4 text-white transition-transform duration-200 group-hover:translate-y-[-1px]"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" strokeWidth="2" />
      <path d="m14 2 6 6" stroke="currentColor" strokeWidth="2" />
      <path d="M16 13H8" stroke="currentColor" strokeWidth="2" />
      <path d="M16 17H8" stroke="currentColor" strokeWidth="2" />
      <path d="M10 9H8" stroke="currentColor" strokeWidth="2" />
    </svg>
    导出表格
  </button>
);

ExportButton.displayName = "ExportButton";
