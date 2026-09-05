import React, { useRef, useState } from 'react';
import { UploadCloud, Image as ImageIcon, X, RefreshCw, Link as LinkIcon } from 'lucide-react';

interface ImageUploadBoxProps {
  label?: string;
  image?: string;
  onChange: (imageUrl: string) => void;
  aspectRatio?: 'square' | 'wide';
  presets?: { label: string; url: string }[];
  placeholderText?: string;
}

export const ImageUploadBox: React.FC<ImageUploadBoxProps> = ({
  label = 'Upload Image',
  image,
  onChange,
  aspectRatio = 'square',
  presets,
  placeholderText = 'Upload Image',
}) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isUrlModalOpen, setIsUrlModalOpen] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (urlInput.trim()) {
      onChange(urlInput.trim());
      setUrlInput('');
      setIsUrlModalOpen(false);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
          {label}
        </label>
      )}

      <div
        onDragOver={e => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative group flex flex-col items-center justify-center rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
          aspectRatio === 'square' ? 'w-44 h-44 sm:w-52 sm:h-52' : 'w-full h-44'
        } ${
          dragOver
            ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30'
            : image
            ? 'border-slate-300 dark:border-navy-700 bg-slate-900'
            : 'border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-900/60 hover:border-emerald-500 hover:bg-slate-100/70 dark:hover:bg-navy-800/60'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />

        {image ? (
          <>
            <img
              src={image}
              alt="Uploaded Preview"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {/* Overlay Actions on Hover */}
            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2 backdrop-blur-xs">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-white/90 text-slate-900 hover:bg-white flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <RefreshCw className="w-3 h-3 text-emerald-600" />
                Change
              </button>
              <button
                type="button"
                onClick={() => onChange('')}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-rose-600 text-white hover:bg-rose-700 flex items-center gap-1.5 shadow-sm transition-transform active:scale-95"
              >
                <X className="w-3 h-3" />
                Remove
              </button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2 group-hover:scale-110 transition-transform shadow-xs">
              <UploadCloud className="w-6 h-6 stroke-[2]" />
            </div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block mb-0.5">
              {placeholderText}
            </span>
            <span className="text-[10px] text-slate-400 block">
              PNG, JPG, WebP up to 5MB
            </span>
          </div>
        )}
      </div>

      {/* Auxiliary Actions: Choose Preset or Enter URL */}
      <div className="flex items-center gap-2 text-xs">
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
        >
          <ImageIcon className="w-3 h-3" /> Choose File
        </button>
        <span className="text-slate-300 dark:text-navy-700">•</span>
        <button
          type="button"
          onClick={() => setIsUrlModalOpen(true)}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 flex items-center gap-1"
        >
          <LinkIcon className="w-3 h-3" /> Image URL
        </button>
      </div>

      {/* Preset Pickers if available */}
      {presets && presets.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[10px] text-slate-400 font-medium">Quick presets:</span>
          {presets.map((p, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => onChange(p.url)}
              className="px-2 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-navy-800 hover:bg-emerald-100 hover:text-emerald-800 dark:hover:bg-emerald-900/50 dark:hover:text-emerald-300 text-slate-600 dark:text-slate-300 transition-colors"
            >
              {p.label}
            </button>
          ))}
        </div>
      )}

      {/* URL Input Modal Dialog */}
      {isUrlModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-navy-900 rounded-2xl p-5 w-full max-w-sm border border-slate-200 dark:border-navy-700 shadow-2xl space-y-3">
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">Paste Image URL</h4>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={urlInput}
              onChange={e => setUrlInput(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 dark:border-navy-700 bg-slate-50 dark:bg-navy-800 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"
              autoFocus
            />
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setIsUrlModalOpen(false)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-navy-800 text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplyUrl}
                className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                Apply Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
