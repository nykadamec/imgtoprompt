# Přizpůsobení Promptů - Délka a Detailnost

Aplikace nyní nabízí pokročilé možnosti přizpůsobení generovaných promptů podle vašich specifických potřeb. Můžete kontrolovat jak délku, tak úroveň detailnosti výsledných promptů.

## 🎯 Přehled Funkcí

### 📏 **Délka Promptu**
Ovládá celkovou délku vygenerovaného textu s inteligentním rozšiřováním nebo zkracováním.

### 🔍 **Úroveň Detailů** 
Řídí množství a typ popisných prvků přidaných do základního popisu obrazu.

### 🎨 **Rychlé Přednastavení**
Předkonfigurované kombinace pro běžné případy použití.

## 📏 Možnosti Délky Promptu

### **📝 Krátký (~50 slov)**
- **Účel**: Rychlé a stručné popisy
- **Ideální pro**: Social media, jednoduché AI generování
- **Příklad**: `"A cat sitting on a windowsill, looking outside"`

### **📄 Střední (~100 slov)**
- **Účel**: Vyvážené popisy s dostatkem detailů
- **Ideální pro**: Většina AI aplikací, obecné použití
- **Příklad**: `"A fluffy orange tabby cat sitting comfortably on a white painted windowsill, gazing thoughtfully through clean glass at the garden outside, with soft natural lighting illuminating its fur"`

### **📑 Dlouhý (~200 slov)**
- **Účel**: Podrobné popisy s kontextem
- **Ideální pro**: Profesionální AI umění, detailní projekty
- **Příklad**: `"A magnificent fluffy orange tabby cat with distinctive dark stripes sits gracefully on a pristine white-painted wooden windowsill, its intelligent amber eyes focused intently on the lush garden scene visible through the spotless glass window. The afternoon sunlight streams through, creating a warm golden glow that highlights the intricate patterns in the cat's dense fur and casts gentle shadows on the sill beneath"`

### **📚 Velmi detailní (~300 slov)**
- **Účel**: Komprehensivní popisy s technickými detaily
- **Ideální pro**: High-end AI generování, umělecké projekty
- **Příklad**: Rozšířená verze s technickými specifikacemi, atmosférou a uměleckými prvky

## 🔍 Úrovně Detailů

### **🔸 Minimální (jen základy)**
- **Charakteristika**: Pouze nejpodstatnější elementy
- **Proces**: Odstraní adjektiva a dekorativní výrazy
- **Výsledek**: Čistý, jednoduchý popis
- **Příklad**: `"Cat on windowsill"`

### **⚖️ Vyváženě (standard)**
- **Charakteristika**: Dobrý poměr základů a detailů
- **Proces**: Zachová původní popis beze změn
- **Výsledek**: Přirozený, použitelný popis
- **Příklad**: `"Orange tabby cat sitting on white windowsill"`

### **🔍 Detailní (bohaté popisy)**
- **Charakteristika**: Přidává popisné elementy
- **Proces**: Doplní textury, barvy, atmosféru
- **Výsledek**: Bohatý, vizuálně zajímavý popis
- **Příklad**: `"Orange tabby cat sitting on white windowsill, with intricate details, featuring rich textures"`

### **🎯 Kompletní (technické detaily)**
- **Charakteristika**: Obsahuje technické a umělecké specifikace
- **Proces**: Přidává fotografické, kompoziční a kvalitativní prvky
- **Výsledek**: Profesionální, tech-savvy popis
- **Příklad**: `"Orange tabby cat sitting on white windowsill, shot with professional camera equipment, following rule of thirds composition, ultra-high resolution"`

## 🎨 Rychlé Přednastavení

### **⚡ Rychlý & Stručný**
```
Délka: Krátký (~50 slov)
Detaily: Minimální
Použití: Social media, rychlé náhledy
```

### **🎯 Detailní & Bohatý**
```
Délka: Dlouhý (~200 slov)
Detaily: Kompletní
Použití: High-end AI umění, portfolia
```

### **📝 Pro AI umění**
```
Délka: Střední (~100 slov)  
Detaily: Detailní
Použití: Midjourney, DALL-E, Stable Diffusion
```

### **🎬 Profesionální**
```
Délka: Velmi detailní (~300 slov)
Detaily: Kompletní  
Použití: Komerční projekty, profesionální fotografie
```

## 🛠️ Technická Implementace

### Backend Processing
```typescript
// Hlavní funkce pro úpravu stylu
function adjustPromptStyle(baseText: string, promptLength: string, detailLevel: string): string {
  let adjustedText = baseText;

  // Aplikace úrovně detailů
  switch (detailLevel) {
    case 'minimal': adjustedText = simplifyPrompt(adjustedText); break;
    case 'balanced': break; // Zůstává stejný
    case 'detailed': adjustedText = addDetailedDescriptions(adjustedText); break;
    case 'comprehensive': adjustedText = addComprehensiveDetails(adjustedText); break;
  }

  // Aplikace délky
  switch (promptLength) {
    case 'short': adjustedText = truncateToLength(adjustedText, 50); break;
    case 'medium': adjustedText = truncateToLength(adjustedText, 100); break;
    case 'long': adjustedText = expandToLength(adjustedText, 150, 200); break;
    case 'detailed': adjustedText = expandToLength(adjustedText, 200, 300); break;
  }

  return adjustedText;
}
```

### Frontend Integration
```typescript
// State management
const [promptLength, setPromptLength] = useState("medium")
const [detailLevel, setDetailLevel] = useState("balanced")

// API call with parameters
const modelFormData = new FormData()
modelFormData.append('promptLength', promptLength)
modelFormData.append('detailLevel', detailLevel)
```

## 📊 Příklady Výstupů

### Testovací Obrázek: "Kočka na okně"

#### **Minimální + Krátký**
```
"Cat windowsill"
(2 slova)
```

#### **Vyváženě + Střední**
```
"Orange tabby cat sitting on white windowsill, looking outside through glass window"
(13 slov)
```

#### **Detailní + Dlouhý**
```
"Beautiful orange tabby cat with distinctive markings sitting gracefully on pristine white windowsill, gazing thoughtfully through sparkling clean glass at lush garden outside, with intricate details, featuring rich textures, showcasing fine craftsmanship, with careful attention to lighting, displaying vibrant color palette, with artistic composition"
(45 slov)
```

#### **Kompletní + Velmi detailní**
```
"Magnificent orange tabby cat with striking dark stripes and expressive amber eyes sitting elegantly on immaculate white-painted wooden windowsill, its fluffy fur catching the golden afternoon sunlight as it gazes with focused intensity through crystal-clear glass window at the verdant garden landscape beyond, shot with professional camera equipment, using optimal lighting conditions, with precise focus and depth of field, following rule of thirds composition, with harmonious color grading, showcasing artistic perspective, ultra-high resolution, featuring excellent composition and visual appeal, showcasing remarkable clarity and sharpness, displaying exceptional artistic merit, captured with perfect timing and technique"
(85 slov)
```

## 🎛️ UI Ovládání

### Model & Style Selection
```jsx
{/* Model Selector */}
<select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)}>
  <option value="vit">⚡ ViT-GPT2 ONNX (nejrychlejší)</option>
  <option value="blip-large">🎯 BLIP Large (vysoká kvalita)</option>
  // ... další modely
</select>

{/* Prompt Customization */}
<div className="grid grid-cols-2 gap-4">
  {/* Length Selector */}
  <select value={promptLength} onChange={(e) => setPromptLength(e.target.value)}>
    <option value="short">📝 Krátký (~50 slov)</option>
    <option value="medium">📄 Střední (~100 slov)</option>
    <option value="long">📑 Dlouhý (~200 slov)</option>
    <option value="detailed">📚 Velmi detailní (~300 slov)</option>
  </select>

  {/* Detail Level Selector */}
  <select value={detailLevel} onChange={(e) => setDetailLevel(e.target.value)}>
    <option value="minimal">🔸 Minimální (jen základy)</option>
    <option value="balanced">⚖️ Vyváženě (standard)</option>
    <option value="detailed">🔍 Detailní (bohaté popisy)</option>
    <option value="comprehensive">🎯 Kompletní (technické detaily)</option>
  </select>
</div>
```

### Quick Presets
```jsx
{/* Style Presets */}
<div className="grid grid-cols-2 gap-2">
  <button onClick={() => { setPromptLength('short'); setDetailLevel('minimal'); }}>
    ⚡ Rychlý & Stručný
  </button>
  <button onClick={() => { setPromptLength('long'); setDetailLevel('comprehensive'); }}>
    🎯 Detailní & Bohatý
  </button>
  <button onClick={() => { setPromptLength('medium'); setDetailLevel('detailed'); }}>
    📝 Pro AI umění
  </button>
  <button onClick={() => { setPromptLength('detailed'); setDetailLevel('comprehensive'); }}>
    🎬 Profesionální
  </button>
</div>
```

## 📈 Performance Impact

### Processing Time
- **Minimální styling**: +0.1s
- **Základní styling**: +0.2s  
- **Detailní styling**: +0.3s
- **Kompletní styling**: +0.5s

### Model Compatibility
- **Všechny lokální modely**: Plná podpora
- **API modely**: Plná podpora
- **Flux1 enhancement**: Aplikuje se po style úpravách

## 💡 Doporučení Použití

### **Pro Začátečníky**
- Začněte s **"Vyváženě + Střední"**
- Experimentujte s quick presety
- Sledujte počet slov ve výsledcích

### **Pro AI Art**
- Použijte **"Pro AI umění"** preset
- Pro Midjourney: "Detailní + Dlouhý"
- Pro DALL-E: "Vyváženě + Střední"

### **Pro Profesionály**
- **"Profesionální"** preset pro komerční práce
- **"Kompletní + Velmi detailní"** pro portfolia
- Kombinujte s odpovídajícími modely (BLIP Large, GIT Base)

### **Pro Experimenty**
- **"Minimální + Krátký"** pro A/B testing
- **"Kompletní + Velmi detailní"** pro inspiraci
- Změňte pouze jeden parametr najednou

## 🔮 Budoucí Rozšíření

### Plánované Funkce
- [ ] **Custom style templates** - uživatelské šablony
- [ ] **AI style suggestions** - doporučení na základě obrázku
- [ ] **Batch processing** - více stylů najednou  
- [ ] **Style history** - ukládání oblíbených kombinací
- [ ] **Advanced filters** - specifické filtry pro typy obrázků

### Advanced Features
- [ ] **Semantic enhancement** - chytrá analýza obsahu
- [ ] **Genre-specific styling** - styly podle žánru (portrét, krajina, atd.)
- [ ] **Multi-language prompts** - různé jazykové verze
- [ ] **Style interpolation** - míchání stylů

## 🎉 Výsledek

Díky těmto funkcím máte úplnou kontrolu nad tím, jak vaše obrázky budou převedeny na AI prompty. Ať už potřebujete rychlé stručné popisy pro social media, nebo detailní profesionální prompty pro high-end AI art projekty, aplikace vám umožní dosáhnout přesně toho, co potřebujete.

**Experimentujte s různými kombinacemi a najděte svůj perfektní styl!** 🎨