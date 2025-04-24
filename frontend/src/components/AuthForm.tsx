import React from 'react';
import {
  Box,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  VStack,
  FormControl,
  FormLabel,
  Input,
  InputGroup,
  InputRightElement,
  Button,
  Divider,
  FormErrorMessage,
  IconButton
} from '@chakra-ui/react';
import { FcGoogle } from 'react-icons/fc';
import { BsMicrosoft } from 'react-icons/bs';
import { ViewIcon, ViewOffIcon } from '@chakra-ui/icons';

interface FormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

interface FormProps {
  formData: FormData;
  errors: FormErrors;
  showPassword: boolean;
  setShowPassword: (show: boolean) => void;
  handleInputChange: (field: string) => (value: string) => void;
}

interface AuthFormProps {
  activeTab: number;
  onTabChange: (index: number) => void;
  loginForm: FormProps;
  signUpForm: FormProps;
  onLogin: (e: React.FormEvent) => Promise<void>;
  onSignUp: (e: React.FormEvent) => Promise<void>;
  onGoogleLogin: () => void;
  onMicrosoftLogin: () => void;
  isLoading: boolean;
  isGoogleLoading: boolean;
  isMicrosoftLoading: boolean;
  animation: string;
}

const AuthForm: React.FC<AuthFormProps> = ({
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
  animation
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTab === 0) {
      onLogin(e);
    } else {
      onSignUp(e);
    }
  };

  return (
    <Box
      w={{ base: '100%', md: '420px' }}
      bg="white"
      borderRadius="xl"
      boxShadow="xl"
      p={{ base: 4, md: 8 }}
      animation={animation}
    >
      <form onSubmit={handleSubmit}>
        <Tabs
          isFitted
          variant="enclosed"
          index={activeTab}
          onChange={onTabChange}
          mb={{ base: 4, md: 6 }}
        >
          <TabList mb={{ base: 3, md: 4 }}>
            <Tab fontSize={{ base: 'sm', md: 'md' }}>Login</Tab>
            <Tab fontSize={{ base: 'sm', md: 'md' }}>Sign Up</Tab>
          </TabList>
          <TabPanels>
            <TabPanel p={0}>
              <VStack spacing={{ base: 3, md: 4 }}>
                <FormControl isInvalid={!!loginForm.errors.email}>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Email</FormLabel>
                  <Input
                    type="email"
                    value={loginForm.formData.email}
                    onChange={(e) => loginForm.handleInputChange('email')(e.target.value)}
                    size={{ base: 'sm', md: 'md' }}
                  />
                  <FormErrorMessage>{loginForm.errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!loginForm.errors.password}>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Password</FormLabel>
                  <InputGroup size={{ base: 'sm', md: 'md' }}>
                    <Input
                      type={loginForm.showPassword ? 'text' : 'password'}
                      value={loginForm.formData.password}
                      onChange={(e) => loginForm.handleInputChange('password')(e.target.value)}
                    />
                    <InputRightElement>
                      <IconButton
                        size={{ base: 'sm', md: 'md' }}
                        variant="ghost"
                        icon={loginForm.showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => loginForm.setShowPassword(!loginForm.showPassword)}
                        aria-label={loginForm.showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{loginForm.errors.password}</FormErrorMessage>
                </FormControl>

                <Button
                  w="100%"
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                  size={{ base: 'sm', md: 'md' }}
                  mt={{ base: 2, md: 4 }}
                >
                  Login
                </Button>
              </VStack>
            </TabPanel>

            <TabPanel p={0}>
              <VStack spacing={{ base: 3, md: 4 }}>
                <FormControl isInvalid={!!signUpForm.errors.email}>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Email</FormLabel>
                  <Input
                    type="email"
                    value={signUpForm.formData.email}
                    onChange={(e) => signUpForm.handleInputChange('email')(e.target.value)}
                    size={{ base: 'sm', md: 'md' }}
                  />
                  <FormErrorMessage>{signUpForm.errors.email}</FormErrorMessage>
                </FormControl>

                <FormControl isInvalid={!!signUpForm.errors.password}>
                  <FormLabel fontSize={{ base: 'sm', md: 'md' }}>Password</FormLabel>
                  <InputGroup size={{ base: 'sm', md: 'md' }}>
                    <Input
                      type={signUpForm.showPassword ? 'text' : 'password'}
                      value={signUpForm.formData.password}
                      onChange={(e) => signUpForm.handleInputChange('password')(e.target.value)}
                    />
                    <InputRightElement>
                      <IconButton
                        size={{ base: 'sm', md: 'md' }}
                        variant="ghost"
                        icon={signUpForm.showPassword ? <ViewOffIcon /> : <ViewIcon />}
                        onClick={() => signUpForm.setShowPassword(!signUpForm.showPassword)}
                        aria-label={signUpForm.showPassword ? 'Hide password' : 'Show password'}
                      />
                    </InputRightElement>
                  </InputGroup>
                  <FormErrorMessage>{signUpForm.errors.password}</FormErrorMessage>
                </FormControl>

                <Button
                  w="100%"
                  colorScheme="blue"
                  type="submit"
                  isLoading={isLoading}
                  size={{ base: 'sm', md: 'md' }}
                  mt={{ base: 2, md: 4 }}
                >
                  Sign Up
                </Button>
              </VStack>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </form>

      <Divider my={{ base: 4, md: 6 }} />

      <VStack spacing={{ base: 3, md: 4 }}>
        <Button
          w="100%"
          leftIcon={<FcGoogle />}
          onClick={onGoogleLogin}
          isLoading={isGoogleLoading}
          size={{ base: 'sm', md: 'md' }}
        >
          Continue with Google
        </Button>
        <Button
          w="100%"
          leftIcon={<BsMicrosoft />}
          onClick={onMicrosoftLogin}
          isLoading={isMicrosoftLoading}
          size={{ base: 'sm', md: 'md' }}
        >
          Continue with Microsoft
        </Button>
      </VStack>
    </Box>
  );
};

export default AuthForm; 