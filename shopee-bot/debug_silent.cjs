const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

puppeteer.use(StealthPlugin());

async function debugShopeePriceSilent(url) {
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1920,1080']
  });
  
  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1920, height: 1080 });
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    
    console.log(`Đang quét trực tiếp Shopee: ${url}`);
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
    
    await new Promise(r => setTimeout(r, 10000));

    const info = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'));
      let prices = [];
      elements.forEach(el => {
        const text = el.innerText || '';
        if (text.includes('₫') && text.length < 30 && /\d/.test(text)) {
          const style = window.getComputedStyle(el);
          const fontSize = parseFloat(style.fontSize);
          const color = style.color;
          const isVisible = el.offsetWidth > 0 && el.offsetHeight > 0;
          
          if (isVisible && fontSize > 10) {
            prices.push({
              val: parseInt(text.replace(/\D/g, '')),
              size: fontSize,
              text: text.trim(),
              color: color
            });
          }
        }
      });
      // Sắp xếp theo cỡ chữ giảm dần
      prices.sort((a, b) => b.size - a.size);
      return prices.slice(0, 10);
    });

    console.log('\n--- KẾT QUẢ QUÉT GIÁ THỰC TẾ ---');
    info.forEach((p, i) => {
      console.log(`${i+1}. Nội dung: "${p.text}" | Cỡ chữ: ${p.size}px | Giá: ${p.val.toLocaleString()}đ`);
    });

  } catch (error) {
    console.error(`Lỗi: ${error.message}`);
  } finally {
    await browser.close();
  }
}

debugShopeePriceSilent('https://shopee.vn/product/1291239413/50054889745');
