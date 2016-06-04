
var Botkit = require("botkit");

var token = process.env["SLACK_BOT_TOKEN"];
if (!token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var controller = Botkit.slackbot({});

var bot = controller.spawn({ token : token }).startRTM();

controller.hears(["remind @(.+) to (.+) in (\d+) (hours|minutes)"], 'direct_message,direct_mention,mention', function(bot, message) {
	var secondsToReminder = message.match[3] * 60;
	if (message.match[4] == "hours") secondsToReminder = secondsToReminder * 60;
	
	console.log("adding a reminder to:" + message.match[1] + " in:" + secondsToReminder + " seconds with text:" + message.match[2]);
	bot.api.callAPI("reminders.add", { text : message.match[2], time : secondsToReminder, user : message.match[1] });
	bot.reply(message, "Sure. Added a reminder to:" + message.match[1]);
});
