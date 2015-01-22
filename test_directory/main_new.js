console.error = function(){
  $("#error").text([].join.call(arguments,"\n"));
};
window.addEventListener('load',function(){
  // 描画準備
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');
  var width = canvas.width = canvas.height = 400;
  var w2 = width/2;
  var d = 500.0/1000.0;
  var stationRange = 250.0/1000.0; // 駅範囲
  var velocity = [new vector(0,0),new vector(0,0),new vector(0,0),new vector(0,0),new vector(0,0)];
  var prev = new latLng();
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
  var prevTime = new Date();
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
    var nextrail = {};
    var station = null, nextstation = [];
    openstreetmap.rail.forEach(function(way, index){
      var a = way.nodes;
      for(var i=1;i<a.length;++i){
        var dist = pos.distToLine(a[i],a[i-1]);
        if(dist<nearDist){
          nearDist = dist;
          nearest = index;
          nearestPos = i;
        }
      }
    });
    // 速度用記録
    var time = new Date();
    velocity.shift();
    velocity.push(prev.toXY(pos).scale(1000/(time-prevTime)));
    prevTime = time;
    if(nearest!==null){
      // 最近点位置取得
      var p = openstreetmap.rail[nearest].nodes;
      var p0 = pos.toXY(p[nearestPos]), p1 = pos.toXY(p[nearestPos-1]);
      p = pos.nearestPos(p[nearestPos], p[nearestPos-1]);
      //pos = pos.toLatLng(p);
      var v = velocity.reduce(function(a,b){ return a.add(b); },new vector(0,0)).dist()/velocity.length;
      // 駅情報確定
   try{
      var queue = [[nearest,p.dist(p0),nearestPos,1],[nearest,p.dist(p1),nearestPos-1,-1]];
      while(queue.length>0){
        var q = queue.shift();
        var rail = openstreetmap.rail[q[0]];
        rail.nodes.forEach(function(a,ai){
          if(q[3]>0&&q[2]>ai || q[3]<0&&q[2]<ai){ return; }
          for(var i in a.next){
            i-=0;
            if(i===nearest){ continue; }
            if(nextrail[i]===undefined){
              nextrail[i] = q[1];
              queue.push([i,q[1]+rail.len(q[2],ai),a.next[i],0]);
            }else if(nextrail[i]>q[1]){
              nextrail[i] = q[1];
            }
          }
          if(typeof a.station===typeof 0){
            nextstation.push([(q[1]+rail.len(q[2],ai))/v + 's', openstreetmap.station[a.station][1]]);
          }
        });
      }
   }catch(e){ console.error('rail', e); }
    }
    // 直線描画
    ctx.clearRect(0,0,width,width);
    openstreetmap.rail.forEach(function(a, index){
      ctx.strokeStyle = (index===nearest?"#f00":(nextrail[index]!==undefined?"#f0f":"#000"));
      drawLine(pos, a.nodes);
    });
    // 最近点描画
    if(nearest!==null){
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
    ctx.strokeStyle = "#066";
    openstreetmap.station.forEach(function(a){
      var p = pos.toXY(a[0]);
      if(p.dist()<stationRange){
        station = a;
        ctx.fillStyle = "rgba(0,255,255,0.7)";
      }else{
        ctx.fillStyle = "rgba(0,255,255,0.3)";
      }
      ctx.beginPath();
      ctx.arc(w2+w2*p.x/d, w2-w2*p.y/d, w2*stationRange/d, 0, Math.PI*2);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    });
    $("#station").text((station!==null?station[1]:"") + "["+nextstation.join("/")+"]");
    // 情報描画
    ctx.fillStyle = "#000";
    ctx.fillText("rail["+openstreetmap.rail.length+"]", 10, 10);
    ctx.fillText("station["+openstreetmap.station.length+"]", 10, 20);
    ctx.beginPath();
    ctx.arc(w2, w2, 1, 0, Math.PI*2);
    ctx.closePath();
    ctx.fill();
    if(nearest!==null){ ctx.fillText(openstreetmap.rail[nearest].name, w2, w2); }
    if(station!==null){ ctx.fillText(station[1], w2, w2+10); }
    
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
