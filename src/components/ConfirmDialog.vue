<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="visible" class="confirm-dialog-overlay" @click.self="handleCancel">
        <div class="confirm-dialog">
          <div class="dialog-icon" :class="type">
            <svg v-if="type === 'warning'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <svg v-else-if="type === 'danger'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 9V13M12 17H12.01M5.07183 19H18.9282C20.4678 19 21.4301 17.3333 20.6603 16L13.7321 4C12.9623 2.66667 11.0377 2.66667 10.2679 4L3.33975 16C2.56995 17.3333 3.53223 19 5.07183 19Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h3 class="dialog-title">{{ title }}</h3>
          <p class="dialog-message">{{ message }}</p>
          <div class="dialog-actions">
            <button class="btn btn-cancel" @click="handleCancel">{{ cancelText }}</button>
            <button class="btn btn-confirm" :class="type" @click="handleConfirm">{{ confirmText }}</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean
  title?: string
  message?: string
  type?: 'warning' | 'danger'
  confirmText?: string
  cancelText?: string
}

withDefaults(defineProps<Props>(), {
  title: '确认操作',
  message: '确定要执行此操作吗？',
  type: 'warning',
  confirmText: '确定',
  cancelText: '取消'
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const handleConfirm = () => {
  emit('confirm')
  emit('update:visible', false)
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}
</script>

<style scoped>
.confirm-dialog-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.confirm-dialog {
  background: rgba(25, 25, 35, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  width: 90%;
  max-width: 360px;
  text-align: center;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
}

.dialog-icon {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.dialog-icon.warning {
  background: rgba(234, 179, 8, 0.15);
  color: #facc15;
}

.dialog-icon.danger {
  background: rgba(239, 68, 68, 0.15);
  color: #f87171;
}

.dialog-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #f4f4f5;
  margin: 0 0 0.5rem;
}

.dialog-message {
  font-size: 0.9rem;
  color: #a1a1aa;
  margin: 0 0 1.5rem;
  line-height: 1.5;
}

.dialog-actions {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.625rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  border: none;
}

.btn-cancel {
  background: rgba(255, 255, 255, 0.06);
  color: #a1a1aa;
}

.btn-cancel:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #e4e4e7;
}

.btn-confirm {
  color: #fff;
}

.btn-confirm.warning {
  background: rgba(234, 179, 8, 0.8);
}

.btn-confirm.warning:hover {
  background: rgba(234, 179, 8, 1);
}

.btn-confirm.danger {
  background: rgba(239, 68, 68, 0.8);
}

.btn-confirm.danger:hover {
  background: rgba(239, 68, 68, 1);
}

/* 过渡动画 */
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}

.dialog-fade-enter-active .confirm-dialog,
.dialog-fade-leave-active .confirm-dialog {
  transition: transform 0.2s ease, opacity 0.2s ease;
}

.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}

.dialog-fade-enter-from .confirm-dialog,
.dialog-fade-leave-to .confirm-dialog {
  transform: scale(0.95);
  opacity: 0;
}
</style>
