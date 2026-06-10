export interface SPJDocument {
  id: string;
  title: string;
  category: string;
  date: string;
  amount: number;
  status: 'Verified' | 'Pending' | 'Rejected';
  fileType: 'pdf' | 'image';
  uploadedBy: string;
  thumbnail?: string;
}

export const MOCK_SPJ: SPJDocument[] = [
  { id: 'SPJ-001', title: 'Renovasi Altar Tahap I', category: 'Pembangunan', date: '2024-03-10', amount: 15000000, status: 'Verified', fileType: 'pdf', uploadedBy: 'Tim Pembangunan' },
  { id: 'SPJ-002', title: 'Konsumsi Rapat Pleno', category: 'Sekretariat', date: '2024-03-12', amount: 1250000, status: 'Pending', fileType: 'image', uploadedBy: 'Sekretariat', thumbnail: 'https://images.unsplash.com/photo-1551288049-bbbda546697a?w=400&q=80' },
  { id: 'SPJ-003', title: 'Sound System Misa Paskah', category: 'Liturgi', date: '2024-03-15', amount: 5000000, status: 'Pending', fileType: 'pdf', uploadedBy: 'Komisi Liturgi' },
  { id: 'SPJ-004', title: 'Bantuan Sosial Bencana', category: 'Sosial', date: '2024-03-18', amount: 7500000, status: 'Rejected', fileType: 'image', uploadedBy: 'Ketua Komisi', thumbnail: 'https://images.unsplash.com/photo-1554224155-1696413565d3?w=400&q=80' },
];