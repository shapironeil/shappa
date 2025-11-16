/**
 * Componente di test per GLBViewer
 * 
 * Per testare:
 * 1. Copia un file .glb in frontend/public/models/ (es. character.glb)
 * 2. Importa questo componente in App.tsx temporaneamente
 * 3. Avvia npm run dev
 */

import GLBViewer from './GLBViewer';
import { useState } from 'react';

export default function TestGLBViewer() {
  const [modelPath] = useState('/models/character.glb'); // Cambia con il tuo file
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      padding: '2rem',
      boxSizing: 'border-box'
    }}>
      <div style={{ marginBottom: '1rem' }}>
        <h1 style={{ margin: 0, marginBottom: '0.5rem' }}>🧪 Test GLB Viewer</h1>
        <p style={{ margin: 0, color: '#666' }}>
          Assicurati di avere un file .glb in <code>public/models/character.glb</code>
        </p>
      </div>

      {loading && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          background: 'white',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          ⏳ Caricamento modello...
        </div>
      )}

      {error && (
        <div style={{ 
          position: 'absolute', 
          top: '50%', 
          left: '50%', 
          transform: 'translate(-50%, -50%)',
          zIndex: 100,
          background: '#fee2e2',
          color: '#dc2626',
          padding: '1rem 2rem',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ Errore</div>
          <div>{error}</div>
          <div style={{ marginTop: '1rem', fontSize: '0.875rem', color: '#991b1b' }}>
            Verifica che il file esista in <code>public/models/character.glb</code>
          </div>
        </div>
      )}

      <div style={{ 
        flex: 1, 
        border: '2px solid #e5e7eb', 
        borderRadius: '8px', 
        overflow: 'hidden',
        background: '#f9fafb'
      }}>
        <GLBViewer
          modelPath={modelPath}
          targetSize={2}
          enableControls={true}
          onLoad={(model) => {
            console.log('✅ Modello caricato:', model);
            setLoading(false);
          }}
          onError={(err) => {
            console.error('❌ Errore:', err);
            setError(err.message);
            setLoading(false);
          }}
        />
      </div>

      <div style={{ 
        marginTop: '1rem', 
        padding: '1rem', 
        background: '#f3f4f6', 
        borderRadius: '4px',
        fontSize: '0.875rem',
        color: '#6b7280'
      }}>
        <strong>Controlli:</strong> Click e trascina per ruotare • Scroll per zoom • Click destro + trascina per pan
      </div>
    </div>
  );
}

