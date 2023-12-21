// @filename: YT_manipulation.ts

import {RefRecord} from "./record.js";

export var player:YT.Player;
export var fps:number=20;




function stopVideo():void{
    player.stopVideo();
}





export function onPlayerReady(event:YT.PlayerEvent):void{
    reset_player();
}







var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

/*
//window.onYouTubeIframeAPIReady = function;
export function YTApiReady(): void {
    /**
     * initialize the yt video
     * @type {YT.Player}
     *
    const player_div = document.getElementById("player");

    const playerev: YT.Events = {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
    };

    const opts: YT.PlayerOptions = {
        width: "100%",
        height: "100%",
        videoId: get_yt_video_id(),
        playerVars: <YT.PlayerVars>{
            playsinline: 1
        },
        events: playerev
    };

    player = new YT.Player(player_div, opts);
    window.player=player

    // Update the current slider value (each time you drag the slider handle)
    set_slider_control(player);

};
*/







