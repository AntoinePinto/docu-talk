import { Button, Stack } from '@chakra-ui/react';
import { FaMicrosoft } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';

interface SocialAuthButtonsProps {
  onGoogleLogin: () => void;
  onMicrosoftLogin: () => void;
  isGoogleLoading: boolean;
  isMicrosoftLoading: boolean;
}

const SocialAuthButtons = ({
  onGoogleLogin,
  onMicrosoftLogin,
  isGoogleLoading,
  isMicrosoftLoading,
}: SocialAuthButtonsProps) => {
  return (
    <Stack spacing={4} w="full">
      <Button
        leftIcon={<FcGoogle fontSize="24px" />}
        onClick={onGoogleLogin}
        w="full"
        h="44px"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
        _hover={{ bg: 'gray.50' }}
        fontSize="md"
        fontWeight="medium"
        isLoading={isGoogleLoading}
        loadingText="Continuing with Google..."
      >
        Continue with Google
      </Button>

      <Button
        leftIcon={<FaMicrosoft fontSize="24px" color="#00a4ef" />}
        onClick={onMicrosoftLogin}
        w="full"
        h="44px"
        border="1px solid"
        borderColor="gray.200"
        borderRadius="md"
        bg="white"
        _hover={{ bg: 'gray.50' }}
        fontSize="md"
        fontWeight="medium"
        isLoading={isMicrosoftLoading}
        loadingText="Continuing with Microsoft..."
      >
        Continue with Microsoft
      </Button>
    </Stack>
  );
};

export default SocialAuthButtons; 