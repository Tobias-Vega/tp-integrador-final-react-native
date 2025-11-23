import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/contexts/NotesContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note } from '@/types/note';
import { Ionicons } from '@expo/vector-icons';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native';

export default function EditNoteScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNoteById, updateNote } = useNotes();
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUri, setImageUri] = useState('');
  const [showCamera, setShowCamera] = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState<Note | undefined>(undefined);

  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');
  const borderColor = useThemeColor({ light: '#ddd', dark: '#444' }, 'text');

  let cameraRef: CameraView | null = null;

  useEffect(() => {
    if (id) {
      const foundNote = getNoteById(id);
      if (foundNote) {
        setNote(foundNote);
        setTitle(foundNote.title);
        setDescription(foundNote.description);
        setImageUri(foundNote.imageUri);
      }
      setLoading(false);
    }
  }, [id]);

  const handleOpenCamera = async () => {
    if (!permission) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso para usar la cámara');
        return;
      }
    }

    if (!permission?.granted) {
      const { status } = await requestPermission();
      if (status !== 'granted') {
        Alert.alert('Permiso denegado', 'Se necesita permiso para usar la cámara');
        return;
      }
    }

    setShowCamera(true);
  };

  const handleTakePicture = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync();
        if (photo) {
          setImageUri(photo.uri);
          setShowCamera(false);
        }
      } catch (error) {
        Alert.alert('Error', 'No se pudo tomar la foto');
      }
    }
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'El título es obligatorio');
      return;
    }

    if (!description.trim()) {
      Alert.alert('Error', 'La descripción es obligatoria');
      return;
    }

    if (!imageUri) {
      Alert.alert('Error', 'Debes tener una imagen');
      return;
    }

    if (!id) {
      Alert.alert('Error', 'ID de nota no válido');
      return;
    }

    setSaving(true);
    try {
      await updateNote(id, {
        title: title.trim(),
        description: description.trim(),
        imageUri,
      });

      Alert.alert('Éxito', 'Nota actualizada exitosamente', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar la nota');
    } finally {
      setSaving(false);
    }
  };

  const toggleCameraFacing = () => {
    setCameraFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!note) {
    return (
      <ThemedView style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#999" />
        <ThemedText style={styles.errorText}>Nota no encontrada</ThemedText>
        <TouchableOpacity
          style={[styles.button, { backgroundColor: tintColor }]}
          onPress={() => router.back()}
        >
          <ThemedText style={styles.buttonText}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  if (showCamera) {
    return (
      <View style={styles.cameraContainer}>
        <CameraView
          style={styles.camera}
          facing={cameraFacing}
          ref={(ref) => { cameraRef = ref; }}
        >
          <View style={styles.cameraControls}>
            <TouchableOpacity
              style={styles.cameraButton}
              onPress={() => setShowCamera(false)}
            >
              <Ionicons name="close" size={32} color="white" />
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.captureButton}
              onPress={handleTakePicture}
            >
              <View style={styles.captureButtonInner} />
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cameraButton}
              onPress={toggleCameraFacing}
            >
              <Ionicons name="camera-reverse" size={32} color="white" />
            </TouchableOpacity>
          </View>
        </CameraView>
      </View>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <ThemedText type="title">Editar Nota</ThemedText>
        </View>

        <View style={styles.imageSection}>
          {imageUri ? (
            <View>
              <Image source={{ uri: imageUri }} style={styles.previewImage} contentFit="cover" />
              <View style={styles.imageButtons}>
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: '#007AFF' }]}
                  onPress={handleOpenCamera}
                >
                  <Ionicons name="camera" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.imageButtonText}>Cambiar</ThemedText>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.imageButton, { backgroundColor: '#666' }]}
                  onPress={handlePickImage}
                >
                  <Ionicons name="images" size={20} color="#FFFFFF" />
                  <ThemedText style={styles.imageButtonText}>Galería</ThemedText>
                </TouchableOpacity>
              </View>
            </View>
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={80} color="#999" />
              <ThemedText style={styles.noImageText}>Sin imagen</ThemedText>
            </View>
          )}
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Título *</ThemedText>
            <TextInput
              style={[styles.input, { backgroundColor, borderColor, color: '#FFFFFF' }]}
              value={title}
              onChangeText={setTitle}
              placeholder="Ingresa el título de la nota"
              placeholderTextColor="#999"
              maxLength={100}
            />
          </View>

          <View style={styles.inputGroup}>
            <ThemedText style={styles.label}>Descripción *</ThemedText>
            <TextInput
              style={[styles.textArea, { backgroundColor, borderColor, color: '#FFFFFF' }]}
              value={description}
              onChangeText={setDescription}
              placeholder="Describe tu nota..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              maxLength={500}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.cancelButton, styles.actionButton]}
              onPress={() => router.back()}
              disabled={saving}
            >
              <ThemedText style={styles.buttonText}>Cancelar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.saveButton, styles.actionButton, { backgroundColor: '#007AFF' }]}
              onPress={handleSave}
              disabled={saving}
            >
              {saving ? (
                <ActivityIndicator color="white" />
              ) : (
                <ThemedText style={styles.buttonText}>Guardar</ThemedText>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    marginTop: 40,
    marginBottom: 20,
  },
  imageSection: {
    marginBottom: 24,
  },
  previewImage: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    marginBottom: 12,
  },
  noImageContainer: {
    width: '100%',
    height: 250,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#999',
    justifyContent: 'center',
    alignItems: 'center',
  },
  noImageText: {
    color: '#999',
    marginTop: 12,
    marginBottom: 20,
  },
  imageButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  imageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  imageButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  form: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  actionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#666',
  },
  saveButton: {
    elevation: 3,
  },
  button: {
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    color: '#999',
    marginVertical: 20,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  cameraControls: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    paddingBottom: 40,
  },
  cameraButton: {
    padding: 15,
  },
  captureButton: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'white',
    borderWidth: 3,
    borderColor: '#333',
  },
});
