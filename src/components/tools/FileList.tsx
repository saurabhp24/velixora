import { FileText, FileImage, FileArchive, File as FileIcon, X, GripVertical } from "lucide-react";
import { Button } from "../../components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

interface FileListProps {
  files: File[];
  onRemove: (index: number) => void;
  onReorder?: (startIndex: number, endIndex: number) => void;
}

export function FileList({ files, onRemove, onReorder }: FileListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const getFileIcon = (type: string) => {
    if (type.includes('pdf')) return <FileText className="w-6 h-6 text-red-400" />;
    if (type.includes('image')) return <FileImage className="w-6 h-6 text-blue-400" />;
    if (type.includes('zip') || type.includes('compressed')) return <FileArchive className="w-6 h-6 text-yellow-400" />;
    if (type.includes('word') || type.includes('document')) return <FileText className="w-6 h-6 text-blue-600" />;
    return <FileIcon className="w-6 h-6 text-gray-400" />;
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleDragStart = (e: React.DragEvent, index: number) => {
    if (!onReorder) return;
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox requires setting data
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    if (!onReorder) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, index: number) => {
    if (!onReorder) return;
    e.preventDefault();
    if (draggedIndex !== null && draggedIndex !== index) {
      onReorder(draggedIndex, index);
    }
    setDraggedIndex(null);
  };

  if (files.length === 0) return null;

  return (
    <div className="w-full mt-8 flex flex-col gap-3">
      <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
        Ready to process <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs">{files.length}</span>
      </h3>
      
      <div className="flex flex-col gap-2">
        <AnimatePresence>
          {files.map((file, i) => (
            <motion.div
              key={`${file.name}-${file.lastModified}-${i}`}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`glass-panel border border-border/50 rounded-lg p-3 flex items-center justify-between group ${onReorder ? 'cursor-grab active:cursor-grabbing' : ''} ${draggedIndex === i ? 'opacity-50' : ''}`}
              draggable={!!onReorder}
              onDragStart={(e: any) => handleDragStart(e, i)}
              onDragOver={(e: any) => handleDragOver(e, i)}
              onDrop={(e: any) => handleDrop(e, i)}
            >
              <div className="flex items-center gap-4 overflow-hidden">
                {onReorder && (
                  <div className="text-muted-foreground/50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <GripVertical className="w-5 h-5" />
                  </div>
                )}
                <div className="p-2 rounded-md bg-white/5">
                  {getFileIcon(file.type)}
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-sm font-medium truncate max-w-[200px] md:max-w-[400px]">{file.name}</span>
                  <span className="text-xs text-muted-foreground">{formatSize(file.size)}</span>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onRemove(i)}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </Button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
