import fs from 'fs';
const path = 'src/pages/Calculator.tsx';

try {
    const data = fs.readFileSync(path, 'utf8');
    const lines = data.split(/\r?\n/);

    // Index 1109 corresponds to Line 1110
    const index = 1109;
    const line = lines[index] ? lines[index].trim() : "UNDEFINED";
    const expectedDiv = '</div>';

    console.log(`Line ${index + 1} (Index ${index}):`, JSON.stringify(line));

    if (line !== expectedDiv) {
        console.error(`ERROR: Content mismatch. Expected '</div>', found '${line}'`);
        process.exit(1);
    }

    // Remove 1 line at index 1109
    lines.splice(index, 1);

    const newData = lines.join('\n');
    fs.writeFileSync(path, newData, 'utf8');
    console.log('Successfully removed 1 closing div.');

} catch (err) {
    console.error(err);
}
