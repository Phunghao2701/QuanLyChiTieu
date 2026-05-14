const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function debugShopeeText(url) {
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`Đang đọc nội dung Shopee: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    await new Promise(r => setTimeout(r, 15000));

    const content = await page.evaluate(() => document.body.innerText);
    console.log('\n--- 1000 KÝ TỰ ĐẦU TIÊN CỦA TRANG ---');
    console.log(content.substring(0, 1000));

    const prices = content.match(/([0-9.]+)\s?₫/g);
    console.log('\n--- CÁC CON SỐ GIÁ TIỀN TÌM THẤY ---');
    console.log(prices ? prices.slice(0, 20).join(', ') : 'Không tìm thấy con số nào!');

  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
  } finally {
    await browser.close();
  }
}

debugShopeeText('https://shopee.vn/product/1291239413/50054889745');
