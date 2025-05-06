import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Text,
  Stack,
  Icon,
  useColorModeValue,
  useBreakpointValue,
  SimpleGrid,
  Image,
  IconButton,
  HStack,
  Avatar,
  Badge,
  Link,
  VStack,
  Grid,
  GridItem,
} from '@chakra-ui/react'
import { motion } from 'framer-motion'
import { FaRobot, FaComments, FaChartLine, FaLock, FaPlay, FaPause, FaArrowRight, FaGithub, FaLinkedin, FaCoffee, FaEnvelope, FaStream } from 'react-icons/fa'
import { FiMaximize2 } from 'react-icons/fi'
import SEO from '../components/SEO'
import logo from '../../public/logo.svg'
import myPhoto from '../assets/my_photo.jpg'
import { keyframes } from '@emotion/react'
import { useRef, useState, useEffect } from 'react'

const MotionBox = motion(Box)

const float = keyframes`
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
`

const Feature = ({ title, text, icon, index }: { title: string; text: string; icon: any; index: number }) => {
  return (
    <MotionBox
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <Stack
        spacing={4}
        align="center"
        textAlign="center"
        p={6}
        bg={useColorModeValue('white', 'gray.800')}
        rounded="xl"
        shadow="lg"
        transition="all 0.3s"
        _hover={{ transform: 'translateY(-5px)', shadow: 'xl' }}
      >
        <Flex
          w={16}
          h={16}
          align="center"
          justify="center"
          color="white"
          rounded="full"
          bg="#0c3b7d"
          mb={1}
          animation={`${float} 3s ease-in-out infinite`}
        >
          <Icon as={icon} w={8} h={8} />
        </Flex>
        <Text fontWeight={600} fontSize="xl">
          {title}
        </Text>
        <Text color={useColorModeValue('gray.600', 'gray.400')}>
          {text}
        </Text>
      </Stack>
    </MotionBox>
  )
}

const SocialCard = ({ icon, href, label, description }: { icon: any; href: string; label: string; description: string }) => {
  return (
    <Link
      href={href}
      isExternal
      _hover={{ textDecoration: 'none' }}
    >
      <MotionBox
        whileHover={{ transform: 'translateY(-5px)' }}
        transition={{ duration: 0.2 }}
      >
        <Stack
          p={6}
          bg={useColorModeValue('white', 'gray.800')}
          rounded="xl"
          shadow="lg"
          spacing={4}
          border="1px solid"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
          _hover={{
            shadow: 'xl',
            borderColor: '#0c3b7d',
          }}
        >
          <Flex
            w={12}
            h={12}
            align="center"
            justify="center"
            color="white"
            rounded="full"
            bg="#0c3b7d"
            mb={2}
          >
            <Icon as={icon} w={6} h={6} />
          </Flex>
          <Text fontWeight="bold" fontSize="lg" color={useColorModeValue('gray.700', 'white')}>
            {label}
          </Text>
          <Text color={useColorModeValue('gray.600', 'gray.400')} fontSize="sm">
            {description}
          </Text>
        </Stack>
      </MotionBox>
    </Link>
  )
}

const Home = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const headingColor = useColorModeValue('gray.700', 'white');

  const containerPadding = useBreakpointValue({ base: 4, md: 6 });

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.addEventListener('loadeddata', () => {
        setIsLoading(false);
      });
    }
  }, []);

  return (
    <>
      <SEO 
        title="DocuTalk - Create chatbots from your documents"
        description="Transform your documents into interactive conversations with DocuTalk. Our AI-powered platform helps you understand and analyze your documents through natural conversations."
        keywords="AI chatbot, document analysis, AI assistant, document management, chatbot creation, AI technology"
      />
      <Box minH="100vh" bg={bgColor}>
        {/* Hero Section */}
        <Box
          position="relative"
          overflow="hidden"
          minH={{ base: "auto", md: "80vh" }}
          bg="#0c3b7d"
        >
          {/* Background Pattern */}
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            opacity={0.1}
            backgroundImage="radial-gradient(circle at 1px 1px, white 1px, transparent 0)"
            backgroundSize="40px 40px"
          />

          {/* Content */}
          <Container maxW="container.xl" position="relative" zIndex={1}>
            <Grid
              templateColumns={{ base: '1fr', lg: '1fr 1fr' }}
              gap={{ base: 8, lg: 10 }}
              alignItems="center"
              minH={{ base: "auto", md: "80vh" }}
              py={{ base: 12, md: 16 }}
            >
              {/* Left Column - Content */}
              <Stack spacing={{ base: 6, md: 8 }}>
                <MotionBox
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8 }}
                >
                  <Flex align="center" gap={4} mb={{ base: 4, md: 6 }}>
                    <Box
                      w={{ base: "50px", md: "60px" }}
                      h={{ base: "50px", md: "60px" }}
                      bg="white"
                      rounded="xl"
                      p={3}
                      shadow="lg"
                    >
                      <Image 
                        src={logo} 
                        alt="DocuTalk Logo" 
                        w="full"
                        h="full"
                        objectFit="contain"
                      />
                    </Box>
                    <Heading size={{ base: "xl", md: "2xl" }} color="white">
                      Docu Talk
                    </Heading>
                  </Flex>
                  <Text fontSize={{ base: "xl", md: "2xl" }} color="white" opacity={0.9} mb={{ base: 4, md: 6 }}>
                    Your AI-powered document assistant
                  </Text>
                  <Text fontSize={{ base: "md", md: "lg" }} color="white" opacity={0.8} mb={{ base: 6, md: 8 }}>
                    Create custom AI chatbots instantly using your own documents. 
                    Transform how you interact with your documents through natural conversations.
                  </Text>
                  <Button
                    size={{ base: "md", md: "lg" }}
                    bg="white"
                    color="#0c3b7d"
                    px={{ base: 6, md: 8 }}
                    fontSize={{ base: "md", md: "lg" }}
                    onClick={() => navigate('/login')}
                    _hover={{
                      bg: 'white',
                      opacity: 0.9,
                      transform: 'translateY(-2px)',
                      boxShadow: 'lg',
                    }}
                    rightIcon={<FaArrowRight />}
                  >
                    Get Started
                  </Button>
                </MotionBox>
              </Stack>

              {/* Right Column - Video */}
              <MotionBox
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                position="relative"
                mt={{ base: 8, lg: 0 }}
              >
                <Box
                  w="full"
                  borderRadius="2xl"
                  overflow="hidden"
                  boxShadow="2xl"
                  position="relative"
                  bg="black"
                >
                  {isLoading && (
                    <Flex
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      align="center"
                      justify="center"
                      bg="rgba(0,0,0,0.1)"
                      color="white"
                    >
                      <Text>Loading video...</Text>
                    </Flex>
                  )}
                  <video
                    ref={videoRef}
                    autoPlay
                    loop
                    muted
                    playsInline
                    style={{
                      width: '100%',
                      height: 'auto',
                      display: 'block',
                    }}
                  >
                    <source src="https://storage.googleapis.com/ai-apps-lab-public/docu_talk.mp4" type="video/mp4" />
                  </video>
                  <HStack
                    position="absolute"
                    bottom={4}
                    right={4}
                    spacing={2}
                  >
                    <IconButton
                      aria-label={isPlaying ? "Pause" : "Play"}
                      icon={isPlaying ? <FaPause /> : <FaPlay />}
                      bg="white"
                      _hover={{ bg: 'white', opacity: 0.9 }}
                      onClick={togglePlay}
                      size="sm"
                      borderRadius="md"
                    />
                    <IconButton
                      aria-label="Fullscreen"
                      icon={<FiMaximize2 />}
                      bg="white"
                      _hover={{ bg: 'white', opacity: 0.9 }}
                      onClick={handleFullscreen}
                      size="sm"
                      borderRadius="md"
                    />
                  </HStack>
                </Box>
                {/* Decorative Elements */}
                <Box
                  position="absolute"
                  top="-20px"
                  right="-20px"
                  w={{ base: "60px", md: "100px" }}
                  h={{ base: "60px", md: "100px" }}
                  bg="white"
                  opacity={0.1}
                  rounded="full"
                  zIndex={-1}
                />
                <Box
                  position="absolute"
                  bottom="-20px"
                  left="-20px"
                  w={{ base: "90px", md: "150px" }}
                  h={{ base: "90px", md: "150px" }}
                  bg="white"
                  opacity={0.1}
                  rounded="full"
                  zIndex={-1}
                />
              </MotionBox>
            </Grid>
          </Container>
        </Box>

        {/* Features Section */}
        <Box py={{ base: 16, md: 20 }} bg={useColorModeValue('white', 'gray.800')}>
          <Container maxW="container.xl" px={containerPadding}>
            <Stack spacing={4} as={Container} maxW="3xl" textAlign="center" mb={{ base: 12, md: 16 }}>
              <Heading fontSize={{ base: "2xl", md: "3xl" }} color={headingColor}>
                Why Choose DocuTalk?
              </Heading>
              <Text color={textColor} fontSize={{ base: "md", md: "lg" }}>
                Docu Talk uses AI to make working with documents easier and more interactive.
              </Text>
            </Stack>

            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={{ base: 8, md: 10 }}>
              <Feature
                icon={FaRobot}
                title="AI-Powered Analysis"
                text="Advanced AI algorithms understand and analyze your documents with high accuracy."
                index={0}
              />
              <Feature
                icon={FaComments}
                title="Natural Conversations"
                text="Interact with your documents through natural language conversations."
                index={1}
              />
              <Feature
                icon={FaChartLine}
                title="Smart Insights"
                text="Get instant insights and summaries from complex documents."
                index={2}
              />
              <Feature
                icon={FaLock}
                title="Secure & Private"
                text="Your documents and conversations are protected with enterprise-grade security."
                index={3}
              />
            </SimpleGrid>
          </Container>
        </Box>

        {/* Developer Story Section */}
        <Box py={{ base: 16, md: 20 }} bg={useColorModeValue('gray.50', 'gray.900')}>
          <Container maxW="container.xl" px={containerPadding}>
            <Grid templateColumns={{ base: '1fr', lg: '1fr 1fr' }} gap={{ base: 8, lg: 10 }} alignItems="center">
              <GridItem>
                <MotionBox
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Stack spacing={{ base: 4, md: 6 }}>
                    <Flex align="center" gap={3}>
                      <Avatar 
                        src={myPhoto} 
                        size={{ base: "xl", md: "2xl" }}
                        name="Antoine Pinto"
                        border="4px solid"
                        borderColor="#0c3b7d"
                      />
                      <Stack spacing={1}>
                        <Heading size={{ base: "lg", md: "xl" }}>Developer Story</Heading>
                        <Text fontSize={{ base: "sm", md: "md" }} color={textColor}>Antoine Pinto</Text>
                      </Stack>
                    </Flex>
                    <Text fontSize={{ base: "md", md: "lg" }} color={textColor}>
                      I'm a developer who builds apps in my free time. I developed DocuTalk to train myself in building a complete project from start to finish - including database, backend, frontend, hosting, and domain setup.
                    </Text>
                    <Text fontSize={{ base: "md", md: "lg" }} color={textColor}>
                      I first built a simple version using Streamlit (Python) in 15 days. You can try it out below. Then I turned the frontend into a React version in 4 days using AI (Vibe Coding) to help me code faster.
                    </Text>
                    <HStack spacing={4} flexWrap={{ base: "wrap", md: "nowrap" }}>
                      <Button
                        as={Link}
                        href="https://github.com/AntoinePinto/docu-talk"
                        isExternal
                        leftIcon={<FaGithub />}
                        colorScheme="blue"
                        size={{ base: "md", md: "lg" }}
                      >
                        View Source Code
                      </Button>
                      <Button
                        as={Link}
                        href="https://docu-talk-ai-apps.streamlit.app/"
                        isExternal
                        leftIcon={<FaStream />}
                        variant="outline"
                        colorScheme="blue"
                        size={{ base: "md", md: "lg" }}
                      >
                        Try Streamlit Version
                      </Button>
                    </HStack>
                  </Stack>
                </MotionBox>
              </GridItem>
              <GridItem>
                <MotionBox
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <Stack spacing={4}>
                    <Box
                      p={{ base: 6, md: 8 }}
                      bg={useColorModeValue('white', 'gray.800')}
                      rounded="xl"
                      shadow="lg"
                      border="1px solid"
                      borderColor={useColorModeValue('gray.200', 'gray.700')}
                    >
                      <VStack spacing={4} align="start">
                        <Heading size={{ base: "sm", md: "md" }}>Tech Stack</Heading>
                        <SimpleGrid columns={{ base: 2, md: 2 }} spacing={4} w="full">
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>React</Badge>
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>Generative AI</Badge>
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>FastAPI</Badge>
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>MongoDB</Badge>
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>Gemini</Badge>
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>Python</Badge>
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>Cloud Run</Badge>
                          <Badge colorScheme="blue" p={2} rounded="md" fontSize={{ base: "xs", md: "sm" }}>AWS SES</Badge>
                        </SimpleGrid>
                      </VStack>
                    </Box>
                  </Stack>
                </MotionBox>
              </GridItem>
            </Grid>
          </Container>
        </Box>

        {/* Connect Section */}
        <Box py={{ base: 16, md: 20 }} bg="#0c3b7d" color="white">
          <Container maxW="container.xl" px={containerPadding}>
            <Stack spacing={{ base: 8, md: 12 }} align="center">
              <MotionBox
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                textAlign="center"
              >
                <Heading size={{ base: "lg", md: "xl" }} mb={4}>Let's Connect</Heading>
                <Text fontSize={{ base: "md", md: "lg" }} maxW="2xl">
                  I'm always excited to connect with fellow developers, AI enthusiasts, and potential collaborators.
                  Feel free to reach out through any of these channels!
                </Text>
              </MotionBox>

              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={{ base: 6, md: 8 }} w="full" maxW="4xl">
                <SocialCard
                  icon={FaLinkedin}
                  href="https://www.linkedin.com/in/pinto-antoine/"
                  label="LinkedIn"
                  description="Connect with me professionally and follow my journey in tech"
                />
                <SocialCard
                  icon={FaEnvelope}
                  href="mailto:antoine.pinto1@outlook.fr"
                  label="Email"
                  description="Drop me a message for collaborations or questions"
                />
                <SocialCard
                  icon={FaCoffee}
                  href="https://buymeacoffee.com/antoinepinto"
                  label="Buy me a Cookie"
                  description="Support my work and future projects"
                />
              </SimpleGrid>

              <Text fontSize={{ base: "xs", md: "sm" }} opacity={0.8}>
                Made with ❤️ using AI-assisted development
              </Text>
            </Stack>
          </Container>
        </Box>
      </Box>
    </>
  )
}

export default Home 