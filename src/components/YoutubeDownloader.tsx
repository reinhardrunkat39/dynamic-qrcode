import { useState } from 'react';
import { ArrowLeft, Download, Loader2, Music, Video, Youtube, AlertCircle, Check } from 'lucide-react';
import { Brand } from './Brand';

type Format = 'audio' | 'video';

interface YtProps {
  onBack: () => void;
}

export function YoutubeDownloader({ onBack }: YtProps) {
  const [url, setUrl] = useState('');
  const [format, setFormat] = useState<Format>('audio');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [title, setTitle] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  async function handleDownload(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed || !trimmed.includes('youtube.com') && !trimmed.includes('youtu.be')) {
      setStatus('error');
      setErrorMsg('Masukkan link YouTube yang valid.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');
    setDownloadUrl('');
    setTitle('');

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ytdl`;
      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ url: trimmed, format }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({}));
        throw new Error(errBody.error || `Gagal (${res.status})`);
      }

      const data = await res.json();
      if (!data.downloadUrl) throw new Error('Tidak ada link download dari server.');
      setDownloadUrl(data.downloadUrl);
      setTitle(data.title || 'File YouTube');
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'Terjadi kesalahan, coba lagi.');
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup">
          <button className="brand-back-btn" onClick={onBack} type="button" aria-label="Kembali"><ArrowLeft size={18} /></button>
          <span className="brand-mark" style={{ color: '#e23b4f' }}><Youtube size={19} strokeWidth={2.5} /></span>
          <span>Toolbox<span className="brand-dot">.</span></span>
        </div>
        <nav><span className="nav-active">YouTube Downloader</span></nav>
        <button className="logout-button" onClick={onBack} type="button"><ArrowLeft size={15} /> Semua Alat</button>
      </header>

      <section className="hero-copy">
        <div>
          <p className="eyebrow"><Youtube size={14} /> DOWNLOADER</p>
          <h1>Download<br /><em>audio &amp; video.</em></h1>
        </div>
        <p className="hero-description">Tempel link YouTube, pilih format audio (MP3) atau video (MP4), lalu download langsung. Tanpa instal aplikasi tambahan.</p>
      </section>

      <section className="tool-single">
        <div className="editor-card glass-panel">
          <div className="section-heading">
            <div><p className="mini-label">LINK YOUTUBE</p><h2>Masukkan link video</h2></div>
            <span className="live-pill"><span /> SIAP</span>
          </div>

          <div className="format-toggle">
            <button
              type="button"
              className={`format-btn ${format === 'audio' ? 'format-active' : ''}`}
              onClick={() => setFormat('audio')}
            >
              <Music size={18} /> Audio (MP3)
            </button>
            <button
              type="button"
              className={`format-btn ${format === 'video' ? 'format-active' : ''}`}
              onClick={() => setFormat('video')}
            >
              <Video size={18} /> Video (MP4)
            </button>
          </div>

          <form onSubmit={handleDownload} className="tool-form">
            <label htmlFor="yt-url">Link YouTube</label>
            <div className="url-input"><Youtube size={17} /><input id="yt-url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://youtube.com/watch?v=..." /></div>
            <div className="input-hint"><span>Tempel link lengkap dari YouTube</span></div>
            <button className="generate-button" type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Lagi proses...' : 'Proses & Siapkan Download'}
              {status === 'loading' && <Loader2 size={16} className="spin" />}
            </button>
          </form>

          {status === 'error' && (
            <div className="result-error"><AlertCircle size={16} /> {errorMsg}</div>
          )}

          {status === 'done' && (
            <div className="result-success">
              <div className="result-success-info"><Check size={18} /><div><strong>{title}</strong><span>Siap untuk di-download</span></div></div>
              <a className="generate-button result-download-btn" href={downloadUrl} download target="_blank" rel="noopener noreferrer">
                <Download size={18} /> Download Sekarang
              </a>
            </div>
          )}

          <div className="editor-footer">
            <span><AlertCircle size={14} /> Proses di server, mungkin butuh beberapa detik</span>
            <span>Format: {format === 'audio' ? 'MP3' : 'MP4'}</span>
          </div>
        </div>
      </section>
      <footer><span>TOOLBOX <b>·</b> YOUTUBE DOWNLOADER</span><span>Hanya untuk konten yang bebas diunduh</span></footer>
    </main>
  );
}
