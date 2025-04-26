import { useState, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  useToast,
  Flex,
  useColorModeValue,
  type ToastPosition,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react'

import { useUser, Chatbot } from '../components/auth/UserContext'
import ChatHeader from '../components/chat/ChatHeader'
import MessageList from '../components/chat/MessageList'
import ChatFooter from '../components/chat/ChatFooter'
import CreditsToast from '../components/chat/CreditsToast'
import AccessTab from '../components/chatbot-settings/AccessTab'

interface Message {
  text: string
  isUser: boolean
}

const Chat = () => {
  // Hooks
  const { chatbotId } = useParams<{ chatbotId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, updateCredits, remainingCredits, refreshUserData } = useUser()
  const { isOpen, onOpen, onClose } = useDisclosure()

  // State
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [usePremiumModel, setUsePremiumModel] = useState(false)
  const [showPrompts, setShowPrompts] = useState(true)
  const [displayedPrompts, setDisplayedPrompts] = useState<string[]>([])
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [chatbotDetails, setChatbotDetails] = useState<Chatbot | null>(null)
  const [isLoadingDetails, setIsLoadingDetails] = useState(true)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null)

  // Focus input on load
  useEffect(() => {
    if (!isLoadingDetails) {
      const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement
      inputElement?.focus()
    }
  }, [isLoadingDetails])

  // Fetch chatbot details
  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setIsLoadingDetails(true)
        
        if (!user) return
        
        const chatbotData = user.chatbots.find(chatbot => chatbot.id === chatbotId)
        if (!chatbotData) throw new Error('Chatbot not found')
        
        setChatbotDetails(chatbotData)
        setSelectedDocuments(chatbotData.documents?.map(doc => doc.id) || [])
        setMessages([{ text: `Hello ${user.friendly_name}👋 I am the Chat Bot ${chatbotData.title}! How can I help you?`, isUser: false }])
        
      } catch (error) {
        console.error('Error fetching details:', error)
        toast({
          title: 'Error',
          description: 'Failed to load chatbot details',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
      } finally {
        setIsLoadingDetails(false)
      }
    }
    
    fetchDetails()
  }, [chatbotId, user, toast])

  // Update prompts when chatbot details change
  useEffect(() => {
    if (chatbotDetails?.suggested_prompts?.length) {
      setShowPrompts(messages.length <= 1)
      setDisplayedPrompts(chatbotDetails.suggested_prompts.slice(0, 3))
    }
  }, [chatbotDetails, messages.length])

  const showCreditsToast = (credits: number) => {
    toast({
      position: 'top-right' as ToastPosition,
      duration: 3000,
      isClosable: true,
      render: () => <CreditsToast credits={credits} />,
    })
  }

  const refreshCredits = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/get_remaining_credits`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Failed to fetch credits')

      const data = await response.json()
      await updateCredits(data.consumed_price)
    } catch (error) {
      console.error('Error refreshing credits:', error)
    }
  }

  const processStreamResponse = async (response: Response) => {
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`)
    
    const reader = response.body?.getReader()
    if (!reader) throw new Error('Response body is not readable')
    
    let botResponse = ''
    const decoder = new TextDecoder()
    let hasStartedTyping = false
    
    while (true) {
      const { done, value } = await reader.read()
      
      if (done) {
        const finalChunk = decoder.decode()
        if (finalChunk) {
          // Check if the final chunk is a credits event
          if (finalChunk.startsWith('event: credits')) {
            try {
              const lines = finalChunk.split('\n')
              const dataLine = lines.find(line => line.startsWith('data: '))
              if (dataLine) {
                const creditsData = JSON.parse(dataLine.replace('data: ', ''))
                showCreditsToast(creditsData.consumed_credits)
                // Refresh credits after showing the toast
                await refreshCredits()
              }
            } catch (e) {
              console.error('Error parsing credits data:', e)
            }
          } else {
            botResponse += finalChunk
            setMessages(prev => {
              const newMessages = [...prev]
              const lastMessage = newMessages[newMessages.length - 1]
              if (lastMessage && !lastMessage.isUser) {
                lastMessage.text = botResponse
              }
              return newMessages
            })
          }
        }
        break
      }
      
      const chunk = decoder.decode(value, { stream: true })
      
      // Check if this is a credits event
      if (chunk.includes('event: credits')) {
        try {
          const lines = chunk.split('\n')
          const dataLine = lines.find(line => line.startsWith('data: '))
          if (dataLine) {
            const creditsData = JSON.parse(dataLine.replace('data: ', ''))
            showCreditsToast(creditsData.consumed_credits)
            // Refresh credits after showing the toast
            await refreshCredits()
            continue
          }
        } catch (e) {
          console.error('Error parsing credits data:', e)
        }
      }
      
      // Only add non-credits content to the message
      if (!chunk.includes('event: credits')) {
        botResponse += chunk
        if (!hasStartedTyping) {
          hasStartedTyping = true
          setIsLoading(false)
        }
        setMessages(prev => {
          const newMessages = [...prev]
          const lastMessage = newMessages[newMessages.length - 1]
          if (lastMessage && !lastMessage.isUser) {
            lastMessage.text = botResponse
          } else {
            newMessages.push({ text: botResponse, isUser: false })
          }
          return newMessages
        })
      }
    }
  }

  const createConversation = async () => {
    const token = localStorage.getItem('token')
    if (!token || !chatbotId) {
      navigate('/')
      return
    }

    try {
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbots/create_conversation`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Failed to create conversation')
      }

      const data = await response.json()
      setConversationId(data.conversation_id)
      return data.conversation_id
    } catch (error) {
      console.error('Error creating conversation:', error)
      toast({
        title: 'Error',
        description: 'Failed to create conversation',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return null
    }
  }

  const getEstimatedDuration = async (model: string) => {
    const token = localStorage.getItem('token')
    if (!token || !chatbotId || !model) return

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbots/get_ask_estimation_duration?chatbot_id=${chatbotId}&model=${model}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )

      if (!response.ok) throw new Error('Failed to get estimated duration')

      const data = await response.json()
      setEstimatedDuration(data.estimated_duration)
    } catch (error) {
      console.error('Error getting estimated duration:', error)
    }
  }

  const sendMessage = useCallback(async (message: string) => {
    const token = localStorage.getItem('token')
    if (!token || !chatbotId) {
      navigate('/')
      return
    }

    const selectedModel = usePremiumModel ? 'gemini-1.5-pro-002' : 'gemini-2.0-flash-001'
    
    try {
      setIsLoading(true)
      setEstimatedDuration(null)
      await getEstimatedDuration(selectedModel)
      
      // If this is the first message, create a conversation first
      let currentConversationId = conversationId
      if (!currentConversationId) {
        currentConversationId = await createConversation()
        if (!currentConversationId) return
      }
      
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId)
      formData.append('message', message)
      formData.append('model', selectedModel)
      formData.append('conversation_id', currentConversationId)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbots/ask_chatbot`,
        {
          method: 'POST',
          headers: {
            'Accept': 'text/event-stream',
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )
      
      await processStreamResponse(response)
    } catch (error) {
      console.error('Error:', error)
      toast({
        title: 'Error',
        description: 'Failed to get response from chatbot',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }, [chatbotId, conversationId, usePremiumModel, navigate, toast])

  const handlePromptClick = async (prompt: string) => {
    if (remainingCredits === null || remainingCredits <= 0) {
      toast({
        title: 'No Credits Available',
        description: 'You do not have enough credits to send messages. Please wait for your credits to refresh.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setShowPrompts(false)
    setMessages(prev => [...prev, { text: prompt, isUser: true }])
    setInput('')
    setIsLoading(true)
    
    try {
      await sendMessage(prompt)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    if (remainingCredits === null || remainingCredits <= 0) {
      toast({
        title: 'No Credits Available',
        description: 'You do not have enough credits to send messages. Please wait for your credits to refresh.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    setShowPrompts(false)
    const userMessage = input
    setInput('')
    setMessages(prev => [...prev, { text: userMessage, isUser: true }])
    setIsLoading(true)
    
    try {
      await sendMessage(userMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e)
    }
  }

  const handleSourceIdentification = async () => {
    const token = localStorage.getItem('token')
    if (!token || !chatbotId || !conversationId) {
      navigate('/')
      return
    }

    if (remainingCredits === null || remainingCredits <= 0) {
      toast({
        title: 'No Credits Available',
        description: 'You do not have enough credits to identify sources. Please wait for your credits to refresh.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    const selectedModel = usePremiumModel ? 'gemini-1.5-pro-002' : 'gemini-2.0-flash-001'
    
    try {
      // Set loading state and reset estimated duration
      setIsLoading(true)
      setEstimatedDuration(null)
      
      // Get estimated duration
      await getEstimatedDuration(selectedModel)
      
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId)
      formData.append('model', selectedModel)
      formData.append('conversation_id', conversationId)

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbots/get_last_message_sources`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )

      if (!response.ok) {
        throw new Error('Failed to get sources')
      }

      const data = await response.json()
      
      // Show credits toast
      showCreditsToast(data.consumed_credits)
      
      // Refresh credits
      await refreshCredits()
      
      // Add the source identification as a new message
      setMessages(prev => [
        ...prev,
        { text: data.answer, isUser: false }
      ])
      
    } catch (error) {
      console.error('Error getting sources:', error)
      toast({
        title: 'Error',
        description: 'Failed to identify sources',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      // Reset loading state and estimated duration
      setIsLoading(false)
      setEstimatedDuration(null)
    }
  }

  const clearConversation = () => {
    if (chatbotDetails && user) {
      // Reset to initial welcome message
      setMessages([{ 
        text: `Hello ${user.friendly_name}👋 I am the Chat Bot ${chatbotDetails.title}! How can I help you?`, 
        isUser: false 
      }])
      // Reset conversation ID so a new conversation will be created on next message
      setConversationId(null)
      // Show prompts again
      setShowPrompts(true)
    }
  }

  const handleShareWithUser = async (params: { chatbot_id: string, user_email: string, role: string }) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/')
        return
      }
      
      const formData = new FormData()
      formData.append('chatbot_id', params.chatbot_id)
      formData.append('user_email', params.user_email)
      formData.append('role', params.role)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot_settings/share_chatbot`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to share chatbot')
      }
      
      await refreshUserData()
      toast({
        title: 'Success',
        description: 'Chatbot shared successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error sharing chatbot:', error)
      toast({
        title: 'Error',
        description: 'Failed to share chatbot',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRemoveAccess = async (email: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/')
        return
      }
      
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId || '')
      formData.append('user_email', email)
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot_settings/remove_access_chatbot/${chatbotId}/${encodeURIComponent(email)}`,
        {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to remove access')
      }
      
      await refreshUserData()
      toast({
        title: 'Success',
        description: 'Access removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error removing access:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove access',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  const handleRequestPublicAccess = async (chatbotId: string) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/')
        return
      }
      
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId)
      
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot_settings/request_for_public_sharing`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        }
      )
      
      if (!response.ok) {
        throw new Error('Failed to request public access')
      }
      
      await refreshUserData()
      toast({
        title: 'Success',
        description: 'Public access request submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
    } catch (error) {
      console.error('Error requesting public access:', error)
      toast({
        title: 'Error',
        description: 'Failed to request public access',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    }
  }

  return (
    <Flex
      direction="column"
      h="100vh"
      bg={useColorModeValue('gray.50', 'gray.900')}
    >
      <ChatHeader 
        chatbotDetails={chatbotDetails}
        onBack={() => navigate('/dashboard')}
        onSettings={() => navigate(`/chatbot/${chatbotId}/settings`)}
        onShare={onOpen}
        onClearConversation={clearConversation}
        hasMessages={messages.length > 1}
      />
      <MessageList 
        messages={messages}
        chatbotDetails={chatbotDetails}
        onDocumentSelect={setSelectedDocuments}
        selectedDocuments={selectedDocuments}
        isLoadingDetails={isLoadingDetails}
        isTyping={isLoading}
        estimatedDuration={estimatedDuration}
        onSourceIdentification={handleSourceIdentification}
        onClearConversation={clearConversation}
        hasMessages={messages.length > 1}
      />
      <ChatFooter
        input={input}
        isLoading={isLoading}
        usePremiumModel={usePremiumModel}
        onInputChange={setInput}
        onPremiumModelChange={setUsePremiumModel}
        onSubmit={handleSubmit}
        onKeyDown={handleKeyDown}
        showPrompts={showPrompts}
        prompts={displayedPrompts}
        onPromptClick={handlePromptClick}
        onClosePrompts={() => setShowPrompts(false)}
      />

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Chatbot</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {chatbotDetails && (
              <AccessTab
                chatbotId={chatbotId || ''}
                chatbot={chatbotDetails}
                accessStatus={chatbotDetails.access as 'private' | 'pending_public_request' | 'public'}
                onShareWithUser={handleShareWithUser}
                onRemoveAccess={handleRemoveAccess}
                onRequestPublicAccess={handleRequestPublicAccess}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Flex>
  )
}

export default Chat