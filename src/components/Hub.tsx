import { ArrowLeft, Sparkles } from 'lucide-react';
import { Brand } from './Brand';
import { TOOLS, ToolId } from '../types';
import * as Icons from 'lucide-react';

interface HubProps {
  onHome: () => void;
  onSelect: (tool: ToolId) => void;
}

export function Hub({ onHome, onSelect }: HubProps) {
  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="topbar">
        <Brand onHome={onHome} />
        <nav>
          <span className="nav-active">Semua Alat</span>
        </nav>
        <button className="logout-button" onClick={onHome} type="button">
          <ArrowLeft size={15} /> Beranda
        </button>
      </header>

      <section className="hero-copy">
        <div>
          <p className="eyebrow"><Sparkles size={14} /> PILIH ALAT</p>
          <h1>Pilih jo<br /><em>yang dibutuhkan.</em></h1>
        </div>
        <p className="hero-description">
          Satu website, banyak alat. Pilih yang dibutuhkan di bawah ini, masukkan
          file atau link, dan hasilnya langsung bisa dipakai.
        </p>
      </section>

      <section className="hub-grid">
        {TOOLS.map((tool) => {
          const Icon = (Icons as Record<string, Icons.LucideIcon>)[tool.icon] ?? Icons.Wrench;
          return (
            <button
              key={tool.id}
              className="hub-card glass-panel"
              onClick={() => onSelect(tool.id)}
              type="button"
              style={{ ['--tool-accent' as string]: tool.accent }}
            >
              <span className="hub-card-icon" style={{ background: `${tool.accent}22`, color: tool.accent, borderColor: `${tool.accent}55` }}>
                <Icon size={26} />
              </span>
              <div className="hub-card-body">
                <h3>{tool.label}</h3>
                <p>{tool.description}</p>
              </div>
              <span className="hub-card-go">Buka Alat <ArrowRight size={15} /></span>
            </button>
          );
        })}
      </section>

      <footer>
        <span>TOOLBOX <b>·</b> ALAT SERBA ADA</span>
        <span>Tanpa instal, tanpa ribet</span>
      </footer>
    </main>
  );
}
