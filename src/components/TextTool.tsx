import { useState, useMemo } from 'react';
import { ArrowLeft, Type, Copy, Check, Eraser, CaseSensitive, AlignLeft, BookOpen, Wand2, FileDown } from 'lucide-react';

interface TextToolProps {
  onBack: () => void;
}

type CaseMode = 'upper' | 'lower' | 'title' | 'sentence';

export function TextTool({ onBack }: TextToolProps) {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'transform' | 'count' | 'citation'>('transform');

  // Citation state
  const [citeType, setCiteType] = useState<'book' | 'web' | 'journal'>('book');
  const [citeStyle, setCiteStyle] = useState<'apa' | 'mla'>('apa');
  const [citeFields, setCiteFields] = useState({
    author: '', title: '', year: '', publisher: '', url: '', site: '', journal: '', volume: '', issue: '', pages: '', accessed: '',
  });
  const [citationList, setCitationList] = useState<string[]>([]);

  const stats = useMemo(() => {
    const text = input.trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = input.length;
    const charsNoSpace = input.replace(/\s/g, '').length;
    const sentences = text ? text.split(/[.!?]+/).filter((s) => s.trim()).length : 0;
    const paragraphs = text ? text.split(/\n\s*\n/).filter((s) => s.trim()).length : 0;
    const lines = input.split('\n').length;
    const readTime = Math.ceil(words / 200);
    return { words, chars, charsNoSpace, sentences, paragraphs, lines, readTime };
  }, [input]);

  function applyCase(mode: CaseMode) {
    let result = input;
    switch (mode) {
      case 'upper': result = input.toUpperCase(); break;
      case 'lower': result = input.toLowerCase(); break;
      case 'title':
        result = input.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
        break;
      case 'sentence':
        result = input.toLowerCase().replace(/(^\s*\w|[.!?]\s*\w)/g, (c) => c.toUpperCase());
        break;
    }
    setOutput(result);
  }

  function cleanText(mode: 'duplicates' | 'spaces' | 'emptylines' | 'trim') {
    let result = input;
    switch (mode) {
      case 'duplicates': {
        const seen = new Set<string>();
        result = input.split('\n').filter((line) => {
          const key = line.trim();
          if (!key) return true;
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        }).join('\n');
        break;
      }
      case 'spaces':
        result = input.replace(/[ \t]+/g, ' ').replace(/^[ \t]+|[ \t]+$/gm, '');
        break;
      case 'emptylines':
        result = input.replace(/\n{3,}/g, '\n\n').replace(/^\n+|\n+$/g, '');
        break;
      case 'trim':
        result = input.split('\n').map((l) => l.trim()).filter((l) => l.length > 0).join('\n');
        break;
    }
    setOutput(result);
  }

  function generateCitation(): string {
    const f = citeFields;
    const authors = f.author.split(',').map((a) => a.trim()).filter(Boolean);

    if (citeStyle === 'apa') {
      const authorStr = authors.length > 0
        ? authors.map((a) => {
            const parts = a.split(' ').filter(Boolean);
            if (parts.length >= 2) return `${parts[parts.length - 1]}, ${parts[0][0]}.`;
            return a;
          }).join(', ')
        : 'Anonim';

      switch (citeType) {
        case 'book':
          return `${authorStr} (${f.year || 'n.d.'}). ${f.title || 'Tanpa judul'}.${f.publisher ? ` ${f.publisher}.` : ''}`;
        case 'web':
          return `${authorStr} (${f.year || 'n.d.'}). ${f.title || 'Tanpa judul'}.${f.site ? ` ${f.site}.` : ''} ${f.url || ''}${f.accessed ? ` Diakses ${f.accessed}` : ''}`;
        case 'journal':
          return `${authorStr} (${f.year || 'n.d.'}). ${f.title || 'Tanpa judul'}.${f.journal ? ` ${f.journal},` : ''}${f.volume ? ` ${f.volume}` : ''}${f.issue ? `(${f.issue})` : ''}${f.pages ? `, ${f.pages}` : ''}.`;
      }
    } else {
      const authorStr = authors.length > 0 ? authors.join(', ') : 'Anonim';
      switch (citeType) {
        case 'book':
          return `${authorStr}. ${f.title || 'Tanpa judul'}.${f.publisher ? ` ${f.publisher},` : ''}${f.year ? ` ${f.year}` : ''}.`;
        case 'web':
          return `${authorStr}. "${f.title || 'Tanpa judul'}."${f.site ? ` ${f.site},` : ''}${f.url ? ` ${f.url}` : ''}${f.accessed ? ` Diakses ${f.accessed}` : ''}.`;
        case 'journal':
          return `${authorStr}. "${f.title || 'Tanpa judul'}."${f.journal ? ` ${f.journal},` : ''} vol. ${f.volume || ''}${f.issue ? ` no. ${f.issue}` : ''}${f.year ? ` ${f.year}` : ''}${f.pages ? `, pp. ${f.pages}` : ''}.`;
      }
    }
  }

  function addCitation() {
    const c = generateCitation();
    if (c) setCitationList((prev) => [...prev, c]);
  }

  function downloadBibliography() {
    const text = citationList.map((c, i) => `${i + 1}. ${c}`).join('\n\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'daftar-pustaka.txt';
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function copyOutput() {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  const tabBtn = (id: typeof activeTab, label: string, Icon: typeof Type) => (
    <button type="button" className={`mode-tab ${activeTab === id ? 'mode-active' : ''}`} onClick={() => setActiveTab(id)}>
      <Icon size={15} /> {label}
    </button>
  );

  const setField = (key: keyof typeof citeFields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setCiteFields((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <div className="brand-lockup">
          <button className="brand-back-btn" onClick={onBack} type="button" aria-label="Kembali"><ArrowLeft size={18} /></button>
          <span className="brand-mark" style={{ color: '#e0a82e' }}><Type size={19} strokeWidth={2.5} /></span>
          <span>Toolbox<span className="brand-dot">.</span></span>
        </div>
        <nav><span className="nav-active">Text &amp; Document</span></nav>
        <button className="logout-button" onClick={onBack} type="button"><ArrowLeft size={15} /> Semua Alat</button>
      </header>

      <section className="hero-copy">
        <div>
          <p className="eyebrow"><Type size={14} /> TEXT TOOLS</p>
          <h1>Rapikan<br /><em>teks &amp; dokumen.</em></h1>
        </div>
        <p className="hero-description">Hitung kata dan karakter, ubah huruf besar/kecil, rapikan teks, hapus baris ganda, serta buat sitasi dan daftar pustaka dengan format standar.</p>
      </section>

      <section className="tool-single">
        <div className="editor-card glass-panel text-tool-card">
          <div className="section-heading">
            <div><p className="mini-label">ALAT TEKS</p><h2>Pilih yang dibutuhkan</h2></div>
            <span className="live-pill"><span /> SIAP</span>
          </div>

          <div className="mode-tabs">
            {tabBtn('transform', 'Ubah Teks', Wand2)}
            {tabBtn('count', 'Hitung Kata', AlignLeft)}
            {tabBtn('citation', 'Sitasi', BookOpen)}
          </div>

          {activeTab === 'transform' && (
            <div className="text-transform">
              <label htmlFor="text-input">Masukkan teks</label>
              <textarea id="text-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tempel atau ketik teks di sini..." rows={6} />

              <p className="text-section-label"><CaseSensitive size={14} /> Ubah Huruf</p>
              <div className="text-btn-grid">
                <button type="button" className="text-action-btn" onClick={() => applyCase('upper')}>HURUF BESAR</button>
                <button type="button" className="text-action-btn" onClick={() => applyCase('lower')}>huruf kecil</button>
                <button type="button" className="text-action-btn" onClick={() => applyCase('title')}>Title Case</button>
                <button type="button" className="text-action-btn" onClick={() => applyCase('sentence')}>Sentence case</button>
              </div>

              <p className="text-section-label"><Eraser size={14} /> Rapikan Teks</p>
              <div className="text-btn-grid">
                <button type="button" className="text-action-btn" onClick={() => cleanText('duplicates')}>Hapus Baris Ganda</button>
                <button type="button" className="text-action-btn" onClick={() => cleanText('spaces')}>Rapikan Spasi</button>
                <button type="button" className="text-action-btn" onClick={() => cleanText('emptylines')}>Hapus Baris Kosong</button>
                <button type="button" className="text-action-btn" onClick={() => cleanText('trim')}>Trim Baris</button>
              </div>

              {output && (
                <div className="text-output">
                  <div className="text-output-head">
                    <span className="mini-label">HASIL</span>
                    <button type="button" className="icon-button" onClick={() => void copyOutput()}>{copied ? <Check size={16} /> : <Copy size={16} />} Salin</button>
                  </div>
                  <pre className="text-output-body">{output}</pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'count' && (
            <div className="text-count">
              <label htmlFor="count-input">Masukkan teks untuk dihitung</label>
              <textarea id="count-input" value={input} onChange={(e) => setInput(e.target.value)} placeholder="Tempel teks di sini..." rows={8} />
              <div className="stats-grid">
                <StatBox label="Kata" value={stats.words} />
                <StatBox label="Karakter" value={stats.chars} />
                <StatBox label="Tanpa Spasi" value={stats.charsNoSpace} />
                <StatBox label="Kalimat" value={stats.sentences} />
                <StatBox label="Paragraf" value={stats.paragraphs} />
                <StatBox label="Baris" value={stats.lines} />
                <StatBox label="Waktu Baca" value={`${stats.readTime} mnt`} />
              </div>
            </div>
          )}

          {activeTab === 'citation' && (
            <div className="text-citation">
              <div className="cite-controls">
                <div className="cite-group">
                  <label>Jenis Sumber</label>
                  <select value={citeType} onChange={(e) => setCiteType(e.target.value as typeof citeType)}>
                    <option value="book">Buku</option>
                    <option value="web">Website</option>
                    <option value="journal">Jurnal</option>
                  </select>
                </div>
                <div className="cite-group">
                  <label>Format</label>
                  <select value={citeStyle} onChange={(e) => setCiteStyle(e.target.value as typeof citeStyle)}>
                    <option value="apa">APA</option>
                    <option value="mla">MLA</option>
                  </select>
                </div>
              </div>

              <div className="cite-fields">
                <label>Penulis (pisah dengan koma)</label>
                <input value={citeFields.author} onChange={setField('author')} placeholder="Nama, Nama" />
                <label>Judul</label>
                <input value={citeFields.title} onChange={setField('title')} placeholder="Judul karya" />
                <label>Tahun</label>
                <input value={citeFields.year} onChange={setField('year')} placeholder="2024" />

                {citeType === 'book' && (
                  <>
                    <label>Penerbit</label>
                    <input value={citeFields.publisher} onChange={setField('publisher')} placeholder="Nama penerbit" />
                  </>
                )}
                {citeType === 'web' && (
                  <>
                    <label>Nama Situs</label>
                    <input value={citeFields.site} onChange={setField('site')} placeholder="Nama website" />
                    <label>URL</label>
                    <input value={citeFields.url} onChange={setField('url')} placeholder="https://..." />
                    <label>Tanggal Akses</label>
                    <input value={citeFields.accessed} onChange={setField('accessed')} placeholder="28 Okt 2026" />
                  </>
                )}
                {citeType === 'journal' && (
                  <>
                    <label>Nama Jurnal</label>
                    <input value={citeFields.journal} onChange={setField('journal')} placeholder="Nama jurnal" />
                    <div className="cite-row">
                      <div><label>Volume</label><input value={citeFields.volume} onChange={setField('volume')} placeholder="12" /></div>
                      <div><label>Nomor</label><input value={citeFields.issue} onChange={setField('issue')} placeholder="3" /></div>
                    </div>
                    <label>Halaman</label>
                    <input value={citeFields.pages} onChange={setField('pages')} placeholder="45-67" />
                  </>
                )}
              </div>

              <button className="generate-button" type="button" onClick={addCitation}><BookOpen size={16} /> Tambah Sitasi</button>

              {citationList.length > 0 && (
                <div className="citation-list">
                  <div className="text-output-head">
                    <span className="mini-label">DAFTAR PUSTAKA ({citationList.length})</span>
                    <button type="button" className="icon-button" onClick={downloadBibliography}><FileDown size={16} /> Download .txt</button>
                  </div>
                  <div className="citation-entries">
                    {citationList.map((c, i) => (
                      <div key={i} className="citation-entry">
                        <span className="cite-num">{i + 1}.</span>
                        <span className="cite-text">{c}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>
      <footer><span>TOOLBOX <b>·</b> TEXT TOOLS</span><span>Diproses di perangkat Anda</span></footer>
    </main>
  );
}

function StatBox({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="stat-box">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
