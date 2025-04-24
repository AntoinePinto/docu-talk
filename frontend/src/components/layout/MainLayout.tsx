import React, { useState, useEffect } from 'react';
import { Box, useColorModeValue, Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody } from '@chakra-ui/react';
import { useUser } from '../auth/UserContext';
import DashboardHeader from '../layout/DashboardHeader';
import { SettingsSidebar } from '../SettingsSidebar';
import TermsOfUseModal from '../TermsOfUseModal';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [isTermsModalOpen, setIsTermsModalOpen] = useState(false);
  const { user, refreshUserData } = useUser();
  const bgColor = useColorModeValue('gray.50', 'gray.900');

  useEffect(() => {
    if (user && !user.terms_of_use_displayed) {
      setIsTermsModalOpen(true);
    }
  }, [user]);

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await refreshUserData();
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <Box minH="100vh" bg={bgColor}>
      <DashboardHeader 
        isRefreshing={isRefreshing}
        onRefresh={handleRefresh}
        onOpenSettings={() => setIsOpen(true)}
      />
      {children}

      <Drawer
        isOpen={isOpen}
        placement="right"
        onClose={() => setIsOpen(false)}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Settings</DrawerHeader>
          <DrawerBody>
            <SettingsSidebar />
          </DrawerBody>
        </DrawerContent>
      </Drawer>

      <TermsOfUseModal 
        isOpen={isTermsModalOpen}
        onClose={() => setIsTermsModalOpen(false)}
      />
    </Box>
  );
};

export default MainLayout; 