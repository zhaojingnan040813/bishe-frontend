import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Interaction, InteractionResult } from '@/types'

export const useInteractionStore = defineStore('interaction', () => {
  const selectedDrugs = ref<string[]>([])
  const detectionResult = ref<InteractionResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setSelectedDrugs(drugIds: string[]) {
    selectedDrugs.value = drugIds
  }

  function addSelectedDrug(drugId: string) {
    if (!selectedDrugs.value.includes(drugId)) {
      selectedDrugs.value.push(drugId)
    }
  }

  function removeSelectedDrug(drugId: string) {
    selectedDrugs.value = selectedDrugs.value.filter(id => id !== drugId)
  }

  function clearSelectedDrugs() {
    selectedDrugs.value = []
  }

  function setDetectionResult(result: InteractionResult | null) {
    detectionResult.value = result
  }

  function setLoading(value: boolean) {
    loading.value = value
  }

  function setError(message: string | null) {
    error.value = message
  }

  function clearError() {
    error.value = null
  }

  return {
    selectedDrugs,
    detectionResult,
    loading,
    error,
    setSelectedDrugs,
    addSelectedDrug,
    removeSelectedDrug,
    clearSelectedDrugs,
    setDetectionResult,
    setLoading,
    setError,
    clearError
  }
})
