import { Eye, Download } from 'lucide-react';
import { Button } from '../../../shared/components/ui/Button';

interface FilePreviewProps {
  fileUrl?: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  onClose: () => void;
}

export const FilePreview = ({ fileUrl, fileName, fileType, onClose }: FilePreviewProps) => {
  return (
    <div className="space-y-4">
      <div className="aspect-[3/4] bg-slate-100 rounded-none flex items-center justify-center border border-slate-200 overflow-hidden relative">
        {fileType === 'image' && fileUrl ? (
          <img src={fileUrl} alt={fileName} className="w-full h-full object-contain" />
        ) : fileType === 'pdf' && fileUrl ? (
          <iframe
            src={fileUrl}
            title={fileName}
            className="w-full h-full border-none"
          />
        ) : (
          <div className="text-center p-8">
            <div className="w-16 h-16 text-blue-600 rounded-none flex items-center justify-center mx-auto mb-4">
              <Eye size={32} />
            </div>
            <p className="text-sm text-slate-700 font-medium mb-1">{fileName}</p>
            <a href={fileUrl || "#"} download={fileName} className="inline-block mt-4">
              <Button variant="outline" className="text-xs flex items-center gap-2">
                <Download size={14} /> Download File
              </Button>
            </a>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {fileType === 'pdf' && fileUrl && (
          <a href={fileUrl} download={fileName} className="flex-1">
            <Button variant="outline" className="w-full py-3 flex items-center justify-center gap-2 text-xs border-slate-200">
              <Download size={14} /> Unduh PDF
            </Button>
          </a>
        )}
        <Button variant="outline" className="flex-1 py-3 text-xs border-slate-200" onClick={onClose}>
          Tutup Preview
        </Button>
      </div>
    </div>
  );
};
