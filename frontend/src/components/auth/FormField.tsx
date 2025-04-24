import { FormControl, FormLabel, Input, InputGroup, InputLeftElement, InputRightElement, IconButton, Text } from '@chakra-ui/react';
import { ReactNode } from 'react';
import { FiEye, FiEyeOff } from 'react-icons/fi';

interface FormFieldProps {
  field: string;
  label: string;
  type: string;
  value: string;
  error?: string;
  icon: ReactNode;
  showPassword?: boolean;
  onTogglePassword?: () => void;
  onChange: (value: string) => void;
}

const FormField = ({
  field,
  label,
  type,
  value,
  error,
  icon,
  showPassword,
  onTogglePassword,
  onChange,
}: FormFieldProps) => {
  const getPlaceholder = () => {
    switch (field) {
      case 'email':
        return 'your.email@example.com';
      case 'password':
        return '••••••••';
      case 'firstName':
        return 'John';
      case 'lastName':
        return 'Doe';
      default:
        return '';
    }
  };

  return (
    <FormControl isRequired isInvalid={!!error}>
      <FormLabel>{label}</FormLabel>
      <InputGroup>
        <InputLeftElement pl={3}>
          {icon}
        </InputLeftElement>
        <Input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={getPlaceholder()}
          size="md"
          pl={10}
          _focus={{ borderColor: 'blue.400', boxShadow: '0 0 0 1px blue.400' }}
        />
        {field === 'password' && onTogglePassword && (
          <InputRightElement h="full">
            <IconButton
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              icon={showPassword ? <FiEyeOff /> : <FiEye />}
              variant="ghost"
              onClick={onTogglePassword}
              size="sm"
            />
          </InputRightElement>
        )}
      </InputGroup>
      {error && (
        <Text color="red.500" fontSize="xs" mt={1}>
          {error}
        </Text>
      )}
    </FormControl>
  );
};

export default FormField; 