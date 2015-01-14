var gps = (function(){
  // 使用可能かどうか
  if(typeof navigator.geolocation === typeof {}[0]){
    return {};
  }

  // 返すオブジェクト
  var listener = [];
  var ret = {
    on:function(f){
      if(typeof f==="function"){ listener.push(f); }
    }
  };
  var prev = new latLng();
  
  // GPS監視
  navigator.geolocation.watchPosition(function(e){
    var pos = new latLng(e.coords);
    listener.forEach(function(a){ a(pos, prev); });
    prev = pos;
  },function(e){
    console.error(e);
  });
  
  return ret;
})();
