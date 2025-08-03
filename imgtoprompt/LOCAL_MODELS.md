# Lokální Modely - Dokumentace

Tato aplikace nyní podporuje spouštění AI modelů lokálně pomocí Hugging Face Transformers.js. To umožňuje větší kontrolu, rychlost a nezávislost na externí API.

## Funkce

### 🏠 Lokální Výpočty
- **Bez závislosti na internetu**: Modely se stahují jednou a pak fungují offline
- **Rychlejší odezva**: Žádné API volání, vše běží lokálně
- **Soukromí**: Vaše obrázky neopouštějí váš zařízení
- **Úspora nákladů**: Žádné poplatky za API volání

### 🔄 Fallback Systém
- **Automatické fallbacky**: Pokud lokální model selže, zkusí se API
- **Reverse fallback**: Pokud API selže, zkusí se lokální model
- **Transparentní error handling**: Vždy víte, který model byl použit

### 📊 Model Management
- **Cache system**: Modely se cachují pro rychlejší načítání
- **Progress tracking**: Real-time sledování stahování pomocí Server-Sent Events
- **Model preloading**: Možnost stáhnout modely předem
- **Model info**: API endpoint pro informace o dostupných modelech

### 📡 Real-time Progress Tracking
- **Server-Sent Events**: Live updates o stavu stahování
- **Progress modaly**: UI komponenty pro zobrazení progress
- **Czech localization**: Všechny zprávy v češtině
- **Error handling**: Detailní informace o chybách

### ⚡ ONNX Optimalizace
- **Rychlejší inference**: ONNX modely jsou až 3x rychlejší než standardní PyTorch
- **Menší paměťová náročnost**: Optimalizované pro běh v prohlížeči
- **Cross-platform**: Stejný výkon na Windows, macOS, Linux
- **Quantized modely**: Menší velikost bez ztráty kvality
- **JavaScript optimalizace**: Nativní podpora pro WebAssembly

## Podporované Modely

| Model Key | Lokální Model (ONNX) | API Model | Výkon | Default |
|-----------|---------------------|-----------|-------|---------|
| `vit` | ✅ Xenova/vit-gpt2-image-captioning | ✅ nlpconnect/vit-gpt2-image-captioning | ⚡ Nejrychlejší | Lokální |
| `blip` | ✅ Xenova/vit-gpt2-image-captioning | ✅ Salesforce/blip-image-captioning-base | ⚡ Rychlý | Lokální |
| `blip-large` | ✅ Xenova/vit-gpt2-image-captioning | ✅ Salesforce/blip-image-captioning-large | 🎯 Vysoká kvalita | Lokální |
| `blip-longcap` | ✅ Xenova/vit-gpt2-image-captioning | ✅ unography/blip-long-cap | 📝 Detailní popisy | Lokální |
| `git-base` | ✅ Xenova/vit-gpt2-image-captioning | ✅ microsoft/git-base | 💎 Premium kvalita | Lokální |
| `flux1` | ✅ Xenova/vit-gpt2-image-captioning | ✅ nlpconnect/vit-gpt2-image-captioning | ⚡ ONNX rychlost | Lokální |
| `midjourney` | ✅ Xenova/vit-gpt2-image-captioning | ✅ nlpconnect/vit-gpt2-image-captioning | ⚡ ONNX rychlost | Lokální |
| `dalle3` | ✅ Xenova/vit-gpt2-image-captioning | ✅ nlpconnect/vit-gpt2-image-captioning | ⚡ ONNX rychlost | Lokální |
| `stable-diffusion` | ✅ Xenova/vit-gpt2-image-captioning | ✅ nlpconnect/vit-gpt2-image-captioning | ⚡ ONNX rychlost | Lokální |
| `glm-4.5` | ❌ | ✅ nlpconnect/vit-gpt2-image-captioning | 🌐 API only | API |

## Použití

### 1. Základní Použití
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('model', 'vit'); // Automaticky použije lokální model

const response = await fetch('/api/generate-prompt', {
  method: 'POST',
  body: formData
});
```

### 2. Vynutit Lokální Model
```javascript
const formData = new FormData();
formData.append('image', imageFile);
formData.append('model', 'blip');
formData.append('forceLocal', 'true'); // Vynutí lokální model

const response = await fetch('/api/generate-prompt', {
  method: 'POST',
  body: formData
});
```

### 3. Informace o Modelech
```javascript
const response = await fetch('/api/generate-prompt', {
  method: 'GET'
});

const data = await response.json();
console.log(data.models); // Seznam dostupných modelů
console.log(data.localCacheInfo); // Info o cachovaných modelech
```

### 4. Sledování Progress Stahování
```javascript
// Připojení k Server-Sent Events pro progress
const eventSource = new EventSource('/api/model-progress?model=vit');

eventSource.onmessage = (event) => {
  const progress = JSON.parse(event.data);
  console.log(`Status: ${progress.status}, Progress: ${progress.progress}%`);
  console.log(`Message: ${progress.message}`);
};
```

### 5. Předem Stáhnout Model
```javascript
// Stáhnout model předem
const response = await fetch('/api/preload-model', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ model: 'vit' })
});

// Zkontrolovat status modelu
const statusResponse = await fetch('/api/preload-model?model=vit');
const status = await statusResponse.json();
console.log(`Model loaded: ${status.isLoaded}`);
```

## Response Format

```json
{
  "success": true,
  "prompt": {
    "prompt": "A beautiful landscape with mountains",
    "confidence": null,
    "isMock": false
  },
  "model": "vit",
  "metadata": {
    "originalName": "image.jpg",
    "size": 1024000,
    "type": "image/jpeg",
    "modelUsed": "nlpconnect/vit-gpt2-image-captioning",
    "executionMode": "local",
    "modelDescription": "ViT-GPT2 for image captioning (local support)"
  }
}
```

## Konfigurace

### Environment Variables
```bash
# Pro API fallback (volitelné)
HUGGING_FACE_API_KEY=your_key_here
```

### Next.js Konfigurace
Aplikace je předkonfigurovaná v `next.config.ts` pro správné fungování s transformers.js.

### Offline Mód
Pro úplný offline mód změňte v `route.ts`:
```typescript
env.allowLocalModels = true;
env.allowRemoteModels = false;
```

## Performance

### První Spuštění
- **Stahování**: Modely se stahují při prvním použití (~50-200MB)
- **Načítání**: První načítání modelu trvá 5-15 sekund
- **Cache**: Následné použití je rychlé (1-3 sekundy)

### Hardware Requirements
- **RAM**: Minimálně 4GB, doporučeno 8GB+
- **Storage**: 500MB-2GB pro cached modely
- **CPU**: Moderní procesor doporučen

## Troubleshooting

### Model se nepodařilo načíst
1. Zkontrolujte internetové připojení při prvním stahování
2. Ujistěte se, že máte dostatek RAM
3. Zkuste vyčistit cache a znovu spustit

### API Fallback nefunguje
1. Zkontrolujte `HUGGING_FACE_API_KEY` v `.env.local`
2. Ověřte internetové připojení
3. Zkontrolujte konzoli pro error logy

### Pomálé výkonnost
1. Používejte quantized modely (již nastaveno)
2. Zvažte upgrade RAM
3. Pro produkci použijte GPU inference

## Vývoj

### Přidání Nového Modelu
```typescript
// V route.ts přidejte do modelMapping
"new-model": {
  huggingFaceModel: "org/api-model",
  localModel: "org/local-model", 
  useLocal: true,
  description: "Popis modelu"
}
```

### Cache Management
```typescript
// Vyčištění cache
localPipelineCache.clear();

// Načtení konkrétního modelu
await getLocalPipeline('model-name');
```

## Bezpečnost

- **Lokální zpracování**: Obrázky se zpracovávají lokálně
- **Žádné logování**: Obsah obrázků se neloguje
- **HTTPS**: Používejte HTTPS v produkci
- **Validation**: Validujte vstupní soubory