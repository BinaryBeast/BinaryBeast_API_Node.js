var bb = new (require('./lib/index'))('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');
var _       = require('underscore'),
    utils   = require('./lib/core/utils');


var newGroups = [];

var handle_tour = function(tournament, error) {
    if(!tournament) {
        console.log('error loading tournament', error);
        return;
    }

    _.pick(tournament, [
        'name', 'id', 'status',
        'type', 'elimination',
        'game',
        'teams_confirmed_count',
        'group_count', 'group_mode'
    ]);
    console.log('Fetching results... ');
    tournament.draw_groups(handle_groups);
};


var handle_groups = function(groups, error, options) {
    if( !groups ) {
       console.log(error, options);
        return;
    }
  console.log(groups);
  newObject = {
    data: []
  };
  newGroups.length = 0;
  newObject.data.push(groups);
  newGroups.push(newObject);
  console.log(newGroups);
};


var tournament = new bb.tournament('xSC21409113');
utils.log('loading xSC21409113');

function engage() {
  tournament.load(handle_tour);
}

engage();


var express = require('express');
var app = express();

app.set('views', './views');
app.set('view engine', 'jade');
app.use(express.static('public'));

app.get('/reload', function (req, res) {
  engage();
  res.send('reloading data');
});

app.get('/groups1', function (req, res) {
  console.log('sending groups');

  console.log(newGroups[0].data[0]);
  res.render('groups', { groups: newGroups[0].data[0] });
});

app.get('/groups2', function (req, res) {
  console.log('sending groups');

  console.log(newGroups[0].data[0]);
  res.render('groups2', { groups: newGroups[0].data[0] });
});


var server = app.listen(3000, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

});
