// @filename: juggjuggref.ts


// <reference types="node" />
//
import {RecordPoint, RecordEvent, RefRecord,refPosition} from "./record.js"
import {Html_manipulation} from "./html_manipulation.js"
import {record_names, submit_server, RecordList, RecordInfo,load_record} from "./server_communication.js"
import {onPlayerReady} from "./YT_manipulation.js"



let actions = {"b" : "too_early"};

class Controler{
    record: RefRecord;
    reference_hist:RefRecord;
    histories :RefRecord[];//{[key:number] : RefRecord};
    player : YT.Player;
    cur_mouse_pos :RecordPoint;

    view:Html_manipulation;

    private loopInterval:ReturnType<typeof setInterval>;
    private _fps;


    constructor() {
        this.record = new RefRecord(0);
        this.reference_hist;
        this.histories = [] as RefRecord[];
        this.view = new Html_manipulation();

        window.onYouTubeIframeAPIReady = ()=>{this.YTApiready();};

        this.set_slider_control();
        this.view.on_seturl             = ()=>{this.set_url();};
        this.view.on_submit             = ()=>{this.set_record_infos();submit_server(this.view.get_yt_video_id(), this.record)};
        this.view.on_copy_clipboard     = ()=>{this.set_record_infos();navigator.clipboard.writeText(this.record.get_json_record())};
        this.view.on_load_names         = ()=>{
            record_names(this.view.get_yt_video_id(),
                (record_names:RecordList)=>{
                this.load_record_names(record_names);}
            );
        };
        this.view.on_click_load_record = (record:RecordInfo)=>{
            load_record(record,
                (new_record:RefRecord)=>{
                this.set_record(new_record);}
            );
        };

        this.view.on_file_drop = (new_record:RefRecord)=>{this.set_record(new_record);};

        this.cur_mouse_pos= new RecordPoint(0,0);
        this._fps=20;
    }

    load_record_names(json_return:RecordList){
        this.view.build_record_names(json_return.record_names);
    }

    set_record(new_record:RefRecord) {
        this.histories.push(new_record)
        if (this.reference_hist == null) {
            this.reference_hist = new_record;
        }
        this.view.add_record(new_record, ()=>{this.reference_hist=new_record as RefRecord});
    }

    set_record_infos():void{
        this.record.name = (document.getElementById("record_name") as HTMLInputElement).value;
        this.record.ref_position = (document.getElementById("position_select") as HTMLInputElement).value as refPosition;
        this.record.author = "me";
    }
    YTApiready():void{
        const player_div = this.view.get_player_div();//document.getElementById("player");

        const playerev: YT.Events = {
            onReady: (event:YT.PlayerEvent)=>{this.reset_player();},
            onStateChange: (event:YT.PlayerEvent)=>{this.onPlayerStateChange(event);}
        };
        const opts: YT.PlayerOptions = {
            height: "90%",
            width: "90%",

            videoId: this.view.get_yt_video_id(),
            playerVars: <YT.PlayerVars>{
                playsinline: 1
            },
            events: playerev
        };
        this.player = new YT.Player(player_div, opts);
    }
    set_slider_control(): void {
        const slider:HTMLInputElement = this.view.get_slider();//<HTMLInputElement>document.getElementById("myRange");
        slider.oninput =  ()=>{
            const vid_len = this.player.getDuration();

            this.player.seekTo(vid_len / Number(slider.max) * Number(slider.value), true);
        }
    }

    set_url():void{
        // change the video url => will be removed
        const url:string = this.view.get_yt_video_id();
        this.player.loadVideoById(url);
        this.reset_player();

        this.player.pauseVideo();
    }
    onPlayerReady(event:YT.PlayerEvent):void{
        this.reset_player();
    }
    onPlayerStateChange(event:YT.PlayerEvent):void{
        /**
         * sync the start and stop video with the mouse record
         */
        const canvas = this.view.get_canvas(); //document.getElementById("pannel");
        if (this.player.getPlayerState()==1) {
            this.loopInterval = setInterval(()=>{this.myloop()}, 10);
            canvas.style.visibility = "visible"
        }
        else{
            if (this.loopInterval){
                 clearInterval(this.loopInterval);
                 canvas.style.visibility ="hidden";
            }
        }
    }
    reset_player():void{
        const length:number = this.player.getDuration();
        const nb_record:number = length*this._fps;
        this.record.reset_record(nb_record);

        this.setup_canvas();
    }
    setup_canvas():void{
        /**
         * at startup
         * @type {HTMLElement}
         */
        const canvas:HTMLCanvasElement = this.view.get_canvas();//document.getElementById("pannel");
        canvas.addEventListener("mousemove", (event:MouseEvent)=>{this.mousemoveAction(event);});

        document.addEventListener("keydown",  (event:KeyboardEvent)=>{this.keyPressedAction(event);});
    }

    mousemoveAction(event:MouseEvent):void{
        const canvas = this.view.get_canvas()
        this.cur_mouse_pos= new RecordPoint(event.offsetX/canvas.offsetWidth,event.offsetY/canvas.offsetHeight)
    }
    keyPressedAction(event:KeyboardEvent){
        /**
         * for the different keyboard events
         */
        const player:YT.Player =window.player;
        if (event.key == " "){
            if (this.player.getPlayerState()==1) {
                this.player.pauseVideo();
            }
            else {
                this.player.playVideo();
            }
        }
        /*for (let b in actions){
            if (event.key == b){
                add_action_now(actions[b]);
            }
        }*/
    }


    add_action_now(title:string):void{
        /**
         * to add something else than a mouse recording :
         * will be modified
         * @type {number}
         */
        const time: number = this.player.getCurrentTime();
        //pos = [event.offsetX, event.offsetY];
        this.record.events.push(new RecordEvent(this.cur_mouse_pos, time, title))
    }



    myloop():void{
        /**
         * running loop For recording the mouse movement (it seems to not be able to run much faster than 20 times per second
         *
         * @type {number}
         */
        const video_time  :number = this.player.getCurrentTime();

        const video_frame : number = Math.floor(video_time*this._fps);
        const nb_frames = 5 * this._fps;

        const canvas:HTMLCanvasElement = this.view.get_canvas();//(document.getElementById("pannel") as HTMLCanvasElement);

        const ctx:RenderingContext = canvas.getContext("2d");
        const slider : HTMLInputElement = this.view.get_slider();//(document.getElementById("myRange") as HTMLInputElement);

        this.record.mouse_pos[video_frame] = new RecordPoint(this.cur_mouse_pos.x,this.cur_mouse_pos.y) ;
        //this.view.print_pos(this.cur_mouse_pos);
        slider.value = (video_time/this.player.getDuration() * Number(slider.max)).toString();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const line = this.record.mouse_pos.slice(
            Math.max(video_frame-nb_frames, 0),
            video_frame)
        this.view.draw_line(line, "blue");
        if(this.reference_hist != null) {
            const ref_line = this.reference_hist.mouse_pos.slice(Math.max(video_frame-nb_frames, 0), video_frame)
            this.view.draw_line(ref_line);

            const dist =this.record.distance(this.reference_hist,"MSE");
            this.view.set_metric("MSE", dist.toString());

        }
    }

}

var controler = new Controler();





