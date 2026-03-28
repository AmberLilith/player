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
  const [repetir, setRepetir] = useState(false)
  const isRestoring = useRef(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [tempoAtual, setTempoAtual] = useState(0);

  const formatarTempo = (segundos: number) => {
    const h = Math.floor(segundos / 3600);
    const m = Math.floor((segundos % 3600) / 60);
    const s = Math.floor(segundos % 60);

    const partes = [
      h > 0 ? h : null, // Só adiciona hora se houver
      m.toString().padStart(2, '0'),
      s.toString().padStart(2, '0')
    ].filter(Boolean); // Remove o nulo da hora se não existir

    return partes.join(':');
  };

  useEffect(() => {
    const carregar = async () => {
      const dados = await buscarTodosDoDB();
      const mTemp: MediaFile[] = [];
      const vTemp: MediaFile[] = [];

      dados.forEach(item => {
        const file: MediaFile = {
          name: item.name,
          url: URL.createObjectURL(item.blob),
          type: item.blob.type.includes('audio') ? 'audio' : 'video'
        };
        file.type === 'audio' ? mTemp.push(file) : vTemp.push(file);
      });

      setMusicas(mTemp);
      setVideos(vTemp);

      const ultimaMusicaNome = localStorage.getItem('ultima_musica_nome');
      if (ultimaMusicaNome) {
        const encontrada = mTemp.find(m => m.name === ultimaMusicaNome);
        if (encontrada) {
          isRestoring.current = true;
          setMusicaAtual(encontrada);
        }
      }
      const params = new URLSearchParams(window.location.search);
      if (params.get('refresh') === 'true') {
        // Se acabou de chegar um arquivo, pega o último da lista e dá play!
        const ultima = mTemp[mTemp.length - 1];
        if (ultima) setMusicaAtual(ultima);

        // Limpa a URL para não ficar dando refresh infinito
        window.history.replaceState({}, '', window.location.pathname);
      }
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && musicaAtual) {
        localStorage.setItem('ultimo_progresso_tempo', audioRef.current.currentTime.toString());
        localStorage.setItem('ultima_musica_nome', musicaAtual.name);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [musicaAtual]);

  useEffect(() => {
    if (audioRef.current && musicaAtual) {
      if (isRestoring.current) {
        isRestoring.current = false;
        return;
      }
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
      tipo === 'audio' ? (setMusicas([]), setMusicaAtual(null)) : (setVideos([]), setVideoAtual(null));
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

    tipo === 'audio'
      ? setMusicas(p => limparAnterior ? novasTemp : [...p, ...novasTemp])
      : setVideos(p => limparAnterior ? novasTemp : [...p, ...novasTemp]);
  };

  const excluirTudo = async (tipo: 'audio' | 'video') => {
    if (!window.confirm(`Excluir todos os ${tipo === 'audio' ? 'áudios' : 'vídeos'}?`)) return;
    const todos = await buscarTodosDoDB();
    for (const item of todos) {
      const ehAudio = item.blob.type.includes('audio');
      if ((tipo === 'audio' && ehAudio) || (tipo === 'video' && !ehAudio)) await deletarDoDB(item.name);
    }
    tipo === 'audio' ? (setMusicas([]), setMusicaAtual(null)) : (setVideos([]), setVideoAtual(null));
  };

  const navegarMusica = (direcao: number) => {
    if (!musicaAtual) return;
    const index = musicas.findIndex(v => v.name === musicaAtual.name);
    const novoIndex = index + direcao;
    if (novoIndex >= 0 && novoIndex < musicas.length) setMusicaAtual(musicas[novoIndex]);
  };

  const lidarComFimDaMusica = () => {
    const indexAtual = musicas.findIndex(m => m.name === musicaAtual?.name);
    const ehUltima = indexAtual === musicas.length - 1;
    let proxima = (!ehUltima) ? musicas[indexAtual + 1] : (repetir ? musicas[0] : null);

    if (proxima) setMusicaAtual(proxima);
  };

  const musicaProps = {
    musicas,
    onAdd: (f: File[], l: boolean) => adicionarMedia(f, l, 'audio'),
    onSelect: (m: MediaFile) => { setVideoAtual(null); setMusicaAtual(m); },
    onRemove: async (n: string) => {
      if (musicaAtual?.name === n) navegarMusica(1);
      await deletarDoDB(n);
      setMusicas(p => p.filter(x => x.name !== n));
    },
    musicaAtiva: musicaAtual,
    onClearAll: () => excluirTudo('audio'),
    onReorder: setMusicas,
  };

  return (
    <BrowserRouter>
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, height: '50px', padding: '0 15px', background: '#1a1a1a', display: 'flex', alignItems: 'center', gap: '20px', zIndex: 10000 }}>
        <NavLink to="/music" style={({ isActive }) => ({ color: isActive ? '#4CAF50' : 'white', textDecoration: 'none' })}>MÚSICA</NavLink>
        <NavLink to="/video" style={({ isActive }) => ({ color: isActive ? '#4CAF50' : 'white', textDecoration: 'none' })}>VÍDEO</NavLink>
      </nav>

      <main style={{ paddingBottom: musicaAtual ? '140px' : '0px' }}>
        <Routes>
          <Route path="/" element={<Music {...musicaProps} />} />
          <Route path="/music" element={<Music {...musicaProps} />} />
          <Route path="/video" element={
            <Video
              videos={videos}
              onAdd={(f, l) => adicionarMedia(f, l, 'video')}
              onSelect={(v) => { audioRef.current?.pause(); setVideoAtual(v); }}
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

      {musicaAtual && (
        <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', zIndex: 9999 }}>
          <div style={{ //Essa div existe apenas para manter os botoes de suffle e repeat alinhados a esquerda
            display: 'flex',
            marginBottom: '5px',
            opacity: 0.8,
            width: '95%',
            maxWidth: '700px',
            justifyContent: 'flex-start'
          }}>
            <div className='glass-card' style={{ display: 'flex', flexDirection: 'row', gap: '20px', marginLeft: '0px', padding: '5px' }}>
              <button onClick={() => setRepetir(!repetir)} className='' style={{ width: '30px', height: '30px' }}>
                {IconComponent("repeat", repetir ? 'var(--primary-gold)' : '#888', '18px', '18px')}
              </button>
              <button className='playerButton' style={{ width: '30px', height: '30px' }}>
                {IconComponent("suffle", 'var(--primary-gold)', '18px', '18px')}
              </button>
            </div>
          </div>
          <div className='glass-card' style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px', width: '95%', maxWidth: '700px' }}>


            {/* Div Central (Playback Controls) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
              <button className='playerButton' onClick={() => navegarMusica(-1)}>
                {IconComponent("previous", 'var(--primary-gold)', null, null)}
              </button>
              <button className='playerButton' onClick={() => audioRef.current!.currentTime -= 10}>
                {IconComponent("backwards", 'var(--primary-gold)', null, null)}
              </button>
              <button className='button-play' onClick={() => audioRef.current?.paused ? audioRef.current?.play() : audioRef.current?.pause()}>
                {IconComponent(isPlaying ? "pause" : "play", 'var(--primary-gold)', '48px', '48px')}
              </button>
              <button className='playerButton' onClick={() => audioRef.current!.currentTime += 10}>
                {IconComponent("forwards", 'var(--primary-gold)', null, null)}
              </button>
              <button className='playerButton' onClick={() => navegarMusica(1)}>
                {IconComponent("next", 'var(--primary-gold)', null, null)}
              </button>
            </div>

            <div style={{
              width: '100%',
              maxWidth: '500px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              color: 'var(--primary-gold)',
              fontSize: '12px'
            }}>
              {/* Tempo Atual Formatado */}
              <span>{formatarTempo(tempoAtual)}</span>

              <input
                type="range"
                min="0"
                max={audioRef.current?.duration || 0}
                value={tempoAtual}
                onChange={(e) => {
                  const novoTempo = parseFloat(e.target.value);
                  audioRef.current!.currentTime = novoTempo;
                  setTempoAtual(novoTempo);
                }}
                style={{ flex: 1, accentColor: 'var(--primary-gold)', cursor: 'pointer' }}
              />

              {/* Tempo Total Formatado */}
              <span>{formatarTempo(audioRef.current?.duration || 0)}</span>
            </div>

            <audio
              ref={audioRef}
              src={musicaAtual.url}
              onEnded={lidarComFimDaMusica}
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onTimeUpdate={() => setTempoAtual(audioRef.current?.currentTime || 0)}
              onLoadedMetadata={() => {
                const tempo = localStorage.getItem('ultimo_progresso_tempo');
                if (tempo && localStorage.getItem('ultima_musica_nome') === musicaAtual.name && audioRef.current) {
                  audioRef.current.currentTime = parseFloat(tempo);
                }
              }}
              style={{ width: '100%', maxWidth: '500px', height: '30px' }}
            />

            {/* Marquee Info */}
            <div style={{
              fontSize: '10px',
              color: 'var(--primary-main)',
              fontWeight: 'bold',
              textAlign: 'center',
              width: '100%',
              maxWidth: '500px',

            }}>
              <div className="marquee">
                <p className="marquee_text">{musicaAtual.name}</p>
              </div>
            </div>

          </div>
        </div>
      )}

    </BrowserRouter>
  )
}

export default App