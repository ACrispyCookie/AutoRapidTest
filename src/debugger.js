class Debugger {
    constructor(submitter, num) {
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
        this.log("Tests done: " + results.count + " (Avg. time: " + results.durations.reduce((a, b) => a + b, 0) / 1000 / results.durations.length + "s)");
        this.log("Tests failed: " + results.fail);
        this.log("Tests succeded: " + results.success);
        if(this.exceptions.length > 0){
            await this.saveExceptions()
        }
    }

    async saveExceptions(){
        this.log("Saving exceptions...");
        if (!fs.existsSync("./logs")) {
            fs.mkdirSync("./logs");
        }
        let d = new Date();
        await fs.writeFileSync( "./logs/log_" + d.getDate() + (d.getMonth() + 1) + d.getFullYear() + "_" + d.getHours() + d.getMinutes() + d.getSeconds() + ".txt", exceptions.join("\n\n"), "utf-8");
        this.log("Exceptions saved!");
    }

    log(msg) {
        let date = new Date();
        let prefix = "[" + date.toLocaleString("en-US") + "] ";
        console.log(prefix + msg);
    }
}

module.exports = Debugger;