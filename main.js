"use strict";

// const puppeteer = require('puppeteer');
const Capi = require("qcloudapi-sdk");
const axios = require("axios").default;
const Config = require("./config");

const log4js = require('log4js');
log4js.configure("log4js.json");
const logger = log4js.getLogger();

var offlineIP = "0.0.0.0";
logger.info("System Start with offline IP: " + offlineIP);

var fnCheck = async () => {
    logger.trace("Start Check!");

    // // Get IP Info From Router via Browser Simulate by puppeteer
    // const browser = await puppeteer.launch();
    // const page = await browser.newPage();
    // await page.goto('http://192.168.1.1/login.cgi?username=telecomadmin&psd=UGMMNFn970');
    // await page.goto('http://192.168.1.1/wanInfoGet.json');
    // var content = await page.content();
    // await browser.close();
    //
    // // Find IP Info From Response
    // content = JSON.parse(content.replace(/<.*?>/g, ""));
    // content = content.wanInfo.wanPppConn.find(x => {
    //     return x.Name.indexOf("INTERNET") >= 0
    // });
    // var newIP = content.ExternalIPAddress
    // logger.info("External IP from Router: " + newIP);

    // Get IP Info From IP.cn
    var oResponse = await axios.get("https://ip.cn");
    var newIP = oResponse.data.match(/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/)[0];
    logger.trace("External IP from ip.cn: " + newIP);

    if (newIP !== offlineIP) {
        logger.info(`Current IP ${newIP} doesn't equal to offline IP ${offlineIP}. Need remote check.`);
        offlineIP = newIP;

        // Prepare Capi
        var oCapi = new Capi({
            serviceType: "cns",
            SecretId: Config.SecretId,
            SecretKey: Config.SecretKey
        });

        // Get Current Records
        oCapi.request(
            {
                Region: "gz",
                Action: "RecordList",
                domain: Config.Domain,
                recordType: "A"
            },
            function (error, data) {
                if (data && data.data && data.data.records) {
                    var currentRecord = data.data.records.find(x => { return x.name === "@"; });
                    var onlineIP = currentRecord.value;
                    logger.debug("Online IP from Tencent: " + onlineIP);

                    // If IP is different
                    if (newIP !== onlineIP) {
                        logger.info(`Current IP ${newIP} doesn't equal to online IP ${onlineIP}. Routing config needs to be changed.`);
                        data.data.records.forEach(x => {

                            // Change record with old IP
                            if (x.value === onlineIP) {
                                logger.trace("Change record for " + x.name);
                                oCapi.request({
                                    Region: "gz",
                                    Action: "RecordModify",
                                    domain: Config.Domain,
                                    recordId: x.id,
                                    subDomain: x.name,
                                    recordType: x.type,
                                    recordLine: x.line,
                                    value: newIP
                                },
                                    function (error, res) {
                                        if (res.code === 0) {
                                            logger.trace("IP of record for " + res.data.record.name + " is changed to " + res.data.record.value);
                                        } else {
                                            logger.error("Error when changing record for " + x.name + ": " + res.message)
                                        }
                                    }
                                );
                            }
                        });
                    } else {
                        logger.trace(`Current IP ${newIP} equals to online IP ${onlineIP}. No action to do.`);
                    }
                }else{
                    logger.error(error);
                }
            }
        );
    } else {
        logger.trace(`Current IP ${newIP} equals to offline IP ${offlineIP}. No action to do.`);
    }
}

setInterval(fnCheck, 60 * 1000);