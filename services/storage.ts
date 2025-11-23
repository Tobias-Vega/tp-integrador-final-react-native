import { Note, NoteFormData } from '@/types/note';
import AsyncStorage from '@react-native-async-storage/async-storage';

const NOTES_STORAGE_KEY = '@notes_app:notes';

export const StorageService = {
  async getAllNotes(): Promise<Note[]> {
    try {
      const notesJson = await AsyncStorage.getItem(NOTES_STORAGE_KEY);
      return notesJson ? JSON.parse(notesJson) : [];
    } catch (error) {
      console.error('Error loading notes:', error);
      return [];
    }
  },

  async getNoteById(id: string): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      return notes.find(note => note.id === id) || null;
    } catch (error) {
      console.error('Error getting note:', error);
      return null;
    }
  },

  async createNote(noteData: NoteFormData): Promise<Note> {
    try {
      const notes = await this.getAllNotes();
      const now = new Date().toISOString();
      const newNote: Note = {
        id: Date.now().toString(),
        ...noteData,
        createdAt: now,
        updatedAt: now,
      };
      notes.push(newNote);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      return newNote;
    } catch (error) {
      console.error('Error creating note:', error);
      throw error;
    }
  },

  async updateNote(id: string, noteData: Partial<NoteFormData>): Promise<Note | null> {
    try {
      const notes = await this.getAllNotes();
      const index = notes.findIndex(note => note.id === id);
      
      if (index === -1) {
        return null;
      }

      notes[index] = {
        ...notes[index],
        ...noteData,
        updatedAt: new Date().toISOString(),
      };

      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(notes));
      return notes[index];
    } catch (error) {
      console.error('Error updating note:', error);
      throw error;
    }
  },

  async deleteNote(id: string): Promise<boolean> {
    try {
      const notes = await this.getAllNotes();
      const filteredNotes = notes.filter(note => note.id !== id);
      await AsyncStorage.setItem(NOTES_STORAGE_KEY, JSON.stringify(filteredNotes));
      return true;
    } catch (error) {
      console.error('Error deleting note:', error);
      return false;
    }
  },

  async clearAllNotes(): Promise<void> {
    try {
      await AsyncStorage.removeItem(NOTES_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing notes:', error);
    }
  },
};
