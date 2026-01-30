const { Collection } = require('discord.js');

class MockInteraction {
    constructor({ commandName, options = {}, user, guild }) {
        this.commandName = commandName;
        this.client = {
            ws: { ping: 42 },
            user: {
                username: 'DiamondLifeBot',
                id: 'bot-id',
                displayAvatarURL: () => 'https://example.com/bot-avatar.png'
            },
            guilds: { cache: new Collection() }
        };
        this.options = {
            data: options,
            getString: (key) => options[key] || null,
            getInteger: (key) => options[key] || null,
            getBoolean: (key) => options[key] || null,
            getUser: (key) => options[key] || null,
            getMember: (key) => options[key] || null,
            getRole: (key) => options[key] || null,
            getChannel: (key) => options[key] || null
        };
        this.user = user || {
            id: 'mock-user-id',
            tag: 'MockUser#0000',
            username: 'MockUser',
            bot: false,
            displayAvatarURL: () => 'https://example.com/user-avatar.png'
        };
        this.guild = guild || {
            id: 'mock-guild-id',
            name: 'Mock Guild',
            members: {
                cache: new Collection(),
                fetch: async () => this.member
            },
            roles: {
                cache: new Collection()
            }
        };
        this.member = {
            id: this.user.id,
            user: this.user,
            roles: {
                cache: new Collection(),
                add: async () => { },
                remove: async () => { }
            },
            permissions: {
                has: () => true // Admin by default for tests
            },
            setNickname: async () => { },
            guild: null // Will be set below
        };
        this.member.guild = this.guild;

        this.replied = false;
        this.deferred = false;
        this.responses = [];
    }

    async reply(content) {
        this.replied = true;
        this.responses.push({ type: 'reply', content });
        // console.log(`[MockInteraction] Reply:`, content);
    }

    async deferReply(options) {
        this.deferred = true;
        this.responses.push({ type: 'defer', options });
    }

    async editReply(content) {
        this.responses.push({ type: 'editReply', content });
    }

    async followUp(content) {
        this.responses.push({ type: 'followUp', content });
    }
}

module.exports = { MockInteraction };
