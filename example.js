var 	bb 	= require('binarybeast'),
	step	= require('step')

/**
 * This is a perfectly valid API key for a test account
 * Feel free to use it, but you'll obviously need to change it before
 * promoting to a production environment, as everyone has access to it
 */
bb = new bb('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');

/**
 * Create a tournament
 */
var tourney_id;
var url;

//Remember teams / team_ids
var teams = {'Player_0': 0, 'Player_1': 0, 'Player_0b01': 0, 'Player_0b11': 0, 'Player_0x000004': 0, 'hacker':0};

//Remember the first successful match look so we can move on and test the match reporting
var match = [];

/**
 * let's avoid the madness of nested nested nested brackets, and use step
 * 
 * It's just a way of stepping through a series of steps just like it sounds, it's pretty cool
 * each step can either be a stand alone step invoked by this(); or it can act as a callback for a service call etc from th eprevious step
 *
 * First step... is to create a tournament
 */
step(
	/**
 	 * First step - create a tournament
	 * basic settings.. double elim, brackets only (no round robin), StarCraft 2
	 */
	function() {
		var args = {
			title: 		'Node.js Test!',
			elimination:    bb.ELIMINATION_DOUBLE,
			type_id:	bb.TOURNEY_TYPE_BRACKETS,
			//game_code:	'QL',
			game_code:	'SC2',
			description:	'Testing the new BB API Node.js Modules package!',
			location:	'V8 LULZ',
			team_mode:	1,
			max_teams: 	8
		};
		bb.tournament.create(args, this);
	},

	/**
	 * Handle the response from BinaryBeast after requesting to create a new tournament
	 * If all goes well, we'll get a result of 200
	 * in which case we take note of the tourney_id
	 *
 	 * The next step / example is to setup the round format ( BO/Maps )
	 */
	function(result) {
		if(result.result != 200) {
			console.error(result);
			process.exit(1);
		}

		tourney_id      = result.tourney_id;
		url             = result.url;

		console.info('Tourney ' + tourney_id + ' created successfully! (' + url + ')');
		console.info('---');

		//just to seperate things, let's "step" into the next function, which will setup round format
		this();
	},

	/**
 	 *
 	 * Setup round format ( BO, Maps, Dates )
	 *
 	 */
	function() {

		//Not even going to provide a callback honestly, we don't need anything back
		//Not that it's recommended pracitce, but I'll assume it works, we'll check the page
		//After we're done and verify

		//So basically what we're doing is here making 3 seperate calls to setup the format
		//for the first 3 rounds in the winners bracket
		//After this example, I'll show you a more effecient way of doing it
		bb.tournament.roundUpdate(tourney_id, bb.BRACKET_WINNERS, 0, 1, 'Shakuras Plateau');
		bb.tournament.roundUpdate(tourney_id, bb.BRACKET_WINNERS, 1, 3, 'Metalopolis');
		bb.tournament.roundUpdate(tourney_id, bb.BRACKET_WINNERS, 2, 5, "Xel'Naga Caverns");

		/**
 		 * Ok that's one way to do it.. let's look at the batch update services
		 * They allow us to update all rounds within a single bracket
		 */
		
		//First, we compile the arrays, each array is indexed in order of round
		//So here we're say round 1+2 = BO1, round 3 = BO3, and Round 4 = BO5
		//Round 1 = Tal'Darim Altar, Round 2 = the shattered temple.. etc
		var best_ofs 	= [1, 1, 3, 5];
		var maps	= ["Tal'Darim Altar", 'The Shattered Temple', "Xel'Naga Caverns", 'Metalapolis'];
		var dates	= ['2012-02-11 07:10', 'never', 'nevar!', '5th Sep 2012'];

		//Again, not even going to bother with the callback, it'll work for sure :)
		bb.tournament.roundUpdateBatch(tourney_id, bb.BRACKET_LOSERS, best_ofs, maps, dates);

                console.info('Round format updated successfully');
                console.info('---');

		//Let's move on, and start adding teams
		this();
	},

	/**
	 *
	 * Add some players (not teams, since we setup team_mode to 1, indicating 1v1
	 *
	 */
	function() {

                //Once all players are added, we'll invoke the next step
                var inserted = 0;
                var teamsCount = Object.keys(teams).length;
                
                //So we can invoke the next step from within the callback
                var stepper = this;

		for(var display_name in teams) addPlayer(display_name);
		function addPlayer(display_name) {
                    
			bb.team.insert(tourney_id, display_name, {
				country_code:	'NOR',	//From norway
				status:		1       //Auto-confirm
			}, function(result) {
                            
				console.info('Player ' + display_name + ' inserted successfully!'
					+ ' (id: ' + result.tourney_team_id + ')'
				);
    
                                //Remember this team's tourney_team_id
				teams[display_name] = result.tourney_team_id;

                                //all players inserted, move on
                                inserted++;
                                if(inserted >= teamsCount) stepper();
			});
		}
	},

	/**
	 * Player status / check-in system
	 */
	function() {
		//First of all, let's start by adding a player that is NOT automatically confirmed
		//Unless status is defined in options, with a value of 0, players added
		//through the API are automatically confirmed
		//So now, let's add one that is NOT automatically confirmed
		teams['confirmationPlayer'] = 0;

                //So we can step forward from within the callback
                var stepper = this;

		bb.team.insert(tourney_id, 'confirmationPlayer', {
			country_code: 	'GBR',	//UK
			status: 	0	//NOT auto-confirmed
		}, function(result) {

			console.info('Player confirmationPlayer inserted successfully!'
				+ ' (id: ' + result.tourney_team_id + ')'
			);
			teams['confirmationPlayer'] = result.tourney_team_id;

			/**
			 * Great, now all we need to do in order to confirm him is bb.team.confirm
			 */
			bb.team.confirm(result.tourney_team_id, stepper);
		});
	},

	/**
	 * Ban a player
	 */
	function(result) {

                console.log('---');
            
                //For stepping within the nested callback
                var stepper = this;

                //Make the call.
		bb.team.ban(teams.hacker, function(result) {
                    
                        if(result.result != 200) {
                            console.error('Error banning hacker!');
                            console.log(result);
                            process.exit(1);
                        }
                
			console.log('Hacker banned successfully!');
			console.log('---');
                        stepper();
		});
	},

	/**
	 * Update a team's setings
	 */
	function() {
		//Let's move binary player 3 to japan
		//Once again, I'm skipping the callback to keep this script a bit cleaner, I'm 100% nothing will go wrong with such a simple call
		//While we're at it, let's update his battle.net character code (network_name)
		bb.team.update(teams['player_0b11'], {
			country_code:			'JPN',
			network_display_name: 		'name.1234'
		});

		//DONE SON! next step.. let's look at how to start a tournament bracket!
		this();
	},

	/**
 	 * RELEASE THE BRACKEN!
	 * errr. GRACKEN
	 * hrmrmmm... start the brackets! 
	 */
	function() {
		/**
		 * The absolute simplest can be done in a single line, I'll show you but comment it out
 		 * this line would result in a randomly seeded bracket, EZ
                 * 
                 * But we're not using it, it's too simple, I want to show you how to use the more advanced features,
                 * id est: ranked seeding
		 */

                //Very simple / fast way to start the brackets, will result in random positions for each confirmed team
		//bb.tournament.start(tourney_id, callback);

		/**
		 * Let's manually rank our players and use traditional seeding
		 * We'll just refer to teams, which have the team id's keyed by display_name (silly I know but meh)
	 	 */
		var ranks = [
			teams['Player_0'], 	//Top ranked	 - referring to this returns the team_id, which is what bb expects
			teams['Player_1'],	//Second rank, etc
			teams['Player_0b01'],
			teams['Player_0b11'],
			teams['Player_0x000004'],
			teams['confirmationPlayer']
		];
		//From here we just pass the team ranks to the service wrapper, and choose the right seeding
		bb.tournament.start(tourney_id, bb.SEEDING_SPORTS, ranks, this);
	}, 

	/**
	 * Tourney Start callback
	 */
	function(result) {

		//OH NOES!??
		if(result.result != 200) {
			console.error('Error starting the brackets!!');
			console.error(result);
			process.exit(1);
		}

		console.info('Brackets started successfully!!!');
		console.info('---');

		//Next up: determine a player's status / current opponent
		this();
	},

	/**
	 * 
	 * Determining Current Opponents
	 *
	 */
	function() {
		
		console.log('---');

                //For stepping within a nested callback
                var stepper = this;
                
                //Once each team is queried for curren topponent, we'll invoke the next step
                var inserted = 0;
                //minus one for "hacker", which we'll ignore
                var teamsCount = Object.keys(teams).length - 1;

		/**
	  	 * Now obviously you don't want to do it this way.. but this is purely academic
                 * looping through every player to ask for his team is not at all efficient
                 * this is just showing you how to do it
                 * 
                 * In fact.. there's actually a service in bb.tournament called getOpenMatches that you can use
                 * Though that won't help you figure out who's been eliminated, for that you'll want to use bb.team.getOpponent
		 * 
		 * Let's loop through each of our players, and see if he currently has an opponent
		 */
		for(var display_name in teams) {
			//Skip hacker, he's banned anyway, we'd just get an empty opponent team-id anyway
			if(display_name != 'hacker') getOpponent(display_name, teams[display_name]);
		}
		function getOpponent(display_name, tourney_team_id) {
                    
                    
			//Make the call
			bb.team.getOpponent(tourney_team_id, function(result) {
                                
                                /**
                                 *
                                 * o_tourney_team_id -1 indicates that the team was eliminated
                                 * 
                                 * In our example however, this won't happen.. but I'm drawing it here for you to see anyway
                                 * 
                                 */ 
				if(result.o_tourney_team_id == -1) {
					console.error(display_name + ' eliminated!' + result);
				}
				
                                
                                /**
                                 * 
                                 * o_tourney_team_id 0 indicates the team currently has no opponent top lay, he's
                                 * waiting on another match to finish
                                 *
                                 */
				else if(result.o_tourney_team_id == 0) {
					console.error(display_name + ' had a freewin and is waiting on a match');
				}

                                /**
                                 * 
                                 * o_tourney_team_id > 0 indicates that we've found an opponent!
                                 * 
                                 * We found an opponent for this player!
                                 *
                                 */
				else if(result.o_tourney_team_id) {
					console.log(display_name + ' vs ' + getTeamName(result.o_tourney_team_id));
					
					//The fist match we find, we'll invoke the next step, which is to 
					//report a win
					if(match.length == 0) {
						match = [tourney_team_id, result.o_tourney_team_id];
					}
				}
                                
                                //all players inserted, move on
                                inserted++;
                                if(inserted >= teamsCount) stepper();
			});

			//Quick display_name lookup
			function getTeamName(tourney_team_id) {
				for(var x in teams) {
					if(teams[x] == tourney_team_id) return x;
				}
				return null;
			}
		}
	},

	/**
         *
	 * Report a match!
         * 
	 */
	function() {
		//At this point we should have 2 teams in var match[]
		//Whoever happens to be first, we'll give the win to him
		//It's fairly straight forward really, not much to it
		//We'll add a few options to spice it up
		bb.team.reportWin(tourney_id, match[0], match[1], {
			'score':		500,		//Pwnt
			'o_score':		-1337           //He built zealots vs carriers, so he's leet * -1
		}, this);
	},


	/**
	 *
	 * Well that's the gist of touranment management...
	 * 
	 * Now let's take a quick look at the game / country search functions
	 *
	 */
	function(result) {
		//Let's just print out the top 3 most popular games at binarybeast right now
		console.log('---');
                
                //Nested callback stepper
                var stepper = this;

		bb.game.listTop(3, function(result) {
			for(var x in result.games) {
				console.log('Game ' + (parseInt(x)+1) + ': ' + result.games[x].game
					+ ' (game_code ' + result.games[x].game_code + ')'
				);
			}

			//Move on to countries
			stepper();
		});
	},

	/**
         *
	 * Let's try a quick country search... and then we'll call it a night
         * 
	 */
	function() {
		//print out a list of countries with the word 'united' in them
		console.log('---');
		bb.country.search('united', function(result) {
			for(var x in result.countries) {
				console.log(result.countries[x].country
					+ ' (' + result.countries[x].country_code + ')'
				);
			}
		});
	}
);