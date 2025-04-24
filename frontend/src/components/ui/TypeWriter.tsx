import { useState, useEffect, useCallback, memo } from 'react';
import '../../styles/TypeWriter.css';

interface TypeWriterProps {
  text: string;
  speed?: number;
  isVisible?: boolean;
  onComplete?: () => void;
}

const TypeWriter: React.FC<TypeWriterProps> = memo(({ 
  text, 
  speed = 30,
  isVisible = true,
  onComplete
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [error, setError] = useState<Error | null>(null);

  const typeNextChar = useCallback(() => {
    try {
      setDisplayedText(prev => {
        if (prev.length === text.length) {
          onComplete?.();
          return prev;
        }
        return text.slice(0, prev.length + 1);
      });
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to type character'));
    }
  }, [text, onComplete]);

  useEffect(() => {
    if (!isVisible) {
      setDisplayedText('');
      return;
    }

    setDisplayedText('');
    const interval = setInterval(typeNextChar, speed);
    return () => clearInterval(interval);
  }, [text, speed, isVisible, typeNextChar]);

  if (error) {
    return (
      <span className="typewriter error" role="alert">
        {error.message}
      </span>
    );
  }

  return (
    <span 
      className="typewriter"
      role="status"
      aria-live="polite"
      aria-label={text}
    >
      {displayedText}
      <span 
        className="typewriter-cursor"
        aria-hidden="true"
      />
    </span>
  );
});

TypeWriter.displayName = 'TypeWriter';

export default TypeWriter; 