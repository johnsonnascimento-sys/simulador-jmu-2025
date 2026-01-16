const fs = require('fs');
const path = 'src/pages/Calculator.tsx';

try {
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split(/\r?\n/);

    // Verification: Print the lines we are about to delete to be sure
    console.log('Line 1110 Content:', lines[1109]);
    console.log('Line 1266 Content:', lines[1265]);

    // Check if they match expectation
    if (!lines[1109].includes('className="mb-6 space-y-3"')) {
        console.error('ERROR: Line 1110 does not match expected content.');
        process.exit(1);
    }
    if (!lines[1265].trim() === '</div>') { // trimmed check
        console.log('Warning: Line 1266 is:', lines[1265]);
    }

    // Remove lines 1110 to 1266 (indexes 1109 to 1265)
    // splice(start, deleteCount)
    // deleteCount = 1265 - 1109 + 1 = 157
    lines.splice(1109, 157);

    const newData = lines.join('\n'); // normalization
    fs.writeFileSync(path, newData, 'utf8');
    console.log('Successfully removed duplicate lines.');

} catch (err) {
    console.error(err);
}
