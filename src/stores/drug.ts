import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Drug } from '@/types'

export const useDrugStore = defineStore('drug', () => {
  const drugList = ref<Drug[]>([])
  const currentDrug = ref<Drug | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  function setDrugList(drugs: Drug[]) {
    drugList.value = drugs
  }

  function setCurrentDrug(drug: Drug | null) {
    currentDrug.value = drug
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
    drugList,
    currentDrug,
    loading,
    error,
    setDrugList,
    setCurrentDrug,
    setLoading,
    setError,
    clearError
  }
})
