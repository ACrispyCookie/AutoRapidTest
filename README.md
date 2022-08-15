# AutoRapidTest
A script that posts a self-test for COVID-19 on Greece's COVID-19 website.

Features included:
- Multiple profiles
- Schedule tests
- Email on completion

## Installation
### Windows
- Download and install [Node.js](https://nodejs.org/en/download/)
- Download and install [Git](https://git-scm.com/download/win)
- Go to a desired folder, open `cmd` and type the following commands:
```
> git clone https://github.com/ACrispyCookie/AutoRapidTest.git
> cd AutoRapidTest
> npm i
> start .
```
- Setup [profiles](https://github.com/ACrispyCookie/AutoRapidTest#profiles)
- Setup [schedules](https://github.com/ACrispyCookie/AutoRapidTest#schedules) (Optional)
- Go back to your terminal and run the [start command](https://github.com/ACrispyCookie/AutoRapidTest#start)

### Linux
```
$ sudo apt install nodejs
$ sudo apt install git
$ git clone https://github.com/ACrispyCookie/AutoRapidTest.git
$ cd AutoRapidTest
$ npm i
```
- Setup [profiles](https://github.com/ACrispyCookie/AutoRapidTest#profiles)
- Setup [schedules](https://github.com/ACrispyCookie/AutoRapidTest#schedules) (Optional)
- Go back to your terminal and run the [start command](https://github.com/ACrispyCookie/AutoRapidTest#start)

## Profiles
To setup your profiles on the `config` folder go into the `profiles` folder and create a new `.json` file with your desired name. Copy the `default.json` file into the new one and edit every element. 

An example of a profile file:
```javascript
{
  "email": "default@example.com", //This email will be used to send out copies of tests.
  "username": "defaultUser", //Your TAXISNET username
  "password": "defaultPassword", //Your TAXISNET password
  "test": {
    "firstname": "First", //Your first name exactly as it's registered on gov.gr
    "lastname": "Last", //Your last name exactly as it's registered on gov.gr
    "dob-day": "1", //Day of birth
    "dob-month": "1", //Month of birth
    "dob-year": "1970", //Year of birth
    "amka": "12345678901", //Your AMKA
    "buttons": { 
      "Περιφέρεια": "region", 
      "Περιφερειακή Ενότητα": "location",
      "Δήμος": "municipality",
      "Κατηγορία": "lyceum",
      "Τύπος": "Ημερήσιο Γενικό Λύκειο",
      "Σχολείο": "ΣΧΟΛΕΙΟ/0123456"
    }
  }
}
```
To correctly fill the `buttons` values take a look [here]()

## Schedules
To setup schedules on the `config` folder open the `schedules.json` file and add a new object with your desired name as shown below:

An example of a `schedules.json` file:
```javascript
{
    "default": { //The name of your schedule
        "cron": "0 30 20 * * SUN,WED" //A cron expression for your schedule
    }
}
```
Get a correct cron expression [here](https://crontab.cronhub.io/)

## Start
To start the script open a terminal inside the project folder (`AutoRapidTest`) and run the following command:
```
$ npm run main -- <profile>

Options:
  -s [shedule-name]      Schedule the script with the give cron expression.     
  -r [result]            Specify the test result (n=negative, p=positive).
  -d [times]             Run the script on debug mode and specify the times to post a test.
  -f                     Force a positive test without a warning.
  -e                     Send an email on completion.
```
