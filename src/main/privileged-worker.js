const fs = require('fs');
const { execFile } = require('child_process');
const { promisify } = require('util');

const exec = promisify(execFile);

// Signal readiness
process.stdout.write(JSON.stringify({ type: 'ready' }) + '\n');

// Read configurations from stdin
let buffer = '';
process.stdin.setEncoding('utf-8');

process.stdin.on('data', async (chunk) => {
    buffer += chunk;
    const lines = buffer.split('\n');
    buffer = lines.pop() || ''; // keep the last partial line

    for (const line of lines) {
        if (!line.trim()) continue;

        try {
            const command = JSON.parse(line);
            await handleCommand(command);
        } catch (error) {
            respondError('Invalid JSON', error.message);
        }
    }
});

async function handleCommand(cmd) {
    const { id, action, payload } = cmd;

    try {
        let result = null;

        switch (action) {
            case 'setPowerProfile':
                await exec('system76-power', ['profile', payload.profile]);
                result = { success: true };
                break;

            case 'setGraphicsMode':
                await exec('system76-power', ['graphics', payload.mode]);
                result = { success: true, requiresReboot: true };
                break;

            case 'setConservationMode':
                const val = payload.enabled ? '1' : '0';
                const ideapadPath = '/sys/bus/platform/drivers/ideapad_acpi/VPC2004:00/conservation_mode';
                fs.writeFileSync(ideapadPath, val, 'utf-8');
                result = { success: true };
                break;

            default:
                throw new Error(`Unknown action: ${action}`);
        }

        respondSuccess(id, result);
    } catch (error) {
        respondError(id, error.message);
    }
}

function respondSuccess(id, data) {
    process.stdout.write(JSON.stringify({ id, success: true, data }) + '\n');
}

function respondError(id, error) {
    process.stdout.write(JSON.stringify({ id, success: false, error }) + '\n');
}

// Keep the process alive and handle graceful shutdown
process.on('SIGTERM', () => process.exit(0));
process.on('SIGINT', () => process.exit(0));
