window.addEventListener('load',function(){
  

  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');


  var d = 500.0/1000.0;
  googlemaps.makeMap($('#map_canvas')[0]);
  gps.on(function(pos, prev){
    console.log("Get Pos", pos);
    $("#gps").append(pos.lat()+','+pos.lng()+'<br>');
    // \•ª‚É—£‚ê‚½‚çXV
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  
});