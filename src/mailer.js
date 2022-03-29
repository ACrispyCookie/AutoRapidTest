class Mailer {
    constructor(file, profile, startDate, endDate, scheduled) {
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
        this.file = file;
    }

    async sendMail() {
      await this.generateImage();
      let info = await this.transporter.sendMail({
        from: '"AutoRapidTest" <autotest@colonymc.org>',
        to: this.profile["email"],
        subject: this.getSubject(),
        html: this.getHTML(),
        attachments: [
          {
            filename: "first_page.jpg",
            path: "./imgs/" + this.file.name + "-1.jpg",
            cid: "first_page"
          },
          {
            path: "./tests/" + this.file.name + ".pdf",
          }
        ]
      });
      this.fs.rmdir("./imgs/", () => {});
      return info;
    }

    getSubject(){
      let s = (this.scheduled ? "Scheduled" : "One-time") + " self test " + (this.file ? "submitted! ✅" : "not submitted! ❌");
      return s;
    }

    getHTML(){
      let html = this.email({
        name: this.profile["name"],
        startDate: this.startDate,
        endDate: this.endDate,
        result: (this.file ? "has been successfully submitted! You can view it below." : "wasn't successfully submit due to an error. Please take a look at the console logs.")
      });
      return html;
    }

    async generateImage(){
      const pdf = require('pdf-poppler');
      if(!this.fs.existsSync('./imgs/')){
        this.fs.mkdirSync("./imgs/");
      }
      let opts = {
        format: 'jpeg',
        out_dir: "./imgs/",
        out_prefix: this.file.name,
        page: null
      }
      await pdf.convert("./tests/" + this.file.name + ".pdf", opts);
    }

}

module.exports = Mailer;