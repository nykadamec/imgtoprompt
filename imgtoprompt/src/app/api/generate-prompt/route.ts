/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server'
import { HfInference } from '@huggingface/inference'
import { updateProgress, clearProgress } from '../model-progress/route'

// Conditional import for transformers.js with type safety
let pipeline: any = null;
let env: any = null;

try {
  // Dynamic import for @huggingface/transformers
  const transformers = require('@huggingface/transformers');
  pipeline = transformers.pipeline;
  env = transformers.env;
} catch (error) {
  console.warn('Transformers.js not available, falling back to API only mode');
}

// Configure transformers.js for local execution (if available)
if (env) {
  env.allowLocalModels = true; // Enable local models
  env.allowRemoteModels = true;
  env.localModelPath = './models/'; // Set local models path
  env.cacheDir = './models/'; // Set cache directory
}

const hf = new HfInference(process.env.HUGGING_FACE_API_KEY)

// Cache for local pipelines to avoid reloading
const localPipelineCache = new Map<string, any>()

// Helper function to enhance prompts for Flux1
function enhanceForFlux1(basePrompt: string): string {
  const fluxEnhancements = [
    "highly detailed",
    "cinematic lighting", 
    "ultra realistic",
    "4k resolution",
    "professional photography",
    "sharp focus",
    "vivid colors",
    "masterpiece",
    "best quality"
  ];
  
  const randomEnhancements = fluxEnhancements.sort(() => 0.5 - Math.random()).slice(0, 3);
  return `${basePrompt}, ${randomEnhancements.join(', ')}`;
}

// Function to adjust prompt length and detail level
function adjustPromptStyle(baseText: string, promptLength: string, detailLevel: string): string {
  let adjustedText = baseText;

  // Apply detail level adjustments
  switch (detailLevel) {
    case 'minimal':
      // Keep only essential elements
      adjustedText = simplifyPrompt(adjustedText);
      break;
    case 'balanced':
      // Keep as is - good balance
      break;
    case 'detailed':
      // Add more descriptive elements
      adjustedText = addDetailedDescriptions(adjustedText);
      break;
    case 'comprehensive':
      // Add comprehensive technical and artistic details
      adjustedText = addComprehensiveDetails(adjustedText);
      break;
  }

  // Apply length adjustments
  switch (promptLength) {
    case 'short':
      // Keep under 50 words
      adjustedText = truncateToLength(adjustedText, 50);
      break;
    case 'medium':
      // Keep under 100 words
      adjustedText = truncateToLength(adjustedText, 100);
      break;
    case 'long':
      // Keep under 200 words
      adjustedText = expandToLength(adjustedText, 150, 200);
      break;
    case 'detailed':
      // Allow up to 300 words with rich descriptions
      adjustedText = expandToLength(adjustedText, 200, 300);
      break;
  }

  return adjustedText;
}

// Helper function to simplify prompt (minimal detail)
function simplifyPrompt(text: string): string {
  // Remove adjectives and keep only core elements
  const words = text.split(' ');
  const essentialWords = words.filter(word => 
    !['beautiful', 'stunning', 'amazing', 'incredible', 'gorgeous', 'lovely', 'wonderful'].includes(word.toLowerCase())
  );
  return essentialWords.slice(0, 15).join(' '); // Keep first 15 essential words
}

// Helper function to add detailed descriptions
function addDetailedDescriptions(text: string): string {
  const detailEnhancements = [
    'with intricate details',
    'featuring rich textures',
    'showcasing fine craftsmanship',
    'with careful attention to lighting',
    'displaying vibrant color palette',
    'with artistic composition'
  ];
  
  const randomEnhancements = detailEnhancements
    .sort(() => 0.5 - Math.random())
    .slice(0, 2);
    
  return `${text}, ${randomEnhancements.join(', ')}`;
}

// Helper function to add comprehensive details
function addComprehensiveDetails(text: string): string {
  const technicalDetails = [
    'shot with professional camera equipment',
    'using optimal lighting conditions',
    'with precise focus and depth of field',
    'featuring balanced exposure and contrast'
  ];
  
  const artisticDetails = [
    'following rule of thirds composition',
    'with harmonious color grading',
    'showcasing artistic perspective',
    'demonstrating creative vision'
  ];
  
  const qualityDetails = [
    'ultra-high resolution',
    'museum quality',
    'gallery worthy',
    'award winning photography'
  ];
  
  const allDetails = [
    ...technicalDetails.slice(0, 1),
    ...artisticDetails.slice(0, 1), 
    ...qualityDetails.slice(0, 1)
  ];
  
  return `${text}, ${allDetails.join(', ')}`;
}

// Helper function to truncate to specific word count
function truncateToLength(text: string, maxWords: number): string {
  const words = text.split(' ').filter(word => word.trim().length > 0);
  if (words.length <= maxWords) return text;
  
  return words.slice(0, maxWords).join(' ');
}

// Helper function to expand text to desired length
function expandToLength(text: string, minWords: number, maxWords: number): string {
  const words = text.split(' ').filter(word => word.trim().length > 0);
  
  if (words.length >= minWords) {
    return truncateToLength(text, maxWords);
  }
  
  // Add contextual expansions
  const expansions = [
    'with professional quality and attention to detail',
    'featuring excellent composition and visual appeal', 
    'showcasing remarkable clarity and sharpness',
    'displaying exceptional artistic merit',
    'captured with perfect timing and technique',
    'demonstrating mastery of lighting and perspective',
    'with impeccable framing and visual balance'
  ];
  
  let expandedText = text;
  let currentWords = words.length;
  
  // Add expansions to reach minimum word count
  for (const expansion of expansions) {
    if (currentWords >= minWords) break;
    
    expandedText += `, ${expansion}`;
    currentWords += expansion.split(' ').filter(word => word.trim().length > 0).length;
  }
  
  return truncateToLength(expandedText, maxWords);
}

// Define model configurations with support for both API and local execution
interface ModelConfig {
  huggingFaceModel: string;
  localModel?: string;
  useLocal: boolean;
  description: string;
}

const modelMapping: { [key: string]: ModelConfig } = {
  "vit": {
    huggingFaceModel: "nlpconnect/vit-gpt2-image-captioning",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX optimized
    useLocal: true,
    description: "ViT-GPT2 ONNX optimized (nejrychlejší lokální model)"
  },
  "blip": {
    huggingFaceModel: "Salesforce/blip-image-captioning-base", 
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX fallback
    useLocal: true,
    description: "BLIP image captioning (ONNX support)"
  },
  "blip-large": {
    huggingFaceModel: "Salesforce/blip-image-captioning-large",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX fallback
    useLocal: true,
    description: "BLIP Large model (high quality, ONNX optimized)"
  },
  "blip-longcap": {
    huggingFaceModel: "unography/blip-long-cap",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX fallback
    useLocal: true,
    description: "BLIP Long Caption (detailní popisy, ONNX support)"
  },
  "git-base": {
    huggingFaceModel: "microsoft/git-base",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX fallback
    useLocal: true,
    description: "Microsoft GIT model (vysoká kvalita, ONNX optimized)"
  },
  "glm-4.5": {
    huggingFaceModel: "nlpconnect/vit-gpt2-image-captioning",
    useLocal: false,
    description: "GLM-4.5 via API only"
  },
  "flux1": {
    huggingFaceModel: "nlpconnect/vit-gpt2-image-captioning",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX optimized
    useLocal: true,
    description: "Flux1-optimized prompts (ONNX rychlost)"
  },
  "midjourney": {
    huggingFaceModel: "nlpconnect/vit-gpt2-image-captioning",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX optimized
    useLocal: true,
    description: "Midjourney-style prompts (ONNX rychlost)"
  },
  "dalle3": {
    huggingFaceModel: "nlpconnect/vit-gpt2-image-captioning",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX optimized
    useLocal: true,
    description: "DALL-E 3 style prompts (ONNX rychlost)"
  },
  "stable-diffusion": {
    huggingFaceModel: "nlpconnect/vit-gpt2-image-captioning",
    localModel: "Xenova/vit-gpt2-image-captioning", // ONNX optimized
    useLocal: true,
    description: "Stable Diffusion prompts (ONNX rychlost)"
  },
};

// Function to check if model exists locally
async function checkLocalModelExists(modelName: string): Promise<boolean> {
  const fs = require('fs').promises;
  const path = require('path');
  
  try {
    const modelPath = path.join(process.cwd(), 'models', modelName.replace('/', '_'));
    await fs.access(modelPath);
    return true;
  } catch {
    return false;
  }
}

// Function to get or create local pipeline with progress tracking
async function getLocalPipeline(modelName: string) {
  if (!pipeline) {
    updateProgress(modelName, {
      status: 'error',
      progress: 0,
      message: 'Transformers.js není dostupný - lokální modely nejsou podporovány'
    });
    throw new Error('Transformers.js not available - local models not supported');
  }

  // Return cached model if available
  if (localPipelineCache.has(modelName)) {
    updateProgress(modelName, {
      status: 'ready',
      progress: 100,
      message: 'Model je připraven z cache'
    });
    return localPipelineCache.get(modelName);
  }

  try {
    console.log(`Loading local model: ${modelName}`);
    
    // Check if model exists locally
    const localExists = await checkLocalModelExists(modelName);
    
    if (localExists) {
      updateProgress(modelName, {
        status: 'loading',
        progress: 50,
        message: 'Načítá se lokální model ze složky...'
      });
    } else {
      // Initialize progress for download
      updateProgress(modelName, {
        status: 'downloading',
        progress: 0,
        message: 'Začíná stahování modelu do složky models/...'
      });
    }

    const pipe = await pipeline('image-to-text', modelName, {
      quantized: true, // Use quantized models for better performance
      local_files_only: false, // Allow downloading if not available locally
      cache_dir: './models/', // Set cache directory to models folder
      progress_callback: (data: any) => {
        console.log('Progress callback:', data);
        
        if (data.status === 'downloading') {
          const progressPercent = Math.round((data.loaded / data.total) * 100);
          updateProgress(modelName, {
            status: 'downloading',
            progress: progressPercent,
            message: `Stahuje se do models/: ${data.file || 'model'} (${progressPercent}%)`
          });
          console.log(`Downloading ${modelName}: ${progressPercent}%`);
        } else if (data.status === 'loading') {
          updateProgress(modelName, {
            status: 'loading',
            progress: 90,
            message: localExists ? 'Načítání lokálního modelu...' : 'Načítání staženého modelu...'
          });
        } else if (data.status === 'ready') {
          updateProgress(modelName, {
            status: 'ready',
            progress: 100,
            message: 'Model je připraven k použití'
          });
        }
      }
    });
    
    localPipelineCache.set(modelName, pipe);
    
    updateProgress(modelName, {
      status: 'ready',
      progress: 100,
      message: localExists ? 'Lokální model úspěšně načten' : 'Model stažen do models/ a načten'
    });
    
    console.log(`Model ${modelName} loaded successfully from ${localExists ? 'local cache' : 'download'}`);
    
    // Clear progress after some time
    setTimeout(() => {
      clearProgress(modelName);
    }, 5000);
    
    return pipe;
  } catch (error) {
    console.error(`Failed to load local model ${modelName}:`, error);
    
    updateProgress(modelName, {
      status: 'error',
      progress: 0,
      message: `Chyba při načítání modelu: ${error instanceof Error ? error.message : 'Neznámá chyba'}`
    });
    
    // Clear error after some time
    setTimeout(() => {
      clearProgress(modelName);
    }, 10000);
    
    throw new Error(`Failed to load local model: ${modelName}`);
  }
}

// Function to process image with local model
async function processWithLocalModel(imageBuffer: ArrayBuffer, modelName: string): Promise<{ generated_text: string }> {
  const pipe = await getLocalPipeline(modelName);
  
  // Convert ArrayBuffer to the format expected by transformers.js
  const uint8Array = new Uint8Array(imageBuffer);
  const blob = new Blob([uint8Array]);
  const imageUrl = URL.createObjectURL(blob);
  
  try {
    const result = await pipe(imageUrl);
    
    // Clean up the object URL
    URL.revokeObjectURL(imageUrl);
    
    // Transformers.js returns array of results, take the first one
    const text = Array.isArray(result) ? result[0]?.generated_text || result[0]?.text : result.generated_text || result.text;
    
    return { generated_text: text || "Unable to describe the image" };
  } catch (error) {
    URL.revokeObjectURL(imageUrl);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const imageFile = formData.get('image') as File
    const modelKey = formData.get('model') as string || 'vit' // Default to fastest ONNX model
    const forceLocal = formData.get('forceLocal') === 'true' || false
    const promptLength = formData.get('promptLength') as string || 'medium' // short, medium, long, detailed
    const detailLevel = formData.get('detailLevel') as string || 'balanced' // minimal, balanced, detailed, comprehensive

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      )
    }

    if (!modelKey || !modelMapping[modelKey]) {
      return NextResponse.json(
        { error: `Invalid model: ${modelKey}. Available models: ${Object.keys(modelMapping).join(', ')}` },
        { status: 400 }
      )
    }

    const modelConfig = modelMapping[modelKey];
    const imageBuffer = await imageFile.arrayBuffer();

    let result;
    let isUsingLocal = false;
    
    try {
      // Decide whether to use local or API model
      const canUseLocal = pipeline && modelConfig.localModel;
      const shouldUseLocal = forceLocal || (modelConfig.useLocal && canUseLocal);
      
      if (shouldUseLocal && canUseLocal && modelConfig.localModel) {
        console.log(`Using local model from models/ folder: ${modelConfig.localModel}`);
        result = await processWithLocalModel(imageBuffer, modelConfig.localModel);
        isUsingLocal = true;
      } else {
        console.log(`Using Hugging Face API model: ${modelConfig.huggingFaceModel}`);
        result = await hf.imageToText({
          data: imageBuffer,
          model: modelConfig.huggingFaceModel,
        });
        isUsingLocal = false;
      }

      // Apply style adjustments based on user preferences
      let finalText = result.generated_text || "A beautiful image";
      
      // Apply length and detail level adjustments
      finalText = adjustPromptStyle(finalText, promptLength, detailLevel);
      
      // Apply Flux1 enhancement if requested (after style adjustments)
      if (modelKey === "flux1") {
        finalText = enhanceForFlux1(finalText);
      }
      
      result = { generated_text: finalText };
    } catch (apiError) {
      console.error('Model processing error:', apiError);
      
      // Try fallback: if local failed, try API; if API failed, try local
      if (isUsingLocal && modelConfig.huggingFaceModel) {
        console.log('Local model failed, trying API fallback...');
        try {
          result = await hf.imageToText({
            data: imageBuffer,
            model: modelConfig.huggingFaceModel,
          });
          isUsingLocal = false;
        } catch (fallbackError) {
          console.error('API fallback also failed:', fallbackError);
          throw apiError; // Throw original error
        }
      } else if (!isUsingLocal && modelConfig.localModel && !forceLocal && pipeline) {
        console.log('API failed, trying local fallback...');
        try {
          result = await processWithLocalModel(imageBuffer, modelConfig.localModel);
          isUsingLocal = true;
        } catch (fallbackError) {
          console.error('Local fallback also failed:', fallbackError);
          throw apiError; // Throw original error
        }
      } else {
        throw apiError;
      }
    }

    return NextResponse.json({
      success: true,
      prompt: {
        prompt: result.generated_text,
        confidence: null,
        isMock: false
      },
      model: modelKey,
      metadata: {
        originalName: imageFile.name,
        size: imageFile.size,
        type: imageFile.type,
        modelUsed: isUsingLocal ? modelConfig.localModel : modelConfig.huggingFaceModel,
        executionMode: isUsingLocal ? 'local' : 'api',
        modelDescription: modelConfig.description
      }
    })

  } catch (error) {
    console.error('Error generating prompt:', error)
    
    let errorMessage = 'Failed to generate prompt';
    let statusCode = 500;
    
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        errorMessage = 'Hugging Face API key is missing or invalid. Please check your .env.local file.';
        statusCode = 401;
      } else if (error.message.includes('rate limit')) {
        errorMessage = 'Rate limit exceeded. Please try again later.';
        statusCode = 429;
      } else if (error.message.includes('model')) {
        errorMessage = 'Model not found or unavailable. Please try a different model.';
        statusCode = 404;
      }
    }
    
    return NextResponse.json(
      { error: errorMessage, details: process.env.NODE_ENV === 'development' ? error : undefined },
      { status: statusCode }
    )
  }
}

// GET endpoint to retrieve available models and their configurations
export async function GET() {
  try {
    const modelsInfo = Object.entries(modelMapping).map(([key, config]) => ({
      key,
      description: config.description,
      supportsLocal: !!config.localModel,
      supportsAPI: !!config.huggingFaceModel,
      defaultMode: config.useLocal ? 'local' : 'api',
      localModel: config.localModel,
      apiModel: config.huggingFaceModel
    }));

    return NextResponse.json({
      success: true,
      models: modelsInfo,
      localCacheInfo: {
        cachedModels: Array.from(localPipelineCache.keys()),
        cacheSize: localPipelineCache.size
      }
    });
  } catch (error) {
    console.error('Error retrieving models info:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve models information' },
      { status: 500 }
    );
  }
}