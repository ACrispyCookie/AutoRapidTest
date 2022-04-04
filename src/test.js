class Test {
    
  constructor(profile, type, result){
    this.submitter = require('./submitter.js');
    this.debugger = require('./debugger.js');
    this.scheduler = require('node-cron');
    this.mailer = require('./mailer.js');
    this.profile = profile;
    this.type = type;
    this.result = result;
    this.headless = true;
  }

  async execute() {
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
  }

  async schedule() {
    this.log("Waiting for Monday or Thursday...");
    this.scheduler.schedule("0 30 23 * * 1,4", async () => {
      await this.executeOne();
      this.log("Waiting for Monday or Thursday...");
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
    this.log("Sending a " + (fileName ? "success" : "failure") + " email...");
    let mailer = new this.mailer(fileName, this.profile, startDate, endDate, false);
    await mailer.sendMail();
    this.log("Process " + (fileName ? "complete" : "failed") + "!");
  }

  log(msg) {
    let date = new Date();
    let prefix = "[" + date.toLocaleString("en-US") + "] ";
    console.log(prefix + msg);
  }
}

module.exports = Test;
