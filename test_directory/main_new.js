window.addEventListener('load',function(){
  
  //googlemaps.makeMap($('#map_canvas')[0]);
  gps.on(function(pos, prev){
    console.log("Get Pos", pos);
    // \•ª‚É—£‚ê‚½‚çXV
    if(pos.dist(prev)>500.0/1000.0){
      openstreetmap.load(pos,function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  
});