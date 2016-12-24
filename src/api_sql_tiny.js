/*
    [api_sql_tiny.js]
    
	encoding=utf-8
*/
const debug = require("./debugger.js");

var mssql = require('mssql');


/**
 * 情報表示API：　バージョン表示など
 */
exports.api_v1_show = function( response, queryFromGet, dataFromPost ){
console.log( queryFromGet );
	var name = queryFromGet[ "name" ];
	if( name == "version" ){
		response.writeJsonAsString( { "version" : "1.00" } );
	} else {
		response.writeJsonAsString( { result : "show api is here." } );
	}
};



/**
 * @type Azure接続用の設定変数。
 */
var CONFIG_SQL = {
	// user : "sa",
	user : process.env.SQL_USER,
	password : process.env.SQL_PASSWORD,
	server : process.env.SQL_SERVER, // You can use 'localhost\\instance' to connect to named instance
	databese : "sample001", // "tiny-databese"
	stream : true,   // You can enable streaming globally
	options : {
		encrypt : true // Use this if you're on Windows Azure
	} // It works well on LOCAL SQL Server if this option is set.
};
/**
 * SQL Server への接続テストAPI
 */
exports.api_v1_sql = function( response, queryFromGet, dataFromPost ){
//	var connect = mssql.connect( config_local );
	var connect = mssql.connect( CONFIG_SQL );

	connect.then(function(){
		response.writeJsonAsString( { result : "sql connection is OK!" } );
		mssql.close();

	}).catch(function(err){
		response.writeJsonAsString( err );
		console.log(err);
		mssql.close();
	});

	debug.console_output( "[http] api is called." );
};

