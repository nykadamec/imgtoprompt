import { useState, useEffect, useCallback } from 'react';

interface ModelProgress {
  status: 'downloading' | 'loading' | 'ready' | 'error';
  progress: number;
  message: string;
  timestamp: number;
}

export function useModelProgress(modelName: string | null) {
  const [progress, setProgress] = useState<ModelProgress | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const startTracking = useCallback((model: string) => {
    if (!model) return;

    console.log(`Starting progress tracking for model: ${model}`);
    
    const eventSource = new EventSource(`/api/model-progress?model=${encodeURIComponent(model)}`);
    
    eventSource.onopen = () => {
      console.log(`SSE connection opened for ${model}`);
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data) as ModelProgress;
        console.log(`Progress update for ${model}:`, data);
        setProgress(data);
      } catch (error) {
        console.error('Error parsing SSE data:', error);
      }
    };

    eventSource.onerror = (error) => {
      console.error(`SSE error for ${model}:`, error);
      setIsConnected(false);
      eventSource.close();
    };

    return eventSource;
  }, []);

  useEffect(() => {
    if (!modelName) {
      setProgress(null);
      setIsConnected(false);
      return;
    }

    const eventSource = startTracking(modelName);
    
    return () => {
      if (eventSource) {
        console.log(`Closing SSE connection for ${modelName}`);
        eventSource.close();
        setIsConnected(false);
      }
    };
  }, [modelName, startTracking]);

  return {
    progress,
    isConnected,
    startTracking
  };
}

// Hook for preloading models
export function useModelPreloader() {
  const [isPreloading, setIsPreloading] = useState(false);
  const [preloadError, setPreloadError] = useState<string | null>(null);

  const preloadModel = useCallback(async (model: string) => {
    setIsPreloading(true);
    setPreloadError(null);

    try {
      const response = await fetch('/api/preload-model', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ model }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to preload model');
      }

      const result = await response.json();
      console.log('Preload result:', result);
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setPreloadError(errorMessage);
      console.error('Preload error:', error);
      throw error;
    } finally {
      setIsPreloading(false);
    }
  }, []);

  const checkModelStatus = useCallback(async (model: string) => {
    try {
      const response = await fetch(`/api/preload-model?model=${encodeURIComponent(model)}`);
      if (!response.ok) {
        throw new Error('Failed to check model status');
      }
      return await response.json();
    } catch (error) {
      console.error('Error checking model status:', error);
      return null;
    }
  }, []);

  return {
    preloadModel,
    checkModelStatus,
    isPreloading,
    preloadError
  };
}