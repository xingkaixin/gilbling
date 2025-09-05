# 聚美美 Chrome 扩展

> 专为聚源数据字典可视化增强设计的专业 Chrome 扩展

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Chrome Web Store](https://img.shields.io/badge/Chrome-Extension-brightgreen.svg)](https://chrome.google.com/webstore)
[![Version](https://img.shields.io/badge/version-1.0-blue.svg)](https://github.com/yourusername/gilbling)

## 项目概述

聚美美是专为聚源数据字典（https://dd.gildata.com/）设计的Chrome浏览器扩展。提供专业级的数据库模式可视化增强功能，采用类似DBeaver的字段类型区分样式。

## 功能特性

### 🎨 视觉增强
- **字段类型区分**：MySQL字段类型采用不同颜色和样式显示
- **业务主键突出**：业务唯一性字段采用加粗格式显示  
- **交互悬停效果**：鼠标悬停时的平滑高亮过渡

### 🔧 技术能力
- **动态业务主键检测**：自动提取并应用业务主键样式
- **实时DOM监控**：基于MutationObserver的实时更新
- **性能优化**：高效CSS选择器，最小化资源占用

## 字段类型配色方案

| 类型分类 | 颜色 | 包含字段 |
|---------|------|----------|
| **数字类型** | 蓝色 (`#0000FF`) | `INT`, `BIGINT`, `DECIMAL`, `FLOAT`, `DOUBLE` |
| **字符串类型** | 绿色 (`#008000`) | `VARCHAR`, `CHAR`, `TEXT`, `LONGTEXT` |
| **时间类型** | 橙色 (`#FF8C00`) | `DATE`, `DATETIME`, `TIMESTAMP`, `TIME` |
| **二进制类型** | 紫色 (`#800080`) | `BLOB`, `BINARY`, `VARBINARY` |
| **布尔类型** | 红色 (`#DC143C`) | `BIT`, `BOOL`, `BOOLEAN` |

## 项目架构

### 文件结构
```
├── manifest.json          # 扩展清单文件 (v3)
├── enhance.css            # 样式定义
├── enhance.js             # 核心功能实现
├── install-guide.md       # 安装说明文档
└── README.md             # 项目说明文档
```

### 核心组件

#### JavaScript 模块 (`enhance.js`)
- **业务主键提取**：解析 `ng-bind` 属性识别业务主键
- **表格增强**：基于字段类型和业务逻辑应用CSS类
- **观察者模式**：监控DOM变化实现动态内容更新

#### 样式模块 (`enhance.css`)
- **类型样式**：为每个MySQL字段类型定义CSS类
- **业务主键强调**：边框和字体粗细修改
- **悬停交互**：平滑过渡效果

## 安装部署

### 开发模式
1. 克隆或下载扩展文件
2. 打开Chrome浏览器，访问 `chrome://extensions/`
3. 启用"开发者模式"
4. 点击"加载已解压的扩展程序"，选择扩展目录

### 生产部署
详细安装说明请参考 [install-guide.md](./install-guide.md)。

## 浏览器兼容性

| 浏览器 | 版本要求 | 支持状态 |
|--------|----------|----------|
| Chrome | 88+ | ✅ 完全支持 |
| Edge | 88+ | ✅ 完全支持 |
| Opera | 74+ | ✅ 完全支持 |

## 权限要求

扩展需要最小化权限：
- `activeTab`：访问当前标签页进行内容脚本注入
- 主机权限：`https://dd.gildata.com/*`

## 性能考量

- **轻量级**：总大小约5KB
- **非阻塞**：异步DOM操作
- **内存高效**：事件驱动架构，自动清理
- **选择器优化**：精准CSS规则，减少重排

## 开发指南

### 本地开发
```bash
# 开发模式加载扩展
1. 打开 chrome://extensions/
2. 启用开发者模式
3. 加载未打包的扩展程序
```

### 代码质量
- ES6+ JavaScript严格模式
- CSS3兼容性前缀
- Manifest v3规范合规

## 安全性

- **内容安全策略**：严格的CSP实现
- **最小权限原则**：仅授予必需权限
- **无外部依赖**：自包含代码执行
- **安全DOM操作**：XSS防护实现

## 贡献指南

1. Fork本仓库
2. 创建功能分支
3. 实现变更并进行适当测试
4. 提交详细说明的Pull Request

## 开源协议

MIT协议 - 详见 [LICENSE](LICENSE) 文件。

## 更新日志

### V1.0.2
- 代码重构，消除明显臭味
- 优化函数职责单一化


### V1.0.1
- 添加表格导出功能
- 字段类型适配Oracle、SQLServer

### v1.0.0
- 字段类型区分显示
- 业务主键高亮功能
- 悬停交互效果

## 技术支持

如需技术支持或功能请求：
- 在仓库中创建issue
- 提供浏览器版本和扩展版本信息
- 包含相关问题截图

---

**专为聚源数据字典增强而精心开发**