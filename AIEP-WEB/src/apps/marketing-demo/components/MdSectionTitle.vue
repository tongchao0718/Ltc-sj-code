<template>
  <div class="md-section-title" :class="{ 'md-section-title--bar': bar }">
    <span v-if="bar" class="md-section-title-mark" aria-hidden="true" />
    <span class="md-section-title-text">{{ title }}</span>
    <div v-if="$slots.extra" class="md-section-title-extra">
      <slot name="extra" />
    </div>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  bar: { type: Boolean, default: true }
})
</script>
