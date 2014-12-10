var map, pos = new vector(), getpos = new vector();
var roadMap = {rail:[], way:[]};
var defPos = new google.maps.LatLng(-34.397, 150.644);
var center, field;
var fixed = true;

var move = new vector();
var markerMove = false;
var nearRail;

// debug variable
var information;


function initialize(){
  var error = function(e){
    $("#error").html('Error '+(e||''));
    console.error(e);
  };

  // show information sector
  // informations
  //var
  information = {
    gps:{},
    gps_:{},
    accel:{},
    accel_:{}
  };
  // function
  var showInformation = function(){
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
    
    // show accelaration
    var text = [
      "加速度 X:" + information.accel_.accel.x,
      "加速度 Y:" + information.accel_.accel.y,
      "加速度 Z:" + information.accel_.accel.z,
      "aX:" + information.accel.acceleration.x,
      "aY:" + information.accel.acceleration.y,
      "aZ:" + information.accel.acceleration.z,
      "GX:" + information.accel.accelerationIncludingGravity.x,
      "GY:" + information.accel.accelerationIncludingGravity.y,
      "GZ:" + information.accel.accelerationIncludingGravity.z,
      //"倍率:" + scale,
      "加速度2D X:" + information.accel_.accel2d.x,
      "加速度2D Y:" + information.accel_.accel2d.y
    ];
    $("#acc").html(text.join("<br>"));
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


    // set next action
    setTimeout(call, 1000);
  };





  // get acceleration sector
  var lowpass = new vec3();
  var deviceCall = function(){
    window.addEventListener("devicemotion", devicemotion);
    window.addEventListener("deviceorientation", deviceorientation);
  }, east = new vec3(), north = new vec3();
  var direction = [0,0,0];
  var devicemotion = function(e){
    var accel, accel2d;
    // get acceleration
    accel = new vec3(e.acceleration);//(new vec3(e.acceleration)).sub(new vec3(e.accelerationIncludingGravity));
    //lowpass = lowpass.add(accel.sub(lowpass).scale(0.1));
    //accel = accel.sub(lowpass);
    //accel.z = 0;

    var scale = 0.0001
    accel = new vec3(0,1,2);
    var tmp = (new matrix(direction[1],direction[2],direction[0])).dotv(accel);
    accel2d = new vector(tmp.x, tmp.y).scale(scale);
    // accel2d = new vector(accel.scale(scale).dot(east), accel.scale(scale).dot(north));
    // ;

    // set information
    information.accel  = e;
    information.accel_ = {accel:accel, accel2d:accel2d};
  }, deviceorientation = function(e){
    var a = MyMath.dir(e.alpha), b = MyMath.dir(-e.beta), c = MyMath.dir(-e.gamma);
    direction = [-a,b,c];
    /*north = new vec3(
          Math.sin(a)*Math.cos(c) - Math.cos(a)*Math.sin(b) *Math.sin(c),
          Math.cos(a)*Math.cos(b),
          Math.sin(a)*Math.sin(c) + Math.cos(a)*Math.sin(b) *Math.cos(c)
    );
    a = MyMath.dir(e.alpha+90);
    east = new vec3(
          Math.sin(a)*Math.cos(c) - Math.cos(a)*Math.sin(b) *Math.sin(c),
          Math.cos(a)*Math.cos(b),
          Math.sin(a)*Math.sin(c) + Math.cos(a)*Math.sin(b) *Math.cos(c)
    );*/
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






  // call main thread
  if (navigator.geolocation) {
    call();  // call GPS
    deviceCall();  // call device motion
    setInterval(showInformation, 1000/30); // call show function
    setTimeout(getLine,500);


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