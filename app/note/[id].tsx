import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/contexts/NotesContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Note } from '@/types/note';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function NoteDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getNoteById, deleteNote } = useNotes();
  const router = useRouter();
  const tintColor = useThemeColor({}, 'tint');
  const [note, setNote] = useState<Note | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const foundNote = getNoteById(id);
      setNote(foundNote);
      setLoading(false);
    }
  }, [id]);

  const handleDelete = () => {
    Alert.alert(
      'Eliminar nota',
      '¿Estás seguro de que deseas eliminar esta nota? Esta acción no se puede deshacer.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            if (id) {
              const success = await deleteNote(id);
              if (success) {
                Alert.alert('Éxito', 'Nota eliminada', [
                  {
                    text: 'OK',
                    onPress: () => router.push('/(tabs)'),
                  },
                ]);
              } else {
                Alert.alert('Error', 'No se pudo eliminar la nota');
              }
            }
          },
        },
      ]
    );
  };

  const handleEdit = () => {
    router.push({ pathname: '/edit/[id]' as any, params: { id: id || '' } });
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

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image source={{ uri: note.imageUri }} style={styles.image} contentFit="cover" />

        <View style={styles.content}>
          <View style={styles.header}>
            <View style={styles.titleSection}>
              <ThemedText type="title">{note.title}</ThemedText>
              <ThemedText style={styles.date}>
                Creado: {new Date(note.createdAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </ThemedText>
              {note.createdAt !== note.updatedAt && (
                <ThemedText style={styles.date}>
                  Actualizado: {new Date(note.updatedAt).toLocaleDateString('es-ES', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </ThemedText>
              )}
            </View>
          </View>

          <View style={styles.descriptionSection}>
            <ThemedText type="subtitle">Descripción</ThemedText>
            <ThemedText style={styles.description}>{note.description}</ThemedText>
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.actionButton, styles.editButton, { backgroundColor: '#007AFF' }]}
              onPress={handleEdit}
            >
              <Ionicons name="pencil" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Editar</ThemedText>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionButton, styles.deleteButton]}
              onPress={handleDelete}
            >
              <Ionicons name="trash" size={20} color="#FFFFFF" />
              <ThemedText style={styles.buttonText}>Eliminar</ThemedText>
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
    paddingBottom: 40,
  },
  image: {
    width: '100%',
    height: 300,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  titleSection: {
    gap: 8,
  },
  date: {
    fontSize: 14,
    color: '#999',
  },
  descriptionSection: {
    marginBottom: 32,
    gap: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
    gap: 8,
    elevation: 3,
  },
  editButton: {
    // backgroundColor set via tintColor
  },
  deleteButton: {
    backgroundColor: '#dc3545',
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
});
