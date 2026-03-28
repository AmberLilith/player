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

interface MusicProps {
    musicas: MediaFile[]
    onAdd: (f: File[], l: boolean) => void
    onSelect: (m: MediaFile) => void
    onRemove: (n: string) => void
    musicaAtiva: MediaFile | null
    onClearAll: () => void
    onReorder: (novaOrdem: MediaFile[]) => void  // nova prop
}

// Componente separado para cada item da lista — necessário para o useSortable
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

function Music({ musicas, onAdd, onSelect, onRemove, musicaAtiva, onClearAll, onReorder }: MusicProps) {

    // PointerSensor funciona para mouse e touch
    // A distância mínima de 8px evita acionar drag em cliques normais
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 }
        }),
        useSensor(TouchSensor, {
            activationConstraint: {
                delay: 250,      // mobile: segura 250ms antes de ativar
                tolerance: 5     // tolerância de 5px de movimento durante o delay
            }
        })
    )

    const handleInput = (limpar: boolean, isDirectory: boolean) => {
        const input = document.createElement('input')
        input.type = 'file'
        input.multiple = true
            ; (input as any).webkitdirectory = isDirectory
            ; (input as any).directory = isDirectory
        input.accept = 'audio/*'
        input.onchange = (e) => {
            const f = (e.target as HTMLInputElement).files
            if (f) {
                const soAudio = Array.from(f).filter(file => file.type.startsWith('audio/'))
                if (soAudio.length > 0) onAdd(soAudio, limpar)
            }
        }
        input.click()
    }

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event

        // Se soltou no mesmo lugar, não faz nada
        if (!over || active.id === over.id) return

        const oldIndex = musicas.findIndex(m => m.name === active.id)
        const newIndex = musicas.findIndex(m => m.name === over.id)

        // arrayMove reorganiza o array mantendo todos os itens
        // O estado do áudio no App.tsx não é tocado — só a ordem muda
        onReorder(arrayMove(musicas, oldIndex, newIndex))
    }

    return (
        <div >
            <div style={{
                position: 'fixed',
                display: 'flex',
                justifyContent: 'end', 
                top: '50px', // <--- EXATAMENTE a altura do nav pai
                left: 0,
                width: '100%',
                textAlign: 'center',
                zIndex: 9999, // Um pouco menor que o nav de app.tsx para não dar conflito
                padding: '10px 0'
            }}>
                <nav className='glass-card' style={{ display: "flex", justifyContent: "center", marginRight: '10px'}} >

                    <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', padding: '5px' }}>
                        <button
                            onClick={() => handleInput(true, true)}
                           style={{  background: 'transparent', border: 'non e', cursor: 'pointer' }}
                        >
                            {IconComponent("add_playlist", 'var(--primary-gold)', null, null)}
                        </button>
                        <button
                            onClick={() => handleInput(false, false)}
                            style={{  background: 'transparent', border: 'none',  cursor: 'pointer' }}
                        >
                            {IconComponent("add_music", 'var(--primary-gold)', null, null)}
                        </button>
                        {musicas.length > 0 && (
                            <button
                                onClick={onClearAll}
                                style={{ background: 'transparent',border: 'none',  cursor: 'pointer' }}
                            >
                                {IconComponent("remove_playlist", 'var(--primary-gold)', null, null)}
                            </button>
                        )}
                    </div>
                </nav>
            </div>


            {musicas.length === 0 ? (
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
            ) : (
                // DndContext — contexto que gerencia todo o drag and drop
                <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                >
                    {/* SortableContext — lista os ids dos itens ordenáveis */}
                    <SortableContext
                        items={musicas.map(m => m.name)}
                        strategy={verticalListSortingStrategy}
                    >
                        <ul style={{ listStyle: 'none', padding: 0, marginTop: '60px', overflow: 'hidden' }}>
                            {musicas.map((m) => (
                                <MusicItem
                                    key={m.name}
                                    musica={m}
                                    ativa={musicaAtiva?.name === m.name}
                                    onSelect={onSelect}
                                    onRemove={onRemove}
                                />
                            ))}
                        </ul>
                    </SortableContext>
                </DndContext>
            )}
        </div>
    )
}

export default Music