import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  useToast,
  Flex,
  Container,
  useBreakpointValue,
  useColorModeValue,
  IconButton,
} from '@chakra-ui/react'
import { useGoogleLogin } from '@react-oauth/google'
import { PublicClientApplication, EventType, Configuration, LogLevel, AuthenticationResult } from '@azure/msal-browser'
import { useAuth } from '../components/auth/AuthContext'
import { useUser } from '../components/auth/UserContext'
import AuthForm from '../components/auth/AuthForm'
import BrandingSection from '../components/auth/BrandingSection'
import AuthLoadingState from '../components/auth/AuthLoadingState'
import { keyframes } from '@emotion/react'
import SEO from '../components/SEO'
import { FiArrowLeft } from 'react-icons/fi'

// Types
interface FormData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

interface LoginFormData {
  email: string;
  password: string;
}

interface SignUpFormData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
}

interface MicrosoftAuthResponse {
  access_token: string;
  user: {
    email: string;
    first_name?: string;
    last_name?: string;
    friendly_name?: string;
  };
}

// Constants
const MSAL_CONFIG: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    authority: import.meta.env.VITE_MICROSOFT_AUTHORITY || 'https://login.microsoftonline.com/consumers',
    redirectUri: window.location.origin,
    knownAuthorities: ['login.microsoftonline.com'],
  },
  cache: {
    cacheLocation: 'sessionStorage',
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: {
      loggerCallback: (level: LogLevel, message: string, containsPii: boolean) => {
        if (containsPii) return;
        switch (level) {
          case LogLevel.Error:
            console.error(message);
            break;
          case LogLevel.Warning:
            console.warn(message);
            break;
          case LogLevel.Info:
            console.info(message);
            break;
          case LogLevel.Verbose:
            console.debug(message);
            break;
        }
      },
      piiLoggingEnabled: false
    }
  }
};

const LOGIN_REQUEST = {
  scopes: ['openid', 'profile', 'email', 'User.Read'],
  prompt: 'select_account',
  redirectUri: window.location.origin
};

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const pulse = keyframes`
  0% { opacity: 0.3; }
  50% { opacity: 0.5; }
  100% { opacity: 0.3; }
`;

// Custom hooks
const useForm = (initialState: FormData) => {
  const [formData, setFormData] = useState<FormData>(initialState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);

  const validateForm = useCallback(() => {
    const newErrors: FormErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(formData.email)) {
      newErrors.email = 'Invalid email address';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.firstName !== undefined && !formData.firstName) {
      newErrors.firstName = 'First name is required';
    }
    
    if (formData.lastName !== undefined && !formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleInputChange = (field: string) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return {
    formData,
    errors,
    showPassword,
    setShowPassword,
    validateForm,
    handleInputChange,
    setFormData
  };
};

const Login = () => {
  const [msalInstance, setMsalInstance] = useState<PublicClientApplication | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isMicrosoftLoading, setIsMicrosoftLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [showLoadingState, setShowLoadingState] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState("Authenticating...");
  
  const navigate = useNavigate();
  const { login, loginWithToken } = useAuth();
  const { refreshUserData } = useUser();
  const toast = useToast();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  const loginForm = useForm({ email: '', password: '' });
  const signUpForm = useForm({ 
    email: '', 
    password: '', 
    firstName: '', 
    lastName: '' 
  });

  const animation = `${fadeIn} 0.8s ease-out`;
  const slideAnimation = `${slideIn} 0.8s ease-out`;

  const containerPadding = useBreakpointValue({ base: 4, md: 6 });
  const containerSpacing = useBreakpointValue({ base: 4, md: 6 });
  const containerMaxWidth = useBreakpointValue({ base: '100%', md: 'container.xl' });

  useEffect(() => {
    const initializeMsal = async () => {
      try {
        const msalInstance = new PublicClientApplication(MSAL_CONFIG);
        await msalInstance.initialize();
        
        msalInstance.addEventCallback((event) => {
          if (event.eventType === EventType.LOGIN_SUCCESS) {
            handleMicrosoftAuthResult(event.payload as AuthenticationResult);
          }
        });
        
        setMsalInstance(msalInstance);
      } catch (error) {
        console.error('Failed to initialize MSAL:', error);
        toast({
          title: 'Initialization Error',
          description: 'Failed to initialize Microsoft authentication. Please try again later.',
          status: 'error',
          duration: 5000,
          isClosable: true,
        });
      }
    };

    initializeMsal();
  }, [toast]);

  const handleMicrosoftLogin = async () => {
    if (!msalInstance) {
      toast({
        title: 'Error',
        description: 'Microsoft authentication is not initialized',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsMicrosoftLoading(true);
      setShowLoadingState(true);
      setLoadingMessage("Continuing with Microsoft...");
      
      try {
        const silentResponse = await msalInstance.acquireTokenSilent(LOGIN_REQUEST);
        if (silentResponse?.accessToken) {
          await handleMicrosoftAuthResult(silentResponse);
          return;
        }
      } catch (error) {
        console.log('Silent token acquisition failed, proceeding with popup');
      }

      const response = await msalInstance.acquireTokenPopup(LOGIN_REQUEST);
      if (response?.accessToken) {
        await handleMicrosoftAuthResult(response);
      }
    } catch (error) {
      handleAuthError('Microsoft', error);
    } finally {
      setIsMicrosoftLoading(false);
      setShowLoadingState(false);
    }
  };

  const handleMicrosoftAuthResult = async (response: AuthenticationResult) => {
    try {
      const result = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/microsoft`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ access_token: response.accessToken }),
      });

      if (!result.ok) {
        throw new Error(await result.text());
      }

      const data = await result.json() as MicrosoftAuthResponse;
      
      if (!data.access_token || !data.user?.email) {
        throw new Error('Invalid response from server');
      }
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      loginWithToken(data.access_token, data.user.email);
      navigate('/dashboard');
    } catch (error) {
      handleAuthError('Microsoft', error);
    }
  };

  const handleGoogleSuccess = async (response: { access_token: string }) => {
    try {
      setIsGoogleLoading(true);
      setShowLoadingState(true);
      setLoadingMessage("Continuing with Google...");
      
      const backendResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: response.access_token }),
      });

      if (!backendResponse.ok) {
        throw new Error(await backendResponse.text());
      }

      const data = await backendResponse.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      loginWithToken(data.access_token, data.user.email);
      navigate('/dashboard');
    } catch (error) {
      handleAuthError('Google', error);
    } finally {
      setIsGoogleLoading(false);
      setShowLoadingState(false);
    }
  };

  const handleAuthError = (provider: string, error: unknown) => {
    const errorMessage = error instanceof Error ? error.message : 'Authentication failed';
    toast({
      title: `${provider} Login Failed`,
      description: errorMessage,
      status: 'error',
      duration: 3000,
      isClosable: true,
      position: 'top',
    });
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => handleAuthError('Google', 'Authentication failed'),
    flow: 'implicit',
    scope: 'email profile',
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!loginForm.validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setShowLoadingState(true);
    setLoadingMessage("Signing in...");

    try {
      await login(loginForm.formData.email, loginForm.formData.password);
      navigate('/dashboard');
    } catch (error) {
      handleAuthError('Login', error);
    } finally {
      setIsLoading(false);
      setShowLoadingState(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!signUpForm.validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setShowLoadingState(true);
    setLoadingMessage("Creating your account...");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: signUpForm.formData.email,
          first_name: signUpForm.formData.firstName,
          last_name: signUpForm.formData.lastName,
          password: signUpForm.formData.password
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Sign up failed');
      }

      const data = await response.json();
      
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('user', JSON.stringify(data.user));
      
      loginWithToken(data.access_token, signUpForm.formData.email);
      
      try {
        await refreshUserData();
      } catch (error) {
        console.error('Error refreshing user data:', error);
      }
      
      toast({
        title: 'Account Created',
        description: data.message,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      navigate('/dashboard', { replace: true });
    } catch (error) {
      handleAuthError('Sign Up', error);
    } finally {
      setIsLoading(false);
      setShowLoadingState(false);
    }
  };

  if (showLoadingState) {
    return <AuthLoadingState bgColor={bgColor} message={loadingMessage} />;
  }

  return (
    <>
      <SEO title="Login" />
      <Box minH="100vh" position="relative" overflow="hidden" display="flex" alignItems="center" py={{ base: 4, md: 8 }} px={{ base: 0, md: 4 }} bg={bgColor}>
        {/* Background Image with Overlay */}
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          zIndex={0}
          backgroundImage={`url('https://storage.googleapis.com/ai-apps-lab-public/Dashboard.png')`}
          backgroundSize="cover"
          backgroundPosition="center"
          backgroundRepeat="no-repeat"
          opacity={0.7}
          animation={`${pulse} 8s ease-in-out infinite`}
          _before={{
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.85) 0%, rgba(255, 255, 255, 0.6) 100%)',
          }}
        />

        <Container maxW={containerMaxWidth} position="relative" zIndex={1} p={containerPadding}>
          <IconButton
            aria-label="Back to home"
            icon={<FiArrowLeft />}
            variant="ghost"
            position="absolute"
            top={4}
            left={4}
            onClick={() => navigate('/')}
          />
          <Flex
            minH="100vh"
            align="center"
            justify="center"
            direction={{ base: 'column', md: 'row' }}
            gap={containerSpacing}
          >
            <BrandingSection animation={slideAnimation} />
            
            <AuthForm
              activeTab={activeTab}
              onTabChange={setActiveTab}
              loginForm={{
                formData: loginForm.formData as LoginFormData,
                errors: loginForm.errors,
                showPassword: loginForm.showPassword,
                setShowPassword: loginForm.setShowPassword,
                handleInputChange: loginForm.handleInputChange,
              }}
              signUpForm={{
                formData: signUpForm.formData as SignUpFormData,
                errors: signUpForm.errors,
                showPassword: signUpForm.showPassword,
                setShowPassword: signUpForm.setShowPassword,
                handleInputChange: signUpForm.handleInputChange,
              }}
              onLogin={handleLogin}
              onSignUp={handleSignUp}
              onGoogleLogin={() => googleLogin()}
              onMicrosoftLogin={handleMicrosoftLogin}
              isLoading={isLoading}
              isGoogleLoading={isGoogleLoading}
              isMicrosoftLoading={isMicrosoftLoading}
              animation={animation}
            />
          </Flex>
        </Container>
      </Box>
    </>
  );
};

export default Login; 