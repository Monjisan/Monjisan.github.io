window.addEventListener('load',function(){
  
  //googlemaps.makeMap($('#map_canvas')[0]);
  gps.on(function(pos, prev){
    console.log("Get Pos", pos);
    // 十分に離れたら更新
    if(pos.dist(prev)>500.0/1000.0){
      openstreetmap.load(pos,function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  
});