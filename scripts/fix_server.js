import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, '../server/index.js');
let content = fs.readFileSync(filePath, 'utf8');

// Specific Regex for the orphaned tail
// Matches:
// } finally {
//     client.release();
// }
// });
// That appears between other functions.

const orphanTailRegex = /\}\s*finally\s*\{\s*client\.release\(\);\s*\}\s*\}\);\s*(?=app\.put\('\/api\/orders\/:id',)/;

let newContent = content;

if (orphanTailRegex.test(newContent)) {
    newContent = newContent.replace(orphanTailRegex, '');
    console.log("Removed orphaned tail.");
} else {
    console.log("Orphaned tail not found.");
}

fs.writeFileSync(filePath, newContent);
console.log("File updated.");
