const puppeteer = require("puppeteer");
const $ = require("cheerio");
const CronJob = require("cron").CronJob;
const nodemailer = require("nodemailer");

const url =
    "https://www.amazon.com/Sony-WF-1000XM3-Industry-Canceling-Wireless/dp/B07T81554H/ref=sr_1_1?dchild=1&keywords=sony+wf-1000xm3&qid=1610867370&sr=8-1";

async function configureBrowser() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    return page;
}

async function checkPrice(page) {
    await page.reload();

    let html = await page.evaluate(() => document.body.innerHTML);
    $("#priceblock_ourprice", html).each(function () {
        let dollarPrice = $(this).text();
        let currentPrice = Number(dollarPrice.replace(/[^0-9.-]+/g, ""));
        if (currentPrice < 300) {
            console.log("buyyyy!!! the price is " + currentPrice);
            sendNotification(currentPrice);
        }
    });
}

async function startTracking() {
    const page = await configureBrowser();

    let job = new CronJob( //jalan tiap 30 detik
        "*/30 * * * * *",
        function () {
            checkPrice(page);
        },
        null,
        true,
        null,
        null,
        true
    );
    job.start();
}

async function sendNotification(price) {
    let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "testmailer513@gmail.com",
            pass: "@testermailer513",
        },
    });

    let textToSend = "Price dropped to " + price;
    let htmlText = `<a href=\"${url}\">Link</a>`;

    let info = await transporter.sendMail({
        from: '"Price Tracker" <testmailer513@gmail.com>',
        to: "bambadom@gmail.com",
        subject: "Price dropped to " + price,
        text: textToSend,
        html: htmlText,
    });
    console.log("message sent: %s", info.messageId);
}

startTracking();
