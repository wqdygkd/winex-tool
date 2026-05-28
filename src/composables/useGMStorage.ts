/**
 * GM Storage Composable
 */

interface UseGMStorageOptions<T> {
  autoSave?: boolean
  deep?: boolean
  reset?: (data: Ref<T>) => void
}

interface UseGMStorageReturn<T> {
  data: Ref<T>
  save: () => void
  reset: () => void
}

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