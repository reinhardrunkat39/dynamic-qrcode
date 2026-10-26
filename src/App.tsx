import { FormEvent, useEffect, useMemo, useState } from 'react';
import QRCode from 'qrcode';
import {
  ArrowUpRight,
  Check,
  Clock3,
  Copy,
  Download,
  Eye,
  Link2,
  LockKeyhole,
  LogOut,
  Plus,
  QrCode,
  ShieldCheck,
  Sparkles,
  Trash2,
  WandSparkles,
} from 'lucide-react';

type SavedQr = {
  id: string;
  name: string;
  url: string;
  createdAt: string;
};

const STORAGE_KEY = 'clarity-qr-history';
const SESSION_KEY = 'clarity-qr-session';
const DEFAULT_URL = 'https://clarity.studio/welcome';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(() => sessionStorage.getItem(SESSION_KEY) === 'true');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [url, setUrl] = useState(DEFAULT_URL);
  const [name, setName] = useState('Website utama');
  const [qrData, setQrData] = useState('');
  const [history, setHistory] = useState<SavedQr[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) as SavedQr[] : [];
  });
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [notice, setNotice] = useState('');

  const formattedDate = useMemo(() => new Intl.DateTimeFormat('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  }), []);

  useEffect(() => {
    if (!isLoggedIn) return;
    void QRCode.toDataURL(DEFAULT_URL, {
      width: 720,
      margin: 2,
      color: { dark: '#102f50', light: '#ffffff' },
      errorCorrectionLevel: 'H',
    }).then(setQrData);
  }, [isLoggedIn]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  }, [history]);

  async function generateQr(value: string = url) {
    if (!value.trim()) {
      setNotice('Masukkan link terlebih dahulu.');
      return;
    }
    setIsGenerating(true);
    setNotice('');
    try {
      const image = await QRCode.toDataURL(value.trim(), {
        width: 720,
        margin: 2,
        color: { dark: '#102f50', light: '#ffffff' },
        errorCorrectionLevel: 'H',
      });
      setQrData(image);
    } catch {
      setNotice('Link belum bisa dibuat menjadi QR. Coba periksa kembali.');
    } finally {
      setIsGenerating(false);
    }
  }

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const configuredPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'clarity';
    if (password === configuredPassword) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Password belum sesuai.');
    }
  }

  function handleSave() {
    if (!qrData || !url.trim()) {
      setNotice('Buat QR terlebih dahulu sebelum menyimpan.');
      return;
    }
    const nextItem: SavedQr = {
      id: crypto.randomUUID(),
      name: name.trim() || 'QR tanpa nama',
      url: url.trim(),
      createdAt: new Date().toISOString(),
    };
    setHistory((current) => [nextItem, ...current].slice(0, 8));
    setNotice('QR berhasil disimpan di perangkat ini.');
  }

  async function copyUrl(value: string) {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  function downloadQr() {
    if (!qrData) return;
    const link = document.createElement('a');
    link.href = qrData;
    link.download = `${name.trim() || 'clarity-qr'}.png`;
    link.click();
  }

  function selectSaved(item: SavedQr) {
    setName(item.name);
    setUrl(item.url);
    void generateQr(item.url);
  }

  function deleteSaved(id: string) {
    setHistory((current) => current.filter((item) => item.id !== id));
  }

  function logout() {
    sessionStorage.removeItem(SESSION_KEY);
    setIsLoggedIn(false);
  }

  if (!isLoggedIn) {
    return (
      <main className="login-shell">
        <div className="ambient ambient-one" />
        <div className="ambient ambient-two" />
        <section className="login-card glass-panel">
          <div className="brand-lockup"><span className="brand-mark"><QrCode size={19} strokeWidth={2.5} /></span><span>clarity<span className="brand-dot">.</span></span></div>
          <div className="login-icon"><LockKeyhole size={25} /></div>
          <p className="eyebrow">PRIVATE WORKSPACE</p>
          <h1>Selamat datang<br /><em>kembali.</em></h1>
          <p className="login-copy">Kelola QR code yang selalu siap dipakai, dari satu ruang yang tenang.</p>
          <form onSubmit={handleLogin} className="login-form">
            <label htmlFor="password">Password akses</label>
            <input id="password" type="password" placeholder="Masukkan password" value={password} onChange={(event) => setPassword(event.target.value)} autoFocus />
            {loginError && <span className="form-error">{loginError}</span>}
            <button className="primary-button" type="submit">Masuk ke workspace <ArrowUpRight size={18} /></button>
          </form>
          <div className="secure-note"><ShieldCheck size={15} /> Workspace privat untuk tim Anda</div>
        </section>
        <p className="page-signature">clarity studio <span>·</span> simple tools for clear ideas</p>
      </main>
    );
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup"><span className="brand-mark"><QrCode size={19} strokeWidth={2.5} /></span><span>clarity<span className="brand-dot">.</span></span></div>
        <nav><span className="nav-active">QR Studio</span><span>Activity</span><span>Settings</span></nav>
        <button className="logout-button" onClick={logout}><LogOut size={15} /> Keluar</button>
      </header>

      <section className="hero-copy">
        <div><p className="eyebrow"><Sparkles size={14} /> QR STUDIO</p><h1>Share with<br /><em>clarity.</em></h1></div>
        <p className="hero-description">Buat QR code yang bersih, mudah dipakai, dan selalu membawa orang ke tempat yang tepat.</p>
      </section>

      <section className="studio-grid">
        <div className="editor-card glass-panel">
          <div className="section-heading"><div><p className="mini-label">01 / DESTINATION</p><h2>Atur tujuan QR</h2></div><span className="live-pill"><span /> LIVE</span></div>
          <form onSubmit={(event) => { event.preventDefault(); void generateQr(); }}>
            <label htmlFor="qr-name">Nama QR</label>
            <input id="qr-name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Misalnya: Menu restoran" />
            <label htmlFor="qr-url">Link tujuan</label>
            <div className="url-input"><Link2 size={17} /><input id="qr-url" value={url} onChange={(event) => setUrl(event.target.value)} placeholder="https://website-anda.com" /></div>
            <div className="input-hint"><span>Gunakan link lengkap dengan https://</span><span className="secure-link"><ShieldCheck size={13} /> Aman</span></div>
            <button className="generate-button" type="submit" disabled={isGenerating}>{isGenerating ? 'Membuat QR...' : 'Buat QR code'} <WandSparkles size={17} /></button>
          </form>
          {notice && <p className="notice"><Check size={15} /> {notice}</p>}
          <div className="editor-footer"><span><Clock3 size={14} /> Tersimpan otomatis di browser</span><span>Tanpa database</span></div>
        </div>

        <div className="preview-card">
          <div className="preview-top"><p className="mini-label">02 / PREVIEW</p><span className="preview-status"><span /> READY TO SHARE</span></div>
          <div className="qr-stage">
            {qrData ? <img className="qr-image" src={qrData} alt="QR code untuk link tujuan" /> : <div className="qr-placeholder"><QrCode size={65} strokeWidth={1.2} /><span>QR Anda akan muncul di sini</span></div>}
          </div>
          <div className="preview-caption"><div><p>{name || 'QR tanpa nama'}</p><span>{url || 'Belum ada link'}</span></div><button className="icon-button" onClick={() => void copyUrl(url)} aria-label="Salin link"><Copy size={17} /></button></div>
          <div className="preview-actions"><button className="secondary-button" onClick={downloadQr} disabled={!qrData}><Download size={16} /> Download PNG</button><button className="save-button" onClick={handleSave} disabled={!qrData}><Check size={16} /> Simpan</button></div>
        </div>
      </section>

      <section className="history-section"><div className="history-heading"><div><p className="mini-label">03 / YOUR LIBRARY</p><h2>QR tersimpan</h2></div><span>{history.length} / 8 item</span></div>
        {history.length === 0 ? <div className="empty-state"><div className="empty-icon"><Plus size={20} /></div><div><strong>Belum ada QR tersimpan</strong><p>QR yang Anda simpan akan muncul di sini untuk dipakai lagi.</p></div></div> : <div className="history-list">{history.map((item) => <div className="history-item" key={item.id}><div className="history-qr"><QrCode size={22} /></div><div className="history-info"><strong>{item.name}</strong><span>{item.url}</span></div><span className="history-date">{formattedDate.format(new Date(item.createdAt))}</span><button className="view-button" onClick={() => selectSaved(item)}><Eye size={16} /> Buka</button><button className="delete-button" onClick={() => deleteSaved(item.id)} aria-label={`Hapus ${item.name}`}><Trash2 size={16} /></button></div>)}</div>}
      </section>
      <footer><span>clarity studio <b>·</b> QR made simple</span><span>Semua data tersimpan di perangkat ini</span></footer>
      {copied && <div className="toast"><Check size={15} /> Link berhasil disalin</div>}
    </main>
  );
}

export default App;
