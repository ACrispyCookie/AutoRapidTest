const fs = require('fs');
const puppeteer = require('puppeteer');

let file = fs.readFileSync('jason.json')
let jason = JSON.parse(file);

let userAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/98.0.4758.102 Safari/537.36"
let url = "https://dilosi.services.gov.gr/templates/EDUPASS-SCHOOL-CARD";
let cookieButton = "button.MuiButtonBase-root.MuiButton-root.jss261.MuiButton-contained.jss247.MuiButton-containedPrimary.MuiButton-containedSizeSmall.MuiButton-sizeSmall";
let loginButton = "a.MuiButtonBase-root.MuiButton-root.jss261.MuiButton-contained.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge";
let login2Button = "button.MuiButtonBase-root.MuiButton-root.MuiButton-root.MuiButton-contained.jss5.MuiButton-containedPrimary.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge"; 
let login3Button = "button#btn-login-submit"
let usernameInput = "input#v"
let passwordInput = "input#j_password"

function send(profile){
    (async () => {
        const browser = await puppeteer.launch({headless: false});
        const page = await browser.newPage();
        await page.goto(url, {waitUntil: "networkidle0"});
        await page.click(cookieButton)
        await page.click(loginButton)
        await page.waitForSelector(login2Button)
        await page.click(login2Button)
        await page.waitForSelector(login3Button)
        await page.type(usernameInput, profile.username)
        await page.type(passwordInput, profile.password)
        await page.click(login3Button)
        await page.waitForNetworkIdle()
        await page.click(login3Button)
    })();
}

send(jason);