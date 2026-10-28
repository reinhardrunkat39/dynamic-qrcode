import { useState } from 'react';
import { Landing } from '@/components/Landing';
import { Hub } from '@/components/Hub';
import { QrTool } from '@/components/QrTool';
import { YoutubeDownloader } from '@/components/YoutubeDownloader';
import { Img2Pdf } from '@/components/Img2Pdf';
import { TextTool } from '@/components/TextTool';
import { ToolId, View } from '@/types';

function App() {
  const [view, setView] = useState<View>('landing');

  function goHome() {
    setView('landing');
    window.scrollTo(0, 0);
  }

  function goHub() {
    setView('hub');
    window.scrollTo(0, 0);
  }

  function selectTool(tool: ToolId) {
    setView(tool);
    window.scrollTo(0, 0);
  }

  switch (view) {
    case 'landing':
      return <Landing onEnter={goHub} />;
    case 'hub':
      return <Hub onHome={goHome} onSelect={selectTool} />;
    case 'qr':
      return <QrTool onBack={goHub} />;
    case 'ytdl':
      return <YoutubeDownloader onBack={goHub} />;
    case 'img2pdf':
      return <Img2Pdf onBack={goHub} />;
    case 'text':
      return <TextTool onBack={goHub} />;
    default:
      return <Landing onEnter={goHub} />;
  }
}

export default App;
