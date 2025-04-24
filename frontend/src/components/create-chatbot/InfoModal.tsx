import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  VStack,
  Text,
  List,
  ListItem,
  ListIcon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Box,
  useColorModeValue,
} from '@chakra-ui/react';
import { FiUpload, FiInfo, FiCheck } from 'react-icons/fi';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  const accentColor = useColorModeValue('#0c3b7d', '#0c3b7d');

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>How It Works</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack align="stretch" spacing={4}>
            <Text>
              Our AI-powered chatbot creation process is simple and efficient:
            </Text>
            <List spacing={3}>
              <ListItem>
                <ListIcon as={FiUpload} color={accentColor} />
                Upload your PDF documents (up to 20 files, 200 pages total)
              </ListItem>
              <ListItem>
                <ListIcon as={FiInfo} color={accentColor} />
                Our AI analyzes your documents and creates a specialized chatbot
              </ListItem>
              <ListItem>
                <ListIcon as={FiCheck} color={accentColor} />
                The chatbot will automatically suggest a title, description, and icon
              </ListItem>
            </List>
            <Alert status="info" borderRadius="md">
              <AlertIcon />
              <Box>
                <AlertTitle>Security Note</AlertTitle>
                <AlertDescription>
                  Your documents are stored securely and are only accessible through temporary URLs (15 minutes validity) shared exclusively with authorized users.
                </AlertDescription>
              </Box>
            </Alert>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default InfoModal; 