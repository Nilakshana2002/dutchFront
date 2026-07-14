const fs = require('fs');
let p = 'D:/final_give/dutchFront/src/pages/luxuryRooms.jsx';
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
    /\{\!room\.hasOffer && \(\s*<span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">\{formatPrice\(room\.price\)\}\/-\s*<\/span>\s*<div className="text-\[10px\] text-navy-400 mt-1">\s*\* Room only: Rs\. 35,000 \(1-2 guests\) \| Rs\. 40,000 \(3\+ guests\)\s*<\/div>\s*\)\}/g,
    `{!room.hasOffer && (
    <div className="flex flex-col">
        <span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">{formatPrice(room.price)}/-</span>
        <div className="text-[10px] text-navy-400 mt-1">
            * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
        </div>
    </div>
)}`
);

fs.writeFileSync(p, c, 'utf8');
console.log('Regex replace complete');
