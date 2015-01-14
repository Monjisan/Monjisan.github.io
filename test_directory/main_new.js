window.addEventListener('load',function(){
  
  // 描画準備
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');

  // google maps準備
  googlemaps.makeMap($('#map_canvas')[0]);
  
  // GPS呼び出し開始
  var d = 500.0/1000.0;
  gps.on(function(pos, prev){
    // 座標の表示
    console.log("Get Pos", pos);
    $("#gps").append(pos.lat()+','+pos.lng()+'<br>');
    // 座標に移動
    googlemaps.center(pos);
    
    // 十分に離れたら更新
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  
});