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
