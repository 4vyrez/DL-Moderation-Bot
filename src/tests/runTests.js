const path = require('path');
const { loadCommands } = require('../utils/commandLoader');
const { MockInteraction } = require('./MockFactory');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

async function runTests() {
    console.log('--- Starting Internal API Test System ---');

    const commandsPath = path.join(__dirname, '../commands');
    const loaded = loadCommands(commandsPath);

    console.log(`Found ${loaded.length} commands.`);

    let passed = 0;
    let failed = 0;
    let skipped = 0;

    for (const { path: filePath, command } of loaded) {
        const commandName = command.data.name;
        console.log(`\nTesting command: [${commandName}]`);

        // Validation Check
        if (!command.data || !command.execute) {
            console.error(`❌ [FAILED] Invalid command structure at ${filePath}`);
            failed++;
            continue;
        }

        // Check for required options
        // This is a naive check; sophisticated testing would need specific test cases per command
        const options = command.data.options || [];
        const hasRequired = options.some(opt => opt.required);

        if (hasRequired) {
            console.log(`⚠️ [SKIPPED] Execution skipped (Requires options). Structure is valid.`);
            skipped++;
            continue;
        }

        // Mock Execution
        try {
            const mock = new MockInteraction({ commandName });
            await command.execute(mock);

            if (mock.replied || mock.deferred) {
                console.log(`✅ [PASSED] Executed successfully.`);
                passed++;
            } else {
                console.log(`⚠️ [WARNING] Command executed but sent no reply.`);
                passed++; // Still counts as no crash
            }

            // Log responses for debugging
            // console.log('Responses:', mock.responses);

        } catch (error) {
            console.error(`❌ [FAILED] Execution error:`, error);
            failed++;
        }
    }

    console.log('\n--- Test Summary ---');
    console.log(`Total: ${loaded.length}`);
    console.log(`Passed: ${passed}`);
    console.log(`Skipped: ${skipped}`);
    console.log(`Failed: ${failed}`);

    if (failed > 0) process.exit(1);
}

runTests();
