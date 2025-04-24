import { HStack, Tag, TagLabel, TagLeftIcon, useColorModeValue, IconButton } from '@chakra-ui/react';
import { FiMessageSquare, FiRefreshCw } from 'react-icons/fi';
import { useState, useCallback } from 'react';

interface SuggestedPromptsProps {
  prompts: string[];
  onPromptClick: (prompt: string) => void;
}

const SuggestedPrompts = ({ prompts, onPromptClick }: SuggestedPromptsProps) => {
  // Select 2 random prompts
  const getRandomPrompts = useCallback((prompts: string[]) => {
    const shuffled = [...prompts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 2);
  }, []);

  const [randomPrompts, setRandomPrompts] = useState(() => getRandomPrompts(prompts));

  const refreshPrompts = useCallback(() => {
    setRandomPrompts(getRandomPrompts(prompts));
  }, [prompts, getRandomPrompts]);

  return (
    <HStack spacing={2} wrap="wrap" justify="flex-end">
      {randomPrompts.map((prompt, index) => (
        <Tag 
          key={index}
          size="sm"
          variant="subtle"
          colorScheme="blue"
          cursor="pointer"
          onClick={() => onPromptClick(prompt)}
          _hover={{ bg: useColorModeValue('blue.50', 'blue.900') }}
        >
          <TagLeftIcon as={FiMessageSquare} />
          <TagLabel>{prompt}</TagLabel>
        </Tag>
      ))}
      <IconButton
        aria-label="Refresh prompts"
        icon={<FiRefreshCw />}
        size="xs"
        variant="ghost"
        onClick={refreshPrompts}
        color={useColorModeValue('gray.500', 'gray.400')}
        _hover={{ color: useColorModeValue('blue.500', 'blue.300') }}
      />
    </HStack>
  );
};

export default SuggestedPrompts; 