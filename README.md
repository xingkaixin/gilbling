## Gilbling 增强插件


![brand](design/jumeimei-logo/jumeimei-logo-showcase.png)

面向聚美美数据平台的 Chrome 扩展，提供字段高亮、业务主键标识与表格导出能力，现基于 Bun + React + WXT + TypeScript + Tailwind 重新构建。

### 特性
- 内容脚本使用 React/TypeScript 重写，保持字段类型配色、业务主键高亮和导出按钮等核心功能。
- **字段类型着色自定义**：支持自定义5种字段类型的颜色（数值、字符串、日期时间、二进制、布尔类型），提供实时预览与一键恢复默认。
- TailwindCSS 提供 hover 与配色增强，配合 WXT 构建输出。
- Bun + WXT 构建会在 `dist/chrome-mv3/` 生成解压扩展，并在 `dist/` 输出 zip 包。

### 环境准备
```bash
bun install
```

### 常用脚本
```bash
# 启动开发模式
bun run dev

# 生产构建
bun run build

# 生成 zip
bun run zip

# 类型检查
bun run typecheck
```

### Chrome 加载方式
1. 运行 `bun run build` 生成 `dist/chrome-mv3/`，或运行 `bun run zip` 在 `dist/` 下生成 zip 包。
2. 打开 `chrome://extensions/`，启用开发者模式。
3. 选择“加载已解压的扩展程序”，指向 `dist/chrome-mv3/` 目录。

### 目录概览
```
entrypoints/
  background.ts                    WXT background 入口
  gildata.content.ts               WXT content script 入口
  popup/
    index.html                     WXT popup 页面
    main.tsx                       Popup 挂载入口
src/
  contentScript/
    components/ExportButton.tsx    导出按钮组件
    enhance.tsx                    内容脚本主逻辑（字段着色、业务主键标识）
    index.css                      Tailwind 样式入口
  popup/
    index.tsx                      Popup 配置界面（字段着色开关、自定义颜色）
  storage/
    config.ts                      配置存储逻辑（字段着色配置）
  background/
    requestBlocking.ts             DNR 规则同步逻辑
wxt.config.ts                      WXT 配置与 manifest 公共字段
```

### 注意事项
- manifest 公共字段统一收口在 `wxt.config.ts`，content script / popup / background 的入口声明位于 `entrypoints/`。
- `bun run zip` 会直接在 `dist/` 产出压缩包，不再使用单独的 `package/` 目录。
- 首次安装依赖后会执行 `wxt prepare` 生成 `.wxt/` 辅助文件。
- 提交前建议运行 `bun run typecheck`、`bun run build` 与 `bun run zip` 保证结果有效。
