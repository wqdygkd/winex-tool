/**
 * GM Storage Composable
 */

interface UseGMStorageOptions {
  autoSave?: boolean
  deep?: boolean
}

interface UseGMStorageReturn<T> {
  data: Ref<T>
  save: () => void
}

export function useGMStorage<T>(
  key: string,
  defaultValue: T,
  options?: UseGMStorageOptions,
): UseGMStorageReturn<T> {
  const { autoSave = true, deep = true } = options ?? {}

  const data = ref<T>(GM_getValue(key, defaultValue)) as Ref<T>

  function save() {
    GM_setValue(key, data.value)
  }

  if (autoSave) {
    watch(data, save, { deep })
  }

  return { data, save }
}

export function useGMStorageWithEnable<T extends { enable: boolean }>(
  key: string,
  defaultValue: T,
): {
  data: Ref<T>
  enable: Ref<boolean>
  save: () => void
} {
  const { data, save } = useGMStorage(key, defaultValue)

  const enable = computed({
    get: () => data.value.enable,
    set: (val) => {
      data.value.enable = val
    },
  })

  return { data, enable, save }
}
