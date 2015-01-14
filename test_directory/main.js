var map, pos = new vector(), getpos = new vector();
var roadMap = {rail:[], way:[], station:[]};
var defPos = new google.maps.LatLng({"x":139.41624800761724,"y":35.69925562319279});
var center, field;
var fixed = true;
var canvas, ctx, cw=500, ch=500;

var move = new vector();
var markerMove = false;
var nearRail;

// debug variable
var information;


function initialize(){
  var error = function(e){
    $("#error").append('<div>Error '+(e||'')+'</div>');
    console.error(e);
  };

  // show information sector
  // informations
  //var
  information = {
    gps:{},
    gps_:{},
    data:""
  };
  // function
  var showInformation = function(){
    console.log("show");
    // show
    var text = [
      "緯度：" + information.gps_.y,
      "経度：" + information.gps_.x,
      "高度：" + information.gps.altitude,
      "緯度/経度の誤差：" + information.gps.accuracy,
      "高度の誤差：" + information.gps.altitudeAccuracy,
      "方角：" + information.gps.heading,
      "速度：" + information.gps.speed
    ];
    $("#gps").html(text.join("<br>"));
    
    ctx.clearRect(0,0,cw,ch);
    ctx.beginPath();
    ctx.lineTo(10,10);
    ctx.lineTo(30,30);
    ctx.stroke();
    roadMap.rail.forEach(function(a){
      ctx.beginPath();
      a.forEach(function(b){
        ctx.lineTo((b.x-information.gps_.x)*10000,(b.y-information.gps_.y)*10000);
      });
      ctx.stroke();
    });
    console.log("test");
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
    // set information
    information.gps_ = pos;
    information.gps  = position.coords;
    
    // update position
    var c = pos.latLng();
    if(fixed){ map.setCenter(c); }
    if(!markerMove){ center.setPosition(c); }
    /*center.setCenter(c);*/
    nearRailPos = pos;
    var near = 100.0;
    var nearLine = null;
    for(var i=0;i<roadMap.rail.length;++i){
      var rails = roadMap.rail[i];
      for(var j=1;j<rails.length;++j){
        var l = new line(rails[j-1], rails[j]),
            dist = l.dist(pos);
        if(near>dist){
          near = dist;
          nearLine = l;
        }
      }
    }
    if(nearLine !== null){
      nearRailPos = nearLine.nearestPos(pos);
    }
    nearRail.setPosition(nearRailPos.latLng());


    // set next action
    setTimeout(call, 1000);
  };





  // create path sector
  var path, d = 0.005, dv = new vector(d,d),
      railTag = "tag[k=railway][v=rail]",
      highwayTag = "tag[k=highway]",
      stationTag = "tag[k=building][v=train_station]",
//building train_station
  streetError = function(){
    error('StreetMapAPI error');
  },
  getLine = function(){
try{
    var dist = pos.sub(getpos), dl = Math.max(Math.abs(dist.x), Math.abs(dist.y));
    if(dl >= d/2){
      if(dl < d){ dist = dist.scale(d/dl); }
      getpos = getpos.add(dist);
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
}catch(e){
  error(e);
}
    setTimeout(getLine, 10000);
  },
  setLine = function(res){
    // reset map objects
    if(path)for(var i=0;i<path.length;++i){
      path[i].setMap(null);
    }
    path=[];
    roadMap.rail = [];
    roadMap.way  = [];
    
    // get and set way lines
    $(res).find("way").filter(function(){
      return $(this)
           .find([railTag/*,highwayTag*/,stationTag].join())
           .length>0;
    }).each(function(){
      var nd=[];
      var isRail = $(this).find(railTag).length>0, isStation = $(this).find(stationTag).length>0;
      var color=isRail?"#000":isStation?"#f00":"#666";
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





  try{
  // set google map
  var mapOptions = {
    center: defPos,
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map($("#map_canvas")[0], mapOptions);
  // set map object
  // set position marker
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
  }catch(e){
    error("google map error");
  }

  canvas = $("#my_map")[0];
  ctx = canvas.getContext('2d');
  canvas.width = cw;
  canvas.height = ch;



  // call main thread
  if (navigator.geolocation) {
    call();  // call GPS
    setTimeout(getLine,500);
    setInterval(showInformation, 1000/15); // call show function


    // set click events
    $("#fixed").click(function(){
      $(this).text((fixed=!fixed)?"移動開始":"現在地固定");
    });
    $("#marker_fixed").click(function(){
      $(this).text((markerMove=!markerMove)?"マーカー固定":"マーカー移動開始");
      center.setDraggable(markerMove);
    });
  } else {
    error("This device cannot use GPS.");
  }

}