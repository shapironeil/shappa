#!/bin/bash

# Script per caricare file GLB dal server su Digital Ocean Spaces
# Esegui sul server: bash scripts/upload-glb-from-server.sh

set -e

echo "🚀 Upload file GLB dal server su Digital Ocean Spaces"
echo ""

# Verifica variabili ambiente
if [ -z "$DO_SPACES_KEY" ] || [ -z "$DO_SPACES_SECRET" ]; then
    echo "❌ ERRORE: DO_SPACES_KEY e DO_SPACES_SECRET non configurate"
    echo ""
    echo "Aggiungi al tuo .env sul server:"
    echo "  DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com"
    echo "  DO_SPACES_BUCKET=shappa-assets"
    echo "  DO_SPACES_KEY=your_access_key"
    echo "  DO_SPACES_SECRET=your_secret_key"
    exit 1
fi

# Installa AWS SDK se necessario
if [ ! -d "node_modules/@aws-sdk" ]; then
    echo "📦 Installazione AWS SDK..."
    npm install @aws-sdk/client-s3
fi

# Cerca file GLB
GLB_FILES=()

if [ -d "3d" ]; then
    while IFS= read -r file; do
        GLB_FILES+=("$file")
    done < <(find 3d -name "*.glb" -type f)
fi

if [ -d "frontend/public/models" ]; then
    while IFS= read -r file; do
        GLB_FILES+=("$file")
    done < <(find frontend/public/models -name "*.glb" -type f)
fi

if [ ${#GLB_FILES[@]} -eq 0 ]; then
    echo "⚠️ Nessun file GLB trovato"
    exit 0
fi

echo "📦 Trovati ${#GLB_FILES[@]} file GLB da caricare"
echo ""

# Carica file
for file in "${GLB_FILES[@]}"; do
    filename=$(basename "$file")
    echo "📤 Caricamento: $filename"
    
    node -e "
        const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
        const fs = require('fs');
        const path = require('path');
        
        const s3Client = new S3Client({
            endpoint: process.env.DO_SPACES_ENDPOINT,
            region: 'nyc3',
            credentials: {
                accessKeyId: process.env.DO_SPACES_KEY,
                secretAccessKey: process.env.DO_SPACES_SECRET,
            },
            forcePathStyle: false,
        });
        
        const filePath = '$file';
        const fileContent = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        
        const command = new PutObjectCommand({
            Bucket: process.env.DO_SPACES_BUCKET,
            Key: 'models/' + fileName,
            Body: fileContent,
            ContentType: 'model/gltf-binary',
            ACL: 'public-read',
            CacheControl: 'public, max-age=31536000',
        });
        
        s3Client.send(command).then(() => {
            const url = process.env.DO_SPACES_ENDPOINT + '/' + process.env.DO_SPACES_BUCKET + '/models/' + fileName;
            console.log('✅ Caricato: ' + url);
        }).catch(err => {
            console.error('❌ Errore:', err.message);
            process.exit(1);
        });
    "
    
    echo ""
done

echo "✅ Upload completato!"

