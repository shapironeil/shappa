/**
 * Esempio di workflow Figma -> Frontend
 * 
 * Questo esempio mostra come usare il sistema di agenti per:
 * 1. Creare una pagina da design Figma
 * 2. Collegare la pagina alle API backend
 * 3. Gestire automazioni e notifiche
 */

const { getAgentCoordinator } = require('../index');

async function createPageFromFigmaExample() {
    const coordinator = getAgentCoordinator();

    try {
        console.log('🎨 Step 1: Creare pagina da design Figma...');
        
        // Crea una pagina dal design Figma
        const figmaResult = await coordinator.assignTask({
            type: 'create_page_from_figma',
            fileKey: 'your-figma-file-key', // Sostituisci con la tua Figma file key
            nodeId: 'node-id-optional', // Opzionale: ID del nodo specifico da usare
            pageName: 'dashboard',
            pagePath: 'src/pages/dashboard.html',
            backendConfig: {
                apiBase: 'https://shapiro.ninja',
                endpoints: [
                    {
                        path: '/api/sport/profile/:userId',
                        method: 'GET',
                        params: ['userId']
                    },
                    {
                        path: '/api/interests/:userId',
                        method: 'GET',
                        params: ['userId']
                    },
                    {
                        path: '/api/sport/stats/:userId',
                        method: 'GET',
                        params: ['userId']
                    }
                ],
                integrationType: 'fetch'
            },
            exportAssets: true,
            assetNodeIds: ['node1', 'node2'], // ID dei nodi da esportare come immagini
            assetFormat: 'png'
        });

        console.log('✅ Pagina creata:', figmaResult.pagePath);
        console.log('📦 Componenti generati:', figmaResult.components);
        console.log('🔗 Assets esportati:', figmaResult.assets?.length || 0);

        // Step 2: Collegare la pagina alle API backend
        console.log('\n🔌 Step 2: Collegare pagina alle API backend...');
        
        const linkResult = await coordinator.assignTask({
            type: 'link_page_to_api',
            pagePath: 'src/pages/dashboard.html',
            apiConfig: {
                endpoints: [
                    {
                        path: '/api/sport/profile/:userId',
                        method: 'GET'
                    },
                    {
                        path: '/api/interests/:userId',
                        method: 'GET'
                    }
                ],
                dataRequirements: [
                    {
                        type: 'sport',
                        componentId: 'sport-profile-component',
                        componentName: 'SportProfile'
                    },
                    {
                        type: 'interests',
                        componentId: 'interests-component',
                        componentName: 'InterestsList'
                    }
                ],
                integrationType: 'fetch'
            }
        });

        console.log('✅ Pagina collegata alle API');
        console.log('📊 Endpoint collegati:', linkResult.endpoints);

        // Step 3: Gestire automazioni
        console.log('\n⚙️ Step 3: Configurare automazioni...');
        
        const automationResult = await coordinator.assignTask({
            type: 'save_sport_automations',
            userId: 'user123',
            automations: {
                enableNotifications: true,
                notifyBefore: 30,
                sendExercisesDiscord: true,
                preferredTimeSlot: '18:00-20:00'
            }
        });

        console.log('✅ Automazioni configurate');

        // Step 4: Programmare notifiche
        console.log('\n📧 Step 4: Programmare notifiche...');
        
        const notificationResult = await coordinator.assignTask({
            type: 'schedule_notification',
            userId: 'user123',
            notificationType: 'workout_reminder',
            schedule: {
                hour: 18,
                minute: 0,
                days: ['monday', 'wednesday', 'friday']
            },
            message: 'Time for your workout!',
            data: {
                workoutId: 'workout-1'
            }
        });

        console.log('✅ Notifica programmata:', notificationResult.notificationId);

        console.log('\n🎉 Workflow completato con successo!');
        
    } catch (error) {
        console.error('❌ Errore durante il workflow:', error);
    }
}

// Esempio di uso con coda task
async function queueTasksExample() {
    const coordinator = getAgentCoordinator();

    try {
        console.log('📋 Aggiungendo task alla coda...');

        // Aggiungi multiple task alla coda
        const task1 = await coordinator.queueTask({
            type: 'start_monitor',
            interestData: {
                id: 'monitor-1',
                name: 'Prodotto Amazon',
                url: 'https://amazon.it/product',
                type: 'releasing',
                status: 'active',
                interval: 5,
                module: 'universal'
            },
            userId: 'user123'
        });

        const task2 = await coordinator.queueTask({
            type: 'complete_workout',
            userId: 'user123',
            workoutData: {
                workoutId: 'workout-1',
                exercises: [],
                duration: 60,
                calories: 400
            }
        });

        console.log('✅ Task aggiunti alla coda:', task1, task2);

        // Attendi che i task vengano processati
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Controlla statistiche
        const stats = coordinator.getStats();
        console.log('📊 Statistiche sistema:');
        console.log('  - Agenti:', stats.agents);
        console.log('  - Task in coda:', stats.queueSize);
        console.log('  - Task in elaborazione:', stats.processingTasks);

    } catch (error) {
        console.error('❌ Errore:', error);
    }
}

// Esempio di comunicazione diretta con agente
async function communicateWithAgentExample() {
    const coordinator = getAgentCoordinator();

    try {
        console.log('💬 Comunicazione con FigmaAgent...');

        const result = await coordinator.communicateWithAgent('FigmaAgent', {
            action: 'get_file_info',
            fileKey: 'your-figma-file-key'
        });

        console.log('✅ Risposta agente:', result);

    } catch (error) {
        console.error('❌ Errore:', error);
    }
}

// Esegui esempi se eseguito direttamente
if (require.main === module) {
    console.log('🚀 Esecuzione esempi Agent AI Committee System\n');
    
    // Esegui esempio workflow Figma
    createPageFromFigmaExample()
        .then(() => {
            console.log('\n✅ Esempio workflow Figma completato');
        })
        .catch(error => {
            console.error('❌ Errore nell\'esempio workflow Figma:', error);
        });
}

module.exports = {
    createPageFromFigmaExample,
    queueTasksExample,
    communicateWithAgentExample
};

