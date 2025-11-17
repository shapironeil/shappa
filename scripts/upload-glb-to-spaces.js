/**
 * Script per caricare file GLB su Digital Ocean Spaces
 * 
 * Uso:
 * node scripts/upload-glb-to-spaces.js
 * 
 * Oppure per un singolo file:
 * node scripts/upload-glb-to-spaces.js path/to/file.glb
 */

require('dotenv').config();
const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

// Configurazione Digital Ocean Spaces (compatibile con S3 API)
const spacesEndpoint = process.env.DO_SPACES_ENDPOINT || 'https://nyc3.digitaloceanspaces.com';
const spacesBucket = process.env.DO_SPACES_BUCKET || 'shappa-assets';
const spacesKey = process.env.DO_SPACES_KEY;
const spacesSecret = process.env.DO_SPACES_SECRET;

if (!spacesKey || !spacesSecret) {
    console.error('❌ ERRORE: DO_SPACES_KEY e DO_SPACES_SECRET devono essere configurati in .env');
    console.error('   Aggiungi queste variabili al tuo .env.private o .env');
    process.exit(1);
}

const s3Client = new S3Client({
    endpoint: spacesEndpoint,
    region: 'nyc3',
    credentials: {
        accessKeyId: spacesKey,
        secretAccessKey: spacesSecret,
    },
    forcePathStyle: false, // Digital Ocean usa subdomain style
});

/**
 * Carica un file su Digital Ocean Spaces
 */
async function uploadFile(filePath, remotePath) {
    try {
        const fileContent = fs.readFileSync(filePath);
        const fileName = path.basename(filePath);
        
        console.log(`📤 Caricamento: ${fileName} → ${remotePath}`);
        
        const command = new PutObjectCommand({
            Bucket: spacesBucket,
            Key: remotePath,
            Body: fileContent,
            ContentType: 'model/gltf-binary',
            ACL: 'public-read', // File pubblici per accesso diretto
            CacheControl: 'public, max-age=31536000', // Cache 1 anno
        });
        
        await s3Client.send(command);
        
        const publicUrl = `${spacesEndpoint}/${spacesBucket}/${remotePath}`;
        console.log(`✅ Caricato: ${publicUrl}`);
        
        return publicUrl;
    } catch (error) {
        console.error(`❌ Errore caricamento ${filePath}:`, error.message);
        throw error;
    }
}

/**
 * Carica tutti i file GLB da una cartella
 */
async function uploadFolder(folderPath, baseRemotePath = 'models') {
    const files = fs.readdirSync(folderPath).filter(f => f.endsWith('.glb'));
    
    if (files.length === 0) {
        console.log(`⚠️ Nessun file .glb trovato in ${folderPath}`);
        return [];
    }
    
    console.log(`📦 Trovati ${files.length} file GLB da caricare...`);
    
    const results = [];
    for (const file of files) {
        const localPath = path.join(folderPath, file);
        const remotePath = `${baseRemotePath}/${file}`;
        
        try {
            const url = await uploadFile(localPath, remotePath);
            results.push({ file, url, success: true });
        } catch (error) {
            results.push({ file, error: error.message, success: false });
        }
    }
    
    return results;
}

// Main
async function main() {
    console.log('🚀 Upload file GLB su Digital Ocean Spaces\n');
    console.log(`📍 Endpoint: ${spacesEndpoint}`);
    console.log(`📦 Bucket: ${spacesBucket}\n`);
    
    const args = process.argv.slice(2);
    
    if (args.length > 0) {
        // Carica file singolo
        const filePath = args[0];
        if (!fs.existsSync(filePath)) {
            console.error(`❌ File non trovato: ${filePath}`);
            process.exit(1);
        }
        
        const fileName = path.basename(filePath);
        const url = await uploadFile(filePath, `models/${fileName}`);
        console.log(`\n✅ Completato! URL: ${url}`);
    } else {
        // Carica tutti i file dalle cartelle
        const folders = [
            { local: 'frontend/public/models', remote: 'models' },
            { local: '3d', remote: 'models' },
        ];
        
        const allResults = [];
        for (const folder of folders) {
            if (fs.existsSync(folder.local)) {
                console.log(`\n📁 Cartella: ${folder.local}`);
                const results = await uploadFolder(folder.local, folder.remote);
                allResults.push(...results);
            }
        }
        
        // Riepilogo
        console.log('\n📊 Riepilogo:');
        const success = allResults.filter(r => r.success).length;
        const failed = allResults.filter(r => !r.success).length;
        console.log(`  ✅ Caricati: ${success}`);
        console.log(`  ❌ Falliti: ${failed}`);
        
        if (success > 0) {
            console.log('\n📝 URL dei file caricati:');
            allResults.filter(r => r.success).forEach(r => {
                console.log(`  - ${r.file}: ${r.url}`);
            });
        }
    }
}

main().catch(console.error);

