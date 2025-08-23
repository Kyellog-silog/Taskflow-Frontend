import { useEffect } from 'react';
import { authAPI } from '../services/api';
import logger from '../lib/logger';

export const useAuthInit = () => {
  useEffect(() => {
    const initializeCSRF = async () => {
      try {
        await authAPI.getCsrfCookie();
      } catch (error) {
        logger.error('CSRF initialization failed:', error);
      }
    };
    
    initializeCSRF();
  }, []);
};