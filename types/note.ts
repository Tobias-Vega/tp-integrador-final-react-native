export interface Note {
  id: string;
  title: string;
  description: string;
  imageUri: string;
  createdAt: string;
  updatedAt: string;
}

export type NoteFormData = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
