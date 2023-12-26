// @filename: YT_manipulation.ts

import {RefRecord} from "./record.js";
import {Html_manipulation} from "./html_manipulation.js"


export class YT_manipulation{
    view : Html_manipulation;
    player:YT.Player;

    on_player_ready : (event:YT.PlayerEvent)=>void;
    on_player_state_change :(event:YT.PlayerEvent)=>void;


    constructor(view:Html_manipulation) {
        this.view = view
        var tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        var firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);


        window.onYouTubeIframeAPIReady = ()=>{this.YTApiready(this.view.get_review_start_tc(), view.get_review_end_tc();};
    }

    YTApiready(start:number, stop:number):void{
        const player_div = this.view.get_player_div();//document.getElementById("player");

        const playerev: YT.Events = {
            onReady: (event:YT.PlayerEvent)=>{this.on_player_ready(event);},
            onStateChange: (event:YT.PlayerEvent)=>{this.onStateChange(event);}
        };
        const opts: YT.PlayerOptions = {

            videoId: this.view.get_yt_video_id(),
            playerVars: <YT.PlayerVars>{
                playsinline: 1,
                rel:0,
                fs:0,
                modestbranding:1,
                start:start,
                end:stop
            },
            events: playerev
        };
        this.player = new YT.Player(player_div, opts);
    }

    onStateChange(event:YT.PlayerEvent) {
        this.on_player_state_change();
        if (this.getPlayerState() == 1) {
            const current_time = this.getCurrentTime();
            console.log(current_time, this.view.get_review_start_tc(), this.view.get_review_end_tc())

            if (current_time<this.view.get_review_start_tc()){
                this.seekTo(this.view.get_review_start_tc(),false)
            }
            if( current_time>this.view.get_review_end_tc()){
                this.seekTo(this.view.get_review_start_tc(),false)
            }
        }
    }



    getPlayerState():number{
        return this.player.getPlayerState();
    }

    getDuration():number{
        return this.player.getDuration();
    }

    pauseVideo():void{
        this.player.pauseVideo();
    }
    playVideo():void{
        this.player.playVideo();
    }
    getCurrentTime():number{
        return this.player.getCurrentTime();
    }

    seekTo(tc:number,allowSeekAhead:boolean=true):void{
         this.player.seekTo(tc,true);
    }

}