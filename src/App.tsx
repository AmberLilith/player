import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { buscarTodosDoDB, deletarDoDB, salvarNoDB } from './db'
import Music from './pages/Music'
import Video from './pages/Video'

export interface MediaFile {
  name: string
  url: string
  type: 'audio' | 'video'
}

function App() {
  const [videos, setVideos] = useState<MediaFile[]>([])
  const [videoAtual, setVideoAtual] = useState<MediaFile | null>(null)


  useEffect(() => {
    const carregar = async () => {
      const dados = await buscarTodosDoDB();
      const vTemp: MediaFile[] = [];

      dados.forEach(item => {
        const file: MediaFile = {
          name: item.name,
          url: URL.createObjectURL(item.blob),
          type: item.blob.type.includes('audio') ? 'audio' : 'video'
        };
        vTemp.push(file);
      });
      setVideos(vTemp);
    };
    carregar();
  }, []);

  useEffect(() => {
    // Service Workers ou a própria rota podem interceptar isso
    const handleShare = async () => {
      const url = new URL(window.location.href);
      if (url.pathname === '/share-target') {
        // Aqui entra a lógica para pegar o blob do 'media' 
        // e usar sua função adicionarMedia()
      }
    };
    handleShare();
  }, []);



  const adicionarMedia = async (files: File[], limparAnterior: boolean, tipo: 'audio' | 'video') => {
    if (limparAnterior) {
      const todos = await buscarTodosDoDB();
      for (const item of todos) {
        const ehAudio = item.blob.type.includes('audio');
        if ((tipo === 'audio' && ehAudio) || (tipo === 'video' && !ehAudio)) {
          await deletarDoDB(item.name);
        }
      }
      (setVideos([]), setVideoAtual(null));
    }

    const novasTemp: MediaFile[] = [];
    for (const file of files) {
      await salvarNoDB(file.name, file);
      novasTemp.push({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.includes('audio') ? 'audio' : 'video'
      });
    }

    setVideos(p => limparAnterior ? novasTemp : [...p, ...novasTemp]);
  };

  const excluirTudo = async (tipo: 'audio' | 'video') => {
    if (!window.confirm(`Excluir todos os ${tipo === 'audio' ? 'áudios' : 'vídeos'}?`)) return;
    const todos = await buscarTodosDoDB();
    for (const item of todos) {
      const ehAudio = item.blob.type.includes('audio');
      if ((tipo === 'audio' && ehAudio) || (tipo === 'video' && !ehAudio)) await deletarDoDB(item.name);
    }
    (setVideos([]), setVideoAtual(null));
  };


  return (
    <BrowserRouter>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50px', padding: '0 15px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10000 }}>
        <NavLink to="/music" style={({ isActive }) => ({ borderBottom: isActive ? '2px solid var(--primary-gold)' : 'none', color: 'white', textDecoration: 'none' })}>MÚSICA</NavLink>
        <NavLink to="/video" style={({ isActive }) => ({ borderBottom: isActive ? '2px solid var(--primary-gold)' : 'none', color: 'white', textDecoration: 'none' })}>VÍDEO</NavLink>
      </nav>

      <main>
        <Routes>
          <Route path="/" element={<Music/>} />
          <Route path="/music" element={<Music/>} />
          <Route path="/video" element={
            <Video
              videos={videos}
              onAdd={(f, l) => adicionarMedia(f, l, 'video')}
              onSelect={(v) => { setVideoAtual(v); }}
              onRemove={async (n) => {
                if (videoAtual?.name === n) {
                  const idx = videos.findIndex(v => v.name === n);
                  setVideoAtual(videos[idx + 1] || videos[0] || null);
                }
                await deletarDoDB(n);
                setVideos(p => p.filter(x => x.name !== n));
              }}
              videoAtivo={videoAtual}
              onEnded={() => {
                const idx = videos.findIndex(v => v.name === videoAtual?.name);
                if (idx < videos.length - 1) setVideoAtual(videos[idx + 1]);
              }}
              onClearAll={() => excluirTudo('video')}
            />
          } />
        </Routes>
      </main>

    </BrowserRouter>
  )
}

export default App