import { useEffect, useRef, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { buscarTodosDoDB, deletarDoDB, salvarNoDB } from './db'
import Music from './pages/Music'
import Video from './pages/Video'
import IconComponent from './components/icons'

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
  const [repetir, setRepetir] = useState(false);
  const [primeiroCarregamento, setPrimeiroCarregamento] = useState(true);

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

      // --- NOVO: Recuperar a última música selecionada ---
      const ultimaMusicaNome = localStorage.getItem('ultima_musica_nome');
      if (ultimaMusicaNome) {
        const encontrada = mTemp.find(m => m.name === ultimaMusicaNome);
        if (encontrada) {
          setMusicaAtual(encontrada);
        }
      }
    };
    carregar();
  }, []);


  // Salva o tempo atual no localStorage a cada segundo
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && musicaAtual) {
        // Usamos chaves FIXAS para que o valor anterior seja substituído
        localStorage.setItem('ultimo_progresso_tempo', audioRef.current.currentTime.toString());
        localStorage.setItem('ultima_musica_nome', musicaAtual.name);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [musicaAtual]);

  useEffect(() => {
    if (audioRef.current && musicaAtual) {
      audioRef.current.play();


    }
  }, [musicaAtual]);

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

  const tocarProximoVideo = () => {
    if (!videoAtual) return;
    const index = videos.findIndex(v => v.name === videoAtual.name);
    if (index !== -1 && index < videos.length - 1) {
      setVideoAtual(videos[index + 1]);
    }
    // Se não quiser que o player suma no último vídeo, apenas não dê o setVideoAtual(null)
  };

  const lidarComFimDaMusica = () => {
    const indexAtual = musicas.findIndex(m => m.name === musicaAtual?.name);
    const ehUltimaMusica = indexAtual === musicas.length - 1;

    let proxima: MediaFile | null = null;

    if (repetir && ehUltimaMusica) {
      proxima = musicas[0];
    } else if (!ehUltimaMusica) {
      proxima = musicas[indexAtual + 1];
    }

    if (proxima) {
      setMusicaAtual(proxima);

      // O segredo está aqui: dar um pequeno delay para o React 
      // atualizar o 'src' antes de mandarmos tocar
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play().catch(_ => {
            console.log("Autoplay bloqueado pelo browser, aguardando interação.");
          });
        }
      }, 100);
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
              onRemove={async (n) => {
                // 1. Descobrir se é a música que está tocando agora
                if (musicaAtual?.name === n) {
                  const index = musicas.findIndex(m => m.name === n);
                  // 2. Se houver uma próxima, toca ela. Se não, para o player.
                  if (index !== -1 && index < musicas.length - 1) {
                    setMusicaAtual(musicas[index + 1]);
                  } else if (musicas.length > 1) {
                    setMusicaAtual(musicas[0]); // Volta para a primeira se for a última da lista
                  } else {
                    setMusicaAtual(null); // Se era a única, limpa o player
                  }
                }

                // 3. Deleta do banco e da lista
                await deletarDoDB(n);
                setMusicas(p => p.filter(x => x.name !== n));
              }}
              musicaAtiva={musicaAtual}
              onClearAll={() => excluirTudo('audio')}
            />
          } />
          <Route path="/music" element={
            <Music
              musicas={musicas}
              onAdd={(f, limpar) => adicionarMedia(f, limpar, 'audio')}
              onSelect={(m) => { setVideoAtual(null); setMusicaAtual(m); }}
              onRemove={async (n) => {
                // 1. Descobrir se é a música que está tocando agora
                if (musicaAtual?.name === n) {
                  const index = musicas.findIndex(m => m.name === n);
                  // 2. Se houver uma próxima, toca ela. Se não, para o player.
                  if (index !== -1 && index < musicas.length - 1) {
                    setMusicaAtual(musicas[index + 1]);
                  } else if (musicas.length > 1) {
                    setMusicaAtual(musicas[0]); // Volta para a primeira se for a última da lista
                  } else {
                    setMusicaAtual(null); // Se era a única, limpa o player
                  }
                }

                // 3. Deleta do banco e da lista
                await deletarDoDB(n);
                setMusicas(p => p.filter(x => x.name !== n));
              }}
              musicaAtiva={musicaAtual}
              onClearAll={() => excluirTudo('audio')}
            />
          } />
          <Route path="/video" element={
            <Video
              videos={videos}
              onAdd={(f, limpar) => adicionarMedia(f, limpar, 'video')}
              onSelect={(v) => {
                if (audioRef.current) audioRef.current.pause();
                setVideoAtual(v);
              }}
              onRemove={async (n) => {
                if (videoAtual?.name === n) {
                  const index = videos.findIndex(v => v.name === n);
                  if (index !== -1 && index < videos.length - 1) {
                    setVideoAtual(videos[index + 1]);
                  } else if (videos.length > 1) {
                    setVideoAtual(videos[0]);
                  } else {
                    setVideoAtual(null);
                  }
                }

                await deletarDoDB(n);
                setVideos(p => p.filter(x => x.name !== n));
              }}
              videoAtivo={videoAtual}
              onEnded={tocarProximoVideo} // Agora ele tenta tocar o próximo em vez de sumir
              onClearAll={() => excluirTudo('video')}
            />
          } />
        </Routes>
      </main>

      {musicaAtual && (
        <div style={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          right: 0,
          background: '#222',
          color: 'white',
          padding: '15px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center', // Centraliza os blocos verticalmente
          justifyContent: 'center', // Centraliza horizontalmente
          gap: '10px',
          zIndex: 9999,
          boxShadow: '0 -5px 15px rgba(0,0,0,0.5)'
        }}>
          {/* Container da linha de controles */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center', // Garante que o conteúdo interno fique no meio
            gap: '15px',
            width: '100%',
            maxWidth: '800px' // Aumentei um pouco para dar respiro
          }}>

            {/* Botão de Repetir */}
            <button
              onClick={() => setRepetir(!repetir)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px', // Um pouco maior para facilitar o clique
                color: repetir ? 'var(--primary-gold)' : '#888',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center'
              }}
              title={repetir ? "Repetir Playlist: Ligado" : "Repetir Playlist: Desligado"}
            >
              {IconComponent("repeat", repetir ? 'var(--primary-gold)' : '#888')}
            </button>

            {/* Player de Áudio */}
            <audio
              ref={audioRef}
              src={musicaAtual.url}
              controls
              onEnded={lidarComFimDaMusica}
              onLoadedMetadata={() => {
                const tempoSalvo = localStorage.getItem('ultimo_progresso_tempo');
                const nomeSalvo = localStorage.getItem('ultima_musica_nome');

                // Só aplica o tempo se o nome da música atual for o mesmo nome que salvamos
                if (tempoSalvo && nomeSalvo === musicaAtual.name && audioRef.current) {
                  audioRef.current.currentTime = parseFloat(tempoSalvo);
                }
              }}
              style={{ width: '100%', maxWidth: '500px' }}
            />
          </div>

          {/* Informação da música atual */}
          <div style={{
            fontSize: '14px',
            color: 'var(--primary-gold)',
            textAlign: 'center',
            width: '100%',
            maxWidth: '500px'
          }}>
            🎵 {musicaAtual.name}
          </div>
        </div>
      )}
    </BrowserRouter>
  )
}
export default App