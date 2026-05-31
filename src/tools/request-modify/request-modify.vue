<script setup lang="ts">
import type { ResponseModify } from '~/types'
import { useRequestModify } from '~/composables/useRequestModify'
import RuleEditDialog from './RuleEditDialog.vue'

const {
  groups,
  enableModify,
  dialogVisible,
  editingRule,
  save,
  addGroup,
  deleteGroup,
  addRule,
  deleteRule,
  editRule,
  saveRule,
  closeDialog,
  addHeaderOp,
  deleteHeaderOp,
  enableResponseModify,
  disableResponseModify,
  addResponseOp,
  deleteResponseOp,
  getMethodDisplay,
  getHeaderOpsCount,
  getUrlMatchTypeLabel,
  getResponseModifyInfo,
} = useRequestModify()

function handleResponseModifyChange(val: ResponseModify | undefined) {
  if (val) {
    enableResponseModify()
  } else {
    disableResponseModify()
  }
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
      <el-switch v-model="enableModify" inline-prompt active-text="启用" inactive-text="禁用" />
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
            inline-prompt
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
              inline-prompt
              size="small"
              active-text="开"
              inactive-text="关"
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

    <RuleEditDialog
      :visible="dialogVisible"
      :rule="editingRule"
      @update:visible="(v) => v ? null : closeDialog()"
      @save="saveRule"
      @add-header-op="addHeaderOp"
      @delete-header-op="deleteHeaderOp"
      @update:response-modify="handleResponseModifyChange"
      @add-response-op="addResponseOp"
      @delete-response-op="deleteResponseOp"
    />
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
</style>
