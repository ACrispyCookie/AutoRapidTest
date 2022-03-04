const fs = require("fs");
const cron = require("node-cron");
const { argv } = require("process");
const puppeteer = require("puppeteer");
const { isNumberObject } = require("util/types");

let file = fs.readFileSync(process.argv[2] + ".json");
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

async function send(profile, log) {
  await (async () => {
    const browser = await puppeteer.launch({ headless: headless });
    const page = await browser.newPage();
    //GOV.GR
    if (log) console.log("Launching gov.gr...");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
    await page.click(cookieButton);
    await page.click(loginButton);
    if (log) console.log("Navigating to account type selection...");
    //NAVIGATE ACCOUNT TYPE GOV.GR
    await page.waitForSelector(loginButton2);
    await page.waitForTimeout(delayBetweenActions);
    await page.click(loginButton2);
    if (log) console.log("Navigating to login page...");
    //NAVIGATE GSIS.GR
    await page.waitForSelector(loginButton3);
    await page.waitForTimeout(delayBetweenActions);
    if (log) console.log("Logging in...");
    await page.type(usernameInput, profile.username);
    await page.type(passwordInput, profile.password);
    await page.click(loginButton3);
    if (log) console.log("Navigating...");
    //NAVIGATE GSIS.GR ALLOW DATA
    try {
      await page.waitForSelector(loginButton4, { timeout: 3000 });
      await page.click(loginButton4);
    } catch (e) {}
    if (log) console.log("Navigating to gov.gr...");
    //NAVIGATE BACK TO GOV.GR
    await page.waitForSelector(loginButton5);
    await page.waitForTimeout(delayBetweenActions);
    await page.click(loginButton5);
    if (log) console.log("Navigating to the posting page...");
    //NAVIGATE TO SELF TEST POST PAGE
    await page.waitForNetworkIdle();
    await page.waitForTimeout(delayBetweenActions);
    //SET SCHOOL DATA
    if (log) console.log("Filling school data...");
    for (let i = 0; i < 6; i++) {
      let keys = Object.keys(profile["buttons"]);
      let value = profile["buttons"][keys[i]];
      await selectDropDown(page, 'div[customlabel="' + keys[i] + '"]', value);
    }
    //SET STUDENT DATA
    if (log) console.log("Filling student data...");
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
    if (log) console.log("Filling date data...");
    let d = new Date();
    let date = String(d.getDate());
    let month = String(d.getMonth() + 1);
    let year = String(d.getFullYear());
    await page.type("input[name=self_test_date-day]", date);
    await page.type("input[name=self_test_date-month]", month);
    await page.type("input[name=self_test_date-year]", year);
    //SET RESULT
    if (log) console.log("Filling result data...");
    await selectDropDown(
      page,
      "div[aria-labelledby=mui-component-select-self_test_result]",
      result
    );
    //SUBMIT
    if (log) console.log("Sumbitting data...");
    await page.click(loginButton5);
    //FINAL PAGE
    await page.waitForNetworkIdle();
    await page.waitForTimeout(delayBetweenActions);
    if (headless) {
      if (log) console.log("Saving pdf...");
      if (!fs.existsSync("./tests")) {
        fs.mkdirSync("./tests");
      }
      await page.pdf({
        path:
          "./tests/" +
          process.argv[2] +
          "_" +
          date +
          month +
          year +
          "_" +
          d.getHours() +
          d.getMinutes() +
          d.getSeconds() +
          ".pdf",
      });
      if (log) console.log("Process complete!");
    }
    await browser.close();
  })();
}

async function selectDropDown(page, button, value) {
  await page.click(button);
  await page.waitForSelector('li[data-value="' + value + '"]');
  await page.waitForTimeout(100);
  await page.click('li[data-value="' + value + '"]');
  await page.waitForTimeout(delayBetweenActions);
}

if (process.argv[3]) {
  let dashless = process.argv[3].substring(1);
  if (dashless == "s") {
    console.log("Waiting for Monday or Thursday...");
    cron.schedule("0 0 22 * * 1,4", () => {
      send(profile, true);
      console.log("Waiting for Monday or Thursday...");
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
    console.log("Test #" + (i + 1) + " started.");
    try {
      await send(profile, false);
      timeAfter = Date.now();
      success++;
      console.log(
        "Test #" +
          (i + 1) +
          " succeded! Time taken: " +
          (timeAfter - timeBefore) / 1000 +
          "s"
      );
    } catch (e) {
      timeAfter = Date.now();
      fail++;
      exceptions.push(e);
      console.log("Test #" + (i + 1) + " failed!");
    }
    time.push(timeAfter - timeBefore);
  }
  console.log(
    "Tests done: " +
      count +
      " (Avg. time: " +
      (time.reduce((a, b) => a + b, 0) / 1000) * time.length +
      "s)"
  );
  console.log("Tests failed: " + fail);
  console.log("Tests succeded: " + success);
  if (exceptions.length > 0) {
    console.log("Saving exceptions...");
    if (!fs.existsSync("./logs")) {
      fs.mkdirSync("./logs");
    }
    let d = new Date();
    let date = String(d.getDate());
    let month = String(d.getMonth() + 1);
    let year = String(d.getFullYear());
    fs.writeFileSync(
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
    console.log("Exceptions saved!");
  }
}
