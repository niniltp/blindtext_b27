<script setup lang="ts">
import { useBlindText } from '@/composables/useBlindText'
import { onBeforeMount, ref, computed } from 'vue'
import ProgressBar from 'primevue/progressbar'
import Button from 'primevue/button'
import { InputText } from 'primevue'
import ScrollPanel from 'primevue/scrollpanel'
import Card from 'primevue/card'
import Badge from 'primevue/badge'

const {
  init,
  searchQuery,
  searchResult,
  submitWord,
  title,
  currentText,
  totalWords,
  totalRevealedWords,
  searchHistory,
} = useBlindText()
onBeforeMount(async () => init())

defineProps<{
  msg: string
}>()

const showHistory = ref<boolean>(false)

const percentRevealed = computed(() =>
  Math.trunc((totalRevealedWords.value * 100) / totalWords.value),
)

const displayLettersCount = (indexLine: number, indexWord: number) => {
  // console.log('toggle letters count') // TODO
  console.log(currentText.value[indexLine].blindWords[indexWord].word.length)
}

const toggleHistory = () => {
  showHistory.value = !showHistory.value
}
</script>

<template id="blindTextGame">
  <div class="grid lg:grid-cols-5 gap-5 grid-cols-2">
    <div class="col-span-4">
      <!-- <h3 class="font-medium text-lg pb-1">{{ title }}</h3> -->
      <div class="md:columns-1 gap-10 sm:columns-1">
        <!-- <div class="md:columns-2 gap-10 sm:columns-1"> -->
        <!-- USE INSTEAD FOR SONG LYRICS-->
        <div
          v-for="(blindLine, indexLine) in currentText"
          :key="indexLine"
          class="break-inside-avoid flex flex-no-wrap gap-x-2 pb-1"
        >
          <br v-if="blindLine.breakLine" />
          <template v-else>
            <span
              v-for="(blindWord, indexWord) in blindLine.blindWords"
              :key="indexWord"
              @click="displayLettersCount(indexLine, indexWord)"
              class="relative inline-block px-1"
            >
              <!-- <Transition name="fade"> -->
              <template v-if="blindWord.isRevealed">
                <span>{{ blindWord.word }}</span>
              </template>
              <!-- </Transition> -->
              <!-- <Transition> -->
              <div v-if="!blindWord.isRevealed">
                <span class="invisible">{{ blindWord.word }}</span>
                <span
                  class="absolute left-0 top-0 h-full w-full highlight-hidden-text rounded"
                ></span>
              </div>
              <!-- </Transition> -->
              <!-- <template v-if="!blindWord.isRevealed">
                  <span class="invisible">{{ blindWord.word }}</span>
                  <span
                    class="absolute left-0 top-0 h-full w-full highlight-hidden-text rounded"
                  ></span>
                </template> -->
            </span>
          </template>
        </div>
      </div>
    </div>
    <div class="lg:col-span-1 pl-5 hidden lg:block">
      <ScrollPanel style="width: 100%; height: 70vh">
        <Card>
          <template #content>
            <ul class="lg:columns-1 columns-2">
              <li
                v-for="(wordHistory, indexHistory) in searchHistory"
                :key="indexHistory"
                :class="wordHistory.isValid ? 'text-success' : 'text-error'"
                class="flex items-center justify-between"
              >
                <span>{{ wordHistory.id }}. {{ wordHistory.word }}</span>
                <Badge
                  size="small"
                  severity="secondary"
                  :value="wordHistory.count"
                  v-if="wordHistory.count > 0"
                ></Badge>
              </li>
            </ul>
          </template>
        </Card>
      </ScrollPanel>
    </div>
  </div>
  <div class="pt-4 col-span-5">
    <div class="flex gap-1 justify-center">
      <InputText
        v-model="searchQuery"
        @keyup.enter="submitWord"
        @keyup.space="submitWord"
        placeholder="Find a word"
        class="rounded-left rounded-input"
      />
      <!-- Bouton de soumission -->
      <Button
        @click="submitWord"
        icon="pi pi-send"
        size="small"
        class="rounded-right rounded-button"
      />
    </div>

    <div class="lg:pb-0 pb-5">
      <p class="text-sm text-primary place-self-end pb-1 pt-2">
        {{ totalRevealedWords }} / {{ totalWords }} words
      </p>
      <ProgressBar :value="percentRevealed"></ProgressBar>
    </div>

    <div class="block lg:hidden">
      <Button
        outlined
        rounded
        size="small"
        :label="showHistory ? 'Hide history' : 'Show history'"
        :icon="showHistory ? 'pi pi-angle-down' : 'pi pi-angle-up'"
        @click="toggleHistory"
      />

      <ScrollPanel style="width: 100%; height: 20vh" v-if="showHistory" class="pt-5">
        <Card>
          <template #content>
            <ul class="md:columns-4 columns-2">
              <li
                v-for="(wordHistory, indexHistory) in searchHistory"
                :key="indexHistory"
                :class="wordHistory.isValid ? 'text-success' : 'text-error'"
                class="flex items-center justify-between"
              >
                <span>{{ wordHistory.id }}. {{ wordHistory.word }}</span>
                <Badge
                  size="small"
                  severity="secondary"
                  :value="wordHistory.count"
                  v-if="wordHistory.count > 0"
                ></Badge>
              </li>
            </ul>
          </template>
        </Card>
      </ScrollPanel>
    </div>
  </div>
</template>

<style scoped>
.rounded-left {
  /* border-radius: calc(infinity * 1px); */
  border-top-left-radius: 9999px;
  border-bottom-left-radius: 9999px;
}

.rounded-right {
  /* border-radius: calc(infinity * 1px); */
  border-top-right-radius: 9999px;
  border-bottom-right-radius: 9999px;
}

.rounded-button {
  padding-left: 1rem;
  padding-right: 1.5rem;
}

.rounded-input {
  min-width: 15rem;
}

.highlight-hidden-text {
  background-color: var(--highlight-bg);
}

.content {
  font-size: 1rem;
}

.text-success {
  color: var(--p-green-500);
}

.text-error {
  color: var(--p-red-500);
}

@media (min-width: 1024px) {
  .greetings h1,
  .greetings h3 {
    text-align: left;
  }
}

@media (min-width: 1024px) {
  /* #game {
    display: flex;
    place-items: center;
  } */

  #blindTextGame {
    /* display: grid;
    grid-template-columns: 1fr 1fr; */
    /* padding: 0 2rem; */
  }
}
</style>
