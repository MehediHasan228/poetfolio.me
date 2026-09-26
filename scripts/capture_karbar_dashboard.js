const puppeteer = require('puppeteer');
const sharp = require('sharp');
const path = require('path');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({
        headless: 'new',
        executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1600,1050']
    });

    try {
        const page = await browser.newPage();
        await page.setViewport({ width: 1500, height: 950, deviceScaleFactor: 2 });

        const loginUrl = 'https://novels-glow-nights-sierra.trycloudflare.com/admin/login';
        console.log('Navigating to', loginUrl);
        await page.goto(loginUrl, { waitUntil: 'networkidle2', timeout: 30000 });

        // Fill credentials
        console.log('Filling login form...');
        await page.type('input[type="email"]', 'admin@karbar.demo');
        await page.type('input[type="password"]', 'agIosEFTOsIhheHrFw3G');

        console.log('Submitting login form...');
        await Promise.all([
            page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 }),
            page.keyboard.press('Enter')
        ]);

        console.log('Logged in! Current URL:', page.url());

        // Wait a few seconds
        await new Promise(r => setTimeout(r, 2000));

        // Inject Hind Siliguri font
        console.log('Injecting Bangla font...');
        await page.addStyleTag({
            url: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&display=swap'
        });
        await page.addStyleTag({
            content: `
                body, p, span, div, a, h1, h2, h3, h4, h5, h6, table, tr, th, td, input, button, select, label {
                    font-family: 'Hind Siliguri', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
                }
                /* ensure icons and monospace tags are not broken */
                i, svg, [class*="fa-"], code, pre, .mono {
                    font-family: inherit !important;
                }
            `
        });

        // Toggle dark mode for that premium sleek feel
        console.log('Enabling dark mode...');
        await page.evaluate(() => {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
            // Check if there is a dark mode button to click
            const moonBtn = Array.from(document.querySelectorAll('button')).find(b => 
                b.innerHTML.includes('moon') || 
                b.getAttribute('aria-label')?.toLowerCase().includes('dark') ||
                b.getAttribute('title')?.toLowerCase().includes('dark')
            );
            if (moonBtn) moonBtn.click();
        });

        await page.evaluate(() => document.fonts.ready);
        await new Promise(r => setTimeout(r, 2000));

        const rawScreenshot = path.join(__dirname, '../docs/karbar_dashboard_raw.png');
        await page.screenshot({ path: rawScreenshot });
        console.log('Raw screenshot saved to', rawScreenshot);

        // Convert to webp with sharp
        const webpPath = path.join(__dirname, '../docs/karbar_erp_preview.webp');
        const pngPath = path.join(__dirname, '../docs/karbar_erp_preview.png');

        await sharp(rawScreenshot)
            .resize({ width: 1280, height: 800, fit: 'cover', position: 'top' })
            .webp({ quality: 90 })
            .toFile(webpPath);
        console.log('Optimized webp saved to', webpPath);

        await sharp(rawScreenshot)
            .resize({ width: 1280, height: 800, fit: 'cover', position: 'top' })
            .png({ quality: 90 })
            .toFile(pngPath);
        console.log('Optimized png saved to', pngPath);

    } catch (err) {
        console.error('Error during capture:', err);
    } finally {
        await browser.close();
    }
})();
