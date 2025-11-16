/**
 * COMPONENTE DI TEST PER LA CAMERA - USA QUESTO
 */

import RoomViewerFixed from './RoomViewerFixed';

export default function TestRoomFixed() {
  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '1rem', background: 'white', borderBottom: '1px solid #e5e7eb' }}>
        <h1 style={{ margin: 0 }}>🏠 La Tua Camera</h1>
        <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>
          Camera 3D con tutti gli oggetti
        </p>
      </div>
      <div style={{ flex: 1 }}>
        <RoomViewerFixed
          onAllLoaded={() => {
            console.log('✅ Tutti gli oggetti caricati!');
          }}
        />
      </div>
    </div>
  );
}

