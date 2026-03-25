import { useRef, useEffect } from 'react'
import type { MediaFile } from '../App'

interface VideoProps {
  videos: MediaFile[]; onAdd: (f: File[], l: boolean) => void; onSelect: (v: MediaFile) => void;
  onRemove: (n: string) => void; onEnded: () => void; videoAtivo: MediaFile | null
}

function Video({ videos, onAdd, onSelect, onRemove, onEnded, videoAtivo }: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const handleInput = (limpar: boolean) => {
    const input = document.createElement('input');
    input.type = 'file'; input.multiple = true; input.accept = 'video/*';
    input.onchange = (e) => {
      const f = (e.target as HTMLInputElement).files;
      if(f) onAdd(Array.from(f), limpar);
    };
    input.click();
  }

  useEffect(() => { if (videoAtivo && videoRef.current) videoRef.current.play(); }, [videoAtivo]);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1>Meus Vídeos</h1>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
        <button onClick={() => handleInput(true)} style={{ padding: '10px', background: '#4CAF50', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>📂 Abrir Nova Playlist</button>
        <button onClick={() => handleInput(false)} style={{ padding: '10px', background: '#2196F3', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>➕ Adicionar Vídeos</button>
      </div>
      {videoAtivo && <video ref={videoRef} src={videoAtivo.url} controls onEnded={onEnded} style={{ width: '100%', marginBottom: '20px' }} />}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '15px' }}>
        {videos.map(v => (
          <div key={v.name} style={{ position: 'relative', border: videoAtivo?.name === v.name ? '2px solid #4CAF50' : '1px solid #ddd', padding: '10px', borderRadius: '5px' }}>
            <div onClick={() => onSelect(v)} style={{ cursor: 'pointer' }}>🎬 {v.name}</div>
            <button onClick={() => onRemove(v.name)} style={{ position: 'absolute', top: '5px', right: '5px', color: 'red', border: 'none', background: 'none', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
export default Video