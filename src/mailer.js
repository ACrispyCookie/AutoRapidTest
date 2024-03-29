class Mailer {
    constructor(fileName, profile, startDate, endDate, scheduled) {
        const nodemailer = require('nodemailer');
        const pug = require('pug');
        this.fs = require('fs');
        let credentials = JSON.parse(this.fs.readFileSync("./resources/email.json"));
        this.email = pug.compileFile("./resources/email.pug");
        this.transporter = nodemailer.createTransport({
          host: credentials.host,
          port: 465,
          secure: true,
          auth: {
            user: credentials.username,
            pass: credentials.password
          },
          tls: {
            rejectUnauthorized: false
          }
        });
        this.profile = profile;
        this.startDate = startDate;
        this.endDate = endDate;
        this.scheduled = scheduled;
        this.fileName = fileName;
    }

    async sendMail() {
      //this.generateImage();
      let info = await this.transporter.sendMail({
        from: '"AutoRapidTest" <autotest@colonymc.org>',
        to: this.profile["email"],
        subject: this.getSubject(),
        html: this.getHTML(),
        attachments: [
          /*{
            filename: "first_page.jpg",
            path: "./tests/" + this.fileName + "-1.jpg",
            cid: "first_page"
          },*/
          {
            path: "./tests/" + this.fileName + ".pdf",
          }
        ]
      });
      //this.fs.rm("./tests/" + this.fileName + "-1.jpg", { recursive: true, force: true }, () => {});
      return info;
    }

    getSubject(){
      let s = (this.scheduled ? "Scheduled" : "One-time") + " self test " + (this.fileName ? "submitted! ✅" : "not submitted! ❌");
      return s;
    }

    getHTML(){
      let html = this.email({
        name: this.profile["name"],
        startDate: this.startDate,
        endDate: this.endDate,
        result: (this.fileName ? "has been successfully submitted! You can view it below." : "wasn't successfully submit due to an error. Please take a look at the console logs.")
      });
      return html;
    }

    /*generateImage(){
      const pdf2image = require('./pdf2image.js');
      pdf2image("./tests/" + this.fileName + ".pdf", { out_dir: "./tests/", out_prefix: this.fileName});
    }*/

}

module.exports = Mailer;