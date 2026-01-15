import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import * as ImagePicker from 'expo-image-picker';
import supabase from '@/src/data/supabase/supabaseClient';

interface ActionConfiguratorProps {
  wordId: string;
  wordText: string;
  actionType: 'define' | 'illustrate' | 'fill';
  onSave: (actionData: any) => void;
  onClose: () => void;
}

/**
 * ActionConfigurator Component
 * Allows tutors to configure word actions based on type:
 * - Define: Enter definition text
 * - Illustrate: Select/upload 3 images
 * - Fill: Select letters to hide
 */
/**
 * Randomizes words in the definition for student to rearrange
 */
const randomizeDefinitionWords = (text: string): string[] => {
  const words = text.trim().split(/\s+/);
  // Fisher-Yates shuffle
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }
  return words;
};

export const ActionConfigurator = observer(
  ({ wordId, wordText, actionType, onSave, onClose }: ActionConfiguratorProps) => {
    const [definitionText, setDefinitionText] = useState('');
    const [randomizedWords, setRandomizedWords] = useState<string[]>([]);
    const [selectedImages, setSelectedImages] = useState<string[]>([]);
    const [lettersToHide, setLettersToHide] = useState<string[]>([]);
    const [showImagePicker, setShowImagePicker] = useState(false);
    const [showLetterSelector, setShowLetterSelector] = useState(false);
    const [showImageInputModal, setShowImageInputModal] = useState(false);
    const [imageUrlInput, setImageUrlInput] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [previewFile, setPreviewFile] = useState<{ uri: string; name: string; type: string; fileSize?: number } | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>('');

    console.log('[ActionConfigurator] Rendering with props:', {
      wordId,
      wordText,
      actionType,
      onSaveExists: !!onSave,
      onCloseExists: !!onClose,
    });

    console.log('[ActionConfigurator] Current modal state:', {
      showImageInputModal,
      isUploading,
      previewUrlExists: !!previewUrl,
      previewFileExists: !!previewFile,
      previewUrlLength: previewUrl?.length || 0,
    });

    const handleSaveDefinition = () => {
      if (!definitionText.trim()) {
        Alert.alert('Error', 'Please enter a definition');
        return;
      }

      // Generate randomized version for students
      const randomized = randomizeDefinitionWords(definitionText);
      
      const actionData = {
        type: 'define',
        data: {
          definition: definitionText.trim(),
          randomizedWords: randomized,
        },
      };

      console.log('[ActionConfigurator] Definition saved:', actionData);
      console.log('[ActionConfigurator] Calling onSave with:', actionData);
      
      onSave(actionData);
      console.log('[ActionConfigurator] onSave called, closing modal');
    };

    const handleSaveIllustration = () => {
      if (selectedImages.length !== 3) {
        Alert.alert('Error', `Please select exactly 3 images (currently ${selectedImages.length})`);
        return;
      }

      const actionData = {
        type: 'illustrate',
        data: {
          images: selectedImages.map((url, idx) => ({
            url,
            source: 'url' as const,
            altText: `Image ${idx + 1} for word: ${wordText}`,
          })),
        },
      };

      console.log('[ActionConfigurator] Illustrations saved:', actionData);
      console.log('[ActionConfigurator] Calling onSave');
      
      onSave(actionData);
    };

    const handleSaveFill = () => {
      if (lettersToHide.length === 0) {
        Alert.alert('Error', 'Please select at least one letter to hide');
        return;
      }

      const hiddenCount = wordText
        .toUpperCase()
        .split('')
        .filter(letter => lettersToHide.includes(letter)).length;

      const actionData = {
        type: 'fill',
        data: {
          lettersToHide: lettersToHide.sort(),
          hiddenLetterCount: hiddenCount,
          originalWord: wordText,
        },
      };

      console.log('[ActionConfigurator] Fill configuration saved:', actionData);
      console.log('[ActionConfigurator] Calling onSave');
      
      onSave(actionData);
    };

    const handleAddImage = () => {
      if (selectedImages.length >= 3) {
        Alert.alert('Info', 'You can only select 3 images');
        return;
      }
      setShowImageInputModal(true);
    };

    const handleConfirmImageUrl = () => {
      const url = imageUrlInput.trim();
      if (!url) {
        Alert.alert('Error', 'Please enter an image URL');
        return;
      }
      console.log('[ActionConfigurator] Image added:', url);
      setSelectedImages([...selectedImages, url]);
      setImageUrlInput('');
      setShowImageInputModal(false);
    };

    const handleUploadImage = async (imageData: { uri: string; name: string; type: string; fileSize?: number }) => {
      console.log('[ActionConfigurator] handleUploadImage called with:', imageData?.name, imageData?.type);
      
      if (!imageData) {
        console.error('[ActionConfigurator] No image data provided');
        Alert.alert('Error', 'No image selected');
        return;
      }

      try {
        console.log('[ActionConfigurator] Starting upload process...');
        setIsUploading(true);
        
        // Validate file type
        if (!imageData.type.startsWith('image/')) {
          console.error('[ActionConfigurator] Invalid MIME type:', imageData.type);
          Alert.alert('Error', 'Please select an image file');
          return;
        }

        // Create unique filename with timestamp
        const timestamp = Date.now();
        const randomStr = Math.random().toString(36).substring(2, 8);
        const filename = `assignment-${timestamp}-${randomStr}-${imageData.name}`;

        console.log('[ActionConfigurator] Created filename:', filename);
        console.log('[ActionConfigurator] Fetching image from URI:', imageData.uri);

        // Fetch the image as a blob
        const response = await fetch(imageData.uri);
        console.log('[ActionConfigurator] Fetch response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }
        
        const blob = await response.blob();
        console.log('[ActionConfigurator] Blob created, size:', blob.size, 'type:', blob.type);

        console.log('[ActionConfigurator] Uploading to Supabase...');
        
        // Upload to Supabase storage
        const { data, error } = await supabase.storage
          .from('MyStorageImages')
          .upload(`AssignmentImages/${filename}`, blob);

        console.log('[ActionConfigurator] Supabase upload response - data:', data, 'error:', error);

        if (error) {
          console.error('[ActionConfigurator] Supabase upload error:', error);
          Alert.alert('Upload Error', error.message || 'Failed to upload image');
          return;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('MyStorageImages')
          .getPublicUrl(`AssignmentImages/${filename}`);

        console.log('[ActionConfigurator] Public URL data:', publicUrlData);

        const publicUrl = publicUrlData?.publicUrl;

        if (!publicUrl) {
          console.error('[ActionConfigurator] No public URL returned');
          Alert.alert('Error', 'Failed to get image URL');
          return;
        }

        console.log('[ActionConfigurator] Image uploaded successfully:', publicUrl);

        // Add to selected images
        setSelectedImages([...selectedImages, publicUrl]);
        setShowImageInputModal(false);
        setImageUrlInput('');
        setPreviewUrl('');
        setPreviewFile(null);
        
        Alert.alert('Success', 'Image uploaded successfully!');

      } catch (error) {
        console.error('[ActionConfigurator] Upload exception:', error);
        console.error('[ActionConfigurator] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : 'No stack',
        });
        Alert.alert('Error', error instanceof Error ? error.message : 'Failed to upload image');
      } finally {
        setIsUploading(false);
      }
    };

    const handlePickImage = async () => {
      try {
        console.log('[ActionConfigurator] Opening image picker...');
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: false,
          aspect: [4, 3],
          quality: 0.8,
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          console.log('[ActionConfigurator] Image selected:', asset.fileName, asset.type, asset.fileSize);
          
          const imageData = {
            uri: asset.uri,
            name: asset.fileName || `image-${Date.now()}.jpg`,
            type: asset.mimeType || 'image/jpeg', // Use mimeType or default to image/jpeg
            fileSize: asset.fileSize,
          };
          
          console.log('[ActionConfigurator] Image data created:', imageData);
          setPreviewFile(imageData);
          setPreviewUrl(asset.uri);
          console.log('[ActionConfigurator] Preview set:', imageData.name);
        }
      } catch (error) {
        console.error('[ActionConfigurator] Image picker error:', error);
        Alert.alert('Error', 'Failed to pick image');
      }
    };

    const handleConfirmUpload = async () => {
      console.log('[ActionConfigurator] handleConfirmUpload called, previewFile:', previewFile?.name);
      if (previewFile) {
        await handleUploadImage(previewFile);
        // Clear preview after upload completes
        setPreviewFile(null);
        setPreviewUrl('');
      }
    };

    const handleCancelPreview = () => {
      setPreviewFile(null);
      setPreviewUrl('');
    };

    const handleRemoveImage = (index: number) => {
      setSelectedImages(selectedImages.filter((_, i) => i !== index));
    };

    const handleLetterToggle = (letter: string) => {
      if (lettersToHide.includes(letter)) {
        setLettersToHide(lettersToHide.filter(l => l !== letter));
      } else {
        setLettersToHide([...lettersToHide, letter]);
      }
    };

    const uniqueLetters = Array.from(new Set(wordText.toUpperCase().split('')));

    return (
      <View style={styles.container}>
        {/* Image Input Modal */}
        <Modal
          visible={showImageInputModal}
          transparent
          animationType="fade"
          onRequestClose={() => !isUploading && setShowImageInputModal(false)}
        >
          <TouchableOpacity
            style={styles.imageModalOverlay}
            activeOpacity={1}
            onPress={() => !isUploading && setShowImageInputModal(false)}
          >
            <View style={styles.imageModalContent}>
              <Text style={styles.imageModalTitle}>📷 Add Image</Text>

              {previewUrl ? (
                // Preview Mode
                <View style={styles.previewContainer}>
                  <Image
                    source={{ uri: previewUrl }}
                    style={styles.previewImage as any}
                  />
                  <View style={styles.previewInfo}>
                    <Text style={styles.previewFileName}>{previewFile?.name}</Text>
                    {previewFile?.fileSize && (
                      <Text style={styles.previewFileSize}>
                        {(previewFile.fileSize / 1024).toFixed(2)} KB
                      </Text>
                    )}
                  </View>

                  {isUploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator size="large" color="#3498db" />
                      <Text style={styles.uploadingText}>Uploading image...</Text>
                    </View>
                  )}

                  {/* Preview Action Buttons */}
                  <View style={styles.imageModalButtons}>
                    <TouchableOpacity
                      style={styles.imageModalCancel}
                      onPress={handleCancelPreview}
                      disabled={isUploading}
                    >
                      <Text style={styles.imageModalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.imageModalConfirm,
                        isUploading && styles.imageModalConfirmDisabled,
                      ]}
                      onPress={handleConfirmUpload}
                      disabled={isUploading}
                    >
                      <Text style={styles.imageModalConfirmText}>
                        {isUploading ? 'Uploading...' : 'Upload'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                // File Selection Mode
                <>
                  {/* File Upload Option - Using HTML button directly */}
                  <TouchableOpacity
                    onPress={handlePickImage}
                    disabled={isUploading}
                    style={styles.uploadOptionButton}
                  >
                    <Text style={styles.uploadOptionIcon}>📁</Text>
                    <Text style={styles.uploadOptionText}>Upload from Device</Text>
                    <Text style={styles.uploadOptionDesc}>Tap to select an image file</Text>
                  </TouchableOpacity>

                  <Text style={styles.dividerText}>or</Text>

                  {/* URL Input Option */}
                  <View style={styles.urlInputSection}>
                    <Text style={styles.urlInputLabel}>Enter Image URL</Text>
                    <TextInput
                      style={styles.imageUrlInput}
                      placeholder="https://example.com/image.jpg"
                      value={imageUrlInput}
                      onChangeText={setImageUrlInput}
                      placeholderTextColor="#999"
                      editable={!isUploading}
                    />
                  </View>

                  {/* Action Buttons */}
                  <View style={styles.imageModalButtons}>
                    <TouchableOpacity
                      style={styles.imageModalCancel}
                      onPress={() => {
                        setImageUrlInput('');
                        setShowImageInputModal(false);
                      }}
                    >
                      <Text style={styles.imageModalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.imageModalConfirm,
                        !imageUrlInput.trim() && styles.imageModalConfirmDisabled,
                      ]}
                      onPress={handleConfirmImageUrl}
                      disabled={!imageUrlInput.trim()}
                    >
                      <Text style={styles.imageModalConfirmText}>Add URL</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Configure Action</Text>
            <Text style={styles.wordDisplay}>Word: "{wordText}"</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.content}>
          {actionType === 'define' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>📝 Definition</Text>
              <Text style={styles.sectionDesc}>
                Enter a definition for this word. Students will rearrange randomized words to reconstruct it.
              </Text>

              <TextInput
                style={styles.definitionInput}
                placeholder="Enter definition..."
                multiline
                value={definitionText}
                onChangeText={setDefinitionText}
                placeholderTextColor="#999"
              />

              {/* Preview of randomized words */}
              {definitionText.trim().length > 0 && (
                <View style={styles.previewSection}>
                  <Text style={styles.previewLabel}>📋 Student will see (randomized):</Text>
                  <View style={styles.randomizedWordsContainer}>
                    {randomizeDefinitionWords(definitionText).map((word, idx) => (
                      <View key={idx} style={styles.randomizedWord}>
                        <Text style={styles.randomizedWordText}>{word}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              )}

              <TouchableOpacity
                style={[styles.saveButton, !definitionText.trim() && styles.saveButtonDisabled]}
                onPress={handleSaveDefinition}
                disabled={!definitionText.trim()}
              >
                <Text style={styles.saveButtonText}>Save Definition</Text>
              </TouchableOpacity>
            </View>
          )}

          {actionType === 'illustrate' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>🖼️ Illustrations</Text>
              <Text style={styles.sectionDesc}>
                Select 3 images for students to choose from ({selectedImages.length}/3)
              </Text>

              {/* Image Preview */}
              <View style={styles.imageGrid}>
                {selectedImages.map((url, idx) => (
                  <View key={idx} style={styles.imageContainer}>
                    <Image source={{ uri: url }} style={styles.image} />
                    <TouchableOpacity
                      style={styles.removeImageButton}
                      onPress={() => handleRemoveImage(idx)}
                    >
                      <Text style={styles.removeImageText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ))}

                {selectedImages.length < 3 && (
                  <TouchableOpacity
                    style={styles.addImageButton}
                    onPress={handleAddImage}
                  >
                    <Text style={styles.addImageButtonText}>+ Add Image</Text>
                  </TouchableOpacity>
                )}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  selectedImages.length !== 3 && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveIllustration}
                disabled={selectedImages.length !== 3}
              >
                <Text style={styles.saveButtonText}>Save Illustrations</Text>
              </TouchableOpacity>
            </View>
          )}

          {actionType === 'fill' && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>✏️ Fill Blanks</Text>
              <Text style={styles.sectionDesc}>
                Select which letters to hide (students fill them in)
              </Text>

              {/* Word Display */}
              <View style={styles.wordPreview}>
                <Text style={styles.wordPreviewText}>
                  {wordText.toUpperCase().split('').map((letter, idx) => (
                    <Text
                      key={idx}
                      style={[
                        styles.letterDisplay,
                        lettersToHide.includes(letter.toUpperCase()) &&
                          styles.letterDisplayHidden,
                      ]}
                    >
                      {lettersToHide.includes(letter.toUpperCase()) ? '_' : letter}
                    </Text>
                  ))}
                </Text>
              </View>

              {/* Letter Selection */}
              <Text style={styles.letterSelectLabel}>Tap letters to hide:</Text>
              <View style={styles.letterGrid}>
                {uniqueLetters.map((letter) => (
                  <TouchableOpacity
                    key={letter}
                    style={[
                      styles.letterButton,
                      lettersToHide.includes(letter) && styles.letterButtonSelected,
                    ]}
                    onPress={() => handleLetterToggle(letter)}
                  >
                    <Text
                      style={[
                        styles.letterButtonText,
                        lettersToHide.includes(letter) &&
                          styles.letterButtonTextSelected,
                      ]}
                    >
                      {letter}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  lettersToHide.length === 0 && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveFill}
                disabled={lettersToHide.length === 0}
              >
                <Text style={styles.saveButtonText}>Save Fill Configuration</Text>
              </TouchableOpacity>
            </View>
          )}
        </ScrollView>
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
    marginBottom: 4,
  },
  wordDisplay: {
    fontSize: 12,
    color: '#bdc3c7',
    fontStyle: 'italic',
  },
  closeButton: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '300',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 12,
    color: '#777',
    marginBottom: 16,
  },
  definitionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#333',
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: 12,
  },
  previewSection: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db',
    borderRadius: 6,
    padding: 12,
    marginBottom: 12,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2980b9',
    marginBottom: 8,
  },
  randomizedWordsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  randomizedWord: {
    backgroundColor: '#e8f4f8',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#3498db',
  },
  randomizedWordText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#2980b9',
  },
  imageGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 10,
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    overflow: 'hidden',
    aspectRatio: 1,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  addImageButton: {
    flex: 1,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#bdc3c7',
    borderStyle: 'dashed',
  },
  addImageButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
  },
  wordPreview: {
    backgroundColor: '#f8f9fa',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 16,
    marginBottom: 12,
    alignItems: 'center',
  },
  wordPreviewText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    letterSpacing: 4,
  },
  letterDisplay: {
    color: '#2c3e50',
    marginHorizontal: 2,
  },
  letterDisplayHidden: {
    color: '#e74c3c',
  },
  letterSelectLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    marginBottom: 10,
  },
  letterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  letterButton: {
    width: '22%',
    aspectRatio: 1,
    backgroundColor: '#ecf0f1',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bdc3c7',
  },
  letterButtonSelected: {
    backgroundColor: '#e74c3c',
    borderColor: '#c0392b',
  },
  letterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2c3e50',
  },
  letterButtonTextSelected: {
    color: '#fff',
  },
  saveButton: {
    paddingVertical: 12,
    backgroundColor: '#27ae60',
    borderRadius: 6,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#95a5a6',
  },
  saveButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  imageModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '85%',
    maxWidth: 400,
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
  },
  imageUrlInput: {
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    marginBottom: 16,
    color: '#2c3e50',
  },
  imageModalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  imageModalCancel: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#95a5a6',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  imageModalCancelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#7f8c8d',
  },
  imageModalConfirm: {
    flex: 1,
    backgroundColor: '#3498db',
    borderRadius: 6,
    paddingVertical: 10,
    alignItems: 'center',
  },
  imageModalConfirmDisabled: {
    opacity: 0.5,
    backgroundColor: '#95a5a6',
  },
  imageModalConfirmText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  uploadingContainer: {
    alignItems: 'center',
    paddingVertical: 30,
  },
  uploadingText: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 12,
    fontWeight: '500',
  },
  uploadOptionButton: {
    backgroundColor: '#f8f9fa',
    borderWidth: 2,
    borderColor: '#3498db',
    borderStyle: 'dashed',
    borderRadius: 8,
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  uploadOptionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  uploadOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 4,
  },
  uploadOptionDesc: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  dividerText: {
    textAlign: 'center',
    color: '#bdc3c7',
    fontSize: 12,
    fontWeight: '600',
    marginVertical: 12,
  },
  urlInputSection: {
    marginBottom: 16,
  },
  urlInputLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
  },
  previewContainer: {
    flex: 1,
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewImage: {
    width: '100%',
    height: 280,
    borderRadius: 8,
    resizeMode: 'contain',
    marginVertical: 16,
    backgroundColor: '#f5f5f5',
    objectFit: 'contain',
  },
  previewInfo: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 6,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  previewFileName: {
    fontSize: 13,
    fontWeight: '500',
    color: '#2c3e50',
    marginBottom: 4,
  },
  previewFileSize: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    zIndex: 10,
  },
});
