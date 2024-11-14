import { ref } from 'vue'

export const useSpeechRecognition = () => {
  const isListening = ref(false)
  const error = ref(null)
  let recognition = null

  // Check browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  if (SpeechRecognition) {
    recognition = new SpeechRecognition()
    recognition.continuous = true // Keep listening
    recognition.interimResults = true // Get results as user speaks
    recognition.lang = 'en-US'
  }

  const startListening = (onResult) => {
    if (!recognition) {
      error.value = 'Speech recognition not supported in this browser'
      return
    }

    let finalTranscript = ''

    recognition.onresult = (event) => {
      let interimTranscript = ''
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' '
        } else {
          interimTranscript += transcript
        }
      }

      // Call onResult with both final and interim results
      onResult(finalTranscript.trim(), interimTranscript)
    }

    recognition.onend = () => {
      // Only set isListening to false if we meant to stop
      if (isListening.value) {
        recognition.start()
      }
    }

    recognition.onerror = (event) => {
      error.value = event.error
      isListening.value = false
    }

    try {
      recognition.start()
      isListening.value = true
      error.value = null
    } catch (e) {
      error.value = e.message
    }
  }

  const stopListening = () => {
    if (recognition) {
      isListening.value = false
      recognition.stop()
    }
  }

  return {
    isListening,
    error,
    startListening,
    stopListening
  }
} 