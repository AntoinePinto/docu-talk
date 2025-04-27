import { Box, Flex, Heading, Image, Text, IconButton, useColorModeValue } from '@chakra-ui/react';
import { FiMaximize2 } from 'react-icons/fi';
import logo from '../../../public/logo.svg';
import { useRef } from 'react';

interface BrandingSectionProps {
  animation: string;
}

const BrandingSection = ({ animation }: BrandingSectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const buttonBg = useColorModeValue('white', 'gray.800');

  const handleFullscreen = () => {
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  return (
    <Flex
      flex={1}
      direction="column"
      align="center"
      justify="center"
      textAlign="center"
      color="black"
      animation={animation}
      display={{ base: 'none', md: 'flex' }}
    >
      <Image src={logo} alt="DocuTalk Logo" w="80px" mb={5} />
      <Heading size="2xl" mb={3} color="#0c3b7d">
        Docu Talk
      </Heading>
      <Text fontSize="xl" color="black">
        Your AI-powered document assistant
      </Text>
      <Text mt={3} color="black">
        Create custom AI chatbots instantly using your own documents with Docu Talk – your intelligent assistant powered by AI.
      </Text>
      
      <Box
        mt={5}
        w="full"
        maxW="550px"
        borderRadius="xl"
        overflow="hidden"
        boxShadow="2xl"
        position="relative"
      >
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
        <IconButton
          aria-label="Fullscreen"
          icon={<FiMaximize2 />}
          position="absolute"
          bottom={4}
          right={4}
          bg={buttonBg}
          _hover={{ bg: buttonBg, opacity: 0.9 }}
          onClick={handleFullscreen}
          size="sm"
          borderRadius="md"
        />
      </Box>
    </Flex>
  );
};

export default BrandingSection; 