/*
    [vue_main.js]

    encoding=UTF-8

*/


// とりあえず動かしてみる http://tech.innovation.co.jp/2017/01/13/vue.html
// セレクト。動的。https://jp.vuejs.org/v2/guide/forms.html#%E9%81%B8%E6%8A%9E
// Vueのインスタンスが持つ値にアクセスする http://qiita.com/hosomichi/items/ebbfcc3565bcd27f344c
// Cookieならこっち。後半でテスト済み。https://www.npmjs.com/package/tiny-cookie
window.onload = function(){
	var items = loadItems();
	var app = new Vue({
		el: '#app',
		data: function(){
			return {
			"azure_domain_str" : loadAzureDomain(),
			"device_key_str"   : "",
			"device_name_str"  : ""
			};
		},
		methods : {
			"add_azure" : function(event){
				saveAzureDomain( this.azure_domain_str );
			},
			"add_device" : function(e){
				add_selecter_if_unique( this, app2 ); // 後でマージする。⇒this１つになる。
				saveItems( app2.options ); // 後でマージする。⇒this.optionsになる。
			}
		}
	});
	var app2 = new Vue({ // jQueryとの共存の都合で分ける。
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
				show_item_on_inputer( this, app ); // 後でマージする。⇒this１つになる。
			},
			"update_chart" : function(e){
				update_log_viewer( app ); // 後でマージする。⇒thisになる。
			}
		}
	});
	var add_selecter_if_unique = function( src, dest ){
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
	var show_item_on_inputer = function( src, dest ){
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
	var update_log_viewer = function( src ){
		updateChart( "#id_result", src.azure_domain_str, src.device_key_str ) // 出力先がハードコーディングなので後で直す。
	};
};



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
var MAX_LISTS = 7;
var COOKIE_NAME  = "AzBatteryLog_Text";
var COOKIE_VALUE = "AzBatteryLog_Value";
var loadItems = function(){
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
var saveItems = function( list ){
	var cookie = window.Cookie;
	var name, value, n = MAX_LISTS;
	while( 0 < n-- ){
		if( list[n] && list[n].text && list[n].value ){
			name = cookie( COOKIE_NAME + n, list[n].text );
			value = cookie( COOKIE_VALUE + n, list[n].value );
		}
	}
};
var loadAzureDomain = function(){
	var cookie = window.Cookie;
	return cookie("AzBatteryLog_Domain");
}
var saveAzureDomain = function( azureStr ){
	var cookie = window.Cookie;
	cookie("AzBatteryLog_Domain", azureStr);
};

// こっちはjQueryのまま。後で修正する。
var updateChart = function( RESULT_SELECTOR, azure_domain, device_key ){
    var dfd = $.Deferred(); // https://api.jquery.com/deferred.promise/
		var target = $(RESULT_SELECTOR);

    if((azure_domain.length != 0) && (device_key.length != 0)){
    	target.empty();
      target.append("<i class=\"fa fa-spinner fa-spin\"></i>");

      _getChartDataOverAjax(
            azure_domain,
            device_key
      ).done(function(result){
            var plot_source = _createChatData( result.table );
            var str = _createTextMessage( result.table );

            target.empty();

            target.append( str );
            target.append(
                "<canvas id=\"id_chart\"></canvas>"
            );

            var ctx = document.getElementById('id_chart').getContext('2d');
            var myChart = new Chart(ctx, { 
                type: 'line', 
                data: { 
                    labels: plot_source.label, // ['M', 'T', 'W', 'T', 'F', 'S', 'S'], 
                    datasets: [
                        { 
                            label: 'battery', 
                            data: plot_source.data, // [12, 19, 3, 17, 6, 3, 7], 
                            backgroundColor: "rgba(153,255,51,0.4)" 
                            // backgroundColor: "rgba(20,70,51,0.8)" 
                        }
                    ] 
                } 
            });
            dfd.resolve();
      }).fail(function( err, errorText ){
            target.empty();
            target.append( errorText );
            dfd.reject();
      });
    }else{
        target.empty();
        target.append( "[Error] 設定が不足です" );
        dfd.reject();
    }
    return dfd;
};

var _getChartDataOverAjax = function( azureDomain, device_key ){
    return $.ajax({
        type : "GET",
        url  : azureDomain + "/api/v1/batterylog/show",
        data : { 
            "device_key" : device_key
        },
        dataType : "jsonp",
        timeout : 10000
    });
};

var _createChatData = function( logArray ){
    var i, length = logArray.length;
    var labels_array = [], data_array = [], cut_off = length - 50;
    var scale = 0;

    for( i=0; i<length; i++ ){
        if( cut_off < i ){
            data_array.push( logArray[i].battery );

            labels_array.push( scale*5 );
            scale++;
        }
    }
    labels_array.reverse();

    return {
        label : labels_array,
        data  : data_array
    };
};


var _createTextMessage = function( logArray ){
    var length = logArray.length;
    var str = "";

    str += "バッテリー残量：" + logArray[ length -1 ].battery + " ％ at ";
    str += logArray[ length -1 ].created_at.substr(0,10) + "<br>\n";
    str += "<br>\n";

    return str;
};


