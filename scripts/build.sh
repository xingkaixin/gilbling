#!/bin/bash

set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "$0")" && pwd)
ROOT_DIR=$(cd "$SCRIPT_DIR/.." && pwd)
PLUGIN_NAME="gilbing"
DIST_DIR="$ROOT_DIR/dist"
PACKAGE_DIR="$ROOT_DIR/package"

echo "开始构建 ${PLUGIN_NAME}..."

rm -rf "$DIST_DIR" "$PACKAGE_DIR"
mkdir -p "$PACKAGE_DIR"

cd "$ROOT_DIR"
bun run build

if [ ! -d "$DIST_DIR" ]; then
  echo "构建失败，未找到 dist 目录" >&2
  exit 1
fi

VERSION=$(bun -e "console.log(JSON.parse(await Bun.file('${DIST_DIR}/manifest.json').text()).version)")
ZIP_NAME="${PLUGIN_NAME}-v${VERSION}.zip"

echo "构建完成，开始打包 ${PLUGIN_NAME} v${VERSION}..."

cd "$DIST_DIR"
zip -r "$PACKAGE_DIR/$ZIP_NAME" .

echo "打包完成: $ZIP_NAME"
echo "输出目录: package"
