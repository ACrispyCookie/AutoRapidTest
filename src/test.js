const rl = require("readline").createInterface({
  input: process.stdin,
  output: process.stdout,
});

class Test {
    
  constructor(profile, type, scheduleObj, result, forcePositive, shouldEmail){
    this.submitter = require('./submitter.js');
    this.debugger = require('./debugger.js');
    this.scheduler = require('node-cron');
    this.mailer = require('./mailer.js');
    this.profile = profile;
    this.type = type;
    this.scheduleObj = scheduleObj;
    this.forcePositive = forcePositive;
    this.shouldEmail = shouldEmail;
    this.result = result;
    this.headless = true;
  }

  async execute() {
    this.checkForPositive(async () => {
      if(this.type == "one"){
        this.log("Executing an one time test...");
        await this.executeOne();
      }
      else if(this.type == "schedule"){
        this.log("Executing a scheduled test...");
        this.schedule();
      }
      else {
        this.log("Executing the debugger...");
        this.debug();
      }
    });
  }

  async schedule() {
    this.log("Waiting...");
    this.scheduler.schedule(this.scheduleObj['cron'], async () => {
      await this.executeOne();
      this.log("Waiting...");
    });
  }

  async debug() {
    let submitter = new this.submitter(this.profile, this.result, this.headless, false);
    let debug = new this.debugger(submitter, Number.parseInt(this.type));
    await debug.doDebug();
  }

  async executeOne(){
    let submitter = new this.submitter(this.profile, this.result, this.headless, true);
    let startDate = new Date().toLocaleString("en-US");
    let fileName = await submitter.submitOne();
    let endDate = new Date().toLocaleString("en-US");
    if(this.shouldEmail){
      this.log("Sending a " + (fileName ? "success" : "failure") + " email...");
      let mailer = new this.mailer(fileName, this.profile, startDate, endDate, false);
      await mailer.sendMail();
    }
    this.log("Process " + (fileName ? "complete" : "failed") + "!");
    process.exit(0);
  }

  log(msg) {
    let date = new Date();
    let prefix = "[" + date.toLocaleString("en-US") + "] ";
    console.log(prefix + msg);
  }

  checkForPositive(callback){
    if(!this.forcePositive && this.result == "ΘΕΤΙΚΟ"){
      this.log("*** WARNING! You have requested a positive test! Do you want to continue? (y/n)*** ")
      rl.question("", (line) => {
        if(line.toLocaleLowerCase() == "n"){
          process.exit(1);
        }
        else if(line.toLocaleLowerCase() == "y"){
          callback();
        }
        else{
          this.checkForPositive(callback);
        }
      });
    }
    else{
      callback();
    }
  }
}

module.exports = Test;
