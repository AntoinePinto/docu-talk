import { Box, VStack, Image, Heading, HStack, Divider, Text } from '@chakra-ui/react';
import logo from '../../assets/logo.svg';
import SocialAuthButtons from './SocialAuthButtons';
import AuthTabs from './AuthTabs';

interface AuthFormProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  loginForm: {
    formData: { email: string; password: string };
    errors: { email?: string; password?: string };
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    handleInputChange: (field: string) => (value: string) => void;
  };
  signUpForm: {
    formData: { email: string; password: string; firstName: string; lastName: string };
    errors: { email?: string; password?: string; firstName?: string; lastName?: string };
    showPassword: boolean;
    setShowPassword: (show: boolean) => void;
    handleInputChange: (field: string) => (value: string) => void;
  };
  onLogin: (e: React.FormEvent) => void;
  onSignUp: (e: React.FormEvent) => void;
  onGoogleLogin: () => void;
  onMicrosoftLogin: () => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isMicrosoftLoading: boolean;
  animation: string;
}

const AuthForm = ({
  activeTab,
  onTabChange,
  loginForm,
  signUpForm,
  onLogin,
  onSignUp,
  onGoogleLogin,
  onMicrosoftLogin,
  isLoading,
  isGoogleLoading,
  isMicrosoftLoading,
  animation,
}: AuthFormProps) => {
  return (
    <Box
      w={{ base: '100%', md: '420px' }}
      bg="whiteAlpha.900"
      backdropFilter="blur(10px)"
      p={7}
      borderRadius="xl"
      boxShadow="xl"
      animation={animation}
    >
      <VStack spacing={5} align="stretch">
        <VStack spacing={2} align="center">
          <Image src={logo} alt="DocuTalk Logo" w="70px" mb={2} display={{ base: 'block', md: 'none' }} />
          <Heading size="lg" color="#0c3b7d">
            Welcome
          </Heading>
        </VStack>

        <SocialAuthButtons
          onGoogleLogin={onGoogleLogin}
          onMicrosoftLogin={onMicrosoftLogin}
          isGoogleLoading={isGoogleLoading}
          isMicrosoftLoading={isMicrosoftLoading}
        />

        <HStack spacing={2} justify="center" my={3}>
          <Divider />
          <Text color="gray.500" fontSize="sm" textTransform="uppercase">
            or
          </Text>
          <Divider />
        </HStack>

        <AuthTabs
          activeTab={activeTab}
          onTabChange={onTabChange}
          loginForm={loginForm}
          signUpForm={signUpForm}
          onLogin={onLogin}
          onSignUp={onSignUp}
          isLoading={isLoading}
        />
      </VStack>
    </Box>
  );
};

export default AuthForm; 