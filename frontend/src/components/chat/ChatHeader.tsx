import { HStack, Button, Heading, Text, Avatar, VStack, Container, useColorModeValue, Tooltip, useBreakpointValue, IconButton } from '@chakra-ui/react';
import { FiArrowLeft, FiSettings, FiTrash2, FiShare2 } from 'react-icons/fi';
import { Chatbot } from '../../components/auth/UserContext';

interface ChatHeaderProps {
  chatbotDetails: Chatbot | null;
  onBack: () => void;
  onSettings: () => void;
  onClearConversation?: () => void;
  onShare?: () => void;
  hasMessages?: boolean;
}

const ChatHeader = ({ 
  chatbotDetails, 
  onBack, 
  onSettings, 
  onClearConversation,
  onShare,
  hasMessages = false
}: ChatHeaderProps) => {
  const isAdmin = chatbotDetails?.user_role === 'Admin';
  const isMobile = useBreakpointValue({ base: true, md: false });
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.500', 'gray.400');
  
  return (
    <Container maxW="container.xl" py={{ base: 2, md: 4 }}>
      <HStack justify="space-between" align="center" width="100%" spacing={{ base: 2, md: 4 }}>
        {isMobile ? (
          <IconButton
            aria-label="Back to Dashboard"
            icon={<FiArrowLeft />}
            variant="ghost"
            onClick={onBack}
            _hover={{ bg: 'blue.50' }}
            size="sm"
            colorScheme="blue"
          />
        ) : (
          <Button
            leftIcon={<FiArrowLeft />}
            variant="ghost"
            onClick={onBack}
            _hover={{ bg: 'blue.50' }}
            size="sm"
            colorScheme="blue"
          >
            Back to Dashboard
          </Button>
        )}

        <HStack spacing={{ base: 2, md: 4 }} align="center" flex={1} justify="center">
          {chatbotDetails && (
            <HStack spacing={{ base: 1, md: 2 }}>
              <Avatar 
                size={isMobile ? "xs" : "sm"}
                src={`data:image/png;base64,${chatbotDetails.icon}`} 
                name={chatbotDetails.title}
              />
              <VStack align="start" spacing={0}>
                <Heading 
                  size={isMobile ? "xs" : "md"} 
                  color={headingColor}
                  noOfLines={1}
                >
                  {chatbotDetails.title}
                </Heading>
                <Text 
                  fontSize={isMobile ? "2xs" : "xs"} 
                  color={textColor}
                  noOfLines={1}
                >
                  {chatbotDetails.description}
                </Text>
              </VStack>
            </HStack>
          )}
        </HStack>
        
        <HStack spacing={{ base: 1, md: 2 }}>
          {hasMessages && onClearConversation && (
            <Tooltip 
              label="Clear conversation" 
              placement="bottom"
              hasArrow
            >
              {isMobile ? (
                <IconButton
                  aria-label="Clear Chat"
                  icon={<FiTrash2 />}
                  variant="ghost"
                  onClick={onClearConversation}
                  size="sm"
                  colorScheme="red"
                  _hover={{ bg: 'red.50' }}
                />
              ) : (
                <Button
                  leftIcon={<FiTrash2 />}
                  variant="ghost"
                  onClick={onClearConversation}
                  size="sm"
                  colorScheme="red"
                  _hover={{ bg: 'red.50' }}
                >
                  Clear Chat
                </Button>
              )}
            </Tooltip>
          )}
          
          <Tooltip 
            label="Only administrators can share chatbot" 
            placement="bottom"
            hasArrow
            isDisabled={isAdmin}
          >
            {isMobile ? (
              <IconButton
                aria-label="Share Chatbot"
                icon={<FiShare2 />}
                variant="ghost"
                onClick={onShare}
                size="sm"
                colorScheme="blue"
                isDisabled={!isAdmin}
                opacity={isAdmin ? 1 : 0.5}
                _hover={isAdmin ? { bg: 'blue.50' } : undefined}
                _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
              />
            ) : (
              <Button
                leftIcon={<FiShare2 />}
                variant="ghost"
                onClick={onShare}
                size="sm"
                colorScheme="blue"
                isDisabled={!isAdmin}
                opacity={isAdmin ? 1 : 0.5}
                _hover={isAdmin ? { bg: 'blue.50' } : undefined}
                _disabled={{ opacity: 0.5, cursor: 'not-allowed' }}
              >
                Share
              </Button>
            )}
          </Tooltip>
          
          <Tooltip 
            label="Only administrators can edit chatbot settings" 
            placement="bottom"
            hasArrow
            isDisabled={isAdmin}
          >
            {isMobile ? (
              <IconButton
                aria-label="Edit Chatbot"
                icon={<FiSettings />}
                variant="ghost"
                onClick={onSettings}
                size="sm"
                colorScheme="blue"
                isDisabled={!isAdmin}
                opacity={isAdmin ? 1 : 0.5}
                _hover={isAdmin ? { bg: 'blue.50' } : undefined}
              />
            ) : (
              <Button
                leftIcon={<FiSettings />}
                variant="ghost"
                onClick={onSettings}
                size="sm"
                colorScheme="blue"
                isDisabled={!isAdmin}
                opacity={isAdmin ? 1 : 0.5}
                _hover={isAdmin ? { bg: 'blue.50' } : undefined}
              >
                Edit Chatbot
              </Button>
            )}
          </Tooltip>
        </HStack>
      </HStack>
    </Container>
  );
};

export default ChatHeader; 