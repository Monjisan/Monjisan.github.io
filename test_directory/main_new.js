﻿// デバッグ用
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
  // 時間文字列変換
  var toTimeStr = function(a){
    if(a<60){
      return (a|0)+"秒";
    }else if(a<3600){
      return (a/60|0)+"分";
    }else{
      return (a/3600|0)+"時間";
    }
  };

  // google maps準備
  googlemaps.makeMap($('#map_canvas')[0]);
  
  // デバッグ用
  var fixed = true;
  var saving = false;
  var savedata = [];
  
  // GPS呼び出し開始
  var markerMove = false;
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
      var vv = velocity.reduce(function(a,b){ return a.add(b); }, new vector(0,0)).scale(1/velocity.length);
      var v = vv.dist();
      var isMove = !(v<0.005);
      // 駅情報確定
   try{
      var queue = [];
      if(p0.sub(p).dot(vv)>=0){
        queue.push([nearest,p.dist(p0),nearestPos,1]);
      }
      if(p1.sub(p).dot(vv)>=0){
        queue.push([nearest,p.dist(p1),nearestPos-1,-1]);
      }
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
              queue.push([i,q[1]+rail.len(q[2],ai),a.next[i],a.nextd[i]]);
            }else if(nextrail[i]>q[1]){
              nextrail[i] = q[1];
            }
          }
          if(typeof a.station===typeof 0){
            nextstation.push([
              (q[1]+rail.len(q[2],ai)) / (isMove ? v : 1),
              openstreetmap.station[a.station][1],
              isMove
            ]);
          }
        });
      }
   }catch(e){ console.error('rail', e); }
    }
    nextstation = nextstation.sort(function(a,b){ return a[0]-b[0]; });
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
    // 駅名・路線名表示
    $("#station").text(station!==null ? station[1] : (nearest!==null?openstreetmap.rail[nearest].name:"不明"));
    $("#nextstation").text(nextstation[0]===undefined ? "不明" : (!nextstation[0][2]?"停車中":"次駅："+nextstation[0][1]+" 残り約"+toTimeStr(nextstation[0][0])));
    // 計測値保存
    if(nextstation[0]!==undefined&&nextstation[0][2]){
      savedata.push({time:(new Date()).valueOf(), value:nextstation[0][0]});
    }
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
  

  // デバッグ用クリックイベント作成
  $("#fixed").click(function(){
    $(this).text((fixed=!fixed)?"固定":"移動");
    if(fixed)googlemaps.center(gps.pos.toGoogle());
    center.setDraggable(!fixed);
  });
  $("#data").click(function(){
    $(this).text((saving=!saving)?"停止":"開始");
    if(!saving){
      var c = $('<canvas>')[0];
      var ctx = c.getContext('2d');
      var str = JSON.stringify(savedata);
      var w = Math.sqrt(str.length/3)|0, h = str.length/3/w|0;
      if(w*h*3<str.length){ ++h; }
      c.width = w; c.height = h;
      var data = ctx.createImageData(w,h);
      for(var i=0,j=0;i<w*h*4;++i){
        data.data[i] = ((i&3)===3)?0xff:(j<str.length?str.charCodeAt(j++)&0xff:0);
      }
      ctx.putImageData(data,0,0);
      $("#dataimg").attr("src",c.toDataURL());
      savedata = [];
    }
  });
  
});
