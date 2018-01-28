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
            randomPaletteColor: function() {
                var options = ["#ececec"];
                return options[Math.floor(Math.random()*options.length)];
            },
            pixelDate: function(number) {
                var string = number.toString();
                var date = string.substring(4, 6) + '/' + string.substring(6, 8) + '/' + string.substring(0,4);
                return date;
            }

        },
        extname: '.hbs'
    });
}
module.exports = hbsHelpers;
