import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { buscarTodosDoDB, deletarDoDB, salvarNoDB } from './db'
import Music from './pages/Music'
import Video from './pages/Video'

export interface MediaFile {
  name: string
  url: string
  type: 'audio' | 'video'
  thumbnail?: string
}

function App() {
  const [videos, setVideos] = useState<MediaFile[]>([])
  const [videoAtual, setVideoAtual] = useState<MediaFile | null>(null)

useEffect(() => {
  const carregar = async () => {
    const dados = await buscarTodosDoDB();
    const vTemp: MediaFile[] = [];

    dados.forEach(item => {
      if (!item.blob.type.includes('audio')) {
        vTemp.push({
          name: item.name,
          url: URL.createObjectURL(item.blob),
          type: 'video',
          thumbnail: item.thumbnail // <--- ESSA LINHA É A QUE ESTÁ FALTANDO!
        });
      }
    });
    setVideos(vTemp);
  };
  carregar();
}, []);

  const adicionarVideo = async (novosItens: { file: File, thumb: string }[], limpar: boolean) => {
    if (limpar) {
      const todos = await buscarTodosDoDB();
      for (const item of todos) {
        if (!item.blob.type.includes('audio')) await deletarDoDB(item.name);
      }
      setVideos([]);
      setVideoAtual(null);
    }

    const novosFormatados: MediaFile[] = [];

    for (const item of novosItens) {
      // Salva no IndexedDB: nome, o arquivo (blob) e a string da thumbnail
      await salvarNoDB(item.file.name, item.file, item.thumb);
      
      novosFormatados.push({
        name: item.file.name,
        url: URL.createObjectURL(item.file),
        type: 'video',
        thumbnail: item.thumb
      });
    }

    setVideos(prev => limpar ? novosFormatados : [...prev, ...novosFormatados]);
  };

  return (
    <BrowserRouter>
      <nav style={{ 
        position: 'fixed', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: '50px', 
        padding: '0 15px', 
        background: '#1a1a1a', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '20px', 
        zIndex: 10000 
      }}>
        <NavLink 
          to="/music" 
          style={({ isActive }) => ({ 
            borderBottom: isActive ? '2px solid var(--primary-gold)' : 'none', 
            color: 'white', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
          })}
        >
          MÚSICA
        </NavLink>
        <NavLink 
          to="/video" 
          style={({ isActive }) => ({ 
            borderBottom: isActive ? '2px solid var(--primary-gold)' : 'none', 
            color: 'white', 
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: 'bold'
          })}
        >
          VÍDEO
        </NavLink>
      </nav>

      <main style={{ paddingTop: '50px' }}>
        <Routes>
          <Route path="/" element={<Music />} />
          <Route path="/music" element={<Music />} />
          <Route path="/video" element={
            <Video
              videos={videos}
              onAdd={adicionarVideo}
              onSelect={(v) => setVideoAtual(v)}
              onRemove={async (n) => {
                await deletarDoDB(n);
                setVideos(p => p.filter(x => x.name !== n));
                if (videoAtual?.name === n) setVideoAtual(null);
              }}
              videoAtivo={videoAtual}
              onEnded={() => {
                const idx = videos.findIndex(v => v.name === videoAtual?.name);
                if (idx < videos.length - 1) setVideoAtual(videos[idx + 1]);
              }}
              onClearAll={async () => {
                if (!window.confirm("Excluir todos os vídeos?")) return;
                const todos = await buscarTodosDoDB();
                for (const item of todos) {
                  if (!item.blob.type.includes('audio')) await deletarDoDB(item.name);
                }
                setVideos([]);
                setVideoAtual(null);
              }}
            />
          } />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App