'use client';

import { useState } from 'react';
import { useModelPreloader } from '@/lib/useModelProgress';
import { ModelProgressModal } from './ModelProgressModal';
import { Download, CheckCircle, Loader2 } from 'lucide-react';
import { LocalModelsManager } from './LocalModelsManager';

interface ModelPreloaderProps {
  modelKey: string;
  modelName: string;
  description: string;
  className?: string;
}

export function ModelPreloader({ 
  modelKey, 
  modelName, 
  description,
  className = '' 
}: ModelPreloaderProps) {
  const { preloadModel, isPreloading, preloadError } = useModelPreloader();
  const [showProgress, setShowProgress] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const handlePreload = async () => {
    try {
      setShowProgress(true);
      const result = await preloadModel(modelKey);
      
      if (result.success) {
        setIsLoaded(true);
        // Auto-hide progress modal after successful load
        setTimeout(() => {
          setShowProgress(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Preload failed:', error);
      // Keep modal open on error so user can see the error message
    }
  };

  const getButtonContent = () => {
    if (isPreloading) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Stahuje se...</span>
        </>
      );
    }
    
    if (isLoaded) {
      return (
        <>
          <CheckCircle className="w-4 h-4 text-green-500" />
          <span>Načteno</span>
        </>
      );
    }
    
    return (
      <>
        <Download className="w-4 h-4" />
        <span>Předem stáhnout</span>
      </>
    );
  };

  const getButtonStyle = () => {
    if (isLoaded) {
      return 'bg-green-100 text-green-700 border-green-200 cursor-default';
    }
    
    if (isPreloading) {
      return 'bg-blue-100 text-blue-700 border-blue-200 cursor-not-allowed';
    }
    
    return 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200 cursor-pointer';
  };

  return (
    <>
      <div className={`${className}`}>
        {/* Model Info */}
        <div className="mb-2">
          <h4 className="font-medium text-gray-900 dark:text-white">
            {modelName}
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {description}
          </p>
        </div>

        {/* Preload Button */}
        <button
          onClick={handlePreload}
          disabled={isPreloading || isLoaded}
          className={`
            flex items-center space-x-2 px-3 py-2 rounded border text-sm transition-colors
            ${getButtonStyle()}
          `}
        >
          {getButtonContent()}
        </button>

        {/* Error Message */}
        {preloadError && (
          <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
            <p className="text-xs text-red-600 dark:text-red-400">
              Chyba: {preloadError}
            </p>
          </div>
        )}
      </div>

      {/* Progress Modal */}
      <ModelProgressModal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        modelName={showProgress ? modelKey : null}
        modelDisplayName={modelName}
      />
    </>
  );
}

// Component for showing all available models for preloading
export function ModelPreloaderList({ className = '' }: { className?: string }) {
  const models = [
    {
      key: 'vit',
      name: 'ViT-GPT2 ONNX',
      description: 'Nejrychlejší lokální model s ONNX optimalizací'
    },
    {
      key: 'blip',
      name: 'BLIP ONNX',
      description: 'BLIP model s ONNX podporou pro rychlost'
    },
    {
      key: 'blip-large',
      name: 'BLIP Large ONNX',
      description: 'Velký BLIP model pro vysokou kvalitu'
    },
    {
      key: 'blip-longcap',
      name: 'BLIP Long Caption',
      description: 'Specializovaný pro dlouhé detailní popisy'
    },
    {
      key: 'git-base',
      name: 'Microsoft GIT',
      description: 'Microsoft GIT model pro vysokou kvalitu'
    },
    {
      key: 'flux1',
      name: 'Flux1 ONNX',
      description: 'Optimalizováno pro Flux1 s ONNX rychlostí'
    },
    {
      key: 'midjourney',
      name: 'Midjourney ONNX',
      description: 'Optimalizováno pro Midjourney s ONNX'
    },
    {
      key: 'dalle3',
      name: 'DALL-E 3 ONNX',
      description: 'Optimalizováno pro DALL-E 3 s ONNX'
    },
    {
      key: 'stable-diffusion',
      name: 'Stable Diffusion ONNX',
      description: 'Optimalizováno pro Stable Diffusion s ONNX'
    }
  ];

  return (
    <div className={`${className} space-y-6`}>
      {/* Model Preloader Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
          Stáhnout nové modely
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
          Stáhněte modely předem pro rychlejší zpracování. Modely se uloží do složky <code>models/</code>.
        </p>
        
        <div className="space-y-4">
          {models.map((model) => (
            <ModelPreloader
              key={model.key}
              modelKey={model.key}
              modelName={model.name}
              description={model.description}
              className="p-4 border rounded-lg bg-white dark:bg-gray-800"
            />
          ))}
        </div>
      </div>

      {/* Local Models Manager Section */}
      <div className="border-t pt-6">
        <LocalModelsManager />
      </div>
    </div>
  );
}