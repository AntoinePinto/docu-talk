import React from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  VStack,
  HStack,
  Text,
  Icon,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useColorModeValue,
  Image,
  Tag,
  TagLabel,
  TagLeftIcon,
  Spinner,
  useBreakpointValue,
  Stack,
} from '@chakra-ui/react';
import { FiCheck, FiMessageSquare, FiClock } from 'react-icons/fi';
import { ScaleFade } from '@chakra-ui/react';

interface CreationProgressProps {
  isCreating: boolean;
  creationComplete: boolean;
  creationStep: number;
  aiTitle: string | null;
  aiDescription: string | null;
  aiIcon: string | null;
  suggestedPrompts: string[];
  chatbotId: string | null;
  onNavigateToChat: (chatbotId: string) => void;
  estimatedDuration: number | null;
  isCalculatingDuration: boolean;
  formatDuration: (seconds: number) => string;
}

const CreationProgress: React.FC<CreationProgressProps> = ({
  isCreating,
  creationComplete,
  creationStep,
  aiTitle,
  aiDescription,
  aiIcon,
  suggestedPrompts,
  chatbotId,
  onNavigateToChat,
  estimatedDuration,
  isCalculatingDuration,
  formatDuration,
}) => {
  // Move all hooks to the top
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('#0c3b7d', '#0c3b7d');
  const durationBg = useColorModeValue('gray.50', 'gray.700');

  // Responsive values
  const padding = useBreakpointValue({ base: 3, md: 4 });
  const spacing = useBreakpointValue({ base: 4, md: 6 });
  const iconSize = useBreakpointValue({ base: "6", md: "8" });
  const fontSize = useBreakpointValue({ base: "sm", md: "md" });
  const headingSize = useBreakpointValue({ base: "sm", md: "md" });
  const cardSpacing = useBreakpointValue({ base: 2, md: 3 });
  const marginLeft = useBreakpointValue({ base: 8, md: 11 });
  const buttonSize = useBreakpointValue({ base: "md", md: "lg" });
  const imageSize = useBreakpointValue({ base: "48px", md: "64px" });
  const tagSize = useBreakpointValue({ base: "sm", md: "md" });
  const descriptionFontSize = useBreakpointValue({ base: "xs", md: "sm" });

  if (!isCreating && !creationComplete) {
    return (
      <ScaleFade in={true} initialScale={0.9}>
        <Card bg={cardBg} borderRadius="xl" boxShadow="lg" overflow="hidden" height="100%">
          <CardBody py={padding}>
            <VStack spacing={spacing} align="center" textAlign="center" height="100%" justify="center">
              <Text fontSize={headingSize} color={headingColor} fontWeight="bold">
                Create Your AI Chat Bot
              </Text>
              <Text fontSize={fontSize} color={textColor} maxW="2xl">
                Upload your documents and let our AI create a powerful chatbot that understands your content
              </Text>
              <VStack spacing={cardSpacing} align="stretch" width="full" mt={4}>
                <Stack 
                  direction={{ base: 'row', md: 'row' }} 
                  spacing={3} 
                  width="full"
                  align="center"
                  justify={{ base: 'flex-start', md: 'flex-start' }}
                >
                  <Icon as={FiCheck} color={accentColor} boxSize={5} flexShrink={0} />
                  <Text fontSize={fontSize}>Upload PDF documents (up to 20 files, max 200 pages)</Text>
                </Stack>
                <Stack 
                  direction={{ base: 'row', md: 'row' }} 
                  spacing={3} 
                  width="full"
                  align="center"
                  justify={{ base: 'flex-start', md: 'flex-start' }}
                >
                  <Icon as={FiCheck} color={accentColor} boxSize={5} flexShrink={0} />
                  <Text fontSize={fontSize}>Our AI analyzes your content</Text>
                </Stack>
                <Stack 
                  direction={{ base: 'row', md: 'row' }} 
                  spacing={3} 
                  width="full"
                  align="center"
                  justify={{ base: 'flex-start', md: 'flex-start' }}
                >
                  <Icon as={FiCheck} color={accentColor} boxSize={5} flexShrink={0} />
                  <Text fontSize={fontSize}>Get a specialized chatbot for your documents</Text>
                </Stack>
              </VStack>
            </VStack>
          </CardBody>
        </Card>
      </ScaleFade>
    );
  }

  return (
    <Card bg={cardBg} borderRadius="xl" boxShadow="lg" overflow="hidden" height="100%">
      <CardHeader borderBottom="1px" borderColor={borderColor} py={padding}>
        <Text fontSize={headingSize} color={headingColor} fontWeight="bold">
          Creating Your Chat Bot
        </Text>
      </CardHeader>
      <CardBody py={padding}>
        <VStack spacing={spacing} align="stretch">
          {/* Estimated Duration Display */}
          {isCalculatingDuration ? (
            <HStack spacing={2} justify="center">
              <Icon as={FiClock} color={accentColor} />
              <Text fontSize={fontSize} color={textColor}>Calculating duration...</Text>
            </HStack>
          ) : estimatedDuration !== null && (
            <Box
              p={2}
              bg={durationBg}
              borderRadius="lg"
              width="full"
            >
              <Stack 
                direction={{ base: 'column', sm: 'row' }} 
                spacing={2} 
                justify="center" 
                align="center"
              >
                <Icon as={FiClock} color={accentColor} />
                <Text fontSize={fontSize} color={textColor} textAlign="center">
                  Estimated creation duration: {formatDuration(estimatedDuration)}
                </Text>
              </Stack>
            </Box>
          )}

          {/* Step 1: Generating Title & Description */}
          <Box>
            <Stack 
              direction={{ base: 'column', sm: 'row' }} 
              spacing={cardSpacing} 
              align={{ base: 'flex-start', sm: 'center' }}
            >
              <Box 
                w={iconSize} 
                h={iconSize} 
                borderRadius="full" 
                bg={creationStep >= 0 ? "blue.500" : "gray.200"} 
                color="white" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                fontWeight="bold"
                flexShrink={0}
              >
                {creationStep > 0 ? <Icon as={FiCheck} /> : isCreating && creationStep === 0 ? <Spinner size="sm" /> : "1"}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold" fontSize={fontSize}>Generating Title & Description</Text>
                <Text fontSize={descriptionFontSize} color="gray.500">Creating a unique identity</Text>
              </Box>
            </Stack>
            
            {aiTitle && aiDescription && creationStep > 0 && (
              <ScaleFade in={true}>
                <Card variant="outline" p={padding} mt={3} ml={marginLeft}>
                  <VStack align="start" spacing={cardSpacing}>
                    <Text fontWeight="bold" color={accentColor} fontSize={fontSize}>{aiTitle}</Text>
                    <Text fontSize={descriptionFontSize} color={textColor}>{aiDescription}</Text>
                  </VStack>
                </Card>
              </ScaleFade>
            )}
          </Box>
          
          {/* Step 2: Creating Icon */}
          <Box>
            <Stack 
              direction={{ base: 'column', sm: 'row' }} 
              spacing={cardSpacing} 
              align={{ base: 'flex-start', sm: 'center' }}
            >
              <Box 
                w={iconSize} 
                h={iconSize} 
                borderRadius="full" 
                bg={creationStep >= 1 ? "blue.500" : "gray.200"} 
                color="white" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                fontWeight="bold"
                flexShrink={0}
              >
                {creationStep > 1 ? <Icon as={FiCheck} /> : isCreating && creationStep === 1 ? <Spinner size="sm" /> : "2"}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold" fontSize={fontSize}>Creating Icon</Text>
                <Text fontSize={descriptionFontSize} color="gray.500">Designing visual identity</Text>
              </Box>
            </Stack>
            
            {aiIcon && creationStep > 1 && (
              <ScaleFade in={true}>
                <Card variant="outline" p={padding} mt={3} ml={marginLeft}>
                  <Box>
                    <Image 
                      src={`data:image/png;base64,${aiIcon}`} 
                      alt="Chatbot Icon" 
                      boxSize={imageSize} 
                      borderRadius="md"
                    />
                  </Box>
                </Card>
              </ScaleFade>
            )}
          </Box>
          
          {/* Step 3: Generating Prompts */}
          <Box>
            <Stack 
              direction={{ base: 'column', sm: 'row' }} 
              spacing={cardSpacing} 
              align={{ base: 'flex-start', sm: 'center' }}
            >
              <Box 
                w={iconSize} 
                h={iconSize} 
                borderRadius="full" 
                bg={creationStep >= 2 ? "blue.500" : "gray.200"} 
                color="white" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                fontWeight="bold"
                flexShrink={0}
              >
                {creationStep > 2 ? <Icon as={FiCheck} /> : isCreating && creationStep === 2 ? <Spinner size="sm" /> : "3"}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold" fontSize={fontSize}>Generating Prompts</Text>
                <Text fontSize={descriptionFontSize} color="gray.500">Creating conversation starters</Text>
              </Box>
            </Stack>
            
            {suggestedPrompts.length > 0 && creationStep > 2 && (
              <ScaleFade in={true}>
                <Card variant="outline" p={padding} mt={3} ml={marginLeft}>
                  <VStack align="start" spacing={cardSpacing}>
                    <Text fontWeight="bold" fontSize={fontSize}>Suggested Prompts:</Text>
                    <VStack align="start" spacing={2}>
                      {suggestedPrompts.map((prompt, index) => (
                        <Tag
                          key={index}
                          size={tagSize}
                          variant="subtle"
                          colorScheme="blue"
                          borderRadius="full"
                        >
                          <TagLeftIcon as={FiMessageSquare} />
                          <TagLabel>{prompt}</TagLabel>
                        </Tag>
                      ))}
                    </VStack>
                  </VStack>
                </Card>
              </ScaleFade>
            )}
          </Box>
          
          {/* Step 4: Finalizing */}
          <Box>
            <Stack 
              direction={{ base: 'column', sm: 'row' }} 
              spacing={cardSpacing} 
              align={{ base: 'flex-start', sm: 'center' }}
            >
              <Box 
                w={iconSize} 
                h={iconSize} 
                borderRadius="full" 
                bg={creationStep >= 3 ? "blue.500" : "gray.200"} 
                color="white" 
                display="flex" 
                alignItems="center" 
                justifyContent="center"
                fontWeight="bold"
                flexShrink={0}
              >
                {creationStep > 3 ? <Icon as={FiCheck} /> : isCreating && creationStep === 3 ? <Spinner size="sm" /> : "4"}
              </Box>
              <Box flex="1">
                <Text fontWeight="bold" fontSize={fontSize}>Finalizing</Text>
                <Text fontSize={descriptionFontSize} color="gray.500">Preparing your chatbot</Text>
              </Box>
            </Stack>
          </Box>
          
          {/* Completion Message */}
          {creationComplete && chatbotId && (
            <ScaleFade in={true}>
              <Alert
                status="success"
                variant="subtle"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                borderRadius="lg"
                p={padding}
              >
                <AlertIcon boxSize="40px" mr={0} />
                <AlertTitle mt={4} mb={1} fontSize={headingSize}>
                  Chat Bot Created Successfully!
                </AlertTitle>
                <AlertDescription maxWidth="sm" fontSize={fontSize}>
                  Your AI chat bot is ready to use. Click the button below to start chatting.
                </AlertDescription>
                <Button
                  mt={4}
                  colorScheme="blue"
                  size={buttonSize}
                  onClick={() => onNavigateToChat(chatbotId)}
                  leftIcon={<Icon as={FiMessageSquare} />}
                >
                  Start Chatting
                </Button>
              </Alert>
            </ScaleFade>
          )}
        </VStack>
      </CardBody>
    </Card>
  );
};

export default CreationProgress; 