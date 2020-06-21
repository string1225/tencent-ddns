"use strict";

// const puppeteer = require('puppeteer');

// // Get IP Info From Router via Browser Simulate by puppeteer
// const browser = await puppeteer.launch();
// const page = await browser.newPage();
// await page.goto('http://192.168.1.1/login.cgi?username=telecomadmin&psd=UGMMNFn970');
// await page.goto('http://192.168.1.1/wanInfoGet.json');
// var content = await page.content();
// await browser.close();

// // Find IP Info From Response
// content = JSON.parse(content.replace(/<.*?>/g, ""));
// content = content.wanInfo.wanPppConn.find(x => {
//     return x.Name.indexOf("INTERNET") >= 0
// });
// var newIP = content.ExternalIPAddress
// logger.info("External IP from Router: " + newIP);