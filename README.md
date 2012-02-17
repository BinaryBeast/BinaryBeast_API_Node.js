# BinaryBeast Node.js Modules v0.1.3
### <http://binarybeast.com/api/info>

These `modules` were written to ease development requirements for integrating the `binarybeast.com` API into your Node.js application




## Installation

First of all... install the binarybeast package

	npm install binarybeast


There is an example.js file in the repository with a full tutorial and sample application, but we'll cover the basics here, and list the available functions / parameters

	var bb = require('binarybeast');
	
The module's `index.js` returns a class, which must be instantiated, and the constructor accepts 1 argument: your api key

	bb = new bb('your_api_key');


You can find your api_key from your user settings at binarybeast.com <http://binarybeast.com/user/settings/api>

Another useful page to note is the API History page in your user settings.  It lists your recent API requests, with anything posted, and exactly how it responded
<http://binarybeast.com/user/settings/api_history>


## Callbacks

When you make a service call, you have the option of providing a `callback` function... your callback should accept one arguments, which will be a json decoded response from BinaryBeast

`result` will always be included in the returned object, and you can look at the value to see if your service call was successful.  Generally the result codes roughly resemble `http status codes`

For example... `200` means the call was succesful, `403` means you're trying to someting you're not allowed to do... `404` means your service name was invalid.. and there are others



## Example: List your tournaments

In this example.. we'll load a list of tournaments associated with our account, and iterate through them

	//We can provide JUST a callback, or an array of arguments and then a callback
	//In our example, we're going to use options to make sure that bb doees NOT return any of our tournaments that we marked as private
	//also in our example... we only want tournaments with the word 'LAN' in the title
	bb.tournament.list({
		filter: 	'LAN',
		private:	false
	}, function(response) {
		if(response.result != 200) {
			console.error(response);
		} else for(var x in response.list) {
			//console.log(response.list) to see the entire object obviously, there is a lot of information available about each tournamet
			console.log(response.list[x].title);
		}
	});


## tournament.js module functions

Examples assume you've called your instantiated main binarybeast class var bb;
Let's list of the available functions

### bb.tournament.create(options, callback)

as the name signifies... create a new tournament

`callback(result)` see result.tourney_id

Available options:

    string `title`

    string `description`

    int    `public`

    string `game_code`            (SC2, BW, QL examples, @see http://wiki.binarybeast.com/index.php?title=API_PHP:_game_search, you can also use our game service wrappers to search (bb.game.search(filter,callback);)

    int    `type_id`              (0 = elimination brackets, 1 = group rounds to elimination brackets, you can use constants for this (bb.BRACKET_CUP for example means round-robin)

    int    `elimination`          (1 = single, 2 = double, again we have constants for this (bb.ELIMINATION_DOUBLE for example)

    int    `max_teams`

    int    `team_mode`            (id est 1 = 1v1, 2 = 2v2)

    int    `group_count`

    int    `teams_from_group`

    date   `date_start`

    string `location`

    array  `teams`                You have the option to automatically add players/teams, just pass an array of player/team names

    int    `return_data`          (0 = TourneyID and URL only, 1 = List of team id's inserted (from teams array), 
2 = team id's and full tourney info dump)

### bb.tournament.rm(tourney_id `[, callback]`)

Delete a tournament

### bb.tournament.update(tourney_id, options `, callback`)

See bb.tournament.create for a list of options

### bb.tournament.roundUpdate(tourney_id, bracket, round, best\_of map, date `[, callback]`)

Change the format of a round within a tournament (best of, map, and date)

param tourney_id

param bracket	which bracket the round effects - ie 0 = groups, 1 = winners (there are class constants for these values (ie bb.BRACKET_WINNERS, bb.BRACKET_BRONZE)

param round		0 = first round

param best_of

param map

param date		Just a string, no strict format is required


### bb.tournament.roundUpdateBatch(tourney_id, bracket, best\_ofs, maps, dates `[, callback]`)

Does the same thing as bb.tournament.roundUpdate, but update for for all reounds within a bracket with a single call

Just compile an array for best\_ofs, maps, and dates.. indexed by round

The following says that in the bottom bracket... round 1+2 = BO1, round 3 = BO3, and Round 4 = BO5,
Round 1 = Tal'Darim Altar, Round 2 = the shattered temple.. etc


    var best_ofs 	= [1, 1, 3, 5];
    var maps	= ["Tal'Darim Altar", 'The Shattered Temple', "Xel'Naga Caverns", 'Metalapolis'];
    var dates	= ['2012-02-11 07:10', 'never', 'nevar!', '5th Sep 2012'];

    bb.tournament.roundUpdateBatch(tourney_id, bb.BRACKET_LOSERS, best_ofs, maps, dates);


### bb.tournament.start(tourney_id `[, seeding [, teams [, callback]]]`)

Start a tournament!

For seeding, you have the following options:
  bb.SEEDING_RANDOM   ('random') - this will result in completely random starting matches
  
  bb.SEEDING_SPORTS   ('sports') - this must be used in addition to an array of teams, in order of rank.. it uses a traditional sports seeidng algorithm (in a 32 man.. 1v32, 2v21, 8v9 etc)

  bb.SEEDING_BALANCED ('balanced') - BinaryBeast in-house algorithm that tries to keep a more balanced offset between matches (in a 32 man, 1v9, 2v10, 3v11 etc)

  bb.SEEDING_MANUAL   ('manua') - Your array of teams will directly refer to the order of teams in the brackets

### bb.tournament.getOpenMatches(tourney_id, callback)

Retrieves a list of matches that currently have 2 players that need to play

### bb.tournament.load(tourney_id, callback)

Load details obout a tournament

### bb.tournament.loadRoundFormat(tourney_id, callback)

Load round format (BO, Maps, etc)



## team.js module functions

Examples assume you've called your instantiated main BinaryBeast class var bb

Here's a list of available functions in the team module

### bb.team.insert(tourney_id, display_name `[, options [, callback]]`)

Add a player / team to your tournament

Available options:
  
  string `country_code`		(ISO 3 character codes, you can use bb.country.search to find them too, or check wikipedia)

  int    `status`               	(0 = unconfirmed, 1 = confirmed, -1 = banned)

  string notes                	Notes on the team - this can also be used possibly to store a team's remote userid for your own website

  array  `players`              	If the TeamMode is > 1, you can provide an array of players to add

  string `network_name`		If the game you've chosen for the tournament has a network configured (like sc2 = bnet 2, sc2eu = bnet europe), you can provide their in-game name here

### bb.team.update(tourney_team_id, options `[, callback]`)

Update a team's settings

For a list of available options, please refer to bb.team.insert


### bb.team.confirm(tourney_team_id `[, tourney_id [, callback]]`)

Confirm a team's status

Please note that while bb.team.insert `automatically confirms` unless you otherwise specify `status:0`

The reason tourney_id is optional, is that you can actually pass the string '*' for tourney_team_id, and it will confirm all players in your tournament, but in order for that to work you need to provide the tourney_id


### bb.team.unconfirm(tourney_team_id `[, callback]`)

Unconfirm a player's status


### bb.team.rm(tourney_team_id `[, callback]`)

Delete a player/team


### bb.team.ban(tourney_team_id `[, callback]`)

Set a team's status to -1, banning him - he will not be able to confirm, report, or rejoin


### bb.team.reportWin(tourney_id, tourney_team_id [,o_tourney_team_id [, options [, callback]]]) 

Report a match

tourney_team_id indicates the winner

You do not have to provide a o_tourney_team_id (loser), in fact it is even ignored for brackets stage

Its available as a parameter in order to allow you to report group round matches out of order

Available Options: 

  string `score`		The winner's score

  string `o_score`		The loser's score

  string `replay`		A URL to the replay_pack for this match

  string `map`  	    The first map played (this will change later, as it doesn't currently support reporting a series of games from this service)

  string `notes`		An optional description of the match

  boolean `force`		You can pass in true for this parameter, to force advancing the team even if he has no opponent (it would have thrown an error otherwise)


### bb.team.getOpponent(tourney_team_id, callback)

Retrieve the current opponent of a team

Note: All this method will give you is the tourney_team_id of the opponent, if you need more information, use bb.team.load(tourney_team_id)

Evaluating the returned o_tourney_team_id will tell you what status of the requested team:

  `o_tourney_team_id = -1` => The team has already been eliminated (see the returned 'victor' object to see who eliminated him

  `o_tourney_team_id = 0`  => The team is currently waiting on an opponent


### bb.team.load(tourney_team_id, callback)

Simply returns information about the requested team

## match.js module functions


### bb.match.saveDetails(tourney_match_id, `array` winners, `array` scores, `array` o_scores, `array` maps, callback

Save deatils of a match (individual game scores, maps, etc)

Note: the `scores` array should indicate the score of each game for the overall match winner

for example, look at the following array:

    var scores = [17, 3, 37, 1009];

This tells us that the player that won the entire match, got a 17 in the first game, a 3 in game 2, 37 in match 3, and so forth

Same goes for o_scores, but it applies to the overall loser of the match


### bb.match.load(tourney_match_id, callback)

Load details of a match

### bb.match.stream(tourney_id)

BinaryBeast keeps track of matches that you've been sent with this service, so you can theoretically
use it to stream match results, if you use in conjuction with say.. an interval (see `examples/match_stream.js`)

## game.js module functions

List functions in the game.js module


### bb.game.search(filter, callback)

Search through our list of games

This is an important function to note because when creating touranments, you need to know
our `game_code` format if you want to specify a game


### bb.game.listTop([limit], callback)

Returns a list of currently most popular games



## country.js module functions

List functions defined in the country.js module


### bb.country.search(filter, callback)

For your convenience, we've opened our database of ISO country codes for you to search through

When inserting teams, you can refer to our list of country_code (ISO3) for defining the player / team's flag