# Word Actions Quick Reference

## Three Action Types

### 1️⃣ DEFINE - Word Definition with Rearrangement
```
Teacher Input: "A sugar produced by plants during photosynthesis"
System Output (Random): ["sugar", "A", "produced", "by", "plants", "during", "photosynthesis"]
Student Task: Arrange words in correct order
```
**Data Stored:**
```javascript
{
  type: "define",
  definition: "A sugar produced by plants during photosynthesis",
  randomizedWords: ["sugar", "A", "produced", ...]
}
```

### 2️⃣ ILLUSTRATE - Image Selection
```
Teacher Input: 3 image URLs
- https://example.com/glucose.jpg
- https://example.com/fructose.jpg  
- https://example.com/sucrose.jpg

Student Task: Select correct image
```
**Data Stored:**
```javascript
{
  type: "illustrate",
  images: [
    { url: "...", source: "url", altText: "Glucose molecule" },
    { url: "...", source: "url", altText: "Fructose molecule" },
    { url: "...", source: "url", altText: "Sucrose molecule" }
  ]
}
```

### 3️⃣ FILL BLANKS - Letter Hiding
```
Teacher Input: Word "glucose" with letters G, E hidden
Student Sees: _LUC O S _

Student Task: Fill blanks with correct letters
```
**Data Stored:**
```javascript
{
  type: "fill",
  lettersToHide: ["E", "G"],
  hiddenLetterCount: 2,
  originalWord: "glucose"
}
```

---

## Action Assignment Workflow

```
Step 1: Click Word
└─ Paragraph Preview → Tap any word

Step 2: Choose Action
└─ Alert: "📝 Define | 🖼️ Illustrate | ✏️ Fill | Cancel"

Step 3: Configure
├─ Define: Enter text, see preview, save
├─ Illustrate: Add 3 URLs, see grid, save
└─ Fill: Select letters, see word, save

Step 4: Action Assigned
└─ Word shows checkmark/icon, can edit/delete
```

---

## Key Components

### ActionConfigurator.tsx
```
Props:
├─ wordId: "s0_w5"
├─ wordText: "glucose"
├─ actionType: "define" | "illustrate" | "fill"
├─ onSave: (actionData) => void
└─ onClose: () => void

Methods:
├─ handleSaveDefinition() → { type, data }
├─ handleSaveIllustration() → { type, data }
└─ handleSaveFill() → { type, data }
```

### State Management
```
Word Object:
{
  wordId: "s0_w5",
  wordText: "glucose",
  action: {
    type: "define" | "illustrate" | "fill",
    ... (action-specific fields)
  }
}
```

---

## Validation Rules

### Define
- ✅ Definition text must not be empty
- ✅ At least 2 words recommended
- ✅ Randomization automatic

### Illustrate
- ✅ Exactly 3 images required
- ✅ URLs must be valid
- ✅ Images must load (checked on display)

### Fill Blanks
- ✅ At least 1 letter must be hidden
- ✅ Not more than 50% of letters
- ✅ Both uppercase and lowercase hidden

---

## Error Messages

| Error | Cause | Fix |
|-------|-------|-----|
| "Please enter a definition" | Empty definition field | Type definition text |
| "Please select exactly 3 images" | Wrong image count | Add/remove images |
| "Please select at least one letter" | No letters selected | Tap letters to hide |
| Image doesn't load | Invalid URL | Check URL format |

---

## Student Experience

### Definition Challenge
```
TASK: Arrange these words in correct order:

[plants] [light] [energy] [use] [to] [convert]

Correct: "Plants use light to convert energy"
```

### Illustration Challenge
```
TASK: Which image shows glucose?

[Image A] [Image B] [Image C]

Select: A / B / C
```

### Fill Blanks Challenge
```
TASK: Fill in the missing letters:

G _ U C O S E

Type: L
Answer: GLUCOSE ✓
```

---

## Tips for Best Results

### Definition
✅ Clear, concise wording  
✅ 5-10 words ideal for rearrangement  
✅ Use simple language  
❌ Don't use word itself  
❌ Avoid overly complex sentences  

### Illustration
✅ Distinct, clear images  
✅ High resolution recommended  
✅ Diverse visual options  
❌ Don't use identical/similar images  
❌ Avoid blurry or unclear photos  

### Fill Blanks
✅ 2-4 letters hidden  
✅ Mix consonants and vowels  
✅ Create meaningful challenge  
❌ Don't hide first letter only  
❌ Don't hide more than half  

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Modal won't open | Reload page, click word again |
| Preview doesn't update | Keep typing definition |
| Image doesn't appear | Check URL is correct, try different image |
| Can't select letters | Word must have at least 2 unique letters |
| Action doesn't save | Ensure all required fields filled |

---

## Database Structure

```
reading_assignment_content:
  ├─ originalParagraph: string
  └─ sentences: []
     └─ [0] sentence
        ├─ sentenceId: "s0"
        └─ words: []
           └─ [0] word
              ├─ wordId: "s0_w0"
              ├─ wordText: "photosynthesis"
              ├─ wordPosition: 0
              └─ action: {
                 ├─ type: "define"
                 ├─ definition: "..."
                 └─ randomizedWords: [...]
              }
```

---

## Development Notes

### Import randomizeDefinitionWords
```typescript
import { randomizeDefinitionWords } from './ActionConfigurator';

const shuffled = randomizeDefinitionWords("my definition text");
// Returns: ["definition", "my", "text"]
```

### Use in ViewModel
```typescript
vm.assignWordAction(content, "s0_w5", {
  type: "define",
  data: {
    definition: "...",
    randomizedWords: [...]
  }
});
```

### Access Stored Action
```typescript
const word = content.sentences[0].words[5];
console.log(word.action.type); // "define"
console.log(word.action.definition); // "..."
```

---

## Performance Notes

- 🚀 Randomization: O(n) - Fisher-Yates shuffle
- 💾 Storage: ~200 bytes per action  
- 📱 No image optimization needed (URLs only)
- ⚡ Real-time preview: No lag on typical paragraph

---

## Future Enhancements

- 📸 Image upload (not just URLs)
- 🎨 Rich text definitions
- 🔄 Bulk actions
- 📊 Student analytics
- 🏆 Scoring logic

