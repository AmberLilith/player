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
  const [musicas, setMusicas] = useState<MediaFile[]>([])
  const [videos, setVideos] = useState<MediaFile[]>([])
  const [musicaAtual, setMusicaAtual] = useState<MediaFile | null>(null)
  const [videoAtual, setVideoAtual] = useState<MediaFile | null>(null)
  const audioRef = useRef<HTMLAudioElement>(null)

  useEffect(() => {
    const carregar = async () => {
      const dados = await buscarTodosDoDB();
      const mTemp: MediaFile[] = [];
      const vTemp: MediaFile[] = [];

      dados.forEach(item => {
        const file = {
          name: item.name,
          url: URL.createObjectURL(item.blob),
          type: item.blob.type.includes('audio') ? 'audio' : 'video' as any
        };
        if (file.type === 'audio') mTemp.push(file);
        else vTemp.push(file);
      });

      setMusicas(mTemp);
      setVideos(vTemp);
    };
    carregar();
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
      if (tipo === 'audio') { setMusicas([]); setMusicaAtual(null); }
      else { setVideos([]); setVideoAtual(null); }
    }

    const novasTemp: MediaFile[] = [];
    for (const file of files) {
      await salvarNoDB(file.name, file);
      novasTemp.push({
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.includes('audio') ? 'audio' : 'video' as any
      });
    }

    if (tipo === 'audio') setMusicas(p => limparAnterior ? novasTemp : [...p, ...novasTemp]);
    else setVideos(p => limparAnterior ? novasTemp : [...p, ...novasTemp]);
  };

  const excluirTudo = async (tipo: 'audio' | 'video') => {
    const confirmacao = window.confirm(`Tem certeza que deseja excluir todos os ${tipo === 'audio' ? 'áudios' : 'vídeos'}?`);
    if (!confirmacao) return;

    const todos = await buscarTodosDoDB();
    for (const item of todos) {
      const ehAudio = item.blob.type.includes('audio');
      if ((tipo === 'audio' && ehAudio) || (tipo === 'video' && !ehAudio)) {
        await deletarDoDB(item.name);
      }
    }

    if (tipo === 'audio') {
      setMusicas([]);
      setMusicaAtual(null);
    } else {
      setVideos([]);
      setVideoAtual(null);
    }
  };


  return (
    <BrowserRouter>
      <nav style={{ padding: '15px', background: '#1a1a1a', display: 'flex', gap: '20px' }}>
        <NavLink to="/music" style={({ isActive }) => ({ color: isActive ? '#4CAF50' : 'white', textDecoration: 'none' })}>MÚSICA</NavLink>
        <NavLink to="/video" style={({ isActive }) => ({ color: isActive ? '#4CAF50' : 'white', textDecoration: 'none' })}>VÍDEO</NavLink>
      </nav>

      <main style={{ padding: '20px', paddingBottom: '120px' }}>
        <Routes>
          <Route path="/" element={
            <Music
              musicas={musicas}
              onAdd={(f, limpar) => adicionarMedia(f, limpar, 'audio')}
              onSelect={(m) => { setVideoAtual(null); setMusicaAtual(m); }}
              onRemove={async (n) => { await deletarDoDB(n); setMusicas(p => p.filter(x => x.name !== n)); }}
              musicaAtiva={musicaAtual}
              onClearAll={() => excluirTudo('audio')}
            />
          } />
          <Route path="/music" element={
            <Music
              musicas={musicas}
              onAdd={(f, limpar) => adicionarMedia(f, limpar, 'audio')}
              onSelect={(m) => { setVideoAtual(null); setMusicaAtual(m); }}
              onRemove={async (n) => { await deletarDoDB(n); setMusicas(p => p.filter(x => x.name !== n)); }}
              musicaAtiva={musicaAtual}
              onClearAll={() => excluirTudo('audio')}
            />
          } />
          <Route path="/video" element={
            <Video
              videos={videos}
              onAdd={(f, limpar) => adicionarMedia(f, limpar, 'video')}
              onSelect={(v) => { if (audioRef.current) audioRef.current.pause(); setVideoAtual(v); }}
              onRemove={async (n) => { await deletarDoDB(n); setVideos(p => p.filter(x => x.name !== n)); }}
              videoAtivo={videoAtual}
              onEnded={() => setVideoAtual(null)}
              onClearAll={() => excluirTudo('video')}
            />
          } />
        </Routes>
      </main>

      {musicaAtual && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: '#222', color: 'white', padding: '15px', textAlign: 'center' }}>
          <audio className="player-bar" ref={audioRef} src={musicaAtual.url} controls autoPlay style={{ width: '100%', maxWidth: '600px' }} />
        </div>
      )}
    </BrowserRouter>
  )
}
export default App