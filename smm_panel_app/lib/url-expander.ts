// URL Expander using Playwright - uses real browser to expand URLs

let browser: any = null
let playwright: any = null

async function getBrowser() {
  if (!playwright) {
    playwright = require('playwright-core')
  }
  if (!browser) {
    browser = await playwright.chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    })
  }
  return browser
}

export async function expandUrl(url: string): Promise<string | null> {
  try {
    const browser = await getBrowser()
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    })
    const page = await context.newPage()
    
    // Navigate and wait for network idle
    await page.goto(url, { 
      waitUntil: 'networkidle',
      timeout: 15000 
    })
    
    // Get final URL after all redirects
    const finalUrl = page.url()
    
    await context.close()
    
    if (finalUrl && finalUrl !== url) {
      return finalUrl
    }
    
    return null
  } catch (error) {
    console.error('Error expanding URL:', error)
    return null
  }
}

export async function closeBrowser() {
  if (browser) {
    await browser.close()
    browser = null
  }
}
