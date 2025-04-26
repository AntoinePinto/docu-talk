import { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Input,
  Select,
  Button,
  IconButton,
  Text,
  Avatar,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Divider,
  Icon,
  useToast,
  ScaleFade,
  Tooltip,
  FormControl,
  FormLabel,
  Stack,
  useBreakpointValue,
} from '@chakra-ui/react'
import { FiUser, FiGlobe, FiX, FiInfo, FiShare2, FiTrash2 } from 'react-icons/fi'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Chatbot } from '../auth/UserContext'
import { useUser } from '../auth/UserContext'

interface AccessTabProps {
  chatbotId: string
  chatbot: Chatbot
  accessStatus: 'private' | 'pending_public_request' | 'public'
  onShareWithUser: (params: { chatbot_id: string, user_email: string, role: string }) => Promise<void>
  onRemoveAccess: (email: string) => Promise<void>
  onRequestPublicAccess: (chatbotId: string) => Promise<void>
}

const MotionBox = motion.create(Box)

const AccessTab = ({
  chatbotId,
  chatbot,
  accessStatus,
  onShareWithUser,
  onRemoveAccess,
  onRequestPublicAccess,
}: AccessTabProps) => {
  const [newUserEmail, setNewUserEmail] = useState('')
  const [newUserRole, setNewUserRole] = useState('user')
  const [isRequestingPublicAccess, setIsRequestingPublicAccess] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [deletingEmail, setDeletingEmail] = useState<string | null>(null)
  const toast = useToast()
  const navigate = useNavigate()
  const { refreshUserData, user } = useUser()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBorderColor = useColorModeValue('blue.400', 'blue.300')
  const textColor = useColorModeValue('gray.700', 'white')
  const labelColor = useColorModeValue('gray.600', 'gray.300')

  const stackSpacing = useBreakpointValue({ base: 2, md: 3 })
  const padding = useBreakpointValue({ base: 3, md: 6 })
  const headingSize = useBreakpointValue({ base: "sm", md: "md" })
  const inputSize = useBreakpointValue({ base: "sm", md: "md" })
  const avatarSize = useBreakpointValue({ base: "xs", md: "sm" })
  const textSize = useBreakpointValue({ base: "sm", md: "md" })
  const globeIconSize = useBreakpointValue({ base: 4, md: 5 })
  const userIconSize = useBreakpointValue({ base: 5, md: 6 })
  const buttonSize = useBreakpointValue({ base: "sm", md: "md" })
  const alertTitleSize = useBreakpointValue({ base: "sm", md: "md" })
  const alertDescSize = useBreakpointValue({ base: "xs", md: "sm" })

  const handleShareWithUser = async () => {
    if (!newUserEmail.trim()) {
      toast({
        title: 'Email required',
        description: 'Please enter an email address',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
      return
    }

    try {
      setIsSharing(true)
      await onShareWithUser({
        chatbot_id: chatbotId,
        user_email: newUserEmail,
        role: newUserRole
      })
      setNewUserEmail('')
      setNewUserRole('user')
    } catch (error) {
      toast({
        title: 'Error sharing access',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsSharing(false)
    }
  }

  const handleRequestPublicAccess = async () => {
    setIsRequestingPublicAccess(true)
    try {
      await onRequestPublicAccess(chatbotId)
    } catch (error) {
      toast({
        title: 'Error submitting request',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsRequestingPublicAccess(false)
    }
  }

  const handleDeleteChatbot = async () => {
    setIsDeleting(true)
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/')
        return
      }
      
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId)
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot_settings/delete_chatbot/${chatbotId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to delete chatbot')
      }
      
      await refreshUserData()
      
      toast({
        title: 'Success',
        description: 'Chatbot deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      })
      
      navigate('/dashboard')
    } catch (error) {
      console.error('Error deleting chatbot:', error)
      toast({
        title: 'Error',
        description: 'Failed to delete chatbot',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const handleRemoveAccess = async (email: string) => {
    try {
      setDeletingEmail(email)
      await onRemoveAccess(email)
    } catch (error) {
      toast({
        title: 'Error removing access',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setDeletingEmail(null)
    }
  }

  return (
    <ScaleFade in={true} initialScale={0.95}>
      <VStack spacing={4} align="stretch" p={padding} bg={bgColor} borderRadius="lg" boxShadow="sm">
        <Box>
          <Heading size={headingSize} mb={4} color={textColor} display="flex" alignItems="center">
            Share with User
            <Tooltip label="Share your chatbot with specific users" placement="right">
              <Box ml={2}>
                <Icon as={FiInfo} color={labelColor} />
              </Box>
            </Tooltip>
          </Heading>
          <MotionBox
            p={padding}
            bg={bgColor}
            borderRadius="lg"
            borderWidth="1px"
            borderColor={borderColor}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <VStack spacing={4} align="stretch">
              <FormControl>
                <FormLabel fontSize="sm" color={labelColor}>Email Address</FormLabel>
                <VStack spacing={3} align="stretch">
                  <Input
                    placeholder="Enter email address"
                    value={newUserEmail}
                    onChange={(e) => setNewUserEmail(e.target.value)}
                    size={inputSize}
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={borderColor}
                    _hover={{
                      borderColor: hoverBorderColor
                    }}
                    _focus={{
                      borderColor: 'blue.500',
                      boxShadow: '0 0 0 1px blue.500'
                    }}
                  />
                  <Select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    size={inputSize}
                    bg={useColorModeValue('white', 'gray.700')}
                    borderColor={borderColor}
                    _hover={{
                      borderColor: hoverBorderColor
                    }}
                  >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                  </Select>
                  <Button
                    colorScheme="blue"
                    onClick={handleShareWithUser}
                    isDisabled={!newUserEmail.trim() || isSharing}
                    size={buttonSize}
                    leftIcon={<FiShare2 />}
                    isLoading={isSharing}
                    loadingText="Sharing..."
                    _hover={{
                      transform: 'translateY(-1px)',
                      boxShadow: 'sm'
                    }}
                  >
                    Share
                  </Button>
                </VStack>
              </FormControl>
            </VStack>
          </MotionBox>
        </Box>
        
        <Divider borderColor={borderColor} />
        
        <Box>
          <Heading size={headingSize} mb={4} color={textColor}>
            Shared Users
          </Heading>
          {chatbot.accesses && chatbot.accesses.length > 0 ? (
            <VStack spacing={3} align="stretch">
              {chatbot.accesses.map((access: { user_id: string, role: string }, index: number) => (
                <MotionBox
                  key={index}
                  p={padding}
                  bg={bgColor}
                  borderRadius="lg"
                  borderWidth="1px"
                  borderColor={borderColor}
                  _hover={{
                    borderColor: hoverBorderColor,
                    boxShadow: 'sm',
                    transform: 'translateY(-1px)'
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <Stack
                    direction={{ base: 'column', sm: 'row' }}
                    justify="space-between"
                    align={{ base: 'flex-start', sm: 'center' }}
                    spacing={stackSpacing}
                  >
                    <HStack spacing={3}>
                      <Avatar size={avatarSize} name={access.user_id} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize={textSize} fontWeight="medium">{access.user_id}</Text>
                        <Badge 
                          colorScheme={access.role === 'Admin' ? 'purple' : 'blue'}
                          fontSize="xs"
                          px={2}
                          py={0.5}
                          borderRadius="full"
                        >
                          {access.role}
                        </Badge>
                      </VStack>
                    </HStack>
                    {user?.email !== access.user_id && (
                      <IconButton
                        aria-label="Remove access"
                        icon={<FiX />}
                        size={buttonSize}
                        colorScheme="red"
                        variant="ghost"
                        onClick={() => handleRemoveAccess(access.user_id)}
                        isLoading={deletingEmail === access.user_id}
                        isDisabled={deletingEmail !== null}
                        _hover={{
                          transform: 'scale(1.1)',
                          color: 'red.500'
                        }}
                      />
                    )}
                  </Stack>
                </MotionBox>
              ))}
            </VStack>
          ) : (
            <MotionBox
              p={padding}
              textAlign="center"
              bg={useColorModeValue('gray.50', 'gray.700')}
              borderRadius="lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon as={FiUser} boxSize={userIconSize} color="gray.400" mb={2} />
              <Text fontSize={textSize} color={labelColor}>
                No users shared with yet
              </Text>
            </MotionBox>
          )}
        </Box>
        
        <Divider borderColor={borderColor} />
        
        <Box>
          <Heading size={headingSize} mb={4} color={textColor}>
            Public Access
          </Heading>
          {accessStatus === 'pending_public_request' ? (
            <Alert 
              status="info" 
              variant="subtle"
              borderRadius="lg"
              p={padding}
            >
              <AlertIcon />
              <Box>
                <AlertTitle fontSize={alertTitleSize}>Public Access Request Pending</AlertTitle>
                <AlertDescription fontSize={alertDescSize}>
                  Your request for public access is being reviewed.
                </AlertDescription>
              </Box>
            </Alert>
          ) : (
            <MotionBox
              p={padding}
              bg={bgColor}
              borderRadius="lg"
              borderWidth="1px"
              borderColor={borderColor}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <VStack spacing={3} align="stretch">
                <HStack>
                  <Icon as={FiGlobe} color="green.500" boxSize={globeIconSize} />
                  <Text fontSize={textSize} fontWeight="medium">
                    Make your chatbot public
                  </Text>
                </HStack>
                <Text fontSize={alertDescSize} color={labelColor}>
                  This will make your chatbot accessible to anyone with the link. 
                  You can always make it private again later.
                </Text>
                <Button
                  leftIcon={<FiGlobe />}
                  colorScheme="green"
                  variant="outline"
                  onClick={handleRequestPublicAccess}
                  isLoading={isRequestingPublicAccess}
                  loadingText="Requesting..."
                  size={buttonSize}
                  _hover={{
                    transform: 'translateY(-1px)',
                    boxShadow: 'sm'
                  }}
                >
                  Request for Public Sharing
                </Button>
              </VStack>
            </MotionBox>
          )}
        </Box>

        <Divider borderColor={borderColor} />

        <Box>
          <Button
            colorScheme="red"
            variant="outline"
            leftIcon={<FiTrash2 />}
            size={buttonSize}
            onClick={handleDeleteChatbot}
            isLoading={isDeleting}
            loadingText="Deleting..."
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'sm'
            }}
            width="100%"
          >
            Delete Chatbot
          </Button>
        </Box>
      </VStack>
    </ScaleFade>
  )
}

export default AccessTab 