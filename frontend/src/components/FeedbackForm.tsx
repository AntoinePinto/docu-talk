import React, { useState } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  VStack,
  useToast,
} from '@chakra-ui/react';
import axios from 'axios';

interface FeedbackFormData {
  type: 'bug' | 'feature';
  title: string;
  description: string;
}

interface FeedbackFormProps {
  onClose?: () => void;
}

const FeedbackForm: React.FC<FeedbackFormProps> = ({ onClose }) => {
  const [formData, setFormData] = useState<FeedbackFormData>({
    type: 'feature',
    title: '',
    description: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toast = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('token');
      const formDataToSend = new FormData();
      formDataToSend.append('type', formData.type);
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/submit_feedback`,
        formDataToSend,
        {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      toast({
        title: 'Feedback Submitted',
        description: 'Thank you for your feedback!',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });

      // Reset form
      setFormData({
        type: 'feature',
        title: '',
        description: '',
      });

      // Close the modal if onClose is provided
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit feedback. Please try again.',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <Box>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <FormControl isRequired>
            <FormLabel>Type</FormLabel>
            <Select
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="bug">Bug Report</option>
              <option value="feature">Feature Request</option>
            </Select>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Title</FormLabel>
            <Input
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Brief summary of your feedback"
            />
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Description</FormLabel>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Please provide detailed information about your feedback"
              rows={8}
              resize="vertical"
            />
          </FormControl>

          <Button
            type="submit"
            colorScheme="blue"
            size="lg"
            mt={4}
            isLoading={isSubmitting}
            loadingText="Submitting..."
          >
            Submit Feedback
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default FeedbackForm; 