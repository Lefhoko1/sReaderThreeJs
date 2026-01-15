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
import { ParagraphEditor } from './ParagraphEditor';
import { ActionConfigurator } from './ActionConfigurator';

interface ReadingAssignmentCreationProps {
  tutorId: string;
  subjectId: string;
  onAssignmentCreated?: () => void;
  onClose: () => void;
}

/**
 * ReadingAssignmentCreation Component
 * Comprehensive assignment creation workflow:
 * 1. Load paragraph
 * 2. Assign actions to words
 * 3. Configure each action (define, illustrate, fill)
 * 4. Set assignment metadata
 * 5. Review and save
 */
export const ReadingAssignmentCreation = observer(
  ({
    tutorId,
    subjectId,
    onAssignmentCreated,
    onClose,
  }: ReadingAssignmentCreationProps): React.ReactElement => {
    const [step, setStep] = useState<'title' | 'paragraph' | 'actions' | 'metadata' | 'review'>(
      'title'
    );
    const [showParagraphEditor, setShowParagraphEditor] = useState(false);
    const [showActionMenu, setShowActionMenu] = useState(false);
    const [showActionConfigurator, setShowActionConfigurator] = useState(false);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [currentWordId, setCurrentWordId] = useState<string | null>(null);
    const [currentWordText, setCurrentWordText] = useState<string>('');
    const [currentActionType, setCurrentActionType] = useState<'define' | 'illustrate' | 'fill' | null>(null);

    const vm = readingAssignmentViewModel;

    const handleSetTitle = (title: string) => {
      vm.setFormTitle(title);
    };

    const handleOpenParagraphEditor = () => {
      setShowParagraphEditor(true);
    };

    const handleParagraphLoaded = (paragraph: string) => {
      setShowParagraphEditor(false);
      setStep('actions');
    };

    const handleWordActionSelect = (wordId: string) => {
      console.log('[START] handleWordActionSelect called with wordId:', wordId);
      
      // Check if action already assigned
      const content = vm.formData.content;
      console.log('[DEBUG] Content:', content);
      
      if (content && content.sentences) {
        const parts = wordId.split('_');
        const sentenceIdx = parseInt(parts[0].substring(1));
        const wordIdx = parseInt(parts[1].substring(1));
        const word = content.sentences[sentenceIdx]?.words?.[wordIdx];

        console.log('[DEBUG] Word clicked:', { wordId, sentenceIdx, wordIdx, word, hasAction: word?.action });

        if (word && word.action) {
          // Show action selection menu for editing/deleting
          console.log('[DEBUG] Word already has action, showing options');
          setCurrentWordId(wordId);
          setCurrentWordText(word.text || word.wordText || 'word');
          setShowActionMenu(true);
          return;
        }
      }

      // Show action selection menu
      console.log('[DEBUG] Showing action selection menu for word:', wordId);
      setCurrentWordId(wordId);
      if (content && content.sentences) {
        const parts = wordId.split('_');
        const sentenceIdx = parseInt(parts[0].substring(1));
        const wordIdx = parseInt(parts[1].substring(1));
        const word = content.sentences[sentenceIdx]?.words?.[wordIdx];
        setCurrentWordText(word?.text || word?.wordText || 'word');
      }
      setShowActionMenu(true);
    };

    const handleActionSaved = (actionData: any) => {
      if (currentWordId) {
        const content = vm.formData.content;
        console.log('[handleActionSaved] Saving action:', { wordId: currentWordId, actionData });
        
        // Get the word indices
        const parts = currentWordId.split('_');
        const sentenceIdx = parseInt(parts[0].substring(1));
        const wordIdx = parseInt(parts[1].substring(1));
        
        // Create a deep copy of the content with updated word
        const updatedSentences = content.sentences.map((sentence: any, sIdx: number) => {
          if (sIdx === sentenceIdx) {
            return {
              ...sentence,
              words: sentence.words.map((word: any, wIdx: number) => {
                if (wIdx === wordIdx) {
                  console.log('[handleActionSaved] Updating word action:', { wordId: currentWordId, action: actionData });
                  return { ...word, action: actionData };
                }
                return word;
              }),
            };
          }
          return sentence;
        });
        
        const updatedContent = { ...content, sentences: updatedSentences };
        vm.setFormContent(updatedContent);
        
        console.log('[handleActionSaved] Action saved, words with actions:', vm.getWordsWithActions(updatedContent));
      }
      setShowActionConfigurator(false);
      setCurrentWordId(null);
      setCurrentWordText('');
      setCurrentActionType(null);
    };

    const getWordsWithActions = () => {
      return vm.getWordsWithActions(vm.formData.content);
    };

    const handleCreateAssignment = async () => {
      if (!vm.formData.title.trim()) {
        Alert.alert('Error', 'Please enter a title');
        return;
      }

      if (!vm.formData.content) {
        Alert.alert('Error', 'Please load a paragraph');
        return;
      }

      const wordsWithActions = getWordsWithActions();
      if (wordsWithActions.length === 0) {
        Alert.alert('Error', 'Please assign at least one action to a word');
        return;
      }

      const success = await vm.createAssignment(tutorId, subjectId);

      if (success) {
        Alert.alert('Success', 'Assignment created successfully!', [
          {
            text: 'OK',
            onPress: () => {
              vm.resetForm();
              onAssignmentCreated?.();
              onClose();
            },
          },
        ]);
      } else {
        Alert.alert('Error', vm.error || 'Failed to create assignment');
      }
    };

    const renderTitleStep = () => (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>📌 Assignment Title</Text>
        <TextInput
          style={styles.titleInput}
          placeholder="e.g., Chapter 3 - Vocabulary Assignment"
          value={vm.formData.title}
          onChangeText={handleSetTitle}
          placeholderTextColor="#999"
        />
        <TouchableOpacity
          style={[styles.nextButton, !vm.formData.title.trim() && styles.buttonDisabled]}
          onPress={() => setStep('paragraph')}
          disabled={!vm.formData.title.trim()}
        >
          <Text style={styles.nextButtonText}>Next: Load Paragraph</Text>
        </TouchableOpacity>
      </View>
    );

    const renderParagraphStep = () => (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>📖 Load Paragraph</Text>

        {vm.formData.content ? (
          <View style={styles.contentBox}>
            <Text style={styles.contentLabel}>Paragraph Loaded ✓</Text>
            <Text style={styles.contentPreview} numberOfLines={3}>
              {vm.formData.content.originalParagraph}
            </Text>
            <TouchableOpacity
              style={styles.changeButton}
              onPress={handleOpenParagraphEditor}
            >
              <Text style={styles.changeButtonText}>Change Paragraph</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <TouchableOpacity
            style={styles.loadButton}
            onPress={handleOpenParagraphEditor}
          >
            <Text style={styles.loadButtonText}>📝 Load or Paste Paragraph</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.nextButton, !vm.formData.content && styles.buttonDisabled]}
          onPress={() => setStep('actions')}
          disabled={!vm.formData.content}
        >
          <Text style={styles.nextButtonText}>Next: Assign Actions</Text>
        </TouchableOpacity>
      </View>
    );

    const renderActionsStep = () => {
      const wordsWithActions = getWordsWithActions();

      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>✏️ Assign Word Actions</Text>

          <Text style={styles.sectionDesc}>
            Click words in the paragraph to assign actions (define, illustrate, fill)
          </Text>

          {vm.formData.content && (
            <View style={styles.paragraphDisplay}>
              {vm.formData.content.sentences && vm.formData.content.sentences.length > 0 ? (
                vm.formData.content.sentences.map((sentence: any) => (
                  <View key={sentence.sentenceId} style={styles.sentenceDisplay}>
                    {sentence.words && sentence.words.length > 0 ? (
                      sentence.words.map((word: any) => {
                        console.log('[DEBUG] Rendering word:', word);
                        const hasAction = word.action !== null;
                        return (
                          <TouchableOpacity
                            key={word.wordId}
                            activeOpacity={0.7}
                            style={[
                              styles.wordDisplay,
                              hasAction && styles.wordDisplayActive,
                            ]}
                            onPress={() => {
                              console.log('[DEBUG] TouchableOpacity pressed for word:', word.wordId);
                              handleWordActionSelect(word.wordId);
                            }}
                          >
                            <Text
                              style={[
                                styles.wordDisplayText,
                                hasAction && styles.wordDisplayTextActive,
                              ]}
                            >
                              {word.text || word.wordText || 'word'}
                            </Text>
                            {hasAction && (
                              <Text style={styles.actionBadge}>
                                {word.action.type[0].toUpperCase()}
                              </Text>
                            )}
                          </TouchableOpacity>
                        );
                      })
                    ) : (
                      <Text style={{ color: '#999' }}>No words in sentence</Text>
                    )}
                  </View>
                ))
              ) : (
                <Text style={{ color: '#999' }}>No sentences in content</Text>
              )}
            </View>
          )}

          <View style={styles.statsBox}>
            <Text style={styles.statsText}>
              {wordsWithActions.length} word{wordsWithActions.length !== 1 ? 's' : ''} with actions
            </Text>
          </View>

          <TouchableOpacity
            style={[styles.nextButton, wordsWithActions.length === 0 && styles.buttonDisabled]}
            onPress={() => setStep('metadata')}
            disabled={wordsWithActions.length === 0}
          >
            <Text style={styles.nextButtonText}>Next: Assignment Details</Text>
          </TouchableOpacity>
        </View>
      );
    };

    const renderMetadataStep = () => (
      <View style={styles.stepContainer}>
        <Text style={styles.stepTitle}>⚙️ Assignment Details</Text>

        <View style={styles.metadataSection}>
          <Text style={styles.metadataLabel}>📅 Due Date (Optional)</Text>
          <TouchableOpacity 
            style={styles.dateButton}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={styles.dateButtonText}>
              {vm.formData.dueDate?.toLocaleDateString() || 'Set due date'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.metadataSection}>
          <Text style={styles.metadataLabel}>⏱️ Duration (minutes)</Text>
          <TextInput
            style={styles.metadataInput}
            placeholder="e.g., 30"
            keyboardType="number-pad"
            value={vm.formData.durationMinutes?.toString() || ''}
            onChangeText={(val) => vm.setFormDuration(parseInt(val) || 0)}
          />
        </View>

        <View style={styles.metadataSection}>
          <Text style={styles.metadataLabel}>🛠️ Tools Needed</Text>
          <TextInput
            style={styles.metadataInput}
            placeholder="e.g., Dictionary, Google Images (comma-separated)"
            value={vm.formData.tools.join(', ')}
            onChangeText={(val) => vm.setFormTools(val.split(',').map(s => s.trim()))}
          />
        </View>

        <View style={styles.metadataSection}>
          <Text style={styles.metadataLabel}>💬 Parent Encouragement Message</Text>
          <TextInput
            style={[styles.metadataInput, { height: 80 }]}
            placeholder="Optional message for parents..."
            multiline
            value={vm.formData.parentEncouragement || ''}
            onChangeText={(val) => vm.setFormParentEncouragement(val)}
          />
        </View>

        <TouchableOpacity
          style={styles.nextButton}
          onPress={() => setStep('review')}
        >
          <Text style={styles.nextButtonText}>Next: Review & Save</Text>
        </TouchableOpacity>
      </View>
    );

    const renderReviewStep = () => {
      const wordsWithActions = getWordsWithActions();

      return (
        <View style={styles.stepContainer}>
          <Text style={styles.stepTitle}>👁️ Review Assignment</Text>

          <View style={styles.reviewBox}>
            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Title</Text>
              <Text style={styles.reviewValue}>{vm.formData.title}</Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Paragraph</Text>
              <Text style={styles.reviewValue} numberOfLines={2}>
                {vm.formData.content?.originalParagraph}
              </Text>
            </View>

            <View style={styles.reviewItem}>
              <Text style={styles.reviewLabel}>Word Actions</Text>
              <Text style={styles.reviewValue}>
                {wordsWithActions.length} word{wordsWithActions.length !== 1 ? 's' : ''} assigned
              </Text>
            </View>

            {vm.formData.durationMinutes && (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Duration</Text>
                <Text style={styles.reviewValue}>{vm.formData.durationMinutes} minutes</Text>
              </View>
            )}

            {vm.formData.tools.length > 0 && (
              <View style={styles.reviewItem}>
                <Text style={styles.reviewLabel}>Tools</Text>
                <Text style={styles.reviewValue}>{vm.formData.tools.join(', ')}</Text>
              </View>
            )}
          </View>

          <View style={styles.buttonGroup}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setStep('metadata')}
            >
              <Text style={styles.editButtonText}>← Edit Details</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.createButton, vm.isLoading && styles.buttonDisabled]}
              onPress={handleCreateAssignment}
              disabled={vm.isLoading}
            >
              <Text style={styles.createButtonText}>
                {vm.isLoading ? 'Creating...' : '✓ Create Assignment'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    };

    return (
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Reading Assignment</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicator}>
          {['title', 'paragraph', 'actions', 'metadata', 'review'].map((s) => (
            <View
              key={s}
              style={[
                styles.stepDot,
                (['title', 'paragraph', 'actions', 'metadata', 'review'].indexOf(s) <
                  ['title', 'paragraph', 'actions', 'metadata', 'review'].indexOf(step) + 1) &&
                  styles.stepDotActive,
              ]}
            />
          ))}
        </View>

        {/* Content */}
        <ScrollView style={styles.content}>
          {step === 'title' && renderTitleStep()}
          {step === 'paragraph' && renderParagraphStep()}
          {step === 'actions' && renderActionsStep()}
          {step === 'metadata' && renderMetadataStep()}
          {step === 'review' && renderReviewStep()}
        </ScrollView>

        {/* Modals */}
        <Modal
          visible={showParagraphEditor}
          animationType="slide"
          onRequestClose={() => setShowParagraphEditor(false)}
        >
          <ParagraphEditor
            onParagraphLoaded={handleParagraphLoaded}
            onClose={() => setShowParagraphEditor(false)}
          />
        </Modal>

        {/* Action Selection Menu */}
        <Modal
          visible={showActionMenu && currentWordId !== null}
          transparent
          animationType="fade"
          onRequestClose={() => setShowActionMenu(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowActionMenu(false)}
          >
            <View style={styles.actionMenuContainer}>
              <Text style={styles.actionMenuTitle}>Select Action for "{currentWordText}"</Text>
              
              <TouchableOpacity
                style={styles.actionMenuOption}
                onPress={() => {
                  setCurrentActionType('define');
                  setShowActionMenu(false);
                  setShowActionConfigurator(true);
                }}
              >
                <Text style={styles.actionMenuOptionText}>📝 Define</Text>
                <Text style={styles.actionMenuOptionDesc}>Enter definition text</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionMenuOption}
                onPress={() => {
                  setCurrentActionType('illustrate');
                  setShowActionMenu(false);
                  setShowActionConfigurator(true);
                }}
              >
                <Text style={styles.actionMenuOptionText}>🖼️ Illustrate</Text>
                <Text style={styles.actionMenuOptionDesc}>Select 3 images</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionMenuOption}
                onPress={() => {
                  setCurrentActionType('fill');
                  setShowActionMenu(false);
                  setShowActionConfigurator(true);
                }}
              >
                <Text style={styles.actionMenuOptionText}>✏️ Fill Blanks</Text>
                <Text style={styles.actionMenuOptionDesc}>Select letters to hide</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.actionMenuCancel}
                onPress={() => setShowActionMenu(false)}
              >
                <Text style={styles.actionMenuCancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>

        <Modal
          visible={showActionConfigurator && currentWordId !== null && currentActionType !== null}
          animationType="slide"
          onRequestClose={() => setShowActionConfigurator(false)}
        >
          {currentWordId && currentActionType && (
            <ActionConfigurator
              wordId={currentWordId}
              wordText={currentWordText}
              actionType={currentActionType}
              onSave={handleActionSaved}
              onClose={() => setShowActionConfigurator(false)}
            />
          )}
        </Modal>

        {/* Date Picker Modal */}
        <Modal
          visible={showDatePicker}
          transparent
          animationType="slide"
          onRequestClose={() => setShowDatePicker(false)}
        >
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerCancel}>Cancel</Text>
                </TouchableOpacity>
                <Text style={styles.datePickerTitle}>Select Due Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={styles.datePickerDone}>Done</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.datePickerContent}>
                {/* Show calendar/date inputs */}
                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Month:</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="MM"
                    keyboardType="number-pad"
                    maxLength={2}
                    defaultValue={vm.formData.dueDate?.getMonth().toString().padStart(2, '0') || ''}
                    onChangeText={(val) => {
                      const date = vm.formData.dueDate || new Date();
                      if (val && !isNaN(Number(val))) {
                        const month = parseInt(val) - 1;
                        if (month >= 0 && month < 12) {
                          date.setMonth(month);
                          vm.setFormDueDate(new Date(date));
                        }
                      }
                    }}
                  />
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Day:</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="DD"
                    keyboardType="number-pad"
                    maxLength={2}
                    defaultValue={vm.formData.dueDate?.getDate().toString().padStart(2, '0') || ''}
                    onChangeText={(val) => {
                      const date = vm.formData.dueDate || new Date();
                      if (val && !isNaN(Number(val))) {
                        const day = parseInt(val);
                        if (day >= 1 && day <= 31) {
                          date.setDate(day);
                          vm.setFormDueDate(new Date(date));
                        }
                      }
                    }}
                  />
                </View>

                <View style={styles.dateInputContainer}>
                  <Text style={styles.dateLabel}>Year:</Text>
                  <TextInput
                    style={styles.dateInput}
                    placeholder="YYYY"
                    keyboardType="number-pad"
                    maxLength={4}
                    defaultValue={vm.formData.dueDate?.getFullYear().toString() || ''}
                    onChangeText={(val) => {
                      const date = vm.formData.dueDate || new Date();
                      if (val && !isNaN(Number(val))) {
                        date.setFullYear(parseInt(val));
                        vm.setFormDueDate(new Date(date));
                      }
                    }}
                  />
                </View>

                {vm.formData.dueDate && (
                  <View style={styles.datePreview}>
                    <Text style={styles.datePreviewLabel}>Selected:</Text>
                    <Text style={styles.datePreviewValue}>
                      {vm.formData.dueDate.toLocaleDateString()}
                    </Text>
                  </View>
                )}

                <TouchableOpacity
                  style={styles.dateClearButton}
                  onPress={() => {
                    vm.setFormDueDate(undefined);
                    setShowDatePicker(false);
                  }}
                >
                  <Text style={styles.dateClearButtonText}>Clear Date</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
  stepIndicator: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#bdc3c7',
  },
  stepDotActive: {
    backgroundColor: '#3498db',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  stepContainer: {
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#666',
    marginBottom: 12,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  nextButton: {
    paddingVertical: 12,
    backgroundColor: '#3498db',
    borderRadius: 6,
    alignItems: 'center',
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  buttonDisabled: {
    opacity: 0.5,
    backgroundColor: '#95a5a6',
  },
  contentBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#d5dbdb',
  },
  contentLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#27ae60',
    marginBottom: 6,
  },
  contentPreview: {
    fontSize: 13,
    color: '#333',
    marginBottom: 10,
  },
  changeButton: {
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
  },
  changeButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#555',
  },
  loadButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    alignItems: 'center',
    marginBottom: 12,
  },
  loadButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
  },
  paragraphDisplay: {
    backgroundColor: '#fff',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  sentenceDisplay: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  wordDisplay: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
    backgroundColor: '#ecf0f1',
    borderRadius: 4,
  },
  wordDisplayActive: {
    backgroundColor: '#3498db',
  },
  wordDisplayText: {
    fontSize: 13,
    color: '#333',
  },
  wordDisplayTextActive: {
    color: '#fff',
    fontWeight: '500',
  },
  actionBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#fff',
  },
  statsBox: {
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 12,
  },
  statsText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  metadataSection: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  metadataLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 6,
  },
  metadataInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 13,
    color: '#333',
  },
  dateButton: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 4,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dateButtonText: {
    fontSize: 13,
    color: '#333',
  },
  reviewBox: {
    backgroundColor: '#fff',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  reviewItem: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  reviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 14,
    color: '#2c3e50',
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 10,
  },
  editButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    alignItems: 'center',
  },
  editButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  createButton: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: '#27ae60',
    borderRadius: 6,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: 16,
  },
  actionMenuContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  actionMenuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  actionMenuOption: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
  },
  actionMenuOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  actionMenuOptionDesc: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  actionMenuCancel: {
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  actionMenuCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
  },
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ecf0f1',
  },
  datePickerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  datePickerCancel: {
    fontSize: 14,
    color: '#666',
    paddingHorizontal: 8,
  },
  datePickerDone: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3498db',
    paddingHorizontal: 8,
  },
  datePickerContent: {
    padding: 20,
  },
  dateInputContainer: {
    marginBottom: 16,
  },
  dateLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 6,
  },
  dateInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
  },
  datePreview: {
    backgroundColor: '#f0f8ff',
    borderRadius: 6,
    padding: 12,
    marginTop: 16,
    marginBottom: 12,
  },
  datePreviewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
  },
  datePreviewValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginTop: 4,
  },
  dateClearButton: {
    backgroundColor: '#ffebee',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  dateClearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#c0392b',
  },
});
