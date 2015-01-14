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
    // 座標の表示
    console.log("Get Pos", pos);
    $("#gps").append(pos.lat()+','+pos.lng()+'<br>');
    // 座標に移動
    if(fixed)googlemaps.center(pos.toGoogle());
    center.setPosition(pos.toGoogle());
    
    
    ctx.clearRect(0,0,width,width);
    ctx.fillText("test",10,10);
    openstreetmap.rail.forEach(function(a){
      ctx.beginPath();
      a.forEach(function(b){
        b = pos.toXY(new latLng(b));
        ctx.lineTo(w2+w2*b.x/d, w2+w2*b.y/d);
      });
      ctx.stroke();
    });
    
    // 十分に離れたら更新
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  


  $("#fixed").click(function(){
    $(this).text((fixed=!fixed)?"移動開始":"現在地固定");
    if(fixed)googlemaps.center(gps.pos.toGoogle());
  });
  $("#marker_fixed").click(function(){
    $(this).text((markerMove=!markerMove)?"マーカー固定":"マーカー移動開始");
    //center.setDraggable(markerMove);
  });
  
});