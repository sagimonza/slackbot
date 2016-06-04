
var Botkit = require("./lib/Botkit.js");

var token = "";
var controller = Botkit.slackbot({});

var bot = controller.spawn({ token : token }).startRTM();
var slackWeb = (require("./lib/Slack_web_api.js"))(bot, { token : token });

controller.hears(["remind @(.+) to (.+) in (\d+) (hours|minutes)"], 'direct_message,direct_mention,mention', function(bot, message) {
	var secondsToReminder = message.match[3] * 60;
	if (message.match[4] == "hours") secondsToReminder = secondsToReminder * 60;
	
	console.log("adding a reminder to:" + message.match[1] + " in:" + secondsToReminder " seconds with text:" + message.match[2]);
	slackWeb.callAPI("reminders.add", { text : message.match[2], time : secondsToReminder, user : message.match[1] });
});
