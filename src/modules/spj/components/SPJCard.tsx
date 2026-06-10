import React from 'react';
import { FileText, Image as ImageIcon, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../../../shared/components/ui/Card';
import { Badge } from '../../../shared/components/ui/Badge';
import { formatIDR } from '../../../shared/utils/formatter';
import type { SPJDocument } from '../../../shared/mock/spjData';

interface SPJCardProps {
  doc: SPJDocument;
  onPreview: (doc: SPJDocument) => void;
}

/**
 * Typesafe SPJ Document card widget.
 * Styled with seamless container elements and centralized formats.
 */
export const SPJCard: React.FC<SPJCardProps> = ({ doc, onPreview }) => {
  const statusIcons = {
    Verified: <CheckCircle size={12} className="text-emerald-500" />,
    Pending: <Clock size={12} className="text-amber-500" />,
    Rejected: <AlertCircle size={12} className="text-rose-500" />,
  };

  return (
    <Card className="group hover:shadow-md hover:border-slate-300 transition-all duration-300 border-slate-200 overflow-hidden bg-white flex flex-col justify-between">
      {/* Thumbnail/Icon Area - Flat Separator */}
      <div className="relative h-28 bg-slate-50 flex items-center justify-center border-b border-slate-100 overflow-hidden">
        {doc.thumbnail ? (
          <img
            src={doc.thumbnail}
            alt={doc.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center gap-1.5 text-slate-400">
            {doc.fileType === 'pdf' ? <FileText size={32} /> : <ImageIcon size={32} />}
            <span className="text-[9px] font-black uppercase tracking-wider">{doc.fileType}</span>
          </div>
        )}
        {/* Soft overlay on hover */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
          <button
            onClick={() => onPreview(doc)}
            className="bg-white text-slate-900 p-2 rounded-full shadow-md transform translate-y-1 group-hover:translate-y-0 transition-transform duration-300"
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
              variant={doc.status === 'Verified' ? 'success' : doc.status === 'Pending' ? 'warning' : 'default'}
              className="text-[9px] px-2 py-0.5"
            >
              <div className="flex items-center gap-1">
                {statusIcons[doc.status]}
                <span>{doc.status}</span>
              </div>
            </Badge>
            <span className="text-[9px] text-slate-400 font-black uppercase tracking-tight">{doc.category}</span>
          </div>

          <h4 className="font-bold text-slate-800 text-xs truncate leading-snug" title={doc.title}>
            {doc.title}
          </h4>
        </div>

        <div className="flex justify-between items-end mt-4 pt-3 border-t border-slate-100/80">
          <div className="text-[9px] text-slate-400 font-semibold leading-tight">
            <p className="text-slate-500 font-bold truncate max-w-[100px]">{doc.uploadedBy}</p>
            <p className="mt-0.5">{doc.date}</p>
          </div>
          <p className="text-xs font-black text-slate-800 tracking-tight leading-none">
            {formatIDR(doc.amount)}
          </p>
        </div>
      </div>
    </Card>
  );
};