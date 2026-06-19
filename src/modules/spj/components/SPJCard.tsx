import React from 'react';
import { FileText, Image as ImageIcon, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { formatIDR } from '../../../shared/utils/formatter';
import type { SpjDocument } from '../hooks/useSpjQuery';

interface SPJCardProps {
  doc: SpjDocument;
  onPreview: (doc: SpjDocument) => void;
}

export const SPJCard: React.FC<SPJCardProps> = ({ doc, onPreview }) => {
  const statusIcons = {
    VERIFIED: <CheckCircle size={12} className="text-emerald-500" />,
    PENDING: <Clock size={12} className="text-amber-500" />,
    REJECTED: <AlertCircle size={12} className="text-rose-500" />,
  };

  const firstLampiran = doc.lampiran?.[0]?.attachment;
  const apiAssetUrl = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace('/api', '');
  const fileUrl = firstLampiran ? `${apiAssetUrl}${firstLampiran.fileUrl}` : undefined;
  const isPdf = firstLampiran?.fileType === 'PDF';
  const fileType = isPdf ? 'pdf' : 'image';
  const thumbnail = isPdf ? undefined : fileUrl;

  const category = doc.cashTransaction?.expenseType?.name || doc.kegiatan?.namaKegiatan || 'Umum';
  const formattedDate = new Date(doc.createdAt).toLocaleDateString('id-ID', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  return (
    <Card className="group hover:shadow-none hover:border-slate-300 hover:bg-slate-50/40 transition-colors duration-200 border-slate-200 overflow-hidden bg-white flex flex-col justify-between">
      {/* Thumbnail/Icon Area - Flat Separator */}
      <div className="relative h-28 bg-slate-50 flex items-center justify-center border-b overflow-hidden">
        {thumbnail ? (
          <img
            src={thumbnail}
            alt={doc.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            {fileType === 'pdf' ? <FileText size={32} /> : <ImageIcon size={32} />}
            <span className="text-[9px] font-semibold">{fileType}</span>
          </div>
        )}
        {/* Soft overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onPreview(doc)}
            className="bg-white text-slate-900 p-2 rounded-none shadow-none transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300 cursor-pointer"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      {/* Info Area - Compact density spacing */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-2">
            <Badge
              variant={doc.status === 'VERIFIED' ? 'success' : doc.status === 'PENDING' ? 'warning' : 'default'}
              className="text-[9px] px-2 py-0.5"
            >
              <div className="flex items-center gap-1">
                {statusIcons[doc.status]}
                <span>{doc.status === 'VERIFIED' ? 'Verified' : doc.status === 'PENDING' ? 'Pending' : 'Rejected'}</span>
              </div>
            </Badge>
            <span className="text-[9px] text-slate-400 font-semibold tracking-tight">{category}</span>
          </div>

          <h4 className="font-medium text-slate-800 text-xs truncate leading-snug" title={doc.title}>
            {doc.title}
          </h4>
        </div>

        <div className="flex justify-between items-end mt-4 pt-3 border-t /80">
          <div className="text-[9px] text-slate-400 font-semibold leading-tight">
            <p className="text-slate-500 font-medium truncate max-w-[100px]">{doc.uploadedBy}</p>
            <p className="mt-0.5">{formattedDate}</p>
          </div>
          <p className="text-xs font-semibold text-slate-800 tracking-tight leading-none">
            {formatIDR(doc.amount)}
          </p>
        </div>
      </div>
    </Card>
  );
};