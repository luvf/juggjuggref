// @filename: juggjuggref.ts


// <reference types="node" />
//
import {RecordPoint, RefRecord,histories,reference_hist, record_frames} from "./record.js"
import {get_yt_video_id,set_url} from "./html_manipulation.js"
import {record_names, submit_server} from "./server_communication.js"



var fps:number=20;


var actions = {"b" : "too_early"};


(document.getElementById("record_names") as HTMLInputElement).addEventListener("click", record_names);
(document.getElementById("copy_record") as HTMLInputElement).addEventListener("click", record_frames.to_clipboard);
(document.getElementById("submit_server") as HTMLInputElement).addEventListener("click", submit_server);
(document.getElementById("set_url") as HTMLInputElement).addEventListener("click", ()=>{set_url(player);});




export var mouse_pos = {x:0, y:0}
var loopInterval:any;


function load_local_file(filename:File){
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
  console.log("File(s) in drop zone");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();}

var player: YT.Player;



function onPlayerStateChange(event:YT.PlayerEvent):void{
    /**
     * sync the start and stop video with the mouse record
     */
    const canvas = document.getElementById("pannel");
    if (player.getPlayerState()==1) {
        loopInterval = setInterval(myloop, 10);
        canvas.style.visibility = "visible"
    }
    else{
        if (loopInterval){
             clearInterval(loopInterval);
             canvas.style.visibility ="hidden";
        }
    }
}

function youtube_load_video():void {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

    window.onYouTubeIframeAPIReady = function(): void {
        /**
         * initialize the yt video
         * @type {YT.Player}
         */
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
        const slider = <HTMLInputElement>document.getElementById("myRange");

        // Update the current slider value (each time you drag the slider handle)
        slider.oninput = function (): void {
            const vid_len: number = player.getDuration()
            player.seekTo(vid_len / Number(slider.max) * Number((this as HTMLInputElement).value), true);
        }
    };

    //window.onYouTubeIframeAPIReady = myonYouTubeIframeAPIReady
}

youtube_load_video();




function reset_player():void{
    /**
     * on load and new video, reset the mouse pos recording
     */
    const length:number = player.getDuration();
    const nb_record:number = length*fps;
    record_frames.reset_record(nb_record);


    setup_canvas(player);
}
function onPlayerReady(event:YT.PlayerEvent):void{
    reset_player();
}


function add_action_now(title:string):void{
    /**
     * to add something else than a mouse recording :
     * will be modified
     * @type {number}
     */
    const time: number = player.getCurrentTime();
    //pos = [event.offsetX, event.offsetY];
    record_frames.mouse_pos[Math.floor(time*fps)]= {x:mouse_pos.x,y:mouse_pos.y};
}

export function setup_canvas(player:YT.Player):void{
    /**
     * at startup
     * @type {HTMLElement}
     */
    const canvas:HTMLElement = document.getElementById("pannel");

    canvas.addEventListener("mousemove", mousemoveAction);

    document.addEventListener('keydown', keyPressedAction);
    //todo
}



function myloop():void{
    /**
     * running loop For recording the mouse movement (it seems to not be able to run much faster than 20 times per second
     *
     * @type {number}
     */
    const time  :number = player.getCurrentTime();
    const frame : number = Math.floor(time*fps);
    const canvas:HTMLCanvasElement = (document.getElementById("pannel") as HTMLCanvasElement);

    record_frames.mouse_pos[frame] = {x :mouse_pos.x,y: mouse_pos.y};
    const slider :HTMLInputElement = (document.getElementById("myRange") as HTMLInputElement);

    slider.value= (time/player.getDuration() * Number(slider.max)).toString();
    const ctx:RenderingContext = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    display_hist(ctx, record_frames.mouse_pos, "blue");
    if(reference_hist != null) {
        display_hist(ctx, reference_hist["mouse_pos"]);

        set_MSE(record_frames.mouse_pos, reference_hist["mouse_pos"]);
    }
}



function print_pos():void{
    /*obsolete/debug */
    const px= document.getElementById("posx");
    px.innerText = mouse_pos.x.toString();
    const py= document.getElementById("posy");
    py.innerText=  mouse_pos.y.toString();
}


function MSE(list1:RecordPoint[], list2:RecordPoint[]):number{
    /**
     * computation of the mean square error
     * need to add more metrics and refine.
     * @type {number}
     */
    const len = Math.min(list1.length,list2.length);
    let s:number=0;
    for(let i:number=0; i<len;i++){
        s+= Math.pow(list1[i].x-list2[i].x,2)+Math.pow(list1[i].y-list2[i].y,2);
    }
    return s/len;

}

function set_MSE(hist1:RecordPoint[],hist2:RecordPoint[]):void{
    /**
     * print mse to the page
     * @type {HTMLElement}
     */
    document.getElementById("mse").innerText = MSE(hist1, hist2).toString();
}




function mousemoveAction(event:MouseEvent):void{
    mouse_pos.x = event.offsetX;
    mouse_pos.y = event.offsetY;
}





function keyPressedAction(event:KeyboardEvent){
    /**
     * for the different keyboard events
     */
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




//------ Actions
function stopVideo():void{
    player.stopVideo();
}




//----- Display
function display_hist(ctx:CanvasRenderingContext2D, frames:RecordPoint[], color="black", last_seconds=5):void{
    /**
     * print an history on the canvas
     *
     */
    const current_time:number = player.getCurrentTime();
    const cur_t:number = Math.floor(current_time*fps)

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.beginPath();
    const first : RecordPoint = frames[cur_t];

    ctx.moveTo(first.x, first.y);

    for(let i=1; i<fps*last_seconds;i++){
        let idx = cur_t-i
        if ((idx >= 0) && (frames[idx].x!==-1 )) {
            const cur_pos :RecordPoint= frames[idx];
            ctx.lineTo(cur_pos.x, cur_pos.y);
        }
    }
    ctx.stroke();
}


document.getElementById("drop").addEventListener("dragover", myDragOverHandler);
document.getElementById("drop").addEventListener("drop", myDropHandler);
