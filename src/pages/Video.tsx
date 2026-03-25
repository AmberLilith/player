import { useRef, useEffect } from 'react'
import type { MediaFile } from '../App'

interface VideoProps {
    videos: MediaFile[]
    onAdd: (files: File[], limpar: boolean) => void
    onSelect: (v: MediaFile) => void
    onRemove: (name: string) => void
    onEnded: () => void
    videoAtivo: MediaFile | null;
    onClearAll: () => void;
}

function Video({ videos, onAdd, onSelect, onRemove, onEnded, videoAtivo, onClearAll }: VideoProps) {
    const videoRef = useRef<HTMLVideoElement>(null)

    const handleInput = (limpar: boolean, isDirectory: boolean) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        (input as any).webkitdirectory = isDirectory;
        (input as any).directory = isDirectory;
        input.accept = 'video/*';
        input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files;
            if (f) onAdd(Array.from(f), limpar);
        };
        input.click();
    }

    useEffect(() => {
        if (videoAtivo && videoRef.current) {
            videoRef.current.play();
        }
    }, [videoAtivo])

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <h1>Meus Vídeos</h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button
                    onClick={() => handleInput(true, true)}
                    style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    📂 Abrir Pasta
                </button>
                <button
                    onClick={() => handleInput(false,false)}
                    style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    ➕ Adicionar Vídeos
                </button>
                {videos.length > 0 && (
                    <button
                        onClick={onClearAll}
                        style={{ padding: '10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                        🗑️ Excluir Todos
                    </button>
                )}
            </div>

            {/* Player de vídeo (só aparece se houver um selecionado) */}
            {videoAtivo && (
                <div style={{ background: '#000', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px' }}>
                    <video ref={videoRef} src={videoAtivo.url} controls onEnded={onEnded} style={{ width: '100%', maxHeight: '450px' }} />
                </div>
            )}

            {/* Estado Vazio ou Lista de Vídeos */}
            {videos.length === 0 ? (
                <div style={{
                    marginTop: '40px',
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
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
                    {videos.map((v) => (
                        <div
                            key={v.name}
                            onClick={() => onSelect(v)}
                            style={{
                                position: 'relative',
                                border: videoAtivo?.name === v.name ? '2px solid var(--primary-gold)' : '1px solid #222',
                                padding: '10px',
                                borderRadius: '5px',
                                background: 'var(--bg-card)',
                                cursor: 'pointer'
                            }}
                        >
                            <div style={{ color: videoAtivo?.name === v.name ? 'var(--primary-gold)' : 'var(--text-main)' }}>🎬 {v.name}</div>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(v.name);
                                }}
                                style={{ position: 'absolute', top: '5px', right: '5px', color: '#ff4444', border: 'none', background: 'none', cursor: 'pointer' }}
                            >
                                ✕
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default Video