const fs = require('fs');
const path = require('path');
const https = require('https');
require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

const token = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;

const bot = new TelegramBot(token, { polling: true });
const ITEMS_FILE = path.join(__dirname, 'items.json');
const COOKIES_FILE = path.join(__dirname, 'cookies.json');

function getItems() {
  if (!fs.existsSync(ITEMS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(ITEMS_FILE, 'utf8'));
  } catch (e) { return []; }
}

function saveItems(items) {
  fs.writeFileSync(ITEMS_FILE, JSON.stringify(items, null, 2));
}

function getFinalUrl(url) {
  return new Promise((resolve) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        resolve(res.headers.location);
      } else {
        resolve(url);
      }
    }).on('error', () => resolve(url));
  });
}

async function getPriceElite(shopeeUrl, targetPrice) {
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 1000 });
    
    if (fs.existsSync(COOKIES_FILE)) {
      const cookies = JSON.parse(fs.readFileSync(COOKIES_FILE, 'utf8'));
      await page.setCookie(...cookies);
    }

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`🚀 Đang quét: ${shopeeUrl}`);
    await page.goto(shopeeUrl, { waitUntil: 'networkidle2', timeout: 60000 });
    await new Promise(r => setTimeout(r, 5000));

    let price = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      let candidates = [];
      elements.forEach(el => {
        const text = (el.innerText || '').trim();
        if (text.includes('₫') && text.length < 25 && /\d/.test(text)) {
           const style = window.getComputedStyle(el);
           const size = parseFloat(style.fontSize);
           const val = parseInt(text.replace(/\D/g, ''));
           if (val > 100000) candidates.push({ val, size, top: el.getBoundingClientRect().top });
        }
      });
      if (candidates.length === 0) return null;
      candidates.sort((a, b) => b.size - a.size);
      return candidates[0].val;
    });

    if (!price || price < 100000) {
      console.log("⚠️ Shopee chặn hoặc không tìm thấy giá. Chuyển sang Mua Thông Minh...");
      
      // Giải mã redirect nếu là link rút gọn
      let resolvedUrl = shopeeUrl;
      if (shopeeUrl.includes('s.shopee.vn')) {
        resolvedUrl = await getFinalUrl(shopeeUrl);
        console.log(`🔗 Link đã giải mã: ${resolvedUrl}`);
      }

      const urlsToTry = [resolvedUrl, page.url()];
      let itemId = "";
      let shopId = "";
      
      for (let url of urlsToTry) {
        if (!url || url.includes('verify/traffic')) continue;
        const match1 = url.match(/product\/(\d+)\/(\d+)/);
        if (match1) { shopId = match1[1]; itemId = match1[2]; break; }
        const match2 = url.match(/i\.(\d+)\.(\d+)/);
        if (match2) { shopId = match2[1]; itemId = match2[2]; break; }
        const parts = url.split('/');
        const last = parts[parts.length - 1].split('?')[0];
        const secondLast = parts[parts.length - 2];
        if (/^\d+$/.test(last) && /^\d+$/.test(secondLast)) { shopId = secondLast; itemId = last; break; }
      }

      if (!itemId || !shopId) {
        console.log("❌ Không thể trích xuất ID sản phẩm.");
        return null;
      }

      const mtmUrl = `https://muathongminh.vn/product-p.1__${itemId}__${shopId}`;
      console.log(`🛠️ Đang quét qua: ${mtmUrl}`);
      
      await page.goto(mtmUrl, { waitUntil: 'domcontentloaded' });
      await new Promise(r => setTimeout(r, 8000));
      
      price = await page.evaluate(() => {
        const els = Array.from(document.querySelectorAll('*')).filter(el => el.getBoundingClientRect().top < 800);
        let found = [];
        els.forEach(el => {
          const t = el.innerText || '';
          if (t.includes('₫') && /\d/.test(t)) {
             const s = window.getComputedStyle(el);
             const v = parseInt(t.replace(/\D/g, ''));
             if (v > 100000) found.push({ v, size: parseFloat(s.fontSize) });
          }
        });
        if (found.length === 0) return null;
        found.sort((a, b) => b.size - a.size);
        return found[0].v;
      });
    }

    return price;
  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
    return null;
  } finally {
    await browser.close();
  }
}

async function runHunter() {
  const items = getItems();
  console.log(`\n--- CHIẾN DỊCH SĂN GIÁ ELITE (${new Date().toLocaleString()}) ---`);
  for (let item of items) {
    const currentPrice = await getPriceElite(item.url, item.targetPrice);
    if (currentPrice) {
      console.log(`[${item.name}] Giá hiện tại: ${currentPrice.toLocaleString()}đ`);
      if (currentPrice <= item.targetPrice) {
        let message = `🎯 PHÁT HIỆN GIÁ HỜI!\n\n📦 ${item.name}\n💰 Giá hiện tại: ${currentPrice.toLocaleString()}đ\n🎯 Mục tiêu: ${item.targetPrice.toLocaleString()}đ\n\n👉 Link: ${item.url}`;
        bot.sendMessage(chatId, message);
      }
      item.lastPrice = currentPrice;
      item.lastCheck = new Date().toISOString();
    }
  }
  saveItems(items);
}

if (require.main === module) {
  runHunter();
  setInterval(runHunter, 3600000); 
}
