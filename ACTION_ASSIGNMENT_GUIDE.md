# Reading Assignment Action Assignment - Quick Guide

## How to Use Word Actions

### Starting the Assignment Creation Wizard

1. **Navigate to Subject Detail**
   - From Academies → Select Level → Select Subject
   - Tap "Manage Assignments" button

2. **Click "Create New Assignment"**
   - Wizard opens with 5 steps

### Step 1: Title & Description
- Enter assignment title
- Optional: Add description
- Tap "Next Step"

### Step 2: Load Paragraph
- Paste or enter the reading passage
- Click "Load and Preview Paragraph"
- Paragraph appears with clickable words

### Step 3: Assign Word Actions ⭐ **YOUR FOCUS**

#### How It Works:
1. **Click any word** in the paragraph preview
2. **Choose action type:**
   - 📝 **Define** - Students rearrange words
   - 🖼️ **Illustrate** - Students pick correct image
   - ✏️ **Fill Blanks** - Students fill hidden letters
   - Cancel

#### Define Action
```
1. Click word "photosynthesis"
2. Tap "Define"
3. Modal opens with input field
4. Type definition: "Process plants use to convert sunlight to energy"
5. Preview shows scrambled words students will see:
   [plants] [to] [sunlight] [energy] [convert] [use] [Process] [the]
6. Tap "Save Definition"
7. Word now has green checkmark ✓
```

**Student Will See:**
- Scrambled words in a grid
- Task: "Rearrange these words to form the correct definition"
- Student drags/taps to arrange in correct order

#### Illustrate Action
```
1. Click word "chloroplast"
2. Tap "Illustrate"
3. Modal shows "Add Image" button
4. Tap to add image URLs:
   - Image 1: https://example.com/chloroplast1.jpg ✓
   - Image 2: https://example.com/chloroplast2.jpg ✓
   - Image 3: https://example.com/mitochondria.jpg ✓
5. Previews appear in grid (3/3)
6. Tap "Save Illustrations"
7. Word now has image icon
```

**Student Will See:**
- 3 images displayed
- Task: "Select the correct image for this word"
- Student taps correct image

#### Fill Blanks Action
```
1. Click word "glucose"
2. Tap "Fill Blanks"
3. Modal shows word: GLUCOSE
4. Tap letters to hide:
   - Tap "G" → turns red (selected)
   - Tap "L" → turns red
   - Preview shows: _LU_OSE
5. Tap "Save Fill Configuration"
6. Word now has blank icon
```

**Student Will See:**
- Word with blanks: _LU_OSE
- Task: "Fill in the missing letters"
- Student types or selects letters

#### Editing/Deleting Actions
```
1. Click word that already has action
2. Alert shows: "Action Already Assigned"
3. Options:
   - Edit: Modify the action
   - Delete: Remove the action
   - Cancel: Keep as is
```

### Step 4: Metadata (Optional)
- Duration: How many minutes to complete
- Tools: Dictionary, Calculator, etc.
- Parent Message: Encouragement from parents
- Due Date: When assignment is due

### Step 5: Review & Save
- Summary of all words with actions
- Confirm all details correct
- Tap "Save Assignment"

---

## Data Saved to Database

### For Each Word with Action:

```javascript
{
  wordId: "s0_w5",           // Sentence 0, Word 5
  wordText: "glucose",        // The actual word
  action: {
    type: "define",           // or "illustrate", "fill"
    definition: "...",        // Only for define
    randomizedWords: [...],   // Only for define - student sees these
    images: [...],            // Only for illustrate
    lettersToHide: [...],     // Only for fill
    hiddenLetterCount: 2      // Only for fill
  }
}
```

---

## Tips & Best Practices

### Definition Tips
✅ **Good:** Clear, concise definitions
- "A pigment that absorbs light energy"
- "The process of breaking down glucose for energy"

❌ **Avoid:** Overly complex definitions
- Don't use the word itself in definition
- Keep sentences short for rearrangement

### Illustration Tips
✅ **Good:** Clear, distinct images
- Different images for each option
- High quality, clearly visible

❌ **Avoid:** Similar looking images
- All three shouldn't look nearly identical
- Use diverse visual options

### Fill Blanks Tips
✅ **Good:** Mix of consonants and vowels
- Hide 2-4 letters per word
- Create a challenge but not impossible

❌ **Avoid:** Hiding first letter only
- Hide too many letters (>50% of word)
- Hide same letter every time

---

## Student Experience Preview

### Definition Challenge (Example)
```
Word: photosynthesis

Student sees:
[ plants ][ light ][ use ][ energy ][ to ][ convert ][ sun ]

Task: "Arrange these words to form the definition of photosynthesis"

Correct answer:
"plants use light to convert sun energy"
```

### Illustration Challenge (Example)
```
Word: mitochondria

Student sees:
[Image of mitochondria] [Image of chloroplast] [Image of nucleus]

Task: "Which image shows a mitochondrion?"

Options: A, B, C
```

### Fill Blanks Challenge (Example)
```
Word: glucose

Student sees:
_ L U _ O S E

Task: "Fill in the missing letters"

Boxes to fill: [ ] L U [ ] O S E

Hints: First letter is 'G', fourth letter is 'C'
```

---

## Troubleshooting

### Action Modal Doesn't Open
- ✅ Ensure word is in the paragraph
- ✅ Check that Action Selection appears
- ✅ Try clicking different word

### Randomized Words Preview Doesn't Update
- ✅ Type more definition text
- ✅ Preview updates in real-time
- ✅ Words should shuffle each render

### Can't Add 3 Images
- ✅ URLs must be valid and accessible
- ✅ Check image URL format (http/https)
- ✅ Clear your browser cache if image doesn't load

### MobX Errors in Console
- ✅ These have been fixed with `runInAction()`
- ✅ Should see no "strict-mode" errors
- ✅ State updates properly wrapped

---

## Next Features (Coming Soon)

- 📱 Image upload from phone (not just URLs)
- 🎨 Rich text editor for definitions
- 🔄 Bulk action assignment
- 📊 Student attempt analytics
- 🏆 Grading interface
- 💬 Feedback on student answers

