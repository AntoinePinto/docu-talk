import { Box, Text, Icon, useColorMode } from '@chakra-ui/react'
import { keyframes } from '@emotion/react'
import { FaCoins } from 'react-icons/fa'

interface CreditsToastProps {
  credits: number
}

const slideIn = keyframes`
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
`

const pulse = keyframes`
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
  100% {
    transform: scale(1);
  }
`

const CreditsToast = ({ credits }: CreditsToastProps) => {
  const { colorMode } = useColorMode()

  return (
    <Box
      p={3}
      bg={colorMode === 'light' ? 'white' : 'gray.700'}
      borderRadius="lg"
      boxShadow="lg"
      borderLeft="4px"
      borderColor="blue.500"
      display="flex"
      alignItems="center"
      gap={3}
      animation={`${slideIn} 0.3s ease-out`}
    >
      <Icon
        as={FaCoins}
        color="blue.500"
        boxSize={5}
        animation={`${pulse} 1s infinite`}
      />
      <Box>
        <Text fontWeight="bold" color={colorMode === 'light' ? 'gray.800' : 'white'}>
          Credits Used
        </Text>
        <Text color={colorMode === 'light' ? 'gray.600' : 'gray.300'}>
          -{credits} credits
        </Text>
      </Box>
    </Box>
  )
}

export default CreditsToast 