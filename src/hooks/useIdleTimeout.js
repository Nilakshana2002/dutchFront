import { useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';

const useIdleTimeout = (timeoutMinutes = 15) => {
  const { logout, user } = useAuth();

  useEffect(() => {
    if (!user) return; 

    let timeoutId;
    
    const resetTimer = () => {
      clearTimeout(timeoutId);

      timeoutId = setTimeout(() => {
        logout();
      }, timeoutMinutes * 60 * 1000);
    };


    resetTimer();

    const events = [
      'mousemove',
      'keydown',
      'wheel',
      'DOMMouseScroll',
      'mouseWheel',
      'mousedown',
      'touchstart',
      'touchmove',
      'MSPointerDown',
      'MSPointerMove',
    ];

    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });

    return () => {
      clearTimeout(timeoutId);
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
    };
  }, [logout, user, timeoutMinutes]);
};

export default useIdleTimeout;
