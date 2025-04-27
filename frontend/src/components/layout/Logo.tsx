import React from 'react';
import { Image } from '@chakra-ui/react';
import logo from '../../../public/logo.svg';

const Logo: React.FC = () => {
  return (
    <Image 
      src={logo} 
      alt="Docu Talk Logo" 
      height="2rem"
      position="absolute"
      left="50%"
      transform="translateX(-50%)"
    />
  );
};

export default Logo; 