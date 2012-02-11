var 	bb 	= require('./binarybeast'),
	step	= require('step')

bb = new bb('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');

/**
 * Create a tournament
 */
var tourney_id;
var url;
var args = {
	title: 		'Node.js Test!',
	elimination:    bb.ELIMINATION_DOUBLE,
	type_id:	bb.TOURNEY_TYPE_CUP,
	game_code:	'QL',
	description:	'Testing the new BB API Node.js Modules package!',
	location:	'V8 LULZ'
};
bb.tournament.create(args, function(result) {
	if(result.result != 200) {
		console.error(result);
		process.exit(1);
	}
	
	tourney_id 	= result.tourney_id;
	url 	  	= result.url;

	console.info('Tourney ' + tourney_id + ' created successfully! (' + url + ')');
});
