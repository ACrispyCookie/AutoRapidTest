class Submitter {

    constructor(profile, result, headless, shouldLog) {
        this.profile = profile;
        this.result = result;
        this.headless = headless;
        this.shouldLog = shouldLog;
        //IMPORTS
        this.puppeteer = require('puppeteer');
        this.fs = require("fs");
        //BUTTONS
        this.cookieButton = "button.MuiButtonBase-root.MuiButton-root.jss261.MuiButton-contained.jss247.MuiButton-containedPrimary.MuiButton-containedSizeSmall.MuiButton-sizeSmall";
        this.loginButton = "a.MuiButtonBase-root.MuiButton-root.jss261.MuiButton-contained.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge";
        this.loginButton2 = "button.MuiButtonBase-root.MuiButton-root.MuiButton-root.MuiButton-contained.jss5.MuiButton-containedPrimary.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge";
        this.loginButton3 = "button#btn-login-submit";
        this.loginButton4 = "button#btn-submit";
        this.loginButton5 = "button.MuiButtonBase-root.MuiButton-root.jss370.MuiButton-contained.jss439.MuiButton-containedPrimary.MuiButton-containedSizeLarge.MuiButton-sizeLarge";
        //INPUTS
        this.usernameInput = "input#v";
        this.passwordInput = "input#j_password";
        
        this.url = "https://dilosi.services.gov.gr/templates/EDUPASS-SCHOOL-CARD";
        this.delayBetweenActions = 400;
    }

    async submitOne() {
        let completed = false;
        let tries = 0;
        while(!completed && tries != 3){
            try {
                let fileName = await this.submitOneUnsafe();
                completed = true;
                return fileName;
            }
            catch(e){
                tries++;
                if(tries != 3){
                    this.log("EXCEPTION THROWN! Restarting " + (3 - tries) + " more times...");
                }
                else{
                    this.log("EXCEPTION THROWN! Stopping script...");
                }
            }
        }
        return null;
    }

    async submitOneUnsafe(){
        const browser = await this.puppeteer.launch({ headless: this.headless });
        const page = await browser.newPage();
        //GOV.GR
        this.log("Launching gov.gr...")
        await page.goto(this.url, { waitUntil: "networkidle0", timeout: 0 });
        await page.click(this.cookieButton);
        await page.click(this.loginButton);
        this.log("Navigating to account type selection...")
        //NAVIGATE ACCOUNT TYPE GOV.GR
        await page.waitForSelector(this.loginButton2);
        await page.waitForTimeout(this.delayBetweenActions);
        await page.click(this.loginButton2);
        this.log("Navigating to login page...")
        //NAVIGATE GSIS.GR
        await page.waitForSelector(this.loginButton3);
        await page.waitForTimeout(this.delayBetweenActions);
        this.log("Logging in...")
        await page.type(this.usernameInput, this.profile.username);
        await page.type(this.passwordInput, this.profile.password);
        await page.click(this.loginButton3);
        this.log("Navigating...")
        //NAVIGATE GSIS.GR ALLOW DATA
        try {
          await page.waitForSelector(this.loginButton4, { timeout: 3000 });
          await page.click(this.loginButton4);
        } catch (e) {}
        this.log("Navigating to gov.gr...")
        //NAVIGATE BACK TO GOV.GR
        await page.waitForSelector(this.loginButton5);
        await page.waitForTimeout(this.delayBetweenActions);
        await page.click(this.loginButton5);
        this.log("Navigating to the posting page...")
        //NAVIGATE TO SELF TEST POST PAGE
        await page.waitForNetworkIdle();
        await page.waitForTimeout(this.delayBetweenActions);
        //SET SCHOOL DATA
        this.log("Filling school data...")
        for (let i = 0; i < 6; i++) {
          let keys = Object.keys(this.profile["test"]["buttons"]);
          let value = this.profile["test"]["buttons"][keys[i]];
          await this.selectDropDown(page, 'div[customlabel="' + keys[i] + '"]', value);
        }
        //SET STUDENT DATA
        this.log("Filling student data...")
        for (let i = 0; i < 6; i++) {
          let name = Object.keys(this.profile["test"])[i];
          let value = this.profile["test"][name];
          await page.type("input[name=input_" + name + "]", value);
        }
        await this.selectDropDown(
          page,
          "div[aria-labelledby=mui-component-select-can_use_amka]",
          "ΝΑΙ"
        );
        //SET DATE
        this.log("Filling date data...")
        let d = new Date();
        let date = String(d.getDate());
        let month = String(d.getMonth() + 1);
        let year = String(d.getFullYear());
        await page.type("input[name=self_test_date-day]", date);
        await page.type("input[name=self_test_date-month]", month);
        await page.type("input[name=self_test_date-year]", year);
        //SET RESULT
        this.log("Filling result data...")
        await this.selectDropDown(
          page,
          "div[aria-labelledby=mui-component-select-self_test_result]",
          this.result
        );
        //SUBMIT
        this.log("Sumbitting data...")
        await page.click(this.loginButton5);
        //FINAL PAGE
        await page.waitForNetworkIdle();
        await page.waitForTimeout(this.delayBetweenActions);
        let name = null;
        if (this.headless) {
            this.log("Saving pdf...")
            if (!this.fs.existsSync("./tests")) {
                this.fs.mkdirSync("./tests");
            }
            name = this.profile.name.toLowerCase() + "_" 
            + ("0" + date).slice(-2) 
            + ("0" + month).slice(-2) 
            + ("0" + year).slice(-2) + "_" 
            + ("0" + d.getHours()).slice(-2) 
            + ("0" + d.getMinutes()).slice(-2)
            + ("0" + d.getSeconds()).slice(-2);
            await page.pdf({path: "./tests/" + name + ".pdf"});
        }
        await browser.close();
        return name;
    }
    
    async selectDropDown(page, button, value) {
        await page.click(button);
        await page.waitForSelector('li[data-value="' + value + '"]');
        await page.waitForTimeout(200);
        await page.click('li[data-value="' + value + '"]');
        await page.waitForTimeout(this.delayBetweenActions);
    }

    log(msg) {
        let date = new Date();
        let prefix = "[" + date.toLocaleString("en-US") + "] ";
        if(this.shouldLog) console.log(prefix + msg);
    }
}

module.exports = Submitter;