
var Botkit = require("botkit");
var express = require("express");

var token = process.env["SLACK_BOT_TOKEN"];
if (!token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({ debug : true });
var bot = controller.spawn({ token : token }).startRTM();


var reminderTimers = {};
controller.hears([/remind (.+) to (.+) in (\d+) (hours|minutes)/], ['direct_message', 'direct_mention', 'mention'], function(bot, message) {
	var secondsToReminder = Number(message.match[3]) * 60;
	if (message.match[4] == "hours") secondsToReminder = secondsToReminder * 60;
	
	console.log("adding a reminder to:" + message.match[1] + " in:" + secondsToReminder + " seconds with text:" + message.match[2]);
	bot.reply(message, "Sure. Added a reminder to:" + message.match[1]);
	var reminderTimer = setTimeout($ => {
		delete reminderTimers[reminderTimer];
		bot.api.users.list({}, (err, usersList) => {
			if (!usersList) return console.log("error fetching users:" + err);
			
			var member = usersList.members.find(member => member.name == message.match[1]);
			if (!member) return console.log("error find member:" + message.match[1]);
			
			console.log("reminding to:" + member.id);
			bot.say({ text : message.match[2], channel : "@" + member.name });
		});
	}, secondsToReminder * 1000);
	reminderTimers[reminderTimer] = { message : message, bot : bot };
	//bot.api.callAPI("reminders.add", { text : message.match[2], time : secondsToReminder, user : message.match[1] });
	
});

controller.on('message_received', function(bot, message) {
	console.log("message_received:" + message.text + " keys:" + Object.keys(message) + " proto:" + Object.keys(message.__proto__ || {}) + " type:" + message.type);
	if (message.text == "kuku") bot.reply(message, "you said kuku");
});

controller.on('direct_message',function(bot,message) {
  console.log("message_received2:" + message.text + " keys:" + Object.keys(message) + " proto:" + Object.keys(message.__proto__ || {}) + " type:" + message.type);
  bot.reply(message,'You are talking directly to me');
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

// hack to prevent heroku idle
var http = require("http");
setInterval(function() {
    http.get("http://customslackbot.herokuapp.com");
}, 120000); // every 5 minutes (300000)
