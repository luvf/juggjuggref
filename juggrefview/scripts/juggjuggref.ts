// @filename: juggjuggref.ts


// <reference types="node" />
//
import {RecordPoint, RecordEvent, RefRecord} from "./record.js"
import {Html_manipulation} from "./html_manipulation.js"
import {record_names, submit_server, record_list,load_record} from "./server_communication.js"
import {onPlayerReady} from "./YT_manipulation.js"



let actions = {"b" : "too_early"};

class Controler{
    record: RefRecord;
    reference_hist:RefRecord;
    histories :RefRecord[];//{[key:number] : RefRecord};
    player : YT.Player;
    mouse_pos :RecordPoint;

    view:Html_manipulation;

    private loopInterval:ReturnType<typeof setInterval>;
    private fps=20;


    constructor() {
        this.record = new RefRecord(0);
        this.reference_hist=null;
        this.histories = [] as RefRecord[];
        this.view = new Html_manipulation();

        window.onYouTubeIframeAPIReady = this.YTApiready;

        this.set_slider_control();
        this.view.on_seturl             = this.set_url;
        this.view.on_submit             = ()=>submit_server(this.view.get_yt_video_id(), this.record);
        this.view.on_copy_clipboard     = ()=>{navigator.clipboard.writeText(this.record.get_json_record())};
        this.view.on_load_names         = ()=>{record_names(this.view.get_yt_video_id(), this.load_record_names)};
        this.view.on_click_load_record = ()=>{load_record(this.view.get_yt_video_id(),this.view.get_selected_record(),this.set_record)};


        this.mouse_pos={x:0, y:0}
    }

    load_record_names(json_return:record_list){

    }

    set_record(new_record:RefRecord) {
        this.histories.push(new_record)
        if (this.reference_hist == null) {
            this.reference_hist = new_record;
        }

        this.view.add_record(new_record, ()=>{this.reference_hist=new_record});
    }


    YTApiready():void{
        const player_div = this.view.get_player_div();//document.getElementById("player");

        const playerev: YT.Events = {
            onReady: onPlayerReady,
            onStateChange: onPlayerStateChange
        };
        const opts: YT.PlayerOptions = {
            width: "100%",
            height: "100%",
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

    reset_player():void{
        const length:number = this.player.getDuration();
        const nb_record:number = length*fps;
        this.record.reset_record(nb_record);

        setup_canvas(this.player);
    }
    setup_canvas():void{
        /**
         * at startup
         * @type {HTMLElement}
         */
        const canvas:HTMLElement = this.view.get_canvas();//document.getElementById("pannel");
        canvas.addEventListener("mousemove", this.mousemoveAction);
        document.addEventListener('keydown', this.keyPressedAction);
    }

    mousemoveAction(event:MouseEvent):void{
        this.mouse_pos.x = event.offsetX;
        this.mouse_pos.y = event.offsetY;
    }
    keyPressedAction(event:KeyboardEvent){
        /**
         * for the different keyboard events
         */
        const player:YT.Player =window.player;
        if (event.key == " "){
            if (player.getPlayerState()==1) {
                player.pauseVideo();
            }
            else {
                player.playVideo();
            }
        }
        /*for (let b in actions){
            if (event.key == b){
                add_action_now(actions[b]);
            }
        }*/
    }
    onPlayerStateChange(event:YT.PlayerEvent):void{
        /**
         * sync the start and stop video with the mouse record
         */
        const canvas = this.view.get_canvas(); //document.getElementById("pannel");
        if (this.player.getPlayerState()==1) {
            this.loopInterval = setInterval(this.myloop, 10);
            canvas.style.visibility = "visible"
        }
        else{
            if (this.loopInterval){
                 clearInterval(this.loopInterval);
                 canvas.style.visibility ="hidden";
            }
        }
    }

    add_action_now(title:string):void{
        /**
         * to add something else than a mouse recording :
         * will be modified
         * @type {number}
         */
        const time: number = this.player.getCurrentTime();
        //pos = [event.offsetX, event.offsetY];
        this.record.events.push(new RecordEvent(this.mouse_pos, time, title))
    }

    load_local_file(filename:File){//Modify
        /**
         * load a file in drag and drop
         * calls add_record
         * @type {FileReader}
         */
        const reader = new FileReader();
        reader.addEventListener(
            "load",
            () => {
                const json_file : { } = JSON.parse(<string>reader.result);
                const record_list:HTMLElement = document.getElementById("record_list");
                const child_id:number = record_list.children.length;
                const new_div:HTMLElement = document.createElement("div");
                new_div.setAttribute("class", "record");
                new_div.id = "new_record_"+ child_id;

                record_list.appendChild(new_div);
                add_record(json_file,child_id);
            },
            false,
        );
        reader.readAsText(filename);
    }





    myloop():void{
        /**
         * running loop For recording the mouse movement (it seems to not be able to run much faster than 20 times per second
         *
         * @type {number}
         */
        const time  :number = this.player.getCurrentTime();
        const frame : number = Math.floor(time*fps);
        const canvas:HTMLCanvasElement = this.view.get_canvas();//(document.getElementById("pannel") as HTMLCanvasElement);

        const ctx:RenderingContext = canvas.getContext("2d");
        const slider : HTMLInputElement = this.view.get_slider();//(document.getElementById("myRange") as HTMLInputElement);

        this.record.mouse_pos[frame]= this.mouse_pos;

        slider.value = (time/this.player.getDuration() * Number(slider.max)).toString();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        this.view.display_hist(this.record.mouse_pos, time, "blue");
        if(this.reference_hist != null) {
            this.view.display_hist( this.reference_hist["mouse_pos"], time);

            const dist = this.reference_hist.distance(this.record,"MSE");
            this.view.set_metric("MSE", dist.toString());

        }
    }


}





var controler = new Controler();





function myDropHandler(ev: DragEvent):void {
    /**
     * helper for the drag and drop
     */
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (Array.isArray(ev.dataTransfer.items)) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        const file = item.getAsFile();
        load_local_file(file);
      }
    });
  } else {
    // Use DataTransfer interface to access the file(s)
        for (const file in ev.dataTransfer.files){
            load_local_file(ev.dataTransfer.files[file]);
        }
  }
}

function myDragOverHandler(ev:Event) :void{
  ev.preventDefault();
}



//----- Display


document.getElementById("drop").addEventListener("dragover", myDragOverHandler);
document.getElementById("drop").addEventListener("drop", myDropHandler);
