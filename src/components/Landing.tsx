import { ArrowRight, Sparkles } from 'lucide-react';
import { Brand } from './Brand';
import { TOOLS } from '../types';
import * as Icons from 'lucide-react';

interface LandingProps {
  onEnter: () => void;
}

export function Landing({ onEnter }: LandingProps) {
  return (
    <main className="landing-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <div className="ambient ambient-three" />

      <header className="landing-topbar">
        <Brand />
        <button className="primary-button landing-cta" onClick={onEnter} type="button">
          Mulai Pakai <ArrowRight size={17} />
        </button>
      </header>

      <section className="landing-hero">
        <p className="eyebrow"><Sparkles size={14} /> SATU WEBSITE, BANYAK ALAT</p>
        <h1>Semua alat yang<br /><em>anda butuh,</em><br />tanpa instal apa-apa.</h1>
        <p className="landing-lead">
          Toolbox menggabungkan alat-alat harian dalam satu tempat. Pilih alat,
          masukkan file atau link, dan hasilnya langsung bisa dipakai. Tidak perlu
          aplikasi terpisah, tidak perlu instal ini-itu.
        </p>
        <div className="landing-cta-row">
          <button className="primary-button landing-hero-cta" onClick={onEnter} type="button">
            Lihat Semua Alat <ArrowRight size={17} />
          </button>
          <span className="landing-stat">{TOOLS.length} alat siap pakai</span>
        </div>
      </section>

      <section className="landing-tools">
        {TOOLS.map((tool) => {
          const Icon = (Icons as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.Wrench;
          return (
            <button key={tool.id} className="landing-tool-card glass-panel" onClick={onEnter} type="button">
              <span className="landing-tool-icon" style={{ background: `${tool.accent}22`, color: tool.accent, borderColor: `${tool.accent}55` }}>
                <Icon size={22} />
              </span>
              <div className="landing-tool-body">
                <h3>{tool.label}</h3>
                <p>{tool.tagline}</p>
              </div>
              <ArrowRight size={18} className="landing-tool-arrow" />
            </button>
          );
        })}
      </section>

      <footer className="landing-footer">
        <span>TOOLBOX <b>·</b> ALAT SERBA ADA</span>
        <span>Tanpa instal, tanpa ribet</span>
      </footer>
    </main>
  );
}
