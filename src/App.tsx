import { useEffect, useState } from 'react'
import { BrowserRouter, NavLink, Route, Routes } from 'react-router-dom'
import { buscarTodosDoDB, deletarDoDB, salvarNoDB } from './db'
import Music from './pages/Music'
import Video from './pages/Video'
import { useDialog } from './components/dialog/useDialog'
import Dialog from './components/dialog/Dialog'
import IconComponent from './components/icons'

export interface MediaFile {
  name: string
  url: string
  type: 'audio' | 'video'
  thumbnail?: string
}

function App() {
 
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallButton, setShowInstallButton] = useState(false);
  const dialog = useDialog();



// Substitua o useEffect do beforeinstallprompt por este:
useEffect(() => {
  const handler = (e: Event) => {
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstallButton(true); // use o estado, não o dialog diretamente
  };

  window.addEventListener('beforeinstallprompt', handler);
  return () => window.removeEventListener('beforeinstallprompt', handler);
}, []);

// E adicione este efeito para reagir à mudança do estado:
useEffect(() => {
  if (showInstallButton) {
    dialog.open();
  }
}, [showInstallButton]);

  // Função para chamar quando o usuário clicar no botão
  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setShowInstallButton(false);
    setDeferredPrompt(null);
  };

 

  return (
    <BrowserRouter>
    <Dialog isOpen={dialog.isOpen} onClose={dialog.close} title="Instalar Player!">
        <p>O player funciona melhoer quando instalado no seu dispositivo.</p>
        <p>Clique em {IconComponent("download", 'var(--primary-gold)', null, null)} abaixo para instalar.</p>
        <div style={{ display: 'flex',flexDirection: 'row', justifyContent: 'flex-end', gap: '10px', marginTop: '20px', width: '100%' }}>
          <button onClick={dialog.close}>{IconComponent("cancel_download", 'var(--primary-gold)', null, null)}</button>
          <button onClick={() => { handleInstallClick(); dialog.close(); }}>{IconComponent("download", 'var(--primary-gold)', null, null)}</button>
        </div>
      </Dialog>

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
            <Video/>
          } />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App