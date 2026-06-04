// Script to remove all prices except for muzqaymoq
const fs = require('fs');

const filePath = 'public/index.js';
let content = fs.readFileSync(filePath, 'utf8');

// First, replace all price fields with empty string
// Pattern for price: "number,000 so'm" (with possible spaces)
content = content.replace(/price:\s*"\d{1,3}(?:,\d{3})*\s*so'm"/g, 'price: ""');
// Pattern for price: number, (in sizes objects)
content = content.replace(/price:\s*\d+/g, 'price: ""');

// Now, we need to restore the muzqaymoq price
// Find the muzqaymoq object and set its price back to "5,000 so'm"
// We'll do a more targeted replacement: look for the line containing muzqaymoq and ensure its price is correct.
// Since we just replaced all prices, we need to set this specific one back.
// We'll replace the price field in the muzqaymoq object.
// We can do: find the substring '"title": "Muzqaymoq"' then after that find the price field and replace it.
// Simpler: replace the specific line we know.
// Let's read the file again to see the exact line? We'll do a regex that matches the muzqaymoq object and replaces its price.
// We'll use a regex that matches from the muzqaymoq title to the next closing brace of that object? Too complex.
// Instead, we can do: after the replacement, we know the muzqaymoq price is now empty string, so we can set it back by looking for the pattern around muzqaymoq.
// We'll do: replace 'price: ""' that is preceded by 'title: "Muzqaymoq"' within a certain distance.
// We'll use a lookbehind if supported, but we can do two steps: find the index of muzqaymoq, then find the next price: "" after that and replace it.
// We'll do it with a simple approach: split by lines and process.
const lines = content.split('\n');
let inMuzqaymoq = false;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('"title": "Muzqaymoq"')) {
    inMuzqaymoq = true;
  }
  if (inMuzqaymoq && line.trim().startsWith('price:')) {
    // This is the price line for muzqaymoq
    lines[i] = '                price: "5,000 so\'m",';
    inMuzqaymoq = false; // reset after fixing
    break;
  }
}
content = lines.join('\n');

// Write back
fs.writeFileSync(filePath, content);
console.log('Prices removed except for muzqaymoq');