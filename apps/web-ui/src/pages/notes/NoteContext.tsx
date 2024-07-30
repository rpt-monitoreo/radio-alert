import { NoteDto } from '@repo/shared/index';
import React, { createContext, useState, useContext, ReactNode } from 'react';

interface NoteContextType {
  note: NoteDto | null;
  setNote: (note: NoteDto | null) => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export const NoteProvider = ({ children }: { children: ReactNode }) => {
  const [note, setNote] = useState<NoteDto | null>(null);

  return <NoteContext.Provider value={React.useMemo(() => ({ note, setNote }), [note, setNote])}>{children}</NoteContext.Provider>;
};

export const useNote = () => {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNote must be used within an NoteProvider');
  }
  return context;
};
