class Debugger {
    constructor(submitter, num) {
        this.fs = require('fs');
        this.submitter = submitter
        this.num = num;
        this.fail = 0;
        this.success = 0;
        this.exceptions = new Array();
        this.durations = new Array();
    }

    async doDebug() {
        for(let i = 0; i < this.num; i++){
            this.log("Test #" + (i + 1) + " started.");
            let start = Date.now();
            let end = 0;
            try {
                await this.submitter.submitOneUnsafe();
                end = Date.now();
                this.log("Test #" + (i + 1) + " succeded.");
                this.success++;
            } catch(e){
                end = Date.now();
                this.log("Test #" + (i + 1) + " failed.");
                this.fail++;
                this.exceptions.push(e);
            }
            this.durations.push(end - start);
        }
        this.log("Tests done: " + this.num + " (Avg. time: " + this.durations.reduce((a, b) => a + b, 0) / 1000 / this.durations.length + "s)");
        this.log("Tests failed: " + this.fail);
        this.log("Tests succeded: " + this.success);
        if(this.exceptions.length > 0){
            await this.saveExceptions()
        }
        process.exit(0);
    }

    async saveExceptions(){
        this.log("Saving exceptions...");
        if (!this.fs.existsSync("./logs")) {
            this.fs.mkdirSync("./logs");
        }
        let d = new Date();
        await this.fs.writeFileSync( "./logs/log_" + d.getDate() + (d.getMonth() + 1) + d.getFullYear() + "_" + d.getHours() + d.getMinutes() + d.getSeconds() + ".txt", this.exceptions.join("\n\n"), "utf-8");
        this.log("Exceptions saved!");
    }

    log(msg) {
        let date = new Date();
        let prefix = "[" + date.toLocaleString("en-US") + "] ";
        console.log(prefix + msg);
    }
}

module.exports = Debugger;