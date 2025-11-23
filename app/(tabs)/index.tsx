import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { useNotes } from '@/contexts/NotesContext';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { ActivityIndicator, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native';

export default function HomeScreen() {
  const { notes, loading } = useNotes();
  const router = useRouter();
  const backgroundColor = useThemeColor({}, 'background');
  const tintColor = useThemeColor({}, 'tint');

  const handleNotePress = (id: string) => {
    router.push({ pathname: '/note/[id]' as any, params: { id } });
  };

  const handleCreateNote = () => {
    router.push('/modal');
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <ThemedText type="title">Mis Notas</ThemedText>
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: '#007AFF' }]}
          onPress={handleCreateNote}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {notes.length === 0 ? (
        <ThemedView style={styles.emptyContainer}>
          <Ionicons name="images-outline" size={80} color="#999" />
          <ThemedText style={styles.emptyText}>No hay notas aún</ThemedText>
          <ThemedText style={styles.emptySubtext}>
            Presiona el botón + para crear tu primera nota fotográfica
          </ThemedText>
        </ThemedView>
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.noteCard, { backgroundColor }]}
              onPress={() => handleNotePress(item.id)}
            >
              <Image
                source={{ uri: item.imageUri }}
                style={styles.thumbnail}
                contentFit="cover"
              />
              <View style={styles.noteInfo}>
                <ThemedText type="defaultSemiBold" numberOfLines={1}>
                  {item.title}
                </ThemedText>
                <ThemedText style={styles.description} numberOfLines={2}>
                  {item.description}
                </ThemedText>
                <ThemedText style={styles.date}>
                  {new Date(item.updatedAt).toLocaleDateString('es-ES')}
                </ThemedText>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
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
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  listContainer: {
    padding: 16,
  },
  noteCard: {
    flexDirection: 'row',
    marginBottom: 16,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  thumbnail: {
    width: 100,
    height: 100,
  },
  noteInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
});
