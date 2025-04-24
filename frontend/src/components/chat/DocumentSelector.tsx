import { 
  Flex, 
  Button, 
  Popover, 
  PopoverTrigger, 
  PopoverContent, 
  PopoverHeader, 
  PopoverBody, 
  PopoverFooter, 
  PopoverArrow, 
  PopoverCloseButton, 
  Portal, 
  VStack, 
  HStack, 
  Checkbox, 
  CheckboxGroup, 
  useColorModeValue,
  Text
} from '@chakra-ui/react';
import { FiFile, FiChevronDown } from 'react-icons/fi';

interface Document {
    id: string;
    filename: string;
}

interface DocumentSelectorProps {
  documents: Document[];
  selectedDocuments: string[];
  onSelect: (documents: string[]) => void;
}

const DocumentSelector = ({ documents, selectedDocuments, onSelect }: DocumentSelectorProps) => {
  return (
    <Flex align="center" justify="flex-start" mt={4}>
      <Popover placement="bottom-start">
        <PopoverTrigger>
          <Button 
            size="xs" 
            variant="ghost" 
            rightIcon={<FiChevronDown />}
            leftIcon={<FiFile />}
          >
            {selectedDocuments.length === documents.length 
              ? 'Available Documents' 
              : `${selectedDocuments.length} of ${documents.length} Documents`}
          </Button>
        </PopoverTrigger>
        <Portal>
          <PopoverContent width="300px">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader fontWeight="semibold">Select Documents</PopoverHeader>
            <PopoverBody>
              <VStack align="start" spacing={2} maxH="300px" overflowY="auto">
                <CheckboxGroup 
                  colorScheme="blue" 
                  value={selectedDocuments}
                  onChange={(values) => onSelect(values as string[])}
                >
                  <VStack align="start" spacing={2} width="100%">
                    {documents.map((doc) => (
                      <Checkbox 
                        key={doc.id} 
                        value={doc.id}
                        width="100%"
                        py={1}
                        px={2}
                        borderRadius="md"
                        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
                      >
                        <HStack spacing={2}>
                          <FiFile size="16px" />
                          <Text fontSize="sm" noOfLines={1}>{doc.filename}</Text>
                        </HStack>
                      </Checkbox>
                    ))}
                  </VStack>
                </CheckboxGroup>
              </VStack>
            </PopoverBody>
            <PopoverFooter borderTopWidth="1px">
              <HStack justify="space-between" width="100%">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onSelect(documents.map(doc => doc.id))}
                >
                  Select All
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => onSelect([])}
                >
                  Clear All
                </Button>
              </HStack>
            </PopoverFooter>
          </PopoverContent>
        </Portal>
      </Popover>
    </Flex>
  );
};

export default DocumentSelector; 