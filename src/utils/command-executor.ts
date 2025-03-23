import { exec } from 'child_process';
import util from 'util';

const execPromise = util.promisify(exec);

// Execute a command and return stdout
export async function executeCommand(command: string, cwd: string): Promise<any> {
    return new Promise((resolve, reject) => {
        exec(command, { cwd }, (error, stdout, stderr) => {
            if (error) {
                reject(error);
            }
            resolve({ stdout, stderr });
        });
    });
}