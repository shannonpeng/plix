var hbsHelpers =
{
    substring: function(string, start, end) {
       var s = string.substring(start, end);
       return s;
    },
    lightDarkText: function(hex) {
      if (hex.length != 7) { // #234567
          return false;
      }
      else { // http://www.nbdtech.com/Blog/archive/2008/04/27/Calculating-the-Perceived-Brightness-of-a-Color.aspx
        brightness = function(color) {
            color = color.substring(1);
            var R = parseInt(color.substring(0,2),16);
            var G = parseInt(color.substring(2,4),16);
            var B = parseInt(color.substring(4,6),16);
            return Math.sqrt(R * R * .241 + G * G * .691 + B * B * .068);
        }
        return brightness(hex) < 180 ? '#FFFFFF' : '#404040';
      }
    },
    lightenHex: function(hex, percent) {
      if (hex.length != 7) { // #234567
          return false;
      }
      else { // https://gist.github.com/renancouto/4675192
        hex = hex.substring(1);
        var num = parseInt(hex,16),
            amt = Math.round(2.55 * percent),
              R = (num >> 16) + amt,
              B = (num >> 8 & 0x00FF) + amt,
              G = (num & 0x0000FF) + amt;
            return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
        }
    },
    darkenHex: function(hex, percent) {
      if (hex.length != 7) { // #234567
          return false;
      }
      else { // https://gist.github.com/renancouto/4675192
        hex = hex.substring(1);
        percent = -1 * percent;
        var num = parseInt(hex,16),
            amt = Math.round(2.55 * percent),
              R = (num >> 16) + amt,
              B = (num >> 8 & 0x00FF) + amt,
              G = (num & 0x0000FF) + amt;
            return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
        }
    },
    boardInitials: function(string) {
       var subs = string.split(" ");
       var s = "";
       for (var i = 0; i < subs.length; i++) {
            s += subs[i].substring(0,1);
       }
       return s;
    },
    formatUsers: function(count) {
        if (count == 1) { return "1 user"; }
        else { return count.toString() + " users"; }
    },
    pixelDate: function(d) {
        var date = new Date(0); // first set to epoch
        date.setUTCMilliseconds(d); // add epoch seconds
        var options = {
            month: "short", day: "numeric", year: "numeric",
        };
        var string = date.toLocaleDateString("en-us", options)
        return string
    },
    relativeTime: function(d) {
        // returns timestamp in natural language
    	var seconds = (new Date()).getTime() / 1000 - d/1000;
    	var minutes = seconds / 60;
    	var hours = seconds / (60*60);
    	var days = seconds / (24*60*60);
    	var weeks = seconds / (7*24*60*60);
    	var months = seconds / (30*24*60*60);
    	var years = seconds / (12*30*24*60*60);
    	if (seconds < 60) {
    		if (Math.floor(seconds) == 1) {
    			return Math.floor(seconds) + " second ago";
    		}
    		return Math.floor(seconds) + " seconds ago";
    	}
    	if (minutes < 60) {
    		if (Math.floor(minutes) == 1) {
    			return Math.floor(minutes) + " minute ago";
    		}
    		return Math.floor(minutes) + " minutes ago";
    	}
    	if (hours < 24) {
    		if (Math.floor(hours) == 1) {
    			return Math.floor(hours) + " hour ago";
    		}
    		return Math.floor(hours) + " hours ago";
    	}
    	if (days < 7) {
    		if (Math.floor(days) == 1) {
    			return "Yesterday";
    		}
    		return Math.floor(days) + " days ago";
    	}
    	if (weeks < 5) {
    		if (Math.floor(weeks) == 1) {
    			return Math.floor(weeks) + " week ago";
    		}
    		return Math.floor(weeks) + " weeks ago";
    	}
    	if (months < 12) {
    		if (Math.floor(months) == 1) {
    			return Math.floor(months) + " month ago";
    		}
    		return Math.floor(months) + " months ago";
    	}
    	if (Math.floor(years) == 1) {
    		return Math.floor(years) + " year ago";
    	}
    	return Math.floor(years) + " years ago";
    },
    pixelDate: function(number) {
        var string = number.toString();
        var date = string.substring(4, 6) + '/' + string.substring(6, 8) + '/' + string.substring(0,4);
        return date;
    },
    round: function(number, places) {
        return Math.round(number*Math.pow(10, places)) / Math.pow(10, places);
    },
};

module.exports = hbsHelpers;
