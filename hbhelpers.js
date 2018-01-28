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
            pixelDate: function(d) {
                var date = new Date(0); // first set to epoch
                date.setUTCMilliseconds(d); // add epoch seconds
                var options = {
                    month: "short", day: "numeric", year: "numeric",
                };
                var string = date.toLocaleDateString("en-us", options)
                return string
            }

        },
        extname: '.hbs'
    });
}
module.exports = hbsHelpers;
