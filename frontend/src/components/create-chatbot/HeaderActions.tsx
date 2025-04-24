import React from 'react';
import {
  HStack,
  Button,
} from '@chakra-ui/react';
import { FiArrowLeft, FiInfo } from 'react-icons/fi';

interface HeaderActionsProps {
  onBack: () => void;
  onOpenInfo: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ onBack, onOpenInfo }) => {
  return (
    <HStack justify="space-between" align="center">
      <Button
        leftIcon={<FiArrowLeft />}
        variant="ghost"
        onClick={onBack}
        _hover={{ bg: 'blue.50' }}
        size="sm"
        colorScheme="blue"
      >
        Back to Dashboard
      </Button>
      <Button
        leftIcon={<FiInfo />}
        variant="ghost"
        onClick={onOpenInfo}
        _hover={{ bg: 'blue.50' }}
        size="sm"
        colorScheme="blue"
      >
        Learn More
      </Button>
    </HStack>
  );
};

export default HeaderActions; 