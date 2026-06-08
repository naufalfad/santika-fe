import React from 'react';
import { FileText, Image as ImageIcon, Eye, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { SPJDocument } from '../../mock/spjData';

interface SPJCardProps {
  doc: SPJDocument;
  onPreview: (doc: SPJDocument) => void;
}

export const SPJCard = ({ doc, onPreview }: SPJCardProps) => {
  const statusIcons = {
    Verified: <CheckCircle size={14} className="text-emerald-500" />,
    Pending: <Clock size={14} className="text-amber-500" />,
    Rejected: <AlertCircle size={14} className="text-rose-500" />,
  };

  return (
    <Card className="group hover:shadow-md transition-all border-gray-200 overflow-hidden">
      <div className="relative h-32 bg-slate-100 flex items-center justify-center border-b border-gray-100 overflow-hidden">
        {doc.thumbnail ? (
          <img src={doc.thumbnail} alt={doc.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            {doc.fileType === 'pdf' ? <FileText size={40} /> : <ImageIcon size={40} />}
            <span className="text-[10px] font-bold uppercase">{doc.fileType}</span>
          </div>
        )}
        <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={() => onPreview(doc)}
            className="bg-white text-slate-900 p-2 rounded-full shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <Badge variant={doc.status === 'Verified' ? 'success' : doc.status === 'Pending' ? 'warning' : 'default'}>
            <div className="flex items-center gap-1">
              {statusIcons[doc.status]}
              {doc.status}
            </div>
          </Badge>
          <span className="text-[10px] text-gray-400 font-medium uppercase">{doc.category}</span>
        </div>

        <h4 className="font-bold text-slate-800 text-sm truncate mb-1" title={doc.title}>{doc.title}</h4>
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50">
          <div className="text-[10px] text-gray-500">
            <p>{doc.uploadedBy}</p>
            <p>{doc.date}</p>
          </div>
          <p className="text-xs font-black text-slate-700">
            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(doc.amount)}
          </p>
        </div>
      </div>
    </Card>
  );
};