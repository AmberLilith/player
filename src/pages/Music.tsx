import type { MediaFile } from '../App'

interface MusicProps {
    musicas: MediaFile[];
    onAdd: (f: File[], l: boolean) => void;
    onSelect: (m: MediaFile) => void;
    onRemove: (n: string) => void;
    musicaAtiva: MediaFile | null;
    onClearAll: () => void;
}

function Music({ musicas, onAdd, onSelect, onRemove, musicaAtiva, onClearAll }: MusicProps) {
    const handleInput = (limpar: boolean) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.multiple = true;
        input.accept = 'audio/*';
        input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files;
            if (f) onAdd(Array.from(f), limpar);
        };
        input.click();
    }

    // TUDO que for visual precisa estar dentro deste return
    return (
        <div>
            <h1  style={{textAlign: 'center'}}>Minhas Músicas</h1>

            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', justifyContent: 'center' }}>
                <button
                    onClick={() => handleInput(true)}
                    style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    📂 Abrir Nova Playlist
                </button>
                <button
                    onClick={() => handleInput(false)}
                    style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                >
                    ➕ Adicionar à Playlist
                </button>
                {musicas.length > 0 && (
                        <button
                            onClick={onClearAll}
                            style={{ padding: '10px', background: '#f44336', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                            🗑️ Limpar Biblioteca
                        </button>
                    )}
            </div>

            {/* Lógica Condicional: Vazio vs Lista */}
            {musicas.length === 0 ? (
                <div style={{
                    marginTop: '40px',
                    padding: '40px',
                    textAlign: 'center',
                    border: '2px dashed #333',
                    borderRadius: '12px',
                    color: 'var(--text-dim)'
                }}>
                    <span style={{ fontSize: '48px', display: 'block', marginBottom: '10px' }}>🎧</span>
                    <h2 style={{ color: 'var(--primary-gold)' }}>Sua biblioteca está vazia</h2>
                    <p>Clique em <strong>Abrir Nova Playlist</strong> para carregar seus arquivos MP3.</p>
                    <p style={{ fontSize: '12px' }}>Os arquivos ficam salvos apenas no seu navegador.</p>
                </div>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                    {musicas.map((m) => (
                        <li
                            key={m.name}
                            onClick={() => onSelect(m)}
                            className={musicaAtiva?.name === m.name ? 'active-item' : ''}
                            style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                padding: '12px 15px',
                                marginBottom: '8px',
                                borderRadius: '6px',
                                background: 'var(--bg-card)',
                                cursor: 'pointer',
                                border: musicaAtiva?.name === m.name ? '1px solid var(--primary-gold)' : '1px solid #222',
                                transition: 'all 0.2s ease'
                            }}
                        >
                            <span
                                style={{
                                    flex: 1,
                                    color: musicaAtiva?.name === m.name ? 'var(--primary-gold)' : 'var(--text-main)',
                                    fontSize: '14px',
                                    fontWeight: musicaAtiva?.name === m.name ? '600' : '400',
                                    pointerEvents: 'none'
                                }}
                            >
                                {m.name}
                            </span>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onRemove(m.name);
                                }}
                                style={{
                                    color: '#ff4444',
                                    border: 'none',
                                    background: 'none',
                                    cursor: 'pointer',
                                    padding: '8px',
                                    fontSize: '18px',
                                    zIndex: 2
                                }}
                            >
                                🗑️
                            </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}

export default Music;