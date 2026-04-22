<script setup lang="ts">
import type { HeaderGroup, HeaderModifyStorage, HeaderOperation, HeaderRule } from '~/types'
import { useGMStorage } from '~/composables/useGMStorage'
import { storageKey } from './header-modify'

const { data: storage, save } = useGMStorage<HeaderModifyStorage>(storageKey, {
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
const editingRule = ref<HeaderRule | null>(null)

const urlMatchTypeOptions = [
  { label: '包含', value: 'contains' },
  { label: '正则', value: 'regex' },
  { label: '精确', value: 'exact' },
]

const opTypeOptions = [
  { label: '设置', value: 'set' },
  { label: '追加', value: 'append' },
  { label: '删除', value: 'delete' },
]

const httpMethods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'] as const

function addGroup() {
  const newGroup: HeaderGroup = {
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

  const newRule: HeaderRule = {
    id: Date.now().toString(),
    enabled: true,
    urlPattern: '',
    urlMatchType: 'contains',
    methods: [],
    headerOps: [],
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

function editRule(groupId: string, rule: HeaderRule) {
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

function getMethodDisplay(methods: HeaderRule['methods']): string {
  if (!methods || methods.length === 0) return '全部'
  return methods.join(', ')
}

function getHeaderOpsCount(headerOps: HeaderOperation[]): string {
  if (!headerOps || headerOps.length === 0) return '0个'
  return `${headerOps.length}个`
}

function getUrlMatchTypeLabel(type: HeaderRule['urlMatchType']): string {
  const option = urlMatchTypeOptions.find(o => o.value === type)
  return option?.label ?? type
}
</script>

<template>
  <div class="header-modify-container">
    <div class="header">
      <div class="header-left">
        <h3>请求头修改</h3>
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
              <span class="info-label">匹配方式:</span>
              {{ getUrlMatchTypeLabel(rule.urlMatchType) }}
            </span>
            <span class="info-item">
              <span class="info-label">请求方法:</span>
              {{ getMethodDisplay(rule.methods) }}
            </span>
            <span class="info-item">
              <span class="info-label">Header数:</span>
              {{ getHeaderOpsCount(rule.headerOps) }}
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
      width="700px"
      :close-on-click-modal="false"
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

        <div class="header-ops-section">
          <div class="header-ops-header">
            <span class="form-label">Header操作</span>
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
                    v-for="item in opTypeOptions"
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

          <div v-if="editingRule.headerOps.length === 0" class="empty-header-ops">
            暂无Header操作，点击"添加Header"开始配置
          </div>
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
.header-modify-container {
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
  }
}

.header-ops-section {
  margin-top: 20px;
  border-top: 1px solid #e2e8f0;
  padding-top: 16px;
}

.header-ops-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.empty-header-ops {
  text-align: center;
  padding: 20px;
  color: #94a3b8;
  font-size: 13px;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px dashed #e2e8f0;
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
:deep(.wqdy-dialog__footer) {
  padding: 20px 24px;
}
</style>
