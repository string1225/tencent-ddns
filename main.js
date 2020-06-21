"use strict";

const Capi = require("qcloudapi-sdk");
const axios = require("axios").default;
const log4js = require('log4js');

var Config = {
    SecretId: process.argv[2] || "DEFAULT_ID",
    SecretKey: process.argv[3] || "DEFAULT_KEY",
    Domain: process.argv[4] || "DEFAULT_DOMAIN",
    CheckInterval: process.argv[5] || 60,
    LogLevel: process.argv[6]
};

log4js.configure("log4js.json");
const logger = log4js.getLogger(Config.LogLevel === "trace" ? "trace" : "default");

logger.trace(JSON.stringify(Config));

if (Config.SecretId === "DEFAULT_ID") {
    logger.error("Please provide securet ID!");
    return;
} else if (Config.SecretId === "DEFAULT_KEY") {
    logger.error("Please provide securet key!");
    return;
} else if (Config.SecretId === "DEFAULT_DOMAIN") {
    logger.error("Please provide your domain!");
    return;
}

var offlineIP = "0.0.0.0";
logger.info("System Start with offline IP: " + offlineIP);

var fnMainCheck = async () => {
    logger.trace("Start Check!");

    // Get IP Info From IP.cn
    var oResponse = await axios.get("https://ip.cn");
    var newIP = oResponse.data.match(/((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})(\.((2(5[0-5]|[0-4]\d))|[0-1]?\d{1,2})){3}/)[0];
    logger.trace("External IP from ip.cn: " + newIP);

    if (newIP !== offlineIP) {
        logger.trace(`Current IP ${newIP} doesn't equal to offline IP ${offlineIP}. Need remote check.`);
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
                    logger.trace("Online IP from Tencent: " + onlineIP);

                    // If IP is different
                    if (newIP !== onlineIP) {
                        logger.info(`Current IP ${newIP} doesn't equal to online IP ${onlineIP}. Routing config needs to be changed.`);

                        // Change record with old IP
                        logger.trace("Change record for " + currentRecord.name);
                        oCapi.request({
                            Region: "gz",
                            Action: "RecordModify",
                            domain: Config.Domain,
                            recordId: currentRecord.id,
                            subDomain: currentRecord.name,
                            recordType: currentRecord.type,
                            recordLine: currentRecord.line,
                            value: newIP
                        },
                            function (error, res) {
                                if (res.code === 0) {
                                    logger.info("IP of record for " + res.data.record.name + " is changed to " + res.data.record.value);
                                } else {
                                    logger.error("Error when changing record for " + currentRecord.name + ": " + res.message)
                                }
                            }
                        );
                    } else {
                        logger.trace(`Current IP ${newIP} equals to online IP ${onlineIP}. No action to do.`);
                    }
                } else {
                    logger.error("Error when getting current records: " + JSON.stringify(error));
                }
            }
        );
    } else {
        logger.trace(`Current IP ${newIP} equals to offline IP ${offlineIP}. No action to do.`);
    }
}

fnMainCheck();
setInterval(fnMainCheck, Number(Config.CheckInterval) * 1000);