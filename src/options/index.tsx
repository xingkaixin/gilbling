import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  getFieldColorConfig,
  setFieldColorConfig,
  type FieldColorConfig,
} from "../storage/config";

const OptionsPage: React.FC = () => {
  const [config, setConfig] = useState<FieldColorConfig | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // 加载配置
  useEffect(() => {
    getFieldColorConfig().then((cfg) => {
      setConfig(cfg);
    });
  }, []);

  // 切换设置
  const handleToggle = (checked: boolean) => {
    if (config) {
      const newConfig = { ...config, enabled: checked };
      setConfig(newConfig);
      setHasChanges(true);

      // 自动保存
      setFieldColorConfig(newConfig).then(() => {
        setHasChanges(false);

        // 显示保存成功提示
        showSaveIndicator();
      });
    }
  };

  // 显示保存指示器
  const showSaveIndicator = () => {
    const indicator = document.createElement('div');
    indicator.textContent = '设置已保存';
    indicator.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #10B981;
      color: white;
      padding: 12px 20px;
      border-radius: 6px;
      font-size: 14px;
      z-index: 1000;
      animation: slideIn 0.3s ease, fadeOut 0.3s ease 1.7s;
    `;

    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    document.head.appendChild(style);
    document.body.appendChild(indicator);

    // 2秒后移除
    setTimeout(() => {
      indicator.remove();
      style.remove();
    }, 2000);
  };

  if (!config) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-8 py-6 border-b border-gray-200">
            <h1 className="text-2xl font-bold text-gray-900">数据字典插件设置</h1>
            <p className="mt-2 text-sm text-gray-600">自定义插件的行为和外观</p>
          </div>

          <div className="p-8">
            <div className="space-y-6">
              {/* 字段类型着色开关 */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">字段类型着色</h3>
                  <p className="mt-1 text-sm text-gray-600">
                    根据字段类型显示不同颜色（如数字类型显示蓝色、字符串类型显示绿色等）
                  </p>
                </div>
                <div className="ml-4">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={config.enabled}
                      onChange={(e) => handleToggle(e.target.checked)}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {/* 预览示例 */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="text-sm font-medium text-gray-900 mb-4">着色效果预览</h4>
                <div className="space-y-3">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 w-24">数字类型：</span>
                    <span
                      className={`font-mono text-sm ${
                        config.enabled ? "text-blue-600" : "text-gray-900"
                      }`}
                    >
                      int(11)
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 w-24">字符串类型：</span>
                    <span
                      className={`font-mono text-sm ${
                        config.enabled ? "text-green-600" : "text-gray-900"
                      }`}
                    >
                      varchar(100)
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600 w-24">日期类型：</span>
                    <span
                      className={`font-mono text-sm ${
                        config.enabled ? "text-orange-600" : "text-gray-900"
                      }`}
                    >
                      datetime
                    </span>
                  </div>
                </div>
              </div>

              {/* 提示信息 */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">设置生效说明</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>修改此设置后，请刷新数据字典页面以查看效果（如果页面已打开）。</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 底部信息 */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>数据字典美化插件 v1.2.0</p>
        </div>
      </div>

      {/* 保存指示器 */}
      {hasChanges && (
        <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          保存中...
        </div>
      )}
    </div>
  );
};

// 挂载 React 应用
const container = document.getElementById("app");
if (container) {
  const root = createRoot(container);
  root.render(<OptionsPage />);
}
