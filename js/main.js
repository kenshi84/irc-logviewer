
var logDates = [];

jQuery(document).ready(function() {
	jQuery(window).resize(function() {
		ircLogSearch.redrawWindow();
	});
					
	// Set layout correctly on page load
	ircLogSearch.redrawWindow();

	jQuery("#datePicker").datepicker({
		onSelect: function(dateText, inst) {
			var server = $('#ircServer option:selected').val();
			var channel = $('#ircChannel option:selected').val();
			ircLogSearch.getConversation(server, channel, dateText, '00:00', '23:59');
		},
		dateFormat: "yy-mm-dd",
		showButtonPanel: true,
		firstDay: 1,
		disabled: true,
		beforeShowDay: function(date) {
			ymd = $.datepicker.formatDate('yy-mm-dd', date);
			if (ymd in logDates) {
				return [true, "", logDates[ymd]];
			} else {
				return [false,"", "None"];
			}
		},
		onChangeMonthYear: function(year, month, inst) {
			//inst.datepicker('disable');
			ircLogSearch.updateLogDays( year + "-" + month + "-01" );
			return true;
		}
	});

	// Get list of IRC servers on page load
	ircLogSearch.populateIrcServerList();
	
	jQuery( "#leftNavigationAccordion" ).accordion({
		fillSpace: false,
		icons: false	
	});	
});

function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
} 

function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

function highlightName(name) {
        
    return "<span style='color: #" + intToRGB(hashCode(name)) + "'>" + name + "</span>";
}

var ircLogSearch = {};

ircLogSearch.populateIrcServerList = function() {

	jQuery.ajax({		
		url: "ajax/ListServers.php?timestamp=" + (new Date().getTime().toString()),
		type: "GET",
		dataType: "json",
		success: function(result) {

			$("#ircServer").html("");
			$("#ircChannel").html("");

			for (var i = 0; i < result.length; i++) { 
				var options = $('#ircServer').attr('options');
				options[options.length] = new Option(result[i], result[i]);			
			}	

			// Calling this method sucessfully always triggers the IRC Channel List to be re-populated too.
			ircLogSearch.populateIrcChannelList();	
		}

	});
}

ircLogSearch.updateLogDays = function(date) {
	var server = $('#ircServer option:selected').val();
	var channel = $('#ircChannel option:selected').val();

	jQuery.ajax({
		url: "ajax/ListMonthLogs.php?timestamp=" + (new Date().getTime().toString())
			+ "&server=" + encodeURIComponent(server)
			+ "&channel=" + encodeURIComponent(channel)
			+ "&date="  + encodeURIComponent(date),
		type: "GET",
		dataType: "json",
		success: function(result) {

			logDates = result;
			$("#datePicker").datepicker('refresh');
			$("#datePicker").datepicker('enable');
		}
	});
}

ircLogSearch.populateIrcChannelList = function() {

	var server = $('#ircServer option:selected').val();

	jQuery.ajax({		
		url: "ajax/ListChannels.php?timestamp=" + (new Date().getTime().toString()) + "&server=" + encodeURIComponent(server),
		type: "GET",
		dataType: "json",
		success: function(result) {

			var $select = $("#ircChannel");
			var vSelect = '';
			$.each(result, function (i, v) {
				vSelect += '<option value="' + v + '">' + v + '</option>';
			});
			$select.html( vSelect );

			var date = $("#datePicker").datepicker('getDate');
			//var day = date.getDate();
			//var month = date.getMonth()+1;
			//var year = date.getFullYear();

			ircLogSearch.updateLogDays(date.toString());
		}
		
	});
}
	
	
ircLogSearch.selectConversation = function(element, server, channel, date, startTime, endTime, keywords) {
	$(".conversation").removeClass("conversationSelected");
	$(element).addClass("conversationSelected");
	
	ircLogSearch.getConversation(server, channel, date, startTime, endTime, keywords);	
}


ircLogSearch.getPlainConversation = function(server, channel, date, startTime, endTime) {
	jQuery('#ircLogSearchResultsLogViewWrapper').html('');	
	
	$.ajax({		
		url: "ajax/GetPlainConversation.php?timestamp=" + (new Date().getTime().toString()) + "&server=" + encodeURIComponent(server) + "&channel=" + encodeURIComponent(channel) + "&startTime="  + date + "+" + encodeURIComponent(startTime)+ "&endTime=" + date + "+" + encodeURIComponent(endTime),
		type: "GET",
		dataType: "json",
		success: function(json) {

			jQuery('#ircLogSearchResultsLogView').html('<div class="heading">Chat Log - ' + channel + ' - ' + date + '</div>'
                                                      +'<div id="ircLogSearchResultsLogViewWrapper"></div>');		
			ircLogSearch.redrawWindow();
		
			var rowClass = "oddRow";
			for (var i = 0; i < json['conversation'].length; i++) {
				
				if (json['conversation'][i].user) {
					jQuery('#ircLogSearchResultsLogViewWrapper').append(	'<div class="' + rowClass + '">'							
																			+'<div class="time">' + json['conversation'][i].time + '</div>'
																			+'<div class="user">&lt;' + highlightName(json['conversation'][i].user) + '&gt;</div>'
																			+'<span class="msg">' + json['conversation'][i].msg + '</span>'
																			+'</div>'
																		);
				} else {
					jQuery('#ircLogSearchResultsLogViewWrapper').append(	'<div class="' + rowClass + '">'							
																			+'<div class="time">' + json['conversation'][i].time + '</div>'
																			+'<span class="systemMsg">' + json['conversation'][i].msg + '</span>'
																			+'</div>'
																		);
				}
																	
				(rowClass == "oddRow") ? rowClass = "evenRow" : rowClass = "oddRow";									

			}		
		}
		
	});
	
	ircLogSearch.redrawWindow();
				
	return;	
}
ircLogSearch.getConversation = function(server, channel, date, startTime, endTime, keywords) {

	jQuery('#ircLogSearchResultsLogViewWrapper').html('');	
	
	$.ajax({		
		url: "ajax/GetConversation.php?timestamp=" + (new Date().getTime().toString()) + "&server=" + encodeURIComponent(server) + "&channel=" + encodeURIComponent(channel) + "&startTime="  + date + "+" + encodeURIComponent(startTime)+ "&endTime=" + date + "+" + encodeURIComponent(endTime)+"&keywords="+keywords,
		type: "GET",
		dataType: "json",
		success: function(json) {

			jQuery('#ircLogSearchResultsLogView').html('<div class="heading">Chat Log - ' + channel + ' - ' + date + '</div>'
                                                      +'<div id="ircLogSearchResultsLogViewWrapper"></div>');		
			ircLogSearch.redrawWindow();
		
			var rowClass = "oddRow";
			for (var i = 0; i < json['conversation'].length; i++) {
				
				if (json['conversation'][i].user) {
					jQuery('#ircLogSearchResultsLogViewWrapper').append(	'<div class="' + rowClass + '">'							
																			+'<div class="time">' + json['conversation'][i].time + '</div>'
																			+'<div class="user">&lt;' + highlightName(json['conversation'][i].user) + '&gt;</div>'
																			+'<span class="msg">' + json['conversation'][i].msg + '</span>'
																			+'</div>'
																		);
				} else {
					jQuery('#ircLogSearchResultsLogViewWrapper').append(	'<div class="' + rowClass + '">'							
																			+'<div class="time">' + json['conversation'][i].time + '</div>'
																			+'<span class="systemMsg">' + json['conversation'][i].msg + '</span>'
																			+'</div>'
																		);
				}
																	
				(rowClass == "oddRow") ? rowClass = "evenRow" : rowClass = "oddRow";									

			}		
		}
		
	});
	
	ircLogSearch.redrawWindow();
				
	return;	
}
	
ircLogSearch.search = function() {

	var server = document.getElementById('ircServer').value;
	var channel = document.getElementById('ircChannel').value;
	var keywords = document.getElementById('keywords').value;

	// Todo: Impliment href query string, so URL's of results can be copy/pasted
	//window.location.href = "#q=search&server="+encodeURIComponent(server) + "&channel=" + encodeURIComponent(channel) + "&keywords=" + encodeURIComponent(keywords);
	
	if (keywords == ""){

	}
	// Show search results accordion
	$( "#leftNavigationAccordion" ).accordion("option", "active", 1);
	
	// Reset results view
	jQuery('#searchResults').html('<div class="loading"><img src="images/ajax-loader.gif" alt="Loading"/><p>Searching...</p></div>');	
	ircLogSearch.redrawWindow();
					
	$.ajax({		
		url: "ajax/Search.php?timestamp=" + (new Date().getTime().toString()) + "&server=" + encodeURIComponent(server) + "&channel=" + encodeURIComponent(channel) + "&keywords=" + encodeURIComponent(keywords),
		type: "GET",
		dataType: "json",
		success: function(json) {
			
                        var uriString = encodeURIComponent(keywords);
			// If we get a response with any matches, immedaitely start getting the first entry in the background
			if (json['searchResults'].length > 0)
				ircLogSearch.getConversation(server, channel, json['searchResults'][0].date, json['searchResults'][0].startTime, json['searchResults'][0].endTime, uriString);

			jQuery('#searchResults').html('');
			

			for (var i = 0; i < json['searchResults'].length; i++) {
								
				var conversationClass = "conversation";		
				if (i == 0)
					conversationClass = "conversation conversationSelected";				
			
				var usersHtml = '';
				for (user in json['searchResults'][i].users) {
					if (usersHtml != '')
						usersHtml += ', ';
						
					//usersHtml += '<div class="ircConversationParticipant">' + user + '</div> (' + json['searchResults'][i].users[user] + ')';
					usersHtml += '<div class="ircConversationParticipant">' + user + '</div>';
				}

				var keywordsHtml = '';
				for (keyword in json['searchResults'][i].keywords) {
					if (keywordsHtml != '')
						keywordsHtml += ', ';
						
					//keywordsHtml += '<div class="ircConversationKeyword">' + keyword + '</div> (' + json['searchResults'][i].keywords[keyword] + ')';
					keywordsHtml += '<div class="ircConversationKeyword">' + keyword + '</div>';
				}
				
				var duration = Math.floor(json['searchResults'][i].duration / 60);
				if (duration < 6) {
					if (json['searchResults'][i].startTime == json['searchResults'][i].endTime) {
						duration = "Mentioned once";
					} else {
						duration = "Less than 5 minutes";				
					}
				} else if (duration < 60) {
					duration += " minutes";
				} else {
					duration = Math.floor(duration / 60);
					if (duration == 1) {
						duration += " hour";
					} else {
						duration += " hours";
					}
				}
										
				jQuery('#searchResults').append(	'<div class="' + conversationClass + '" '
													+'onclick="ircLogSearch.selectConversation(this, \''+server+'\''
													+', \''+channel+'\''
													+', \'' + json['searchResults'][i].date+'\''
													+', \'' + json['searchResults'][i].startTime+'\''
													+', \'' + json['searchResults'][i].endTime+'\''
													+', \''+ uriString +'\');">'
													+' <div class="dateRow"><div class="date">' + json['searchResults'][i].date + '&nbsp;&nbsp;' + json['searchResults'][i].startTime + '-' + json['searchResults'][i].endTime + '</div></div>'
													+' <div><div class="ircConversationLabel">Duration:</div>' + duration + '</div>'
													+' <div><div class="ircConversationLabel">Keywords:</div><div class="ircConversationValues">' + keywordsHtml + '</div></div>'
													+' <div><div class="ircConversationLabel">Users:</div><div class="ircConversationValues">' + usersHtml + '</div></div>'
													+' <div class="selectedArrow">&gt;</div>'
													+'</div>');	
			}
											
			ircLogSearch.redrawWindow();				
				
		}
	});	
	
	return false;
};

ircLogSearch.redrawWindow = function() {
	  var windowHeight = 0;
	  if( typeof( window.innerWidth ) == 'number' ) {
	    //Non-IE
	    windowHeight = window.innerHeight;
	  } else if( document.documentElement && ( document.documentElement.clientWidth || document.documentElement.clientHeight ) ) {
	    //IE 6+ in 'standards compliant mode'
	    windowHeight = document.documentElement.clientHeight;
	  } else if( document.body && ( document.body.clientWidth || document.body.clientHeight ) ) {
	    //IE 4 compatible
	    windowHeight = document.body.clientHeight;
	  }
	  
	//var newHeight = windowHeight - 331;
	if (windowHeight < 200)
		windowHeight = 400;
		
	if (document.getElementById('leftNavigationAccordion'))
		document.getElementById('leftNavigationAccordion').style.height = (windowHeight - 212) + "px";	

	if (document.getElementById('ircLogSearchResultsLogViewWrapper'))	
		document.getElementById('ircLogSearchResultsLogViewWrapper').style.height = (windowHeight - 70) + "px";	

}	
