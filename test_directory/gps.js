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
    },
    pos: new latLng(),
    event: {},
    prevPos: new latLng(),
    prevEvent: {}
  };
  
  // GPS監視
  navigator.geolocation.watchPosition(function(e){
    gps.prevPos = gps.pos;
    gps.prevEvent = gps.event;
    gps.pos = new latLng(e.coords);
    gps.event = e;
    listener.forEach(function(a){ a(gps.pos, gps.prevPos); });
  },function(e){
    console.error(e);
  },{
    enableHighAccuracy: true,
    timeout : 1000,
   maximumAge: 0
  });
  
  return ret;
})();
