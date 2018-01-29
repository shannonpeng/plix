function hbsHelpers(hbs) {
    return hbs.create({
        helpers: {
            substring: function(string, start, end) {
               var s = string.substring(start, end);
               return s;
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
            	var months = seconds / (4*7*24*60*60);
            	var years = seconds / (365*30*7*24*60*60);
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
            }
        },
        extname: '.hbs'
    });
}
module.exports = hbsHelpers;
