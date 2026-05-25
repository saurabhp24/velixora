import {
  FileText, Copy, Scissors, Minimize, RotateCw, Trash2, Sliders, FileOutput,
  Image as ImageIcon, FileImage, FileCode2, Lock, Unlock, Droplets, Hash,
  Minimize2, Maximize, RefreshCcw, Archive, BoxSelect,
  Brain, MessageSquare, ScanText, Table, UserCheck, ShieldCheck,
  Zap, GitMerge, Presentation, Languages, Globe
} from "lucide-react";

export type ToolCategory = 'pdf' | 'image' | 'archive' | 'ai';

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  icon: any;
  href: string;
  category: ToolCategory;
  trending?: boolean;
  color: string;
  accept: string;
  multiple?: boolean;
  requiresKey?: boolean;
}

export const tools: ToolDefinition[] = [
  // PDF Tools
  { id: 'merge-pdf', name: 'Merge PDF', description: 'Combine multiple PDFs into one unified document.', icon: Copy, href: '/tools/merge-pdf', category: 'pdf', trending: true, color: '#4F6EF7', accept: 'application/pdf', multiple: true },
  { id: 'split-pdf', name: 'Split PDF', description: 'Extract pages or split PDF into individual files.', icon: Scissors, href: '/tools/split-pdf', category: 'pdf', trending: true, color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'compress-pdf', name: 'Compress PDF', description: 'Reduce PDF file size while maintaining quality.', icon: Minimize, href: '/tools/compress-pdf', category: 'pdf', trending: true, color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'rotate-pdf', name: 'Rotate PDF', description: 'Rotate pages within your PDF to proper orientation.', icon: RotateCw, href: '/tools/rotate-pdf', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'delete-pages', name: 'Delete Pages', description: 'Remove specific pages from a PDF document.', icon: Trash2, href: '/tools/delete-pages', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'rearrange-pages', name: 'Rearrange Pages', description: 'Drag and drop to reorder PDF pages.', icon: Sliders, href: '/tools/rearrange-pages', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'extract-pages', name: 'Extract Pages', description: 'Pull out selected pages to a new PDF.', icon: FileOutput, href: '/tools/extract-pages', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'jpg-to-pdf', name: 'JPG to PDF', description: 'Convert images to a single PDF document.', icon: FileImage, href: '/tools/jpg-to-pdf', category: 'pdf', trending: true, color: '#4F6EF7', accept: 'image/jpeg, image/png, image/webp', multiple: true },
  { id: 'pdf-to-jpg', name: 'PDF to JPG', description: 'Extract PDF pages as high-quality images.', icon: ImageIcon, href: '/tools/pdf-to-jpg', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'word-to-pdf', name: 'Word to PDF', description: 'Convert DOCX documents to PDF format.', icon: FileText, href: '/tools/word-to-pdf', category: 'pdf', trending: true, color: '#4F6EF7', accept: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' },
  { id: 'pdf-to-word', name: 'PDF to Word', description: 'Extract text from PDF into editable format.', icon: FileCode2, href: '/tools/pdf-to-word', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'protect-pdf', name: 'Protect PDF', description: 'Add password encryption to your PDF.', icon: Lock, href: '/tools/protect-pdf', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'unlock-pdf', name: 'Unlock PDF', description: 'Remove password from protected PDFs.', icon: Unlock, href: '/tools/unlock-pdf', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'watermark-pdf', name: 'Watermark PDF', description: 'Add a text watermark to PDF pages.', icon: Droplets, href: '/tools/watermark-pdf', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },
  { id: 'page-numbers', name: 'Page Numbers', description: 'Add page numbers to your PDF document.', icon: Hash, href: '/tools/page-numbers', category: 'pdf', color: '#4F6EF7', accept: 'application/pdf' },

  // Image Tools
  { id: 'compress-image', name: 'Compress Image', description: 'Reduce image file size with minimal quality loss.', icon: Minimize2, href: '/tools/compress-image', category: 'image', trending: true, color: '#00D4FF', accept: 'image/jpeg, image/png, image/webp', multiple: true },
  { id: 'resize-image', name: 'Resize Image', description: 'Change image dimensions and resolution.', icon: Maximize, href: '/tools/resize-image', category: 'image', color: '#00D4FF', accept: 'image/jpeg, image/png, image/webp' },
  { id: 'convert-image', name: 'Convert Image', description: 'Convert between PNG, JPG, and WEBP formats.', icon: RefreshCcw, href: '/tools/convert-image', category: 'image', color: '#00D4FF', accept: 'image/jpeg, image/png, image/webp', multiple: true },

  // Archive Tools
  { id: 'zip-files', name: 'Create ZIP', description: 'Compress multiple files into a ZIP archive.', icon: Archive, href: '/tools/zip-files', category: 'archive', trending: true, color: '#8B5CF6', accept: '*/*', multiple: true },
  { id: 'unzip-files', name: 'Extract ZIP', description: 'Extract contents from a ZIP archive online.', icon: BoxSelect, href: '/tools/unzip-files', category: 'archive', color: '#8B5CF6', accept: 'application/zip, application/x-zip-compressed' },

  // AI Tools
  { id: 'pdf-summarizer', name: 'PDF Summarizer', description: 'AI-generated key points and chapter summaries from any PDF.', icon: Brain, href: '/tools/pdf-summarizer', category: 'ai', trending: true, color: '#a855f7', accept: 'application/pdf', requiresKey: true },
  { id: 'chat-pdf', name: 'Chat with PDF', description: 'Ask questions and get contextual answers from your documents.', icon: MessageSquare, href: '/tools/chat-pdf', category: 'ai', trending: true, color: '#a855f7', accept: 'application/pdf', requiresKey: true },
  { id: 'ocr', name: 'Smart OCR', description: 'Extract text from images locally — English, Hindi, Marathi, Tamil.', icon: ScanText, href: '/tools/ocr', category: 'ai', color: '#a855f7', accept: 'image/*' },
  { id: 'table-extractor', name: 'Table Extractor', description: 'Detect and export tables from PDFs to Excel/CSV.', icon: Table, href: '/tools/table-extractor', category: 'ai', color: '#a855f7', accept: 'application/pdf', requiresKey: true },
  { id: 'resume-analyzer', name: 'Resume Analyzer', description: 'ATS score, keyword optimization, and improvement suggestions.', icon: UserCheck, href: '/tools/resume-analyzer', category: 'ai', trending: true, color: '#a855f7', accept: 'application/pdf', requiresKey: true },
  { id: 'contract-analyzer', name: 'Contract Analyzer', description: 'Clause extraction, risk detection, and smart summaries.', icon: ShieldCheck, href: '/tools/contract-analyzer', category: 'ai', color: '#a855f7', accept: 'application/pdf', requiresKey: true },
  { id: 'compress', name: 'Smart Compressor', description: 'Browser-side image compression with quality control.', icon: Zap, href: '/tools/compress', category: 'ai', color: '#a855f7', accept: 'image/jpeg, image/png' },
  { id: 'convert', name: 'Convert & Merge', description: 'Convert images and files into PDF locally.', icon: GitMerge, href: '/tools/convert', category: 'ai', color: '#a855f7', accept: 'image/*', multiple: true },
  { id: 'ppt-generator', name: 'PPT Generator', description: 'Convert PDFs into presentation slides with AI.', icon: Presentation, href: '/tools/ppt-generator', category: 'ai', color: '#a855f7', accept: 'application/pdf', requiresKey: true },
  { id: 'translate', name: 'AI Translator', description: 'Translate PDFs into 14+ languages including Indian languages.', icon: Languages, href: '/tools/translate', category: 'ai', color: '#a855f7', accept: 'application/pdf', requiresKey: true },
  { id: 'india', name: 'India Tools', description: 'Aadhaar optimizer, PAN compressor, passport photo, invoice extractor.', icon: Globe, href: '/tools/india', category: 'ai', color: '#f97316', accept: '*/*' },
];

export function getToolsByCategory(category: ToolCategory) {
  return tools.filter(t => t.category === category);
}

export function getTrendingTools() {
  return tools.filter(t => t.trending);
}

export function getToolByHref(href: string) {
  return tools.find(t => t.href === href);
}
