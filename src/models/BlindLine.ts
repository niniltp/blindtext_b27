import type { BlindWord } from './BlindWord'

export interface BlindLine {
  id: number
  blindWords: BlindWord[]
  breakLine: boolean
}
