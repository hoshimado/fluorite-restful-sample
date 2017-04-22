/*
    [vue_main_test.js]
	encoding=utf-8
*/


var chai = require("chai");
var assert = chai.assert;
var expect = chai.expect;
var sinon = require("sinon");
// var shouldFulfilled = require("promise-test-helper").shouldFulfilled;
// var shouldRejected  = require("promise-test-helper").shouldRejected;

var main = require("../src/vue_main.js");



describe( "sql_parts.js", function(){
    describe( "::createPromiseForSqlConnection()",function(){
        it("正常系",function(){
            assert( main.setupOnLoad );
            assert( main.factoryImpl.cookieData );
            assert( main.factoryImpl.createVue );
        });
    });
});


/*
Factory.prototype.setStub = function( value ){
    this.instance = value;
};

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
		"_addSelecterIfUnique" : _addSelecterIfUnique,
		"_showItemOnInputer" : _showItemOnInputer,
		"_updateLogViewer" : _updateLogViewer,
		"updateChart" : updateChart // ブラウザ環境では<script>で読み込み済み。それ以外ならundefinedになる。
		// var updateChart = function( RESULT_SELECTOR, azure_domain, device_key ){}
	})
};
*/
