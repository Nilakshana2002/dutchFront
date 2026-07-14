const fs = require('fs');
const path = require('path');

const targetRegex = /\{selectedRoom\.includes\?\.map\(\(item, i\) => \([\s\S]*?<li key=\{item\} className="flex items-start gap-2 text-sm text-navy-600 animate-fade-in" style=\{\{ animationDelay: `\$\{i \* 60\}ms` \}\}>[\s\S]*?<span className="text-[a-z]+-500 mt-0\.5 flex-shrink-0">✓<\/span>\{item\}[\s\S]*?<\/li>[\s\S]*?\)\)\}    /g;

function updateIncludes(file) {
    let content = fs.readFileSync(file, 'utf8');
    const parts = content.split('</ul>');
    if (parts.length > 1) {
        for (let i = 0; i < parts.length - 1; i++) {
            if (parts[i].includes('selectedRoom.includes?.map')) {
                const replacement = `
                                                {mealPlans.find(p => p.code === mealPlan)?.includes?.map((item, i) => (
                                                    <li key={\`mp-\${item}\`} className="flex items-start gap-2 text-sm text-navy-600 font-semibold animate-fade-in" style={{ animationDelay: \`\${(selectedRoom.includes?.length + i) * 60}ms\` }}>
                                                        <span className="text-amber-500 mt-0.5 flex-shrink-0">🍽</span>
                                                        {item}
                                                    </li>
                                                ))}
                                            `;
                
                if (!parts[i].includes('mealPlans.find(p => p.code === mealPlan)?.includes?.map')) {
                    parts[i] = parts[i] + replacement;
                }
            }
        }
        fs.writeFileSync(file, parts.join('</ul>'), 'utf8');
        console.log("Updated", file);
    }
}

updateIncludes(path.join(__dirname, 'src', 'pages', 'semiLuxuryRooms.jsx'));
updateIncludes(path.join(__dirname, 'src', 'pages', 'luxuryRooms.jsx'));
