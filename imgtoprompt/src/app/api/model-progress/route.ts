import { NextRequest } from 'next/server'

// Store for progress tracking across requests
const progressStore = new Map<string, {
  status: 'downloading' | 'loading' | 'ready' | 'error';
  progress: number;
  message: string;
  timestamp: number;
}>();

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const modelName = searchParams.get('model');
  
  if (!modelName) {
    return new Response('Model name required', { status: 400 });
  }

  // Set up Server-Sent Events
  const encoder = new TextEncoder();
  
  const customReadable = new ReadableStream({
    start(controller) {
      // Send initial status
      const initialProgress = progressStore.get(modelName) || {
        status: 'loading' as const,
        progress: 0,
        message: 'Připravuje se stahování...',
        timestamp: Date.now()
      };
      
      const data = `data: ${JSON.stringify(initialProgress)}\n\n`;
      controller.enqueue(encoder.encode(data));

      // Set up interval to check for updates
      const interval = setInterval(() => {
        const currentProgress = progressStore.get(modelName);
        
        if (currentProgress) {
          const data = `data: ${JSON.stringify(currentProgress)}\n\n`;
          controller.enqueue(encoder.encode(data));
          
          // Close connection when done
          if (currentProgress.status === 'ready' || currentProgress.status === 'error') {
            clearInterval(interval);
            setTimeout(() => {
              controller.close();
            }, 1000); // Give time for final update
          }
        }
      }, 500); // Update every 500ms

      // Cleanup on disconnect
      request.signal?.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    },
  });

  return new Response(customReadable, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    },
  });
}

// Helper functions to update progress from other parts of the app
export function updateProgress(modelName: string, progress: Partial<typeof progressStore extends Map<string, infer T> ? T : never>) {
  const current = progressStore.get(modelName) || {
    status: 'loading' as const,
    progress: 0,
    message: '',
    timestamp: Date.now()
  };
  
  progressStore.set(modelName, {
    ...current,
    ...progress,
    timestamp: Date.now()
  });
}

export function getProgress(modelName: string) {
  return progressStore.get(modelName);
}

export function clearProgress(modelName: string) {
  progressStore.delete(modelName);
}