import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  VStack,
  Stack,
  useToast,
  useDisclosure,
  useBreakpointValue,
} from '@chakra-ui/react';
import { useAuth } from '../components/auth/AuthContext';
import { useUser } from '../components/auth/UserContext';
import axios from 'axios';
import FileUploader from '../components/create-chatbot/FileUploader';
import CreationProgress from '../components/create-chatbot/CreationProgress';
import InfoModal from '../components/create-chatbot/InfoModal';
import HeaderActions from '../components/create-chatbot/HeaderActions';
import CreditsToast from '../components/chat/CreditsToast';

// Constants
const MAX_FILES = 20;
const MAX_PAGES = 200;
const API_BASE_URL = `${import.meta.env.VITE_API_URL}/api`;
const MODEL_NAME = 'gemini-2.0-flash-001';

// Types
interface ChatbotCreationState {
  title: string | null;
  description: string | null;
  icon: string | null;
  suggestedPrompts: string[];
  chatbotId: string | null;
}

const CreateChatbot = () => {
  // Navigation and UI hooks
  const navigate = useNavigate();
  const toast = useToast();
  const { token } = useAuth();
  const { refreshUserData, remainingCredits } = useUser();
  const { isOpen, onOpen, onClose } = useDisclosure();

  // File management state
  const [files, setFiles] = useState<File[]>([]);
  const [totalPages, setTotalPages] = useState(0);
  const [isDragging, setIsDragging] = useState(false);

  // Duration calculation state
  const [estimatedDuration, setEstimatedDuration] = useState<number | null>(null);
  const [isCalculatingDuration, setIsCalculatingDuration] = useState(false);

  // Creation process state
  const [creationStep, setCreationStep] = useState(0);
  const [isCreating, setIsCreating] = useState(false);
  const [creationComplete, setCreationComplete] = useState(false);

  // Chatbot state
  const [chatbotState, setChatbotState] = useState<ChatbotCreationState>({
    title: null,
    description: null,
    icon: null,
    suggestedPrompts: [],
    chatbotId: null,
  });

  // Add responsive breakpoints
  const containerPadding = useBreakpointValue({ base: 4, md: 8 })
  const stackSpacing = useBreakpointValue({ base: 4, md: 6 })
  const containerWidth = useBreakpointValue({ base: '100%', md: 'container.xl' })
  const stackDirection = useBreakpointValue({ base: 'column', lg: 'row' }) as 'column' | 'row'

  // Fetch user data on component mount
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      await Promise.all([
        axios.get(`${API_BASE_URL}/auth/user`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        axios.post(`${API_BASE_URL}/auth/get_remaining_credits`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);
    } catch (error) {
      console.error('Error fetching user data:', error);
      showErrorToast('Failed to fetch user data');
    }
  };

  const showErrorToast = (description: string) => {
    toast({
      title: 'Error',
      description,
      status: 'error',
      duration: 5000,
      isClosable: true,
      position: 'top-right',
    });
  };

  const calculateEstimatedDuration = async (files: File[]) => {
    if (files.length === 0) return;

    setIsCalculatingDuration(true);
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('documents_files', file));
      formData.append('model', MODEL_NAME);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/create_chatbot/get_create_chatbot_estimations`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          }
        }
      );

      const actualTotalPages = response.data.total_pages;
      
      // Check if the total pages exceed the maximum limit
      if (actualTotalPages > MAX_PAGES) {
        showErrorToast('The total number of pages across all documents cannot exceed 200.');
        // Remove the last added file
        const newFiles = [...files];
        newFiles.pop();
        setFiles(newFiles);
        return;
      }
      
      setEstimatedDuration(response.data.estimated_duration);
      // Update the total pages with the actual count from the backend
      setTotalPages(actualTotalPages);
    } catch (error) {
      console.error('Error calculating duration:', error);
      showErrorToast('Failed to calculate estimated duration');
    } finally {
      setIsCalculatingDuration(false);
    }
  };

  const formatDuration = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds.toFixed(1)} seconds`;
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Number((seconds % 60).toFixed(1));
    return `${minutes} minute${minutes > 1 ? 's' : ''} ${remainingSeconds > 0 ? `and ${remainingSeconds.toFixed(1)} second${remainingSeconds > 1 ? 's' : ''}` : ''}`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      handleNewFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleNewFiles = (newFiles: File[]) => {
    if (files.length + newFiles.length > MAX_FILES) {
      showErrorToast('You can only upload a maximum of 20 documents per Chat Bot.');
      return;
    }
    
    const pdfFiles = newFiles.filter(file => file.type === 'application/pdf');
    
    if (pdfFiles.length !== newFiles.length) {
      showErrorToast('Only PDF files are allowed.');
    }
    
    const updatedFiles = [...files, ...pdfFiles];
    setFiles(updatedFiles);
    
    calculateEstimatedDuration(updatedFiles);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleNewFiles(Array.from(e.target.files));
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
    
    calculateEstimatedDuration(newFiles);
  };

  const showCreditsToast = (credits: number) => {
    toast({
      position: 'top-right',
      duration: 3000,
      isClosable: true,
      render: () => <CreditsToast credits={credits} />,
    });
  };

  const refreshCredits = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/get_remaining_credits`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) throw new Error('Failed to fetch credits');

      await refreshUserData();
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  };

  const handleCreateChatbot = async () => {
    if (files.length === 0) {
      showErrorToast('Please upload at least one document to create a Chat Bot.');
      return;
    }

    if (remainingCredits === null || remainingCredits <= 0) {
      showErrorToast('You do not have enough credits to create a Chat Bot. Please wait for your credits to refresh.');
      return;
    }

    // Check if the total pages exceed the maximum limit
    if (totalPages > MAX_PAGES) {
      showErrorToast('The total number of pages across all documents cannot exceed 200.');
      return;
    }

    setIsCreating(true);
    setCreationStep(0);
    setChatbotState({
      title: null,
      description: null,
      icon: null,
      suggestedPrompts: [],
      chatbotId: null,
    });
    setCreationComplete(false);
    
    try {
      const formData = new FormData();
      files.forEach(file => formData.append('documents_files', file));
      formData.append('model', MODEL_NAME);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/create_chatbot/create_chatbot`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (!response.ok) {
        throw new Error('Failed to create chatbot');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        
        let startIndex = 0;
        let endIndex;
        
        while ((endIndex = buffer.indexOf('}', startIndex)) !== -1) {
          try {
            const jsonStr = buffer.substring(startIndex, endIndex + 1);
            const data = JSON.parse(jsonStr);
            
            if (data.title && data.description) {
              setChatbotState(prev => ({ ...prev, title: data.title, description: data.description }));
              setCreationStep(1);
            } else if (data.icon) {
              setChatbotState(prev => ({ ...prev, icon: data.icon }));
              setCreationStep(2);
            } else if (data.suggested_prompts) {
              setChatbotState(prev => ({ ...prev, suggestedPrompts: data.suggested_prompts }));
              setCreationStep(3);
            } else if (data.chatbot_id) {
              setChatbotState(prev => ({ ...prev, chatbotId: data.chatbot_id }));
              setCreationStep(4);
              setCreationComplete(true);
              
              // Update user data to include the new chatbot
              try {
                await refreshUserData();
              } catch (error) {
                console.error('Error updating user data:', error);
                showErrorToast('Failed to update user data');
              } finally {
                // Stop the loading state after everything is complete
                setIsCreating(false);
              }
            }
            
            startIndex = endIndex + 1;
          } catch (e) {
            startIndex++;
          }
        }

        // Check for credits events in the buffer
        const creditsEventIndex = buffer.indexOf('event: credits');
        if (creditsEventIndex !== -1) {
          try {
            const lines = buffer.substring(creditsEventIndex).split('\n');
            const dataLine = lines.find(line => line.startsWith('data: '));
            if (dataLine) {
              const creditsData = JSON.parse(dataLine.replace('data: ', ''));
              showCreditsToast(creditsData.consumed_credits);
              await refreshCredits();
            }
          } catch (e) {
            console.error('Error parsing credits data:', e);
          }
        }
        
        buffer = buffer.substring(startIndex);
      }
    } catch (error) {
      console.error('Error creating chatbot:', error);
      showErrorToast('Failed to create chatbot. Please try again.');
      setIsCreating(false);
    }
  };

  const handleNavigateToChat = (chatbotId: string) => {
    navigate(`/chat/${chatbotId}`);
  };

  return (
    <Box>
      <Container 
        maxW={containerWidth} 
        py={containerPadding}
        px={useBreakpointValue({ base: 3, md: 6 })}
      >
        <VStack spacing={stackSpacing} align="stretch">
          <HeaderActions onBack={() => navigate('/dashboard')} onOpenInfo={onOpen} />
          
          <Stack 
            direction={stackDirection}
            align={stackDirection === 'column' ? 'stretch' : 'start'}
            spacing={stackSpacing}
            w="100%"
          >
            <Box 
              flex="1" 
              position="relative"
              w={stackDirection === 'column' ? '100%' : undefined}
              minW={0}
            >
              <FileUploader
                files={files}
                totalPages={totalPages}
                isDragging={isDragging}
                isCreating={isCreating}
                creationComplete={creationComplete}
                isCalculatingDuration={isCalculatingDuration}
                estimatedDuration={estimatedDuration}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onFileChange={handleFileChange}
                onRemoveFile={removeFile}
                onCreateChatbot={handleCreateChatbot}
                formatDuration={formatDuration}
              />
            </Box>

            <Box 
              flex="1"
              w={stackDirection === 'column' ? '100%' : undefined}
              minW={0}
            >
              <CreationProgress
                isCreating={isCreating}
                creationComplete={creationComplete}
                creationStep={creationStep}
                aiTitle={chatbotState.title}
                aiDescription={chatbotState.description}
                aiIcon={chatbotState.icon}
                suggestedPrompts={chatbotState.suggestedPrompts}
                chatbotId={chatbotState.chatbotId}
                onNavigateToChat={handleNavigateToChat}
                estimatedDuration={estimatedDuration}
                isCalculatingDuration={isCalculatingDuration}
                formatDuration={formatDuration}
              />
            </Box>
          </Stack>
        </VStack>
      </Container>

      <InfoModal isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default CreateChatbot; 