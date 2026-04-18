/**
 * GM Storage Composable
 * 统一的油猴存储逻辑封装
 */

interface UseGMStorageOptions<T> {
  /** 是否自动持久化，默认 true */
  autoSave?: boolean
  /** 深度监听，默认 true */
  deep?: boolean
  /** 重置函数 - 仅对象类型提供 */
  reset?: (data: Ref<T>) => void
}

interface UseGMStorageReturn<T> {
  /** 存储数据的 ref */
  data: Ref<T>
  /** 手动保存方法 */
  save: () => void
  /** 重置到默认值 */
  reset: () => void
}

/**
 * 统一的存储函数
 * - 简单值：自动持久化
 * - 对象：支持属性直接修改 + 重置
 */
export function useGMStorage<T>(
  key: string,
  defaultValue: T,
  options?: UseGMStorageOptions<T>,
): UseGMStorageReturn<T> {
  const { autoSave = true, deep = true } = options ?? {}

  const data = ref<T>(GM_getValue(key, defaultValue)) as Ref<T>

  function save() {
    GM_setValue(key, data.value)
  }

  function reset() {
    if (typeof defaultValue === 'object' && defaultValue !== null) {
      data.value = JSON.parse(JSON.stringify(defaultValue))
    } else {
      data.value = defaultValue as T
    }
    save()
  }

  if (autoSave) {
    watch(data, save, { deep })
  }

  return { data, save, reset }
}

/**
 * 带 enable 开关的存储 - 简化版本
 */
export function useGMStorageWithEnable<T extends { enable: boolean }>(
  key: string,
  defaultValue: T,
): {
  data: Ref<T>
  enable: Ref<boolean>
  save: () => void
  reset: () => void
  toggle: () => void
} {
  const { data, save, reset } = useGMStorage(key, defaultValue)

  const enable = computed({
    get: () => data.value.enable,
    set: (val) => {
      data.value.enable = val
    },
  })

  function toggle() {
    enable.value = !enable.value
  }

  return { data, enable, save, reset, toggle }
}