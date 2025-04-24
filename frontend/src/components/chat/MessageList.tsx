import { Box, Flex, VStack, Text, Avatar, useColorModeValue, Spinner, Button } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Chatbot } from '../../components/auth/UserContext';
import DocumentSelector from './DocumentSelector';
import { useEffect, useRef } from 'react';
import { FiTrash2 } from 'react-icons/fi';

interface Message {
    text: string;
    isUser: boolean;
} 

interface MessageListProps {
  messages: Message[];
  chatbotDetails: Chatbot | null;
  onDocumentSelect: (documents: string[]) => void;
  selectedDocuments: string[];
  isLoadingDetails: boolean;
  isTyping?: boolean;
  estimatedDuration?: number | null;
  onSourceIdentification?: () => void;
  onClearConversation?: () => void;
  hasMessages?: boolean;
}

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;


const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;


const MessageList = ({ 
  messages, 
  chatbotDetails, 
  onDocumentSelect, 
  selectedDocuments,
  isLoadingDetails,
  isTyping = false,
  estimatedDuration = null,
  onSourceIdentification,
  onClearConversation,
  hasMessages = false
}: MessageListProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const userMessageBg = useColorModeValue('blue.50', 'blue.900');
  const botMessageBg = useColorModeValue('gray.50', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  const scrollbarTrackBg = useColorModeValue('gray.100', 'gray.800');
  const scrollbarThumbBg = useColorModeValue('gray.300', 'gray.600');
  const scrollbarThumbHoverBg = useColorModeValue('gray.400', 'gray.500');
  const codeBlockBg = useColorModeValue('gray.800', 'gray.900');
  const sourceButtonBg = useColorModeValue('blue.100', 'blue.700');
  const sourceButtonColor = useColorModeValue('blue.700', 'blue.100');
  const sourceButtonHoverBg = useColorModeValue('blue.200', 'blue.600');
  const sourceButtonBorderColor = useColorModeValue('blue.200', 'blue.600');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (messages.length > 1) {
      scrollToBottom();
    }
  }, [messages, isTyping]);

  if (isLoadingDetails) {
    return (
      <Flex justify="center" align="center" h="100%">
        <Spinner size="xl" color="blue.500" thickness="4px" />
      </Flex>
    );
  }

  return (
    <Box 
      flex={1} 
      overflowY="auto" 
      p={4}
      pb="200px"
      css={{
        '&::-webkit-scrollbar': {
          width: '6px',
        },
        '&::-webkit-scrollbar-track': {
          background: scrollbarTrackBg,
          borderRadius: '10px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: scrollbarThumbBg,
          borderRadius: '10px',
          '&:hover': {
            background: scrollbarThumbHoverBg,
          },
        },
      }}
    >
      <Box maxW="800px" mx="auto">
        <VStack spacing={4} align="stretch">
          {messages.map((message, index) => (
            <Flex 
              key={index} 
              justify={message.isUser ? 'flex-end' : 'flex-start'}
              w="100%"
              animation={`${fadeIn} 0.3s ease-out`}
            >
              <Box
                maxW="85%"
                bg={message.isUser ? userMessageBg : botMessageBg}
                p={4}
                borderRadius="xl"
                boxShadow="sm"
                position="relative"
                border="1px solid"
                borderColor={borderColor}
                _hover={{
                  boxShadow: 'md',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                {!message.isUser && index > 0 && messages[index - 1]?.isUser && (
                  <Flex align="center" mb={2}>
                    <Avatar 
                      size="sm" 
                      src={chatbotDetails ? `data:image/png;base64,${chatbotDetails.icon}` : undefined}
                      name={chatbotDetails?.title || 'Bot'}
                      border="2px solid"
                      borderColor={bgColor}
                      mr={2}
                    />
                    <Text fontWeight="medium" color={textColor}>
                      {chatbotDetails?.title || 'Assistant'}
                    </Text>
                  </Flex>
                )}
                {message.isUser ? (
                  <Text fontSize="md">{message.text}</Text>
                ) : (
                  <Box className="markdown-content">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code({ node, inline, className, children, ...props }: any) {
                          const match = /language-(\w+)/.exec(className || '')
                          return !inline && match ? (
                            <Box 
                              as="pre" 
                              bg={codeBlockBg}
                              color="white" 
                              p={4} 
                              borderRadius="md" 
                              overflowX="auto"
                              my={3}
                              boxShadow="md"
                            >
                              <code className={className} {...props}>
                                {String(children).replace(/\n$/, '')}
                              </code>
                            </Box>
                          ) : (
                            <code className={className} {...props}>
                              {children}
                            </code>
                          )
                        },
                        p: ({ children }) => <Text mb={3} fontSize="md">{children}</Text>,
                        h1: ({ children }) => <Text as="h1" fontSize="2xl" fontWeight="bold" mb={3}>{children}</Text>,
                        h2: ({ children }) => <Text as="h2" fontSize="xl" fontWeight="bold" mb={3}>{children}</Text>,
                        h3: ({ children }) => <Text as="h3" fontSize="lg" fontWeight="bold" mb={3}>{children}</Text>,
                        ul: ({ children }) => <Box as="ul" pl={6} mb={3}>{children}</Box>,
                        ol: ({ children }) => <Box as="ol" pl={6} mb={3}>{children}</Box>,
                        li: ({ children }) => <Box as="li" mb={2}>{children}</Box>,
                        a: ({ href, children }) => (
                          <Text 
                            as="a" 
                            href={href} 
                            color="blue.500" 
                            textDecoration="underline" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            _hover={{ color: "blue.600" }}
                          >
                            {children}
                          </Text>
                        ),
                      }}
                    >
                      {message.text}
                    </ReactMarkdown>
                    
                    {index === 0 && chatbotDetails?.documents && chatbotDetails.documents.length > 0 && (
                      <DocumentSelector 
                        documents={chatbotDetails.documents}
                        selectedDocuments={selectedDocuments}
                        onSelect={onDocumentSelect}
                      />
                    )}
                    
                    {!message.isUser && 
                     onSourceIdentification && 
                     index > 0 && 
                     !message.text.includes('[') && 
                     messages.slice(index + 1).every(m => m.isUser) && (
                      <Button
                        size="sm"
                        mt={3}
                        bg={sourceButtonBg}
                        color={sourceButtonColor}
                        _hover={{ 
                          bg: sourceButtonHoverBg,
                          transform: 'translateY(-1px)',
                          boxShadow: 'sm'
                        }}
                        onClick={onSourceIdentification}
                        leftIcon={<span>✨</span>}
                        fontWeight="medium"
                        border="1px solid"
                        borderColor={sourceButtonBorderColor}
                      >
                        Try source identification
                      </Button>
                    )}
                  </Box>
                )}
              </Box>
            </Flex>
          ))}
          {isTyping && (
            <Flex justify="flex-start" w="100%" animation={`${fadeIn} 0.3s ease-out`}>
              <Box
                bg={botMessageBg}
                p={4}
                borderRadius="xl"
                boxShadow="sm"
                border="1px solid"
                borderColor={borderColor}
                maxW="85%"
                position="relative"
                _hover={{
                  boxShadow: 'md',
                  transform: 'translateY(-1px)',
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <Flex align="center" gap={3}>
                  <Box
                    position="relative"
                    width="24px"
                    height="24px"
                    animation={`${spin} 1s linear infinite`}
                  >
                    <Box
                      position="absolute"
                      top="0"
                      left="0"
                      width="100%"
                      height="100%"
                      border="2px solid"
                      borderColor="transparent"
                      borderTopColor="blue.500"
                      borderRadius="50%"
                    />
                  </Box>
                  <Text color={textColor}>
                    Estimation response time: {estimatedDuration} seconds
                  </Text>
                </Flex>
              </Box>
            </Flex>
          )}
          
          {hasMessages && onClearConversation && messages.length > 1 && (
            <Flex justify="flex-start" w="100%" mt={2} animation={`${fadeIn} 0.3s ease-out`}>
              <Button
                leftIcon={<FiTrash2 />}
                variant="ghost"
                onClick={onClearConversation}
                size="sm"
                colorScheme="red"
                _hover={{ bg: 'red.50' }}
                alignSelf="flex-start"
              >
                Clear Conversation
              </Button>
            </Flex>
          )}
          
          <div ref={messagesEndRef} />
        </VStack>
      </Box>
    </Box>
  );
};

export default MessageList; 