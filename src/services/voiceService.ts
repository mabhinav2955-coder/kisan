// Voice service for speech-to-text and text-to-speech functionality
// This service provides cross-browser compatibility for voice features

export interface VoiceConfig {
  language: 'en-US' | 'ml-IN';
  continuous: boolean;
  interimResults: boolean;
}

export class VoiceService {
  private recognition: any = null;
  private synthesis: SpeechSynthesis;
  private isListening = false;

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.initializeRecognition();
  }

  private initializeRecognition() {
    // Check for browser support
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognition) {
      console.warn('Speech recognition not supported in this browser');
      return;
    }

    this.recognition = new SpeechRecognition();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.maxAlternatives = 1;
  }

  // Start listening for speech input
  startListening(
    onResult: (transcript: string, isFinal: boolean) => void,
    onError?: (error: string) => void,
    language: 'en-US' | 'ml-IN' = 'en-US'
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.recognition) {
        reject(new Error('Speech recognition not supported'));
        return;
      }

      if (this.isListening) {
        this.stopListening();
      }

      this.recognition.lang = language;
      this.isListening = true;

      this.recognition.onstart = () => {
        console.log('Speech recognition started');
        resolve();
      };

      this.recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }

        if (finalTranscript) {
          onResult(finalTranscript, true);
        } else if (interimTranscript) {
          onResult(interimTranscript, false);
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        this.isListening = false;
        if (onError) {
          onError(event.error);
        }
        reject(new Error(event.error));
      };

      this.recognition.onend = () => {
        this.isListening = false;
        console.log('Speech recognition ended');
      };

      try {
        this.recognition.start();
      } catch (error) {
        this.isListening = false;
        reject(error);
      }
    });
  }

  // Stop listening
  stopListening(): void {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  // Check if currently listening
  getIsListening(): boolean {
    return this.isListening;
  }

  // Speak text using text-to-speech
  speak(
    text: string, 
    language: 'en-US' | 'ml-IN' = 'en-US',
    onEnd?: () => void
  ): void {
    // Stop any ongoing speech
    this.synthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = language;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to find a voice that matches the language
    const voices = this.synthesis.getVoices();
    const preferredVoice = voices.find(voice => 
      voice.lang.startsWith(language.split('-')[0])
    );
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }

    utterance.onend = () => {
      if (onEnd) {
        onEnd();
      }
    };

    utterance.onerror = (event) => {
      console.error('Speech synthesis error:', event.error);
    };

    this.synthesis.speak(utterance);
  }

  // Stop current speech
  stopSpeaking(): void {
    this.synthesis.cancel();
  }

  // Check if speech synthesis is supported
  isSpeechSynthesisSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  // Check if speech recognition is supported
  isSpeechRecognitionSupported(): boolean {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  }

  // Get available voices
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  // Check if currently speaking
  isSpeaking(): boolean {
    return this.synthesis.speaking;
  }
}

// Create a singleton instance
export const voiceService = new VoiceService();
