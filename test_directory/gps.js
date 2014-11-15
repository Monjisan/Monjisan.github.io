var map, pos = new vector(), getpos = new vector();
var roadMap = {rail:[], way:[]};
var defPos = new google.maps.LatLng(-34.397, 150.644);
var center, field;
var fixed = true;

var move = new vector();
var markerMove = false;


// debug variable
var exec;
function initialize(){

  //debug function
exec = function(src){eval(src);};
  var error = function(e){
    $("#error").html('GPS Error'+(e||""));
    console.error(e);
  };

  // get GPS sector
  var call = function(){
    navigator.geolocation.getCurrentPosition(cb, error);
  };
  var cb = function(position){
    if(markerMove){
      pos = new vector(center.getPosition());
    }else{
      pos = new vector(position.coords.longitude, position.coords.latitude);
      pos = pos.add(move);
    }
    var gl_text = "緯度：" + pos.y + "<br>";
      gl_text += "経度：" + pos.x + "<br>";
      gl_text += "高度：" + position.coords.altitude + "<br>";
      gl_text += "緯度・経度の誤差：" + position.coords.accuracy + "<br>";
      gl_text += "高度の誤差：" + position.coords.altitudeAccuracy + "<br>";
      gl_text += "方角：" + position.coords.heading + "<br>";
      gl_text += "速度：" + position.coords.speed + "<br>";
    $("#disp").html(gl_text);

    // update position
    var c = pos.latLng();
    if(fixed){
      map.setCenter(c);
    }
    /*center.setCenter(c);*/
    if(!markerMove){ center.setPosition(c); }

    // set next action
    setTimeout(call, 1000);
  };

  // create path sector
  var path, d = 0.005, dv = new vector(d,d),
  streetError = function(){
    $("#error").append('<br>StreetMapAPI Error');
  },
  getLine = function(){
    if(getpos.sub(pos).dist() >= d/2){
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
    $("#xml").text(res);
    if(path)for(var i=0;i<path.length;++i){
      path[i].setMap(null);
    }
    path=[];
    $(res).find("way").filter(function(){
      return $(this)
         .find("tag[k=railway][v=rail]"
         +",tag[k=highway]"  ).length;
    }).each(function(){
      var nd=[];
      var color=$(this).find("tag[k=railway]")
        .length?"#000":"#666";
      $(this).find("nd").each(function(){
        var ndd=$(res).find("node[id="+
          $(this).attr("ref")+
          "]")
        nd.push(new google.maps.LatLng(
          ndd.attr("lat")-0,
          ndd.attr("lon")-0
          ));
      });
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