/*
    [vue_main.js]

    encoding=UTF-8

*/


/**
 * @description オブジェクトのFactory
 */
var Factory = function( staticInstance ){
    this.instance = staticInstance;
}
Factory.prototype.getInstance = function(){
    return this.instance;
};
// if( 開発環境ならば ){ ～ }などとする。
Factory.prototype.setStub = function( value ){
    this.instance = value;
};






/**
 * 画面のDOM描画が終わった後に呼び出される、各種Vue.jsベースの動作構築。
 */
var setupOnLoad = function(){
	// とりあえず動かしてみる http://tech.innovation.co.jp/2017/01/13/vue.html
	// セレクト。動的。https://jp.vuejs.org/v2/guide/forms.html#%E9%81%B8%E6%8A%9E
	// Vueのインスタンスが持つ値にアクセスする http://qiita.com/hosomichi/items/ebbfcc3565bcd27f344c
	// Cookieならこっち。後半でテスト済み。https://www.npmjs.com/package/tiny-cookie
	var createVue = factoryImpl.createVue.getInstance();
	var items = factoryImpl.cookieData.getInstance().loadItems();
	var app = createVue({
		el: '#app',
		data: function(){
			return {
			"azure_domain_str" : factoryImpl.cookieData.getInstance().loadAzureDomain(),
			"device_key_str"   : "",
			"device_name_str"  : ""
			};
		},
		methods : {
			"add_azure" : function(event){
				factoryImpl.cookieData.getInstance().saveAzureDomain( this.azure_domain_str );
			},
			"add_device" : function(e){
				factoryImpl.action.getInstance().addSelecterIfUnique( this, app2 ); // 後でマージする。⇒this１つになる。
				factoryImpl.cookieData.getInstance().saveItems( app2.options ); // 後でマージする。⇒this.optionsになる。
			}
		}
	});
	var app2 = createVue({ // jQueryとの共存の都合で分ける。
		el: '#app_selector',
		data: function(){
			return {
			// 以下はセレクター関連
			"selected" : "", // ここは初期選択したいvalueを指定する。
			"options" : items
			};
		},
		methods : {
			"update_inputer" : function(e){
				factoryImpl.action.getInstance().showItemOnInputer( this, app ); // 後でマージする。⇒this１つになる。
			},
			"update_chart" : function(e){
				factoryImpl.action.getInstance().updateLogViewer( app ); // 後でマージする。⇒thisになる。
			}
		}
	});
};
var _addSelecterIfUnique = function( src, dest ){
	var list = dest.options, n = list.length, is_unique = true;
	while( 0<n-- ){
		if( list[n].value == src.device_key_str ){
			is_unique = false;
			break;
		}
	}
	if( is_unique ){
		dest.options.push({
			value : src.device_key_str,
			text  : src.device_name_str
		});
	}
};
var _showItemOnInputer = function( src, dest ){
	var selected_value = src.selected;
	var list = src.options, n = list.length;
	while( 0<n-- ){
		if( list[n].value == selected_value ){
			dest.device_key_str = list[n].value;
			dest.device_name_str = list[n].text;
			break;
		}
	}
};
var _updateLogViewer = function( src ){
	updateChart( "#id_result", src.azure_domain_str, src.device_key_str ) // 出力先がハードコーディングなので後で直す。
};
if( this.window ){
	window.onload = setupOnLoad;
}else{
	exports.setupOnLoad = setupOnLoad;
}








/*
  function Cookie(key, value, opts) {
    if (value === void 0) {
      return Cookie.get(key);
    } else if (value === null) {
      Cookie.remove(key);
    } else {
      Cookie.set(key, value, opts);
    }
  }
*/
/**
 * Cookieを利用したデータ保存。
 *
 */
var MAX_LISTS = 7;
var COOKIE_NAME  = "AzBatteryLog_Text";
var COOKIE_VALUE = "AzBatteryLog_Value";
var COOKIE_LAST_VALUE = "AzBatteryLog_LastValue";
var COOKIE_OPTIONS = {expires: 7};
var _loadItems = function(){
	var cookie = window.Cookie;
	var list = [];
	var name, value, n = MAX_LISTS;
	while( 0 < n-- ){
		name = cookie( COOKIE_NAME + n );
		value = cookie( COOKIE_VALUE + n );
		if( name && value ){
			list.push({
				"text" : name,
				"value" : value
			});
		}
	}
	return list;
};
var _saveItems = function( list ){
	var cookie = window.Cookie;
	var name, value, n = MAX_LISTS;
	while( 0 < n-- ){
		if( list[n] && list[n].text && list[n].value ){
			name = cookie( COOKIE_NAME + n, list[n].text, COOKIE_OPTIONS );
			value = cookie( COOKIE_VALUE + n, list[n].value, COOKIE_OPTIONS );
		}
	}
};
var _loadLastValue = function(){
	var cookie = window.Cookie;
	return cookie(COOKIE_LAST_VALUE);
};
var _saveLastValue = function( value ){
	var cookie = window.Cookie;
	cookie(COOKIE_LAST_VALUE, value, COOKIE_OPTIONS);
};
var _loadAzureDomain = function(){
	var cookie = window.Cookie;
	return cookie("AzBatteryLog_Domain");
}
var _saveAzureDomain = function( azureStr ){
	var cookie = window.Cookie;
	cookie("AzBatteryLog_Domain", azureStr, COOKIE_OPTIONS );
};







// ----------------------------------------------------------------------
var factoryImpl = { // require()を使う代わりに、new Factory() する。
	"createVue" : new Factory(function(options){
		return new Vue(options)
	}), // Vue.jsが無ければ、undefined が設定されるだけ。
	"cookieData" : new Factory({
		"loadItems" : _loadItems,
		"saveItems" : _saveItems,
		"loadLastValue" : _loadLastValue,
		"saveLastValue" : _saveLastValue,
		"loadAzureDomain" : _loadAzureDomain,
		"saveAzureDomain" : _saveAzureDomain
	}),
	"action" : new Factory({
		"addSelecterIfUnique" : _addSelecterIfUnique,
		"showItemOnInputer" : _showItemOnInputer,
		"updateLogViewer" : _updateLogViewer,
		"updateChart" : this.window ? updateChart : undefined // ブラウザ環境では<script>で読み込み済み。それ以外ならundefinedになる。
		// var updateChart = function( RESULT_SELECTOR, azure_domain, device_key ){}
	})
};
// UTデバッグ用のHookポイント。運用では外部公開しないメソッドはこっちにまとめる。
if( !this.window ){
	exports.factoryImpl = factoryImpl;
	exports.Factory = Factory;
}



