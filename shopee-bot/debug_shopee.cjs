const fs = require('fs');
const path = require('path');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });
const ITEMS_FILE = path.join(__dirname, 'items.json');

async function debugShopeePrice(url) {
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`Đang trinh sát: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    await new Promise(r => setTimeout(r, 10000));

    // Chụp ảnh để debug
    const screenshotPath = path.join(__dirname, 'debug_shopee.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    console.log(`Đã chụp ảnh màn hình: ${screenshotPath}`);

    const info = await page.evaluate(() => {
      // Tìm con số to nhất có ₫
      const elements = Array.from(document.querySelectorAll('*'));
      let prices = [];
      elements.forEach(el => {
        const text = el.innerText || '';
        if (text.includes('₫') && text.length < 20 && /\d/.test(text)) {
          const style = window.getComputedStyle(el);
          prices.push({
            val: parseInt(text.replace(/\D/g, '')),
            size: parseFloat(style.fontSize),
            text: text
          });
        }
      });
      // Sắp xếp theo cỡ chữ giảm dần
      prices.sort((a, b) => b.size - a.size);
      return prices.slice(0, 5);
    });

    console.log('Top 5 con số nổi bật nhất tìm được:');
    info.forEach((p, i) => console.log(`${i+1}. ${p.text} (Size: ${p.size}px) -> Giá: ${p.val}`));

    return info.length > 0 ? info[0].val : null;

  } catch (error) {
    console.error(`Lỗi trinh sát: ${error.message}`);
    return null;
  } finally {
    await browser.close();
  }
}

if (require.main === module) {
  debugShopeePrice('https://shopee.vn/product/1291239413/50054889745');
}
