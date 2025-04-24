import React from 'react';
import { HStack, VStack, Text, Box, Progress, useColorModeValue } from '@chakra-ui/react';

interface CreditsDisplayProps {
  remainingCredits: number | null;
  period_dollar_amount: number;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ 
  remainingCredits, 
  period_dollar_amount 
}) => {
  const headingColor = useColorModeValue('gray.700', 'white');
  const totalCredits = period_dollar_amount ? Math.floor(1000 * period_dollar_amount) : 0;

  return (
    <HStack 
      spacing={2} 
      bg={useColorModeValue('purple.50', 'purple.900')} 
      px={2} 
      py={1} 
      borderRadius="md"
      align="center"
      minW={{ base: "auto", md: "140px" }}
      maxW={{ base: "100%", md: "auto" }}
      flexShrink={0}
    >
      <VStack spacing={0.5} align="start" width="100%">
        <HStack spacing={1} width="100%" justify="space-between">
          <Text fontSize="2xs" fontWeight="bold" color={headingColor}>
            Credits
          </Text>
          <Text fontSize="2xs" fontWeight="bold">
            {remainingCredits !== null ? 
              `${Math.floor(remainingCredits)} / ${totalCredits}` : 
              'Loading...'}
          </Text>
        </HStack>
        {remainingCredits !== null && (
          <Box width="100%">
            <Progress 
              value={(remainingCredits / totalCredits) * 100} 
              colorScheme="purple" 
              borderRadius="md"
              size="xs"
              width="100%"
            />
          </Box>
        )}
      </VStack>
    </HStack>
  );
};

export default CreditsDisplay; 