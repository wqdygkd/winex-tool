<script setup lang="ts">
import type { RequestModifyGroup, RequestModifyStorage, HeaderOperation, RequestModifyRule, ResponseOp, ResponseModify } from '~/types'
import { useGMStorage } from '~/composables/useGMStorage'
import { storageKey } from './request-modify'

const { data: storage, save } = useGMStorage<RequestModifyStorage>(storageKey, {
  enable: false,
  groups: [],
}, { autoSave: false })

const enableModify = computed({
  get: () => storage.value.enable,
  set: (val) => {
    storage.value.enable = val
    save()
  },
})
const groups = computed(() => storage.value.groups)

const dialogVisible = ref(false)
const editingGroupId = ref<string>('')
const editingRule = ref<RequestModifyRule | null>(null)

const urlMatchTypeOptions = [
  { label: '包含', value: 'contains' },
  { label: '正则', value: 'regex' },
  { label: '精确', value: 'exact' },
]

const headerOpTypeOptions = [
  { label: '设置', value: 'set' },
  { label: '追加', value: 'append' },
  { label: '删除', value: 'delete' },
]

const responseOpTypeOptions = [
  { label: '替换字段', value: 'replace' },
  { label: '合并数据', value: 'merge' },
  { label: '整体替换', value: 'full' },
]

const modifyTypeOptions = [
  { label: '静态修改', value: 'static' },
  { label: '动态脚本', value: 'script' },
]

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

function addGroup() {
  const newGroup: RequestModifyGroup = {
    id: Date.now().toString(),
    name: `分组 ${groups.value.length + 1}`,
    enabled: true,
    rules: [],
  }
  groups.value.push(newGroup)
  save()
}

function deleteGroup(id: string) {
  storage.value.groups = groups.value.filter(g => g.id !== id)
  save()
}

function addRule(groupId: string) {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return

  const newRule: RequestModifyRule = {
    id: Date.now().toString(),
    enabled: true,
    urlPattern: '',
    urlMatchType: 'contains',
    methods: [],
    headerOps: [],
    responseModify: undefined,
    remark: '',
  }
  group.rules.push(newRule)
  save()
}

function deleteRule(groupId: string, ruleId: string) {
  const group = groups.value.find(g => g.id === groupId)
  if (!group) return

  group.rules = group.rules.filter(r => r.id !== ruleId)
  save()
}

function editRule(groupId: string, rule: RequestModifyRule) {
  editingGroupId.value = groupId
  editingRule.value = JSON.parse(JSON.stringify(rule))
  dialogVisible.value = true
}

function addHeaderOp() {
  if (!editingRule.value) return

  editingRule.value.headerOps.push({
    key: '',
    value: '',
    opType: 'set',
  })
}

function deleteHeaderOp(index: number) {
  if (!editingRule.value) return

  editingRule.value.headerOps.splice(index, 1)
}

function enableResponseModify() {
  if (!editingRule.value) return
  editingRule.value.responseModify = {
    modifyType: 'static',
    responseOps: [],
    statusCode: undefined,
    delayMs: undefined,
  }
}

function disableResponseModify() {
  if (!editingRule.value) return
  editingRule.value.responseModify = undefined
}

function addResponseOp() {
  if (!editingRule.value?.responseModify) return
  editingRule.value.responseModify.responseOps?.push({
    key: '',
    value: '',
    opType: 'replace',
  })
}

function deleteResponseOp(index: number) {
  if (!editingRule.value?.responseModify?.responseOps) return
  editingRule.value.responseModify.responseOps.splice(index, 1)
}

function saveRule() {
  if (!editingRule.value) return

  const group = groups.value.find(g => g.id === editingGroupId.value)
  if (!group) return

  const ruleIndex = group.rules.findIndex(r => r.id === editingRule.value!.id)
  if (ruleIndex !== -1) {
    group.rules[ruleIndex] = editingRule.value
  }

  save()
  dialogVisible.value = false
  editingRule.value = null
}

function getMethodDisplay(methods: RequestModifyRule['methods']): string {
  if (!methods || methods.length === 0) return '全部'
  return methods.join(', ')
}

function getHeaderOpsCount(headerOps: HeaderOperation[]): string {
  if (!headerOps || headerOps.length === 0) return '0个'
  return `${headerOps.length}个`
}

function getUrlMatchTypeLabel(type: RequestModifyRule['urlMatchType']): string {
  const option = urlMatchTypeOptions.find(o => o.value === type)
  return option?.label ?? type
}

function getResponseModifyInfo(responseModify?: ResponseModify): string {
  if (!responseModify) return ''
  const parts: string[] = []
  if (responseModify.statusCode) parts.push(`状态码:${responseModify.statusCode}`)
  if (responseModify.delayMs) parts.push(`延迟:${responseModify.delayMs}ms`)
  if (responseModify.responseOps?.length) parts.push(`${responseModify.responseOps.length}个操作`)
  return parts.join(', ')
}
</script>

<template>
  <div class="request-modify-container">
    <div class="header">
      <div class="header-left">
        <h3>请求修改</h3>
        <el-button type="primary" size="small" @click="addGroup">
          添加分组
        </el-button>
      </div>
      <el-switch v-model="enableModify" active-text="启用" inactive-text="禁用" />
    </div>

    <div v-if="groups.length === 0" class="empty-tip">
      暂无分组，点击"添加分组"开始配置
    </div>

    <div v-for="group in groups" :key="group.id" class="group-card">
      <div class="group-header">
        <div class="group-info">
          <el-input
            v-model="group.name"
            placeholder="分组名称"
            class="group-name-input"
            @change="save"
          />
          <el-switch
            v-model="group.enabled"
            active-text="启用"
            inactive-text="禁用"
            @change="save"
          />
        </div>
        <el-button type="danger" size="small" @click="deleteGroup(group.id)">
          删除分组
        </el-button>
      </div>

      <div class="rules-section">
        <div class="rules-header">
          <span class="rules-title">规则列表</span>
          <el-button type="primary" size="small" @click="addRule(group.id)">
            添加规则
          </el-button>
        </div>

        <div v-if="group.rules.length === 0" class="empty-rule-tip">
          暂无规则，点击"添加规则"开始配置
        </div>

        <div v-for="rule in group.rules" :key="rule.id" class="rule-card">
          <div class="rule-header">
            <el-switch
              v-model="rule.enabled"
              size="small"
              @change="save"
            />
            <span class="rule-url-pattern" :title="rule.urlPattern">
              {{ rule.urlPattern || '(未配置URL)' }}
            </span>
            <div class="rule-actions">
              <el-button type="primary" size="small" @click="editRule(group.id, rule)">
                编辑
              </el-button>
              <el-button type="danger" size="small" @click="deleteRule(group.id, rule.id)">
                删除
              </el-button>
            </div>
          </div>
          <div class="rule-info">
            <span class="info-item">
              <span class="info-label">匹配:</span>
              {{ getUrlMatchTypeLabel(rule.urlMatchType) }}
            </span>
            <span class="info-item">
              <span class="info-label">方法:</span>
              {{ getMethodDisplay(rule.methods) }}
            </span>
            <span class="info-item">
              <span class="info-label">Headers:</span>
              {{ getHeaderOpsCount(rule.headerOps) }}
            </span>
            <span v-if="rule.responseModify" class="info-item response-info">
              <span class="info-label">响应:</span>
              {{ getResponseModifyInfo(rule.responseModify) }}
            </span>
            <span v-if="rule.remark" class="info-item">
              <span class="info-label">备注:</span>
              {{ rule.remark }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <el-dialog
      v-model="dialogVisible"
      title="编辑规则"
      width="750px"
      :close-on-click-modal="false"
      :lock-scroll="false"
    >
      <div v-if="editingRule" class="edit-form">
        <div class="form-row">
          <label class="form-label">URL匹配方式</label>
          <el-select v-model="editingRule.urlMatchType" style="width: 120px">
            <el-option
              v-for="item in urlMatchTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </div>

        <div class="form-row">
          <label class="form-label">URL匹配规则</label>
          <el-input
            v-model="editingRule.urlPattern"
            placeholder="输入URL或正则表达式"
            style="flex: 1"
          />
        </div>

        <div class="form-row">
          <label class="form-label">请求方法</label>
          <el-checkbox-group v-model="editingRule.methods">
            <el-checkbox v-for="method in httpMethods" :key="method" :value="method">
              {{ method }}
            </el-checkbox>
          </el-checkbox-group>
        </div>

        <div class="form-row">
          <label class="form-label">备注</label>
          <el-input
            v-model="editingRule.remark"
            placeholder="输入备注信息"
            style="flex: 1"
          />
        </div>

        <!-- Header 操作区域 -->
        <div class="ops-section">
          <div class="ops-header">
            <span class="form-label">请求头操作</span>
            <el-button type="primary" size="small" @click="addHeaderOp">
              添加Header
            </el-button>
          </div>

          <el-table :data="editingRule.headerOps" border size="small">
            <el-table-column label="Header名称" width="180">
              <template #default="{ row }">
                <el-input v-model="row.key" placeholder="Header名" />
              </template>
            </el-table-column>
            <el-table-column label="操作类型" width="120">
              <template #default="{ row }">
                <el-select v-model="row.opType">
                  <el-option
                    v-for="item in headerOpTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </template>
            </el-table-column>
            <el-table-column label="值">
              <template #default="{ row }">
                <el-input
                  v-model="row.value"
                  placeholder="Header值"
                  :disabled="row.opType === 'delete'"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="70">
              <template #default="{ $index }">
                <el-button type="danger" size="small" link @click="deleteHeaderOp($index)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <div v-if="editingRule.headerOps.length === 0" class="empty-ops">
            暂无Header操作，点击"添加Header"开始配置
          </div>
        </div>

        <!-- 响应修改区域 -->
        <div class="ops-section response-section">
          <div class="ops-header">
            <span class="form-label">响应修改</span>
            <el-switch
              :model-value="editingRule.responseModify !== undefined"
              active-text="启用"
              inactive-text="禁用"
              @change="(val: boolean) => val ? enableResponseModify() : disableResponseModify()"
            />
          </div>

          <template v-if="editingRule.responseModify">
            <div class="response-basic">
              <div class="form-row">
                <label class="form-label">响应状态码</label>
                <el-input-number
                  v-model="editingRule.responseModify.statusCode"
                  :min="100"
                  :max="599"
                  placeholder="留空保持原状态"
                  style="width: 120px"
                  controls-position="right"
                />
                <span class="input-hint">留空保持原状态</span>
              </div>

              <div class="form-row">
                <label class="form-label">响应延迟</label>
                <el-input-number
                  v-model="editingRule.responseModify.delayMs"
                  :min="0"
                  :max="30000"
                  placeholder="留空不延迟"
                  style="width: 120px"
                  controls-position="right"
                />
                <span class="input-hint">ms，留空不延迟</span>
              </div>

              <div class="form-row">
                <label class="form-label">修改类型</label>
                <el-select v-model="editingRule.responseModify.modifyType" style="width: 120px">
                  <el-option
                    v-for="item in modifyTypeOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
            </div>

            <template v-if="editingRule.responseModify.modifyType === 'static'">
              <div class="ops-header sub-header">
                <span>响应体操作</span>
                <el-button type="primary" size="small" @click="addResponseOp">
                  添加操作
                </el-button>
              </div>

              <el-table :data="editingRule.responseModify.responseOps" border size="small">
                <el-table-column label="字段路径" width="180">
                  <template #default="{ row }">
                    <el-input v-model="row.key" placeholder="如 data.status" />
                  </template>
                </el-table-column>
                <el-table-column label="操作类型" width="120">
                  <template #default="{ row }">
                    <el-select v-model="row.opType">
                      <el-option
                        v-for="item in responseOpTypeOptions"
                        :key="item.value"
                        :label="item.label"
                        :value="item.value"
                      />
                    </el-select>
                  </template>
                </el-table-column>
                <el-table-column label="值">
                  <template #default="{ row }">
                    <el-input
                      v-model="row.value"
                      placeholder="JSON值，如 success 或对象"
                      type="textarea"
                      :rows="1"
                    />
                  </template>
                </el-table-column>
                <el-table-column label="操作" width="70">
                  <template #default="{ $index }">
                    <el-button type="danger" size="small" link @click="deleteResponseOp($index)">
                      删除
                    </el-button>
                  </template>
                </el-table-column>
              </el-table>

              <div v-if="!editingRule.responseModify.responseOps?.length" class="empty-ops">
                暂无响应体操作，点击"添加操作"开始配置
              </div>
            </template>

            <template v-if="editingRule.responseModify.modifyType === 'script'">
              <div class="script-placeholder">
                <el-alert type="info" :closable="false">
                  动态脚本功能将在后续版本实现
                </el-alert>
              </div>
            </template>
          </template>
        </div>
      </div>

      <template #footer>
        <el-button @click="dialogVisible = false">
          取消
        </el-button>
        <el-button type="primary" @click="saveRule">
          保存
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.request-modify-container {
  padding: 0;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-radius: 12px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;

  .header-left {
    display: flex;
    align-items: center;
    gap: 16px;

    h3 {
      margin: 0;
      font-size: 16px;
      font-weight: 600;
      color: #334155;
    }
  }
}

.empty-tip {
  text-align: center;
  padding: 40px 20px;
  color: #94a3b8;
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.group-card {
  background: #fff;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  margin-bottom: 16px;
  overflow: hidden;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
  border-bottom: 1px solid #e2e8f0;
}

.group-info {
  display: flex;
  align-items: center;
  gap: 16px;
}

.group-name-input {
  width: 200px;
}

.rules-section {
  padding: 16px;
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.rules-title {
  font-size: 14px;
  font-weight: 600;
  color: #475569;
}

.empty-rule-tip {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
}

.rule-card {
  background: #f8fafc;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 8px;
  border: 1px solid #e2e8f0;
}

.rule-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 8px;
}

.rule-url-pattern {
  flex: 1;
  font-size: 13px;
  color: #334155;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rule-actions {
  display: flex;
  gap: 8px;
}

.rule-info {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #64748b;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 4px;
}

.info-label {
  color: #94a3b8;
}

.response-info {
  color: #8b5cf6;
}

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

  .input-hint {
    color: #94a3b8;
    font-size: 12px;
  }
}

.ops-section {
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.ops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  .form-label {
    width: auto;
    font-size: 14px;
    font-weight: 600;
  }
}

.sub-header {
  margin-top: 16px;
  span {
    font-size: 13px;
    color: #475569;
  }
}

.empty-ops {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
}

.response-section {
  background: #faf5ff;
  border-radius: 8px;
  padding: 16px;
  margin-top: 20px;
  border: 1px solid #e9d5ff;
}

.response-basic {
  margin-bottom: 16px;
}

.script-placeholder {
  padding: 20px;
}

:deep(.wqdy-table) {
  border-radius: 8px;
  overflow: hidden;

  .wqdy-table__header-wrapper {
    th {
      background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
      color: #334155;
      font-weight: 600;
    }
  }

  .wqdy-table__row {
    transition: all 0.2s ease;

    &:hover {
      background: #f8fafc;
    }
  }

  .wqdy-input__wrapper,
  .wqdy-select__wrapper {
    border-radius: 6px;
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