var openstreetmap = (function(){
  var ret = {
    // 更新
    load: function(pos, d, callback){
      var lb = pos.toLatLng(-d,-d), rt = pos.toLatLng(d,d);
      $.ajax({
        url:"http://api.openstreetmap.org/api/"+
        "0.6/map?bbox="+lb.lng()+","+lb.lat()+","+rt.lng()+","+rt.lat(),
        type:"GET",
        success:function(res){
          openstreetmap.dom = $(res);
          callback();
        },
        error:function(e){ console.error('streetmap',e); }
      });
    },
    dom: {}
  };
  
  
  return ret;
})();
