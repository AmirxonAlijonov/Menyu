// Script to restore prices in public/index.js from index.js
const fs = require('fs');

const publicFilePath = 'public/index.js';
const rootFilePath = 'index.js';

const publicContent = fs.readFileSync(publicFilePath, 'utf8');
const rootContent = fs.readFileSync(rootFilePath, 'utf8');

// Extract foodData from both files
const publicMatch = publicContent.match(/const foodData = \{[\s\S]*?\};/);
const rootMatch = rootContent.match(/const foodData = \{[\s\S]*?\};/);

if (!publicMatch || !rootMatch) {
    console.error('Could not find foodData in one of the files');
    process.exit(1);
}

const publicFoodData = publicMatch[0];
const rootFoodData = rootMatch[0];

// Replace foodData in public/index.js with the one from index.js
const newPublicContent = publicContent.replace(publicFoodData, rootFoodData);

fs.writeFileSync(publicFilePath, newPublicContent);
console.log('Prices restored in public/index.js from index.js');
