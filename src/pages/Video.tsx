import { useRef, useEffect, useState } from 'react'
import type { MediaFile } from '../App'
import IconComponent from '../components/icons'
import { buscarTodosDoDB, deletarDoDB, salvarNoDB } from '../db'
import Spinner from '../components/spinner/spinner';

const gerarThumbnail = (file: File): Promise<string> => {
    return new Promise((resolve) => {
        const video = document.createElement('video');
        const canvas = document.createElement('canvas');
        const url = URL.createObjectURL(file);

        video.style.display = 'none';
        video.src = url;
        video.muted = true;
        video.currentTime = 1;

        video.onloadeddata = () => {
            canvas.width = 320;
            canvas.height = 180;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
            URL.revokeObjectURL(url);
            resolve(dataUrl);
        };
        video.onerror = () => {
            URL.revokeObjectURL(url);
            resolve('');
        };
    });
};

function Video() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [videos, setVideos] = useState<MediaFile[]>([]);
    const [videoAtual, setVideoAtual] = useState<MediaFile | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleInput = (limpar: boolean, isDirectory: boolean) => {
        setIsLoading(true);
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        (input as any).webkitdirectory = isDirectory;
        (input as any).directory = isDirectory;
        input.accept = 'video/*';

        input.oncancel = () => setIsLoading(false); 

        input.onchange = async (e) => {
            const f = (e.target as HTMLInputElement).files;
            if (f) {
                const soVideo = Array.from(f).filter(file => file.type.startsWith('video/'));

                const novosVideos = await Promise.all(soVideo.map(async (file) => {
                    const thumb = await gerarThumbnail(file);
                    return { file, thumb };
                }));

                if (novosVideos.length > 0) adicionarVideo(novosVideos, limpar);
            }
        };
        input.click();
    }

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
                        thumbnail: item.thumbnail
                    });
                }
            });
            setVideos(vTemp);
        };
        carregar();
    }, []);

    useEffect(() => {
        if (videoAtual && videoRef.current) {
            videoRef.current.play().catch(e => console.log("Autoplay bloqueado", e));
        }
    }, [videoAtual]);

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
            await salvarNoDB(item.file.name, item.file, item.thumb);

            novosFormatados.push({
                name: item.file.name,
                url: URL.createObjectURL(item.file),
                type: 'video',
                thumbnail: item.thumb
            });
        }

        setVideos(prev => limpar ? novosFormatados : [...prev, ...novosFormatados]);
        setIsLoading(false);
    };

    const onRemove = async (name: string) => {
        await deletarDoDB(name);
        setVideos(p => p.filter(x => x.name !== name));
        if (videoAtual?.name === name) setVideoAtual(null);
    }

    const onEnded = () => {
                const idx = videos.findIndex(v => v.name === videoAtual?.name);
                if (idx < videos.length - 1) setVideoAtual(videos[idx + 1]);
              }

              const onClearAll = async () => {
                if (!window.confirm("Excluir todos os vídeos?")) return;
                const todos = await buscarTodosDoDB();
                for (const item of todos) {
                  if (!item.blob.type.includes('audio')) await deletarDoDB(item.name);
                }
                setVideos([]);
                setVideoAtual(null);
              }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '100px' }}>
            <nav style={{
                position: 'fixed',
                top: '50px',
                left: 0,
                width: '100%',
                display: 'flex',
                justifyContent: 'flex-end',
                background: 'transparent',
                zIndex: 9999,
                padding: '10px 0',
                pointerEvents: 'none'
            }}>
                <div className='glass-card' style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center', marginRight: '10px', pointerEvents: 'auto' }}>
                    <button onClick={() => handleInput(true, true)}>
                        {IconComponent("add_playlist", 'var(--primary-gold)', null, null)}
                    </button>
                    <button onClick={() => handleInput(false, false)}>
                        {IconComponent("add_video", 'var(--primary-gold)', null, null)}
                    </button>
                    {videos.length > 0 && (
                        <button onClick={onClearAll}>
                            {IconComponent("remove_playlist", 'var(--primary-gold)', null, null)}
                        </button>
                    )}
                </div>
            </nav>
            {videoAtual && (
                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', marginTop: '20px' }}>
                    <video ref={videoRef} src={videoAtual.url} controls onEnded={onEnded} style={{ width: '100%', maxHeight: '450px' }} />
                </div>
            )}

            <div className="marquee">
                <p className="marquee_text">{videoAtual?.name}</p>
            </div>

            {/* Lista de Vídeos */}
            {!isLoading && videos.length === 0 && (
                <div style={{
                    maxWidth: '500px',
                    margin: '100px auto 0 auto',
                    padding: '40px',
                    textAlign: 'center',
                    border: '2px dashed #333',
                    borderRadius: '12px',
                    color: 'var(--text-dim)'
                }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>🎬</span>
                    <h2 style={{ color: 'var(--primary-gold)' }}>Nenhum vídeo encontrado</h2>
                    <p>Selecione seus arquivos de vídeo para começar.</p>
                </div>
            )}
            
            {!isLoading && videos.length > 0 && (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
                    gap: '15px',
                    marginTop: '80px'
                }}>
                    {videos.map((v) => (
                        <div className='glass-card'
                            key={v.name}
                            onClick={() => setVideoAtual(v)}
                            style={{
                                border: videoAtual?.name === v.name ? '2px solid var(--primary-gold)' : '1px solid #222',
                                padding: '8px',
                                borderRadius: '8px',
                                cursor: 'pointer',
                                transition: 'transform 0.2s'
                            }}
                        >
                            {/* Container da Thumbnail */}
                            <div style={{
                                width: '100%',
                                aspectRatio: '16/9',
                                borderRadius: '4px',
                                marginBottom: '8px',
                                overflow: 'hidden',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundImage: v.thumbnail ? `url(${v.thumbnail})` : 'none',
                                backgroundSize: 'cover',
                                backgroundPosition: 'center'
                            }}>
                                {!v.thumbnail && <span style={{ fontSize: '24px' }}>🎬</span>}
                            </div>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '8px',
                                color: videoAtual?.name === v.name ? 'var(--primary-gold)' : 'var(--text-main)',
                            }}>
                                <span style={{
                                    fontSize: '12px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    flex: 1,
                                    minWidth: 0
                                }}>
                                    {v.name}
                                </span>
                                <span
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onRemove(v.name);
                                    }}
                                    className='close'
                                    style={{ flexShrink: 0, fontSize: '14px', padding: '0 4px' }}
                                >
                                    ✕
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isLoading && (
                 <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    margin: '200px auto 0 auto',
                    padding: '40px',
                    textAlign: 'center',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    <Spinner />
                    <h2 style={{ color: 'var(--primary-gold)', marginTop: '20px' }}>Carregando vídeos...</h2>  
                </div>
            )}
        </div>
    )
}

export default Video