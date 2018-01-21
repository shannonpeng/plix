$(document).ready(function () {

    // Clouds
    function randomSign() {
        if (Math.random() < 0.5) { return -1; }
        return 1;
    }

    const NUM_CLOUDS = 36;
    const MAX_BOTTOM = 50;
    const MAX_DELAY = 48; // seconds
    const CLOUD_IMG_SRC = ["/images/cloud.png", "//orig13.deviantart.net/1f2e/f/2013/121/a/4/coffee_16x16_by_madgharr-d63qqlo.gif", "//orig00.deviantart.net/57b5/f/2016/195/3/9/pixel_art___watermelon_gif_by_mewkii-da9liv6.gif", "//i614.photobucket.com/albums/tt222/TheUltimateWhistle/28us51e_zps6dkjxelp.png"];
    const SPEEDS = ["slow-scroll", "medium-scroll", "fast-scroll"];
    const SCALES = [0.4, 0.6, 0.8];

    for (var i = 0; i < NUM_CLOUDS; i++) {
        var bottom = 50 + randomSign()*(20+Math.floor(Math.random()*MAX_BOTTOM));
        var delay = -1*Math.floor(Math.random()*MAX_DELAY*2*1000);
        var speed = SPEEDS[i % 3];
        var scale = SCALES[i % 3];
        if (Math.random() < 0.96) {
            $(".clouds").append("<img class='cloud " + speed + "' src='" + CLOUD_IMG_SRC[0] + "' style='bottom:" + bottom + "%;animation-delay:" + delay + "ms; transform: scale(" + scale + "); z-index: " + scale*10 + ";'/>");
        }
        else {
            $(".clouds").append("<img class='cloud " + SPEEDS[2] + "' src='" + CLOUD_IMG_SRC[1 + (i % (CLOUD_IMG_SRC.length - 1))] + "' style='bottom:" + bottom + "%;animation-delay:" + delay + "ms; z-index: " + SCALES[2]*10 + ";'/>");
        }
        
    }
});