/**
 * ROOM VIEWER COMPLETO E FUNZIONANTE
 * 
 * Carica e visualizza tutti gli oggetti della camera
 */

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface RoomObject {
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  targetSize?: number;
  name: string;
}

interface RoomViewerFixedProps {
  className?: string;
  style?: React.CSSProperties;
  onAllLoaded?: () => void;
}

export default function RoomViewerFixed({
  className,
  style,
  onAllLoaded,
}: RoomViewerFixedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const modelsRef = useRef<Map<string, THREE.Group>>(new Map());
  const animationFrameRef = useRef<number | null>(null);
  const loaderRef = useRef<GLTFLoader | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadedCount, setLoadedCount] = useState(0);

  // Oggetti della camera
  const roomObjects: RoomObject[] = [
    {
      path: '/models/bench_model_free.glb',
      position: [2, 0, 2],
      rotation: [0, 0, 0],
      targetSize: 1.2,
      name: 'Tavolino',
    },
    {
      path: '/models/laptop_free.glb',
      position: [2, 0.8, 2],
      rotation: [0, Math.PI, 0],
      targetSize: 0.4,
      name: 'Computer',
    },
    {
      path: '/models/old_sofa_free.glb',
      position: [-2, 0, 1],
      rotation: [0, Math.PI / 2, 0],
      targetSize: 1.5,
      name: 'Divano',
    },
    {
      path: '/models/vintage_tv_free.glb',
      position: [-2, 0.6, 3],
      rotation: [0, -Math.PI / 2, 0],
      targetSize: 0.8,
      name: 'TV Vintage',
    },
    {
      path: '/models/chocolate_beech_bookshelf_free.glb',
      position: [4, 0, -1],
      rotation: [0, -Math.PI / 2, 0],
      targetSize: 1.5,
      name: 'Libreria',
    },
    {
      path: '/models/dusty_old_bookshelf_free.glb',
      position: [-4, 0, -1],
      rotation: [0, Math.PI / 2, 0],
      targetSize: 1.5,
      name: 'Libreria Vecchia',
    },
  ];

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 600;

    console.log('🚀 Inizializzazione Room Viewer');
    console.log(`  📐 Dimensioni: ${width}x${height}`);

    // SCENA
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // CAMERA
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // RENDERER
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // LUCI (ESSENZIALI)
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.0);
    directionalLight.position.set(-5, 8, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x444444, 0.6);
    hemisphereLight.position.set(0, 10, 0);
    scene.add(hemisphereLight);

    // PAVIMENTO
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 20),
      new THREE.MeshStandardMaterial({ color: 0xcccccc, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // CONTROLS
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.target.set(0, 1, 0);
    controls.update();
    controlsRef.current = controls;

    // LOADER
    const loader = new GLTFLoader();
    loaderRef.current = loader;

    // FUNZIONE CARICAMENTO
    const loadModel = (obj: RoomObject): Promise<void> => {
      return new Promise((resolve, reject) => {
        console.log(`📥 Caricamento: ${obj.name} (${obj.path})`);

        loader.load(
          obj.path,
          (gltf) => {
            const model = gltf.scene;
            console.log(`✅ ${obj.name} caricato`);

            // Bounding box
            const box = new THREE.Box3().setFromObject(model);
            const size = box.getSize(new THREE.Vector3());
            const center = box.getCenter(new THREE.Vector3());

            // Scaling
            const maxSize = Math.max(size.x, size.y, size.z);
            if (maxSize > 0) {
              const scale = (obj.targetSize || 1) / maxSize;
              model.scale.set(scale, scale, scale);
            }

            // Posizione
            const boxAfter = new THREE.Box3().setFromObject(model);
            const centerAfter = boxAfter.getCenter(new THREE.Vector3());
            model.position.set(...obj.position);
            model.position.sub(centerAfter);

            // Rotazione
            if (obj.rotation) {
              model.rotation.set(...obj.rotation);
            }

            // Materiali
            model.traverse((child) => {
              if (child instanceof THREE.Mesh) {
                child.visible = true;
                child.castShadow = true;
                child.receiveShadow = true;

                if (child.material) {
                  const mats = Array.isArray(child.material) ? child.material : [child.material];
                  mats.forEach((mat) => {
                    mat.needsUpdate = true;
                    if (mat instanceof THREE.MeshStandardMaterial) {
                      mat.transparent = false;
                      mat.opacity = 1.0;
                      if (mat.map) mat.map.needsUpdate = true;
                    }
                  });
                }
              }
            });

            model.visible = true;
            scene.add(model);
            modelsRef.current.set(obj.name, model);

            setLoadedCount((prev) => prev + 1);
            resolve();
          },
          undefined,
          (err) => {
            console.warn(`⚠️ ${obj.name} non caricato:`, err);
            resolve(); // Continua anche se fallisce
          }
        );
      });
    };

    // CARICA TUTTI I MODELLI
    setLoading(true);
    Promise.all(roomObjects.map(loadModel)).then(() => {
      setLoading(false);
      console.log('✅ Tutti i modelli processati');
      onAllLoaded?.();
    });

    // ANIMATION LOOP
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // RESIZE
    const handleResize = () => {
      if (!containerRef.current || !camera || !renderer) return;
      const newWidth = containerRef.current.clientWidth;
      const newHeight = containerRef.current.clientHeight;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };
    window.addEventListener('resize', handleResize);

    // CLEANUP
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      if (controlsRef.current) controlsRef.current.dispose();
      modelsRef.current.forEach((model) => {
        model.traverse((child) => {
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
        if (sceneRef.current) sceneRef.current.remove(model);
      });
      if (rendererRef.current) {
        rendererRef.current.dispose();
        if (container.contains(rendererRef.current.domElement)) {
          container.removeChild(rendererRef.current.domElement);
        }
      }
      sceneRef.current = null;
      cameraRef.current = null;
      rendererRef.current = null;
    };
  }, [onAllLoaded]);

  const total = roomObjects.length;
  const progress = total > 0 ? (loadedCount / total) * 100 : 0;

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
            background: 'rgba(255, 255, 255, 0.95)',
            padding: '2rem',
            borderRadius: '8px',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '1rem' }}>🏠 Caricamento Camera...</div>
          <div style={{ marginBottom: '0.5rem' }}>
            {loadedCount} / {total} oggetti
          </div>
          <div style={{ width: '200px', height: '8px', background: '#e5e7eb', borderRadius: '4px', margin: '0 auto' }}>
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#3b82f6',
                transition: 'width 0.3s',
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

