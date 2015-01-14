window.addEventListener('load',function(){
  
  // �`�揀��
  var canvas = $('#my_map')[0];
  var ctx = canvas.getContext('2d');

  // google maps����
  googlemaps.makeMap($('#map_canvas')[0]);
  
  // GPS�Ăяo���J�n
  var d = 500.0/1000.0;
  gps.on(function(pos, prev){
    // ���W�̕\��
    console.log("Get Pos", pos);
    $("#gps").append(pos.lat()+','+pos.lng()+'<br>');
    // ���W�Ɉړ�
    googlemaps.center(pos);
    
    // �\���ɗ��ꂽ��X�V
    if(pos.dist(prev)>d){
      openstreetmap.load(pos, d, function(){
        console.log("Get Map", openstreetmap.dom);
        
      });
    }
    
  });
  
});