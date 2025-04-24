import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Box,
  VStack,
  HStack,
  Heading,
  Icon,
  Text,
  Button,
  IconButton,
  useColorModeValue,
  Divider,
  useToast,
  ScaleFade,
  Tooltip,
  Badge,
} from '@chakra-ui/react'
import { FiFile, FiUpload, FiTrash2, FiInfo } from 'react-icons/fi'
import { useUser } from '../auth/UserContext'

interface Document {
  id: string
  filename: string
}

interface DocumentsTabProps {
  documents: Document[]
  onDelete: (documentId: string) => Promise<void>
  chatbotId: string
  onUploadSuccess?: () => void
}

const MotionBox = motion.create(Box)

const DocumentsTab = ({ documents, onDelete, chatbotId, onUploadSuccess }: DocumentsTabProps) => {
  const [newDocuments, setNewDocuments] = useState<File[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [deletingDocumentId, setDeletingDocumentId] = useState<string | null>(null)
  const toast = useToast()
  const navigate = useNavigate()
  const { refreshUserData } = useUser()

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.700')
  const hoverBorderColor = useColorModeValue('blue.400', 'blue.300')
  const textColor = useColorModeValue('gray.700', 'white')
  const labelColor = useColorModeValue('gray.600', 'gray.300')
  const uploadBgColor = useColorModeValue('blue.50', 'blue.900')
  const uploadBorderColor = useColorModeValue('blue.200', 'blue.700')

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: `${file.name} is larger than 10MB`,
          status: 'error',
          duration: 3000,
          isClosable: true,
        })
        return false
      }
      return true
    })
    setNewDocuments(validFiles)
  }

  const handleUpload = async () => {
    if (newDocuments.length === 0) return

    setIsUploading(true)
    try {
      const formData = new FormData()
      formData.append('chatbot_id', chatbotId)
      
      newDocuments.forEach((file) => {
        formData.append('documents_files', file)
      })

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/chatbot_settings/add_documents`, {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to upload documents')
      }

      toast({
        title: 'Documents uploaded',
        description: `${newDocuments.length} document(s) uploaded successfully`,
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
      setNewDocuments([])
      onUploadSuccess?.()
    } catch (error) {
      toast({
        title: 'Error uploading documents',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (documentId: string) => {
    if (deletingDocumentId) return

    try {
      setDeletingDocumentId(documentId)
      const token = localStorage.getItem('token')
      if (!token) {
        navigate('/login')
        return
      }

      const document = documents.find(doc => doc.id === documentId)
      if (!document) {
        throw new Error('Document not found')
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/chatbot_settings/delete_document/${chatbotId}/${encodeURIComponent(
          document.filename
        )}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.detail || 'Failed to delete document')
      }

      await onDelete(documentId)
      await refreshUserData()

      toast({
        title: 'Document deleted',
        description: 'Document has been deleted successfully',
        status: 'success',
        duration: 2000,
        isClosable: true,
      })
    } catch (error) {
      toast({
        title: 'Error deleting document',
        description: error instanceof Error ? error.message : 'Please try again',
        status: 'error',
        duration: 3000,
        isClosable: true,
      })
    } finally {
      setDeletingDocumentId(null)
    }
  }

  const UploadArea = () => (
    <MotionBox
      border="2px dashed"
      borderColor={borderColor}
      borderRadius="lg"
      p={6}
      textAlign="center"
      _hover={{
        borderColor: hoverBorderColor,
        bg: uploadBgColor,
        transform: 'translateY(-2px)'
      }}
      transition={{ property: 'transform, background-color, border-color', duration: 0.2 }}
      cursor="pointer"
      onClick={() => document.getElementById('document-upload')?.click()}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <Icon as={FiUpload} boxSize={6} color="blue.500" mb={2} />
      <Text fontSize="md" fontWeight="medium" mb={1}>
        Drop your documents here
      </Text>
      <Text fontSize="sm" color={labelColor}>
        or click to browse files
      </Text>
      <Badge colorScheme="blue" mt={2} fontSize="xs">
        Supported format: PDF
      </Badge>
      <input
        id="document-upload"
        type="file"
        onChange={handleFileChange}
        accept=".pdf"
        multiple
        style={{ display: 'none' }}
      />
    </MotionBox>
  )

  const SelectedFilesList = () => (
    <MotionBox
      mt={4}
      p={4}
      bg={uploadBgColor}
      borderRadius="lg"
      borderWidth="1px"
      borderColor={uploadBorderColor}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      <VStack align="stretch" spacing={2}>
        {newDocuments.map((file, index) => (
          <HStack key={index} justify="space-between">
            <HStack>
              <Icon as={FiFile} color="blue.500" boxSize={4} />
              <Text fontSize="md" fontWeight="medium">{file.name}</Text>
            </HStack>
            <IconButton
              aria-label="Remove file"
              icon={<FiTrash2 />}
              size="sm"
              variant="ghost"
              onClick={() => setNewDocuments(prev => prev.filter((_, i) => i !== index))}
            />
          </HStack>
        ))}
        <Button
          colorScheme="blue"
          onClick={handleUpload}
          size="sm"
          leftIcon={<FiUpload />}
          isLoading={isUploading}
          loadingText="Uploading..."
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: 'sm'
          }}
          transition="all 0.2s"
        >
          Upload All
        </Button>
      </VStack>
    </MotionBox>
  )

  const DocumentsList = () => (
    <VStack spacing={3} align="stretch">
      {documents.map((doc) => (
        <MotionBox
          key={doc.id}
          p={4}
          bg={bgColor}
          borderRadius="lg"
          borderWidth="1px"
          borderColor={borderColor}
          _hover={{
            borderColor: hoverBorderColor,
            boxShadow: 'sm',
            transform: 'translateY(-1px)'
          }}
          transition={{ property: 'transform, box-shadow', duration: 0.2 }}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
        >
          <HStack justify="space-between">
            <HStack>
              <Icon as={FiFile} color="blue.500" boxSize={4} />
              <Text fontSize="md" fontWeight="medium">{doc.filename}</Text>
            </HStack>
            <IconButton
              aria-label="Delete document"
              icon={<FiTrash2 />}
              size="sm"
              colorScheme="red"
              variant="ghost"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDelete(doc.id)
              }}
              isLoading={deletingDocumentId === doc.id}
              isDisabled={deletingDocumentId !== null}
              _hover={{
                transform: 'scale(1.1)',
                color: 'red.500'
              }}
              transition="all 0.2s"
            />
          </HStack>
        </MotionBox>
      ))}
    </VStack>
  )

  const EmptyState = () => (
    <MotionBox
      p={6}
      textAlign="center"
      bg={useColorModeValue('gray.50', 'gray.700')}
      borderRadius="lg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <Icon as={FiFile} boxSize={6} color="gray.400" mb={2} />
      <Text fontSize="md" color={labelColor}>
        No documents uploaded yet
      </Text>
    </MotionBox>
  )

  return (
    <ScaleFade in={true} initialScale={0.95}>
      <VStack spacing={6} align="stretch" p={6} bg={bgColor} borderRadius="lg" boxShadow="sm">
        <Box>
          <Heading size="md" mb={4} color={textColor} display="flex" alignItems="center">
            Upload New Documents
            <Tooltip label="Upload multiple documents to train your chatbot" placement="right">
              <Box ml={2}>
                <Icon as={FiInfo} color={labelColor} />
              </Box>
            </Tooltip>
          </Heading>
          <UploadArea />
          {newDocuments.length > 0 && <SelectedFilesList />}
        </Box>
        
        <Divider borderColor={borderColor} />
        
        <Box>
          <Heading size="md" mb={4} color={textColor}>
            Existing Documents
          </Heading>
          {documents.length > 0 ? <DocumentsList /> : <EmptyState />}
        </Box>
      </VStack>
    </ScaleFade>
  )
}

export default DocumentsTab 