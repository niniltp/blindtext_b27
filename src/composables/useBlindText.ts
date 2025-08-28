import { useBlindTextStore } from '../stores/blindTextStore'
import { computed, ref } from 'vue'
import { useSound } from '@vueuse/sound'
import scoringSfx from '../assets/sfx/sfx_right.wav'
import wrongSfx from '../assets/sfx/sfx_wrong.mid'
import { soundManager } from "@/utils/soundManager";

export interface HistoryWord {
  id: number
  word: string
  isValid: boolean
  count: number
}

export function useBlindText() {
  const searchQuery = ref('')
  const searchResult = ref('')
  const searchHistory = ref<HistoryWord[]>([])
  const blindTextStore = useBlindTextStore()
  const { play } = useSound(scoringSfx)

  const title = computed(() => blindTextStore.title)
  const currentText = computed(() => blindTextStore.hiddenContent)
  const totalWords = computed(() => blindTextStore.totalWords)
  const totalRevealedWords = computed(() => blindTextStore.totalRevealedWords)
  // const currentText = computed(() => blindTextStore.clearContent)

  const init = () => {
    blindTextStore.init()
    soundManager.init();
    soundManager.loadMidi(wrongSfx);
  }

  const playWrongWord = () => {
    soundManager.onWrongWord();
  }

  const submitWord = () => {
    const cleanInput: string = sanitizeInput(searchQuery.value)
    let isValid = false
    const count = blindTextStore.searchAndRevealWorld(cleanInput)
    if (count > 0) {
      searchResult.value = 'Mot trouvé'
      searchQuery.value = ''
      isValid = true
      play()
    } else {
      searchResult.value = 'Mot non trouvé'
      searchQuery.value = ''
      isValid = false
      playWrongWord()
    }

    const newHistoryWord: HistoryWord = {
      id: searchHistory.value.length + 1,
      word: cleanInput,
      isValid: isValid,
      count: count,
    }
    searchHistory.value.unshift(newHistoryWord)
  }

  const sanitizeInput = (input: string): string => {
    const cleanInput = input.trim().toLowerCase()

    return cleanInput
  }

  return {
    init,
    searchQuery,
    searchResult,
    submitWord,
    title,
    currentText,
    totalWords,
    searchHistory,
    totalRevealedWords,
  }
}
