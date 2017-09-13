var $ = require("jquery"),
    pushercolor = require("pusher.color"),
    moment = require("moment"),
    LightTable = require("./LightTable.js"),
    EncomGlobe = require("encom-globe"),
    SimpleClock = require("./SimpleClock.js"),
    SatBar = require("./SatBar.js"),
    TimerTrees = require("./TimerTrees.js"),
    StockChart = require("./StockChart.js"),
    StockChartSmall = require("./StockChartSmall.js"),
    Logo = require("./Logo.js"),
    _ = require("lodash/lodash.min.js")
    attackerMap = null;

moment.tz = require("moment-timezone");

var boardroomActive = false, 
    globe, 
    satbar, 
    simpleclock, 
    startDate, 
    box, 
    swirls, 
    sliderHeads, 
    slider, 
    stockchart,
    lastTime, 
    screensaver, 
    locationAreas, 
    locationAreaColors = [], 
    interactionContainer,
    topattacksContainer,
    logo,
    blinkies,
    blinkiesColors = ["#000", "#ffcc00", "#00eeee", "#fff"],
    picIndex = 0,
    currentPics = [],
    lastPicDate = Date.now(),
    streamType,
    readmeContainer,
    authenticatedUser = false;

sliderHeads = {};
var Boardroom = {};

Boardroom.init = function(_streamType, data){

    streamType = _streamType;
    blinkies = $('.blinky');
    mediaBoxes = $('.media-box .user-pic');

    var ratio = $(window).width() / 1918;
    $("#boardroom").css({
        "zoom": ratio,
        "-moz-transform": "scale(" + ratio + ")",
        "-moz-transform-origin": "0 0"
    });
    $("#boardroom").center(ratio);

    readmeContainer = $("#boardroom-readme-" + _streamType);

    //Boardroom.data = data;


    $("#fullscreen-link").click(function(e){
        e.preventDefault();
        var el = document.documentElement, 
            rfs = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen;

        rfs.call(el);

    });

    $("#info-link").click(function(e){
        e.preventDefault();
        showReadme();
    });

    $(".boardroom-readme h2 em").click(function(e){
        e.preventDefault();
        hideReadme();
    });

    setInterval(function(){
        if(boardroomActive){
            $("#las-vegas-time").text(moment().tz("America/Los_Angeles").format("HH:mm:ss"));
            $("#kansas-city-time").text(moment().tz("America/Chicago").format("HH:mm:ss")),
            $("#london-time").text(moment().tz("Europe/London").format("HH:mm:ss"));
            $("#berlin-time").text(moment().tz("Europe/Berlin").format("HH:mm:ss"));
            $("#bangalore-time").text(moment().tz("Asia/Colombo").format("HH:mm:ss"));
            $("#sydney-time").text(moment().tz("Australia/Sydney").format("HH:mm:ss"));
        }
    }, 1000);

    locationAreas = {
        antarctica: {count: 10, ref: $("#location-area-antarctica")},
        northamerica: {count: 10, ref: $("#location-area-northamerica")},
        southamerica: {count: 10, ref: $("#location-area-southamerica")},
        europe: {count: 10, ref: $("#location-area-europe")},
        asia: {count: 10, ref: $("#location-area-asia")},
        australia: {count: 10, ref: $("#location-area-australia")},
        africa: {count: 10, ref: $("#location-area-africa")},
        other: {count: 10, ref: $("#location-area-other")},
        unknown: {count: 10, ref: $("#location-area-unknown")}
    };

    $("#user-interaction-header").text(streamType.toUpperCase() + " LIVE DATA FEED");
    $("#globalization-header").text(streamType.toUpperCase() + " GLOBALIZATION");
    $("#growth-header").text(streamType.toUpperCase() + " EVENTS :: LAST 24 HOURS");
    // $("#media-header").text(streamType.toUpperCase() + " USERS");

    $("#ticker-text").text(streamType.toUpperCase());
    if(streamType.length > 6){
        $("#ticker-text").css("font-size", "12pt");
    }

    if(data){
        $("#ticker-value").text(formatYTD(data[0].events, data[data.length-1].events));
    }

    setInterval(function(){
        if(boardroomActive){
            for(var a in locationAreas){
                var loc = locationAreas[a];
                loc.count = loc.count -1;
                loc.count = Math.max(loc.count, 0);

                loc.ref.css("background-color", locationAreaColors[loc.count]);

            }
        }
    }, 3000);

    initAuth();

    interactionContainer = $("#interaction > table > tbody");
    topattacksMessage = $("#media-top > h3");
    topattacksContainer = $("#media-top > table > tbody");
    attackerContainer = $("#attacker-data");
    attackerContainerHeader = $("#media-bottom > h3");

    for(var i = 0; i< 50; i++){
        interactionContainer.append('<tr class="interaction-data"></tr>');
    }
};

function initAuth(){
    $.ajax({
        url: "https://mhn.h-i-r.net/seckcapi" + "/auth/me",
      })
        .done(function( data ) {
            authenticatedUser = data.active ? data.active : false;

        });
}

function getSensors(){
    return $.ajax({
        url: "https://mhn.h-i-r.net/api/sensor/",
      })
        .done(function( data ) {
            if(data.length && data.length > 0){
                data.forEach(function(sensor){
                    getSensorLocation(sensor);
                })
            }
        });
}

function getSensorLocation(sensor){
    $.ajax({
        url: "https://mhn.h-i-r.net/seckcapi"+ "/geocode/" + sensor.ip//"https://mhn.h-i-r.net/seckcapi" + "/geocode/" + sensor.ip,
      })
        .done(function( data ) {
            
            var lat = data.location.latitude ? data.location.latitude : "0",
                lon = data.location.longitude ? data.location.longitude : "0";
            
            var opts = {
                coreColor: "#BF92FF",
                numWaves: 4
            }
            
            globe.addSatellite(lat, lon, 1.4 + Math.random()/10, opts/* opts, texture, animator*/);
        });
}

function getTopAttackers(){
    return $.ajax({
        url: "https://mhn.h-i-r.net/api/top_attackers/?hours_ago=24",
      })
        .done(function( data ) {
            //topattacksContainer
            topattacksMessage.remove();
            topattacksContainer[0].innerHTML = "";
            data.data.forEach(function(attacker){
                if(topattacksContainer){
                    var lastChild = document.createElement("tr"); 
                    lastChild.onclick = function(){
                        getAttackerStats(attacker.source_ip);
                    };
                    lastChild.classList.add("interaction-data", "attacker");
                    lastChild.innerHTML = '<td class="interaction-username">' + attacker.count + '</td>' + 
                        '<td class="interaction-title">' + attacker.source_ip + '</td>' + 
                        '<td class="interaction-type">' + attacker.honeypot + '</td>';
                    topattacksContainer.append(lastChild);
                }
            });
        });
}//https://mhn.h-i-r.net/api/attacker_stats/104.192.3.34/
function getAttackerStats(attackIP){
    $.ajax({
        url: "https://mhn.h-i-r.net/api/attacker_stats/" + attackIP + "/",
      })
        .done(function( data ) {
            //topattacksContainer
            attackerContainerHeader[0].setAttribute("style", "display:none;");
            if(attackerContainer){
                attackerContainer[0].innerHTML = "";
                var lastChild = document.createElement("div"); 
                lastChild.classList.add("interaction-data");
                lastChild.innerHTML = '<ul><li class="interaction-type">' + attackIP + '</li></ul>' + 
                    '<ul><li class="interaction-username"><span class="interaction-username">Count:</span> <span class="interaction-title">' + data.data.count + '</span></li></ul>' + 
                    '<ul><li class="interaction-type"><span class="interaction-username">Seen by:</span> <span class="interaction-title">' + data.data.num_sensors + '</span></li></ul>' +
                    '<ul><li class="interaction-type"><span class="interaction-username">Ports:</span> <span class="interaction-title">' + data.data.ports.join(", ") + '</span></li></ul>' +
                    '<ul><li class="interaction-type"><span class="interaction-username">First seen:</span><br><span class="interaction-title">' + moment.utc(data.data.first_seen).fromNow() + '</span></li></ul>' +
                    '<ul><li class="interaction-type"><span class="interaction-username">Last seen:</span><br><span class="interaction-title">' + moment.utc(data.data.last_seen).fromNow() + '</span></li></ul>';
                attackerContainer.append(lastChild);
            }
            
        });
    getAttackerLocation(attackIP);
}
window.getAttackerStats = getAttackerStats;

function getSensorStats(){
    Boardroom.data = [];
    var test = {};
    var yesterdaysHours = [];
    var today = moment.utc();
    var yesterday = moment.utc().subtract(1, 'days');

    $('#ticker-sensor').text(today.year());

    var currentUTCHours = moment.utc().hours();

    for(var h = 0; h < 24; h++){
        test[h] = 0;
    }
    for(var yh = currentUTCHours + 1; yh < 24; yh++){
        yesterdaysHours.push(yh);
    }

    var getYesterday = $.ajax({
        url: "https://mhn.h-i-r.net/seckcapi" + "/stats/?date=" + yesterday.format("YYYYMMDD")//"https://mhn.h-i-r.net/seckcapi" + "/stats/",
      })
        .done(function( data ) {
            _.forEach(data, function(set){
                _.forEach(set.hourly,function(value, key){
                    if(yesterdaysHours.indexOf(parseInt(key, 10)) > -1){
                        test[key] += value;
                    }
                });
            });
            _.forEach(test, function(count, key){
                if(yesterdaysHours.indexOf(parseInt(key, 10)) > -1){
                    year = yesterday.format("YYYY");
                    month = yesterday.format("MM");
                    day = yesterday.format("DD");

                    Boardroom.data.push({
                        year: year,
                        month: month,
                        day: day,
                        hour: key,
                        date: moment.utc([yesterday.year(), yesterday.month(), yesterday.date(), parseInt(key, 10)]),
                        events: count
                    });
                }
            });
        });

    var getToday = $.ajax({
        url: "https://mhn.h-i-r.net/seckcapi" + "/stats/?date=" + today.format("YYYYMMDD")//"https://mhn.h-i-r.net/seckcapi" + "/stats/",
      })
        .done(function( data ) {
            _.forEach(data, function(set){
                _.forEach(set.hourly,function(value, key){
                    if(parseInt(key, 10) <= currentUTCHours){
                        test[key] += value;
                    }
                });
            });
            _.forEach(test, function(count, key){
                if(parseInt(key, 10) <= currentUTCHours){
                    year = today.format("YYYY");
                    month = today.format("MM");
                    day = today.format("DD");

                    Boardroom.data.push({
                        year: year,
                        month: month,
                        day: day,
                        hour: key,
                        date: moment.utc([today.year(), today.month(), today.date(), parseInt(key, 10)]),
                        events: count
                    });
                }
            });  
        });

        $.when(getYesterday, getToday).then(function(){
            Boardroom.data = _.sortBy(Boardroom.data,function(datum){
                return datum.date.valueOf();
            });
            stockchart = new StockChart("stock-chart", {data: Boardroom.data, ticks: 4});
        })
}

var attackmarker = null;
function getAttackerLocation(attackIP){
    if(attackmarker !== null){
        attackerMap.removeLayer(attackmarker);
    }
    
    $.ajax({
        url: "https://mhn.h-i-r.net/seckcapi" + "/geocode/" + attackIP//"https://mhn.h-i-r.net/seckcapi" + "/geocode/" + attackIP,
      })
        .done(function( data ) {
            var lat = data.location.latitude ? data.location.latitude : "0",
                lon = data.location.longitude ? data.location.longitude : "0";
            attackerMap.setView([lat, lon], 9);
            attackmarker = L.marker([lat, lon]).addTo(attackerMap);
        });
}

function getActivity(){
    return $.ajax({
        url: "https://mhn.h-i-r.net/api/intel_feed/?hours_ago=24",
      })
        .done(function( data ) {
            console.log(data);
        });
}

Boardroom.show = function(cb){
    startDate = moment();//new Date();
    lastTime = Date.now();

    $("#boardroom").css({"visibility": "visible"});
    for(var i = 0; i< 20; i++){
        locationAreaColors[i] = pushercolor('#00eeee').blend('#ffcc00', i/20).hex6();
    }

    //animate();

    // render the other elements intro animations

    $(".footer-bar").delay(1000).animate({"margin-top": "0"}, 500);

    $("#globe-footer img").delay(1500).animate({"opacity": "1"}, 1000);

    $("#globalization").delay(600).animate({
        top: "0px",
        left: "0px",
        width: "180px"
    }, 500);

    $("#globalization .location-slider").each(function(index, element){
        $(element).delay(600 + index * 200).animate({
            width: "180px"
        }, 1000);
    });

    $("#logo-cover-up").delay(3000).animate({
        height: "0px"
    }, 2500);

    $("#logo-cover-side-1").delay(3000).animate({
        left: "200px"
    }, 2500);

    $("#logo-cover-side-2").delay(3000).animate({
        width: "0px"
    }, 2500);

    $("#user-interaction").delay(500).animate({
        width: "600px"
    }, 1500);

    $("#growth").delay(1000).animate({
        width: "600px"
    }, 1500);

    $("#media").delay(1500).animate({
        width: "450px"
    }, 1500);

    $("#timer").delay(2000).animate({
        width: "450px"
    }, 1500);

    $("#bottom-border").delay(100).animate({
        width: "1900px"
    }, 2000);

    // addSatellite(lat, lon, altitude, opts, texture, animator)
    // var opts = {
    //     numWaves: 8,
    //     waveColor: "#FFF",#725798
    //     coreColor: "#FF0000",
    //     shieldColor: "#FFF",
    //     size: 1
    // }
    
    if(authenticatedUser === true){
        $.when(getSensors(),getTopAttackers(), getSensorStats()).then(function(){
            //console.log("all done");
        });
        //getTopAttackers
        setInterval(getTopAttackers, 1000 * 60);
        setInterval(getSensorStats, 1000 * 60);
    }

    setInterval(function(){
        satbar.setZone(Math.floor(Math.random()*4-1));
    }, 7000);

    setTimeout(function(){
        globe.addMarker(36.114647, -115.172813, "LV");
        globe.addMarker(39.114, -94.627, "KC");
        globe.addMarker(41.600545, -93.609106, "DSM");
        globe.addMarker(38.907192, -77.036871, "DC");
        attackerMap = L.map('attacker-map',{zoomControl:false}).setView([0, 0], 1);
        L.tileLayer('https://api.mapbox.com/styles/v1/wintelseckc/cj7c70wocaonm2spgkpuubn9y/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoid2ludGVsc2Vja2MiLCJhIjoiY2o3OWNkcWUyMDBjdzJ3cnNydGl0Nml6NCJ9.iLffndfFTZeV3I5VVF3-kA', {
            attribution: '&copy; <a href="http://openstreetmap.org">OpenStreetMap</a>, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, © <a href="http://mapbox.com">Mapbox</a>',
            maxZoom: 18,
            // id: 'Dark-encom',
            // accessToken: 'pk.eyJ1Ijoid2ludGVsc2Vja2MiLCJhIjoiY2o3OWNkcWUyMDBjdzJ3cnNydGl0Nml6NCJ9.iLffndfFTZeV3I5VVF3-kA'
        }).addTo(attackerMap);
    }, 2000);

    globe = new EncomGlobe(800, 800, {
        tiles: grid.tiles,
        pinColor: "#8FD8D8",
        viewAngle: .1,
        baseColor: "#000000",
        pointsPerDegree: 4
    });
    $("#globe").append(globe.domElement);


    simpleclock = new SimpleClock("simpleclock");

    globe.init(function(){
        // called after the globe is complete

        // give anything else on the other side a second before starting
        setTimeout(function(){
            satbar = new SatBar("satbar");
            timertrees = new TimerTrees("timer-trees");
            //stockchart = new StockChart("stock-chart", {data: Boardroom.data});
            stockchartsmall = new StockChartSmall("stock-chart-small", {data: Boardroom.data});
            logo = new Logo("logo", streamType.toUpperCase());
            boardroomActive = true;
        }, 1000);

        if(typeof cb === "function"){
            cb();
        }
    });

};

Boardroom.hide = function(){
    boardroomActive = false;

    box = null;
    satbar = null;
    timertrees =null;
    stockchart = null;
    stockchartsmall = null;
    swirls = null;
    logo = null;

    LightTable.show();
};

Boardroom.animate = function(){
    if(boardroomActive){
        var animateTime = Date.now() - lastTime;
        lastTime = Date.now();

        globe.tick();
        satbar.tick();
        $("#clock").text(getTime());
        simpleclock.tick();
        if(stockchart !== undefined){
            stockchart.tick();
        }
        updateSliders(animateTime);
    }

};

Boardroom.message = function(message){
    
        if(!globe){
            return;
        }
    
        if(message.latlon){
            var latlon = message.latlon;
            globe.addPin(latlon.lat, latlon.lon, message.location);
        }
        
        if(message.picSmall || message.picLarge){
            addPic(message);
        }
    
        if(message.commands && swirls){
            swirls.hit(message.commands.join(", "));
        }

        message.title = message.peerIP || message.attackerIP || message.remote_host;
        message.displayHostPort = message.hostPort || message.victimPort || "";
        message.displayActivity = message.loggedin || message.connectionType || "";
    
        changeBlinkies();
     
        if(interactionContainer && interactionContainer[0].lastChild){
            var lastChild = interactionContainer[0].lastChild;
            lastChild.innerHTML = '<td class="interaction-username">' + (message.loggedin ? message.loggedin.join(", ") : message.displayActivity) + '</td>' + 
                '<td class="interaction-title">' + message.title + '</td>' + 
                '<td class="interaction-type">' + message.displayHostPort + '</td>' + 
                '<td class="interaction-popularity">' + (message.startTime ? message.startTime : "")+ '</td>';
    
            interactionContainer[0].insertBefore(interactionContainer[0].lastChild, interactionContainer[0].firstChild);
        }

        $.ajax({
            url: "https://mhn.h-i-r.net/seckcapi" + "/geocode/" + (message.peerIP || message.attackerIP || message.remote_host),
          })
            .done(function( data ) {
                message.ipinfo = data;
                
                message.latlon = {
                    lat:data.location.latitude ? data.location.latitude : "0",
                    lon:data.location.longitude ? data.location.longitude : "0"
                }
                globe.addPin(data.location.latitude, data.location.longitude, data.city ? data.city.names.en : "");
                createZipdot(message)
            });
    
    };
// Boardroom.message = function(message){

//     if(message.stream != streamType || !globe){
//         return;
//     }

//     if(message.latlon){
//         var latlon = message.latlon;
//         globe.addPin(latlon.lat, latlon.lon, message.location);
//     }
    
//     if(message.picSmall || message.picLarge){
//         addPic(message);
//     }

//     if(message.type && swirls){
//         swirls.hit(message.type);
//     }

//     changeBlinkies();
 
//     if(interactionContainer && interactionContainer[0].lastChild){
//         var lastChild = interactionContainer[0].lastChild;
//         lastChild.innerHTML = '<li class="interaction-username">' + message.username + '</li>' + 
//             '<li class="interaction-title">' + message.title + '</li>' + 
//             '<li class="interaction-type">' + (message.type ? message.type : "") + '</li>' + 
//             '<li class="interaction-size">' + (message.size ? message.size : "") + '</li>' + 
//             '<li class="interaction-popularity">' + (message.popularity ? message.popularity : "")+ '</li>';

//         if(message.popularity > 100){
//             lastChild.innerHTML = '<li class="interaction-popular">!</li>' + lastChild.innerHTML;
//         }

//         interactionContainer[0].insertBefore(interactionContainer[0].lastChild, interactionContainer[0].firstChild);
//     }

//     createZipdot(message);


// };

Boardroom.resize = function(){
    var ratio = $(window).width() / 1918;
    $("#boardroom").css({
        "zoom": ratio,
        "-moz-transform": "scale(" + ratio + ")",
        "-moz-transform-origin": "0 0"
    });

    $("#boardroom").center(ratio);
};

function showReadme() {

    var itemContent = readmeContainer.find(".content");

    readmeContainer.removeAttr("style");

    var height = readmeContainer.height();
    var width = readmeContainer.width();
    var left = ($(window).width() - 500)/ 2;
    var top = ($(window).height() - 500) / 2;

    var border = readmeContainer.css("border");
    var boxShadow = readmeContainer.css("box-shadow");

    var contentBorder = itemContent.css("border");
    var contentBoxShadow = itemContent.css("box-shadow");

    itemContent.children().each(function(index, element){
        $(element).css("visibility", "hidden");
    });

    readmeContainer.height(0)
    .width(0)
    .css("top", top + height/2)
    .css("left", left + width/2)
    .css("visibility", "visible");


    readmeContainer.animate({
        height: height,
        width: "500px",
        left: left,
        top: top

    }, 500);
    readmeContainer.css({
        opacity: 1
    });

    setTimeout(function(){

        itemContent.children().each(function(index, element){
            $(element).css("visibility", "visible");
        });


    }, 1000);

}

function hideReadme(){
    readmeContainer.css("visibility", "hidden");
    readmeContainer.children().each(function(index, element){
        $(element).removeAttr("style");
        $(element).children().each(function(index, element){
            $(element).removeAttr("style");
        });
    });
}

function createZipdot(message){

    var area = "unknown";

    if(message.latlon){
        area = findArea(message.latlon.lat, message.latlon.lon);
        $("#location-city-" + area).text(message.ipinfo.city ? message.ipinfo.city.names.en : "");
    }

    locationAreas[area].count = locationAreas[area].count + 1;
    locationAreas[area].count = Math.min(19,locationAreas[area].count);
    locationAreas[area].ref.css("background-color", locationAreaColors[locationAreas[area].count]);

    $("#location-slider-" + area + " ul :first-child").css("margin-left", "-=5px");
    $("#location-slider-" + area + " ul").prepend("<li style='color: " + locationAreaColors[locationAreas[area].count] + "'></li>");
    sliderHeads[area] = {area: area, element: $("#location-slider-" + area + " ul :first-child"), margin: 0}; 

};

function changeBlinkies(){
    $(blinkies[Math.floor(Math.random() * blinkies.length)]).css('background-color', blinkiesColors[Math.floor(Math.random() * blinkiesColors.length)]);
}

function addPic(data){
    var pic = data.picSmall;
    var showPic = true;

    if(currentPics.length < 10 || Date.now() - lastPicDate > 2000){

        if($(mediaBoxes[picIndex]).width() > 100){
            pic = data.picLarge;
        }

        for(var i = 0; i< currentPics.length && showPic; i++){
            if(pic.indexOf("http") === 0 && (currentPics[i] == data.picSmall || currentPics[i] == data.picLarge)){
                showPic = false;
            }
        }

        if(showPic){



            var profileImageLoaded = function(ui){
                var mb = $(mediaBoxes[ui]);
                mb.css('background-image', 'url(' + pic + ')');
                mb.find('span').text(data.username);
                mb.off();
                mb.click(function(){window.open(data.userurl, "_blank")});
            };

            if(pic.indexOf("http") === 0){
                var img = document.createElement('img');
                img.addEventListener('load', profileImageLoaded.bind(this, picIndex));
                img.src = pic;
            } else {
                profileImageLoaded(picIndex);
            }

            currentPics[picIndex] = pic;

            picIndex++;
            picIndex = picIndex % 10;

            lastPicDate = Date.now();

        }
    }
}


function updateSliders(animateTime){

    var incDistance = Math.floor(200 * animateTime / 1000);

    var rem = [];
    for(var s in sliderHeads){
        var slider = sliderHeads[s];
        slider.margin += incDistance;
        if(slider.margin > 200){
            rem.push(slider);
        } else {
            slider.element.css("margin-left", slider.margin + "px"); 
        }
    }

    for(var i = 0; i< rem.length; i++){
        delete sliderHeads[rem[i].area];
        rem[i].element.siblings().remove();
    }

    if(Math.random()<.1){
        $(".location-slider ul").each(function(index, val){
                var ch = $(val).children();
                if(ch.length > 10){
                ch.slice(10-ch.length).remove();
                }
                });
    }
}

function findArea(lat, lng){
    if(lat <= -40){
        return "antarctica";
    }
    if(lat > 12 && lng > -180 && lng < -45){
        return "northamerica";
    }
    if(lat <= 12 && lat > -40 && lng > -90 && lng < -30){
        return "southamerica";
    }
    if(lat < -10 && lng >= 105 && lng <=155){
        return "australia";
    }
    if(lat > 20 && lng >= 60 && lng <=160){
        return "asia";
    }
    if(lat > 10 && lat < 40 && lng >= 35 && lng <=60){
        return "asia";
    }
    if(lat > -40 && lat < 35 && lng >= -20 && lng <=50){
        return "africa";
    }
    if(lat >= 35 && lng >= -10 && lng <=40){
        return "europe";
    }

    return "other";
}


function getTime(){

    var now = moment.duration(moment().diff(startDate));
    //var elapsed = startDate;

    // var mili = Math.floor((elapsed/10) % 100);
    var seconds = Math.floor(now.seconds());//Math.floor((elapsed / 1000) % 60); 
    var minutes = Math.floor(now.minutes());//Math.floor((elapsed / 60000) % 100); 
    var hours = Math.floor(now.hours());//Math.floor((elapsed / 3600000) % 100); 

    return (hours < 10 ? "0":"") + hours + ":" + (minutes < 10 ? "0":"") + minutes + ":" + (seconds< 10? "0": "") + seconds /*+ ":" + (mili < 10? "0" : "") + mili*/;

}

function formatYTD(first, last){
    var percentage = 100 * (((last- first) / first) - 1);
    var output = percentage.toFixed(1) + "%";
    if(percentage > 0 && percentage < 100){
        output = "+" + output;
    }

    return output;
};

module.exports =  Boardroom;

