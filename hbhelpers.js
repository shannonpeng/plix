function hbsHelpers(hbs) {
    return hbs.create({
        helpers: {
            // coord: function(from, tox, toy) {
            //     var coords = '';
            //     for(var i = 0; i < tox; i ++){
            //         for(var j = 0; j < toy; j ++){
            //             coords += block.fn(i);
            //         }
            //         coords += block.fn(i);
            //     }
            //     console.log(i);
            //     return coords;
            },
        extname: '.hbs'
    });
}

module.exports = hbsHelpers;
