const queueManager = require('../managers/QueueManager');

module.exports = {
    name: 'voiceStateUpdate',
    once: false, // Listen to every update
    async execute(oldState, newState) {
        // Target Channel ID: 1464468439501504706
        const SUPPORT_CHANNEL_ID = queueManager.supportChannelId;

        // Check if user JOINED the support channel
        // (newState.channelId === SUPPORT_CHANNEL_ID) AND (oldState.channelId !== SUPPORT_CHANNEL_ID)
        if (newState.channelId === SUPPORT_CHANNEL_ID && oldState.channelId !== SUPPORT_CHANNEL_ID) {
            console.log(`[SupportQueue] User ${newState.member.user.tag} joined the queue.`);
            await queueManager.handleJoin(newState.member);
        }

        // Check if user LEFT the support channel
        // (oldState.channelId === SUPPORT_CHANNEL_ID) AND (newState.channelId !== SUPPORT_CHANNEL_ID)
        if (oldState.channelId === SUPPORT_CHANNEL_ID && newState.channelId !== SUPPORT_CHANNEL_ID) {
            console.log(`[SupportQueue] User ${oldState.member.user.tag} left the queue.`);
            await queueManager.handleLeave(oldState.member);
        }
    },
};
