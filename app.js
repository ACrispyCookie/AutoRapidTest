const fs = require("fs");
const puppeteer = require("puppeteer");

let file = fs.readFileSync(process.argv[2] + ".json");
let jason = JSON.parse(file);

let url = "https://dilosi.services.gov.gr/templates/EDUPASS-SCHOOL-CARD";
let headless = true;
let delayForButtons = 500;
let result = "ΑΡΝΗΤΙΚΟ";
let resultArg = process.argv[3];
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

function send(profile) {
  (async () => {
    const browser = await puppeteer.launch({ headless: headless });
    const page = await browser.newPage();
    //GOV.GR
    console.log("Launching gov.gr...");
    await page.goto(url, { waitUntil: "networkidle0", timeout: 0 });
    await page.click(cookieButton);
    await page.click(loginButton);
    console.log("Navigating to account type selection...");
    await page.waitForNavigation();
    //NAVIGATE ACCOUNT TYPE GOV.GR
    await page.click(loginButton2);
    console.log("Navigating to login page...");
    //NAVIGATE GSIS.GR
    await page.waitForSelector(loginButton3);
    await page.waitForTimeout(500);
    console.log("Logging in...");
    await page.type(usernameInput, profile.username);
    await page.type(passwordInput, profile.password);
    await page.click(loginButton3);
    console.log("Navigating...");
    //NAVIGATE GSIS.GR ALLOW DATA
    await page.waitForTimeout(3000);
    if (page.url().startsWith("https://www1.gsis.gr/"))
      await page.click(loginButton4);
    console.log("Navigating to gov.gr...");
    //NAVIGATE BACK TO GOV.GR
    await page.waitForSelector(loginButton5);
    await page.click(loginButton5);
    console.log("Navigating to the posting page...");
    //NAVIGATE TO SELF TEST POST PAGE
    await page.waitForNetworkIdle();
    //SET SCHOOL DATA
    console.log("Filling school data...");
    for (let i = 0; i < 6; i++) {
      let keys = Object.keys(profile["buttons"]);
      let value = profile["buttons"][keys[i]];
      await page.click('div[customlabel="' + keys[i] + '"');
      await page.waitForTimeout(delayForButtons);
      await page.click('li[data-value="' + value + '"]');
      await page.waitForTimeout(delayForButtons);
    }
    //SET STUDENT DATA
    console.log("Filling student data...");
    for (let i = 0; i < 6; i++) {
      let name = Object.keys(profile)[i + 2];
      let value = profile[name];
      await page.type("input[name=input_" + name + "]", value);
    }
    await page.click("div[aria-labelledby=mui-component-select-can_use_amka]");
    await page.waitForTimeout(delayForButtons);
    await page.click("li[data-value=ΝΑΙ]");
    await page.waitForTimeout(delayForButtons);
    //SET DATE
    console.log("Filling date data...");
    let d = new Date();
    let date = String(d.getDate());
    let month = String(d.getMonth());
    let year = String(d.getFullYear());
    await page.type("input[name=self_test_date-day]", date);
    await page.type("input[name=self_test_date-month]", month);
    await page.type("input[name=self_test_date-year]", year);
    //SET RESULT
    console.log("Filling result data...");
    await page.click(
      "div[aria-labelledby=mui-component-select-self_test_result]"
    );
    await page.waitForTimeout(delayForButtons);
    await page.click("li[data-value=" + result + "]");
    await page.waitForTimeout(delayForButtons);
    //SUBMIT
    console.log("Sumbiting data...");
    await page.click(loginButton5);
    await page.waitForSelector("button[label=Εκτύπωση]");
    if (headless) {
      console.log("Saving pdf...");
      if (!fs.existsSync("./tests")) {
        fs.mkdirSync("./tests");
      }
      await page.pdf({
        path:
          "./tests/self-test_" +
          date +
          month +
          year +
          "_" +
          d.getHours() +
          d.getMinutes() +
          d.getSeconds() +
          ".pdf",
      });
      console.log("Process complete!");
    }
    await browser.close();
  })();
}

send(jason);
