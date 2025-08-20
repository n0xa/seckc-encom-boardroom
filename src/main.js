var $ = require("jquery"),
    Boardroom = require("./Boardroom.js"),
    PleaseRotate = require("pleaserotate.js"),
    config = require("./config.js"),
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

// Data delivery system - supports both WebSocket and REST polling
var lastEventTimestamp = 0;
var pollingTimer = null;
var custIO = null;
var currentPollingInterval = 1000;

function resetPollingInterval() {
    currentPollingInterval = 1000;
}

function doublePollingInterval() {
    currentPollingInterval = Math.min(currentPollingInterval * 2, config.MAX_POLLING_INTERVAL);
}

function startRestPolling() {
    console.log('Starting REST API polling with exponential backoff (max:', config.MAX_POLLING_INTERVAL/1000, 'seconds)');
    
    function pollForEvents() {
        var url = config.API_BASE_URL + 'feeds/events/recent?since=' + lastEventTimestamp;
        
        $.ajax({
            url: url,
            method: 'GET',
            timeout: 5000,
            success: function(response) {
                if (response.events && response.events.length > 0) {
                    console.log('Received', response.events.length, 'new events via REST API');
                    
                    response.events.forEach(function(eventData) {
                        listener(eventData.event);
                        lastEventTimestamp = Math.max(lastEventTimestamp, eventData.timestamp);
                    });
                    
                    resetPollingInterval();
                } else {
                    doublePollingInterval();
                }
                
                console.log('Next poll in', currentPollingInterval/1000, 'seconds');
                pollingTimer = setTimeout(pollForEvents, currentPollingInterval);
            },
            error: function(xhr, status, error) {
                console.error('REST polling error:', error);
                doublePollingInterval();
                pollingTimer = setTimeout(pollForEvents, currentPollingInterval);
            }
        });
    }
    
    pollForEvents();
}

function startWebSocket() {
    console.log('Starting WebSocket connection to:', config.API_BASE_URL);
    
    custIO = io(config.API_BASE_URL, { 
        transportOptions: {
            polling: {
                extraHeaders: {
                    'Accept-Language': document.cookie
                }
            }
        }
    });

    custIO.on('connect', function(socket) {
        console.log('WebSocket connected to:', config.API_BASE_URL);
    });

    custIO.on('disconnect', function(reason) {
        console.log('WebSocket disconnected:', reason);
    });

    custIO.on('connect_error', function(error) {
        console.error('WebSocket connection error:', error);
    });

    custIO.on('hpfeedevent', function(data) {
        console.log('Received hpfeedevent via WebSocket:', data);
        listener(data);
    });
}

// Initialize data delivery based on configuration
if (config.DELIVERY_METHOD === "polling") {
    startRestPolling();
} else {
    startWebSocket();
}


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

