import { HStack, Button } from '@chakra-ui/react'
import { FiArrowLeft } from 'react-icons/fi'
import { useNavigate } from 'react-router-dom'

interface ChatbotSettingsHeaderProps {
  chatbotId: string
}

const ChatbotSettingsHeader = ({ chatbotId }: ChatbotSettingsHeaderProps) => {
  const navigate = useNavigate()

  return (
    <HStack justify="space-between" align="center" width="100%" spacing={4} mb={6}>
      <Button
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        onClick={() => navigate(`/chat/${chatbotId}`)}
        _hover={{ bg: 'blue.50' }}
        size="sm"
        colorScheme="blue"
      >
        Back to Chatbot
      </Button>
    </HStack>
  )
}

export default ChatbotSettingsHeader 