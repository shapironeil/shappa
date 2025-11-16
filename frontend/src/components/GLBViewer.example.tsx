/**
 * Esempio di utilizzo del componente GLBViewer
 * 
 * Questo file mostra come utilizzare GLBViewer in diversi scenari.
 * Non importare questo file direttamente - usa GLBViewer.tsx invece.
 */

import GLBViewer from './GLBViewer';
import { useState } from 'react';

// Esempio 1: Utilizzo base
export function BasicExample() {
  return (
    <div style={{ width: '800px', height: '600px' }}>
      <GLBViewer modelPath="/models/character.glb" />
    </div>
  );
}

// Esempio 2: Con callbacks e gestione stato
export function WithCallbacksExample() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  return (
    <div style={{ width: '800px', height: '600px' }}>
      {loading && <div>Caricamento modello...</div>}
      {error && <div style={{ color: 'red' }}>Errore: {error}</div>}
      
      <GLBViewer
        modelPath="/models/character.glb"
        targetSize={3}
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
  );
}

// Esempio 3: Full screen
export function FullScreenExample() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <GLBViewer
        modelPath="/models/character.glb"
        targetSize={2}
        enableControls={true}
      />
    </div>
  );
}

// Esempio 4: Con styling personalizzato
export function StyledExample() {
  return (
    <div className="container" style={{ padding: '2rem' }}>
      <h1>Visualizzatore 3D</h1>
      <div style={{ border: '2px solid #ccc', borderRadius: '8px', overflow: 'hidden' }}>
        <GLBViewer
          modelPath="/models/character.glb"
          className="glb-viewer"
          style={{ width: '100%', height: '600px' }}
        />
      </div>
    </div>
  );
}

// Esempio 5: Senza controls (solo visualizzazione statica)
export function StaticExample() {
  return (
    <div style={{ width: '400px', height: '400px' }}>
      <GLBViewer
        modelPath="/models/character.glb"
        enableControls={false}
        targetSize={1.5}
      />
    </div>
  );
}

