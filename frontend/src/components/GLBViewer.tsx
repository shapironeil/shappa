import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface GLBViewerProps {
  /** Path al file .glb (es. '/models/character.glb') */
  modelPath: string;
  /** Dimensione target per auto-scaling (default: 2) */
  targetSize?: number;
  /** Abilita/disabilita OrbitControls (default: true) */
  enableControls?: boolean;
  /** Callback quando il modello è caricato */
  onLoad?: (model: THREE.Group) => void;
  /** Callback per errori */
  onError?: (error: Error) => void;
  /** Classe CSS per il container */
  className?: string;
  /** Stile inline per il container */
  style?: React.CSSProperties;
}

/**
 * Componente React per visualizzare modelli 3D GLB con Three.js
 * 
 * Caratteristiche:
 * - Auto-centratura e auto-scaling basato su bounding box
 * - OrbitControls per rotazione con mouse
 * - Luce Hemisphere + Directional
 * - Supporto animazioni (AnimationMixer)
 * - Gestione errori e loading state
 * - Cleanup automatico per evitare memory leak
 * 
 * @example
 * ```tsx
 * <GLBViewer 
 *   modelPath="/models/character.glb" 
 *   targetSize={2}
 *   onLoad={(model) => console.log('Modello caricato:', model)}
 * />
 * ```
 */
export default function GLBViewer({
  modelPath,
  targetSize = 2,
  enableControls = true,
  onLoad,
  onError,
  className,
  style,
}: GLBViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const modelRef = useRef<THREE.Group | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const loaderRef = useRef<GLTFLoader | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Inizializza scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf0f0f0);
    sceneRef.current = scene;

    // Inizializza camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 0, 5);
    cameraRef.current = camera;

    // Inizializza renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Luci
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemisphereLight.position.set(0, 20, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(-10, 10, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // OrbitControls
    let controls: OrbitControls | null = null;
    if (enableControls) {
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 1;
      controls.maxDistance = 20;
      controlsRef.current = controls;
    }

    // GLTFLoader
    const loader = new GLTFLoader();
    loaderRef.current = loader;

    // Carica modello
    setLoading(true);
    setError(null);

    loader.load(
      modelPath,
      (gltf) => {
        const model = gltf.scene;
        modelRef.current = model;

        // Calcola bounding box per auto-centratura e scaling
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Auto-centratura: sposta il modello all'origine
        model.position.sub(center);

        // Auto-scaling: scala il modello alla dimensione target
        const maxSize = Math.max(size.x, size.y, size.z);
        if (maxSize > 0) {
          const scale = targetSize / maxSize;
          model.scale.set(scale, scale, scale);
        }

        // Abilita shadow per tutti i mesh
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            // Fix materiali neri: assicura che i materiali siano visibili
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial) {
                    mat.needsUpdate = true;
                  }
                });
              } else if (child.material instanceof THREE.MeshStandardMaterial) {
                child.material.needsUpdate = true;
              }
            }
          }
        });

        scene.add(model);

        // Gestione animazioni
        if (gltf.animations && gltf.animations.length > 0) {
          const mixer = new THREE.AnimationMixer(model);
          mixerRef.current = mixer;

          gltf.animations.forEach((clip) => {
            mixer.clipAction(clip).play();
          });
        }

        // Aggiorna camera per inquadrare il modello
        const boxAfterScale = new THREE.Box3().setFromObject(model);
        const sizeAfterScale = boxAfterScale.getSize(new THREE.Vector3());
        const maxDim = Math.max(sizeAfterScale.x, sizeAfterScale.y, sizeAfterScale.z);
        const distance = maxDim * 2;

        camera.position.set(distance * 0.7, distance * 0.5, distance * 0.7);
        camera.lookAt(0, 0, 0);

        if (controls) {
          controls.target.set(0, 0, 0);
          controls.update();
        }

        setLoading(false);
        onLoad?.(model);
      },
      (progress) => {
        // Progress callback (opzionale, per future implementazioni di progress bar)
        const percent = (progress.loaded / progress.total) * 100;
        console.log(`Loading ${modelPath}: ${percent.toFixed(0)}%`);
      },
      (err) => {
        const error = new Error(`Failed to load GLB model: ${err.message}`);
        console.error('GLBViewer error:', error);
        setError(error.message);
        setLoading(false);
        onError?.(error);
      }
    );

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Aggiorna animazioni
      if (mixerRef.current) {
        mixerRef.current.update(delta);
      }

      // Aggiorna controls
      if (controls) {
        controls.update();
      }

      renderer.render(scene, camera);
    };
    animate();

    // Handle resize
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      // Dispose mixer
      if (mixerRef.current) {
        mixerRef.current.stopAllAction();
        mixerRef.current = null;
      }

      // Dispose controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      // Dispose model
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
        modelRef.current = null;
      }

      // Dispose renderer
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current = null;
      }

      // Clear refs
      sceneRef.current = null;
      cameraRef.current = null;
      loaderRef.current = null;
    };
  }, [modelPath, targetSize, enableControls, onLoad, onError]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={{ width: '100%', height: '100%', position: 'relative', ...style }}
    >
      {loading && (
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 10,
            color: '#666',
            fontSize: '14px',
          }}
        >
          Caricamento modello...
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
            color: '#dc2626',
            fontSize: '14px',
            textAlign: 'center',
            padding: '1rem',
            background: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '4px',
          }}
        >
          <div style={{ fontWeight: 'bold', marginBottom: '0.5rem' }}>Errore</div>
          <div>{error}</div>
        </div>
      )}
    </div>
  );
}

