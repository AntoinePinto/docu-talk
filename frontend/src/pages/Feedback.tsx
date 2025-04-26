import React from 'react';
import { Box, Container } from '@chakra-ui/react';
import FeedbackForm from '../components/FeedbackForm';

const Feedback: React.FC = () => {
  return (
    <Container maxW="container.xl" py={8}>
      <Box>
        <FeedbackForm />
      </Box>
    </Container>
  );
};

export default Feedback; 