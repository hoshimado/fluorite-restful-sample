/*  setting.\EscSequ@\nfunction.ListMarkup=true

	[bind_cookie.js]
	encoding=UTF-8

	jquery.cookie.js のラッパークラス。
	
	※サイトでは「common_cookie.js」と置いてるファイルからの抜粋。
	※「JavaScriptでクラス」でネタにしたヤツ。
	  http://qiita.com/xingyanhuan/items/7bc47c244dd124a188cd
*/


// 
// cookieの簡易的扱い
//
var CookieBind = function( cookieName ){
	this._cookieName = cookieName;
	this.itsLoadedStr = this.load();
};
(function(){
	var COOKIE_OPTION = { expires: 7 };

	CookieBind.prototype.save = function( str ){
		$.cookie( this._cookieName, str, COOKIE_OPTION );
	};
	CookieBind.prototype.load = function(){
		return $.cookie( this._cookieName );
	}
	CookieBind.prototype.getValue = function(){
		return this.itsLoadedStr;
	}
}());






