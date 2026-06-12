<template>
  <div ref="anchorRef" class="prd-anchor">
    <slot />
    <Teleport v-if="showAnnotation && useTeleport" to="body">
      <button
        ref="badgeRef"
        type="button"
        class="prd-badge prd-badge--fixed"
        :class="{
          'prd-badge--compact': displayBadgeLabel.length > 1,
          'prd-badge--active': visible
        }"
        :style="badgeFixedStyle"
        :data-prd-badge-id="id"
        :aria-label="`需求标注 ${displayBadgeLabel}`"
        :aria-expanded="visible"
        @click.stop="onBadgeClick"
      >
        {{ displayBadgeLabel }}
      </button>
    </Teleport>
    <button
      v-else-if="showAnnotation"
      type="button"
      class="prd-badge"
      :class="{
        'prd-badge--compact': displayBadgeLabel.length > 1,
        'prd-badge--active': visible
      }"
      :aria-label="`需求标注 ${displayBadgeLabel}`"
      :aria-expanded="visible"
      @click.stop="onBadgeClick"
    >
      {{ displayBadgeLabel }}
    </button>
  </div>
  <Teleport to="body">
    <div
      v-if="showAnnotation && visible"
      ref="tipRef"
      class="prd-tooltip"
      :class="{
        'prd-tooltip--edit': editing,
        'prd-tooltip--fullscreen': isFullscreen
      }"
      :style="tipStyle"
      @mousedown.stop
      @click.stop
      @wheel.stop
    >
      <div class="prd-tooltip__header">
        <div class="prd-tooltip__toolbar">
          <button
            type="button"
            class="prd-tooltip__tool-btn"
            :aria-label="isFullscreen ? '还原尺寸' : '全屏展开'"
            @click="toggleFullscreen"
          >
            {{ isFullscreen ? '还原' : '全屏' }}
          </button>
          <button type="button" class="prd-tooltip__tool-btn" aria-label="关闭" @click="closeTooltip">×</button>
        </div>
        <header class="prd-tooltip__head" @mousedown="onDragStart">
          <span class="prd-tooltip__badge" :class="{ 'prd-badge--compact': displayBadgeLabel.length > 1 }">{{ displayBadgeLabel }}</span>
          <span class="prd-tooltip__title">
            {{ editing ? '编辑标注' : `功能点：${entry?.featureName || entry?.moduleName || id}` }}
          </span>
          <span v-if="entry?.featureId && !editing" class="prd-tooltip__meta">{{ entry.featureId }}</span>
        </header>
        <div class="prd-tooltip__divider" />
      </div>

      <div class="prd-tooltip__scroll">
        <template v-if="!editing">
          <div class="prd-tooltip__body">
            <section v-for="block in sectionBlocks" :key="block.key" class="prd-section">
              <h4 class="prd-section__label">{{ block.label }}</h4>
              <div class="prd-section__content" v-html="block.html" />
            </section>
            <p v-if="!sectionBlocks.length" class="prd-section__empty">暂无标注内容</p>
          </div>
        </template>

        <template v-else>
          <div class="prd-tooltip__form">
            <label class="prd-field">
              <span>功能点名称</span>
              <input v-model="editForm.featureName" type="text" class="prd-input" />
            </label>
            <label class="prd-field">
              <span>需求编号（SA-xx）</span>
              <input v-model="editForm.featureId" type="text" class="prd-input" placeholder="SA-2" />
            </label>
            <label v-for="sec in sectionFieldDefs" :key="sec.key" class="prd-field prd-field--section">
              <span>{{ sec.label }}</span>
              <textarea
                v-model="editForm.sections[sec.key]"
                class="prd-textarea"
                :rows="isFullscreen ? 6 : 3"
                :placeholder="sec.placeholder"
              />
            </label>
          </div>
          <p class="prd-tooltip__hint">
            纯文本编辑：直接写中文即可，换行分段；条目可用「1. 」或「- 」开头，无需 Markdown。
            保存暂存至浏览器；「一键复制」→ Cursor 打开 {{ annotationsTargetFile }}，搜索「{{ idSearchHint }}」整段替换（复制内容含 app-code，界面不展示）。
          </p>
        </template>
      </div>

      <footer v-if="canEdit" class="prd-tooltip__actions prd-tooltip__actions--dual">
        <button type="button" class="prd-btn prd-btn--primary" @click="toggleEditOrSave">
          {{ editing ? '保存' : '编辑' }}
        </button>
        <button type="button" class="prd-btn" @click="copySnippetForCursor">一键复制</button>
      </footer>
      <p v-if="syncMessage" class="prd-tooltip__sync-msg" :class="{ 'is-error': syncError }">
        {{ syncMessage }}
      </p>
    </div>
  </Teleport>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import {
  ANNOTATION_SECTION_KEYS,
  SECTION_EDIT_PLACEHOLDERS,
  sectionTextForEdit
} from '../../annotations/annotationFormat.js'
import {
  exportAnnotationSnippet,
  getAnnotationById,
  getPrdAnnotationAppMeta,
  getPrdAnnotationTargetPath,
  saveAnnotationOverride
} from '../../annotations/annotationStore.js'
import { PRD_ANNOTATION_EDIT_ENABLED } from '../../annotations/enabled.js'
import { prdAnnotationVisible } from '../../annotations/annotationVisibility.js'
import { renderPrdMarkdown } from './renderPrdMarkdown.js'
import './prd-annotation.css'

const props = defineProps({
  id: { type: Number, required: true },
  enabled: { type: Boolean, default: true },
  /** 未传时跟随 PRD_ANNOTATION_EDIT_ENABLED（开发态默认 true） */
  editEnabled: { type: Boolean, default: undefined }
})

const canEdit = computed(() =>
  props.editEnabled === undefined ? PRD_ANNOTATION_EDIT_ENABLED : props.editEnabled
)

const showAnnotation = computed(() => props.enabled && prdAnnotationVisible.value)

const sectionFieldDefs = ANNOTATION_SECTION_KEYS.map(({ key, label }) => ({
  key,
  label,
  placeholder: SECTION_EDIT_PLACEHOLDERS[key] || label
}))
const refreshKey = ref(0)

const entry = computed(() => {
  refreshKey.value
  return getAnnotationById(props.id)
})

const displayBadgeLabel = computed(() => {
  const e = entry.value
  if (e?.featureId) return e.featureId.replace(/^SA-/, '')
  return String(props.id)
})

const idSearchHint = computed(() => `  ${props.id}: {`)

const annotationAppMeta = getPrdAnnotationAppMeta()

const annotationsTargetFile = computed(() => {
  const path = getPrdAnnotationTargetPath()
  const parts = path.split('/')
  return parts.slice(-2).join('/') || path
})

const sectionBlocks = computed(() => {
  const e = entry.value
  if (!e?.sections) return []
  return ANNOTATION_SECTION_KEYS
    .map(({ key, label }) => {
      const text = (e.sections[key] || '').trim()
      if (!text) return null
      return { key, label, html: renderPrdMarkdown(text) }
    })
    .filter(Boolean)
})

const anchorRef = ref(null)
const badgeRef = ref(null)
const tipRef = ref(null)
const useTeleport = ref(false)
const visible = ref(false)
const editing = ref(false)
const tipStyle = ref({})
const badgeFixedStyle = ref({})
const dragOffset = ref(null)
const isFullscreen = ref(false)
const savedNormalStyle = ref(null)

const NORMAL_WIDTH = 450
const NORMAL_WIDTH_EDIT = 480

const editForm = reactive({
  featureId: '',
  featureName: '',
  sections: {
    functional: '',
    interaction: '',
    dataModel: '',
    other: ''
  }
})

const syncMessage = ref('')
const syncError = ref(false)

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
  const badgeEl = useTeleport.value ? badgeRef.value : el.querySelector('.prd-badge')
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
    top: `${Math.max(0, r.top - 6)}px`,
    right: `${Math.max(0, window.innerWidth - r.right - 6)}px`,
    left: 'auto',
    transform: 'none'
  }
}

function applyFullscreenStyle() {
  tipStyle.value = {
    left: '0',
    top: '0',
    width: '100vw',
    height: '100vh',
    maxHeight: '100vh'
  }
}

function getNormalWidth() {
  return editing.value ? NORMAL_WIDTH_EDIT : NORMAL_WIDTH
}

function placeTooltip() {
  if (isFullscreen.value) {
    applyFullscreenStyle()
    return
  }

  const tip = tipRef.value
  const rect = getBadgeRect()
  if (!tip || !rect) return

  const gap = 8
  const w = getNormalWidth()
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
    top: `${top}px`,
    width: `${w}px`,
    height: '',
    maxHeight: ''
  }
}

function onBadgeClick() {
  if (visible.value) {
    closeTooltip()
  } else {
    openTooltip()
  }
}

function openTooltip() {
  visible.value = true
  editing.value = false
  isFullscreen.value = false
  savedNormalStyle.value = null
  dragOffset.value = null
  nextTick(() => {
    syncBadgePosition()
    placeTooltip()
  })
}

function closeTooltip() {
  visible.value = false
  editing.value = false
  isFullscreen.value = false
  savedNormalStyle.value = null
  dragOffset.value = null
}

function toggleFullscreen() {
  if (isFullscreen.value) {
    isFullscreen.value = false
    if (savedNormalStyle.value) {
      tipStyle.value = { ...savedNormalStyle.value }
      const left = parseFloat(savedNormalStyle.value.left)
      const top = parseFloat(savedNormalStyle.value.top)
      if (!Number.isNaN(left) && !Number.isNaN(top)) {
        dragOffset.value = { left, top }
      }
    } else {
      dragOffset.value = null
      nextTick(placeTooltip)
    }
    return
  }

  savedNormalStyle.value = { ...tipStyle.value }
  isFullscreen.value = true
  applyFullscreenStyle()
}

function toggleEditOrSave() {
  if (editing.value) {
    saveEdit()
  } else {
    startEdit()
  }
}

function saveEdit() {
  saveAnnotationOverride(props.id, {
    featureId: editForm.featureId.trim(),
    featureName: editForm.featureName.trim(),
    moduleName: editForm.featureName.trim(),
    sections: { ...editForm.sections }
  })
  refreshKey.value += 1
  editing.value = false
  nextTick(placeTooltip)
}

function startEdit() {
  if (editing.value) return
  const e = entry.value
  if (!e) return
  editForm.featureId = e.featureId || ''
  editForm.featureName = e.featureName || e.moduleName || ''
  for (const { key } of ANNOTATION_SECTION_KEYS) {
    editForm.sections[key] = sectionTextForEdit(e.sections[key] || '')
  }
  editing.value = true
  nextTick(placeTooltip)
}

function currentEditPatch() {
  if (!editing.value) return null
  return {
    featureId: editForm.featureId.trim(),
    featureName: editForm.featureName.trim(),
    moduleName: editForm.featureName.trim(),
    sections: { ...editForm.sections }
  }
}

async function copySnippetForCursor() {
  const snippet = exportAnnotationSnippet(props.id, currentEditPatch())
  if (!snippet) {
    syncMessage.value = '无标注内容可复制'
    syncError.value = true
    return
  }
  try {
    await navigator.clipboard.writeText(snippet)
    syncMessage.value = `已复制（app-code=${annotationAppMeta.appCode}）。打开 ${getPrdAnnotationTargetPath()}，搜索「  ${props.id}: {」整段替换后保存`
    syncError.value = false
  } catch {
    syncMessage.value = '复制失败，请检查浏览器剪贴板权限'
    syncError.value = true
  }
}

function onDragStart(e) {
  if (isFullscreen.value) return
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
      ...tipStyle.value,
      left: `${dragOffset.value.left}px`,
      top: `${dragOffset.value.top}px`,
      width: `${getNormalWidth()}px`,
      height: '',
      maxHeight: ''
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
  if (!visible.value) return
  if (isFullscreen.value) {
    applyFullscreenStyle()
  } else {
    placeTooltip()
  }
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

watch(editing, () => nextTick(placeTooltip))

watch(showAnnotation, (v) => {
  if (!v) {
    closeTooltip()
    return
  }
  if (anchorRef.value) {
    useTeleport.value = hasClippingAncestor(anchorRef.value)
    nextTick(syncBadgePosition)
  }
})

onBeforeUnmount(() => {
  unbindScrollResize()
})
</script>
