window.addEventListener('load',function(){
  // 描画準備
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');
  var width = canvas.width = canvas.height = 500;
  var w2 = width/2;

  // google maps準備
  googlemaps.makeMap($('#map_canvas')[0]);
  
  // GPS呼び出し開始
  var d = 500.0/1000.0;
  var fixed = true, markerMove = false;
  var center = googlemaps.makeMarker();
  gps.on(function(pos, prev){
  
  if(!fixed)gps.pos = pos = new latLng(googlemaps.center());
    // 座標の表示
    console.log("Get Pos", pos);
    //$("#gps").append(pos.lat()+','+pos.lng()+'<br>');
    // 座標に移動
    if(fixed)googlemaps.center(pos.toGoogle());
    center.setPosition(pos.toGoogle());
    
    // 最近直線判定
    var nearest = null, nearestPos = null, nearDist = 1e9;
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
      ctx.beginPath();
      a.forEach(function(b){
        b = pos.toXY(new latLng(b));
        ctx.lineTo(w2+w2*b.x/d, w2-w2*b.y/d);
      });
      ctx.stroke();
    });
    ctx.fillText("test", 10,10);
    if(nearest!==null){
      var p = openstreetmap.rail[nearest];
      var p0 = pos.toXY(p[nearestPos]), p1 = pos.toXY(p[nearestPos-1]);
      p = pos.nearestPos(p[nearestPos], p[nearestPos-1]);
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
    
    // 十分に離れたら更新
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  


  $("#fixed").click(function(){
    $(this).text((fixed=!fixed)?"固定":"移動");
    if(fixed)googlemaps.center(gps.pos.toGoogle());
    center.setDraggable(!fixed);
  });
  
});