function Spinner({ size = 40, color = 'var(--primary-gold)' }: { size?: number, color?: string }) {
  return (
    <div style={{
      width: size,
      height: size,
      border: `3px solid rgba(255,255,255,0.1)`,
      borderTop: `3px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
  )
}

export default Spinner