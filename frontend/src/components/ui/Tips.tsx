import { useState, useEffect, useCallback, memo } from 'react';
import TypeWriter from './TypeWriter';
import { tips, Tip } from '../../data/tips';
import '../../styles/Tips.css';

interface TipsProps {
  interval?: number;
  animationDuration?: number;
}

const Tips: React.FC<TipsProps> = memo(({ 
  interval = 8000, 
  animationDuration = 500 
}) => {
  const [currentTip, setCurrentTip] = useState<Tip>(tips[0]);
  const [isVisible, setIsVisible] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const changeTip = useCallback(() => {
    try {
      setIsVisible(false);
      
      setTimeout(() => {
        const randomIndex = Math.floor(Math.random() * tips.length);
        setCurrentTip(tips[randomIndex]);
        setIsVisible(true);
      }, animationDuration);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to change tip'));
    }
  }, [animationDuration]);

  useEffect(() => {
    const tipInterval = setInterval(changeTip, interval);
    return () => clearInterval(tipInterval);
  }, [changeTip, interval]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (error) {
    return (
      <div className="tips-container error">
        <div className="tip-content">
          <div className="tip-title">⚠️ Error</div>
          <div className="tip-text">{error.message}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="tips-container">
      <div 
        className={`tip-content ${isVisible ? 'visible' : ''}`}
        role="alert"
        aria-live="polite"
      >
        <div className="tip-title">{currentTip.title}</div>
        <div className="tip-text">
          <TypeWriter 
            text={currentTip.content}
            speed={isMobile ? 30 : 40}
            isVisible={isVisible}
          />
        </div>
      </div>
    </div>
  );
});

Tips.displayName = 'Tips';

export default Tips; 