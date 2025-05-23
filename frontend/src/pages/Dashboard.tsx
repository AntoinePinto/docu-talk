import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Container, useColorModeValue, useDisclosure } from '@chakra-ui/react'
import axios from 'axios'
import { useAuth } from '../components/auth/AuthContext'
import { useUser } from '../components/auth/UserContext'
import LoadingState from '../components/dashboard/LoadingState'
import ChatbotsSection from '../components/dashboard/ChatbotsSection'
import SettingsDrawer from '../components/dashboard/SettingsDrawer'
import DeleteAccountDialog from '../components/dashboard/DeleteAccountDialog'
import SEO from '../components/SEO'

const Dashboard = () => {
  const { user, isLoading } = useUser()
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [isDeleting, setIsDeleting] = useState(false)
  const [showContent, setShowContent] = useState(false)
  
  // Disclosure hooks for modals and drawers
  const { isOpen, onClose } = useDisclosure()
  const { isOpen: isDeleteAlertOpen, onOpen: onDeleteAlertOpen, onClose: onDeleteAlertClose } = useDisclosure()
  
  // Theme values
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const cardBg = useColorModeValue('white', 'gray.800')
  const headingColor = useColorModeValue('gray.700', 'white')
  const textColor = useColorModeValue('gray.600', 'gray.300')

  useEffect(() => {
    if (!isLoading) {
      // Add a small delay before showing the content
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 500) // 500ms delay to allow progress bar to complete
      return () => clearTimeout(timer)
    }
  }, [isLoading])

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true)
      const token = localStorage.getItem('token')
      
      if (!token) {
        navigate('/')
        return
      }
      
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/delete_account`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      
      logout()
      navigate('/')
    } catch (error) {
      console.error('Error deleting account:', error)
    } finally {
      setIsDeleting(false)
      onDeleteAlertClose()
    }
  }

  if (isLoading || !showContent) {
    return <LoadingState bgColor={bgColor} isApiResponded={!isLoading} />
  }

  return (
    <>
      <SEO title="Dashboard" />
      <Box minH="100vh" bg={bgColor}>
        <Container 
          maxW="container.xl" 
          py={{ base: 4, md: 8 }}
          px={{ base: 4, md: 6 }}
        >
          <ChatbotsSection
            chatbots={user?.chatbots || []}
            cardBg={cardBg}
            headingColor={headingColor}
            textColor={textColor}
          />
        </Container>

        <SettingsDrawer
          isOpen={isOpen}
          onClose={onClose}
          onDeleteAlertOpen={onDeleteAlertOpen}
        />

        <DeleteAccountDialog
          isOpen={isDeleteAlertOpen}
          onClose={onDeleteAlertClose}
          onDelete={handleDeleteAccount}
          isDeleting={isDeleting}
        />
      </Box>
    </>
  )
}

export default Dashboard 