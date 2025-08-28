import { Midi } from "@tonejs/midi";

export interface NoteData {
  name: string;
  freq: number;
}

class SoundManager {
  private audioCtx: AudioContext | null = null;
  private notes: NoteData[] = [];
  private currentIndex = 0;
  private wrongAttempts = 0;
  private midiLoaded = false;

  /**
   * Initialise l'audio context (à appeler au premier clic utilisateur)
   */
  init() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  /**
   * Charger un fichier MIDI et extraire les notes
   */
  async loadMidi(path: string) {
    if (!this.audioCtx) this.init();

    const response = await fetch(path);
    const arrayBuffer = await response.arrayBuffer();
    const midi = new Midi(arrayBuffer);

    // Trouve la première piste avec des notes
    let notesFound = false;
    // for (const track of midi.tracks) {
      if (midi.tracks[1].notes.length > 0) {
        this.notes = midi.tracks[1].notes.map((n) => ({
          name: n.name,
          freq: this.midiToFreq(n.midi),
        }));
        notesFound = true;
        // break;
      }
    // }

    if (!notesFound) {
      // console.warn("No MIDI track with notes found");
      console.warn("Error. Something went wrong somewhere. Contact dev.");
    } else {
      console.log("Sounds good.", this.notes.length);
    }

    this.currentIndex = 0;
    this.midiLoaded = notesFound;
  }

  /**
   * Jouer une note (oscillateur)
   */
  private playNote(freq: number, duration = 0.4) {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.frequency.value = freq;
    osc.type = "sine";

    osc.connect(gain);
    gain.connect(this.audioCtx.destination);

    // volume + petit fade-out
    gain.gain.setValueAtTime(0.2, this.audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      this.audioCtx.currentTime + duration
    );

    osc.start();
    osc.stop(this.audioCtx.currentTime + duration);
  }

  /**
   * Jouer un son d'erreur simple
   */
  private playErrorSound() {
    this.playNote(150, 0.3); // beep grave
  }

  /**
   * À appeler lorsqu’un mot est faux
   */
  onWrongWord() {
    this.wrongAttempts++;

    if (this.wrongAttempts < 20 || !this.midiLoaded) {
      this.playErrorSound();
    } else {
      const note = this.notes[this.currentIndex];
      if (note) {
        this.playNote(note.freq);
        this.currentIndex = (this.currentIndex + 1) % this.notes.length;
      }
    }
  }

  /**
   * Réinitialiser le compteur d'erreurs et la mélodie
   */
  reset() {
    this.wrongAttempts = 0;
    this.currentIndex = 0;
  }

  /**
   * Conversion MIDI → fréquence
   */
  private midiToFreq(midi: number): number {
    return 440 * Math.pow(2, (midi - 69) / 12);
  }
}

export const soundManager = new SoundManager();
