import fs from 'fs';
const path = 'src/pages/Calculator.tsx';

try {
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split(/\r?\n/);

    // Normalized check
    const line1110 = lines[1109] ? lines[1109].trim() : "UNDEFINED";
    const expected = '<div className="mb-6 space-y-3">';

    console.log('Line 1110 (Index 1109):', JSON.stringify(line1110));

    if (line1110 !== expected) {
        console.error(`ERROR: Content mismatch at line 1110.`);
        console.log(`Expected: ${expected}`);
        console.log(`Found:    ${line1110}`);
        // Print context
        console.log('Context (1105-1115):');
        for (let i = 1104; i < 1115; i++) console.log(`${i + 1}: ${lines[i]}`);
        process.exit(1);
    }

    // Remove lines 1110 to 1266
    // Count: 1266 - 1110 + 1 = 157
    console.log('Deleting 157 lines starting at index 1109...');
    lines.splice(1109, 157);

    const newData = lines.join('\n');
    fs.writeFileSync(path, newData, 'utf8');
    console.log('Successfully removed duplicate lines.');

} catch (err) {
    console.error(err);
}
