import { NextRequest, NextResponse } from 'next/server'
import { updateProgress } from '../model-progress/route'

// Import the same functions from generate-prompt route
let pipeline: any = null;
try {
  const transformers = require('@huggingface/transformers');
  pipeline = transformers.pipeline;
} catch (error) {
  console.warn('Transformers.js not available');
}

// Cache for local pipelines - shared with main route
const localPipelineCache = new Map<string, any>();

// Same model mapping as in generate-prompt
const modelMapping: { [key: string]: { localModel?: string; description: string } } = {
  "vit": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "ViT-GPT2 ONNX optimized (nejrychlejší lokální model)"
  },
  "blip": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "BLIP image captioning (ONNX support)"
  },
  "blip-large": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "BLIP Large model (high quality, ONNX optimized)"
  },
  "blip-longcap": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "BLIP Long Caption (detailní popisy, ONNX support)"
  },
  "git-base": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "Microsoft GIT model (vysoká kvalita, ONNX optimized)"
  },
  "flux1": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "Flux1-optimized prompts (ONNX rychlost)"
  },
  "midjourney": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "Midjourney-style prompts (ONNX rychlost)"
  },
  "dalle3": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "DALL-E 3 style prompts (ONNX rychlost)"
  },
  "stable-diffusion": {
    localModel: "Xenova/vit-gpt2-image-captioning",
    description: "Stable Diffusion prompts (ONNX rychlost)"
  },
};

async function preloadModel(modelName: string) {
  if (!pipeline) {
    throw new Error('Transformers.js not available');
  }

  if (localPipelineCache.has(modelName)) {
    return { alreadyLoaded: true };
  }

  console.log(`Preloading model: ${modelName}`);
  
  updateProgress(modelName, {
    status: 'downloading',
    progress: 0,
    message: 'Začíná pre-loading modelu...'
  });

  const pipe = await pipeline('image-to-text', modelName, {
    quantized: true,
    progress_callback: (data: any) => {
      if (data.status === 'downloading') {
        const progressPercent = Math.round((data.loaded / data.total) * 100);
        updateProgress(modelName, {
          status: 'downloading',
          progress: progressPercent,
          message: `Stahuje se ${data.file || 'model'}: ${progressPercent}%`
        });
      } else if (data.status === 'loading') {
        updateProgress(modelName, {
          status: 'loading',
          progress: 90,
          message: 'Načítání modelu do paměti...'
        });
      }
    }
  });
  
  localPipelineCache.set(modelName, pipe);
  
  updateProgress(modelName, {
    status: 'ready',
    progress: 100,
    message: 'Model úspěšně předem načten'
  });

  return { success: true };
}

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json();
    
    if (!model) {
      return NextResponse.json(
        { error: 'Model parameter is required' },
        { status: 400 }
      );
    }

    const modelConfig = modelMapping[model];
    if (!modelConfig || !modelConfig.localModel) {
      return NextResponse.json(
        { error: `Model '${model}' does not support local preloading` },
        { status: 400 }
      );
    }

    const result = await preloadModel(modelConfig.localModel);
    
    return NextResponse.json({
      success: true,
      message: result.alreadyLoaded 
        ? 'Model was already loaded' 
        : 'Model preloaded successfully',
      model: model,
      localModel: modelConfig.localModel,
      alreadyLoaded: result.alreadyLoaded || false
    });

  } catch (error) {
    console.error('Error preloading model:', error);
    
    return NextResponse.json(
      { 
        error: 'Failed to preload model',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check preload status
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const model = searchParams.get('model');
  
  if (!model) {
    // Return all loaded models
    return NextResponse.json({
      success: true,
      loadedModels: Array.from(localPipelineCache.keys()),
      cacheSize: localPipelineCache.size
    });
  }

  const modelConfig = modelMapping[model];
  if (!modelConfig || !modelConfig.localModel) {
    return NextResponse.json(
      { error: `Model '${model}' does not support local loading` },
      { status: 400 }
    );
  }

  const isLoaded = localPipelineCache.has(modelConfig.localModel);
  
  return NextResponse.json({
    success: true,
    model: model,
    localModel: modelConfig.localModel,
    isLoaded: isLoaded,
    description: modelConfig.description
  });
}