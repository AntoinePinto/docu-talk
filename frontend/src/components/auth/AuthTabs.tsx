import { Tabs, TabList, TabPanels, Tab, TabPanel, VStack, HStack, Button } from '@chakra-ui/react';
import { FiMail, FiLock, FiArrowRight } from 'react-icons/fi';
import FormField from './FormField';

interface AuthTabsProps {
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
  isLoading: boolean;
}

const AuthTabs = ({
  onTabChange,
  loginForm,
  signUpForm,
  onLogin,
  onSignUp,
  isLoading,
}: AuthTabsProps) => {
  return (
    <Tabs isFitted variant="enclosed" onChange={onTabChange}>
      <TabList mb="1em">
        <Tab>Sign In</Tab>
        <Tab>Sign Up</Tab>
      </TabList>
      <TabPanels>
        <TabPanel>
          <form onSubmit={onLogin}>
            <VStack spacing={4}>
              <FormField
                field="email"
                label="Email"
                type="email"
                value={loginForm.formData.email}
                error={loginForm.errors.email}
                icon={<FiMail color="gray.400" />}
                onChange={loginForm.handleInputChange('email')}
              />
              <FormField
                field="password"
                label="Password"
                type={loginForm.showPassword ? 'text' : 'password'}
                value={loginForm.formData.password}
                error={loginForm.errors.password}
                icon={<FiLock color="gray.400" />}
                showPassword={loginForm.showPassword}
                onTogglePassword={() => loginForm.setShowPassword(!loginForm.showPassword)}
                onChange={loginForm.handleInputChange('password')}
              />
              <Button
                type="submit"
                colorScheme="blue"
                size="md"
                width="full"
                isLoading={isLoading}
                loadingText="Signing in..."
                rightIcon={<FiArrowRight />}
                mt={2}
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Sign In
              </Button>
            </VStack>
          </form>
        </TabPanel>

        <TabPanel>
          <form onSubmit={onSignUp}>
            <VStack spacing={4}>
              <FormField
                field="email"
                label="Email"
                type="email"
                value={signUpForm.formData.email}
                error={signUpForm.errors.email}
                icon={<FiMail color="gray.400" />}
                onChange={signUpForm.handleInputChange('email')}
              />
              <HStack spacing={4} w="full">
                <FormField
                  field="firstName"
                  label="First Name"
                  type="text"
                  value={signUpForm.formData.firstName}
                  error={signUpForm.errors.firstName}
                  icon={null}
                  onChange={signUpForm.handleInputChange('firstName')}
                />
                <FormField
                  field="lastName"
                  label="Last Name"
                  type="text"
                  value={signUpForm.formData.lastName}
                  error={signUpForm.errors.lastName}
                  icon={null}
                  onChange={signUpForm.handleInputChange('lastName')}
                />
              </HStack>
              <FormField
                field="password"
                label="Password"
                type={signUpForm.showPassword ? 'text' : 'password'}
                value={signUpForm.formData.password}
                error={signUpForm.errors.password}
                icon={<FiLock color="gray.400" />}
                showPassword={signUpForm.showPassword}
                onTogglePassword={() => signUpForm.setShowPassword(!signUpForm.showPassword)}
                onChange={signUpForm.handleInputChange('password')}
              />
              <Button
                type="submit"
                colorScheme="blue"
                size="md"
                width="full"
                isLoading={isLoading}
                loadingText="Creating account..."
                rightIcon={<FiArrowRight />}
                mt={2}
                _hover={{ transform: 'translateY(-1px)', boxShadow: 'lg' }}
                transition="all 0.2s"
              >
                Create Account
              </Button>
            </VStack>
          </form>
        </TabPanel>
      </TabPanels>
    </Tabs>
  );
};

export default AuthTabs; 