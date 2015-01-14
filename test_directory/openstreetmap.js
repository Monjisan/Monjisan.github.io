var openstreetmap = (function(){

  var railFilter = function(){
    return $(this).fild("tag[k=railway][v=rail]").length>0;
  };
  var ret = {
    // 更新
    load: function(pos, d, callback){
      var lb = pos.toLatLng(-d,-d), rt = pos.toLatLng(d,d);
      $.ajax({
        url:"http://api.openstreetmap.org/api/"+
        "0.6/map?bbox="+lb.lng()+","+lb.lat()+","+rt.lng()+","+rt.lat(),
        type:"GET",
        success:function(res){
          ret.dom = $(res);
          //************[draw map]************
          ret.rail.forEach(function(a){ a.setMap(null); });
          ret.rail = [];
          ret.dom.find("way").filter(wayFilter).each(function(){
            var nd=[];
            $(this).find("nd").each(function(){
              var ndd=ret.dom.find("node[id="+
                $(this).attr("ref")+
                "]")
              nd.push(new google.maps.LatLng(
                ndd.attr("lat")-0,
                ndd.attr("lon")-0
              ));
            });
            ret.rail.push(new google.maps.Polyline({
              path:nd, strokeColor:"#000", map:googlemaps.map()
            }));
          });
          //************          ************
          callback();
        },
        error:function(e){ console.error('streetmap',e); }
      });
    },
    rail: [],
    station: [],
    dom: {}
  };
  
  
  return ret;
})();
