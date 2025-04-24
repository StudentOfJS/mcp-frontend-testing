import express from 'express';
import cors from 'cors';
import { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js';
import { createServer } from '../server.js';
// Map to store active transports
const transports = new Map();
export async function startHttpServer(port) {
    const app = express();
    app.use(cors());
    app.use(express.json());
    // Health check endpoint
    app.get('/health', (req, res) => {
        res.json({ status: 'ok' });
    });
    // SSE endpoint
    app.get('/sse/:sessionId', async (req, res) => {
        const { sessionId } = req.params;
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        // Create server and transport
        const server = createServer();
        const transport = new SSEServerTransport('/messages', res);
        transports.set(sessionId, transport);
        // Connect the transport to the server
        await server.connect(transport);
        // Remove transport when connection closes
        req.on('close', () => {
            transports.delete(sessionId);
        });
    });
    // Message endpoint
    app.post('/messages/:sessionId', async (req, res) => {
        const { sessionId } = req.params;
        const transport = transports.get(sessionId);
        if (!transport) {
            res.status(404).json({ error: 'Session not found' });
            return;
        }
        await transport.handlePostMessage(req, res);
    });
    // Start server
    return new Promise((resolve) => {
        app.listen(port, () => {
            resolve();
        });
    });
}
//# sourceMappingURL=http.js.map