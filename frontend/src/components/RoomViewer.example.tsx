/**
 * Esempi di utilizzo del componente RoomViewer
 * 
 * Questo file mostra diversi modi di utilizzare RoomViewer
 */

import RoomViewer from './RoomViewer';
import { useState } from 'react';

// Esempio 1: Utilizzo base
export function BasicRoomExample() {
  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      <RoomViewer />
    </div>
  );
}

// Esempio 2: Con header e callback
export function RoomWithHeaderExample() {
  const [loaded, setLoaded] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ 
        padding: '1rem', 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb' 
      }}>
        <h1 style={{ margin: 0 }}>🏠 La Mia Camera</h1>
        {loaded && <p style={{ margin: '0.5rem 0 0 0', color: '#10b981' }}>✅ Caricamento completato</p>}
      </div>
      <div style={{ flex: 1 }}>
        <RoomViewer
          onAllLoaded={() => {
            console.log('Camera pronta!');
            setLoaded(true);
          }}
        />
      </div>
    </div>
  );
}

// Esempio 3: In un container con dimensioni specifiche
export function RoomInContainerExample() {
  return (
    <div style={{ padding: '2rem' }}>
      <h1>Visualizzatore Camera</h1>
      <div style={{ 
        width: '800px', 
        height: '600px', 
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <RoomViewer />
      </div>
    </div>
  );
}

// Esempio 4: Con styling personalizzato
export function StyledRoomExample() {
  return (
    <div className="room-container" style={{ 
      width: '100%', 
      height: '100vh',
      background: 'linear-gradient(to bottom, #f3f4f6, #ffffff)'
    }}>
      <RoomViewer
        className="room-viewer"
        style={{ 
          border: '1px solid #d1d5db',
          borderRadius: '12px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}
      />
    </div>
  );
}

// Esempio 5: Full screen con overlay
export function FullScreenRoomExample() {
  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      <RoomViewer />
      <div style={{
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: 'rgba(0, 0, 0, 0.7)',
        color: 'white',
        padding: '1rem',
        borderRadius: '8px',
        fontSize: '14px',
        zIndex: 100
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>🎮 Controlli</div>
        <div>• Click + Trascina: Ruota</div>
        <div>• Scroll: Zoom</div>
        <div>• Click Destro: Pan</div>
      </div>
    </div>
  );
}

