<script setup lang="ts">
// import Console from './console.vue'
// import Info from './info.vue'
// import Card from '../components/card.vue'
// import CustomPage from './tools/CustomPage/index.vue'
import EventMock from './eventMock'
import Others from './others'
// import WinSearchHistory from './WinSearchHistory.vue'
import StorageCopy from './storage-copy'

const props = defineProps({
  modelValue: Boolean,
})

const emit = defineEmits(['update:modelValue'])

const dialogVisible = computed({
  get() {
    return props.modelValue
  },
  set(val) {
    emit('update:modelValue', val)
  },
})

// const contomPageListKey = 'GM_hook_winex.contomPageList'
</script>

<template>
  <el-dialog v-model="dialogVisible" title="设置" width="80%" draggable :modal="false" :close-on-click-modal="false" modal-class="wqdy-custom-dialog">
    <el-container style="height: 600px" class="container">
      <el-tabs tab-position="left">
        <el-tab-pane :label="EventMock.name">
          <EventMock />
        </el-tab-pane>
        <!-- <el-tab-pane label="信息">
          <Info />
        </el-tab-pane> -->
        <el-tab-pane label="医保卡">
          <Suspense>
            <!-- <Card identity-type-code="152691" /> -->
          </Suspense>
        </el-tab-pane>
        <!-- <el-tab-pane label="磁卡">
          <Suspense>
            <Card identityTypeCode="152690"></Card>
          </Suspense>
        </el-tab-pane> -->
        <!-- <el-tab-pane label="电子健康卡">
          <Suspense>
            <Card identityTypeCode="256808"></Card>
          </Suspense>
        </el-tab-pane> -->
        <!-- <el-tab-pane label="身份证">
          <Suspense>
            <Card identityTypeCode="152695"></Card>
          </Suspense>
        </el-tab-pane> -->
        <!-- <el-tab-pane label="永居证">
          <Suspense>
            <Card identityTypeCode="399668724"></Card>
          </Suspense>
        </el-tab-pane> -->
        <el-tab-pane :label="StorageCopy.name">
          <StorageCopy />
        </el-tab-pane>
        <!-- <el-tab-pane label="自定义页面"> -->
        <!-- <CustomPage></CustomPage> -->
        <!-- </el-tab-pane> -->
        <el-tab-pane :label="Others.name">
          <Others />
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
