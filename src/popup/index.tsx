import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  getFieldColorConfig,
  setFieldColorConfig,
  type FieldColorConfig,
} from "../storage/config";

const Popup: React.FC = () => {
  const [config, setConfig] = useState<FieldColorConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const containerStyle: React.CSSProperties = {
    minWidth: "280px",
    backgroundColor: "#ffffff",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    overflow: "hidden",
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
    margin: 0,
  };

  const headerStyle: React.CSSProperties = {
    padding: "12px 16px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    borderBottom: "1px solid #1d4ed8",
  };

  const headerContentStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const contentStyle: React.CSSProperties = {
    padding: "16px",
  };

  const statusContainerStyle: React.CSSProperties = {
    textAlign: "center",
    marginBottom: "16px",
  };

  const statusStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: "8px",
    fontSize: "14px",
    color: "#374151",
  };

  const statusIndicatorStyle: React.CSSProperties = {
    width: "8px",
    height: "8px",
    borderRadius: "9999px",
    backgroundColor: config?.enabled ? "#10b981" : "#9ca3af",
  };

  const footerStyle: React.CSSProperties = {
    borderTop: "1px solid #e5e7eb",
    paddingTop: "12px",
    marginTop: "16px",
  };

  const descriptionStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "center",
    marginBottom: "12px",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "8px 12px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: 500,
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "background-color 0.2s",
  };

  const buttonHoverStyle = {
    backgroundColor: "#1d4ed8",
  };

  const buttonIconStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
    marginRight: "6px",
  };

  const spinnerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "16px 0",
  };

  const spinnerCircleStyle: React.CSSProperties = {
    width: "16px",
    height: "16px",
    border: "2px solid #e5e7eb",
    borderTopColor: "#2563eb",
    borderRadius: "9999px",
    animation: "spin 1s linear infinite",
  };

  const toggleContainerStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "12px",
    backgroundColor: "#f9fafb",
    borderRadius: "6px",
    marginBottom: "16px",
  };

  const toggleLabelStyle: React.CSSProperties = {
    fontSize: "14px",
    fontWeight: 500,
    color: "#111827",
  };

  const toggleWrapperStyle: React.CSSProperties = {
    position: "relative",
    display: "inline-block",
    width: "50px",
    height: "24px",
  };

  const toggleInputStyle: React.CSSProperties = {
    opacity: 0,
    width: 0,
    height: 0,
  };

  const toggleSliderStyle: React.CSSProperties = {
    position: "absolute",
    cursor: "pointer",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: config?.enabled ? "#2563eb" : "#d1d5db",
    transition: "background-color 0.2s",
    borderRadius: "24px",
  };

  const toggleSliderBeforeStyle: React.CSSProperties = {
    position: "absolute",
    content: '""',
    height: "18px",
    width: "18px",
    left: config?.enabled ? "26px" : "3px",
    bottom: "3px",
    backgroundColor: "white",
    transition: ".2s",
    borderRadius: "50%",
  };

  const statusTextStyle: React.CSSProperties = {
    fontSize: "13px",
    marginLeft: "8px",
    fontWeight: 500,
    color: config?.enabled ? "#10b981" : "#6b7280",
  };

  const savingStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#6b7280",
    textAlign: "center",
    marginTop: "8px",
  };

  const successStyle: React.CSSProperties = {
    ...savingStyle,
    color: "#10b981",
    fontWeight: 500,
  };

  // 加载配置
  useEffect(() => {
    getFieldColorConfig()
      .then((cfg) => {
        setConfig(cfg);
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载配置失败:", error);
        setConfig({ enabled: true });
        setLoading(false);
      });
  }, []);

  // 切换配置
  const handleToggle = async (checked: boolean) => {
    if (!config) return;

    const newConfig = { ...config, enabled: checked };
    setConfig(newConfig);
    setSaving(true);
    setSaveSuccess(false);

    try {
      await setFieldColorConfig(newConfig);
      setSaving(false);
      setSaveSuccess(true);

      // 3秒后隐藏成功提示
      setTimeout(() => {
        setSaveSuccess(false);
      }, 3000);
    } catch (error) {
      console.error("保存配置失败:", error);
      setSaving(false);
      // 恢复原来的配置
      setConfig(config);
    }
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <div style={spinnerStyle}>
          <div style={spinnerCircleStyle}></div>
        </div>
        <style>
          {`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}
        </style>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <style>
        {`
          @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
          .popup-button:hover { background-color: ${buttonHoverStyle.backgroundColor}; }
        `}
      </style>

      {/* Header */}
      <div style={headerStyle}>
        <div style={headerContentStyle}>
          <svg style={{ width: "20px", height: "20px", fill: "currentColor" }} viewBox="0 0 20 20">
            <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
          </svg>
          <h1 style={{ fontSize: "14px", fontWeight: 600, margin: 0 }}>聚美美插件</h1>
        </div>
      </div>

      {/* Content */}
      <div style={contentStyle}>
        {/* Toggle Switch */}
        <div style={toggleContainerStyle}>
          <div style={toggleLabelStyle}>字段类型着色</div>
          <label style={toggleWrapperStyle}>
            <input
              type="checkbox"
              style={toggleInputStyle}
              checked={!!config?.enabled}
              onChange={(e) => handleToggle(e.target.checked)}
            />
            <span style={toggleSliderStyle}>
              <span style={toggleSliderBeforeStyle}></span>
            </span>
          </label>
        </div>

        {/* Save Status */}
        {saving && <div style={savingStyle}>保存中...</div>}
        {saveSuccess && <div style={successStyle}>✓ 设置已保存</div>}

        <div style={footerStyle}>
          <p style={descriptionStyle}>
            立即生效，刷新数据字典页面查看效果
          </p>
        </div>
      </div>
    </div>
  );
};

// 挂载 React 应用
const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<Popup />);
}
