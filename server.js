var express = require('express');
var fs = require('fs');
var file = fs.readFileSync('value.txt', "utf8");
var request = require('request');
var cheerio = require('cheerio');
var https = require('http');
//This is the starting URL to use to begin accessing accounts
var baseUrl = 'https://www.bungie.net/en/Profile/254/';

var mysql = require('mysql');
var n = 0;
var ammountScrape = 1000;

function scrapePlayer(id, _callback)
{
	url = baseUrl + id;
	playerUrl = '';
	var o = { $: "", html : "", error: "", response : "", data : "", a_href : "", playerUrl : "", regex : "", result : ""};
	

		//Begin to find the playerInventory URL that we want
		request(url, function(error, response, html){				
			if(!error)
			{	
				
				$ = cheerio.load(html);
				$('.characterList').filter(function(){
					console.log(n);
					n += 1;
					data = $(this);
					a_href = data.children().first().attr('href');
					playerUrl = "https://www.bungie.net" + a_href;
					request(playerUrl, function(error, response, html){

						//Error protection
						displayName = "";
						if(!error)
						{
							//Use Cheerio library to load the html
							$ = cheerio.load(html);

							//Define the variables that we wish to capture, which are primary, secondary, and heavy weapons
							regex = /var DEFS = \$\.extend\(\{\}, DEFS, \{\}\);\r\n\tDEFS\.items = \$\.extend\(\{\}, DEFS\.items, (.*)\);/;
							result = JSON.parse(regex.exec($.html())[1]);

							//Filter through the gathered data and find the display name
							$('.displayName').filter(function(){
								displayNameHTMLData = $(this);
								displayName = displayNameHTMLData.text();
								
							})
							
							connection.query("INSERT INTO players (userName) VALUES (?)", displayName, function(err)
								{
									if(err){
										return;
									}

								});

							console.log(displayName);
							//Look for the parts of the JSON file that are inventory items I care about
							for (var itemId in result)
							{
								switch(result[itemId].bucketTypeHash)
								{

									//Primary Weapon
									case 1498876634:
										connection.query("UPDATE players SET primaryWeapon=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;

									//Secondary Weapon
									case 2465295065:
										connection.query("UPDATE players SET secondaryWeapon=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;

									//Heavy Weapon
									case 953998645:
										connection.query("UPDATE players SET heavyWeapon=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;

									//Helmet
									case 3448274439:
										connection.query("UPDATE players SET helmet=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;

									//chest armor
									case 14239492:
										connection.query("UPDATE players SET chestArmor=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;

									//leg armor
									case 20886954:
										connection.query("UPDATE players SET legArmor=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;

									//gauntlets
									case 3551918588:
										connection.query("UPDATE players SET gauntlets=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;

									//vehicle
									case 2025709351:
										connection.query("UPDATE players SET vehicle=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;	

									//armorShader
									case 2973005342:
										connection.query("UPDATE players SET armorShader=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;	

									//ghost Shell
									case 4023194814:
										connection.query("UPDATE players SET ghostShell=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;	

									//emblem
									case 4274335291:
										connection.query("UPDATE players SET emblem=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;	

									//ship
									case 284967655:
										connection.query("UPDATE players SET ship=(?) WHERE userName=(?)", [result[itemId].itemName, displayName] ); 
										break;	

									default:
									break;

								}

							}
							return _callback(o);
						}	
							
					})
				})
				
			}
			
			
			
		})
}


function main()
{
	
	//connection.query("CREATE TABLE IF NOT EXISTS players (userName VARCHAR(50) PRIMARY KEY, primaryWeapon VARCHAR(50), secondaryWeapon VARCHAR(50), heavyWeapon VARCHAR(50), helmet VARCHAR(50), gauntlets VARCHAR(50), chestArmor VARCHAR(50), legArmor VARCHAR(50), ship VARCHAR(50), vehicle VARCHAR(50), ghostShell VARCHAR(50), emblem VARCHAR(50), armorShader VARCHAR(50))");

	startVal = parseInt(file);
	if(startVal + ammountScrape <= 9000000)
	{
		fs.writeFile("value.txt", startVal + ammountScrape, function(err){
			return;
		});
	}
	else
	{
		fs.writeFile("value.txt", 0, function(err){
			return;
		});	
	}

	for(var i = startVal; i < startVal + ammountScrape + 1; i++)
	{
		//var o = { $: "", html : "", error: "", response : "", data : "", a_href : "", playerUrl : "", regex : "", result : ""};
		scrapePlayer(i, function(o){
			delete o.$;
			delete o.html;
			delete o.error;
			delete o.response;
			delete o.data;
			delete o.a_href;
			delete o.playerUrl;
			delete o.regex;
			delete o.result;
			n -= 1;
			if(n == 0)
			{
				console.log("Finished execution!")
				process.exit();
			}		
		});
	}	
}

var connection = mysql.createConnection({
	host	 : '',
	user  	 : '',
	password : '',
	database : ''
})

main();


