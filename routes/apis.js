var request = require('request');

module.exports = function(io){
  return {
  	isThisForThat: function(req, res) {
  		request('http://itsthisforthat.com/api.php?text', function (err, response, body) {
		    if (!err && response.statusCode == 200) {
		      var mytext = body;
		      console.log(mytext);
		      res.send(mytext);
		    }
		});
  	}
  }
}