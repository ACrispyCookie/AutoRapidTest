const fs = require("fs");
const cron = require("node-cron");
const { argv } = require("process");
const puppeteer = require("puppeteer");
const { isNumberObject } = require("util/types");

let file = fs.readFileSync(process.argv[2]);
let profile = JSON.parse(file);

let url = "https://dilosi.services.gov.gr/templates/EDUPASS-SCHOOL-CARD";
let headless = true;
let delayBetweenActions = 400;
let result = "ΑΡΝΗΤΙΚΟ";
let resultArg = process.argv[4];
if (resultArg == "n" || resultArg == "p") {
  result = resultArg == "n" ? "ΑΡΝΗΤΙΚΟ" : "ΘΕΤΙΚΟ";
}

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

function log(msg, shouldLog){
  let date = new Date();
  let prefix = "[" + date.toLocaleString("en-US") + "] ";
  if(shouldLog) console.log(prefix + msg);
}

async function send(profile, shouldLog) {
  await (async () => {
    const browser = await puppeteer.launch({ headless: headless });
    const page = await browser.newPage();
    //GOV.GR
    log("Launching gov.gr...", shouldLog)
    await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
    await page.click(cookieButton);
    await page.click(loginButton);
    log("Navigating to account type selection...", shouldLog)
    //NAVIGATE ACCOUNT TYPE GOV.GR
    await page.waitForSelector(loginButton2);
    await page.waitForTimeout(delayBetweenActions);
    await page.click(loginButton2);
    log("Navigating to login page...", shouldLog)
    //NAVIGATE GSIS.GR
    await page.waitForSelector(loginButton3);
    await page.waitForTimeout(delayBetweenActions);
    log("Logging in...", shouldLog)
    await page.type(usernameInput, profile.username);
    await page.type(passwordInput, profile.password);
    await page.click(loginButton3);
    log("Navigating...", shouldLog)
    //NAVIGATE GSIS.GR ALLOW DATA
    try {
      await page.waitForSelector(loginButton4, { timeout: 3000 });
      await page.click(loginButton4);
    } catch (e) {}
    log("Navigating to gov.gr...", shouldLog)
    //NAVIGATE BACK TO GOV.GR
    await page.waitForSelector(loginButton5);
    await page.waitForTimeout(delayBetweenActions);
    await page.click(loginButton5);
    log("Navigating to the posting page...", shouldLog)
    //NAVIGATE TO SELF TEST POST PAGE
    await page.waitForNetworkIdle();
    await page.waitForTimeout(delayBetweenActions);
    //SET SCHOOL DATA
    log("Filling school data...", shouldLog)
    for (let i = 0; i < 6; i++) {
      let keys = Object.keys(profile["buttons"]);
      let value = profile["buttons"][keys[i]];
      await selectDropDown(page, 'div[customlabel="' + keys[i] + '"]', value);
    }
    //SET STUDENT DATA
    log("Filling student data...", shouldLog)
    for (let i = 0; i < 6; i++) {
      let name = Object.keys(profile)[i + 2];
      let value = profile[name];
      await page.type("input[name=input_" + name + "]", value);
    }
    await selectDropDown(
      page,
      "div[aria-labelledby=mui-component-select-can_use_amka]",
      "ΝΑΙ"
    );
    //SET DATE
    log("Filling date data...", shouldLog)
    let d = new Date();
    let date = String(d.getDate());
    let month = String(d.getMonth() + 1);
    let year = String(d.getFullYear());
    await page.type("input[name=self_test_date-day]", date);
    await page.type("input[name=self_test_date-month]", month);
    await page.type("input[name=self_test_date-year]", year);
    //SET RESULT
    log("Filling result data...", shouldLog)
    await selectDropDown(
      page,
      "div[aria-labelledby=mui-component-select-self_test_result]",
      result
    );
    //SUBMIT
    log("Sumbitting data...", shouldLog)
    await page.click(loginButton5);
    //FINAL PAGE
    await page.waitForNetworkIdle();
    await page.waitForTimeout(delayBetweenActions);
    if (headless) {
      log("Saving pdf...", shouldLog)
      if (!fs.existsSync("./tests")) {
        fs.mkdirSync("./tests");
      }
      await page.pdf({
        path:
          "./tests/" +
          process.argv[2] +
          "_" +
          ("0" + date).slice(-2) +
          ("0" + month).slice(-2) +
          ("0" + year).slice(-2) +
          "_" +
          ("0" + d.getHours()).slice(-2) +
          ("0" + d.getMinutes()).slice(-2) +
          ("0" + d.getSeconds()).slice(-2) +
          ".pdf",
      });
      log("Process complete!", shouldLog)
    }
    await browser.close();
  })();
}

async function selectDropDown(page, button, value) {
  await page.click(button);
  await page.waitForSelector('li[data-value="' + value + '"]');
  await page.waitForTimeout(200);
  await page.click('li[data-value="' + value + '"]');
  await page.waitForTimeout(delayBetweenActions);
}

if (process.argv[3]) {
  let dashless = process.argv[3].substring(1);
  if (dashless == "s") {
    log("Waiting for Monday or Thursday...", true);
    cron.schedule("0 0 22 * * 1,4", async () => {
      let complete = false;
      while(!complete) {
        try {
          await send(profile, true);
          complete = true;
          log("Waiting for Monday or Thursday...", true);
        } catch(e) {
          log("!!! EXCEPTION THROWN RESTARTING...", true);
        }
      }
    });
  } else if (
    !isNaN(dashless) &&
    Number.isInteger(Number(dashless)) &&
    Number(dashless) > 1
  ) {
    let count = Number(dashless);
    doDebug(count);
  } else {
    send(profile, true);
  }
} else {
  send(profile, true);
}

async function doDebug(count) {
  let fail = 0;
  let success = 0;
  let exceptions = new Array();
  let time = new Array();
  for (let i = 0; i < count; i++) {
    let timeBefore = Date.now();
    let timeAfter = 0;
    log("Test #" + (i + 1) + " started.", true);
    try {
      await send(profile, false);
      timeAfter = Date.now();
      success++;
      log(
        "Test #" +
          (i + 1) +
          " succeded! Time taken: " +
          (timeAfter - timeBefore) / 1000 +
          "s",
          true
      );
    } catch (e) {
      timeAfter = Date.now();
      fail++;
      exceptions.push(e);
      log(
        "Test #" +
          (i + 1) +
          " failed! Time taken: " +
          (timeAfter - timeBefore) / 1000 +
          "s",
          true
      );
    }
    time.push(timeAfter - timeBefore);
  }
  log(
    "Tests done: " +
      count +
      " (Avg. time: " +
      time.reduce((a, b) => a + b, 0) / 1000 / time.length +
      "s)",
      true
  );
  log("Tests failed: " + fail, true);
  log("Tests succeded: " + success, true);
  if (exceptions.length > 0) {
    log("Saving exceptions...", true);
    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs");
    }
    let d = new Date();
    let date = String(d.getDate());
    let month = String(d.getMonth() + 1);
    let year = String(d.getFullYear());
    await fs.writeFileSync(
      "./logs/log" +
        "_" +
        date +
        month +
        year +
        "_" +
        d.getHours() +
        d.getMinutes() +
        d.getSeconds() +
        ".txt",
      exceptions.join("\n\n"),
      "utf-8"
    );
    log("Exceptions saved!", true);
  }
}
