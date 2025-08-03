'use client';

import { useModelProgress } from '@/lib/useModelProgress';
import { X, Download, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ModelProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  modelName: string | null;
  modelDisplayName?: string;
}

export function ModelProgressModal({ 
  isOpen, 
  onClose, 
  modelName, 
  modelDisplayName 
}: ModelProgressModalProps) {
  const { progress, isConnected } = useModelProgress(modelName);

  if (!isOpen || !modelName || !progress) {
    return null;
  }

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'downloading':
        return <Download className="w-6 h-6 text-blue-500 animate-pulse" />;
      case 'loading':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />;
      case 'ready':
        return <CheckCircle className="w-6 h-6 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />;
      default:
        return <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />;
    }
  };

  const getStatusColor = () => {
    switch (progress.status) {
      case 'downloading':
      case 'loading':
        return 'bg-blue-500';
      case 'ready':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const shouldAutoClose = progress.status === 'ready' || progress.status === 'error';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Stahování Modelu
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Model Info */}
        <div className="mb-4">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Model: <span className="font-medium">{modelDisplayName || modelName}</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Připojení: {isConnected ? '✅ Připojeno' : '❌ Odpojeno'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center mb-2">
            {getStatusIcon()}
            <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
              {progress.progress}%
            </span>
          </div>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStatusColor()}`}
              style={{ width: `${progress.progress}%` }}
            />
          </div>
        </div>

        {/* Status Message */}
        <div className="mb-4">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {progress.message}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {new Date(progress.timestamp).toLocaleTimeString()}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {shouldAutoClose && (
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {progress.status === 'ready' ? 'Hotovo' : 'Zavřít'}
            </button>
          )}
        </div>

        {/* Additional Info */}
        {progress.status === 'downloading' && (
          <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              💡 Model se stahuje poprvé a uloží se do cache. Příště bude načtení okamžité.
            </p>
          </div>
        )}

        {progress.status === 'ready' && (
          <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 rounded">
            <p className="text-xs text-green-700 dark:text-green-300">
              ✅ Model je připraven! Můžete nyní pokračovat v analýze obrázků.
            </p>
          </div>
        )}

        {progress.status === 'error' && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 rounded">
            <p className="text-xs text-red-700 dark:text-red-300">
              ❌ Chyba při stahování. Zkontrolujte internetové připojení a zkuste to znovu.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}