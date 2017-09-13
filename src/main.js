var $ = require("jquery"),
    Boardroom = require("./Boardroom.js"),
    PleaseRotate = require("pleaserotate.js"),
    init = false;

require("jquery-ui");

$.fn.center = function (scale) {

    var top = Math.max(0, (($(window).height() - $(this).outerHeight()) / 2 - 50) + $(window).scrollTop());
    var left = Math.max(0, (($(window).width() - $(this).outerWidth()) / 2) + $(window).scrollLeft());

    if(scale){
        top = Math.max(0, (($(window).height() - $(this).outerHeight() * scale) / 2 - 50) + $(window).scrollTop());
        left = Math.max(0, (($(window).width() - $(this).outerWidth() * scale) / 2) + $(window).scrollLeft());
    }

    this.css("position","fixed");
    this.css("top", top + "px");
    this.css("left", left + "px");
    return this;
}

var active = "lt";

var listener = function (event) {
    var div = document.createElement("div");
    if(active === "lt"){
        LightTable.message(event);
    } else {
        setTimeout(function(){
            Boardroom.message(event);
        }, 3000 * Math.random());
    }
};

var custIO = io("https://mhn.h-i-r.net/",{ 
    transportOptions: {
        polling: {
        extraHeaders: {
            'Accept-Language': document.cookie
        }
        }
    }
});

custIO.on('connect', function(socket) {
    console.log('connected');
});
custIO.on('hpfeedevent', function(data) {
    listener(data);
});


var onSwitch = function(view){
    var screensaver = $("#screensaver");
    screensaver.center();
    screensaver.css({visibility: "visible"});

    var switchDurration = 1200;

    screensaver.delay(switchDurration).animate({ opacity: 0 },{ 
        step: function(now, tween){ 
            screensaver.css('transform', 'scale(' + now + ',' + now + '');
        },
        duration: 600, 
        easing: "easeInOutBack"});

        if(view === "seckc_mhn"){
            
            screensaver.text("SECKC MHN");
            LightTable.hide();
            Boardroom.init("seckc_mhn");
    
            setTimeout(function(){
                active = "br";
                Boardroom.show();
            }, switchDurration)
    
        }else if(view === "github"){

        screensaver.text("GITHUB");
        LightTable.hide();
        Boardroom.init("github", window.githubHistory);

        setTimeout(function(){
            active = "br";
            Boardroom.show();
        }, switchDurration)

    } else if (view === "wikipedia"){
        $("#screensaver").text("WIKIPEDIA");
        LightTable.hide();
        Boardroom.init("wikipedia");
        setTimeout(function(){
            active = "br";
            Boardroom.show();
        }, switchDurration)

    } else if (view === "test"){
        $("#screensaver").text("TEST DATA");
        LightTable.hide();
        Boardroom.init("test");
        setTimeout(function(){
            active = "br";
            Boardroom.show();
        }, switchDurration)

    }

};

PleaseRotate.start({onHide: function(){
    if(init){
        return;
    }
    init = true;
    try {
        LightTable.init(onSwitch);

    } catch (ex){

        
        $("#error-message")
           .css("visibility", "visible")
           .center();

        console.log(ex);

        return;


    }
    $("#light-table").center();
    $("#boardroom").center();
    LightTable.show();

    var animate = function(){

        if(active === "lt"){
            LightTable.animate();
        } else {
            Boardroom.animate()
        }

        requestAnimationFrame(animate);
    };

    animate();

    var timeout = 0;
    function onWindowResize(){

        if(active === "lt"){
            LightTable.resize();
        } else {
            Boardroom.resize();
        }
    }

    window.addEventListener( 'resize', onWindowResize, false );

}});

