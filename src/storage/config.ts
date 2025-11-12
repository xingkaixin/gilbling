/**
 * 字段着色配置存储
 */

export interface FieldColorConfig {
  enabled: boolean
}

const STORAGE_KEY = 'fieldColorConfig'

const DEFAULT_CONFIG: FieldColorConfig = {
  enabled: true, // 默认开启
}

/**
 * 获取字段着色配置
 */
export async function getFieldColorConfig(): Promise<FieldColorConfig> {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, (result) => {
      resolve(result[STORAGE_KEY] || DEFAULT_CONFIG)
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
