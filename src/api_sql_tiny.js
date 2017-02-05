/*
    [api_sql_tiny.js]
    
	encoding=utf-8
*/
const debug = require("./debugger.js");
var mssql = require('mssql'); // https://www.npmjs.com/package/mssql


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
 * @type SQL Server接続用の設定変数。
 */
var CONFIG_SQL = {
	user : process.env.SQL_USER,
	password : process.env.SQL_PASSWORD,
	server : process.env.SQL_SERVER, // You can use 'localhost\\instance' to connect to named instance
	database : process.env.SQL_DATABASE,
	stream : false,  // if true, query.promise() is NOT work! // You can enable streaming globally

	// Use this if you're on Windows Azure
	options : {
		database : process.env.SQL_DATABASE, // コレ要る？
		encrypt : true 
	} // It works well on LOCAL SQL Server if this option is set.
};
/**
 * SQL Server への接続テストAPI
 */
exports.api_v1_sql = function( response, queryFromGet, dataFromPost ){
	var connect = mssql.connect( CONFIG_SQL );

	connect.then(function(){
		response.writeJsonAsString({
			"result" : "sql connection is OK!"
		});
	}).catch(function(err){
		response.writeJsonAsString( err );
	}).then(function(){
		mssql.close();
	});
};



