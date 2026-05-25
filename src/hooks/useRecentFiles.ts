const KEY = 'velixora_recent_files';

export type RecentFile = { name: string; type: string; tool: string; timestamp: number; size: number };

export function useRecentFiles() {
  const getFiles = (): RecentFile[] => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || '[]');
    } catch {
      return [];
    }
  };

  const addFile = (f: Omit<RecentFile, 'timestamp'>) => {
    const files = [{ ...f, timestamp: Date.now() }, ...getFiles().slice(0, 19)];
    localStorage.setItem(KEY, JSON.stringify(files));
  };

  return { getFiles, addFile };
}
