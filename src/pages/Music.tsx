import type { MediaFile } from '../App'

interface MusicProps {
    musicas: MediaFile[]; onAdd: (f: File[], l: boolean) => void; onSelect: (m: MediaFile) => void;
    onRemove: (n: string) => void; musicaAtiva: MediaFile | null
}

function Music({ musicas, onAdd, onSelect, onRemove, musicaAtiva }: MusicProps) {
    const handleInput = (limpar: boolean) => {
        const input = document.createElement('input');
        input.type = 'file'; input.multiple = true; input.accept = 'audio/*';
        input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files;
            if (f) onAdd(Array.from(f), limpar);
        };
        input.click();
    }

    return (
        <div>
            <h1>Minhas Músicas</h1>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <button onClick={() => handleInput(true)} style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📂 Abrir Nova Playlist</button>
                <button onClick={() => handleInput(false)} style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>➕ Adicionar à Playlist</button>
            </div>
            <ul style={{ listStyle: 'none', padding: 0, marginTop: '20px' }}>
                {musicas.map((m) => (
                    <li
                        key={m.name}
                        // O clique agora está em todo o card (li)
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
                            cursor: 'pointer', // Indica que todo o card é clicável
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
                                // Garante que o span não bloqueie o clique mas deixe o texto visível
                                pointerEvents: 'none'
                            }}
                        >
                            {m.name}
                        </span>

                        <button
                            onClick={(e) => {
                                // CRITICAL: Impede que o clique no botão dispare o clique do li (tocar música)
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
                                zIndex: 2 // Garante que o botão fique acima da área de clique do li
                            }}
                        >
                            🗑️
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    )
}
export default Music