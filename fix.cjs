const fs = require('fs');
let p = 'D:/final_give/dutchFront/src/pages/luxuryRooms.jsx';
let c = fs.readFileSync(p, 'utf8');

const t1 = `                                                {!room.hasOffer && (
                                                    <span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">{formatPrice(room.price)}/-</span>
                                                    <div className="text-[10px] text-navy-400 mt-1">
                                                        * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                    </div>
                                                )}`;

const r1 = `                                                {!room.hasOffer && (
                                                    <div className="flex flex-col">
                                                        <span className="text-xl sm:text-2xl font-extrabold text-navy-900 italic">{formatPrice(room.price)}/-</span>
                                                        <div className="text-[10px] text-navy-400 mt-1">
                                                            * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                        </div>
                                                    </div>
                                                )}`;

const t2 = `                                                ) : (
                                                    <span className="text-2xl sm:text-3xl font-extrabold text-navy-900 italic">{formatPrice(selectedRoom.price)}/-</span>
                                                    <div className="text-[10px] text-navy-400 mt-1">
                                                        * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                    </div>
                                                )}`;

const r2 = `                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="text-2xl sm:text-3xl font-extrabold text-navy-900 italic">{formatPrice(selectedRoom.price)}/-</span>
                                                        <div className="text-[10px] text-navy-400 mt-1">
                                                            * Room only: Rs. 35,000 (1-2 guests) | Rs. 40,000 (3+ guests)
                                                        </div>
                                                    </div>
                                                )}`;

let c2 = c.replace(t1, r1);
if(c2 === c) {
    // fallback with normalized line endings
    c = c.replace(/\\r\\n/g, '\\n');
    let nt1 = t1.replace(/\\r\\n/g, '\\n');
    let nr1 = r1.replace(/\\r\\n/g, '\\n');
    let nt2 = t2.replace(/\\r\\n/g, '\\n');
    let nr2 = r2.replace(/\\r\\n/g, '\\n');
    c = c.replace(nt1, nr1).replace(nt2, nr2);
} else {
    c = c2.replace(t2, r2);
}

fs.writeFileSync(p, c, 'utf8');
console.log('Fixed syntax issues.');
