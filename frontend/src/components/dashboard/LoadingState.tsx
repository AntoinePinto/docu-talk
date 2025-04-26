import { Flex, Spinner, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useEffect, useState } from 'react'
import ProgressTimer from '../common/ProgressTimer'

interface LoadingStateProps {
  bgColor: string
  isApiResponded?: boolean
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const LoadingState = ({ bgColor, isApiResponded = false }: LoadingStateProps) => {
  const [showColdStart, setShowColdStart] = useState(false)
  
  const loadingMessages = [
    "Preparing your workspace...",
    "Gathering your chatbots...",
    "Almost there...",
    "Just a moment..."
  ]
  const [currentMessage, setCurrentMessage] = useState(0)

  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessage((prev) => (prev + 1) % loadingMessages.length)
    }, 2000)

    const coldStartTimeout = setTimeout(() => {
      setShowColdStart(true)
    }, 3000)

    return () => {
      clearInterval(messageInterval)
      clearTimeout(coldStartTimeout)
    }
  }, [])

  return (
    <Flex 
      direction="column" 
      align="center" 
      justify="center" 
      h="100vh" 
      bg={bgColor}
      gap={4}
    >
      <Spinner 
        size="xl" 
        color="#0c3b7d" 
        thickness="4px"
        speed="0.65s"
      />
      <Text 
        fontSize="lg" 
        fontWeight="medium"
        animation={`${fadeIn} 0.5s ease-in`}
      >
        {loadingMessages[currentMessage]}
      </Text>
      <ProgressTimer 
        duration={30}
        size="sm"
        width="300px"
        showText={false}
        colorScheme="blue"
        isApiResponded={isApiResponded}
        useLogarithmic={true}
        power={0.5}
      />
      {showColdStart && (
        <Text 
          fontSize="sm" 
          color="gray.500"
          animation={`${fadeIn} 0.5s ease-in`}
        >
          The application is waking up from a cold start...
        </Text>
      )}
    </Flex>
  )
}

export default LoadingState 