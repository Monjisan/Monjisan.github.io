﻿var map, pos = new vector(), getpos = new vector();
var roadMap = {rail:[], way:[]};
var defPos = new google.maps.LatLng(-34.397, 150.644);
var center, field;
var fixed = true;

var move = new vector();
var markerMove = false;
var nearRail;
var accel = null;


// debug variable
var exec;
function initialize(){

  //debug function
exec = function(src){eval(src);};
  var error = function(e){
    $("#error").html('Error'+(e||""));
    console.error(e);
  };

  // get GPS sector
  var call = function(){
    navigator.geolocation.getCurrentPosition(cb, error);
  };
  var cb = function(position){
    // set marker position
    if(markerMove){
      pos = new vector(center.getPosition());
    }else{
      pos = new vector(position.coords.longitude, position.coords.latitude);
      pos = pos.add(move);
    }

    // make text
    var text = [
      "緯度：" + pos.y,
      "経度：" + pos.x,
      "高度：" + position.coords.altitude,
      "緯度/経度の誤差：" + position.coords.accuracy,
      "高度の誤差：" + position.coords.altitudeAccuracy,
      "方角：" + position.coords.heading,
      "速度：" + position.coords.speed
    ];

    // update position
    var c = pos.latLng();
    if(fixed){ map.setCenter(c); }
    if(!markerMove){ center.setPosition(c); }
    /*center.setCenter(c);*/
    nearRailPos = pos;
    var near = 100.0;
    for(var i=0;i<roadMap.rail.length;++i){
      var rails = roadMap.rail[i];
      for(var j=1;j<rails.length;++j){
        var l = new line(rails[j-1], rails[j]),
            dist = l.dist(pos);
        if(near>dist){
          near = dist;
          nearRailPos = l.center();
        }
      }
    }
    nearRail.setPosition(nearRailPos.latLng());

    $("#gps").html(text.join("<br>"));

    // set next action
    setTimeout(call, 1000);
  };


  // get acceleration sector
  var devicemotion = function(e){
    accel = e.acceleration;
    var text = [
      "加速度 X:" + accel.x,
      "加速度 Y:" + accel.y,
      "加速度 Z:" + accel.z
    ];
    $("#acc").html(text.join("<br>"));
  };



  // create path sector
  var path, d = 0.005, dv = new vector(d,d),
      railTag = "tag[k=railway][v=rail]",
      highwayTag = "tag[k=highway]",
  streetError = function(){
    $("#error").append('<br>StreetMapAPI Error');
  },
  getLine = function(){
    if(getpos.dist(pos) >= d/2){
      getpos = pos.copy();
      console.log("get new street map");
      $.ajax({
        url:"http://api.openstreetmap.org/api/"+
        "0.6/map?bbox="+
        getpos.sub(dv)+","+getpos.add(dv)
        ,type:"GET",
        success:setLine
        ,error:streetError
      });
    }
    setTimeout(getLine, 10000);
  },
  setLine = function(res){
    // reset map objects
    $("#xml").text(res);
    if(path)for(var i=0;i<path.length;++i){
      path[i].setMap(null);
    }
    path=[];
    roadMap.rail = [];
    roadMap.way  = [];
    
    // get and set way lines
    $(res).find("way").filter(function(){
      return $(this)
           .find(railTag/*+","+highwayTag*/)
           .length>0;
    }).each(function(){
      var nd=[];
      var isRail = $(this).find(railTag).length>0
      var color=isRail?"#000":"#666";
      $(this).find("nd").each(function(){
        var ndd=$(res).find("node[id="+
          $(this).attr("ref")+
          "]")
        nd.push(new google.maps.LatLng(
          ndd.attr("lat")-0,
          ndd.attr("lon")-0
          ));
      });
      var make = function(v){ return new vector(v); };
      if(isRail){ roadMap.rail.push(nd.map(make)); }
      else{ roadMap.way.push(nd.map(make)); }
      
      var p=new google.maps.Polyline({
        path:nd,strokeColor:color
      });
      path.push(p);
      p.setMap(map);
    });
    field.setBounds(new google.maps.LatLngBounds(getpos.sub(dv).latLng(), getpos.add(dv).latLng()));
  };




  // set google map
  var mapOptions = {
    center: defPos,
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map($("#map_canvas")[0], mapOptions);

  // set map object
  /*
  var circleOptions = {
    strokeColor: "#555599",
    strokeOpacity: 0.8,
    strokeWeight: 1,
    fillColor: "#9999FF",
    fillOpacity: 0.35,
    map: map,
    center: defPos,
    radius: 5
  };
  center = new google.maps.Circle(circleOptions);
  */
  var markerOptions = {
    map: map,
    position: defPos,
    draggable: false
  };
  center = new google.maps.Marker(markerOptions);
  
  // set near rail marker
  var nmOptions = {
    map: map,
    position: defPos,
    draggable: false
  };
  nearRail = new google.maps.Marker(nmOptions);

  // set loaded field
  var fieldOptions = {
    strokeColor: "#FF0011",
    strokeOpacity: 1.0,
    strokeWeight: 1,
    fillColor: "#000",
    fillOpacity: 0.01,
    map: map,
    bounds: new google.maps.LatLngBounds(defPos, defPos)
  };
  field = new google.maps.Rectangle(fieldOptions);






  // call main thread
  if (navigator.geolocation) {
    call();
    window.addEventListener("devicemotion", devicemotion);
    setTimeout(getLine,500);
    $("#fixed").click(function(){
      $(this).text((fixed=!fixed)?"移動開始":"現在地固定");
    });
    $("#marker_fixed").click(function(){
      $(this).text((markerMove=!markerMove)?"マーカー固定":"マーカー移動開始");
      center.setDraggable(markerMove);
    });
  } else {
    error();
  }

}