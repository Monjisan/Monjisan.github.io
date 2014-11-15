var map, pos = new vector(), getpos = new vector();
var defPos = new google.maps.LatLng(-34.397, 150.644);
var circle, field;
var fixed=true;




function initialize(){

  // get GPS sector
  var cb=function(position){
    pos = new vector(position.coords.longitude, position.coords.latitude);
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
    circle.setCenter(c);
    setTimeout(call, 1000);
  };
  var error=function(e){
    $("#error").html('GPS Error'+(e||""));
    console.error(e);
  };
  var call=function(){
    navigator.geolocation.getCurrentPosition(cb, error);
  };


  // create path sector
  var path, d = 0.005, dv = new vector(d,d),
    streetError=function(){
    $("#error").html('StreetMapAPI Error');
  }, getLine=function(){
    if(getpos.dist(pos) >= d/2){
      $.ajax({
        url:"http://api.openstreetmap.org/api/"+
        "0.6/map?bbox="+
        pos.sub(d)+","+pos.add(d)
        ,type:"GET",
        success:setLine
        ,error:streetError
      });
      getpos = pos.copy();
    }
    setTimeout(getLine, 10000);
  }, setLine=function(res){
    $("#xml").text(res);
    if(path)for(var i=0;i<path.length;++i){
      path[i].setMap(null);
    }
    path=[];
    $(res).find("way").filter(function(){
      return $(this)
         .find("tag[k=railway][v=rail]"
         /* +",tag[k=highway]" */ ).length;
    }).each(function(){
      var nd=[];
      var color=$(this).find("tag[k=railway]")
        .length?"#000":"#666";
      $(this).find("nd").each(function(){
        var ndd=$(res).find("node[id="+
          $(this).attr("ref")+
          "]")
        nd.push(new google.maps.LatLng(
          ndd.attr("lat"),
          ndd.attr("lon")
          ));
      });
      var p=new google.maps.Polyline({
        path:nd,strokeColor:color
      });
      path.push(p);
      p.setMap(map);
    });
  };

  // set google map
  var mapOptions = {
    center: defPos,
    zoom: 18,
    mapTypeId: google.maps.MapTypeId.ROADMAP
  };
  map = new google.maps.Map($("#map_canvas")[0], mapOptions);

  // set map object
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
  circle = new google.maps.Circle(circleOptions);


  // call main thread
  if (navigator.geolocation) {
    call();
    setTimeout(getLine,500);
    $("#fixed").click(function(){
      $(this).text((fixed=!fixed)?"移動開始":"現在地固定");
    });
  } else {
    error();
  }

}