const puppeteer = require('puppeteer-core');

async function run() {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    headless: true,
  });

  const page = await browser.newPage();

  // Log all console output
  page.on('console', msg => {
    console.log(`[BROWSER LOG] [${msg.type()}]: ${msg.text()}`);
    for (let i = 0; i < msg.args().length; ++i) {
      console.log(`  arg ${i}: ${msg.args()[i]}`);
    }
  });

  page.on('pageerror', err => {
    console.log(`[BROWSER ERROR]: ${err.toString()}`);
  });

  console.log('Navigating to http://localhost:8081...');
  await page.goto('http://localhost:8081', { waitUntil: 'networkidle2' });

  console.log('Page loaded. Current URL:', page.url());

  // Wait a few seconds to let things compile/render
  await new Promise(r => setTimeout(r, 5000));

  // Let's attempt to log in automatically if we see the inputs
  const hasEmailInput = await page.evaluate(() => {
    const inputs = document.querySelectorAll('input');
    return inputs.length > 0;
  });

  console.log('Has inputs on page:', hasEmailInput);

  if (hasEmailInput) {
    console.log('Attempting sign in...');
    await page.evaluate(() => {
      // Find text inputs
      const inputs = Array.from(document.querySelectorAll('input'));
      // We can search for the ones that look like email and password, or by order
      const emailInput = inputs.find(i => i.placeholder && i.placeholder.includes('@')) || inputs[0];
      const passwordInput = inputs.find(i => i.type === 'password' || (i.placeholder && i.placeholder.includes('•'))) || inputs[1];

      if (emailInput && passwordInput) {
        // We will fill manager@dormdesk.com or student@nst.edu. Let's use manager@dormdesk.com.
        // Or wait, is there an account created? In the web app we had manager@dormdesk.com with a password like "password" or similar.
        // Let's see what credentials are valid in web app or check profiles.
        // But wait! We can just fill "student@nst.edu" / "password" or "manager@dormdesk.com" / "password".
        emailInput.value = 'student@nst.edu';
        emailInput.dispatchEvent(new Event('input', { bubbles: true }));
        
        passwordInput.value = 'password';
        passwordInput.dispatchEvent(new Event('input', { bubbles: true }));
      }
    });

    // Wait a bit
    await new Promise(r => setTimeout(r, 500));

    // Find the button to click
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('div, button, a')).filter(el => {
        const text = el.textContent || '';
        return text.toLowerCase().includes('sign in') || text.toLowerCase().includes('log in');
      });
      // Click the deepest/smallest element containing sign in
      if (buttons.length > 0) {
        // Sort by length of text ascending to get the button itself rather than the container
        buttons.sort((a, b) => (a.textContent || '').length - (b.textContent || '').length);
        buttons[0].click();
      }
    });

    console.log('Sign in clicked, waiting for routing...');
    await new Promise(r => setTimeout(r, 8000));
    console.log('Final page state check...');
  }

  await browser.close();
  console.log('Browser closed.');
}

run().catch(err => {
  console.error('Error running test script:', err);
});
