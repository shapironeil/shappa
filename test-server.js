// Test script per verificare che il server funzioni
const http = require('http');

const PORT = process.env.PORT || 3000;
const BASE_URL = `http://localhost:${PORT}`;

const tests = [
    { path: '/', name: 'Home page (index.html)' },
    { path: '/test', name: 'Test endpoint' },
    { path: '/src/pages/dieta.html', name: 'Dieta page' },
    { path: '/src/pages/dashboard.html', name: 'Dashboard page' },
    { path: '/src/styles/main.css', name: 'Main CSS' }
];

function testEndpoint(path, name) {
    return new Promise((resolve, reject) => {
        const url = `${BASE_URL}${path}`;
        const req = http.get(url, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode === 200) {
                    console.log(`✅ ${name}: OK (${res.statusCode})`);
                    resolve(true);
                } else {
                    console.log(`❌ ${name}: Status ${res.statusCode}`);
                    resolve(false);
                }
            });
        });
        
        req.on('error', (err) => {
            console.log(`❌ ${name}: ${err.message}`);
            resolve(false);
        });
        
        req.setTimeout(5000, () => {
            req.destroy();
            console.log(`❌ ${name}: Timeout`);
            resolve(false);
        });
    });
}

async function runTests() {
    console.log(`\n🧪 Testing server at ${BASE_URL}\n`);
    
    let passed = 0;
    let failed = 0;
    
    for (const test of tests) {
        const result = await testEndpoint(test.path, test.name);
        if (result) passed++;
        else failed++;
        await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
    
    if (failed > 0) {
        console.log('⚠️  Some tests failed. Make sure the server is running:');
        console.log('   node server.js\n');
        process.exit(1);
    } else {
        console.log('✅ All tests passed!\n');
        process.exit(0);
    }
}

// Aspetta 2 secondi per dare tempo al server di avviarsi
setTimeout(runTests, 2000);

