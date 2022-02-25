const fs = require("fs");
const puppeteer = require("puppeteer");

let file = fs.readFileSync("jason.json");
let jason = JSON.parse(file);

let url = "https://dilosi.services.gov.gr/templates/EDUPASS-SCHOOL-CARD";

//BUTTONS
let cookieButton =
  "button.MuiButtonBase-root.MuiButton-root.jss261.MuiButton-contained.jss247.MuiButton-containedPrimary.MuiButton-containedSizeSmall.MuiButton-sizeSmall";
let loginButton =
  "a.MuiButtonBase-root.MuiButton-root.jss261.MuiButton-contained.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge";
let loginButton2 =
  "button.MuiButtonBase-root.MuiButton-root.MuiButton-root.MuiButton-contained.jss5.MuiButton-containedPrimary.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge";
let loginButton3 = "button#btn-login-submit";
let loginButton4 = "button#btn-submit";
let loginButton5 =
  "button.MuiButtonBase-root.MuiButton-root.jss370.MuiButton-contained.jss439.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge";

//INPUTS
let usernameInput = "input#v";
let passwordInput = "input#j_password";

function send(profile) {
  (async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    //GOV.GR
    await page.goto(url, { waitUntil: "networkidle0" });
    await page.click(cookieButton);
    await page.click(loginButton);
    await page.waitForNavigation();
    //ACCOUNT TYPE GOV.GR
    await page.click(loginButton2);
    //GSIS.GR
    await page.waitForSelector(loginButton3);
    await page.waitForTimeout(500);
    await page.type(usernameInput, profile.username);
    await page.type(passwordInput, profile.password);
    await page.click(loginButton3);
    //GSIS.GR ALLOW DATA
    await page.waitForTimeout(3000);
    if (page.url().startsWith("https://www1.gsis.gr/"))
      await page.click(loginButton4);
    //BACK TO GOV.GR
    await page.waitForSelector(loginButton5);
    await page.click(loginButton5);
    //SELF TEST POST PAGE
    await page.waitForNetworkIdle();
    //SET SCHOOL DATA
    for (let i = 0; i < 13; i++) {
      let value = profile[Object.keys(profile)[i + 2]];
      await page.evaluate(
        (i, value) => {
          document.getElementsByTagName("input")[i].value = value;
        },
        i,
        value
      );
    }
    //SET DATE
    let d = new Date();
    let date = d.getDate();
    let month = d.getMonth();
    let year = d.getFullYear();
    await page.evaluate((value) => {
      document.getElementsByName("self_test_date-day").value = value;
    }, date);
    await page.evaluate((value) => {
      document.getElementsByName("self_test_date-month").value = value;
    }, month);
    await page.evaluate((value) => {
      document.getElementsByName("self_test_date-year").value = value;
    }, year);
    //SET RESULT
    await page.evaluate(() => {
      document.getElementsByName("self_test_result").value = "ΑΡΝΗΤΙΚΟ";
    });
    //await page.click(loginButton5);
  })();
}

send(jason);
