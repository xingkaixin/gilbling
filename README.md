## Gilbling 增强插件

面向聚美美数据平台的 Chrome 扩展，提供字段高亮、业务主键标识与表格导出能力，现基于 Bun + React + Vite + TypeScript + Tailwind + CRXJS 重新构建。

### 特性
- 内容脚本使用 React/TypeScript 重写，保持字段类型配色、业务主键高亮和导出按钮等核心功能。
- TailwindCSS 提供 hover 与配色增强，配合 Vite 构建输出。
- Bun + Vite 构建生成 `dist/`，可直接加载为解压扩展。

### 环境准备
```bash
bun install
```

### 常用脚本
```bash
# 启动开发构建（监听生成扩展资源）
bun run dev

# 生产构建
bun run build

# 类型检查
bun run typecheck

# 打包 zip（依赖 dist）
./build.sh
```

### Chrome 加载方式
1. 运行 `bun run build` 或 `./build.sh` 生成 `dist/`。
2. 打开 `chrome://extensions/`，启用开发者模式。
3. 选择“加载已解压的扩展程序”，指向 `dist/` 目录。

### 目录概览
```
src/
  contentScript/
    components/ExportButton.tsx    导出按钮组件
    enhance.tsx                    内容脚本主逻辑
    index.tsx                      内容脚本入口
    index.css                      Tailwind 样式入口
  manifest.ts                      CRXJS manifest 定义
```

### 注意事项
- `src/manifest.ts` 负责生成最终 manifest，无需手动编辑根目录 `manifest.json`。
- `build.sh` 会调用 Bun/Vite 构建并输出 zip 包。
- 提交前建议运行 `bun run typecheck` 与 `bun run build` 保证结果有效。
