/*
    [draw_chart.js]

    encoding=UTF-8

*/

var bindExpandCollapsePanel = function( idPanel ){
    var BGCOLOR = "#77ffcc";
    var CSS_EXPAND = {
	    "float" : "left",
        "line-height" : "0",
        "width" :  "0",
        "height" : "0",
        "border" : "10px solid " + BGCOLOR, /* transparent */
        "border-top" : "10px solid #000000",
        "padding-bottom": "0px"
    };
    var CSS_COLLAPSE = {
	    "float" : "left",
        "line-height" : "0",
        "width" :  "0",
        "height" : "0",
        "border" : "10px solid " + BGCOLOR, /* transparent */
        "border-left" : "10px solid #000000",
        "padding-bottom": "0px"
    };    
    var str = "<div id=\"\_id_expand_collapse_base\">"
    str += "<div id=\"_id_marker\"></div>";
    str += "<div id=\"_id_expand_collapse\">設定パネル</div>"
    str += "<div style=\"float: none; both: clear;\"></div>"
    str += "</div>";
    $("#"+idPanel).before(str);
    $("#"+idPanel).hide();

    $("#_id_marker").css(CSS_COLLAPSE);
    $("#_id_expand_collapse_base").css({
        "margin" : "4   px",
        "padding" : "8px",
	"cursor" : "pointer",
        "backgroundColor" : BGCOLOR
    });
    $("#_id_expand_collapse").click(function(){
        if($("#"+idPanel).is(":visible")){
            $("#"+idPanel).slideUp();
            $("#_id_marker").css(CSS_COLLAPSE);
        }else{
            $("#"+idPanel).slideDown();
            $("#_id_marker").css(CSS_EXPAND);
        }
    });
    return $("#_id_expand_collapse");
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


var drawEditSetting = function( idEditSetting ){
    var editPanelDiv = $("#"+idEditSetting);
    var updateText6Select = function(){
        $("#_id_device_text").val( $("#_id_device_drop option:selected").eq(0).val() );
        $("#_id_device_name").val( $("#_id_device_drop option:selected").eq(0).text() );
    };
    var str = "";
    str += "Azureドメイン：<br>";
    str += "<form>";
    str += "<input id=\"_id_azure_domain\" type=\"text\" style=\"width:340px\">";
    str += "</input>";
    str += "</form>";
    str += "デバイスキー：（ハッシュ値＋表示名）<br>";
	/*
		編集可能なドロップダウンリスト
		http://blue-red.ddo.jp/~ao/wiki/wiki.cgi?page=%CA%D4%BD%B8%B2%C4%C7%BD%A4%CA%A5%BB%A5%EC%A5%AF%A5%C8%A5%DC%A5%C3%A5%AF%A5%B9%A4%F2%BA%EE%A4%EB
    */
    str += "<form>";
    str += "<input id=\"_id_device_text\" type=\"text\" style=\"width:360px;\" value=\"MACアドレスのMD5ハッシュ値を入れてください\">";
    str += "</input><br>";
    str += "<select id=\"_id_device_drop\" style=\"width:360px; clip:rect(0px,360px,22px,340px); position:absolute;\">";
    str += "</select>";
    str += "<input id=\"_id_device_name\" type=\"text\" style=\"width:340px;margin-right:24px;\">";
    str += "</input>";
    str += "<input id=\"_id_device_add_button\" type=\"button\" value=\"追加\">";
    str += "</input>";
    str += "</form>";

    editPanelDiv.append(str);

    $("#_id_device_drop").change(function(){
        updateText6Select();
    });
    $("#_id_device_add_button").click(function(){
        var keyName = $("#_id_device_name").val();
        var keyStr = $("#_id_device_text").val();
        if( keyStr.length > 0 ){
            _addUniquValue2Select("_id_device_drop", keyStr, keyName);
            _saveSelectOption("_id_device_drop");
        }
    });
    _loadSelecctOption("_id_device_drop");
    updateText6Select();
};

var COOKIE_TARGET_LIST_VALUE = "DeviceKey20170403Value_Array";
var COOKIE_TARGET_LIST_NAME = "DeviceKey20170403NAME_Array";
var COUNT_OF_TARGET_LIST = 10;
var gCookieTargetList = (function(){
    var list = [], n = COUNT_OF_TARGET_LIST;
    while( 0 < n-- ){
        list.push({
            "value" : new CookieBind( COOKIE_TARGET_LIST_VALUE + n ),
            "name" : new CookieBind( COOKIE_TARGET_LIST_NAME + n )
        });
    }
    return list;
}());
var _saveSelectOption = function( idSelector ){
    var target = $("#" + idSelector + " option"), n=0; 
    target.each(function(){
        var item = $(this);
        if( n < COUNT_OF_TARGET_LIST ){
            gCookieTargetList[n].name.save( item.text() );
            gCookieTargetList[n].value.save( item.val() );
            n++;
        }
    });
};
var _loadSelecctOption = function( idSelector ){
    var target = $("#" + idSelector); 
    for( var n=0; n<COUNT_OF_TARGET_LIST; n++ ){
        if( gCookieTargetList[n].value.getValue() ){
            target.append(
                $("<option>")
                .val(gCookieTargetList[n].value.getValue())
                .text(gCookieTargetList[n].name.getValue())
            );
        }
    }
};
var _addUniquValue2Select = function( idSelect, keyStr, keyName ){
    var item = $("#"+idSelect + " option[value='" + keyStr + "']");
    if( item.size() == 0 ){
        $("#"+idSelect).append($("<option>").val(keyStr).text(keyName));
    }
};


var updateChart = function( ID_AZURE, ID_DEVCICE, ID_RESULT, loadingImg ){
    var dfd = $.Deferred(); // https://api.jquery.com/deferred.promise/
    var azure_domain, device_key;

    azure_domain = $("#"+ID_AZURE).text();
    device_key = $("#"+ID_DEVCICE).text();

    if((azure_domain.length != 0) && (device_key.length != 0)){
    	$("#"+ID_RESULT).empty();
        if( loadingImg ){
            $("#"+ID_RESULT).append("<img id=\"id_loading\" src=\"" + loadingImg + "\">");
        }else{
            $("#"+ID_RESULT).append("loading...");
        }

       _getChartDataOverAjax(
            azure_domain,
            device_key
       ).done(function(result){
            var plot_source = _createChatData( result.table );
            var str = _createTextMessage( result.table );

            $("#"+ID_RESULT).empty();

            $("#"+ID_RESULT).append( str );
            $("#"+ID_RESULT).append(
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
            $("#"+ID_RESULT).empty();
            $("#"+ID_RESULT).append( errorText );
            dfd.reject();
        });
    }else{
        $("#"+ID_RESULT).empty();
        $("#" + ID_RESULT).append( "[Error] 設定が不足です" );
        dfd.reject();
    }
    return dfd;
};



var COOKIE_AZURE_DOMAIN = "BatteryLogAzureDomain20170403";
var COOKIE_TARGET_DEVICEKEY = "BatteryLogDeviceKey20170403";
var gAzureDomainCookie = new CookieBind( COOKIE_AZURE_DOMAIN );
var gDeviceKeyCookie   = new CookieBind( COOKIE_TARGET_DEVICEKEY );

var load6Cookie = function( idAzureDomain, idDeviceKey ){
    var str;
    if( gAzureDomainCookie.getValue() ){
        $("#"+idAzureDomain).text( gAzureDomainCookie.getValue() );
    }
    if( gDeviceKeyCookie.getValue() ){
        $("#"+idDeviceKey).text( gDeviceKeyCookie.getValue() );
    }

    str = $("#"+idAzureDomain).text();
    if( str.length > 0 ){
        $("#_id_azure_domain").val( str );
    }
    str = $("#"+idDeviceKey).text();
    if( str.length > 0 ){
        $("#_id_device_text").val( str );
    }
};


var bindUpdateButton = function( idUpdateButton, idAzureDomain, idDeviceKey, idResult ){
	var str = "<form>";

	str += "<input id=\"_id_update_button\" type=\"button\" value=\"更新\">";
	str += "</input>";
	str += "</form>";
	$("#"+idUpdateButton).append( str );

	$("#"+idUpdateButton).click(function(){
		var azure_domain = $("#_id_azure_domain").val();
		var device_key = $("#_id_device_text").val();
		
		$("#" + idAzureDomain ).text( azure_domain );
		$("#" + idDeviceKey ).text( device_key );
		
		gAzureDomainCookie.save( azure_domain );
		gDeviceKeyCookie.save( device_key );

		updateChart( idAzureDomain, idDeviceKey, idResult );
	});
};


