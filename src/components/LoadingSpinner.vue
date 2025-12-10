<template>
  <div class="loading-spinner" :class="[sizeClass, { 'loading-overlay': overlay }]">
    <div class="spinner-wrapper">
      <div class="spinner">
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <div class="spinner-ring"></div>
        <span class="spinner-icon">💊</span>
      </div>
      <p v-if="text" class="spinner-text">{{ text }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  size?: 'small' | 'medium' | 'large'
  text?: string
  overlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  size: 'medium',
  text: '',
  overlay: false
})

const sizeClass = computed(() => `spinner-${props.size}`)
</script>

<style scoped>
.loading-spinner {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(10, 10, 15, 0.85);
  backdrop-filter: blur(4px);
  z-index: 100;
  border-radius: inherit;
}

.spinner-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 尺寸变体 */
.spinner-small .spinner { width: 40px; height: 40px; }
.spinner-small .spinner-ring { width: 40px; height: 40px; border-width: 2px; }
.spinner-small .spinner-icon { font-size: 1rem; }

.spinner-medium .spinner { width: 64px; height: 64px; }
.spinner-medium .spinner-ring { width: 64px; height: 64px; border-width: 3px; }
.spinner-medium .spinner-icon { font-size: 1.5rem; }

.spinner-large .spinner { width: 96px; height: 96px; }
.spinner-large .spinner-ring { width: 96px; height: 96px; border-width: 4px; }
.spinner-large .spinner-icon { font-size: 2.5rem; }

.spinner-ring {
  position: absolute;
  border-radius: 50%;
  border-style: solid;
  border-color: transparent;
  animation: spin 1.5s linear infinite;
}

.spinner-ring:nth-child(1) {
  border-top-color: #3b82f6;
  animation-duration: 1.5s;
}

.spinner-ring:nth-child(2) {
  width: 80%;
  height: 80%;
  border-right-color: #8b5cf6;
  animation-duration: 2s;
  animation-direction: reverse;
}

.spinner-ring:nth-child(3) {
  width: 60%;
  height: 60%;
  border-bottom-color: #ec4899;
  animation-duration: 1s;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner-icon {
  position: relative;
  z-index: 1;
  animation: pulse 2s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { transform: scale(1); opacity: 1; }
  50% { transform: scale(1.1); opacity: 0.8; }
}

.spinner-text {
  font-size: 0.95rem;
  color: #a1a1aa;
  text-align: center;
  animation: fadeInOut 2s ease-in-out infinite;
}

@keyframes fadeInOut {
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
}
</style>
