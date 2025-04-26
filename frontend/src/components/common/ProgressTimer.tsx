import { Progress, Text, Flex } from '@chakra-ui/react';
import { useEffect, useState } from 'react';

interface ProgressTimerProps {
  duration: number;
  size?: 'sm' | 'md' | 'lg';
  width?: string | number;
  showText?: boolean;
  colorScheme?: string;
  isApiResponded?: boolean;
  useLogarithmic?: boolean;
  power?: number;
}

const ProgressTimer = ({ 
  duration, 
  size = 'sm', 
  width = '300px',
  showText = true,
  colorScheme = 'blue',
  isApiResponded = false,
  useLogarithmic = false,
  power = 0.5
}: ProgressTimerProps) => {
  const [progress, setProgress] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const progressInterval = setInterval(() => {
      const elapsedTime = (Date.now() - startTime) / 1000; // Convert to seconds
      
      // If API has responded, smoothly animate to 100%
      if (isApiResponded) {
        setProgress(prevProgress => {
          const step = 15;
          const newProgress = Math.min(prevProgress + step, 100);
          return newProgress;
        });
        return;
      }
      
      let newProgress;
      if (useLogarithmic) {
        // Logarithmic progress calculation
        newProgress = Math.min(
          Math.pow((Math.log(elapsedTime + 0.1) / Math.log(duration + 0.1)), power) * 100,
          100
        );
      } else {
        // Linear progress calculation
        newProgress = Math.min((elapsedTime / duration) * 100, 100);
      }
      
      setProgress(newProgress);
    }, 10);

    return () => clearInterval(progressInterval);
  }, [duration, startTime, isApiResponded, useLogarithmic, power]);

  return (
    <Flex direction="column" gap={2} width={width}>
      {showText && (
        <Text fontSize="xs" color="gray.500" whiteSpace="nowrap">
          Estimation response time: {duration} seconds
        </Text>
      )}
      <Progress 
        value={progress} 
        size={size}
        width="100%"
        colorScheme={colorScheme}
        borderRadius="full"
        hasStripe
        isAnimated
      />
    </Flex>
  );
};

export default ProgressTimer; 