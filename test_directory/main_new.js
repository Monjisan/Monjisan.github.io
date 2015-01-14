window.addEventListener('load',function(){
  // 描画準備
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');

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
    googlemaps.center(pos.toGoogle());
    center.setPosition(pos.toGoogle());
    
    // 十分に離れたら更新
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  


  $("#fixed").click(function(){
    $(this).text((fixed=!fixed)?"移動開始":"現在地固定");
  });
  $("#marker_fixed").click(function(){
    $(this).text((markerMove=!markerMove)?"マーカー固定":"マーカー移動開始");
    //center.setDraggable(markerMove);
  });
  
});