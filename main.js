const fs = require("fs");
const { argv } = require("process");
const Test = require("./src/test.js");

async function main(){
  //GET PROFILE
  let profileArg = argv[2];
  let file = fs.readFileSync("./resources/" + profileArg);
  let profile = JSON.parse(file);

  //GET TEST TYPE
  let typeArg = (argv[3]) ? argv[3].substring(1) : "";
  let type = "one";
  if(typeArg == "s"){
    type = "schedule";
  }
  else if(Number.isInteger(Number.parseInt(typeArg)) && Number.parseInt(typeArg) > 1){
    type = typeArg;
  }

  //GET DESIRED RESULT
  let resultArg = argv[4];
  let result = "ΑΡΝΗΤΙΚΟ";
  if (resultArg) {
    result = (resultArg == "p" ? "ΘΕΤΙΚΟ" : "ΑΡΝΗΤΙΚΟ");
  }

  let test = new Test(profile, type, result);
  await test.execute();

}

main();