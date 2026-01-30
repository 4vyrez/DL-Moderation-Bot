const { REST, Routes } = require('discord.js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env') });
const { loadCommands } = require('./commandLoader');

// Validate Environment Variables
if (!process.env.DISCORD_TOKEN) {
    console.error('[ERROR] DISCORD_TOKEN is missing in .env file.');
    process.exit(1);
}
if (!process.env.CLIENT_ID) {
    console.error('[ERROR] CLIENT_ID is missing in .env file.');
    process.exit(1);
}

const commandsPath = path.join(__dirname, '../commands');
const loaded = loadCommands(commandsPath);
const commands = loaded.map(c => c.command.data.toJSON());

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
                console.error(`[ERROR] Failed to register commands for guild ${guildId}. Warning: Make sure the bot is in this guild.`);
                console.error(`Details: ${error.message}`);
                // Don't stop the loop, try other guilds
            }
        }

        console.log('All guild command registrations completed.');
    } catch (error) {
        console.error('[FATAL ERROR] Deployment failed:', error);
    }
})();
