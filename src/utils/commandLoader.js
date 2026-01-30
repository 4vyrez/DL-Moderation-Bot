const fs = require('fs');
const path = require('path');

/**
 * Recursively reads command files from a directory.
 * @param {string} dir - The directory to search.
 * @param {Array} collection - Array to push command data to (optional).
 * @param {Map} map - Map to set command objects to (optional).
 * @returns {Array<{path: string, command: object}>} - List of loaded commands.
 */
function loadCommands(dir) {
    const commands = [];
    const files = fs.readdirSync(dir);

    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            commands.push(...loadCommands(filePath));
        } else if (file.endsWith('.js')) {
            try {
                const command = require(filePath);
                if ('data' in command && 'execute' in command) {
                    commands.push({ path: filePath, command });
                } else {
                    console.warn(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            } catch (error) {
                console.error(`[ERROR] Failed to load command at ${filePath}:`, error);
            }
        }
    }
    return commands;
}

module.exports = { loadCommands };
