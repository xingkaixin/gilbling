/**
 * 字段着色配置存储
 */

// 字段类型定义
export type FieldType = 'numeric' | 'string' | 'datetime' | 'binary' | 'boolean'

export interface FieldColorConfig {
  enabled: boolean
  directoryEnabled: boolean
  groupOutlineEnabled?: boolean
  customColors?: Partial<Record<FieldType, string>>
}

const STORAGE_KEY = 'fieldColorConfig'

const DEFAULT_CONFIG: FieldColorConfig = {
  enabled: true, // 默认开启
  directoryEnabled: true,
}

/**
 * 获取字段着色配置
 */
export async function getFieldColorConfig(): Promise<FieldColorConfig> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      const storedConfig = result[STORAGE_KEY] || {}
      const directoryEnabled =
        typeof storedConfig.directoryEnabled === 'boolean'
          ? storedConfig.directoryEnabled
          : typeof storedConfig.groupOutlineEnabled === 'boolean'
            ? storedConfig.groupOutlineEnabled
            : DEFAULT_CONFIG.directoryEnabled

      resolve({
        ...DEFAULT_CONFIG,
        ...storedConfig,
        directoryEnabled,
      })
    })
  })
}

/**
 * 保存字段着色配置
 */
export async function setFieldColorConfig(config: FieldColorConfig): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [STORAGE_KEY]: config }, () => {
      resolve()
    })
  })
}
