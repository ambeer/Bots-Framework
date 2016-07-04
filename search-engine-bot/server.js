const crypto = require('crypto'); 
const restify = require('restify');
const skype = require('skype-sdk');
const builder = require('botbuilder');
const google = require('google');
 

//var privateKey = fs.readFileSync('/etc/httpd/ssl/pem/key.pem').toString();
//var certificate = fs.readFileSync('/etc/httpd/ssl/pem/cert.pem').toString();

 

//var credentials = crypto.createCredentials({key: privateKey, cert: certificate});

// Initialize the BotService
const botService = new skype.BotService({
    messaging: {
        botId: '28:<bot’s id="">',
        serverUrl : "https://apis.skype.com",
        requestTimeout : 15000,
        appId: '00df4c9e-f770-4980-a506-d31316912555',
        appSecret: 'FBD7B18F22A993DA4541DECE9098245D10D0B1B8'
    }
});

 

// Create bot and add dialogs
//var bot = new builder.SkypeBot(botService);
var bot = new builder.BotConnectorBot();
bot.add('/', [ 
		function(session, args, next){
			if(!session.userData.name){
				session.beginDialog('/profile');
			}else{
				next();
			}
		},
		function(session, result){
			//session.send('Hello %s! ', session.userData.name);
			session.beginDialog('/search');
		}
	]);

bot.add('/profile',[
	function(session){
		builder.Prompts.text(session, 'Hello! I am a Bot. What is your name?');
	},
	function(session, result){
		session.userData.name = result.response;
		session.endDialog();
	}
]);
bot.add('/search',[
	function(session, args, next){
		if(!session.userData.keyword){
			 session.beginDialog('/userinput')
		}else{
			next();		 
		}
	}, 
	function(session, result){
		//session.userData.keyword = result.response;
		var keyword = session.userData.keyword;
		google.resultsPerPage = 10;
		var nextCounter = 0;	 
		var output = '';
		google(keyword, function (err, res){

		  if (err) console.error(err)
		 
		  for (var i = 0; i < res.links.length; ++i) {
		    var link = res.links[i];
		    output += link.href + "\n";
		  }
  		  session.userData.keyword = '';
   	      session.endDialog(output);
		
		});
	}	
		
]);
 
 bot.add('/userinput', [
 	function(session, args, next){
 		builder.Prompts.text(session, 'Enter key word to search in google.com');
 	},
 	function(session, result){
 		session.userData.keyword = result.response;
 		session.endDialog();
 	}
 ]);

// Setup Restify Server
/*const server = restify.createServer();
server.post('/v1/chat', skype.messagingHandler(botService));
server.listen(process.env.PORT || 8080, function () {
   console.log('%s listening to %s', server.name, server.url); 
});*/
var server = restify.createServer();
server.use(bot.verifyBotFramework({ appId: '00df4c9e-f770-4980-a506-d31316912555', appSecret: 'FBD7B18F22A993DA4541DECE9098245D10D0B1B8' }));
server.post('/v1/chat', bot.listen());

server.listen(8080, function () {
    console.log('%s listening to %s', server.name, server.url); 
})
 