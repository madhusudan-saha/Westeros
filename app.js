var express = require('express');
var bodyParser = require('body-parser');
var app = new express();
app.use(bodyParser.urlencoded());
app.use(express.static(__dirname + '/public'));

var router = express.Router();
var mysql = require('mysql');

var connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'madhus',
    database : 'westeros'
});

connection.connect(function(err){
    if(!err) {
	console.log("Database is connected ... \n\n");  
    } else {
	console.log("Error connecting database ... \n\n");  
    }
});

var battles = {};
var kings = {};

connection.query('SELECT * from battles',
	function(err, rows, fields) {
	    //connection.end();
	    if (!err){
		battles = rows;
		for(i in rows){
		    if(rows[i].attacker_outcome == "win"){
			if(rows[i].attacker_king in kings){
			    kings[rows[i].attacker_king]["battles_won"].push(rows[i].name);
			}
			else if(rows[i].attacker_king != ""){
			    kings[rows[i].attacker_king] = {name:rows[i].attacker_king, battles_won:[rows[i].name], battles_lost:[]};
			}
			if(rows[i].defender_king in kings){
			    kings[rows[i].defender_king]["battles_lost"].push(rows[i].name);
			}
			else if(rows[i].defender_king != ""){
			    kings[rows[i].defender_king] = {name:rows[i].defender_king, battles_won:[], battles_lost:[rows[i].name]};
			}
		    }
		    if(rows[i].attacker_outcome == "loss"){
			if(rows[i].attacker_king in kings){
			    kings[rows[i].attacker_king]["battles_lost"].push(rows[i].name);
			}
			else if(rows[i].attacker_king != ""){
			    kings[rows[i].attacker_king] = {name:rows[i].attacker_king, battles_won:[], battles_lost:[rows[i].name]};
			}
			if(rows[i].defender_king in kings){
			    kings[rows[i].defender_king]["battles_won"].push(rows[i].name);
			}
			else if(rows[i].defender_king != ""){
			    kings[rows[i].defender_king] = {name:rows[i].defender_king, battles_won:[rows[i].name], battles_lost:[]};
			}
		    }
		}
		//console.log(kings);
	    }
	    else
		console.log('Error while performing Query.');
	});

app.get('/',function(req,res){
    res.sendfile('index.html');
});

router.route('/battles')
.get(function(request,response){
    response.json(battles);
});
 
router.route('/kings')
.get(function(request,response){
    response.json(kings);
});

router.route('/king/:name')
.get(function(request,response){
    response.json(kings[request.params.name]);
});

app.use('/api',router);
app.listen(3000, function(){
	console.log("Server listening on 3000");
});
