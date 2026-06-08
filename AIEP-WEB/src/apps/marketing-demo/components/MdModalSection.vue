<template>
  <section class="md-modal-section">
    <MdSectionTitle :title="title">
      <template v-if="$slots.extra" #extra>
        <slot name="extra" />
      </template>
    </MdSectionTitle>
    <div class="md-modal-section-body">
      <slot />
    </div>
  </section>
</template>

<script setup>
import MdSectionTitle from './MdSectionTitle.vue'

defineProps({
  title: { type: String, required: true }
})
</script>
