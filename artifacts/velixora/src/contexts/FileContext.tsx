import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface FileContextType {
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;
  totalFilesProcessed: number;
  toolUsage: Record<string, number>;
  incrementFilesProcessed: (count: number) => void;
  recordToolUsage: (toolId: string, count?: number) => void;
}

const FileContext = createContext<FileContextType | undefined>(undefined);

export function FileProvider({ children }: { children: React.ReactNode }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [totalFilesProcessed, setTotalFilesProcessed] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = localStorage.getItem('velixora-files-processed');
    return stored ? Number(stored) : 0;
  });
  const [toolUsage, setToolUsage] = useState<Record<string, number>>(() => {
    if (typeof window === 'undefined') return {};
    const stored = localStorage.getItem('velixora-tool-usage');
    return stored ? JSON.parse(stored) : {};
  });

  useEffect(() => {
    localStorage.setItem('velixora-files-processed', String(totalFilesProcessed));
  }, [totalFilesProcessed]);

  useEffect(() => {
    localStorage.setItem('velixora-tool-usage', JSON.stringify(toolUsage));
  }, [toolUsage]);

  const clearPendingFiles = useCallback(() => setPendingFiles([]), []);
  const incrementFilesProcessed = useCallback((count: number) => {
    setTotalFilesProcessed((current) => current + count);
  }, []);
  const recordToolUsage = useCallback((toolId: string, count = 1) => {
    setToolUsage((current) => ({
      ...current,
      [toolId]: (current[toolId] || 0) + count,
    }));
  }, []);

  return (
    <FileContext.Provider
      value={{
        pendingFiles,
        setPendingFiles,
        clearPendingFiles,
        totalFilesProcessed,
        toolUsage,
        incrementFilesProcessed,
        recordToolUsage,
      }}
    >
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
