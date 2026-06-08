<template>
  <nav v-if="items.length" class="md-breadcrumb" aria-label="面包屑">
    <ol class="md-breadcrumb-list">
      <li v-for="(item, index) in items" :key="index" class="md-breadcrumb-item">
        <span v-if="index > 0" class="md-breadcrumb-sep" aria-hidden="true">/</span>
        <span
          class="md-breadcrumb-text"
          :class="{ 'md-breadcrumb-text--current': item.current }"
        >{{ item.label }}</span>
      </li>
    </ol>
  </nav>
</template>

<script setup>
defineProps({
  items: { type: Array, default: () => [] }
})
</script>
