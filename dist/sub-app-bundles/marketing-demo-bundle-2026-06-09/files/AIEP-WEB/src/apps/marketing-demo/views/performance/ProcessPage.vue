<template>
  <div>
    <h1 class="md-page-title">履约执行流程</h1>
    <p class="md-page-desc">保函到期提醒 → 续保办理 → 归档闭环</p>

    <div class="md-card">
      <div class="md-process-steps">
        <div v-for="(step, i) in steps" :key="step" class="md-step" :class="{ 'md-step--done': i < currentStep, 'md-step--current': i === currentStep }">
          <div class="md-step-dot">{{ i + 1 }}</div>
          <div>{{ step }}</div>
        </div>
      </div>
      <div class="md-form-inline">
        <select v-model="selectedGuarantee" class="md-select">
          <option v-for="g in expiring" :key="g.id" :value="g.id">{{ g.companyName }} — {{ g.expireDate }}</option>
        </select>
        <button type="button" class="md-btn md-btn--primary" :disabled="currentStep >= steps.length - 1" @click="nextStep">推进下一步</button>
        <button type="button" class="md-btn" @click="reset">重置流程</button>
      </div>
      <p v-if="processLog.length" style="margin-top:16px;font-size:13px;color:#606266">
        <span v-for="(log, i) in processLog" :key="i">{{ log }}<br /></span>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marketingStore as store, persistStore } from '../../store/marketingStore.js'

const steps = ['临期识别', '通知企业', '续保办理', '状态更新', '归档完成']
const currentStep = ref(0)
const selectedGuarantee = ref('')
const processLog = ref([])

const expiring = computed(() => store.guarantees.filter((g) => g.status === '临期' || g.status === '有效'))
selectedGuarantee.value = expiring.value[0]?.id || ''

function nextStep() {
  const g = store.guarantees.find((x) => x.id === selectedGuarantee.value)
  const stepName = steps[currentStep.value]
  processLog.value.push(`${new Date().toLocaleTimeString()} — ${g?.companyName}: 完成「${stepName}」`)
  if (currentStep.value === steps.length - 2 && g) {
    g.status = '有效'
    g.expireDate = '2027-06-30'
    persistStore()
  }
  currentStep.value = Math.min(currentStep.value + 1, steps.length - 1)
  store.performanceProcesses.unshift({ guaranteeId: selectedGuarantee.value, step: stepName, at: new Date().toISOString() })
  persistStore()
}

function reset() {
  currentStep.value = 0
  processLog.value = []
}
</script>
