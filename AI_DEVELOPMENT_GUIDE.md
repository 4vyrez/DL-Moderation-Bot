# Diamond Life Moderation Bot - Developer & AI Guide

This guide describes the architecture and development standards for the Diamond Life Moderation Bot. It is intended for AI assistants and developers to ensure consistency.

## 🚨 CORE RULE: SLASH COMMANDS ONLY
**All new commands MUST be implemented as Discord Slash Commands (Application Commands).**
Do NOT create legacy prefix-based commands (e.g., `!ping`).

## 🔐 Privilege Roles
The following roles have elevated permissions for sensitive commands (like `/embed`):
- **DiamondLife RP**: `1464461234119376960`
- **Medical Discord RP**: `825864546899198022`
- **Police Discord RP**: `1465303406360006759`

Ensure any administrative or moderation commands check for these roles where applicable.

## 📂 Project Structure
- `src/index.js`: Main entry point. Initializes the client, loads commands/events, and logs in.
- `src/commands/`: Directory for all command files. Supports subdirectories for categorization.
- `src/events/`: Event handlers (e.g., `ready`, `interactionCreate`).
- `src/utils/deploy-commands.js`: Script to register slash commands with the Discord API.

## 🛠 Command Creation Workflow

To create a new command, follow these steps:

1.  **Create a File**: Create a new `.js` file in `src/commands/` (or a subdirectory like `src/commands/moderation/`).
2.  **Use the Template**: Copy the standard boilerplate below.
3.  **Deploy**: After creating the file, you **MUST** run the deployment script to update Discord's cache.
    ```bash
    npm run deploy
    ```

### ✅ Standard Command Template
Use `SlashCommandBuilder` from `discord.js`.

```javascript
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('commandname') // Must be lowercase
        .setDescription('Description of what the command does'),
    async execute(interaction) {
        // Always handle the interaction
        await interaction.reply('Command executed!');
    },
};
```

## 🚀 Deployment
Commands are **not** registered automatically by `src/index.js`.
`src/index.js` only *loads* them into the bot's memory for execution.

**To register new commands with Discord over the API:**
Run the following terminal command:
```bash
npm run deploy
```
*This script recursively checks `src/commands` and pushes updates to the bot application.*

## 📦 Dependencies
- **discord.js**: v14+ (Uses modern `Interaction` based patterns).
- **dotenv**: For environment variables.

## 📝 Tone & Style
- **Language**: English (code/comments), German (user-facing messages if requested).
- **Style**: Clean, modular code. Use `async/await`.
