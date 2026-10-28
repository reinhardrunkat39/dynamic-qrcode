import { useState, useRef, useCallback } from 'react';
import { ArrowLeft, Download, ScanLine, Upload, Trash2, ArrowUp, ArrowDown, Crop, RotateCw, Loader2, FileText, Check } from 'lucide-react';
import { Brand } from './Brand';
import jsPDF from 'jspdf';

interface Page {
  id: string;
  img: HTMLImageElement | null;
  src: string;
  rotation: number;
  crop: { x: number; y: number; w: number; h: number } | null;
  name: string;
}

interface Img2PdfProps {
  onBack: () => void;
}

export function Img2Pdf({ onBack }: Img2PdfProps) {
  const [pages, setPages] = useState<Page[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [done, setDone] = useState(false);
  const [pdfName, setPdfName] = useState('Dokumen');
  const [cropping, setCropping] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const cameraInput = useRef<HTMLInputElement>(null);

  const selectedPage = pages.find((p) => p.id === selectedId) ?? null;

  const addFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    const newPages: Page[] = [];
    let processed = 0;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) return;
      const reader = new FileReader();
      reader.onload = () => {
        const src = reader.result as string;
        const img = new Image();
        img.onload = () => {
          newPages.push({
            id: crypto.randomUUID(),
            img,
            src,
            rotation: 0,
            crop: null,
            name: file.name.replace(/\.[^.]+$/, ''),
          });
          processed++;
          if (processed === Array.from(files).filter((f) => f.type.startsWith('image/')).length) {
            setPages((prev) => [...prev, ...newPages]);
            if (newPages.length > 0 && !selectedId) setSelectedId(newPages[0].id);
          }
        };
        img.src = src;
      };
      reader.readAsDataURL(file);
    });
    setDone(false);
  }, [selectedId]);

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files);
    e.target.value = '';
  }

  function removePage(id: string) {
    setPages((prev) => {
      const filtered = prev.filter((p) => p.id !== id);
      if (selectedId === id) setSelectedId(filtered[0]?.id ?? null);
      return filtered;
    });
    setDone(false);
  }

  function movePage(id: string, dir: -1 | 1) {
    setPages((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx < 0) return prev;
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= prev.length) return prev;
      const copy = [...prev];
      [copy[idx], copy[newIdx]] = [copy[newIdx], copy[idx]];
      return copy;
    });
    setDone(false);
  }

  function rotatePage(id: string) {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p)));
    setDone(false);
  }

  function applyCrop(id: string, crop: { x: number; y: number; w: number; h: number }) {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, crop } : p)));
    setCropping(false);
    setDone(false);
  }

  function clearCrop(id: string) {
    setPages((prev) => prev.map((p) => (p.id === id ? { ...p, crop: null } : p)));
    setDone(false);
  }

  async function generatePdf() {
    if (pages.length === 0) return;
    setIsGenerating(true);
    setDone(false);
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();

      for (let i = 0; i < pages.length; i++) {
        const page = pages[i];
        if (!page.img) continue;
        if (i > 0) pdf.addPage();

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) continue;

        const img = page.img;
        let sx = 0, sy = 0, sw = img.naturalWidth, sh = img.naturalHeight;

        if (page.crop) {
          sx = page.crop.x * img.naturalWidth;
          sy = page.crop.y * img.naturalHeight;
          sw = page.crop.w * img.naturalWidth;
          sh = page.crop.h * img.naturalHeight;
        }

        const rotRad = (page.rotation * Math.PI) / 180;
        const cos = Math.abs(Math.cos(rotRad));
        const sin = Math.abs(Math.sin(rotRad));
        const outW = sw * cos + sh * sin;
        const outH = sw * sin + sh * cos;

        canvas.width = outW;
        canvas.height = outH;
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, outW, outH);
        ctx.save();
        ctx.translate(outW / 2, outH / 2);
        ctx.rotate(rotRad);
        ctx.drawImage(img, -sw / 2, -sh / 2, sw, sh);
        ctx.restore();

        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        const ratio = outW / outH;
        const pageRatio = pageW / pageH;
        let drawW: number, drawH: number;
        if (ratio > pageRatio) {
          drawW = pageW;
          drawH = pageW / ratio;
        } else {
          drawH = pageH;
          drawW = pageH * ratio;
        }
        const x = (pageW - drawW) / 2;
        const y = (pageH - drawH) / 2;
        pdf.addImage(dataUrl, 'JPEG', x, y, drawW, drawH);
      }

      pdf.save(`${pdfName.trim() || 'dokumen'}.pdf`);
      setDone(true);
    } catch {
      // ignore
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup">
          <button className="brand-back-btn" onClick={onBack} type="button" aria-label="Kembali"><ArrowLeft size={18} /></button>
          <span className="brand-mark" style={{ color: '#1b9e5a' }}><ScanLine size={19} strokeWidth={2.5} /></span>
          <span>Toolbox<span className="brand-dot">.</span></span>
        </div>
        <nav><span className="nav-active">Scan ke PDF</span></nav>
        <button className="logout-button" onClick={onBack} type="button"><ArrowLeft size={15} /> Semua Alat</button>
      </header>

      <section className="hero-copy">
        <div>
          <p className="eyebrow"><ScanLine size={14} /> SCAN DOKUMEN</p>
          <h1>Gambar<br /><em>jadi PDF.</em></h1>
        </div>
        <p className="hero-description">Ambil foto atau unggah gambar dokumen, potong bagian yang diperlukan, atur urutan halaman, lalu gabungkan menjadi satu file PDF yang rapi.</p>
      </section>

      <section className="img2pdf-layout">
        <div className="editor-card glass-panel img2pdf-editor">
          <div className="section-heading">
            <div><p className="mini-label">HALAMAN</p><h2>Tambah halaman</h2></div>
            <span className="live-pill"><span /> {pages.length} HAL</span>
          </div>

          <div className="img2pdf-upload-row">
            <label className="file-drop img2pdf-drop" htmlFor="img-file">
              <Upload size={20} />
              <span>Unggah Gambar</span>
              <input id="img-file" type="file" accept="image/*" multiple onChange={handleFileInput} hidden ref={fileInput} />
            </label>
            <label className="file-drop img2pdf-drop" htmlFor="cam-file">
              <ScanLine size={20} />
              <span>Ambil Foto</span>
              <input id="cam-file" type="file" accept="image/*" capture="environment" multiple onChange={handleFileInput} hidden ref={cameraInput} />
            </label>
          </div>

          <label htmlFor="pdf-name" className="mt-4">Nama File PDF</label>
          <input id="pdf-name" value={pdfName} onChange={(e) => setPdfName(e.target.value)} placeholder="Misalnya: KTP, Ijazah, Surat" />

          {pages.length > 0 && (
            <div className="page-list">
              {pages.map((page, i) => (
                <div key={page.id} className={`page-item ${selectedId === page.id ? 'page-selected' : ''}`} onClick={() => setSelectedId(page.id)}>
                  <span className="page-num">{i + 1}</span>
                  <img src={page.src} alt={page.name} className="page-thumb" style={{ transform: `rotate(${page.rotation}deg)` }} />
                  <span className="page-name">{page.name}{page.crop ? ' ✂' : ''}</span>
                  <div className="page-controls" onClick={(e) => e.stopPropagation()}>
                    <button type="button" onClick={() => movePage(page.id, -1)} disabled={i === 0} aria-label="Naik"><ArrowUp size={14} /></button>
                    <button type="button" onClick={() => movePage(page.id, 1)} disabled={i === pages.length - 1} aria-label="Turun"><ArrowDown size={14} /></button>
                    <button type="button" onClick={() => removePage(page.id)} aria-label="Hapus"><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {pages.length === 0 && (
            <div className="empty-state mt-4">
              <div className="empty-icon"><FileText size={20} /></div>
              <div><strong>Belum ada halaman</strong><p>Unggah gambar atau ambil foto untuk mulai.</p></div>
            </div>
          )}

          {done && <p className="notice mt-4"><Check size={15} /> PDF so ta download!</p>}

          <button className="generate-button mt-4" onClick={() => void generatePdf()} disabled={pages.length === 0 || isGenerating} type="button">
            {isGenerating ? 'Lagi bekeng PDF...' : <><Download size={16} /> Buat & Download PDF</>}
            {isGenerating && <Loader2 size={16} className="spin" />}
          </button>
        </div>

        <div className="preview-card img2pdf-preview">
          <div className="preview-top"><p className="mini-label">PRATINJAU</p><span className="preview-status"><span /> {selectedPage ? 'HALAMAN DIPILIH' : 'KOSONG'}</span></div>
          {selectedPage ? (
            <div className="img2pdf-stage">
              <CropEditor page={selectedPage} cropping={cropping} onCrop={applyCrop} onClearCrop={clearCrop} onRotate={rotatePage} onToggleCrop={() => setCropping((c) => !c)} />
            </div>
          ) : (
            <div className="qr-placeholder img2pdf-empty"><ScanLine size={50} strokeWidth={1.2} /><span>Pilih halaman untuk pratinjau</span></div>
          )}
        </div>
      </section>
      <footer><span>TOOLBOX <b>·</b> SCAN KE PDF</span><span>Diproses di perangkat Anda</span></footer>
    </main>
  );
}

interface CropEditorProps {
  page: Page;
  cropping: boolean;
  onCrop: (id: string, crop: { x: number; y: number; w: number; h: number }) => void;
  onClearCrop: (id: string) => void;
  onRotate: (id: string) => void;
  onToggleCrop: () => void;
}

function CropEditor({ page, cropping, onCrop, onClearCrop, onRotate, onToggleCrop }: CropEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [start, setStart] = useState<{ x: number; y: number } | null>(null);
  const [end, setEnd] = useState<{ x: number; y: number } | null>(null);

  function handleMouseDown(e: React.MouseEvent) {
    if (!cropping || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setStart({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
    setEnd(null);
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!cropping || !start || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setEnd({ x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height });
  }

  function handleMouseUp() {
    if (!cropping || !start || !end) return;
    const x = Math.min(start.x, end.x);
    const y = Math.min(start.y, end.y);
    const w = Math.abs(end.x - start.x);
    const h = Math.abs(end.y - start.y);
    if (w > 0.05 && h > 0.05) {
      onCrop(page.id, { x, y, w, h });
    }
    setStart(null);
    setEnd(null);
  }

  const cropBox = start && end ? {
    left: `${Math.min(start.x, end.x) * 100}%`,
    top: `${Math.min(start.y, end.y) * 100}%`,
    width: `${Math.abs(end.x - start.x) * 100}%`,
    height: `${Math.abs(end.y - start.y) * 100}%`,
  } : null;

  return (
    <div className="crop-editor">
      <div className="crop-toolbar">
        <button type="button" className={`crop-tool-btn ${cropping ? 'crop-active' : ''}`} onClick={onToggleCrop}>
          <Crop size={15} /> {cropping ? 'Selesai Potong' : 'Potong'}
        </button>
        <button type="button" className="crop-tool-btn" onClick={() => onRotate(page.id)}>
          <RotateCw size={15} /> Putar 90°
        </button>
        {page.crop && (
          <button type="button" className="crop-tool-btn" onClick={() => onClearCrop(page.id)}>
            <Trash2 size={15} /> Hapus Potongan
          </button>
        )}
      </div>
      <div
        ref={containerRef}
        className={`crop-area ${cropping ? 'cropping' : ''}`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <img src={page.src} alt={page.name} className="crop-img" style={{ transform: `rotate(${page.rotation}deg)` }} />
        {page.crop && !cropping && (
          <div className="crop-overlay" style={{
            left: `${page.crop.x * 100}%`,
            top: `${page.crop.y * 100}%`,
            width: `${page.crop.w * 100}%`,
            height: `${page.crop.h * 100}%`,
          }} />
        )}
        {cropBox && <div className="crop-selecting" style={cropBox} />}
      </div>
      {cropping && <p className="crop-hint">Klik dan tarik untuk memilih area yang mau dipotong</p>}
    </div>
  );
}
