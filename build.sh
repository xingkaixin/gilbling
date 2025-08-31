#!/bin/bash

# 聚美美插件打包脚本
set -e

PLUGIN_NAME="聚美美"
VERSION=$(grep '"version"' manifest.json | cut -d'"' -f4)
BUILD_DIR="build"
ZIP_NAME="${PLUGIN_NAME}-v${VERSION}.zip"

echo "开始打包 ${PLUGIN_NAME} v${VERSION}..."

# 清理旧构建
rm -rf "$BUILD_DIR"
rm -f *.zip

# 创建构建目录
mkdir "$BUILD_DIR"

# 复制核心文件 - manifest.json定义的就是全部
cp manifest.json "$BUILD_DIR/"
cp enhance.js "$BUILD_DIR/"
cp enhance.css "$BUILD_DIR/"

# 打包
cd "$BUILD_DIR"
zip -r "../$ZIP_NAME" .
cd ..

# 清理构建目录
rm -rf "$BUILD_DIR"

echo "✅ 打包完成: $ZIP_NAME"
echo "📦 包含文件: manifest.json, enhance.js, enhance.css"