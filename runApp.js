const { exec } = require('child_process');
const path = require('path');

const buildBundlePath = path.resolve(__dirname, './front', 'buildBundle.js');
const backendServerPath = path.resolve(__dirname, './back', 'backend.js');

exec(`node ${buildBundlePath}`, (err, stdout, stderr) => {
    if (err) {
        console.error(`Error executing buildBundle.js: ${err.message}`);
        return;
    }

    console.log(`Output of buildBundle.js:\n${stdout}`);
    if (stderr) console.error(`Errors from buildBundle.js:\n${stderr}`);

    const backendProcess = exec(`node ${backendServerPath}`);

    backendProcess.stdout.on('data', (data) => {
        console.log(`Backend: ${data}`);
    });

    backendProcess.stderr.on('data', (data) => {
        console.error(`Backend Error: ${data}`);
    });

    backendProcess.on('close', (code) => {
        console.log(`Backend process exited with code ${code}`);
    });
});