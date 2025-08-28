import { ref, watch } from 'vue'
import { defineStore } from 'pinia'
import text from '../data/2.txt?raw'
import type { BlindLine } from '@/models/BlindLine'
import { matchWordsInsensitive } from '@/utils/stringUtils'
import { launchFireworks } from '@/utils/confettisUtils'
import { useSound } from '@vueuse/sound'
import winSound from '@/assets/sfx/win_ya.mp3'
import fireworkSound from '@/assets/sfx/sfx_fireworks.mp3'
const delimiters = ["'", ',', '-']

const isBreakLine = (line: string[]): boolean => {
  return line.length === 1 && line[0] === ''
}

const countWords = (text: BlindLine[], isRevealed: boolean) => {
  let counter = 0
  for (const blindLine of text) {
    for (const blindWord of blindLine.blindWords) {
      if (blindWord.isRevealed === isRevealed) {
        counter++
      }
    }
  }

  return counter
}

export const useBlindTextStore = defineStore('blindText', () => {
  const title = ref<string | null>(null)
  const clearContent = ref<string[] | null>(null)
  const hiddenContent = ref<BlindLine[]>([])
  const totalWords = ref<number>(0)
  const totalRevealedWords = ref<number>(0)

  const victorySound = useSound(winSound, { volume: 0.5 })
  
  const firework = useSound(fireworkSound, { volume: 0.2 })

  watch(
    [totalRevealedWords, totalWords], ([revealed, total]) => {
      if (revealed >= total && total > 0) {
          victorySound.play();
          firework.play()
          launchFireworks(() => {
            firework.stop()
          })
      }
    }
  )

  function init() {
    const lines = text.split('\r\n')
    const titleLine = lines.find((line) => line.trim().startsWith('#'))
    title.value = titleLine ? titleLine.replace(/^#\s*/, '').trim() : 'Untitled'

    const contentLines = lines.filter((line) => line !== titleLine)
    clearContent.value = contentLines

    // Go through each line
    for (let i = 0; i < clearContent.value.length; i++) {
      const line = clearContent.value[i]

      // Split words on space character
      const words = line.split(' ')

      const newBlindLine: BlindLine = {
        id: i,
        breakLine: isBreakLine(words),
        blindWords: [],
      }

      if (!newBlindLine.breakLine) {
        let idWord = 0
        for (let j = 0; j < words.length; j++) {
          const word = words[j]

          // Split on commas and apostrophes while keeping them
          const wordSplitted = word.split(/(\s+|,|'|-)/).filter((w) => w.trim() !== '')

          const newBlindWords = []
          for (const w of wordSplitted) {
            let isRevealed = false
            if (delimiters.includes(w)) {
              isRevealed = true
            }

            newBlindWords.push({
              id: idWord++,
              letterCount: w.length,
              word: w,
              nLine: i,
              isRevealed: isRevealed,
            })
          }
          newBlindLine.blindWords = newBlindLine.blindWords.concat(newBlindWords)
        }
      }
      hiddenContent.value?.push(newBlindLine)
    }
    totalWords.value = countWords(hiddenContent.value, false)
  }

  function revealWord(idLine: number, idWord: number): void {
    const line = hiddenContent.value.find((line) => line.id === idLine)
    if (line) {
      line.blindWords = line.blindWords.map((word) =>
        word.id === idWord ? { ...word, isRevealed: true } : word,
      )
    }
  }

  function searchAndRevealWorld(word: string): number {
    let count = 0

    for (let idLine = 0; idLine < hiddenContent.value.length; idLine++) {
      const line = hiddenContent.value[idLine]

      line.blindWords = line.blindWords.map((blindWord) => {
        if (!blindWord.isRevealed && matchWordsInsensitive(blindWord.word, word)) {
          count++
          return { ...blindWord, isRevealed: true }
        } else {
          return blindWord
        }
      })
    }

    totalRevealedWords.value += count

    return count
  }

  return {
    init,
    searchAndRevealWorld,
    title,
    clearContent, // TODO : remove ?
    hiddenContent,
    totalWords,
    totalRevealedWords,
  }
})
