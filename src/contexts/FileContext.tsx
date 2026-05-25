import { createContext, useContext, useState, useCallback, ReactNode } from "react";

interface FileContextValue {
  pendingFiles: File[];
  setPendingFiles: (files: File[]) => void;
  clearPendingFiles: () => void;
  totalFilesProcessed: number;
  toolUsage: Record<string, number>;
  incrementFilesProcessed: (count?: number) => void;
  recordToolUsage: (toolId: string, count?: number) => void;
}

const FileContext = createContext<FileContextValue | null>(null);

export function FileProvider({ children }: { children: ReactNode }) {
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [totalFilesProcessed, setTotalFilesProcessed] = useState(0);
  const [toolUsage, setToolUsage] = useState<Record<string, number>>({});

  const clearPendingFiles = useCallback(() => setPendingFiles([]), []);

  const incrementFilesProcessed = useCallback((count = 1) => {
    setTotalFilesProcessed((prev) => prev + count);
  }, []);

  const recordToolUsage = useCallback((toolId: string, count = 1) => {
    setToolUsage((prev) => ({ ...prev, [toolId]: (prev[toolId] ?? 0) + count }));
    incrementFilesProcessed(count);
  }, [incrementFilesProcessed]);

  return (
    <FileContext.Provider value={{
      pendingFiles,
      setPendingFiles,
      clearPendingFiles,
      totalFilesProcessed,
      toolUsage,
      incrementFilesProcessed,
      recordToolUsage,
    }}>
      {children}
    </FileContext.Provider>
  );
}

export function useFileContext(): FileContextValue {
  const ctx = useContext(FileContext);
  if (!ctx) throw new Error("useFileContext must be used inside FileProvider");
  return ctx;
}
