import { Flex, Spinner, Text, Progress } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { useEffect, useState } from 'react'

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
  const [progress, setProgress] = useState(0)
  const [startTime] = useState(Date.now())
  
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

    const progressInterval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000 // Convert to seconds
      
      // If API has responded, smoothly animate to 100%
      if (isApiResponded) {
        setProgress(prevProgress => {
          const step = 15
          const newProgress = Math.min(prevProgress + step, 100)
          return newProgress
        })
        return
      }
      
      const maxTime = 30 // Maximum expected time in seconds
      const power = 0.5 // Power factor to intensify the curve
      const newProgress = Math.min(
        Math.pow((Math.log(elapsedTime + 0.1) / Math.log(maxTime + 0.1)), power) * 100,
        100
      )
      
      setProgress(newProgress)
    }, 10) // Reduced interval for smoother updates

    return () => {
      clearInterval(messageInterval)
      clearTimeout(coldStartTimeout)
      clearInterval(progressInterval)
    }
  }, [startTime, isApiResponded])

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
      <Progress 
        value={progress} 
        size="sm" 
        width="300px" 
        colorScheme="blue"
        borderRadius="full"
        hasStripe
        isAnimated
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