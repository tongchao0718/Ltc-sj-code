import { ref } from 'vue'

const hostRef = ref(null)

export function registerMessageHost(instance) {
  hostRef.value = instance
}

export function mdMessage(text, type = 'info') {
  hostRef.value?.show(text, type)
}

export function useMdMessage() {
  return {
    success: (text) => mdMessage(text, 'success'),
    warning: (text) => mdMessage(text, 'warning'),
    error: (text) => mdMessage(text, 'error'),
    info: (text) => mdMessage(text, 'info')
  }
}
