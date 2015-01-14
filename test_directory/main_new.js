window.addEventListener('load',function(){
  // 描画準備
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');
  var width = canvas.width = canvas.height = 400;
  var w2 = width/2;
  var d = 500.0/1000.0;
  var drawLine = function(pos,l){
    ctx.beginPath();
    l.forEach(function(a){
      a = pos.toXY(new latLng(a));
      ctx.lineTo(w2+w2*a.x/d, w2-w2*a.y/d);
    });
    ctx.stroke();
  };

  // google maps準備
  googlemaps.makeMap($('#map_canvas')[0]);
  
  // GPS呼び出し開始
  var fixed = true, markerMove = false;
  var center = googlemaps.makeMarker();
  var prevLoadPos = new latLng();
  gps.on(function(pos, prev){
    
if(!fixed)gps.pos = pos = new latLng(googlemaps.center());
    // 座標の表示
    //console.log("Get Pos", pos);
    //$("#gps").append(pos.lat()+','+pos.lng()+'<br>');
    // 座標に移動
    if(fixed)googlemaps.center(pos.toGoogle());
    center.setPosition(pos.toGoogle());
    
    // 最近直線判定
    var nearest = null, nearestPos = null, nearDist = 1e9;
    var station = null;
    openstreetmap.rail.forEach(function(a,index){
      for(var i=1;i<a.length;++i){
        var dist = pos.distToLine(a[i],a[i-1]);
        if(dist<nearDist){
          nearDist = dist;
          nearest = index;
          nearestPos = i;
        }
      }
    });
    // 直線描画
    ctx.clearRect(0,0,width,width);
    openstreetmap.rail.forEach(function(a,index){
      ctx.strokeStyle = (index===nearest?"#f00":"#000");
      drawLine(pos, a);
    });
    // 最近点描画
    if(nearest!==null){
      var p = openstreetmap.rail[nearest];
      var p0 = pos.toXY(p[nearestPos]), p1 = pos.toXY(p[nearestPos-1]);
      p = pos.nearestPos(p[nearestPos], p[nearestPos-1]);
      //pos = pos.toLatLng(p);
      ctx.strokeStyle = "#f00";
      ctx.beginPath();
      ctx.arc(w2+w2*p.x/d, w2-w2*p.y/d, 5, 0, Math.PI*2);
      ctx.stroke();
      ctx.strokeStyle = "#ff0";
      ctx.beginPath();
      ctx.arc(w2+w2*p0.x/d, w2-w2*p0.y/d, 5, 0, Math.PI*2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(w2+w2*p1.x/d, w2-w2*p1.y/d, 5, 0, Math.PI*2);
      ctx.stroke();
    }
    // 駅描画
    ctx.strokeStyle = "#0ff";
    ctx.fillStyle = "rgba(0,255,255,0.7)";
    openstreetmap.station.forEach(function(a){
      //drawLine(pos, a);
      var p = pos.toXY(a[0]);
      if(p.dist()<1000.0/1000.0){
        station = a;
      }
      ctx.beginPath();
      ctx.arc(w2+w2*p.x/d, w2-w2*p.y/d, 15, 0, Math.PI*2);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    });
    if(station!==null){
      $("#station").text("駅:"+station[1]);
    }else{
      $("#station").text("");
    }
    // 情報描画
    ctx.fillStyle = "#000";
    ctx.fillText("rail["+openstreetmap.rail.length+"]", 10,10);
    ctx.fillText("station["+openstreetmap.station.length+"]", 10,20);
    
    // 十分に離れたら更新
    if(prevLoadPos!==null && pos.dist(prevLoadPos)>d){
      prevLoadPos = null;
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        prevLoadPos = pos;
      });
    }
    
  });
  


  $("#fixed").click(function(){
    $(this).text((fixed=!fixed)?"固定":"移動");
    if(fixed)googlemaps.center(gps.pos.toGoogle());
    center.setDraggable(!fixed);
  });
  
});