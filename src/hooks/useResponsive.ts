import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    isMobile: false,
    isTablet: false,
    isDesktop: false,
    width: 0,
    height: 0
  });

  useEffect(() => {
    const updateScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024,
        width,
        height
      });
    };

    // Initial check
    updateScreenSize();

    // Add event listener
    window.addEventListener('resize', updateScreenSize);
    
    // Cleanup
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  return screenSize;
};