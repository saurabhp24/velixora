import React, { createContext, useContext, useState } from 'react';

interface FileContextType {
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);

  const clearPendingFiles = () => setPendingFiles([]);

  return (
    <FileContext.Provider value={{ pendingFiles, setPendingFiles, clearPendingFiles }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error('useFileContext must be used within a FileProvider');
  }
  return context;
}
