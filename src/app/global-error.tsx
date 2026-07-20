'use client' // Error boundaries must be Client Components

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    // global-error must include html and body tags
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          background: '#0a0a0a',
          color: '#fafafa',
          fontFamily: 'system-ui, sans-serif',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>
            Algo deu errado!
          </h2>
          {process.env.NODE_ENV === 'development' && (
            <p style={{ color: '#f87171', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {error.message}
            </p>
          )}
          <button
            onClick={() => unstable_retry()}
            style={{
              background: '#6366f1',
              color: '#fff',
              border: 'none',
              borderRadius: '0.5rem',
              padding: '0.5rem 1.25rem',
              cursor: 'pointer',
              fontSize: '1rem',
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}
