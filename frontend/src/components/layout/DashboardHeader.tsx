import React from 'react';
import { Box, Container, Flex, useColorModeValue } from '@chakra-ui/react';
import UserProfile from '../auth/UserProfile';
import CreditsDisplay from '../ui/CreditsDisplay';
import HeaderActions from '../layout/HeaderActions';
import Logo from './Logo';
import { useUser } from '../auth/UserContext';

interface DashboardHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  isRefreshing, 
  onRefresh, 
  onOpenSettings 
}) => {
  const { user, remainingCredits } = useUser();
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  return (
    <Box 
      as="header" 
      bg={cardBg} 
      boxShadow="sm" 
      position="sticky" 
      top={0} 
      zIndex={10}
      borderBottom="1px"
      borderColor={borderColor}
    >
      <Container maxW="container.xl" py={2}>
        <Flex justify="space-between" align="center">
          <Flex align="center" gap={3}>
            {user && (
              <>
                <UserProfile 
                  friendly_name={user.friendly_name} 
                  email={user.email} 
                />
                <CreditsDisplay 
                  remainingCredits={remainingCredits}
                  period_dollar_amount={user.period_dollar_amount}
                />
              </>
            )}
          </Flex>
          
          <Logo />
          
          <HeaderActions 
            isRefreshing={isRefreshing}
            onRefresh={onRefresh}
            onOpenSettings={onOpenSettings}
          />
        </Flex>
      </Container>
    </Box>
  );
};

export default DashboardHeader; 