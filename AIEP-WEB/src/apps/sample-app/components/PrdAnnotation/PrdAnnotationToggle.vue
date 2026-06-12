<template>
  <Teleport to="body">
    <button
      v-if="envEnabled"
      type="button"
      class="prd-visibility-toggle"
      :aria-pressed="!prdAnnotationVisible"
      @click="togglePrdAnnotationUserVisible"
    >
      {{ prdAnnotationVisible ? '隐藏标注' : '显示标注' }}
    </button>
  </Teleport>
</template>

<script setup>
import { PRD_ANNOTATION_ENABLED } from '../../annotations/enabled.js'
import {
  prdAnnotationVisible,
  togglePrdAnnotationUserVisible
} from '../../annotations/annotationVisibility.js'
import './prd-annotation.css'

const envEnabled = PRD_ANNOTATION_ENABLED
</script>
