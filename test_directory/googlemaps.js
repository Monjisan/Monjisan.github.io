var googlemaps = (function(){
  // Google maps 制御オブジェクト
  var map; // Google maps object
  var ret = {
    // Google maps 初期化
    makeMap: function(element){
      map = new google.maps.Map(element, {
        zoom: 18,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      });
    },
    // マップ取得
    map: function(){ return map; },
    // 中央設定
    center: function(p){
      if(p)map.setCenter(p);
      return map.center;
    },
    // マーカー作成
    makeMarker: function(option){
      if(typeof option === typeof {}){
        option.map = map;
      }else{
        option = {
          map: map,
          position: map.center,
          draggable: false
        };
      }
      var marker = new google.maps.Marker(option);
    }
  };
  
  
  return ret;
})();
