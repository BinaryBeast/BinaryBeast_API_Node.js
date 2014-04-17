/**
 * Example BinaryBeast API script
 * 
 * We have a full list of ISO countries in our database, you can use our API to find correct country_codes
 */

var bb = require('binarybeast');
bb = new bb('e17d31bfcbedd1c39bcb018c5f0d0fbf.4dcb36f5cc0d74.24632846');

//Let's retrieve a list of countires with the word 'united' in them
bb.country.search('united', function(result) {

    console.log('');
    console.log('Countries searched in ' + result.api_total_time);

    for(var x in result.countries) {
        console.log(result.countries[x].country
            + ' (' + result.countries[x].country_code + ')'
        );
    }

    console.log('');

});