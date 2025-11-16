/**
 * GLB VIEWER COMPLETO E FUNZIONANTE
 * 
 * Questo componente risolve TUTTI i problemi di visualizzazione GLB:
 * - Caricamento corretto dei file
 * - Rendering completo
 * - Luci adeguate
 * - Debug completo
 * - Gestione errori
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface GLBViewerFixedProps {
  /** Path al file GLB (es: '/models/character.glb') */
  modelPath: string;
  /** Dimensione target per auto-scaling (default: 2) */
  targetSize?: number;
  /** Classe CSS */
  className?: string;
  /** Stile inline */
  style?: React.CSSProperties;
  /** Callback quando il modello è caricato */
  onLoad?: (model: THREE.Group) => void;
  /** Callback per errori */
  onError?: (error: Error) => void;
}

export default function GLBViewerFixed({
  modelPath,
  targetSize = 2,
  className,
  style,
  onLoad,
  onError,
}: GLBViewerFixedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const loaderRef = useRef<GLTFLoader | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string>('');

  useEffect(() => {
    // ==========================================
    // 1. VERIFICA CONTAINER
    // ==========================================
    if (!containerRef.current) {
      console.error('❌ Container non trovato!');
      return;
    }

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    console.log('🚀 Inizializzazione GLB Viewer');
    console.log(`  📐 Dimensioni container: ${width}x${height}`);
    console.log(`  📁 Path modello: ${modelPath}`);

    // ==========================================
    // 2. INIZIALIZZA SCENA
    // ==========================================
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;
    console.log('✅ Scena creata');

    // ==========================================
    // 3. INIZIALIZZA CAMERA
    // ==========================================
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 2, 5);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;
    console.log('✅ Camera creata:', {
      position: camera.position,
      fov: 75,
      aspect: width / height,
    });

    // ==========================================
    // 4. INIZIALIZZA RENDERER
    // ==========================================
    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: false,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    // Aggiungi canvas al container
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;
    console.log('✅ Renderer creato e aggiunto al DOM');

    // ==========================================
    // 5. LUCI (ESSENZIALI - SENZA QUESTE I GLB APPARE NERI)
    // ==========================================
    // Luce ambientale (illumina tutto uniformemente)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    console.log('✅ AmbientLight aggiunta (intensity: 0.8)');

    // Luce direzionale (simula sole)
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(5, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);
    console.log('✅ DirectionalLight aggiunta (intensity: 1.0)');

    // Luce emisferica (illuminazione ambiente)
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemisphereLight.position.set(0, 10, 0);
    scene.add(hemisphereLight);
    console.log('✅ HemisphereLight aggiunta (intensity: 0.6)');

    // ==========================================
    // 6. ORBIT CONTROLS
    // ==========================================
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 1;
    controls.maxDistance = 20;
    controls.target.set(0, 0, 0);
    controls.update();
    controlsRef.current = controls;
    console.log('✅ OrbitControls configurati');

    // ==========================================
    // 7. GLTF LOADER
    // ==========================================
    const loader = new GLTFLoader();
    loaderRef.current = loader;
    console.log('✅ GLTFLoader creato');

    // ==========================================
    // 8. CARICA MODELLO
    // ==========================================
    setLoading(true);
    setError(null);
    setDebugInfo('Caricamento modello...');

    console.log(`📥 Caricamento: ${modelPath}`);

    loader.load(
      modelPath,
      // SUCCESS
      (gltf) => {
        console.log('✅ GLB caricato con successo!');
        console.log('  📦 Scene:', gltf.scene);
        console.log('  🎬 Animazioni:', gltf.animations.length);
        console.log('  📊 Scene children:', gltf.scene.children.length);

        const model = gltf.scene;
        modelRef.current = model;

        // ==========================================
        // 9. CALCOLA BOUNDING BOX
        // ==========================================
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        console.log('📐 Bounding Box:');
        console.log('  Size:', size);
        console.log('  Center:', center);
        console.log('  Min:', box.min);
        console.log('  Max:', box.max);

        // ==========================================
        // 10. AUTO-SCALING
        // ==========================================
        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 0) {
          const scale = targetSize / maxSize;
          model.scale.set(scale, scale, scale);
          console.log(`🔍 Scaling applicato: ${scale.toFixed(3)} (targetSize: ${targetSize}, maxSize: ${maxSize.toFixed(3)})`);
        } else {
          console.warn('⚠️ Bounding box vuoto, nessuno scaling applicato');
        }

        // ==========================================
        // 11. CENTRATURA
        // ==========================================
        // Ricalcola center dopo scaling
        const boxAfterScale = new THREE.Box3().setFromObject(model);
        const centerAfterScale = boxAfterScale.getCenter(new THREE.Vector3());
        model.position.sub(centerAfterScale);
        console.log('📍 Modello centrato:', model.position);

        // ==========================================
        // 12. CONFIGURA MATERIALI E MESH
        // ==========================================
        let meshCount = 0;
        let materialCount = 0;
        let textureCount = 0;

        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            meshCount++;
            child.visible = true;
            child.castShadow = true;
            child.receiveShadow = true;

            if (child.material) {
              const materials = Array.isArray(child.material)
                ? child.material
                : [child.material];

              materials.forEach((mat) => {
                materialCount++;
                mat.needsUpdate = true;

                // Gestisci tutti i tipi di materiale
                if (
                  mat instanceof THREE.MeshStandardMaterial ||
                  mat instanceof THREE.MeshPhysicalMaterial ||
                  mat instanceof THREE.MeshLambertMaterial ||
                  mat instanceof THREE.MeshPhongMaterial
                ) {
                  mat.transparent = false;
                  mat.opacity = 1.0;

                  // Texture
                  if (mat.map) {
                    textureCount++;
                    mat.map.needsUpdate = true;
                  }
                  if (mat.normalMap) mat.normalMap.needsUpdate = true;
                  if (mat.roughnessMap) mat.roughnessMap.needsUpdate = true;
                  if (mat.metalnessMap) mat.metalnessMap.needsUpdate = true;
                  if (mat.aoMap) mat.aoMap.needsUpdate = true;
                  if (mat.emissiveMap) mat.emissiveMap.needsUpdate = true;

                  // Se non ha texture e colore è nero, applica grigio
                  if (!mat.map && mat.color) {
                    const colorHex = mat.color.getHex();
                    if (colorHex === 0x000000 || colorHex === 0x111111) {
                      mat.color = new THREE.Color(0x888888);
                      console.log(`  ⚠️ Materiale nero corretto a grigio`);
                    }
                  }
                }
              });
            } else {
              // Materiale mancante - aggiungi default
              child.material = new THREE.MeshStandardMaterial({
                color: 0x888888,
                roughness: 0.7,
                metalness: 0.1,
              });
              materialCount++;
              console.warn(`  ⚠️ Mesh senza materiale, aggiunto default`);
            }
          }
        });

        console.log(`📊 Statistiche modello:`);
        console.log(`  Mesh: ${meshCount}`);
        console.log(`  Materiali: ${materialCount}`);
        console.log(`  Texture: ${textureCount}`);

        // ==========================================
        // 13. AGGIUNGI ALLA SCENA
        // ==========================================
        model.visible = true;
        scene.add(model);
        console.log('✅ Modello aggiunto alla scena');

        // ==========================================
        // 14. AGGIORNA CAMERA PER INQUADRARE
        // ==========================================
        const finalBox = new THREE.Box3().setFromObject(model);
        const finalSize = finalBox.getSize(new THREE.Vector3());
        const maxDim = Math.max(finalSize.x, finalSize.y, finalSize.z);
        const distance = maxDim * 2;

        camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7);
        camera.lookAt(0, 0, 0);
        controls.target.set(0, 0, 0);
        controls.update();

        console.log('✅ Camera posizionata per inquadrare il modello');
        console.log(`  Camera position:`, camera.position);
        console.log(`  Distance: ${distance.toFixed(2)}`);

        // ==========================================
        // 15. ANIMAZIONI (se presenti)
        // ==========================================
        let mixer: THREE.AnimationMixer | null = null;
        if (gltf.animations && gltf.animations.length > 0) {
          mixer = new THREE.AnimationMixer(model);
          gltf.animations.forEach((clip) => {
            mixer!.clipAction(clip).play();
          });
          console.log(`✅ ${gltf.animations.length} animazioni avviate`);
        }

        // ==========================================
        // 16. RENDER LOOP
        // ==========================================
        const clock = new THREE.Clock();
        const animate = () => {
          animationFrameRef.current = requestAnimationFrame(animate);

          const delta = clock.getDelta();

          // Aggiorna animazioni
          if (mixer) {
            mixer.update(delta);
          }

          // Aggiorna controls
          controls.update();

          // Render
          renderer.render(scene, camera);
        };
        animate();

        // ==========================================
        // 17. CALLBACKS
        // ==========================================
        setLoading(false);
        setDebugInfo(`✅ Modello caricato: ${meshCount} mesh, ${materialCount} materiali`);
        onLoad?.(model);
      },
      // PROGRESS
      (progress) => {
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          setDebugInfo(`Caricamento: ${percent.toFixed(0)}%`);
          console.log(`📥 Progress: ${percent.toFixed(0)}%`);
        }
      },
      // ERROR
      (error) => {
        console.error('❌ ERRORE caricamento GLB:', error);
        const errorMessage = `Errore caricamento: ${error.message || 'Sconosciuto'}`;
        setError(errorMessage);
        setLoading(false);
        setDebugInfo(errorMessage);
        onError?.(new Error(errorMessage));
      }
    );

    // ==========================================
    // 18. RESIZE HANDLER
    // ==========================================
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // ==========================================
    // 19. CLEANUP
    // ==========================================
    return () => {
      console.log('🧹 Cleanup GLB Viewer');
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      if (controlsRef.current) {
        controlsRef.current.dispose();
      }

      if (modelRef.current) {
        modelRef.current.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (child.geometry) child.geometry.dispose();
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => mat.dispose());
              } else {
                child.material.dispose();
              }
            }
          }
        });
        if (sceneRef.current) {
          sceneRef.current.remove(modelRef.current);
        }
      }

      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }

      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
      loaderRef.current = null;
    };
  }, [modelPath, targetSize, onLoad, onError]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        background: '#f0f0f0',
        ...style,
      }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '18px', marginBottom: '0.5rem' }}>⏳ Caricamento...</div>
          <div style={{ fontSize: '14px', color: '#666' }}>{debugInfo}</div>
        </div>
      )}

      {error && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            background: '#fee2e2',
            color: '#dc2626',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
            maxWidth: '500px',
          }}
        >
          <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '0.5rem' }}>❌ Errore</div>
          <div style={{ fontSize: '14px' }}>{error}</div>
          <div style={{ fontSize: '12px', marginTop: '1rem', color: '#991b1b' }}>
            Verifica che il file esista in: <code>{modelPath}</code>
          </div>
        </div>
      )}

      {!loading && !error && (
        <div
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(0, 0, 0, 0.7)',
            color: 'white',
            padding: '0.75rem 1rem',
            borderRadius: '6px',
            fontSize: '12px',
            zIndex: 10,
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>🎮 Controlli</div>
          <div>Click + Trascina: Ruota</div>
          <div>Scroll: Zoom</div>
          <div>Click Destro + Trascina: Pan</div>
        </div>
      )}
    </div>
  );
}

