const crypto = require('crypto'); 
const restify = require('restify');
const skype = require('skype-sdk');
const builder = require('botbuilder');
 

//var privateKey = fs.readFileSync('/etc/httpd/ssl/pem/key.pem').toString();
//var certificate = fs.readFileSync('/etc/httpd/ssl/pem/cert.pem').toString();

 

//var credentials = crypto.createCredentials({key: privateKey, cert: certificate});

var obj = {
	'Google' : 'www.google.com',
	'WikiPedia'  : 'https://en.wikipedia.org/wiki/Main_Page',
	'GitHub'  : 'https://github.com/',
	'Bing'	: 'https://www.bing.com/',
}

// Initialize the BotService
const botService = new skype.BotService({
    messaging: {
        botId: '28:<bot’s id="">',
        serverUrl : "https://apis.skype.com",
        requestTimeout : 15000,
        appId: 'df947348-8858-4b02-9988-45dc20c2f345',
        appSecret: 'qetGxP2Vy7y9yhQgNWOfz3p'
    }
});

 

// Create bot and add dialogs
var bot = new builder.SkypeBot(botService);
bot.add('/', new builder.CommandDialog()
	.matches('^Google', builder.DialogAction.beginDialog('/Google'))
	.matches('^WikiPedia', builder.DialogAction.beginDialog('/WikiPedia'))
	.matches('^GitHub', builder.DialogAction.beginDialog('/GitHub'))
	.matches('^Bing', builder.DialogAction.beginDialog('/Bing'))	 	
    .matches('^quit', builder.DialogAction.endDialog())
	.onDefault([
		function(session, args, next){
			if(!session.userData.name){
				session.beginDialog('/profile');
			}else{
				next();
			}
		},
		function(session, result){
			session.send('Hello %s! Which URL You want Google, Bing, GitHub, Wikipedia ? ', session.userData.name);
		}
	]));

bot.add('/profile',[
	function(session){
		builder.Prompts.text(session, 'Hello! I am a Bot. What is your name?');
	},
	function(session, result){
		session.userData.name = result.response;
		session.endDialog();
	}
]);
bot.add('/Google',[
	function(session){
		session.send('Click Here: %s', obj['Google']);
		session.endDialog();
	}	 
]);
bot.add('/WikiPedia',[
	function(session){
		session.send('Click Here: %s', obj['WikiPedia']);
		session.endDialog();
	}	 
]);
bot.add('/GitHub',[
	function(session){
		session.send('Click Here: %s', obj['GitHub']);
		session.endDialog();
	}	 
]);
bot.add('/Bing',[
	function(session){
		session.send('Click Here: %s', obj['Bing']);
		session.endDialog();
	}	 
]);
 

// Setup Restify Server
const server = restify.createServer();
server.post('https://74c09d8a.ngrok.io/v1/chat', skype.messagingHandler(botService));
server.listen(process.env.PORT || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});