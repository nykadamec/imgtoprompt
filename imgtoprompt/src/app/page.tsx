"use client"

import { useState, useRef } from "react"
import { Upload, Image as ImageIcon, Copy, Download, Sparkles, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "react-hot-toast"
import { ModelProgressModal } from "@/components/ModelProgressModal"
import { ModelPreloaderList } from "@/components/ModelPreloader"
import { FloatingNavbar } from "@/components/FloatingNavbar"

interface GeneratedPrompt {
  prompt: string
  model: string
  confidence: number | null
  isMock?: boolean
}

const modelDisplayNames: { [key: string]: string } = {
  "blip": "BLIP ONNX",
  "vit": "ViT-GPT2 ONNX",
  "blip-large": "BLIP Large ONNX",
  "blip-longcap": "BLIP Long Caption",
  "git-base": "Microsoft GIT",
  "glm-4.5": "GLM-4.5 (API)",
  "flux1": "Flux1 ONNX",
  "midjourney": "Midjourney ONNX",
  "dalle3": "DALL-E 3 ONNX",
  "stable-diffusion": "Stable Diffusion ONNX",
};

export default function ImageToPromptPage() {
  const [image, setImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [prompts, setPrompts] = useState<GeneratedPrompt[]>([])
  const [isProcessing, setIsProcessing] = useState(false)
  const [selectedModel, setSelectedModel] = useState("vit")
  const [promptLength, setPromptLength] = useState("medium")
  const [detailLevel, setDetailLevel] = useState("balanced")
  const [currentlyProcessingModel, setCurrentlyProcessingModel] = useState<string | null>(null)
  const [showProgress, setShowProgress] = useState(false)
  const [showPreloader, setShowPreloader] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const scrollToSection = (sectionId: string) => {
    if (sectionId === 'top') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size should be less than 10MB")
      return
    }

    setOriginalFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      setImage(e.target?.result as string)
      setPrompts([]) // Clear previous prompts when new image is uploaded
    }
    reader.readAsDataURL(file)
  }

  const generatePrompt = async (selectedModelKey?: string) => {
    if (!image || !originalFile) {
      toast.error("Please upload an image first")
      return
    }

    const modelToUse = selectedModelKey || selectedModel;
    
    setIsProcessing(true)
    setShowProgress(true)
    setCurrentlyProcessingModel(modelToUse)
    
    try {
      const modelFormData = new FormData()
      modelFormData.append('image', originalFile)
      modelFormData.append('model', modelToUse)
      modelFormData.append('promptLength', promptLength)
      modelFormData.append('detailLevel', detailLevel)

      const modelResponse = await fetch('/api/generate-prompt', {
        method: 'POST',
        body: modelFormData,
      })

      if (modelResponse.ok) {
        const modelData = await modelResponse.json()
        const newPrompt: GeneratedPrompt = {
          prompt: modelData.prompt.prompt,
          model: modelData.model,
          confidence: modelData.prompt.confidence,
          isMock: modelData.prompt.isMock
        };
        
        setPrompts([newPrompt]) // Replace with single prompt
        toast.success(`Prompt generated with ${modelDisplayNames[modelToUse] || modelToUse}!`)
      } else {
        const errorData = await modelResponse.json()
        console.error(`Failed to generate prompt for model ${modelToUse}:`, errorData)
        toast.error(`Failed to generate prompt: ${errorData.error || 'Unknown error'}`)
      }
    } catch (error) {
      toast.error("Failed to generate prompt")
      console.error(error)
    } finally {
      setIsProcessing(false)
      setCurrentlyProcessingModel(null)
      setShowProgress(false)
    }
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success("Prompt copied to clipboard!")
    } catch (error) {
      toast.error("Failed to copy prompt")
    }
  }

  const downloadPrompt = (prompt: string, model: string) => {
    const element = document.createElement("a")
    const file = new Blob([prompt], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `prompt-${model}-${Date.now()}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setOriginalFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setImage(e.target?.result as string)
        setPrompts([])
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Floating Navbar */}
      <FloatingNavbar 
        onPreloaderOpen={() => setShowPreloader(true)}
        onScrollToSection={scrollToSection}
      />

      <div className="container mx-auto px-4 py-8 pt-20" id="top">
        <div className="text-center mb-14 mt-14">
          <h1 className="text-4xl font-bold text-white mb-4">
            Image to Prompt Generator
          </h1>
          <p className="text-gray-300 text-lg mb-4">
            Upload an image and get optimized prompts for Flux1, Midjourney, DALL-E 3, and more
          </p>
          <button
            onClick={() => setShowPreloader(true)}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            📥 Předem stáhnout modely
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8" id="upload">
          {/* Image Upload Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
            <h2 className="text-2xl font-semibold text-white mb-4">Upload Image</h2>
            
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer",
                image ? "border-gray-400 bg-gray-400/10" : "border-gray-500 hover:border-gray-400 hover:bg-gray-700/30"
              )}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              
              {image ? (
                <div className="space-y-4">
                  <img
                    src={image}
                    alt="Uploaded"
                    className="max-w-full h-64 object-contain rounded-lg mx-auto"
                  />
                  <div className="text-sm text-gray-400">
                    <p>Click to change image or drag & drop</p>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        setImage(null)
                        setOriginalFile(null)
                        setPrompts([])
                      }}
                      className="text-gray-500 hover:text-gray-400 mt-2"
                    >
                      Remove image
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-300 font-medium">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400">PNG, JPG, WebP up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {image && (
              <div className="mt-4 space-y-4">
                {/* Model Selector */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Vyberte model pro generování:
                  </label>
                  <select
                    value={selectedModel}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500"
                    disabled={isProcessing}
                  >
                    <option value="vit">⚡ ViT-GPT2 ONNX (nejrychlejší)</option>
                    <option value="blip">⚡ BLIP ONNX (rychlý)</option>
                    <option value="blip-large">🎯 BLIP Large (vysoká kvalita)</option>
                    <option value="blip-longcap">📝 BLIP Long Caption (detailní popisy)</option>
                    <option value="git-base">💎 Microsoft GIT (premium kvalita)</option>
                    <option value="flux1">🎨 Flux1 ONNX (pro Flux1)</option>
                    <option value="midjourney">🎨 Midjourney ONNX (pro Midjourney)</option>
                    <option value="dalle3">🎨 DALL-E 3 ONNX (pro DALL-E 3)</option>
                    <option value="stable-diffusion">🎨 Stable Diffusion ONNX</option>
                  </select>
                </div>

                {/* Prompt Customization */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Prompt Length */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      📏 Délka promptu:
                    </label>
                    <select
                      value={promptLength}
                      onChange={(e) => setPromptLength(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                      disabled={isProcessing}
                    >
                      <option value="short">📝 Krátký (~50 slov)</option>
                      <option value="medium">📄 Střední (~100 slov)</option>
                      <option value="long">📑 Dlouhý (~200 slov)</option>
                      <option value="detailed">📚 Velmi detailní (~300 slov)</option>
                    </select>
                  </div>

                  {/* Detail Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      🔍 Úroveň detailů:
                    </label>
                    <select
                      value={detailLevel}
                      onChange={(e) => setDetailLevel(e.target.value)}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gray-500 text-sm"
                      disabled={isProcessing}
                    >
                      <option value="minimal">🔸 Minimální (jen základy)</option>
                      <option value="balanced">⚖️ Vyváženě (standard)</option>
                      <option value="detailed">🔍 Detailní (bohaté popisy)</option>
                      <option value="comprehensive">🎯 Kompletní (technické detaily)</option>
                    </select>
                  </div>
                </div>

                {/* Generate Button */}
                <button
                  onClick={() => generatePrompt()}
                  disabled={isProcessing}
                  className="w-full bg-gradient-to-r from-gray-700 to-black text-white font-semibold py-3 px-4 rounded-lg hover:from-gray-600 hover:to-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {isProcessing ? (
                    <div className="flex items-center justify-center">
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generuje se s {modelDisplayNames[selectedModel]}...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Generovat prompt s {modelDisplayNames[selectedModel]}
                    </div>
                  )}
                </button>

                {/* Style Presets */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    🎨 Rychlé přednastavení:
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        setPromptLength('short');
                        setDetailLevel('minimal');
                      }}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-gray-600 hover:bg-gray-500 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                    >
                      ⚡ Rychlý & Stručný
                    </button>
                    <button
                      onClick={() => {
                        setPromptLength('long');
                        setDetailLevel('comprehensive');
                      }}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                    >
                      🎯 Detailní & Bohatý
                    </button>
                    <button
                      onClick={() => {
                        setPromptLength('medium');
                        setDetailLevel('detailed');
                      }}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                    >
                      📝 Pro AI umění
                    </button>
                    <button
                      onClick={() => {
                        setPromptLength('detailed');
                        setDetailLevel('comprehensive');
                      }}
                      disabled={isProcessing}
                      className="px-3 py-2 bg-black hover:bg-gray-900 text-white text-sm rounded-lg disabled:opacity-50 transition-colors"
                    >
                      🎬 Profesionální
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Generated Prompts Section */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
            <h2 className="text-2xl font-semibold text-white mb-4">Generated Prompts</h2>
            
            {prompts.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Upload an image to generate prompts</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {prompts.map((prompt, index) => (
                  <div key={index} className="bg-gray-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-300">
                        {modelDisplayNames[prompt.model] || prompt.model.toUpperCase()}
                      </span>
                      <div className="flex items-center gap-2">
                        {prompt.isMock && (
                          <span className="text-xs bg-yellow-500/20 text-yellow-300 px-2 py-1 rounded">
                            Mock
                          </span>
                        )}
                        {prompt.confidence && (
                          <span className="text-xs text-gray-400">
                            Confidence: {(prompt.confidence * 100).toFixed(0)}%
                          </span>
                        )}
                      </div>
                    </div>
                    
                    {/* Style Settings Info */}
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1">
                        📏 {promptLength === 'short' ? 'Krátký' : promptLength === 'medium' ? 'Střední' : promptLength === 'long' ? 'Dlouhý' : 'Velmi detailní'}
                      </span>
                      <span className="flex items-center gap-1">
                        🔍 {detailLevel === 'minimal' ? 'Minimální' : detailLevel === 'balanced' ? 'Vyváženě' : detailLevel === 'detailed' ? 'Detailní' : 'Kompletní'}
                      </span>
                      <span className="text-gray-500">•</span>
                      <span>{prompt.prompt.split(' ').length} slov</span>
                    </div>
                    
                    <p className="text-gray-200 text-sm mb-3 leading-relaxed break-words">
                      {prompt.prompt}
                    </p>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => copyToClipboard(prompt.prompt)}
                        className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        <Copy className="w-3 h-3" />
                        Copy
                      </button>
                      <button
                        onClick={() => downloadPrompt(prompt.prompt, prompt.model)}
                        className="flex items-center gap-1 text-xs bg-gray-700 hover:bg-gray-600 text-white px-3 py-1 rounded transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        Save
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Features Section */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6" id="features">
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
            <div className="text-gray-300 text-2xl mb-3">🎯</div>
            <h3 className="text-lg font-semibold text-white mb-2">Multiple AI Models</h3>
            <p className="text-gray-400 text-sm">
              Get optimized prompts from real AI models like BLIP and ViT-GPT2
            </p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
            <div className="text-gray-300 text-2xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold text-white mb-2">Fast Processing</h3>
            <p className="text-gray-400 text-sm">
              Quick image analysis and prompt generation with high accuracy
            </p>
          </div>
          
          <div className="bg-gray-900/30 backdrop-blur-sm rounded-xl p-6 border border-gray-600">
            <div className="text-gray-300 text-2xl mb-3">💾</div>
            <h3 className="text-lg font-semibold text-white mb-2">Easy Export</h3>
            <p className="text-gray-400 text-sm">
              Copy to clipboard or download prompts as text files
            </p>
          </div>
        </div>
      </div>

      {/* Progress Modal for Model Downloads */}
      <ModelProgressModal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        modelName={currentlyProcessingModel}
        modelDisplayName={currentlyProcessingModel ? modelDisplayNames[currentlyProcessingModel] || currentlyProcessingModel : undefined}
      />

      {/* Preloader Modal */}
      {showPreloader && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full mx-4 shadow-xl max-h-[80vh] overflow-y-auto border border-gray-600">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Správa Lokálních Modelů
              </h3>
              <button
                onClick={() => setShowPreloader(false)}
                className="text-gray-400 hover:text-gray-200"
              >
                ✕
              </button>
            </div>
            <ModelPreloaderList />
          </div>
        </div>
      )}
    </div>
  )
}
