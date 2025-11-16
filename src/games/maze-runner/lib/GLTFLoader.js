/**
 * GLTFLoader - Minimal version for loading GLTF/GLB models
 */

THREE.GLTFLoader = function(manager) {
    this.manager = (manager !== undefined) ? manager : THREE.DefaultLoadingManager;
    this.path = '';
};

THREE.GLTFLoader.prototype = {
    constructor: THREE.GLTFLoader,
    
    load: function(url, onLoad, onProgress, onError) {
        var scope = this;
        var fullPath = this.path + url;
        
        var loader = new THREE.FileLoader(scope.manager);
        loader.setResponseType('arraybuffer');
        
        loader.load(fullPath, function(data) {
            try {
                scope.parse(data, onLoad, onError);
            } catch (e) {
                if (onError) {
                    onError(e);
                } else {
                    console.error(e);
                }
            }
        }, onProgress, onError);
    },
    
    setPath: function(path) {
        this.path = path;
        return this;
    },
    
    parse: function(data, onLoad, onError) {
        // Parse GLB (binary GLTF)
        var magic = new TextDecoder().decode(new Uint8Array(data, 0, 4));
        
        if (magic === 'glTF') {
            // GLB format
            this.parseGLB(data, onLoad, onError);
        } else {
            // JSON GLTF
            var content = new TextDecoder().decode(new Uint8Array(data));
            var json = JSON.parse(content);
            this.parseGLTF(json, onLoad, onError);
        }
    },
    
    parseGLB: function(data, onLoad, onError) {
        try {
            var view = new DataView(data);
            var magic = view.getUint32(0, true);
            var version = view.getUint32(4, true);
            var length = view.getUint32(8, true);
            
            // JSON chunk
            var chunkLength = view.getUint32(12, true);
            var chunkType = view.getUint32(16, true);
            
            var jsonData = new Uint8Array(data, 20, chunkLength);
            var jsonText = new TextDecoder().decode(jsonData);
            var gltf = JSON.parse(jsonText);
            
            console.log('✅ GLB parsed successfully');
            
            // Create basic scene from GLTF data
            this.createScene(gltf, data, onLoad, onError);
        } catch (e) {
            console.error('❌ Error parsing GLB:', e);
            if (onError) onError(e);
        }
    },
    
    parseGLTF: function(json, onLoad, onError) {
        try {
            console.log('✅ GLTF parsed successfully');
            this.createScene(json, null, onLoad, onError);
        } catch (e) {
            console.error('❌ Error parsing GLTF:', e);
            if (onError) onError(e);
        }
    },
    
    createScene: function(gltf, binaryData, onLoad, onError) {
        try {
            var scene = new THREE.Group();
            scene.name = 'GLTF_Scene';
            
            // Parse nodes and create meshes
            if (gltf.nodes && gltf.meshes) {
                for (var i = 0; i < gltf.nodes.length; i++) {
                    var node = gltf.nodes[i];
                    if (node.mesh !== undefined) {
                        var mesh = this.createMesh(gltf, node.mesh, binaryData);
                        if (mesh) {
                            scene.add(mesh);
                        }
                    }
                }
            }
            
            if (onLoad) {
                onLoad({ scene: scene, scenes: [scene] });
            }
        } catch (e) {
            console.error('❌ Error creating scene:', e);
            if (onError) onError(e);
        }
    },
    
    createMesh: function(gltf, meshIndex, binaryData) {
        try {
            var meshDef = gltf.meshes[meshIndex];
            if (!meshDef || !meshDef.primitives || meshDef.primitives.length === 0) {
                return null;
            }
            
            var primitive = meshDef.primitives[0];
            
            // Create basic geometry
            var geometry = new THREE.BufferGeometry();
            
            // Try to load position data
            if (primitive.attributes && primitive.attributes.POSITION !== undefined) {
                var accessor = gltf.accessors[primitive.attributes.POSITION];
                // For now, create a simple box as placeholder
                geometry = new THREE.BoxGeometry(1, 1, 1);
            } else {
                // Fallback to box
                geometry = new THREE.BoxGeometry(1, 1, 1);
            }
            
            // Create material
            var material = new THREE.MeshStandardMaterial({
                color: 0x808080,
                roughness: 0.7,
                metalness: 0.3
            });
            
            var mesh = new THREE.Mesh(geometry, material);
            mesh.name = meshDef.name || 'Mesh';
            
            return mesh;
        } catch (e) {
            console.error('Error creating mesh:', e);
            return null;
        }
    }
};



