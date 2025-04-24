import React, { useState } from 'react';
import { Box, Button, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Text, VStack } from '@chakra-ui/react';
import ReactMarkdown from 'react-markdown';
import { termsOfUse } from '../data/termsOfUse';
import { useUser } from './auth/UserContext';
import axios from 'axios';

interface TermsOfUseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TermsOfUseModal: React.FC<TermsOfUseModalProps> = ({ isOpen, onClose }) => {
  const { refreshUserData } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAcceptTerms = async () => {
    try {
      setIsSubmitting(true);
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/set_terms_accepted`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      await refreshUserData();
      onClose();
    } catch (error) {
      console.error('Failed to accept terms:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside or pressing escape
      size="xl"
      scrollBehavior="inside"
      closeOnOverlayClick={false}
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Terms of Use</ModalHeader>
        <ModalCloseButton isDisabled={true} />
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
          <VStack mt={4} spacing={4}>
            <Text fontSize="sm" color="gray.500">
              By clicking "Accept Terms", you agree to our Terms of Use.
            </Text>
            <Button
              colorScheme="blue"
              onClick={handleAcceptTerms}
              isLoading={isSubmitting}
              loadingText="Accepting..."
              width="full"
            >
              Accept Terms
            </Button>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default TermsOfUseModal; 