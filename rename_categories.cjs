const fs = require('fs');
const path = require('path');

const dir = 'D:/final_give/dutchFront/src';

// First, rename the files so we don't have conflicts
const oldDeluxe = path.join(dir, 'pages', 'deluxeRooms.jsx');
const newStandard = path.join(dir, 'pages', 'standardRooms.jsx');
if (fs.existsSync(oldDeluxe)) {
    fs.renameSync(oldDeluxe, newStandard);
    console.log('Renamed deluxeRooms.jsx to standardRooms.jsx');
}

const oldSemi = path.join(dir, 'pages', 'semiLuxuryRooms.jsx');
const newDeluxe = path.join(dir, 'pages', 'deluxeRooms.jsx');
if (fs.existsSync(oldSemi)) {
    fs.renameSync(oldSemi, newDeluxe);
    console.log('Renamed semiLuxuryRooms.jsx to deluxeRooms.jsx');
}

// Function to recursively find all .js and .jsx files
function getAllFiles(dirPath, arrayOfFiles) {
    const files = fs.readdirSync(dirPath);
    arrayOfFiles = arrayOfFiles || [];
    files.forEach(function(file) {
        if (fs.statSync(dirPath + "/" + file).isDirectory()) {
            arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
        } else {
            if (file.endsWith('.js') || file.endsWith('.jsx')) {
                arrayOfFiles.push(path.join(dirPath, "/", file));
            }
        }
    });
    return arrayOfFiles;
}

const allFiles = getAllFiles(dir);

allFiles.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;

    // STEP 1: Deluxe -> Standard
    content = content.replace(/deluxeRooms/g, 'standardRooms');
    content = content.replace(/DeluxeRooms/g, 'StandardRooms');
    content = content.replace(/Deluxe Rooms/g, 'Standard Rooms');
    content = content.replace(/Deluxe Room/g, 'Standard Room');
    content = content.replace(/'deluxe'/g, "'standard'");
    content = content.replace(/"deluxe"/g, '"standard"');
    content = content.replace(/Deluxe/g, 'Standard');
    content = content.replace(/deluxe/g, 'standard');

    // STEP 2: Semi-Luxury -> Deluxe
    content = content.replace(/semiLuxuryRooms/g, 'deluxeRooms');
    content = content.replace(/SemiLuxuryRooms/g, 'DeluxeRooms');
    content = content.replace(/Semi-Luxury Rooms/g, 'Deluxe Rooms');
    content = content.replace(/Semi-Luxury Room/g, 'Deluxe Room');
    content = content.replace(/Semi-Luxury/g, 'Deluxe');
    content = content.replace(/'semiluxury'/g, "'deluxe'");
    content = content.replace(/"semiluxury"/g, '"deluxe"');
    content = content.replace(/semiluxury/g, 'deluxe');
    content = content.replace(/semi luxury/ig, 'deluxe');

    if (content !== original) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated content in ${file}`);
    }
});

console.log('Frontend code migration complete.');
