/**
 * Script per caricare file GLB direttamente da Windows su Digital Ocean Spaces
 * 
 * Uso:
 * node scripts/upload-glb-direct.js
 * 
 * Richiede variabili ambiente:
 * - DO_SPACES_ENDPOINT
 * - DO_SPACES_BUCKET
 * - DO_SPACES_KEY
 * - DO_SPACES_SECRET
 */

require('dotenv').config({ path: '.env.private' });
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configurazione Digital Ocean Spaces
const spacesEndpoint = process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com';
const spacesBucket = process.env.DO_SPACES_BUCKET || 'shappa-assets';
const spacesKey = process.env.DO_SPACES_KEY;
const spacesSecret = process.env.DO_SPACES_SECRET;

if (!spacesKey || !spacesSecret) {
    console.error('❌ ERRORE: DO_SPACES_KEY e DO_SPACES_SECRET devono essere configurati');
    console.error('');
    console.error('Aggiungi al tuo .env.private:');
    console.error('  DO_SPACES_ENDPOINT=https://nyc3.digitaloceanspaces.com');
    console.error('  DO_SPACES_BUCKET=shappa-assets');
    console.error('  DO_SPACES_KEY=your_access_key');
    console.error('  DO_SPACES_SECRET=your_secret_key');
    console.error('');
    console.error('Per ottenere le credenziali:');
    console.error('1. Vai su https://cloud.digitalocean.com/spaces');
    console.error('2. Crea un nuovo Space (es: shappa-assets)');
    console.error('3. Vai su API → Spaces Keys e genera una key pair');
    process.exit(1);
}

const s3Client = new S3Client({
    endpoint: spacesEndpoint,
    region: 'nyc3',
    credentials: {
        accessKeyId: spacesKey,
        secretAccessKey: spacesSecret,
    },
    forcePathStyle: false,
});

/**
 * Carica un file su Digital Ocean Spaces
 */
async function uploadFile(filePath, remotePath) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        const fileSizeMB = (fileContent.length / (1024 * 1024)).toFixed(2);
        
        console.log(`📤 Caricamento: ${fileName} (${fileSizeMB} MB) → ${remotePath}`);
        
        const command = new PutObjectCommand({
            Bucket: spacesBucket,
            Key: remotePath,
            Body: fileContent,
            ContentType: 'model/gltf-binary',
            ACL: 'public-read',
            CacheControl: 'public, max-age=31536000',
        });
        
        await s3Client.send(command);
        
        const publicUrl = `${spacesEndpoint}/${spacesBucket}/${remotePath}`;
        const cdnUrl = publicUrl.replace('.digitaloceanspaces.com', '.cdn.digitaloceanspaces.com');
        console.log(`✅ Caricato: ${cdnUrl}`);
        
        return { url: cdnUrl, size: fileSizeMB };
    } catch (error) {
        console.error(`❌ Errore caricamento ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * Main
 */
async function main() {
    console.log('🚀 Upload file GLB su Digital Ocean Spaces\n');
    console.log(`📍 Endpoint: ${spacesEndpoint}`);
    console.log(`📦 Bucket: ${spacesBucket}\n`);
    
    // Cerca file GLB in frontend/public/models
    const modelsDir = path.join(__dirname, '..', 'frontend', 'public', 'models');
    
    if (!fs.existsSync(modelsDir)) {
        console.error(`❌ Cartella non trovata: ${modelsDir}`);
        process.exit(1);
    }
    
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.glb'));
    
    if (files.length === 0) {
        console.log(`⚠️ Nessun file .glb trovato in ${modelsDir}`);
        process.exit(0);
    }
    
    console.log(`📦 Trovati ${files.length} file GLB da caricare...\n`);
    
    const results = [];
    let totalSize = 0;
    
    for (const file of files) {
        const localPath = path.join(modelsDir, file);
        const remotePath = `models/${file}`;
        
        try {
            const result = await uploadFile(localPath, remotePath);
            results.push({ file, ...result, success: true });
            totalSize += parseFloat(result.size);
        } catch (error) {
            results.push({ file, error: error.message, success: false });
        }
    }
    
    // Riepilogo
    console.log('\n📊 Riepilogo:');
    const success = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;
    console.log(`  ✅ Caricati: ${success}`);
    console.log(`  ❌ Falliti: ${failed}`);
    console.log(`  📦 Dimensione totale: ${totalSize.toFixed(2)} MB`);
    
    if (success > 0) {
        console.log('\n📝 URL dei file caricati:');
        results.filter(r => r.success).forEach(r => {
            console.log(`  - ${r.file}: ${r.url}`);
        });
        
        console.log('\n✅ I file sono ora disponibili su Digital Ocean Spaces!');
        console.log('\nPer usare i file nel gioco, aggiorna i path:');
        console.log('  Prima: /3d/model.glb');
        console.log('  Dopo:  /api/models/model.glb');
        console.log('  Oppure: https://shappa-assets.nyc3.cdn.digitaloceanspaces.com/models/model.glb');
    }
}

main().catch(console.error);

