import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowLeft,
  Check,
  Clock3,
  Copy,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  Link2,
  Loader2,
  Music,
  Paperclip,
  Palette,
  Plus,
  QrCode,
  ShieldCheck,
  Trash2,
  Upload,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Brand } from './Brand';

type QrMode = 'link' | 'pdf' | 'image' | 'audio' | 'file';
type SavedQr = { id: string; name: string; url: string; mode: QrMode; color: string; createdAt: string };

const STORAGE_KEY = 'toolbox-qr-history';
const DEFAULT_URL = 'https://toolbox.app/welcome';
const THEMES: { id: string; label: string; dark: string; preview: string }[] = [
  { id: 'biru', label: 'Biru', dark: '#102f50', preview: '#1d63c8' },
  { id: 'hitam', label: 'Hitam', dark: '#0a0a0a', preview: '#222222' },
  { id: 'hijau', label: 'Hijau', dark: '#0d4d2b', preview: '#1b9e5a' },
  { id: 'merah', label: 'Merah', dark: '#7a1220', preview: '#e23b4f' },
  { id: 'emas', label: 'Emas', dark: '#7a5a08', preview: '#e0a82e' },
  { id: 'ungu', label: 'Ungu', dark: '#3a1d6b', preview: '#7a4ed1' },
];
const QR_OPTIONS = {
  width: 720,
  margin: 2,
  color: { dark: '#102f50', light: '#ffffff' },
  errorCorrectionLevel: 'H' as const,
};
const MODES: { id: QrMode; label: string; icon: typeof Link2; accept: string }[] = [
  { id: 'link', label: 'Link', icon: Link2, accept: '' },
  { id: 'pdf', label: 'PDF', icon: FileText, accept: 'application/pdf' },
  { id: 'image', label: 'Gambar', icon: ImageIcon, accept: 'image/*' },
  { id: 'audio', label: 'Audio', icon: Music, accept: 'audio/*' },
  { id: 'file', label: 'File', icon: Paperclip, accept: '*/*' },
];

interface QrToolProps {
  onBack: () => void;
}

export function QrTool({ onBack }: QrToolProps) {
  const [mode, setMode] = useState<QrMode>('link');
  const [color, setColor] = useState<string>('#102f50');
  const [name, setName] = useState('Website utama');
  const [url, setUrl] = useState(DEFAULT_URL);
  const [fileName, setFileName] = useState('');
  const [qrData, setQrData] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [notice, setNotice] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<SavedQr[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? (JSON.parse(saved) as SavedQr[]) : [];
  });
  const dateFormatter = useMemo(() => new Intl.DateTimeFormat('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }), []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  useEffect(() => {
    void QRCode.toDataURL(DEFAULT_URL, QR_OPTIONS).then(setQrData);
  }, []);

  async function generateQr(value: string = url, dark = color) {
    const target = value.trim();
    if (!target) {
      setNotice('Isi dulu yang mau dibuat QR.');
      return;
    }
    setIsGenerating(true);
    setNotice('');
    try {
      setQrData(await QRCode.toDataURL(target, { ...QR_OPTIONS, color: { dark, light: '#ffffff' } }));
    } catch {
      setNotice('Belum bisa dibuat QR. Coba periksa lagi.');
    } finally {
      setIsGenerating(false);
    }
  }

  function saveQr() {
    if (!qrData || !url.trim()) {
      setNotice('Buat QR dulu sebelum disimpan.');
      return;
    }
    const item: SavedQr = {
      id: crypto.randomUUID(),
      name: name.trim() || 'QR tanpa nama',
      url: url.trim(),
      mode,
      color,
      createdAt: new Date().toISOString(),
    };
    setHistory((items) => [item, ...items].slice(0, 20));
    setNotice('QR so ta simpang di perangkat ini.');
  }

  async function copyLink() {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadQr() {
    if (!qrData) return;
    const a = document.createElement('a');
    a.href = qrData;
    a.download = `${name.trim() || 'dynamic-qr'}.png`;
    a.click();
  }

  async function handleFile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    setNotice('Lagi upload file, tunggu bentar...');
    try {
      const ext = file.name.split('.').pop() || 'bin';
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from('qr-files').upload(path, file, { cacheControl: '3600', upsert: false });
      if (error) throw error;
      const { data: publicData } = supabase.storage.from('qr-files').getPublicUrl(path);
      const publicUrl = publicData.publicUrl;
      setUrl(publicUrl);
      setFileName(file.name);
      setName(file.name.replace(/\.[^.]+$/, ''));
      setNotice('File so ta upload, QR so deng link yang bisa di-scan.');
      await generateQr(publicUrl);
    } catch {
      setNotice('Upload kagal. Coba lagi bae.');
    } finally {
      setIsUploading(false);
    }
  }

  function switchMode(next: QrMode) {
    setMode(next);
    setNotice('');
    setFileName('');
    if (next === 'link') {
      setUrl(DEFAULT_URL);
      setName('Website utama');
      void generateQr(DEFAULT_URL);
    } else {
      setUrl('');
      setName('');
      setQrData('');
    }
  }

  function openSaved(item: SavedQr) {
    setMode(item.mode);
    setColor(item.color);
    setName(item.name);
    setUrl(item.url);
    setFileName(item.mode === 'link' ? '' : item.name);
    void generateQr(item.url, item.color);
  }

  const currentMode = MODES.find((m) => m.id === mode)!;

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup">
          <button className="brand-back-btn" onClick={onBack} type="button" aria-label="Kembali"><ArrowLeft size={18} /></button>
          <span className="brand-mark"><QrCode size={19} strokeWidth={2.5} /></span>
          <span>Toolbox<span className="brand-dot">.</span></span>
        </div>
        <nav><span className="nav-active">QR Code Studio</span></nav>
        <button className="logout-button" onClick={onBack} type="button"><ArrowLeft size={15} /> Semua Alat</button>
      </header>

      <section className="hero-copy">
        <div>
          <p className="eyebrow"><ShieldCheck size={14} /> QR CODE</p>
          <h1>Buat jo<br /><em>QR code.</em></h1>
        </div>
        <p className="hero-description">Buat QR dari link, PDF, gambar, audio, atau file apa pun. Pilih warna, simpan riwayat, dan download sebagai PNG. File di-upload online supaya bisa di-scan dari mana saja.</p>
      </section>

      <section className="studio-grid">
        <div className="editor-card glass-panel">
          <div className="section-heading">
            <div><p className="mini-label">DEPE TAMPA</p><h2>Taru dpe barang disini</h2></div>
            <span className="live-pill"><span /> LIVE</span>
          </div>

          <div className="mode-tabs">
            {MODES.map((m) => (
              <button key={m.id} className={`mode-tab ${mode === m.id ? 'mode-active' : ''}`} onClick={() => switchMode(m.id)} type="button">
                <m.icon size={15} /> {m.label}
              </button>
            ))}
          </div>

          <div className="theme-row">
            <p className="theme-label"><Palette size={13} /> Dpe warna QR</p>
            <div className="theme-dots">
              {THEMES.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`theme-dot ${color === t.dark ? 'theme-dot-active' : ''}`}
                  style={{ background: t.preview }}
                  aria-label={t.label}
                  title={t.label}
                  onClick={() => { setColor(t.dark); setNotice(''); if (url.trim()) void generateQr(url, t.dark); }}
                />
              ))}
            </div>
          </div>

          {mode === 'link' ? (
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); void generateQr(); }}>
              <label htmlFor="qr-name">Dpe Nama QR</label>
              <input id="qr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Misalnya: Menu restoran" />
              <label htmlFor="qr-url">Isi sini dpe link</label>
              <div className="url-input"><Link2 size={17} /><input id="qr-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://website-anda.com" /></div>
              <div className="input-hint"><span>Pake link lengkap deng https://</span><span className="secure-link"><ShieldCheck size={13} /> Aman</span></div>
              <button className="generate-button" type="submit" disabled={isGenerating}>{isGenerating ? 'Lagi bekeng QR...' : 'Bekeng jo'}</button>
            </form>
          ) : (
            <form onSubmit={(e: FormEvent<HTMLFormElement>) => { e.preventDefault(); void generateQr(); }}>
              <label htmlFor="qr-name">Dpe Nama QR</label>
              <input id="qr-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Misalnya: Laporan keuangan" />
              <label htmlFor="qr-file">Pili dpe {currentMode.label}</label>
              <label className="file-drop" htmlFor="qr-file">
                <Upload size={20} />
                <span>{isUploading ? 'Lagi upload...' : fileName || `Klik untuk pili ${currentMode.label.toLowerCase()}`}</span>
                <input id="qr-file" type="file" accept={currentMode.accept} onChange={handleFile} hidden disabled={isUploading} />
              </label>
              {fileName && <div className="input-hint"><span>So pili: {fileName}</span><span className="secure-link"><ShieldCheck size={13} /> Online</span></div>}
              <button className="generate-button" type="submit" disabled={isGenerating || isUploading || !url}>
                {isUploading ? 'Lagi upload...' : isGenerating ? 'Lagi bekeng QR...' : 'Bekeng jo'}
                {isUploading && <Loader2 size={16} className="spin" />}
              </button>
            </form>
          )}

          {notice && <p className="notice"><Check size={15} /> {notice}</p>}
          <div className="editor-footer">
            <span><Clock3 size={14} /> So ta simpang otomatis</span>
            <span>{mode === 'link' ? 'Link mode' : 'File online'}</span>
          </div>
        </div>

        <div className="preview-card">
          <div className="preview-top"><p className="mini-label">DEPE HASIL</p><span className="preview-status"><span /> SIAP DI-SCAN</span></div>
          <div className="qr-stage">
            {qrData ? <img className="qr-image" src={qrData} alt="QR code" /> : <div className="qr-placeholder"><QrCode size={65} strokeWidth={1.2} /><span>QR mo muncul sini</span></div>}
          </div>
          <div className="preview-caption">
            <div><p>{name || 'QR tanpa nama'}</p><span>{url || 'Belum ada link'}</span></div>
            <button className="icon-button" onClick={() => void copyLink()} aria-label="Salin link" type="button"><Copy size={17} /></button>
          </div>
          <div className="preview-actions">
            <button className="secondary-button" onClick={downloadQr} disabled={!qrData} type="button"><Download size={16} /> Download PNG</button>
            <button className="save-button" onClick={saveQr} disabled={!qrData} type="button"><Check size={16} /> Simpang Jo</button>
          </div>
        </div>
      </section>

      <section className="history-section">
        <div className="history-heading">
          <div><p className="mini-label">DISINI DPE DATA</p><h2>QR yang so ta simpang</h2></div>
          <span>{history.length} / 20 item</span>
        </div>
        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon"><Plus size={20} /></div>
            <div><strong>Blum da QR ta simpang</strong><p>QR yang da simpang mo muncul sini, bole mo pake lagi.</p></div>
          </div>
        ) : (
          <div className="history-list">
            {history.map((item) => {
              const ModeIcon = MODES.find((m) => m.id === item.mode)?.icon ?? QrCode;
              return (
                <div className="history-item" key={item.id}>
                  <div className="history-qr"><ModeIcon size={20} /></div>
                  <div className="history-info"><strong>{item.name}</strong><span>{item.url}</span></div>
                  <span className="history-date">{dateFormatter.format(new Date(item.createdAt))}</span>
                  <button className="view-button" onClick={() => openSaved(item)} type="button"><Eye size={16} /> Buka</button>
                  <button className="delete-button" onClick={() => setHistory((items) => items.filter((s) => s.id !== item.id))} aria-label={`Hapus ${item.name}`} type="button"><Trash2 size={16} /></button>
                </div>
              );
            })}
          </div>
        )}
      </section>
      <footer><span>TOOLBOX <b>·</b> QR CODE STUDIO</span><span>Data ta simpang di perangkat ini</span></footer>
      {copied && <div className="toast"><Check size={15} /> Link so ta salin</div>}
    </main>
  );
}
