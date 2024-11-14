<template>
  <div class="experiment">
    <h1>Experiment 001 - OpenAI Chat</h1>
    
    <div class="chat-container">
      <div class="messages" ref="messagesContainer">
        <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
          {{ message.content }}
        </div>
      </div>

      <div class="input-container">
        <textarea 
          v-model="userInput" 
          @keyup.enter.exact.prevent="sendMessage"
          placeholder="Type your message..."
          :disabled="isLoading"
        ></textarea>
        <button @click="sendMessage" :disabled="isLoading || !userInput.trim()">
          {{ isLoading ? 'Sending...' : 'Send' }}
        </button>
      </div>
    </div>
    <pre>{{ messages }}</pre>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createChatCompletion } from '@/services/openai'

const userInput = ref('')
const messages = ref([])
const isLoading = ref(false)

const sendMessage = async () => {
  if (!userInput.value.trim() || isLoading.value) return

  const userMessage = { role: 'user', content: userInput.value.trim() }
  messages.value.push(userMessage)
  userInput.value = ''
  isLoading.value = true

  try {
    const response = await createChatCompletion({
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        ...messages.value
      ]
    })
    
    messages.value.push(response)
  } catch (error) {
    messages.value.push({
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again.'
    })
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.experiment {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.chat-container {
  border: 1px solid #ccc;
  border-radius: 8px;
  overflow: hidden;
}

.messages {
  height: 400px;
  overflow-y: auto;
  padding: 20px;
  background: #f5f5f5;
}

.message {
  margin-bottom: 12px;
  padding: 8px 12px;
  border-radius: 8px;
  max-width: 80%;
}

.message.user {
  background: #007bff;
  color: white;
  margin-left: auto;
}

.message.assistant {
  background: white;
  border: 1px solid #ddd;
}

.input-container {
  display: flex;
  padding: 12px;
  background: white;
  gap: 8px;
}

textarea {
  flex: 1;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  resize: vertical;
  min-height: 40px;
  max-height: 120px;
}

button {
  padding: 8px 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>