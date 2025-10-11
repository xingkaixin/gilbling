#!/bin/bash

# 聚美美插件打包脚本
set -euo pipefail

ROOT_DIR=$(cd "$(dirname "$0")" && pwd)
PLUGIN_NAME="gilbing"
DIST_DIR="$ROOT_DIR/dist"

echo "开始构建 ${PLUGIN_NAME}..."

rm -rf "$DIST_DIR" "${ROOT_DIR}"/*.zip

cd "$ROOT_DIR"
bun run build

VERSION=$(bun -e "console.log(JSON.parse(await Bun.file('${DIST_DIR}/manifest.json').text()).version)")
ZIP_NAME="${PLUGIN_NAME}-v${VERSION}.zip"

echo "🔄 构建完成，开始打包 ${PLUGIN_NAME} v${VERSION}..."

if [ ! -d "$DIST_DIR" ]; then
  echo "❌ 构建失败，未找到 dist 目录" >&2
  exit 1
fi

cd "$DIST_DIR"
zip -r "${ROOT_DIR}/$ZIP_NAME" .

echo "✅ 打包完成: $ZIP_NAME"
echo "📦 输出目录: dist"