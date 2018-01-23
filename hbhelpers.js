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
            }
        },
        extname: '.hbs'
    });
}
module.exports = hbsHelpers;
