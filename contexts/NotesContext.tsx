import { StorageService } from '@/services/storage';
import { Note, NoteFormData } from '@/types/note';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface NotesContextType {
  notes: Note[];
  loading: boolean;
  refreshNotes: () => Promise<void>;
  createNote: (noteData: NoteFormData) => Promise<Note>;
  updateNote: (id: string, noteData: Partial<NoteFormData>) => Promise<Note | null>;
  deleteNote: (id: string) => Promise<boolean>;
  getNoteById: (id: string) => Note | undefined;
}

const NotesContext = createContext<NotesContextType | undefined>(undefined);

export const NotesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshNotes = async () => {
    setLoading(true);
    try {
      const loadedNotes = await StorageService.getAllNotes();
      setNotes(loadedNotes);
    } catch (error) {
      console.error('Error refreshing notes:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshNotes();
  }, []);

  const createNote = async (noteData: NoteFormData): Promise<Note> => {
    const newNote = await StorageService.createNote(noteData);
    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = async (id: string, noteData: Partial<NoteFormData>): Promise<Note | null> => {
    const updatedNote = await StorageService.updateNote(id, noteData);
    if (updatedNote) {
      setNotes(prev => prev.map(note => (note.id === id ? updatedNote : note)));
    }
    return updatedNote;
  };

  const deleteNote = async (id: string): Promise<boolean> => {
    const success = await StorageService.deleteNote(id);
    if (success) {
      setNotes(prev => prev.filter(note => note.id !== id));
    }
    return success;
  };

  const getNoteById = (id: string): Note | undefined => {
    return notes.find(note => note.id === id);
  };

  return (
    <NotesContext.Provider
      value={{
        notes,
        loading,
        refreshNotes,
        createNote,
        updateNote,
        deleteNote,
        getNoteById,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
};

export const useNotes = (): NotesContextType => {
  const context = useContext(NotesContext);
  if (!context) {
    throw new Error('useNotes must be used within a NotesProvider');
  }
  return context;
};
