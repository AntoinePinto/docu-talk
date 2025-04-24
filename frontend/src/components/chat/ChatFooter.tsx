import { Box, useColorModeValue } from '@chakra-ui/react';
import ChatInput from './ChatInput';
import SuggestedPrompts from './SuggestedPrompts';

interface ChatFooterProps {
  input: string;
  isLoading: boolean;
  usePremiumModel: boolean;
  onInputChange: (value: string) => void;
  onPremiumModelChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
  showPrompts: boolean;
  prompts: string[];
  onPromptClick: (prompt: string) => void;
  onClosePrompts: () => void;
}

const ChatFooter = ({
  input,
  isLoading,
  usePremiumModel,
  onInputChange,
  onPremiumModelChange,
  onSubmit,
  onKeyDown,
  showPrompts,
  prompts,
  onPromptClick
}: ChatFooterProps) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <>
      <Box 
        position="fixed"
        bottom={0}
        left={0}
        right={0}
        zIndex={2}
        display="flex"
        flexDirection="column"
        alignItems="center"
        p={4}
      >
        {showPrompts && prompts.length > 0 && (
          <Box 
            maxW="700px"
            w="100%"
            mb={4}
          >
            <SuggestedPrompts 
              prompts={prompts}
              onPromptClick={onPromptClick}
            />
          </Box>
        )}
        <Box 
          maxW="700px"
          w="100%"
          bg={bgColor}
          borderRadius="xl"
          border="1px"
          borderColor={borderColor}
          boxShadow="0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
          p={4}
        >
          <ChatInput 
            input={input}
            isLoading={isLoading}
            usePremiumModel={usePremiumModel}
            onInputChange={onInputChange}
            onPremiumModelChange={onPremiumModelChange}
            onSubmit={onSubmit}
            onKeyDown={onKeyDown}
          />
        </Box>
      </Box>
    </>
  );
};

export default ChatFooter; 