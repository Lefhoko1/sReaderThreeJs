import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { readingAssignmentViewModel } from '../../../application/viewmodels/ReadingAssignmentViewModel';

interface ParagraphEditorProps {
  onParagraphLoaded: (paragraph: string) => void;
  onClose: () => void;
}

/**
 * ParagraphEditor Component
 * Allows tutors to input or paste a paragraph and displays it with clickable words
 * for assigning actions (define, illustrate, fill)
 */
export const ParagraphEditor = observer(
  ({ onParagraphLoaded, onClose }: ParagraphEditorProps) => {
    const [paragraph, setParagraph] = useState('');
    const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [currentAction, setCurrentAction] = useState<'define' | 'illustrate' | 'fill' | null>(null);

    // Parse paragraph into sentences and words
    const parseContent = (text: string) => {
      if (!text.trim()) return { sentences: [] as Array<{ sentenceId: string; words: Array<{ wordId: string; text: string; isSelected: boolean }> }>, wordMap: new Map() };

      // Split by sentence endings but keep them
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      const wordMap = new Map<string, { text: string; sentenceIdx: number; wordIdx: number }>();

      // First pass: Parse sentences and filter empty ones
      const parsedSentencesData = sentences
        .map((sentence) => {
          const trimmed = sentence.trim();
          if (!trimmed) return null; // Skip empty sentences

          const words = trimmed.split(/\s+/).filter(w => w.length > 0); // Filter empty strings

          return {
            text: trimmed,
            words: words,
          };
        })
        .filter((s) => s !== null);

      // Second pass: Create word objects with correct indices based on filtered array
      const parsedSentences: Array<{ sentenceId: string; text: string; words: Array<{ wordId: string; text: string; isSelected: boolean }> }> = parsedSentencesData
        .map((sentenceData, sentenceIdx) => {
          const parsedWords = sentenceData.words.map((word, wordIdx) => {
            const wordId = `s${sentenceIdx}_w${wordIdx}`;
            wordMap.set(wordId, { text: word, sentenceIdx, wordIdx });

            return {
              wordId,
              text: word,
              isSelected: selectedWordId === wordId,
            };
          });

          return {
            sentenceId: `s${sentenceIdx}`,
            text: sentenceData.text,
            words: parsedWords,
          };
        });

      return { sentences: parsedSentences, wordMap };
    };

    const content = parseContent(paragraph);

    const handleWordPress = (wordId: string) => {
      setSelectedWordId(wordId);
      setShowActionMenu(true);
    };

    const handleActionSelect = (action: 'define' | 'illustrate' | 'fill') => {
      setCurrentAction(action);
      setShowActionMenu(false);

      // Store action selection for this word
      const wordContent = readingAssignmentViewModel.formData.content;
      if (wordContent) {
        readingAssignmentViewModel.assignWordAction(wordContent, selectedWordId!, {
          type: action,
          data: {},
        });
      }
    };

    const handleLoadParagraph = () => {
      if (!paragraph.trim()) {
        Alert.alert('Error', 'Please enter a paragraph');
        return;
      }

      // Initialize content structure
      const assignmentContent = readingAssignmentViewModel.buildAssignmentContent(
        paragraph,
        new Map()
      );
      readingAssignmentViewModel.setFormContent(assignmentContent);
      onParagraphLoaded(paragraph);
    };

    const handleClearParagraph = () => {
      setParagraph('');
      setSelectedWordId(null);
      readingAssignmentViewModel.setFormContent(null);
    };

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Paragraph Editor</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <Text style={styles.instructions}>
          Enter or paste a paragraph below. Click on words to assign actions.
        </Text>

        {/* Paragraph Input */}
        <TextInput
          style={styles.paragraphInput}
          placeholder="Enter your paragraph here..."
          multiline
          value={paragraph}
          onChangeText={setParagraph}
          placeholderTextColor="#999"
        />

        {/* Preview */}
        {paragraph.trim() && (
          <ScrollView style={styles.previewContainer}>
            <Text style={styles.previewLabel}>Preview - Click words to assign actions:</Text>

            {content.sentences.map((sentence: { sentenceId: string; words: Array<{ wordId: string; text: string; isSelected: boolean }> }) => {
              const validWords = sentence.words
                .filter((word: { wordId: string; text: string; isSelected: boolean }) => word.text && word.text.trim());
              
              if (validWords.length === 0) return null;
              
              return (
                <View key={sentence.sentenceId} style={styles.sentenceContainer}>
                  {validWords.map((word: { wordId: string; text: string; isSelected: boolean }) => (
                    <TouchableOpacity
                      key={word.wordId}
                      style={[
                        styles.wordButton,
                        word.isSelected && styles.wordButtonSelected,
                      ]}
                      onPress={() => handleWordPress(word.wordId)}
                    >
                      <Text
                        style={[
                          styles.wordText,
                          word.isSelected && styles.wordTextSelected,
                        ]}
                      >
                        {word.text}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              );
            })}
          </ScrollView>
        )}

        {/* Action Menu */}
        <Modal
          visible={showActionMenu}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActionMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowActionMenu(false)}
          >
            <View style={styles.actionMenu}>
              <Text style={styles.actionMenuTitle}>
                What action for "{selectedWordId && selectedWordId.split('_')[1]}"?
              </Text>

              <TouchableOpacity
                style={styles.actionOption}
                onPress={() => handleActionSelect('define')}
              >
                <Text style={styles.actionOptionText}>📝 Define</Text>
                <Text style={styles.actionOptionDesc}>Student writes definition</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionOption}
                onPress={() => handleActionSelect('illustrate')}
              >
                <Text style={styles.actionOptionText}>🖼️ Illustrate</Text>
                <Text style={styles.actionOptionDesc}>Student selects image</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionOption}
                onPress={() => handleActionSelect('fill')}
              >
                <Text style={styles.actionOptionText}>✏️ Fill Blanks</Text>
                <Text style={styles.actionOptionDesc}>Student fills hidden letters</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionClose}
                onPress={() => setShowActionMenu(false)}
              >
                <Text style={styles.actionCloseText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.clearButton} onPress={handleClearParagraph}>
            <Text style={styles.clearButtonText}>Clear</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.loadButton,
              !paragraph.trim() && styles.loadButtonDisabled,
            ]}
            onPress={handleLoadParagraph}
            disabled={!paragraph.trim()}
          >
            <Text style={styles.loadButtonText}>Load Paragraph</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#2c3e50',
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  instructions: {
    marginHorizontal: 16,
    marginTop: 12,
    fontSize: 13,
    color: '#555',
    fontStyle: 'italic',
  },
  paragraphInput: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
    color: '#333',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  previewContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    maxHeight: 150,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 8,
  },
  sentenceContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  wordButton: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  wordButtonSelected: {
    backgroundColor: '#3498db',
    borderColor: '#2980b9',
  },
  wordText: {
    fontSize: 13,
    color: '#333',
  },
  wordTextSelected: {
    color: '#fff',
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  actionMenu: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 20,
    paddingBottom: 30,
  },
  actionMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  actionOption: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  actionOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  actionOptionDesc: {
    fontSize: 12,
    color: '#777',
  },
  actionClose: {
    marginTop: 16,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
  },
  actionCloseText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#555',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  clearButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  loadButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#3498db',
    borderRadius: 6,
    alignItems: 'center',
  },
  loadButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#95a5a6',
  },
  loadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
});
