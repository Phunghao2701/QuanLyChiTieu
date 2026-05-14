const https = require('https');

function getRedirectUrl(url) {
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

const testUrl = "https://s.shopee.vn/7pq56TPw6T";
getRedirectUrl(testUrl).then(u => {
    console.log("Redirected to:", u);
});
