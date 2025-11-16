/**
 * Componente di test per RoomViewer
 * 
 * Mostra una camera 3D completa con tutti gli oggetti posizionati
 */

import RoomViewer from './RoomViewer';
import { useState } from 'react';

export default function TestRoom() {
  const [allLoaded, setAllLoaded] = useState(false);

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div style={{ 
        padding: '1rem', 
        background: 'white', 
        borderBottom: '1px solid #e5e7eb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '1.5rem' }}>🏠 La Tua Camera</h1>
          <p style={{ margin: '0.25rem 0 0 0', color: '#6b7280', fontSize: '0.875rem' }}>
            Esplora la camera 3D con tutti gli oggetti
          </p>
        </div>
        {allLoaded && (
          <div style={{
            padding: '0.5rem 1rem',
            background: '#10b981',
            color: 'white',
            borderRadius: '6px',
            fontSize: '0.875rem',
            fontWeight: '500'
          }}>
            ✅ Tutto caricato
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: 'relative' }}>
        <RoomViewer
          onAllLoaded={() => {
            console.log('✅ Tutti gli oggetti della camera sono stati caricati');
            setAllLoaded(true);
          }}
        />
      </div>
    </div>
  );
}

