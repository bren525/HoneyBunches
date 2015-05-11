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
  	},
  	randomWord: function(req, res) {
  		request('http://randomword.setgetgo.com/get.php', function (err, response, body) {
		    if (!err && response.statusCode == 200) {
		      var word = body;
		      console.log(word);
		      res.send(word);
		    }
		});
  	}
  }
}
