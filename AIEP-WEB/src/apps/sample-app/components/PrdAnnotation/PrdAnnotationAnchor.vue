<template>
  <template v-if="!enabled">
    <slot />
  </template>
  <div v-else ref="anchorRef" class="prd-anchor">
    <slot />
    <Teleport v-if="useTeleport" to="body">
      <button
        ref="badgeRef"
        type="button"
        class="prd-badge prd-badge--fixed"
        :style="badgeFixedStyle"
        :data-prd-badge-id="id"
        :aria-label="`需求标注 ${id}`"
        @mouseenter="openTooltip"
      >
        {{ id }}
      </button>
    </Teleport>
    <button
      v-else
      type="button"
      class="prd-badge"
      :aria-label="`需求标注 ${id}`"
      @mouseenter="openTooltip"
    >
      {{ id }}
    </button>
  </div>
  <Teleport to="body">
    <div
      v-if="visible"
      ref="tipRef"
      class="prd-tooltip"
      :style="tipStyle"
      @mousedown.stop
      @click.stop
      @wheel.stop
    >
      <button type="button" class="prd-tooltip__close" aria-label="关闭" @click="closeTooltip">×</button>
      <header class="prd-tooltip__head" @mousedown="onDragStart">
        <span class="prd-tooltip__badge">{{ id }}</span>
        <span class="prd-tooltip__title">需求描述：{{ moduleName }}</span>
      </header>
      <div class="prd-tooltip__divider" />
      <div class="prd-tooltip__body" v-html="bodyHtml" />
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { renderPrdMarkdown } from './renderPrdMarkdown.js'
import { SAMPLE_APP_ANNOTATIONS } from '../../annotations/sampleAppAnnotations.js'
import './prd-annotation.css'

const props = defineProps({
  id: { type: Number, required: true },
  enabled: { type: Boolean, default: true }
})

const entry = computed(() => SAMPLE_APP_ANNOTATIONS[props.id] || {})
const moduleName = computed(() => entry.value.moduleName || `需求 ${props.id}`)
const bodyHtml = computed(() => renderPrdMarkdown(entry.value.markdown || ''))

const anchorRef = ref(null)
const badgeRef = ref(null)
const tipRef = ref(null)
const useTeleport = ref(false)
const visible = ref(false)
const tipStyle = ref({})
const badgeFixedStyle = ref({})
const dragOffset = ref(null)

let scrollResizeBound = false

function hasClippingAncestor(el) {
  let node = el?.parentElement
  while (node && node !== document.body) {
    const s = getComputedStyle(node)
    const ox = s.overflowX
    const oy = s.overflowY
    if (
      [ox, oy].some((v) => v === 'hidden' || v === 'clip' || v === 'scroll' || v === 'auto') &&
      (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth)
    ) {
      return true
    }
    if (ox === 'hidden' || oy === 'hidden' || ox === 'clip' || oy === 'clip') {
      return true
    }
    node = node.parentElement
  }
  return false
}

function getBadgeRect() {
  const el = anchorRef.value
  if (!el) return null
  const badgeEl = useTeleport.value
    ? badgeRef.value
    : el.querySelector('.prd-badge')
  const r = (badgeEl || el).getBoundingClientRect()
  return {
    left: r.left,
    top: r.top,
    right: r.right,
    bottom: r.bottom,
    width: r.width,
    height: r.height
  }
}

function syncBadgePosition() {
  if (!useTeleport.value || !anchorRef.value) return
  const r = anchorRef.value.getBoundingClientRect()
  badgeFixedStyle.value = {
    top: `${Math.max(0, r.top - 8)}px`,
    right: `${Math.max(0, window.innerWidth - r.right - 4)}px`,
    left: 'auto',
    transform: 'none'
  }
}

function placeTooltip() {
  const tip = tipRef.value
  const rect = getBadgeRect()
  if (!tip || !rect) return

  const gap = 8
  const w = 450
  const h = Math.min(tip.offsetHeight || 320, window.innerHeight * 0.7)
  let left = rect.right - w
  let top = rect.bottom + gap

  if (left < gap) left = gap
  if (left + w > window.innerWidth - gap) left = window.innerWidth - w - gap
  if (top + h > window.innerHeight - gap) {
    top = rect.top - h - gap
    if (top < gap) top = gap
  }

  if (dragOffset.value) {
    left = dragOffset.value.left
    top = dragOffset.value.top
  }

  tipStyle.value = {
    left: `${left}px`,
    top: `${top}px`
  }
}

function openTooltip() {
  visible.value = true
  dragOffset.value = null
  nextTick(() => {
    syncBadgePosition()
    placeTooltip()
  })
}

function closeTooltip() {
  visible.value = false
  dragOffset.value = null
}

function onDragStart(e) {
  if (e.button !== 0) return
  const tip = tipRef.value
  if (!tip) return
  const startX = e.clientX
  const startY = e.clientY
  const rect = tip.getBoundingClientRect()
  const originLeft = rect.left
  const originTop = rect.top

  const onMove = (ev) => {
    dragOffset.value = {
      left: originLeft + (ev.clientX - startX),
      top: originTop + (ev.clientY - startY)
    }
    tipStyle.value = {
      left: `${dragOffset.value.left}px`,
      top: `${dragOffset.value.top}px`
    }
  }
  const onUp = () => {
    document.removeEventListener('mousemove', onMove)
    document.removeEventListener('mouseup', onUp)
  }
  document.addEventListener('mousemove', onMove)
  document.addEventListener('mouseup', onUp)
}

function onScrollOrResize() {
  syncBadgePosition()
  if (visible.value) placeTooltip()
}

function bindScrollResize() {
  if (scrollResizeBound) return
  scrollResizeBound = true
  window.addEventListener('scroll', onScrollOrResize, true)
  window.addEventListener('resize', onScrollOrResize)
}

function unbindScrollResize() {
  if (!scrollResizeBound) return
  scrollResizeBound = false
  window.removeEventListener('scroll', onScrollOrResize, true)
  window.removeEventListener('resize', onScrollOrResize)
}

onMounted(() => {
  if (!props.enabled) return
  useTeleport.value = hasClippingAncestor(anchorRef.value)
  if (useTeleport.value) {
    syncBadgePosition()
    nextTick(syncBadgePosition)
    bindScrollResize()
  }
})

watch(visible, (v) => {
  if (v) {
    bindScrollResize()
    nextTick(placeTooltip)
  }
})

onBeforeUnmount(() => {
  unbindScrollResize()
})
</script>
