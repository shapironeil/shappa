/**
 * COMPONENTE DI TEST - USA QUESTO PER VERIFICARE
 */

import GLBViewerFixed from './GLBViewerFixed';

export default function TestGLBFixed() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ margin: 0 }}>🧪 Test GLB Viewer</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
          Testa un singolo modello GLB
        </p>
      </div>
      <div style={{ flex: 1 }}>
        <GLBViewerFixed
          modelPath="/models/laptop_free.glb"
          targetSize={2}
          onLoad={(model) => {
            console.log('✅ Modello caricato:', model);
          }}
          onError={(err) => {
            console.error('❌ Errore:', err);
          }}
        />
      </div>
    </div>
  );
}

