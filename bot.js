
var Botkit = require("botkit");
var express = require("express");

var token = process.env["SLACK_BOT_TOKEN"];
if (!token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({ debug : true });
var bot = controller.spawn({ token : token }).startRTM();

controller.hears(["remind @(.+) to (.+) in (\d+) (hours|minutes)"], 'direct_message,direct_mention,mention', function(bot, message) {
	var secondsToReminder = message.match[3] * 60;
	if (message.match[4] == "hours") secondsToReminder = secondsToReminder * 60;
	
	console.log("adding a reminder to:" + message.match[1] + " in:" + secondsToReminder + " seconds with text:" + message.match[2]);
	bot.api.callAPI("reminders.add", { text : message.match[2], time : secondsToReminder, user : message.match[1] });
	bot.reply(message, "Sure. Added a reminder to:" + message.match[1]);
});

// hack so heroku won't kill us because we don't add a listener on the port in 60 seconds
var app = express();
app.get("/", function(req, res) {
	res.send("good");
});

var listenPort = process.env.PORT || 3000;
app.listen(listenPort, function () {
	console.log('Example app listening on port ' + listenPort);
});
