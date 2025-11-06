/**
 * Genera certificati SSL self-signed per sviluppo locale
 */
const selfsigned = require('selfsigned');
const fs = require('fs');
const path = require('path');

const sslDir = path.join(__dirname, 'ssl');

// Crea la directory ssl se non esiste
if (!fs.existsSync(sslDir)) {
    fs.mkdirSync(sslDir);
}

const keyPath = path.join(sslDir, 'key.pem');
const certPath = path.join(sslDir, 'cert.pem');

// Verifica se i certificati esistono già
if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    console.log('✅ Certificati SSL già esistenti in ssl/');
    process.exit(0);
}

try {
    console.log('🔐 Generazione certificati SSL self-signed...');
    
    // Attributi del certificato
    const attrs = [{ name: 'commonName', value: 'localhost' }];
    
    // Opzioni
    const options = {
        keySize: 2048,
        days: 365,
        algorithm: 'sha256',
        extensions: [
            {
                name: 'subjectAltName',
                altNames: [
                    { type: 2, value: 'localhost' },
                    { type: 7, ip: '127.0.0.1' }
                ]
            }
        ]
    };
    
    // Genera certificati
    const pems = selfsigned.generate(attrs, options);
    
    // Salva i file
    fs.writeFileSync(keyPath, pems.private, 'utf8');
    fs.writeFileSync(certPath, pems.cert, 'utf8');
    
    console.log('✅ Certificati SSL generati con successo!');
    console.log(`   📄 Private Key: ${keyPath}`);
    console.log(`   📄 Certificate: ${certPath}`);
    console.log('\n⚠️  NOTA: Questi sono certificati self-signed per sviluppo.');
    console.log('   Il browser mostrerà un avviso di sicurezza - è normale.');
    console.log('   Clicca su "Avanzate" > "Procedi comunque" nel browser.\n');
    
} catch (error) {
    console.error('❌ Errore durante la generazione dei certificati:', error.message);
    process.exit(1);
}
