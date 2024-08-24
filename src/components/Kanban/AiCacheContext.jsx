// AiCacheContext.js
import React, { createContext, useState, useEffect } from 'react';

export const AiCacheContext = createContext();

export const AiCacheProvider = ({ children }) => {
  const [aiCache, setAiCache] = useState({});

  useEffect(() => {
    // Load cache from localStorage on initial render
    const savedCache = localStorage.getItem('aiCache');
    if (savedCache) {
      setAiCache(JSON.parse(savedCache));
    }
  }, []);

  useEffect(() => {
    // Save cache to localStorage whenever it changes
    localStorage.setItem('aiCache', JSON.stringify(aiCache));
  }, [aiCache]);

  const updateCache = (key, value) => {
    setAiCache(prevCache => ({ ...prevCache, [key]: value }));
  };

  const clearCache = () => {
    setAiCache({});
    localStorage.removeItem('aiCache');
  };

  return (
    <AiCacheContext.Provider value={{ aiCache, updateCache, clearCache }}>
      {children}
    </AiCacheContext.Provider>
  );
};