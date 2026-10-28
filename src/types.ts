export type ToolId = 'qr' | 'ytdl' | 'img2pdf' | 'text';

export type View = 'landing' | 'hub' | ToolId;

export interface ToolMeta {
  id: ToolId;
  label: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
}

export const TOOLS: ToolMeta[] = [
  {
    id: 'qr',
    label: 'QR Code Studio',
    tagline: 'Buat QR dari link, file, gambar, audio',
    description: 'Buat QR code untuk link, PDF, gambar, audio, atau file apa pun. Pilih warna, simpan riwayat, dan download langsung sebagai PNG. File di-upload online supaya QR bisa di-scan dari mana saja.',
    icon: 'QrCode',
    accent: '#1d63c8',
  },
  {
    id: 'ytdl',
    label: 'Audio & Video Downloader',
    tagline: 'Download audio/video dari YouTube',
    description: 'Tempel link YouTube, pilih format audio (MP3) atau video (MP4), lalu download langsung. Tidak perlu instal aplikasi tambahan.',
    icon: 'Youtube',
    accent: '#e23b4f',
  },
  {
    id: 'img2pdf',
    label: 'Scan Gambar ke PDF',
    tagline: 'Foto dokumen, potong, urutkan, jadi PDF',
    description: 'Ambil foto atau unggah gambar dokumen, potong bagian yang diperlukan, atur urutan halaman, lalu gabungkan menjadi satu file PDF yang rapi.',
    icon: 'ScanLine',
    accent: '#1b9e5a',
  },
  {
    id: 'text',
    label: 'Text & Document Tools',
    tagline: 'Hitung kata, ubah huruf, rapikan teks, sitasi',
    description: 'Hitung kata dan karakter, ubah huruf besar/kecil, rapikan teks, hapus baris ganda, serta buat sitasi dan daftar pustaka dengan format standar.',
    icon: 'Type',
    accent: '#e0a82e',
  },
];
