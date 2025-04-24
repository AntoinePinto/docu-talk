import React from 'react';
import { HStack, VStack, Heading, Text, Avatar, useColorModeValue, useBreakpointValue } from '@chakra-ui/react';

interface UserProfileProps {
  friendly_name: string;
  email: string;
}

const UserProfile: React.FC<UserProfileProps> = ({ friendly_name, email }) => {
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const isMobile = useBreakpointValue({ base: true, md: false });

  if (isMobile) {
    return (
      <Avatar 
        size="sm" 
        name={friendly_name} 
        bg="#0c3b7d"
        color="white"
      />
    );
  }

  return (
    <HStack 
      spacing={{ base: 2, md: 3 }} 
      align="center"
      flexWrap={{ base: 'wrap', md: 'nowrap' }}
      maxW={{ base: '100%', md: 'auto' }}
    >
      <Avatar 
        size="sm" 
        name={friendly_name} 
        bg="#0c3b7d"
        color="white"
      />
      <VStack 
        align="start" 
        spacing={0}
        maxW={{ base: 'calc(100% - 50px)', md: 'auto' }}
      >
        <Heading 
          size="sm" 
          color={headingColor}
          fontSize={{ base: 'xs', md: 'sm' }}
          noOfLines={1}
        >
          Welcome, {friendly_name}
        </Heading>
        <Text 
          fontSize="xs" 
          color={textColor}
          noOfLines={1}
        >
          {email}
        </Text>
      </VStack>
    </HStack>
  );
};

export default UserProfile; 