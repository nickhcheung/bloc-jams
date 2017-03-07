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
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
      $playPauseButton.html(playerBarPauseButton);
      //This sets the volume bar on load to the current volume value (divided by 100 for ratio)
      updateSeekPercentage($(".player-bar .volume .seek-bar"), currentVolume/100);
    } else if(currentlyPlayingSongNumber === songItemNum){
      if(currentSoundFile.isPaused() === true){
        currentSoundFile.play();
        songItem.html(pauseButtonTemplate);
        $playPauseButton.html(playerBarPauseButton);
      } else{
        currentSoundFile.pause();
        $playPauseButton.html(playerBarPlayButton);
        songItem.html(playButtonTemplate);
      };
    } else if(currentlyPlayingSongNumber !== songItemNum){
      var currentlyPlayingSongElement = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingSongElement.html(parseInt(currentlyPlayingSongElement.attr("data-song-number")) );
      songItem.html(pauseButtonTemplate);
      setSong(songItemNum);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
      $playPauseButton.html(playerBarPauseButton);
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
  };

  $row.click(clickHandler);
  $row.click(updatePlayerBarSong);
  $row.hover(onHover, offHover);
  return $row;

};

var setSong = function(songNumber){
  if(currentSoundFile){
    currentSoundFile.stop();
  };
  currentlyPlayingSongNumber = parseInt(songNumber);
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  //added this conditional to counter the album song list loop
  if(currentSongFromAlbum){
    currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
      formats: [ "mp3" ],
      preload: true
    });
  };

  setVolume(currentVolume);
};

var seek = function(time){
  if(currentSoundFile){
    currentSoundFile.setTime(time);
  };
};

var setVolume = function(volume){
  if(currentSoundFile){
    currentSoundFile.setVolume(volume);
  };
};

var getSongNumberCell = function(number){
  return $('.song-item-number[data-song-number="' + number +'"]');
};

//moved this function from inside the createSongRow function so that nextSong can call it
var updatePlayerBarSong = function(){
  var barSongName = $(".song-name");
  var barArtistName = $(".artist-name");
  var barMobile = $(".artist-song-mobile");

  var songItem = $(this).find(".song-item-number");
  var songItemNumber = parseInt(songItem.attr('data-song-number'));
  //added this conditional so it doesn't throw error when we click same album (which sets to null playing)
  if(!currentAlbum || !currentSongFromAlbum){
    return;
  }else{
    barSongName.text(currentSongFromAlbum.title);
    barArtistName.text(currentAlbum.artist);
    barMobile.text(currentSongFromAlbum.title + " - " + currentAlbum.artist);
  };

  //Moved the player bar play/pause into the click handler
  //$playPauseButton.html(playerBarPauseButton);
};

var updateSeekBarWhileSongPlays = function(){
  if(currentSoundFile){
    currentSoundFile.bind("timeupdate", function(event){
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $(".seek-control .seek-bar");

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
  };
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio){
  var offsetXPercent = seekBarFillRatio * 100;
  //these 2 execute and make sure our value is between 0 and 100
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + "%";
  $seekBar.find(".fill").width(percentageString);
  $seekBar.find(".thumb").css({left: percentageString});
};

var setupSeekBars = function(){
  var $seekBars = $(".player-bar .seek-bar");

  $seekBars.click(function(event){
    var offsetX = event.pageX - $(this).offset().left;
    var barWidth = $(this).width();
    var seekBarFillRatio = offsetX / barWidth;

    if($(this).parent().attr("class") === "control-group volume"){
      //volume bar
      setVolume(seekBarFillRatio * 100);
    } else if($(this).parent().attr("class") === "seek-control"){
      //song bar
      seek(seekBarFillRatio * currentSoundFile.getDuration());
    };

    updateSeekPercentage($(this), seekBarFillRatio);
  });

  $seekBars.find(".thumb").mousedown(function(event){
    var $seekBar = $(this).parent();

    $(document).bind("mousemove.thumb", function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;

      if($(this).parent().attr("class") === "control-group volume"){
        //volume thumb
        setVolume(seekBarFillRatio * 100);
      } else if($(this).parent().attr("class") === "seek-control"){
        //song thumb
        seek(seekBarFillRatio * currentSoundFile.getDuration());
      };

      updateSeekPercentage($seekBar, seekBarFillRatio);
    });

    $(document).bind("mouseup.thumb", function(){
      $(document).unbind("mousemove.thumb");
      $(document).unbind("mouseup.thumb");
    });
  });

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

var nextSong = function(){
  setSong(currentlyPlayingSongNumber + 1);
  var previousSongNumber = currentlyPlayingSongNumber - 1;

  //checks if we are at the end of our album and flips it back to the start
  if(currentlyPlayingSongNumber > currentAlbum.songs.length){
    setSong(1);
    previousSongNumber = currentAlbum.songs.length;
  };

  //select's the elements
  var $previousSongItem = getSongNumberCell(previousSongNumber);
  var $nextSongItem = getSongNumberCell(currentlyPlayingSongNumber);

  //executes changes
  $nextSongItem.html(pauseButtonTemplate);
  $previousSongItem.html(previousSongNumber);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

};

var previousSong = function(){
  setSong(currentlyPlayingSongNumber - 1);
  var previousSongNumber = currentlyPlayingSongNumber + 1;

  if(currentlyPlayingSongNumber < 1){
    setSong(currentAlbum.songs.length);
    previousSongNumber = 1;
  };

  var $previousSongItem = getSongNumberCell(previousSongNumber);
  var $nextSongItem = getSongNumberCell(currentlyPlayingSongNumber);

  $nextSongItem.html(pauseButtonTemplate);
  $previousSongItem.html(previousSongNumber);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();

};

var togglePlayFromPlayerBar = function(){
  var currentSong = getSongNumberCell(currentlyPlayingSongNumber);

  if($playPauseButton.html() === playerBarPlayButton){
    currentSong.html(pauseButtonTemplate);
    $playPauseButton.html(playerBarPauseButton);
    currentSoundFile.play();
  } else if($playPauseButton.html() === playerBarPauseButton){
    currentSong.html(playButtonTemplate);
    $playPauseButton.html(playerBarPlayButton);
    currentSoundFile.pause();
  };

};

var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';


var currentAlbum = null;
var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;

var $playPauseButton = $(".main-controls .play-pause");
var $previousButton = $(".main-controls .previous");
var $nextButton = $(".main-controls .next");

$(document).ready(function(){
  setCurrentAlbum(albumPicasso);
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playPauseButton.click(togglePlayFromPlayerBar);
});
