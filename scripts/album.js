var createSongRow = function(songNumber, songName, songLength){

  var template =
    '<tr class="album-view-song-item">'
  + ' <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + ' <td class="song-item-title">' + songName + '</td>'
  + ' <td class="song-item-duration">'  + songLength + '</td>'
  + '</td>'
  ;

  var $row = $(template);

  var clickHandler = function(event){

    var songItem = $(this).find(".song-item-number");
    var songItemNum = parseInt(songItem.attr("data-song-number"));

    if(currentlyPlayingSongNumber === null){
      songItem.html(pauseButtonTemplate);
      setSong(songItemNum);
    } else if(currentlyPlayingSongNumber === parseInt(songItem.attr("data-song-number")) ){
      songItem.html(playButtonTemplate);
      setSong(null);
      $(".main-controls .play-pause").html(playerBarPlayButton)
    } else if(currentlyPlayingSongNumber !== parseInt(songItem.attr("data-song-number")) ){
      var currentlyPlayingSongElement = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingSongElement.html(parseInt(currentlyPlayingSongElement.attr("data-song-number")) );
      songItem.html(pauseButtonTemplate);
      setSong(songItemNum);
    };

  };

  var onHover = function(event){
    var songItem = $(this).find(".song-item-number");
    var songItemNumber = parseInt(songItem.attr('data-song-number'));

    if (songItemNumber !== currentlyPlayingSongNumber) {
      songItem.html(playButtonTemplate);
    };
  };

  var offHover = function(event){
    var songItem = $(this).find(".song-item-number");
    var songItemNumber = parseInt(songItem.attr('data-song-number'));

    if (songItemNumber !== currentlyPlayingSongNumber) {
      songItem.html(songItemNumber);
    };
    //console.log("songNumber type is " + typeof songItemNumber + "\n and currentlyPlayingSongNumber type is " + typeof currentlyPlayingSongNumber);
  };

  $row.click(clickHandler);
  $row.click(updatePlayerBarSong);
  $row.hover(onHover, offHover);
  return $row;

};

var setSong = function(songNumber){
  currentlyPlayingSongNumber = songNumber;
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
};

var getSongNumberCell = function(number){
  return $('.song-item-number[data-song-number="' + number +'"]');
};

//moved this function from inside the createSongRow function so that nextSong can call it
var updatePlayerBarSong = function(){
  var barSongName = $(".song-name");
  var barArtistName = $(".artist-name");
  var barMobile = $(".artist-song-mobile");
  //added this conditional so it doesn't throw error when we click same album (which sets to null playing)
  if(!currentAlbum || !currentSongFromAlbum){
    return;
  }else{
    barSongName.text(currentSongFromAlbum.title);
    barArtistName.text(currentAlbum.artist);
    barMobile.text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  };

  $(".main-controls .play-pause").html(playerBarPauseButton);
};

var setCurrentAlbum = function(album) {

  currentAlbum = album;

  var $albumTitle = $(".album-view-title");
  var $albumArtist = $(".album-view-artist");
  var $albumReleaseInfo = $(".album-view-release-info");
  var $albumImage = $(".album-cover-art");
  var $albumSongList = $(".album-view-song-list");

  $albumTitle.text(album.title);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + " " + album.label);
  $albumImage.attr("src", album.albumArtUrl);

  $albumSongList.empty();

  for(var i = 0; i <album.songs.length; i++){
    var $newRow = createSongRow(i + 1, album.songs[i].title, album.songs[i].duration);
    $albumSongList.append($newRow);
  };
};

//Single function for next and previous
var changeSong = function(event){
  var direction = event.target.parentNode.className;

  if(direction === "previous"){
    setSong(currentlyPlayingSongNumber - 1);;
    var previousSongNumber = currentlyPlayingSongNumber + 1;


    if(currentlyPlayingSongNumber < 1){
      currentlyPlayingSongNumber = currentAlbum.songs.length;
      currentSongFromAlbum = currentAlbum.songs[currentlyPlayingSongNumber - 1];
      previousSongNumber = 1;
    };

    var $previousSongItem = getSongNumberCell(previousSongNumber);
    var $nextSongItem = getSongNumberCell(currentlyPlayingSongNumber);

    $nextSongItem.html(pauseButtonTemplate);
    $previousSongItem.html(previousSongNumber);

  } else if(direction === "next"){
    setSong(currentlyPlayingSongNumber + 1);
    var previousSongNumber = currentlyPlayingSongNumber - 1;

    //checks if we are at the end of our album and flips it back to the start
    if(currentlyPlayingSongNumber > currentAlbum.songs.length){
      currentlyPlayingSongNumber = 1;
      currentSongFromAlbum = currentAlbum.songs[0];
      previousSongNumber = currentAlbum.songs.length;
    };

    //select's the elements
    var $previousSongItem = getSongNumberCell(previousSongNumber);
    var $nextSongItem = getSongNumberCell(currentlyPlayingSongNumber);

    //executes changes
    $nextSongItem.html(pauseButtonTemplate);
    $previousSongItem.html(previousSongNumber);

  };
  updatePlayerBarSong();
};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;

var $previousButton = $(".main-controls .previous");
var $nextButton = $(".main-controls .next");

$(document).ready(function(){
  setCurrentAlbum(albumMarconi);
  $previousButton.click(changeSong);
  $nextButton.click(changeSong);
});
