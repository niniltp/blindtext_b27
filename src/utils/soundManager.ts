import { Midi } from "@tonejs/midi";
import { ref } from 'vue'
import { useSound } from '@vueuse/sound'
import winSfx from '../assets/sfx/win_ya.mp3'

export interface NoteData {
  name: string;
  freq: number;
}

export function soundManager () {
  let audioCtx: AudioContext | null = null
  const notes = ref<{ name: string; freq: number }[]>([])
  let currentIndex = 0
  let wrongAttempts = 0
  let midiLoaded = false
  
  const victorySound = useSound(winSfx, { volume: 1 })
  
  /**
  * Initialise l'audio context (à appeler au premier clic utilisateur)
  */
  const initSM = () => {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }
  
  /**
  * Charger un fichier MIDI et extraire les notes
  */
  const loadMidi = async (path: string) => {
    if (!audioCtx) initSM();
    
    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);
    
    // Trouve la première piste avec des notes
    let notesFound = false;
    for (const track of midi.tracks) {
      if (track.notes.length > 0) {
        notes.value = track.notes.map((n) => ({
          name: n.name,
          freq: midiToFreq(n.midi),
        }));
        
        notesFound = true;
        break;
      }
    }
    
    if (!notesFound) {
      // console.warn("No MIDI track with notes found");
      console.warn("Error. Something went wrong somewhere. Contact dev.");
    } else {
      console.log("Sounds good.", notes.value.length);
    }
    
    currentIndex = 0;
    midiLoaded = notesFound;
  }
  
  /**
  * Jouer une note (oscillateur)
  */
  const playNote = (freq: number, duration = 0.4) => {
    if (!audioCtx) return;
    
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.frequency.value = freq;
    osc.type = "sine";
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    // volume + petit fade-out
    gain.gain.setValueAtTime(0.2, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      audioCtx.currentTime + duration
    );
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  }
  
  /**
  * Jouer un son d'erreur simple
  */
  const playErrorSound = () => {
    playNote(150, 0.3); // beep grave
  }
  
  const playVictory = () => {
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume()
      
    victorySound.play();
    console.log("Yay !! Congrats, you have found all the words")
  }
  
  /**
  * À appeler lorsqu’un mot est faux
  */
  const onWrongWord = () => {
    wrongAttempts++;
    
    if (wrongAttempts < 20 || !midiLoaded) {
      playErrorSound();
    } else {
      const note = notes.value[currentIndex];
      if (note) {
        playNote(note.freq);
        currentIndex = (currentIndex + 1) % notes.value.length;
      }
    }
  }
  
  /**
  * Réinitialiser le compteur d'erreurs et la mélodie
  */
  const reset = () => {
    wrongAttempts = 0;
    currentIndex = 0;
  }
  
  /**
  * Conversion MIDI → fréquence
  */
  const midiToFreq = (midi: number) => {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
  
  return {
    initSM,
    loadMidi,
    playNote,
    onWrongWord,
    playVictory,
    reset,
  }
}