import { QrCode } from 'lucide-react';

interface BrandProps {
  onHome?: () => void;
}

export function Brand({ onHome }: BrandProps) {
  if (onHome) {
    return (
      <button className="brand-lockup" onClick={onHome} type="button" style={{ background: 'none', border: 'none', padding: 0 }}>
        <span className="brand-mark"><QrCode size={19} strokeWidth={2.5} /></span>
        <span>Toolbox<span className="brand-dot">.</span></span>
      </button>
    );
  }
  return (
    <div className="brand-lockup">
      <span className="brand-mark"><QrCode size={19} strokeWidth={2.5} /></span>
      <span>Toolbox<span className="brand-dot">.</span></span>
    </div>
  );
}
