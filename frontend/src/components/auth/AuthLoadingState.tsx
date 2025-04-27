import { Flex, Spinner, Text } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import ProgressTimer from '../common/ProgressTimer'

interface AuthLoadingStateProps {
  bgColor: string
  isApiResponded?: boolean
  message?: string
}

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`

const AuthLoadingState = ({ bgColor, isApiResponded = false, message = "Authenticating..." }: AuthLoadingStateProps) => {
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
        {message}
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
    </Flex>
  )
}

export default AuthLoadingState 