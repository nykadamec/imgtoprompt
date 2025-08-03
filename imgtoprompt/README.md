# Image to Prompt Generator

A modern Next.js application that converts uploaded images into optimized prompts for various AI image generators including Flux1, Midjourney, DALL-E 3, and Stable Diffusion.

## Features

- 🎯 **Multiple AI Model Support**: Generate prompts optimized for Flux1, Midjourney, DALL-E 3, and Stable Diffusion
- 🏠 **Local AI Models**: Run models directly in your browser/server with Transformers.js
- 🔄 **Smart Fallbacks**: Automatic fallback between local and API models
- 📝 **Prompt Customization**: Control prompt length and detail level for perfect results
- 🎨 **Style Presets**: Quick settings for AI art, professional, and social media use
- 💾 **Persistent Storage**: Models stay downloaded in `models/` folder between restarts
- 🖼️ **Drag & Drop Upload**: Easy image upload with drag and drop functionality
- ⚡ **Real-time Processing**: Fast image analysis and prompt generation with progress tracking
- 📋 **One-click Copy**: Copy prompts to clipboard instantly
- 💾 **Download Support**: Save prompts as text files
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Beautiful gradient design with dark mode aesthetics
- 🔒 **Privacy First**: Local processing means your images never leave your device

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Navigate to the project directory:
```bash
cd imgtoprompt
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Setup (Optional)

The application works out-of-the-box with local AI models. For API fallbacks, you can configure:

1. Create `.env.local` file:
```bash
HUGGING_FACE_API_KEY=your_hugging_face_token_here
```

**Note**: API key is only needed for fallback when local models fail. The app primarily uses local models for better privacy and speed.

## Usage

### Basic Usage
1. **Upload Image**: Click the upload area or drag and drop an image (PNG, JPG, WebP up to 10MB)
2. **Generate Prompts**: Click "Generate All Prompts" to analyze your image
3. **Review Results**: View optimized prompts for each AI model
4. **Copy/Download**: Use the copy button or download prompts as text files

### Local vs API Models
- **First run**: Models download automatically to `models/` folder (30-180MB per model)
- **Subsequent runs**: Instant loading from persistent cache
- **Model selection**: Choose your preferred model before generation
- **Persistent storage**: Models stay downloaded between app restarts
- **Fallback**: If local model fails, automatically tries API
- **Privacy**: Local models process images entirely on your device

### Force Local Processing
Add `forceLocal=true` to API requests to ensure only local models are used.

### Detailed Documentation
- **Complete local models guide**: [LOCAL_MODELS.md](./LOCAL_MODELS.md)
- **ONNX models overview**: [ONNX_MODELS.md](./ONNX_MODELS.md)
- **Persistent models & storage**: [PERSISTENT_MODELS.md](./PERSISTENT_MODELS.md)
- **Prompt customization & styling**: [PROMPT_CUSTOMIZATION.md](./PROMPT_CUSTOMIZATION.md)

## API Integration

### Local Model Response Structure
```json
{
  "success": true,
  "prompt": {
    "prompt": "Your generated prompt here...",
    "confidence": null,
    "isMock": false
  },
  "model": "vit",
  "metadata": {
    "originalName": "image.jpg",
    "size": 123456,
    "type": "image/jpeg",
    "modelUsed": "nlpconnect/vit-gpt2-image-captioning",
    "executionMode": "local",
    "modelDescription": "ViT-GPT2 for image captioning (local support)"
  }
}
```

### Available Models
Get model information via GET request to `/api/generate-prompt`:
```json
{
  "success": true,
  "models": [
    {
      "key": "vit",
      "description": "ViT-GPT2 for image captioning (local support)",
      "supportsLocal": true,
      "supportsAPI": true,
      "defaultMode": "local"
    }
  ],
  "localCacheInfo": {
    "cachedModels": ["nlpconnect/vit-gpt2-image-captioning"],
    "cacheSize": 1
  }
}
```

### Integration Modes

1. **Local Only**: Transformers.js models running entirely on your device
2. **API Fallback**: Hugging Face Inference API when local models fail  
3. **Hybrid**: Smart fallback between local and cloud processing

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   └── generate-prompt/
│   │       └── route.ts      # API endpoint for prompt generation
│   ├── globals.css           # Global styles
│   ├── layout.tsx           # Root layout with toast provider
│   └── page.tsx             # Main application page
├── lib/
│   └── utils.ts             # Utility functions for image processing
└── ...
```

## Technologies Used

- **Next.js 15** - React framework with App Router
- **TypeScript** - Type safety
- **Transformers.js** - Local AI model execution
- **Hugging Face Inference** - Cloud AI fallback
- **Tailwind CSS** - Utility-first styling
- **React Hot Toast** - Toast notifications
- **Lucide React** - Icon library

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import your repository on [Vercel](https://vercel.com)
3. Deploy with default settings

### Other Platforms

The application is compatible with any Node.js hosting platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## License

This project is licensed under the MIT License.
