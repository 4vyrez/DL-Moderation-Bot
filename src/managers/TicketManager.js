const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'tickets.json');

class TicketManager {
    constructor() {
        this.tickets = {};
        this.loadTickets();
    }

    loadTickets() {
        try {
            if (!fs.existsSync(DATA_DIR)) {
                fs.mkdirSync(DATA_DIR, { recursive: true });
            }
            if (!fs.existsSync(DATA_FILE)) {
                fs.writeFileSync(DATA_FILE, '{}', 'utf8');
            }
            const data = fs.readFileSync(DATA_FILE, 'utf8');
            this.tickets = JSON.parse(data);
        } catch (error) {
            console.error('Error loading tickets:', error);
            this.tickets = {};
        }
    }

    saveTickets() {
        try {
            fs.writeFileSync(DATA_FILE, JSON.stringify(this.tickets, null, 4), 'utf8');
        } catch (error) {
            console.error('Error saving tickets:', error);
        }
    }

    createTicketConfig(messageId, config) {
        this.tickets[messageId] = config;
        this.saveTickets();
    }

    getTicketConfig(messageId) {
        return this.tickets[messageId];
    }

    // Check if a channel is a ticket channel (optional, simplistic check via topic or name)
    // We could also store active tickets in another file if needed.
}

module.exports = new TicketManager();
