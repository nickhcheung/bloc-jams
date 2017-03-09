var buildCollectionItemTemplate = function(album){
  var template =
  '<div class="collection-album-container column fourth">'
   + '  <a href="album.html"><img src="'+ album.albumArtUrl +'"/></a>'
   + '  <div class="collection-album-info caption">'
   + '    <p>'
   + '      <a class="album-name" href="album.html">'+ album.title +'</a>'
   + '      <br/>'
   + '      <p class="album-artist">'+ album.artist +'</p>'
   + '      <br/>'
   + '      <p class="num-songs">'+ album.songs.length +' Tracks</p>'
   + '      <br/>'
   + '    </p>'
   + '  </div>'
   + '</div>'
   ;

  return $(template);
 };


$(window).load(function(){

  var $collectionContainer = $(".album-covers");

  $collectionContainer.empty();
  $collectionContainer.append(buildCollectionItemTemplate(albumPicasso));
  $collectionContainer.append(buildCollectionItemTemplate(wakingAtDawn));

});
