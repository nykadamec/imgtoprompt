'use client';

import { useState, useEffect } from 'react';
import { Trash2, Download, HardDrive, RefreshCw } from 'lucide-react';

interface LocalModel {
  name: string;
  originalName: string;
  size: number;
  sizeFormatted: string;
  fileCount: number;
  lastModified: number;
  path: string;
}

interface LocalModelsData {
  models: LocalModel[];
  totalSize: number;
  totalSizeFormatted: string;
  modelsDirectory: string;
}

export function LocalModelsManager({ className = '' }: { className?: string }) {
  const [modelsData, setModelsData] = useState<LocalModelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchLocalModels = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/local-models');
      if (!response.ok) {
        throw new Error('Failed to fetch local models');
      }
      
      const data = await response.json();
      setModelsData(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching local models:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteModel = async (modelName: string) => {
    try {
      setDeleting(modelName);
      
      const response = await fetch(`/api/local-models?model=${encodeURIComponent(modelName)}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete model');
      }
      
      // Refresh the list
      await fetchLocalModels();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete model');
      console.error('Error deleting model:', err);
    } finally {
      setDeleting(null);
    }
  };

  useEffect(() => {
    fetchLocalModels();
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString('cs-CZ');
  };

  if (loading) {
    return (
      <div className={`${className} flex items-center justify-center p-8`}>
        <RefreshCw className="w-6 h-6 animate-spin mr-2" />
        <span>Načítá se seznam lokálních modelů...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`${className} p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg`}>
        <p className="text-red-600 dark:text-red-400 mb-2">Chyba při načítání modelů:</p>
        <p className="text-sm text-red-500 dark:text-red-300">{error}</p>
        <button
          onClick={fetchLocalModels}
          className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
        >
          Zkusit znovu
        </button>
      </div>
    );
  }

  return (
    <div className={`${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Lokální Modely
          </h3>
          {modelsData && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {modelsData.models.length} modelů • {modelsData.totalSizeFormatted}
            </p>
          )}
        </div>
        <button
          onClick={fetchLocalModels}
          className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          Obnovit
        </button>
      </div>

      {/* Models List */}
      {modelsData?.models.length === 0 ? (
        <div className="text-center py-8 text-gray-500 dark:text-gray-400">
          <HardDrive className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Žádné lokální modely nenalezeny</p>
          <p className="text-sm">Modely se automaticky stáhnou při prvním použití</p>
        </div>
      ) : (
        <div className="space-y-3">
          {modelsData?.models.map((model) => (
            <div
              key={model.originalName}
              className="p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    {model.name}
                  </h4>
                  <div className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                    <p>Velikost: <span className="font-mono">{model.sizeFormatted}</span></p>
                    <p>Souborů: {model.fileCount}</p>
                    <p>Staženo: {formatDate(model.lastModified)}</p>
                  </div>
                </div>
                
                <button
                  onClick={() => deleteModel(model.name)}
                  disabled={deleting === model.name}
                  className="ml-4 p-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50"
                  title="Smazat model"
                >
                  {deleting === model.name ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Storage Info */}
      {modelsData && modelsData.models.length > 0 && (
        <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex items-center">
            <HardDrive className="w-4 h-4 text-blue-600 dark:text-blue-400 mr-2" />
            <p className="text-sm text-blue-700 dark:text-blue-300">
              <strong>Ukládání:</strong> {modelsData.modelsDirectory}
            </p>
          </div>
          <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
            Modely se ukládají lokálně a znovu používají při příštích spuštěních
          </p>
        </div>
      )}
    </div>
  );
}