import React, { useRef } from 'react';
import {
  Box,
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  VStack,
  HStack,
  Text,
  Button,
  Icon,
  useColorModeValue,
  Badge,
} from '@chakra-ui/react';
import { FiUpload, FiFile, FiX, FiCheck, FiClock } from 'react-icons/fi';
import { motion } from 'framer-motion';

const MotionBox = motion.create(Box);

interface FileUploaderProps {
  files: File[];
  totalPages: number;
  isDragging: boolean;
  isCreating: boolean;
  creationComplete: boolean;
  isCalculatingDuration: boolean;
  estimatedDuration: number | null;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveFile: (index: number) => void;
  onCreateChatbot: () => void;
  formatDuration: (seconds: number) => string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
  files,
  totalPages,
  isDragging,
  isCreating,
  creationComplete,
  isCalculatingDuration,
  estimatedDuration,
  onDragOver,
  onDragLeave,
  onDrop,
  onFileChange,
  onRemoveFile,
  onCreateChatbot,
  formatDuration,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Color mode values
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const headingColor = useColorModeValue('gray.700', 'white');
  const textColor = useColorModeValue('gray.600', 'gray.300');
  const accentColor = useColorModeValue('#0c3b7d', '#0c3b7d');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');
  const fileItemBg = useColorModeValue('gray.50', 'gray.700');
  const durationBg = useColorModeValue('gray.50', 'gray.700');

  const handleRemoveFile = (index: number) => {
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset the file input
    }
    onRemoveFile(index);
  };

  return (
    <Card 
      bg={cardBg} 
      borderRadius="xl" 
      boxShadow="lg" 
      overflow="hidden"
      opacity={isCreating || creationComplete ? 0.6 : 1}
      transition="opacity 0.3s"
      pointerEvents={isCreating || creationComplete ? "none" : "auto"}
    >
      <CardHeader borderBottom="1px" borderColor={borderColor} py={4}>
        <VStack align="stretch" spacing={2}>
          <Text size="md" color={headingColor} fontWeight="bold">
            Upload Documents
          </Text>
          
          {(files.length > 20 || totalPages > 200) && (
            <Box
              p={3}
              bg="red.50"
              borderRadius="md"
              borderLeft="4px"
              borderColor="red.500"
            >
              <VStack align="stretch" spacing={1}>
                {files.length > 20 && (
                  <Text fontSize="sm" color="red.600">
                    Maximum 20 documents allowed. Please remove {files.length - 20} document(s).
                  </Text>
                )}
                {totalPages > 200 && (
                  <Text fontSize="sm" color="red.600">
                    Maximum 200 pages allowed. Current total: {totalPages} pages. Please remove some documents.
                  </Text>
                )}
              </VStack>
            </Box>
          )}
        </VStack>
      </CardHeader>
      
      <CardBody py={4}>
        <VStack spacing={4} align="stretch">
          <MotionBox
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Box
              border="2px dashed"
              borderColor={isDragging ? accentColor : borderColor}
              borderRadius="xl"
              p={6}
              textAlign="center"
              bg={isDragging ? `${accentColor}10` : 'transparent'}
              transition="all 0.2s"
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              cursor="pointer"
              onClick={() => fileInputRef.current?.click()}
              _hover={{ borderColor: accentColor }}
            >
              <VStack spacing={3}>
                <Icon as={FiUpload} w={6} h={6} color={accentColor} />
                <VStack spacing={1}>
                  <Text fontSize="md" fontWeight="medium" color={headingColor}>
                    Drag and drop your PDF files here
                  </Text>
                  <Text fontSize="sm" color={textColor}>
                    or click to browse files
                  </Text>
                </VStack>
                <Badge colorScheme="blue" variant="subtle" sx={{ backgroundColor: '#0c3b7d20' }}>
                  PDF files only
                </Badge>
              </VStack>
            </Box>
          </MotionBox>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={onFileChange}
            accept=".pdf"
            multiple
            style={{ display: 'none' }}
          />
          
          {files.length > 0 && (
            <VStack align="stretch" spacing={2} maxH="200px" overflowY="auto">
              <Text fontWeight="medium" color={headingColor} fontSize="sm">
                Selected Files
              </Text>
              {files.map((file, index) => (
                <MotionBox
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.1 }}
                >
                  <HStack
                    p={2}
                    bg={fileItemBg}
                    borderRadius="lg"
                    justify="space-between"
                    _hover={{ bg: hoverBg }}
                    transition="all 0.2s"
                  >
                    <HStack spacing={2}>
                      <Icon as={FiFile} color={accentColor} />
                      <VStack align="start" spacing={0}>
                        <Text fontSize="sm" fontWeight="medium" noOfLines={1}>
                          {file.name}
                        </Text>
                        <Text fontSize="xs" color="gray.500">
                          {Math.ceil(file.size / (1024 * 1024))} MB
                        </Text>
                      </VStack>
                    </HStack>
                    <Button
                      size="xs"
                      colorScheme="red"
                      variant="ghost"
                      onClick={() => handleRemoveFile(index)}
                      _hover={{ bg: 'red.50' }}
                    >
                      <Icon as={FiX} />
                    </Button>
                  </HStack>
                </MotionBox>
              ))}
            </VStack>
          )}
        </VStack>
      </CardBody>
      
      <CardFooter borderTop="1px" borderColor={borderColor} py={4}>
        <VStack width="full" spacing={3}>
          <Button
            colorScheme="blue"
            size="lg"
            width="full"
            onClick={onCreateChatbot}
            isLoading={isCreating}
            loadingText="Creating Chat Bot..."
            isDisabled={files.length === 0}
            leftIcon={files.length > 0 ? <FiCheck /> : undefined}
          >
            {files.length > 0 ? 'Create Chat Bot' : 'Upload Documents to Continue'}
          </Button>

          {isCalculatingDuration ? (
            <HStack spacing={2} justify="center">
              <Icon as={FiClock} color={accentColor} />
              <Text fontSize="sm" color={textColor}>Calculating duration...</Text>
            </HStack>
          ) : estimatedDuration !== null && (
            <MotionBox
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              width="full"
            >
              <HStack
                p={2}
                bg={durationBg}
                borderRadius="lg"
                spacing={2}
                justify="center"
              >
                <Icon as={FiClock} color={accentColor} />
                <Text fontSize="sm" color={textColor}>
                  Estimated creation duration: {formatDuration(estimatedDuration)}
                </Text>
              </HStack>
            </MotionBox>
          )}
        </VStack>
      </CardFooter>
    </Card>
  );
};

export default FileUploader; 