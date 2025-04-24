import React, { useState } from 'react';
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Text, VStack, useColorModeValue, ModalFooter } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { termsOfUse } from '../data/termsOfUse';
import { useAuth } from './auth/AuthContext';
import axios from 'axios';

export const SettingsSidebar: React.FC = () => {
  const { logout } = useAuth();
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.700', 'white');

  const handleDeleteAccount = async () => {
    try {
      setIsDeleting(true);
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/api/auth/delete_account`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      logout();
    } catch (error) {
      console.error('Failed to delete account:', error);
      alert('Failed to delete account. Please try again later.');
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
    }
  };

  return (
    <Box
      w="300px"
      p={6}
      bg={bgColor}
      borderLeft="1px"
      borderColor={useColorModeValue('gray.200', 'gray.700')}
      h="100%"
      display="flex"
      flexDirection="column"
      gap={4}
    >
      <Text fontSize="xl" fontWeight="bold" color={textColor}>
        Settings
      </Text>

      <VStack spacing={4} align="stretch">
        <Button
          variant="outline"
          onClick={() => setIsTermsOpen(true)}
        >
          View Terms of Use
        </Button>

        <Button
          colorScheme="red"
          variant="solid"
          onClick={() => setIsDeleteConfirmOpen(true)}
        >
          Delete Account
        </Button>
      </VStack>

      <Modal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        size="xl"
        scrollBehavior="inside"
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Terms of Use</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <Box
              maxH="60vh"
              overflowY="auto"
              p={4}
              css={{
                '& h1': {
                  fontSize: '1.5rem',
                  marginBottom: '1rem',
                  fontWeight: 'bold',
                },
                '& h2': {
                  fontSize: '1.2rem',
                  marginTop: '1rem',
                  marginBottom: '0.5rem',
                  fontWeight: 'bold',
                },
                '& p': {
                  marginBottom: '0.5rem',
                  lineHeight: '1.5',
                },
                '& ul': {
                  paddingLeft: '1.5rem',
                  marginBottom: '0.5rem',
                },
                '& li': {
                  marginBottom: '0.25rem',
                },
              }}
            >
              <ReactMarkdown>{termsOfUse}</ReactMarkdown>
            </Box>
          </ModalBody>
        </ModalContent>
      </Modal>

      <Modal
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        isCentered
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Delete Account</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Are you sure you want to delete your account? This action cannot be undone.
              All your data will be permanently deleted.
            </Text>
          </ModalBody>
          <ModalFooter>
            <Button
              variant="ghost"
              mr={3}
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              colorScheme="red"
              onClick={handleDeleteAccount}
              isLoading={isDeleting}
            >
              Delete Account
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}; 