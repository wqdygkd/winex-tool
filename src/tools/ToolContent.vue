<script setup lang="ts">
import EventMock from './eventMock'
import HotkeyPatch from './hotkey-patch'
import Others from './others'
import ParamMock from './param-mock'
import StorageCopy from './storage-copy'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})
</script>

<template>
  <el-dialog v-model="dialogVisible" title="设置" width="80%" draggable :modal="false" :close-on-click-modal="false" modal-class="wqdy-custom-dialog">
    <el-container style="height: 600px">
      <el-tabs tab-position="left">
        <el-tab-pane :label="EventMock.name">
          <EventMock />
        </el-tab-pane>
        <el-tab-pane :label="StorageCopy.name">
          <StorageCopy />
        </el-tab-pane>
        <el-tab-pane :label="ParamMock.name">
          <ParamMock />
        </el-tab-pane>
        <el-tab-pane :label="Others.name">
          <Others />
        </el-tab-pane>
        <el-tab-pane :label="HotkeyPatch.name">
          <HotkeyPatch />
        </el-tab-pane>
      </el-tabs>
    </el-container>
  </el-dialog>
</template>

<style scoped lang="scss"></style>

<style lang="scss">
.wqdy-custom-dialog {
  pointer-events: none;
  .wqdy-overlay-dialog {
    pointer-events: none;
  }
  .wqdy-dialog {
    pointer-events: auto;
  }
  .wqdy-tabs--left {
    width: 100%;
  }
}
</style>
