import {
    closestCenter,
    DndContext,
    PointerSensor,
    TouchSensor,
    useSensor,
    useSensors,
    type DragEndEvent
} from '@dnd-kit/core'
import {
    arrayMove,
    SortableContext,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { MediaFile } from '../App'
import IconComponent from '../components/icons'
import { useEffect, useRef, useState } from 'react'
import { buscarTodosDoDB, deletarDoDB, salvarNoDB } from '../db'
import Spinner from '../components/spinner/spinner'



interface ItemProps {
    musica: MediaFile
    ativa: boolean
    onSelect: (m: MediaFile) => void
    onRemove: (n: string) => void
}

function MusicItem({ musica, ativa, onSelect, onRemove }: ItemProps) {
    // useSortable dá ao item os atributos e listeners de drag
    const {
        attributes,    // acessibilidade (aria-*)
        listeners,     // eventos de drag (onPointerDown, etc)
        setNodeRef,    // ref para o elemento DOM
        transform,     // posição atual durante o drag
        transition,    // animação de retorno
        isDragging,    // true enquanto está sendo arrastado
    } = useSortable({ id: musica.name })

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,  // fica semitransparente enquanto arrasta
    }

    return (
        <li
            ref={setNodeRef}
            style={{
                ...style,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '12px 12px',
                marginBottom: '8px',
                borderRadius: '6px',
                background: 'rgba(22,22,24, 0.7)',
                cursor: 'pointer',
                border: ativa ? '1px solid var(--primary-gold)' : '1px solid #222',
                transition: 'all 0.2s ease',
            }}

            onClick={() => onSelect(musica)}
        >
            {/* Ícone de drag — só essa área aciona o drag */}
            <span
                {...attributes}
                {...listeners}
                onClick={(e) => e.stopPropagation()}
                style={{
                    touchAction: 'none',
                    cursor: 'grab',
                    padding: '0 10px 0 0',
                    color: '#555',
                    fontSize: '18px',
                    userSelect: 'none',
                    flexShrink: 0,
                }}
                title="Arraste para reordenar"
            >
                ⠿
            </span>

            <span
                style={{
                    flex: 1,
                    color: ativa ? 'var(--primary-gold)' : 'var(--text-main)',
                    fontSize: '14px',
                    fontWeight: ativa ? '600' : '400',
                    pointerEvents: 'none',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                }}
            >
                {musica.name}
            </span>

            <button
                onClick={(e) => {
                    e.stopPropagation()
                    onRemove(musica.name)
                }}
                style={{
                    color: '#ff4444',
                    border: 'none',
                    background: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    fontSize: '18px',
                    flexShrink: 0,
                }}
            >
                {IconComponent("trash", 'var(--primary-gold)', null, null)}
            </button>
        </li>
    )
}

function Music() {

    const [musicas, setMusicas] = useState<MediaFile[]>([]);
    const [musicaAtual, setMusicaAtual] = useState<MediaFile | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const [repetir, setRepetir] = useState(false);
    const isRestoring = useRef(false);
    const [isPlaying, setIsPlaying] = useState(false)
    const [tempoAtual, setTempoAtual] = useState(0);
    const [isLoadingMusics, setIsLoadingMusics] = useState(false);

    const formatarTempo = (segundos: number) => {
        const h = Math.floor(segundos / 3600);
        const m = Math.floor((segundos % 3600) / 60);
        const s = Math.floor(segundos % 60);

        const partes = [
            h > 0 ? h : null,
            m.toString().padStart(2, '0'),
            s.toString().padStart(2, '0')
        ].filter(Boolean);

        return partes.join(':');
    };

    useEffect(() => {
        const carregar = async () => {
            const dados = await buscarTodosDoDB();
            const mTemp: MediaFile[] = [];

            dados.forEach(item => {
                if (item.blob.type.includes('audio')) {
                    const file: MediaFile = {
                        name: item.name,
                        url: URL.createObjectURL(item.blob),
                        type: 'audio'
                    };
                    mTemp.push(file);
                }
            });

            setMusicas(mTemp);

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
                const ultima = mTemp[mTemp.length - 1];
                if (ultima) setMusicaAtual(ultima);
                
                window.history.replaceState({}, '', window.location.pathname);
            }
        };
        carregar();
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

    const adicionarMedia = async (files: File[], limparAnterior: boolean, tipo: 'audio') => {        
        if (limparAnterior) {
            const todos = await buscarTodosDoDB();
            for (const item of todos) {
                const ehAudio = item.blob.type.includes('audio');
                if ((tipo === 'audio' && ehAudio)) {
                    await deletarDoDB(item.name);
                }
            }
            (setMusicas([]), setMusicaAtual(null));
        }

        const novasTemp: MediaFile[] = [];
        for (const file of files) {
            await salvarNoDB(file.name, file);
            novasTemp.push({
                name: file.name,
                url: URL.createObjectURL(file),
                type: 'audio'
            });
        }
        setMusicas(p => limparAnterior ? novasTemp : [...p, ...novasTemp]);
        setIsLoadingMusics(false);
    };

    const excluirTudo = async (tipo: 'audio') => {
        if (!window.confirm("Excluir todos os áudios")) return;
        const todos = await buscarTodosDoDB();
        for (const item of todos) {
            const ehAudio = item.blob.type.includes('audio');
            if ((tipo === 'audio' && ehAudio)) await deletarDoDB(item.name);
        }
        (setMusicas([]), setMusicaAtual(null));
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

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,
                tolerance: 5 
            }
        })
    )

    const handleInput = (limpar: boolean, isDirectory: boolean) => {
        setIsLoadingMusics(true);
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
            ; (input as any).webkitdirectory = isDirectory
            ; (input as any).directory = isDirectory
        input.accept = 'audio/*'
        input.oncancel = () => setIsLoadingMusics(false);
        input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files
            if (f) {
                const soAudio = Array.from(f).filter(file => file.type.startsWith('audio/'))
                if (soAudio.length > 0) adicionarMedia(soAudio, limpar, 'audio');
            }
        }
        input.click()
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        
        if (!over || active.id === over.id) return

        const oldIndex = musicas.findIndex(m => m.name === active.id)
        const newIndex = musicas.findIndex(m => m.name === over.id)

        setMusicas(arrayMove(musicas, oldIndex, newIndex))
    }

    const embaralharMusicas = () => {
        setMusicas(prev => {
            const copia = [...prev];
            for (let i = copia.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [copia[i], copia[j]] = [copia[j], copia[i]];
            }
            return copia;
        });
    };

    return (
        <div >
            <div style={{
                position: 'fixed',
                display: 'flex',
                justifyContent: 'end',
                top: '50px',
                left: 0,
                width: '100%',
                textAlign: 'center',
                padding: '10px 0'
            }}>
                <nav className='glass-card' style={{ display: "flex", justifyContent: "center", marginRight: '10px' }} >

                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '5px' }}>
                        <button
                            onClick={() => handleInput(true, true)}
                            style={{ background: 'transparent', border: 'non e', cursor: 'pointer' }}
                        >
                            {IconComponent("add_playlist", 'var(--primary-gold)', null, null)}
                        </button>

                        {musicas.length > 0 && (
                            <button
                                onClick={() => excluirTudo('audio')}
                                style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                            >
                                {IconComponent("remove_playlist", 'var(--primary-gold)', null, null)}
                            </button>
                        )}


                        <button
                            onClick={() => handleInput(false, false)}
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                            {IconComponent("add_music", 'var(--primary-gold)', null, null)}
                        </button>

                    </div>
                </nav>
            </div>


            {!isLoadingMusics && musicas.length === 0 && (
                <div className='glass-card' style={{
                    maxWidth: '500px',
                    margin: '200px auto 0 auto',
                    padding: '40px',
                    textAlign: 'center',
                    borderRadius: '12px',
                    color: 'white'
                }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>🎧</span>
                    <h2 style={{ color: 'var(--primary-gold)' }}>Sua biblioteca está vazia</h2>
                    <p>Clique em <strong>Abrir Nova Playlist</strong> para carregar suas músicas.</p>
                    <p style={{ fontSize: '12px' }}>A playlist carregada é armazenada apenas no seu navegador.</p>
                </div>
            )}

            {!isLoadingMusics && musicas.length > 0 && (
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    
                    <SortableContext
                        items={musicas.map(m => m.name)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '120px', paddingBottom: musicaAtual ? '140px' : '0px', overflow: 'hidden', zIndex: 9999 }}>
                            {musicas.map((m) => (
                                <MusicItem
                                    key={m.name}
                                    musica={m}
                                    ativa={musicaAtual?.name === m.name}
                                    onSelect={(m: MediaFile) => { setMusicaAtual(m); }}
                                    onRemove={async (n: string) => {
                                        if (musicaAtual?.name === n) navegarMusica(1);
                                        await deletarDoDB(n);
                                        setMusicas(p => p.filter(x => x.name !== n));
                                    }}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}

            {isLoadingMusics && (
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
                    <h2 style={{ color: 'var(--primary-gold)', marginTop: '20px' }}>Carregando músicas...</h2>  
                </div>
            )}

            {musicaAtual && (
                <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '10px', zIndex: 9998 }}>
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
                            <button className='playerButton' style={{ width: '30px', height: '30px' }} onClick={embaralharMusicas}>
                                {IconComponent("suffle", 'var(--primary-gold)', '18px', '18px')}
                            </button>
                        </div>
                    </div>
                    <div className='glass-card' style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '15px', width: '95%', maxWidth: '700px' }}>
                        
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
                            fontSize: '12px',
                            marginTop: '10px'
                        }}>                            
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
        </div>
    )
}

export default Music