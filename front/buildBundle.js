const fs = require('fs');
const path = require('path');
const baseDirs = ['./front/logic', './front/view'];
const bundlePath = path.join('./', 'bundle.js');

fs.writeFileSync(bundlePath, '', 'utf-8');

function bundleFiles(dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            bundleFiles(filePath);
        } else if (path.extname(file) === '.js' && file !== 'bundle.js' && file !== 'buildBundle.js') {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            fs.appendFileSync(bundlePath, `// Contents of ${filePath}\n${fileContent}\n\n`, 'utf-8');
            console.log(`Appended ${filePath} to bundle.js`);
        }
    });
}
baseDirs.forEach(bundleFiles);
console.log('All files have been bundled into bundle.js');