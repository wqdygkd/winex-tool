<script setup lang="ts">
import type { RequestModifyRule } from '~/types'
import { HTTP_METHODS, URL_MATCH_TYPE_OPTIONS } from '~/composables/useRequestModify'
import HeaderOpsTable from './HeaderOpsTable.vue'
import ResponseModifySection from './ResponseModifySection.vue'

const props = defineProps<{
  visible: boolean
  rule: RequestModifyRule | null
}>()

const emit = defineEmits<{
  'update:visible': [value: boolean]
  save: []
  addHeaderOp: []
  deleteHeaderOp: [index: number]
  'update:responseModify': [value: any]
  addResponseOp: []
  deleteResponseOp: [index: number]
}>()

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit('update:visible', val),
})
</script>

<template>
  <el-dialog
    v-model="dialogVisible"
    title="编辑规则"
    width="750px"
    :close-on-click-modal="false"
    :lock-scroll="false"
  >
    <div v-if="rule" class="edit-form">
      <div class="form-row">
        <label class="form-label">URL匹配方式</label>
        <el-select v-model="rule.urlMatchType" style="width: 120px">
          <el-option
            v-for="item in URL_MATCH_TYPE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </div>

      <div class="form-row">
        <label class="form-label">URL匹配规则</label>
        <el-input
          v-model="rule.urlPattern"
          placeholder="输入URL或正则表达式"
          style="flex: 1"
        />
      </div>

      <div class="form-row">
        <label class="form-label">请求方法</label>
        <el-checkbox-group v-model="rule.methods">
          <el-checkbox v-for="method in HTTP_METHODS" :key="method" :value="method">
            {{ method }}
          </el-checkbox>
        </el-checkbox-group>
      </div>

      <div class="form-row">
        <label class="form-label">备注</label>
        <el-input
          v-model="rule.remark"
          placeholder="输入备注信息"
          style="flex: 1"
        />
      </div>

      <HeaderOpsTable
        :header-ops="rule.headerOps"
        @add="emit('addHeaderOp')"
        @delete="(i) => emit('deleteHeaderOp', i)"
      />

      <ResponseModifySection
        :response-modify="rule.responseModify"
        @update:response-modify="(v) => emit('update:responseModify', v)"
        @add-op="emit('addResponseOp')"
        @delete-op="(i) => emit('deleteResponseOp', i)"
      />
    </div>

    <template #footer>
      <el-button @click="dialogVisible = false">
        取消
      </el-button>
      <el-button type="primary" @click="emit('save')">
        保存
      </el-button>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss">
.edit-form {
  .form-row {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }

  .form-label {
    width: 100px;
    flex-shrink: 0;
    font-size: 14px;
    color: #334155;
    font-weight: 500;
  }
}

:deep(.wqdy-checkbox-group) {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

:deep(.wqdy-dialog__body) {
  padding: 20px 24px;
}
</style>