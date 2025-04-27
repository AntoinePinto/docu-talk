import React, { useState, useEffect } from 'react';
import { IconButton, useDisclosure, Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalCloseButton, Tooltip, Box } from '@chakra-ui/react';
import { keyframes } from '@emotion/react';
import { FaLightbulb } from 'react-icons/fa';
import FeedbackForm from './FeedbackForm';

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const messages = [
  "Got an idea? Share it with us! 💡",
  "Found a bug? Let us know! 🐛",
  "Help us improve! Share your thoughts! ✨",
  "Your feedback matters! 🎯",
  "Have a suggestion? We're all ears! 👂"
];

const FloatingFeedbackButton: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentMessage, setCurrentMessage] = useState(0);

  useEffect(() => {
    // Don't show tooltip if modal is open
    if (isOpen) {
      setShowTooltip(false);
      return;
    }

    const interval = setInterval(() => {
      setShowTooltip(true);
      setCurrentMessage((prev) => (prev + 1) % messages.length);
      
      // Hide tooltip after 3 seconds
      setTimeout(() => {
        setShowTooltip(false);
      }, 3000);
    }, 15000); // Show every 15 seconds

    return () => clearInterval(interval);
  }, [isOpen]); // Add isOpen to dependencies

  return (
    <>
      <Box position="fixed" bottom="20px" right="20px" zIndex={1000}>
        <Tooltip
          label={messages[currentMessage]}
          placement="left"
          isOpen={showTooltip && !isOpen} // Only show if modal is not open
          hasArrow
          bg="blue.100"
          color="blue.900"
          fontSize="sm"
          px={3}
          py={2}
          borderRadius="md"
          boxShadow="md"
        >
          <IconButton
            aria-label="Submit Feedback"
            icon={<FaLightbulb style={{ color: '#2B6CB0' }} />}
            bg="blue.100"
            colorScheme="blue"
            size="lg"
            isRound
            boxShadow="0 4px 12px rgba(0, 0, 0, 0.15)"
            onClick={onOpen}
            _hover={{
              transform: 'scale(1.1)',
              transition: 'transform 0.2s ease-in-out',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)',
              bg: 'blue.200'
            }}
            animation={`${pulse} 2s infinite ease-in-out`}
          />
        </Tooltip>
      </Box>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Share Your Feedback</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <FeedbackForm onClose={onClose} />
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default FloatingFeedbackButton; 