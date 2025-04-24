import { parseArgs } from 'node:util';
import { startHttpServer } from './transports/http.js';
import { startStdioServer } from './transports/stdio.js';

async function main() {
 // Parse command line arguments
  const { values } = parseArgs({
    options: {
      transport: {
        type: 'string',
        short: 't',
        default: 'stdio'
      },
      port: {
        type: 'string',
        short: 'p',
        default: '3000'
      }
    }
  });

  // Start server with appropriate transport
  const transport = values.transport;
  if (transport === 'stdio') {
    await startStdioServer();
  } else if (transport === 'http') {
    const port = parseInt(values.port);
    await startHttpServer(port);
    console.info(`HTTP server started on port ${port}`);
  } else {
    console.error(`Unknown transport: ${transport}`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Error starting server:', err);
  process.exit(1);
});