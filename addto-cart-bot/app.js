const restify = require('restify');
const http = require('http');
const builder = require('botbuilder');
const request = require('request');
const util = require('util');

 
var server = restify.createServer();

server.use(restify.CORS());

//var bot = new builder.BotConnectorBot({ appId: 'qwertyuiopasdfghjklkkk', appSecret: '1c584f6986f84b23adc9bd8e09795d04' });
var bot = new builder.BotConnectorBot({ appId: 'qwertyuiopasdfghjklkkk', appSecret: '1c584f6986f84b23adc9bd8e09795d04' });
bot.add('/', new builder.CommandDialog()
	.matches('^No', builder.DialogAction.beginDialog('/NO'))
	.matches('^Yes', builder.DialogAction.beginDialog('/YES'))	 	
	.onDefault([
		function(session, args, next){
			if(!session.userData.name){
				session.beginDialog('/profile');
			}else{
				next();
			}
		},
		function(session, result){
			session.send('Hello %s ! . Do you want to Buy a Product? (Yes / No) ? ', session.userData.name);
		}
	]));

bot.add('/profile',[
	function(session){
		builder.Prompts.text(session, 'Hi! What is your name?');
	},
	function(session, result){
		session.userData.name = result.response;
		session.endDialog();
	}
]);
bot.add('/NO',[
	function(session){
		session.userData.name = '';
		session.send('Thank You for Visiting !');
		session.endDialog();
	}	 
]);

bot.add('/NOPRODUCT',[
	function(session){
		var str = '**Your product is out of stock !. Please try different Product**' + "\n\n" + session.userData.result ;
		session.beginDialog('/CART', str);
	}	 
]);

bot.add('/YES',[getKeyWord, searchProduct]);
bot.add('/CART',[getProductId, completeCheckout]);
bot.add('/ONEPRODUCT',[submitOneProduct, completeCheckout]);
 

function getKeyWord(session, args) {
	if(!session.userData.keyword){
		builder.Prompts.text(session, 'Enter Category to display products? ( Ex: Camera, Memory Card, Memory etc )');	
	}else{
		builder.Prompts.text(session, 'We did not find products matched with your Category. Please try different Category! \n Enter Category to display products? ( Ex: Camera, Memory Card, Memory etc )');
	}		 
}

function searchProduct(session, results, next) {		
	var that = builder; 			
	if (results.response) {
		session.userData.keyword = results.response;
		request({
			url: 'https://yourserver.com:9002/rest/v1/electronics/products?query='+session.userData.keyword, //URL to hit
		    method: 'GET',
		    "rejectUnauthorized": false, 
		    headers: {
		        'Content-Type': 'application/json'
		   	}}, 
		   	function (error, response, body){
				if(error) {
		        	console.log(error);
		    	} else {			  
		    		var str = '';  		 
		    		var data =  JSON.parse(body);   
		    		var products = data['products'];	
		    		if(products.length > 1){			    		     		 
			    		for(var i=0; i<products.length; i++){		    			 
			    			str  +=   '* ' + '*Product Code* : '+ '**'+products[i].code+'**' + "\n" + '*Product Description* : '+products[i].summary + "\n";					
						}	
						session.userData.result = str + "\n\n" + "**Enter Product Code to Checkout !**"	
						session.userData.keyword = '';			 
						session.beginDialog('/CART', session.userData.result);	
					}else if(products.length == 1){
						session.userData.result == '';
						session.beginDialog('/ONEPRODUCT', results.response);	
					}
					else{
						session.beginDialog('/YES');
					}			
					
		    	}	    			    
			}
		);
	}	
}

function getProductId(session, args, next){	 	 
	 builder.Prompts.text(session, args);	 
}
function completeCheckout(session, results, next){
	if(results.response){
			session.userData.productCode = results.response;
			request({
				url: 'http://yourserver.com:9001/rest/v1/electronics/cart/entry?code='+session.userData.productCode, //URL to hit
			    method: 'POST',
			    "rejectUnauthorized": false, 
			    headers: {
			        'Content-Type': 'application/json'
			   	}
				}, function(error, response, body){
					if(error) {
			        	console.log(error);
			    	} else {			  
			    		var str = '';  		 
			    		var data =  JSON.parse(body);	 
	 		    		if(data.statusCode === 'success'){
	 		    			var cartID = data.cartCode;
	 		    			session.userData.productCode = '';
	 		    			session.userData.result = '';
	 		    			session.userData.keyword = '';
	 		    			session.endDialog('To Complete Checkout : ' + '[Click Here](https://yourserver.com:9002/yacceleratorstorefront/electronics/en/tacheckout/?site=electronics&code='+ cartID + ')');   		 	 
	   							
	   					}else{
	   						session.beginDialog('/NOPRODUCT');
	   					}
			    	}		    	 
				}		
			);		
		}	
}

function submitOneProduct(session, args, next){
	console.log('productNumber' + args);
	next(
		{ response: args }
	)
}
 
server.post('https://8f061c3e.ngrok.io/api/messages', bot.verifyBotFramework(), bot.listen());
server.listen(process.env.port || 8080 , function () {
    console.log('%s listening to %s', server.name, server.url); 
});