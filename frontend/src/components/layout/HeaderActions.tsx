import React from 'react';
import { HStack, IconButton, Button, useBreakpointValue } from '@chakra-ui/react';
import { FiLogOut, FiSettings, FiRefreshCw } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

interface HeaderActionsProps {
  isRefreshing: boolean;
  onRefresh: () => void;
  onOpenSettings: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ 
  isRefreshing, 
  onRefresh, 
  onOpenSettings 
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HStack spacing={{ base: 1, md: 2 }} flexShrink={0}>
      <IconButton
        aria-label="Refresh"
        icon={<FiRefreshCw />}
        variant="ghost"
        onClick={onRefresh}
        isLoading={isRefreshing}
        size="sm"
      />
      <IconButton
        aria-label="Settings"
        icon={<FiSettings />}
        variant="ghost"
        onClick={onOpenSettings}
        size="sm"
      />
      {isMobile ? (
        <IconButton
          aria-label="Logout"
          icon={<FiLogOut />}
          variant="ghost"
          colorScheme="red"
          size="sm"
          onClick={handleLogout}
        />
      ) : (
        <Button
          leftIcon={<FiLogOut />}
          colorScheme="red"
          variant="ghost"
          size="sm"
          onClick={handleLogout}
        >
          Logout
        </Button>
      )}
    </HStack>
  );
};

export default HeaderActions; 