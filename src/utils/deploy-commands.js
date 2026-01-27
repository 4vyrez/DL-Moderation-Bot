const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });

const commands = [];
const commandsPath = path.join(__dirname, '../commands');

function readCommands(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            readCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            if ('data' in command && 'execute' in command) {
                commands.push(command.data.toJSON());
            } else {
                console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            }
        }
    }
}

readCommands(commandsPath);

const GUILD_IDS = [
    '1464322386458444083', // DiamondLife
    '1465002396257222868', // Police DiamondLife
    '825863658147545189'   // Medical DiamondLife
];

(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const rest = new REST().setToken(process.env.DISCORD_TOKEN);

        for (const guildId of GUILD_IDS) {
            try {
                console.log(`Registering commands for Guild ID: ${guildId}`);
                const data = await rest.put(
                    Routes.applicationGuildCommands(process.env.CLIENT_ID, guildId),
                    { body: commands },
                );
                console.log(`Successfully reloaded ${data.length} commands for guild ${guildId}.`);
            } catch (error) {
                console.error(`Failed to register commands for guild ${guildId}:`, error);
            }
        }

        console.log('All guild command registrations completed.');
    } catch (error) {
        console.error(error);
    }
})();
