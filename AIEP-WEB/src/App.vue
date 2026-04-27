<template>
  <div class="app-container" :class="{ scrolled: isScrolled }">
    <header class="app-header">
      <div class="header-inner">
        <div class="brand">
          <img src="/app-icon.png" alt="" class="app-logo" width="36" height="36" aria-hidden="true" />
          <h1 class="app-title">应用系统</h1>
        </div>
        <nav class="app-nav" aria-label="主导航">
          <router-link to="/dashboard" class="nav-link" active-class="nav-link--active">首页</router-link>
          <router-link to="/app-center" class="nav-link" active-class="nav-link--active">应用中心</router-link>
        </nav>
        <div class="header-end">
          <div
            class="user-menu-wrap"
            @mouseenter="onUserMenuEnter"
            @mouseleave="onUserMenuLeave"
          >
            <button
              type="button"
              class="user-trigger"
              :aria-expanded="userMenuOpen"
              aria-haspopup="true"
              @click.stop="toggleUserMenu"
            >
              <span class="user-avatar" aria-hidden="true">{{ userInitial }}</span>
              <span class="user-label">个人中心</span>
              <span class="menu-arrow" :class="{ rotated: userMenuOpen }">▼</span>
            </button>
            <transition name="fade-page">
              <div v-if="userMenuOpen" class="user-dropdown" role="menu" @click.stop>
                <router-link to="/profile" class="dropdown-item" role="menuitem" @click="closeUserMenu">
                  个人资料
                </router-link>
                <router-link to="/help" class="dropdown-item" role="menuitem" @click="closeUserMenu">
                  使用帮助
                </router-link>
                <router-link to="/about" class="dropdown-item" role="menuitem" @click="closeUserMenu">
                  关于我们
                </router-link>
                <router-link to="/review-center" class="dropdown-item" role="menuitem" @click="closeUserMenu">
                  项目审查
                </router-link>
              </div>
            </transition>
          </div>
        </div>
      </div>
    </header>

    <main class="app-main" :class="{ 'app-main--embed': isSubAppEmbed }">
      <div class="main-fill" :class="{ 'main-fill--embed': isSubAppEmbed }">
        <router-view v-slot="{ Component }">
          <transition name="fade-page" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </div>
    </main>

  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const userMenuOpen = ref(false)
const isScrolled = ref(false)
const menuCloseTimer = ref(null)
const userDisplayName = ref('')

const isSubAppEmbed = computed(() => {
  return route.path.startsWith('/sample-app')
})

const userInitial = computed(() => {
  const n = (userDisplayName.value || '').trim()
  if (!n) return 'L'
  return n.slice(0, 1).toUpperCase()
})

watch(route, () => {
  closeUserMenu()
})

const toggleUserMenu = () => {
  userMenuOpen.value = !userMenuOpen.value
}

const closeUserMenu = () => {
  userMenuOpen.value = false
}

const onUserMenuEnter = () => {
  if (menuCloseTimer.value) {
    clearTimeout(menuCloseTimer.value)
    menuCloseTimer.value = null
  }
}

const onUserMenuLeave = () => {
  menuCloseTimer.value = setTimeout(() => {
    userMenuOpen.value = false
  }, 200)
}

const onDocClick = () => {
  userMenuOpen.value = false
}

const handleScroll = () => {
  isScrolled.value = window.scrollY > 8
}

const syncUserDisplayName = () => {
  try {
    userDisplayName.value = localStorage.getItem('ltc-demo-display-name') || 'LTC'
  } catch {
    userDisplayName.value = 'LTC'
  }
}

const onStorage = (e) => {
  if (e.key === 'ltc-demo-display-name') syncUserDisplayName()
}

onMounted(() => {
  syncUserDisplayName()
  window.addEventListener('scroll', handleScroll, { passive: true })
  document.addEventListener('click', onDocClick)
  window.addEventListener('storage', onStorage)
  window.addEventListener('ltc-profile-updated', syncUserDisplayName)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll)
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('storage', onStorage)
  window.removeEventListener('ltc-profile-updated', syncUserDisplayName)
  if (menuCloseTimer.value) clearTimeout(menuCloseTimer.value)
})
</script>

<style scoped>
.app-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  padding-top: 56px;
}

.app-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  height: 56px;
  flex-shrink: 0;
  background-color: var(--color-bg-2);
  border-bottom: 1px solid var(--color-border);
  box-shadow: var(--shadow-nav);
  transition:
    box-shadow 0.3s ease,
    background-color 0.3s ease;
}

.app-container.scrolled .app-header {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

[data-theme='dark'] .app-container.scrolled .app-header {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
}

.header-inner {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 clamp(12px, 4vw, 50px);
  height: 100%;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  box-sizing: border-box;
}

.brand {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  justify-self: start;
}

.header-end {
  justify-self: end;
  grid-column: 3;
  min-width: 0;
}

.app-logo {
  display: block;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  object-fit: cover;
  flex-shrink: 0;
}

.app-title {
  margin: 0;
  font-size: var(--font-size-title-sm);
  font-weight: 600;
  color: var(--color-text-1);
  white-space: nowrap;
}

.app-nav {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  justify-self: center;
  grid-column: 2;
}

.nav-link {
  display: inline-flex;
  align-items: center;
  height: 40px;
  padding: 0 16px;
  font-size: var(--font-size-body);
  font-weight: 500;
  color: var(--color-text-2);
  text-decoration: none;
  border-radius: var(--radius-button);
  transition:
    background-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;
}

.nav-link:hover {
  color: var(--color-primary);
  background-color: var(--color-primary-bg);
  transform: translateY(-1px);
}

.nav-link--active {
  color: var(--color-primary);
  background-color: var(--color-primary-bg);
  box-shadow: inset 0 0 0 1px var(--color-primary);
}

.user-menu-wrap {
  position: relative;
  flex-shrink: 0;
}

.user-trigger {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 40px;
  padding: 0 12px 0 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-button);
  background: var(--color-bg-2);
  color: var(--color-text-1);
  font-size: var(--font-size-body);
  font-weight: 500;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease;
}

.user-trigger:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-card);
}

.user-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-light));
  color: #fff;
  font-size: 13px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.menu-arrow {
  font-size: 10px;
  color: var(--color-text-3);
  transition: transform 0.2s ease;
}

.menu-arrow.rotated {
  transform: rotate(180deg);
}

.user-dropdown {
  position: absolute;
  top: calc(100% + 8px);
  right: 0;
  min-width: 200px;
  padding: 8px 0;
  background: var(--color-bg-2);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-card);
  box-shadow: var(--shadow-modal);
  z-index: 1100;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 12px 20px;
  font-size: var(--font-size-body);
  color: var(--color-text-1);
  text-decoration: none;
  text-align: left;
  border: none;
  background: transparent;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.dropdown-item:hover {
  background-color: var(--color-fill-1);
  color: var(--color-primary);
}

.dropdown-item--btn {
  font-family: inherit;
}

.app-main {
  flex: 1;
  min-height: 0;
  padding: 24px 0 32px;
  background-color: var(--color-bg-1);
  overflow-y: auto;
}

/* 子应用：主区域不自身滚动，高度交给内层与子应用双栏 */
.app-main--embed {
  padding: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

/* 承接 flex 高度链，避免 transition 打断导致整页随内容增高、菜单与正文一起滚 */
.main-fill--embed {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.main-fill--embed :deep(.app-layout) {
  flex: 1 1 0;
  min-height: 0;
  min-width: 0;
  overflow: hidden;
}

@media (max-width: 768px) {
  .header-inner {
    grid-template-columns: minmax(0, 1fr) auto minmax(0, auto);
    gap: 8px;
  }

  .app-title {
    font-size: var(--font-size-body);
    max-width: 42vw;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .nav-link {
    padding: 0 10px;
    height: 36px;
    font-size: var(--font-size-caption);
  }

  .user-label {
    display: none;
  }

  .user-trigger {
    padding: 0 8px 0 6px;
  }
}

@media (max-width: 380px) {
  .app-logo {
    width: 30px;
    height: 30px;
  }
}
</style>
