import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

interface RoomObject {
  path: string;
  position: [number, number, number];
  rotation?: [number, number, number];
  scale?: number;
  targetSize?: number;
  name: string;
  interactable?: boolean;
}

interface RoomViewerProps {
  /** Classe CSS per il container */
  className?: string;
  /** Stile inline per il container */
  style?: React.CSSProperties;
  /** Callback quando tutti i modelli sono caricati */
  onAllLoaded?: () => void;
}

/**
 * Componente per visualizzare una camera 3D con arredamento
 * 
 * Carica e posiziona automaticamente:
 * - Tavolino (desk)
 * - Computer/Laptop
 * - Divano
 * - TV Vintage
 * - Librerie
 * - Altri oggetti
 */
export default function RoomViewer({
  className,
  style,
  onAllLoaded,
}: RoomViewerProps) {
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
  const [error, setError] = useState<string | null>(null);

  // Definizione oggetti della camera
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
      rotation: [0, Math.PI, 0], // Rivolto verso la camera
      targetSize: 0.4,
      name: 'Computer',
      interactable: true,
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

  // Funzione helper per caricare un modello
  const loadModel = (
    obj: RoomObject,
    onProgress?: (progress: number) => void
  ): Promise<THREE.Group> => {
    return new Promise((resolve, reject) => {
      if (!loaderRef.current) {
        reject(new Error('Loader non inizializzato'));
        return;
      }

      loaderRef.current.load(
        obj.path,
        (gltf) => {
          // Clona la scena ma preserva materiali e texture correttamente
          // Usa clone() con deep clone per evitare conflitti se lo stesso modello viene usato più volte
          const model = gltf.scene.clone(true);
          const modelName = obj.name;
          
          console.log(`📦 ${modelName} caricato, processando...`);
          console.log(`  📊 Scene children:`, model.children.length);

          // Calcola bounding box PRIMA di modificare posizione/scala
          const box = new THREE.Box3().setFromObject(model);
          const size = box.getSize(new THREE.Vector3());
          const center = box.getCenter(new THREE.Vector3());
          
          console.log(`  📐 Bounding box originale:`, size, 'Center:', center);

          // Auto-scaling PRIMA di posizionare
          const maxSize = Math.max(size.x, size.y, size.z);
          if (maxSize > 0) {
            const targetSize = obj.targetSize || 1;
            const scale = targetSize / maxSize;
            const finalScale = obj.scale ? scale * obj.scale : scale;
            model.scale.set(finalScale, finalScale, finalScale);
            console.log(`  🔍 Scale applicata:`, finalScale, `(targetSize: ${targetSize}, maxSize: ${maxSize})`);
          }

          // Ricalcola bounding box dopo scaling
          const boxAfterScale = new THREE.Box3().setFromObject(model);
          const sizeAfterScale = boxAfterScale.getSize(new THREE.Vector3());
          const centerAfterScale = boxAfterScale.getCenter(new THREE.Vector3());
          
          // Auto-centratura DOPO scaling
          model.position.set(...obj.position);
          model.position.sub(centerAfterScale);
          
          console.log(`  📍 Posizione finale:`, model.position);

          // Applica rotazione
          if (obj.rotation) {
            model.rotation.set(...obj.rotation);
            console.log(`  🔄 Rotazione applicata:`, obj.rotation);
          }

          // Configura materiali e shadow - FIX per visibilità
          let meshCount = 0;
          let materialCount = 0;
          let textureCount = 0;
          
          model.traverse((child) => {
            if (child instanceof THREE.Mesh) {
              meshCount++;
              child.visible = true; // FORZA visibilità
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Assicura che la geometria sia valida
              if (!child.geometry) {
                console.warn(`⚠️ ${obj.name}: Mesh senza geometria!`);
                return;
              }
              
              if (child.material) {
                const materials = Array.isArray(child.material) 
                  ? child.material 
                  : [child.material];
                
                materials.forEach((mat) => {
                  materialCount++;
                  
                  // Forza aggiornamento materiale
                  mat.needsUpdate = true;
                  
                  // Assicura che il materiale sia visibile
                  if (mat instanceof THREE.MeshStandardMaterial || 
                      mat instanceof THREE.MeshPhysicalMaterial ||
                      mat instanceof THREE.MeshLambertMaterial ||
                      mat instanceof THREE.MeshPhongMaterial ||
                      mat instanceof THREE.MeshBasicMaterial) {
                    // Rimuovi trasparenza
                    mat.transparent = false;
                    mat.opacity = 1.0;
                    mat.visible = true;
                    
                    // Se ha texture, assicurati che siano visibili
                    if (mat.map) {
                      textureCount++;
                      mat.map.needsUpdate = true;
                      console.log(`  🖼️ Texture trovata per ${obj.name}`);
                    }
                    if (mat.normalMap) {
                      mat.normalMap.needsUpdate = true;
                    }
                    if (mat.roughnessMap) {
                      mat.roughnessMap.needsUpdate = true;
                    }
                    if (mat.metalnessMap) {
                      mat.metalnessMap.needsUpdate = true;
                    }
                    
                    // NON modificare il colore se ha texture (preserva il materiale originale)
                    if (!mat.map) {
                      // Solo se NON ha texture, controlla il colore
                      const currentColor = mat.color ? mat.color.getHex() : 0x000000;
                      if (currentColor === 0x000000 || currentColor === 0x111111) {
                        mat.color = new THREE.Color(0x888888);
                        console.log(`  ⚠️ Materiale nero senza texture per ${obj.name}, applicato grigio`);
                      }
                    }
                    
                    // Assicura che il materiale sia illuminato correttamente
                    if (mat.emissive) {
                      mat.emissiveIntensity = 0;
                    }
                    
                    // Forza rendering
                    mat.needsUpdate = true;
                  } else {
                    // Per altri tipi di materiale, assicura visibilità
                    if ('transparent' in mat) {
                      mat.transparent = false;
                    }
                    if ('opacity' in mat) {
                      mat.opacity = 1.0;
                    }
                    if ('visible' in mat) {
                      mat.visible = true;
                    }
                    mat.needsUpdate = true;
                  }
                });
              } else {
                // Se non c'è materiale, aggiungine uno
                console.warn(`⚠️ ${obj.name}: Mesh senza materiale, aggiungo materiale di default`);
                child.material = new THREE.MeshStandardMaterial({
                  color: 0x888888,
                  roughness: 0.7,
                  metalness: 0.1,
                });
                materialCount++;
              }
            }
          });
          
          console.log(`  📊 Statistiche: ${meshCount} mesh, ${materialCount} materiali, ${textureCount} texture`);
          
          // Se non ci sono mesh, c'è un problema
          if (meshCount === 0) {
            console.error(`❌ ${obj.name}: Nessun mesh trovato nel modello!`);
          }
          
          // Assicura che il modello sia visibile
          model.visible = true;
          
          // Aggiungi userData per interattività
          if (obj.interactable) {
            model.userData.interactable = true;
            model.userData.type = obj.name.toLowerCase();
          }

          // Aggiorna matrice del mondo
          model.updateMatrixWorld(true);
          
          // Verifica finale che il modello sia nella scena corretta
          console.log(`✅ ${obj.name} processato e pronto`);
          console.log(`  📍 Posizione:`, model.position);
          console.log(`  🔍 Scala:`, model.scale);
          console.log(`  🔄 Rotazione:`, model.rotation);
          console.log(`  👁️ Visibile:`, model.visible);
          
          resolve(model);
        },
        (progress) => {
          if (onProgress && progress.total > 0) {
            onProgress((progress.loaded / progress.total) * 100);
          }
        },
        (error) => {
          reject(new Error(`Errore caricamento ${obj.name}: ${error.message}`));
        }
      );
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    // Inizializza scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf5f5f5);
    sceneRef.current = scene;

    // Inizializza camera
    const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    camera.position.set(0, 3, 8);
    camera.lookAt(0, 1, 0);
    cameraRef.current = camera;

    // Inizializza renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Luci - Aumentate per migliore visibilità
    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x888888, 1.2);
    hemisphereLight.position.set(0, 10, 0);
    scene.add(hemisphereLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(-5, 8, 5);
    directionalLight.castShadow = true;
    directionalLight.shadow.camera.left = -10;
    directionalLight.shadow.camera.right = 10;
    directionalLight.shadow.camera.top = 10;
    directionalLight.shadow.camera.bottom = -10;
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    scene.add(directionalLight);

    // Luce aggiuntiva per illuminare meglio
    const pointLight = new THREE.PointLight(0xffffff, 0.8, 20);
    pointLight.position.set(2, 2, 2);
    scene.add(pointLight);
    
    // Luce ambientale aggiuntiva
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    console.log('💡 Luci configurate:', {
      hemisphere: hemisphereLight.intensity,
      directional: directionalLight.intensity,
      point: pointLight.intensity,
      ambient: ambientLight.intensity,
    });

    // Pavimento
    const floorGeometry = new THREE.PlaneGeometry(20, 20);
    const floorMaterial = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.8,
      metalness: 0.2,
    });
    const floor = new THREE.Mesh(floorGeometry, floorMaterial);
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Pareti (opzionali, per dare più contesto)
    const wallMaterial = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.9,
    });

    // Parete posteriore
    const backWall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      wallMaterial
    );
    backWall.position.set(0, 5, -10);
    backWall.receiveShadow = true;
    scene.add(backWall);

    // Parete sinistra
    const leftWall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      wallMaterial
    );
    leftWall.rotation.y = Math.PI / 2;
    leftWall.position.set(-10, 5, 0);
    leftWall.receiveShadow = true;
    scene.add(leftWall);

    // Parete destra
    const rightWall = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 10),
      wallMaterial
    );
    rightWall.rotation.y = -Math.PI / 2;
    rightWall.position.set(10, 5, 0);
    rightWall.receiveShadow = true;
    scene.add(rightWall);

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    controls.target.set(0, 1, 0);
    controls.update();
    controlsRef.current = controls;

    // GLTFLoader
    const loader = new GLTFLoader();
    loaderRef.current = loader;

    // Carica tutti i modelli
    setLoading(true);
    setError(null);
    setLoadedCount(0);

    const loadPromises = roomObjects.map((obj) =>
      loadModel(obj, (progress) => {
        console.log(`Caricamento ${obj.name}: ${progress.toFixed(0)}%`);
      })
        .then((model) => {
          // Assicura che il modello sia visibile prima di aggiungerlo
          model.visible = true;
          
          // Aggiungi alla scena
          scene.add(model);
          modelsRef.current.set(obj.name, model);
          setLoadedCount((prev) => prev + 1);
          
          // Verifica che sia effettivamente nella scena
          console.log(`✅ ${obj.name} aggiunto alla scena`);
          console.log(`  📦 Scene children count:`, scene.children.length);
          console.log(`  👁️ Model visible:`, model.visible);
          console.log(`  📍 Model position:`, model.position);
          
          // Forza aggiornamento render
          if (rendererRef.current && sceneRef.current && cameraRef.current) {
            rendererRef.current.render(sceneRef.current, cameraRef.current);
          }
        })
        .catch((err) => {
          console.warn(`⚠️ ${obj.name} non caricato:`, err.message);
          // Continua anche se un modello fallisce
        })
    );

    Promise.allSettled(loadPromises).then(() => {
      setLoading(false);
      console.log('✅ Tutti i modelli processati');
      onAllLoaded?.();
    });

    // Animation loop
    const clock = new THREE.Clock();
    const animate = () => {
      animationFrameRef.current = requestAnimationFrame(animate);

      const delta = clock.getDelta();

      // Aggiorna controls
      controls.update();

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

      // Dispose controls
      if (controlsRef.current) {
        controlsRef.current.dispose();
        controlsRef.current = null;
      }

      // Dispose models
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
        if (sceneRef.current) {
          sceneRef.current.remove(model);
        }
      });
      modelsRef.current.clear();

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
  }, [onAllLoaded]);

  const totalObjects = roomObjects.length;
  const progress = totalObjects > 0 ? (loadedCount / totalObjects) * 100 : 0;

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
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            textAlign: 'center',
          }}
        >
          <div style={{ marginBottom: '1rem', fontSize: '18px' }}>
            🏠 Caricamento Camera...
          </div>
          <div style={{ color: '#666', marginBottom: '0.5rem' }}>
            {loadedCount} / {totalObjects} oggetti caricati
          </div>
          <div
            style={{
              width: '200px',
              height: '8px',
              background: '#e5e7eb',
              borderRadius: '4px',
              overflow: 'hidden',
              margin: '0 auto',
            }}
          >
            <div
              style={{
                width: `${progress}%`,
                height: '100%',
                background: '#3b82f6',
                transition: 'width 0.3s ease',
              }}
            />
          </div>
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
          <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }}>
            🎮 Controlli
          </div>
          <div>Click + Trascina: Ruota</div>
          <div>Scroll: Zoom</div>
          <div>Click Destro + Trascina: Pan</div>
        </div>
      )}
    </div>
  );
}

