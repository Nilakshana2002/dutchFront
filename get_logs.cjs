const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.type(), msg.text()));
    page.on('pageerror', err => console.log('BROWSER ERROR:', err.message));
    
    // Catch uncaught exceptions
    page.on('error', err => console.log('PAGE ERROR EVENT:', err.message));
    
    try {
        await page.goto('http://localhost:5174/', { waitUntil: 'networkidle0' });
    } catch (e) {
        console.log('NAVIGATION ERROR:', e.message);
    }
    
    await browser.close();
})();
