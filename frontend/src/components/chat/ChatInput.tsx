import { Box, VStack, HStack, Input, IconButton, Icon, Text, Switch, useColorModeValue } from '@chakra-ui/react';
import { FiSend, FiSettings } from 'react-icons/fi';
import { useRef } from 'react';

interface ChatInputProps {
  input: string;
  isLoading: boolean;
  usePremiumModel: boolean;
  onInputChange: (value: string) => void;
  onPremiumModelChange: (value: boolean) => void;
  onSubmit: (e: React.FormEvent) => void;
  onKeyDown: (e: React.KeyboardEvent) => void;
}

const ChatInput = ({ 
  input, 
  isLoading, 
  usePremiumModel, 
  onInputChange, 
  onPremiumModelChange, 
  onSubmit,
  onKeyDown
}: ChatInputProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <Box>
      <form onSubmit={onSubmit}>
        <VStack spacing={2} align="stretch">
          <HStack spacing={2} alignSelf="flex-start">
            <Icon 
              as={FiSettings} 
              fontSize="xs" 
              color={useColorModeValue('gray.500', 'gray.400')}
            />
            <Text fontSize="xs" color={useColorModeValue('gray.600', 'gray.400')}>
              Premium Model
            </Text>
            <Switch
              size="sm"
              colorScheme="purple"
              isChecked={usePremiumModel}
              onChange={(e) => onPremiumModelChange(e.target.checked)}
            />
          </HStack>
          <HStack>
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => onInputChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Type your message..."
              disabled={isLoading}
              size="lg"
              borderRadius="full"
              border="none"
              _focus={{
                boxShadow: 'none',
              }}
            />
            <IconButton
              type="submit"
              aria-label="Send message"
              icon={<FiSend />}
              colorScheme="blue"
              isLoading={isLoading}
              disabled={!input.trim()}
              size="lg"
              borderRadius="full"
            />
          </HStack>
        </VStack>
      </form>
    </Box>
  );
};

export default ChatInput; 