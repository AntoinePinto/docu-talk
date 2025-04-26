import { useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  Box,
  VStack,
  Text,
  useToast,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Container,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react'
import { FiSettings, FiFile } from 'react-icons/fi'
import { useUser } from '../components/auth/UserContext'
import ChatbotSettingsHeader from '../components/chatbot-settings/ChatbotSettingsHeader'
import MainSettingsTab from '../components/chatbot-settings/MainSettingsTab'
import DocumentsTab from '../components/chatbot-settings/DocumentsTab'

// Constants
const TOAST_DURATION = 3000

// Types
type ChatbotAccess = 'private' | 'pending_public_request' | 'public'

interface Chatbot {
  id: string
  title: string
  description: string
  icon: string
  access: ChatbotAccess
  user_role: string
  suggested_prompts: string[]
  documents: Array<{ id: string; filename: string }>
  accesses: Array<{
    user_id: string
    role: string
  }>
}

interface UpdateChatbotData {
  title: string
  description: string
  icon?: File
}

// Utility function for API requests
const makeApiRequest = async (
  endpoint: string,
  method: string,
  token: string,
  body?: FormData | string,
  headers: Record<string, string> = {}
) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot_settings/${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...headers
    },
    body
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`)
  }

  return response
}

const ChatbotSettings = () => {
  const { chatbotId } = useParams<{ chatbotId: string }>()
  const navigate = useNavigate()
  const toast = useToast()
  const { user, refreshUserData } = useUser()

  const showToast = useCallback((title: string, description: string, status: 'success' | 'error') => {
    toast({
      title,
      description,
      status,
      duration: TOAST_DURATION,
      isClosable: true,
    })
  }, [toast])

  const handleApiError = useCallback((error: unknown, action: string) => {
    console.error(`Error ${action}:`, error)
    showToast('Error', `Failed to ${action}`, 'error')
  }, [showToast])

  const handleUpdateChatbot = async (data: UpdateChatbotData) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/')
        return
      }
      
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId || '')
      formData.append('title', data.title)
      formData.append('description', data.description)
      
      if (data.icon) {
        formData.append('icon', data.icon)
      }
      
      await makeApiRequest('update_chatbot', 'POST', token, formData)
      await refreshUserData()
      showToast('Success', 'Chatbot updated successfully', 'success')
    } catch (error) {
      handleApiError(error, 'update chatbot')
    }
  }

  const chatbot = user?.chatbots.find(c => c.id === chatbotId) as Chatbot | undefined

  return (
    <Container maxW="container.lg" py={2}>
      <ChatbotSettingsHeader chatbotId={chatbotId || ''} />

      <Box 
        bg={useColorModeValue('white', 'gray.800')}
        borderRadius="lg"
        boxShadow="sm"
        p={4}
      >
        <Tabs variant="unstyled" size="md">
          <TabList 
            borderBottomWidth="1px" 
            borderColor={useColorModeValue('gray.200', 'gray.700')}
            mb={4}
            gap={2}
          >
            <Tab
              py={2}
              px={4}
              display="flex"
              alignItems="center"
              gap={2}
              fontSize="sm"
              fontWeight="medium"
              color={useColorModeValue('gray.600', 'gray.400')}
              _selected={{
                color: 'blue.500',
                borderBottomWidth: '2px',
                borderBottomColor: 'blue.500',
                marginBottom: '-1px',
              }}
              _hover={{
                color: 'blue.400',
              }}
              transition="all 0.2s"
            >
              <Icon as={FiSettings} boxSize={4} />
              <Text>Main</Text>
            </Tab>
            <Tab
              py={2}
              px={4}
              display="flex"
              alignItems="center"
              gap={2}
              fontSize="sm"
              fontWeight="medium"
              color={useColorModeValue('gray.600', 'gray.400')}
              _selected={{
                color: 'blue.500',
                borderBottomWidth: '2px',
                borderBottomColor: 'blue.500',
                marginBottom: '-1px',
              }}
              _hover={{
                color: 'blue.400',
              }}
              transition="all 0.2s"
            >
              <Icon as={FiFile} boxSize={4} />
              <Text>Documents</Text>
            </Tab>
          </TabList>
          
          <TabPanels>
            <TabPanel p={2}>
              <VStack spacing={3} align="stretch">
                <MainSettingsTab
                  chatbotId={chatbotId || ''}
                  onUpdate={handleUpdateChatbot}
                  initialTitle={chatbot?.title}
                  initialDescription={chatbot?.description}
                  initialIconUrl={chatbot?.icon}
                />
              </VStack>
            </TabPanel>
            
            <TabPanel p={2}>
              <DocumentsTab
                documents={chatbot?.documents || []}
                onDelete={refreshUserData}
                chatbotId={chatbotId || ''}
                onUploadSuccess={refreshUserData}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>
    </Container>
  )
}

export default ChatbotSettings 