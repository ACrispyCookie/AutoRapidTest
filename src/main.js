const fs = require("fs");
const Test = require("./test.js");
var argv = require('yargs/yargs')(process.argv.slice(2))
          .usage("Usage: npm run main -- <profile> -e -f -s [schedule] -d [times to run the debugger] -r [result: n (negative) or p (positive)]")
          .demandCommand(1)
          .default('s', null)
          .default('d', null)
          .default('r', "n")
          .count('f')
          .count('e')
          .argv;

async function main(){
  let profileName = argv._;
  let scheduleName = argv.s;
  let debugName = argv.d;
  let resultName = argv.r;
  let force = argv.f >= 1;
  let email = argv.e >= 1;

  //GET PROFILE
  let file = fs.readFileSync("./config/profiles/" + profileName + ".json");
  let profile = JSON.parse(file);
  profile.name = String(profileName);

  //GET DESIRED RESULT
  let result = resultName == "n" ? "ΑΡΝΗΤΙΚΟ" : resultName == "p" ? "ΘΕΤΙΚΟ" : "ΑΡΝΗΤΙΚΟ"

  //INITIALIZE VARS
  let type = null;
  let schedule = null;

  
  if(scheduleName){
    type = "schedule";
    let file = fs.readFileSync("./config/schedules.json");
    schedule = JSON.parse(file)[scheduleName];
  }
  else if(debugName){
    type = Number.parseInt(debugName);
  }
  else{
    type = "one";
  }

  let test = new Test(profile, type, schedule, result, force, email);
  await test.execute();
}

main();