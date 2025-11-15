import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  getFieldColorConfig,
  setFieldColorConfig,
  type FieldColorConfig,
  type FieldType,
} from "../storage/config";

// 默认颜色映射（与contentScript保持一致）
const DEFAULT_FIELD_COLORS: Record<FieldType, string> = {
  numeric: "#0000FF",
  string: "#008000",
  datetime: "#FF8C00",
  binary: "#800080",
  boolean: "#DC143C",
};

const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  numeric: "数值类型",
  string: "字符串类型",
  datetime: "日期时间类型",
  binary: "二进制类型",
  boolean: "布尔类型",
};

const Popup: React.FC = () => {
  const [config, setConfig] = useState<FieldColorConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showCustomColors, setShowCustomColors] = useState(false);
  const [customColors, setCustomColors] = useState<Record<FieldType, string>>(
    DEFAULT_FIELD_COLORS,
  );

  const containerStyle: React.CSSProperties = {
    minWidth: "320px",
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

  // 自定义颜色相关样式
  const customColorsContainerStyle: React.CSSProperties = {
    marginTop: "16px",
    paddingTop: "16px",
    borderTop: "1px solid #e5e7eb",
  };

  const customColorsHeaderStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "12px",
  };

  const toggleCustomButtonStyle: React.CSSProperties = {
    background: "none",
    border: "none",
    color: "#2563eb",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    padding: "4px 8px",
  };

  const colorItemStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0",
    borderBottom: "1px solid #f3f4f6",
  };

  const colorItemLastStyle: React.CSSProperties = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 0 0 0",
  };

  const colorLabelStyle: React.CSSProperties = {
    fontSize: "14px",
    color: "#374151",
    flex: 1,
  };

  const colorPreviewStyle: React.CSSProperties = {
    width: "24px",
    height: "24px",
    borderRadius: "4px",
    border: "1px solid #e5e7eb",
    marginRight: "8px",
    display: "inline-block",
  };

  const colorGroupStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
  };

  const colorValueStyle: React.CSSProperties = {
    fontSize: "12px",
    color: "#6b7280",
    marginRight: "12px",
  };

  const colorActionButtonGroupStyle: React.CSSProperties = {
    display: "flex",
    gap: "8px",
    marginTop: "16px",
    justifyContent: "space-between",
  };

  const saveCustomButtonStyle: React.CSSProperties = {
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "background-color 0.2s",
    flex: 1,
  };

  const resetCustomButtonStyle: React.CSSProperties = {
    backgroundColor: "#6b7280",
    color: "#ffffff",
    border: "none",
    borderRadius: "6px",
    padding: "6px 12px",
    fontSize: "13px",
    cursor: "pointer",
    fontWeight: 500,
    transition: "background-color 0.2s",
    marginRight: "8px",
  };

  // 加载配置
  useEffect(() => {
    getFieldColorConfig()
      .then((cfg) => {
        setConfig(cfg);
        // 初始化自定义颜色（优先使用已保存的配置，否则使用默认值）
        const savedColors: Record<FieldType, string> = { ...DEFAULT_FIELD_COLORS };
        if (cfg.customColors) {
          Object.entries(cfg.customColors).forEach(([type, color]) => {
            if (color) {
              savedColors[type as FieldType] = color;
            }
          });
        }
        setCustomColors(savedColors);
        setLoading(false);
      })
      .catch((error) => {
        console.error("加载配置失败:", error);
        setConfig({ enabled: true });
        setCustomColors(DEFAULT_FIELD_COLORS);
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

  // 颜色选择器：打开自定义颜色面板
  const handleToggleCustomColors = () => {
    setShowCustomColors(!showCustomColors);
  };

  // 修改颜色
  const handleColorChange = (fieldType: FieldType, color: string) => {
    const newColors = { ...customColors, [fieldType]: color };
    setCustomColors(newColors);
  };

  // 恢复默认颜色
  const handleResetColors = () => {
    setCustomColors({ ...DEFAULT_FIELD_COLORS });
  };

  // 保存自定义颜色
  const handleSaveCustomColors = async () => {
    if (!config) return;

    // 只保存与默认值不同的颜色
    const customColorsToSave: Partial<Record<FieldType, string>> = {};
    Object.entries(customColors).forEach(([type, color]) => {
      const fieldType = type as FieldType;
      if (color !== DEFAULT_FIELD_COLORS[fieldType]) {
        customColorsToSave[fieldType] = color;
      }
    });

    const newConfig: FieldColorConfig = {
      ...config,
      customColors: Object.keys(customColorsToSave).length > 0 ? customColorsToSave : undefined,
    };

    setSaving(true);
    setSaveSuccess(false);
    setConfig(newConfig);

    try {
      await setFieldColorConfig(newConfig);
      setSaving(false);
      setSaveSuccess(true);
      setShowCustomColors(false);

      // 5秒后隐藏成功提示
      setTimeout(() => {
        setSaveSuccess(false);
      }, 5000);
    } catch (error) {
      console.error("保存自定义颜色失败:", error);
      setSaving(false);
      // 恢复原来的配置
      getFieldColorConfig().then((cfg) => {
        setConfig(cfg);
        const savedColors: Record<FieldType, string> = { ...DEFAULT_FIELD_COLORS };
        if (cfg.customColors) {
          Object.entries(cfg.customColors).forEach(([type, color]) => {
            if (color) {
              savedColors[type as FieldType] = color;
            }
          });
        }
        setCustomColors(savedColors);
      });
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

        {/* Custom Colors Section */}
        <div style={customColorsContainerStyle}>
          <div style={customColorsHeaderStyle}>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#374151" }}>自定义配色</div>
            <button
              style={toggleCustomButtonStyle}
              onClick={handleToggleCustomColors}
              type="button"
            >
              {showCustomColors ? "收起" : "展开"}
            </button>
          </div>

          {showCustomColors && (
            <div>
              {Object.entries(DEFAULT_FIELD_COLORS).map(([type, defaultColor], index) => {
                const fieldType = type as FieldType;
                const currentColor = customColors[fieldType];
                const isLast = index === Object.keys(DEFAULT_FIELD_COLORS).length - 1;

                return (
                  <div key={fieldType} style={isLast ? colorItemLastStyle : colorItemStyle}>
                    <div style={colorLabelStyle}>{FIELD_TYPE_LABELS[fieldType]}</div>
                    <div style={colorGroupStyle}>
                      <span style={colorValueStyle}>{currentColor}</span>
                      <span style={{ ...colorPreviewStyle, backgroundColor: currentColor }}></span>
                      <input
                        type="color"
                        value={currentColor}
                        onChange={(e) => handleColorChange(fieldType, e.target.value)}
                        style={{ width: "40px", height: "28px", border: "1px solid #d1d5db", borderRadius: "4px" }}
                      />
                    </div>
                  </div>
                );
              })}

              <div style={colorActionButtonGroupStyle}>
                <button
                  style={resetCustomButtonStyle}
                  onClick={handleResetColors}
                  onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#4b5563"; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#6b7280"; }}
                  type="button"
                >
                  恢复默认
                </button>
                <button
                  style={saveCustomButtonStyle}
                  onClick={handleSaveCustomColors}
                  onMouseOver={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#059669"; }}
                  onMouseOut={(e) => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#10b981"; }}
                  type="button"
                >
                  应用保存
                </button>
              </div>
            </div>
          )}
        </div>

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
