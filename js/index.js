$(function(){


// tab system
  var tabID = 'tab0';
  // tab change function
  function changeTab(){
    var ID = $(this).attr('id');
    if(ID!=tabID){
      $('.tabItem#'+tabID).removeClass('selectTab');
      $(this).addClass('selectTab');
      $('.contents#'+tabID+'Contents').css('display','none');
      $('.contents#'+ID+'Contents').css('display','');
      location.hash = tabID = ID;
    }
  }

  // tab init
  $('.tabItem').click(changeTab);

  // hash init
  function changeHash(){
    if(location.hash){
      var tab = $(location.hash);
      if(tab.hasClass('tabItem')){
        tab.click();
      }
    }else{
      $('#tab0').click();
    }
  }
  window.onhashchange = changeHash;

// init link to out
  $('a').each(function(){
    if($(this).attr('href').indexOf('http')==0){
      // open at new tab
      $(this).attr('target', '_blank');
      // nc => no comment
      if(!$(this).hasClass('nc')){
        $(this).append('<span class="comments">[外部リンク]</span>');
      }
    }
  });

  changeHash();
});