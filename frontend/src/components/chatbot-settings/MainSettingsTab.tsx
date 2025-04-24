import { useState, useRef } from 'react'
import {
  Box,
  VStack,
  HStack,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  FormErrorMessage,
  Avatar,
  Button,
  Text,
  useColorModeValue,
  useToast,
  ScaleFade,
  Icon,
  Tooltip,
} from '@chakra-ui/react'
import { FiUpload, FiUser, FiSave, FiInfo } from 'react-icons/fi'
import { motion } from 'framer-motion'

interface MainSettingsTabProps {
  chatbotId: string
  onUpdate: (data: { title: string; description: string; icon?: File }) => Promise<void>
  initialTitle?: string
  initialDescription?: string
  initialIconUrl?: string
}

const MotionBox = motion.create(Box)

const MainSettingsTab = ({
  onUpdate,
  initialTitle = '',
  initialDescription = '',
  initialIconUrl,
}: MainSettingsTabProps) => {
  const [title, setTitle] = useState(initialTitle)
  const [description, setDescription] = useState(initialDescription)
  const [icon, setIcon] = useState<File | null>(null)
  const [iconPreview, setIconPreview] = useState<string | null>(
    initialIconUrl ? `data:image/png;base64,${initialIconUrl}` : null
  )
  const [errors, setErrors] = useState<{ title?: string; description?: string }>({})
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const toast = useToast()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBorderColor = useColorModeValue('blue.400', 'blue.300')
  const focusBorderColor = useColorModeValue('blue.500', 'blue.400')
  const textColor = useColorModeValue('gray.700', 'white')
  const labelColor = useColorModeValue('gray.600', 'gray.300')

  const handleIconChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // 2MB limit
        toast({
          title: 'File too large',
          description: 'Please select an image smaller than 2MB',
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return
      }
      setIcon(file)
      
      const reader = new FileReader()
      reader.onloadend = () => {
        setIconPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async () => {
    const newErrors: { title?: string; description?: string } = {}
    if (!title.trim()) {
      newErrors.title = 'Title is required'
    }
    if (!description.trim()) {
      newErrors.description = 'Description is required'
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      await onUpdate({ title, description, icon: icon || undefined })
    } catch (error) {
      toast({
        title: 'Error updating settings',
        description: 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <ScaleFade in={true} initialScale={0.95}>
      <VStack spacing={6} align="stretch" p={6} bg={bgColor} borderRadius="lg" boxShadow="sm">
        <Box>
          <Heading size="md" mb={4} color={textColor} display="flex" alignItems="center">
            Basic Information
            <Tooltip label="Configure your chatbot's basic settings" placement="right">
              <Box ml={2}>
                <Icon as={FiInfo} color={labelColor} />
              </Box>
            </Tooltip>
          </Heading>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.title}>
              <FormLabel fontWeight="medium" fontSize="sm" color={labelColor}>
                Title
              </FormLabel>
              <Input 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter chatbot title"
                size="md"
                bg={useColorModeValue('white', 'gray.700')}
                borderColor={borderColor}
                _hover={{
                  borderColor: hoverBorderColor
                }}
                _focus={{
                  borderColor: focusBorderColor,
                  boxShadow: `0 0 0 1px ${focusBorderColor}`
                }}
              />
              {errors.title && (
                <FormErrorMessage fontSize="xs">{errors.title}</FormErrorMessage>
              )}
            </FormControl>
            
            <FormControl isInvalid={!!errors.description}>
              <FormLabel fontWeight="medium" fontSize="sm" color={labelColor}>
                Description
              </FormLabel>
              <Textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter chatbot description"
                rows={3}
                size="md"
                bg={useColorModeValue('white', 'gray.700')}
                borderColor={borderColor}
                _hover={{
                  borderColor: hoverBorderColor
                }}
                _focus={{
                  borderColor: focusBorderColor,
                  boxShadow: `0 0 0 1px ${focusBorderColor}`
                }}
              />
              {errors.description && (
                <FormErrorMessage fontSize="xs">{errors.description}</FormErrorMessage>
              )}
            </FormControl>
          </VStack>
        </Box>

        <Box>
          <Heading size="md" mb={4} color={textColor}>
            Chatbot Icon
          </Heading>
          <HStack spacing={4} align="start">
            <MotionBox
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Avatar 
                size="lg" 
                src={iconPreview || undefined}
                name={title}
                icon={<FiUser fontSize="1.5rem" />}
                border="2px solid"
                borderColor={borderColor}
                _hover={{
                  borderColor: hoverBorderColor
                }}
              />
            </MotionBox>
            <VStack align="start" spacing={2}>
              <Button
                leftIcon={<FiUpload />}
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                colorScheme="blue"
                size="sm"
                _hover={{
                  transform: 'translateY(-1px)',
                  boxShadow: 'sm'
                }}
              >
                Change Icon
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleIconChange}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <Text fontSize="xs" color={labelColor}>
                Recommended size: 512x512 pixels
              </Text>
            </VStack>
          </HStack>
        </Box>

        <Button
          colorScheme="blue"
          onClick={handleSubmit}
          size="md"
          alignSelf="flex-end"
          leftIcon={<FiSave />}
          isLoading={isLoading}
          loadingText="Saving..."
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: 'md'
          }}
        >
          Save Changes
        </Button>
      </VStack>
    </ScaleFade>
  )
}

export default MainSettingsTab 