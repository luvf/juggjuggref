/// <reference types="node" />

// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

var player:YT.Player;

var fps:number=20;




interface RecordPoint{
    x:number;
    y:number;
}
interface RecordEvent  {
    point:RecordPoint;
    time:number;
    comment:string;
}



class RefRecord{
    mouse_pos:RecordPoint[];
    name:string;
    author:string;
    ref_position:string;
    events:RecordEvent[];

    constructor() {
        this.mouse_pos = [];
        this.name = "";
        this.author = "";
        this.ref_position="main";
        this.events=[];
    }
}


var record_frames = new RefRecord();

var reference_hist:RefRecord=null;
var histories : {[key:number] : RefRecord} ={};


var actions = {"b" : "too_early"};


var mouse_pos = {x:0, y:0}
var loopInterval:any;



interface record{

}


function get_yt_video_id():string{
    /*
    * Simple helper to form Youtube url to just video code
    * */
    const url : string = (document.getElementById("video_url") as HTMLInputElement).value

    const urlsliced : string[] = url.split('=');
    return urlsliced.slice(-1)[0];
}

function set_url():void{
    // change the video url => will be removed
    const url:string = get_yt_video_id();
    player.loadVideoById(url);
    reset_player();
    player.pauseVideo();
}



function copy_record() : void {
    navigator.clipboard.writeText(get_json_record(record_frames.mouse_pos));
}

async function submit_server(){
    /**
     * submit a record to the server
     * url : [...]submit_record/<YT code>/
     */
    const url : string = "submit_record/" +
        get_yt_video_id()+"/";

    const response = await fetch(url, {
        method : "POST",
        headers: {
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify(get_json_record(record_frames.mouse_pos))
    });


}

function get_json_record(frames :RecordPoint[], name:string=null, ref_position:string=null, author:string ="me"):string{
    /**
     * prepare the json file for the server with metadata
     * */

    if (name==null){
        name = (document.getElementById("record_name") as HTMLInputElement).value;
    }
    if (ref_position==null){
        ref_position = (document.getElementById("position_select") as HTMLInputElement).value;
    }
    // if author==null Todo

    return JSON.stringify({"name":name, "ref_position": ref_position, "author":author, "mouse_pos" : frames, "events":[]})
}

async function record_names(){
    /**
     * ask the server the records for the current video :
     * url = [...]record_names/<YT code>/
     * expects a in "recordsnames" a list of dicts {ref_position, record_name}
     * @type {HTMLElement}
     */

    const url:string = "record_names/" +
        get_yt_video_id() + "/";

    const response = await fetch(url, {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        },
    });

    let json_file = await response.json();
    set_record_names(json_file);
}


function set_record_names(json_file:any):void{

    const record_list: HTMLElement = document.getElementById("record_list");
    const select : HTMLSelectElement = document.createElement("select");
    const child_id =record_list.children.length
    select.name = "record_names";
    select.id = "record_names_"+child_id;

    for (let rec of json_file["recordsnames"] ){
        const option: HTMLOptionElement = document.createElement("option");
        option.value = rec["ref_position"] + ":" +rec["name"];
        option.textContent = rec["ref_position"] + " " +rec["name"];
        select.appendChild(option);
    }
    const label : HTMLLabelElement = document.createElement("label");
    label.innerHTML = "Record to playback : "
    label.htmlFor = "record_name";
    let new_div = document.createElement("div");
    new_div.setAttribute("class", "record");
    new_div.id = "new_record_"+ child_id;

    let load_button = document.createElement("button");
    load_button.textContent = "Load";
    load_button.setAttribute("onclick", "load_record("+ child_id+")");


    new_div.appendChild(label);
    new_div.appendChild(select);
    new_div.appendChild(select);
    new_div.appendChild(load_button);

    record_list.appendChild(new_div);
}


async function load_record(record_id:number=0){
    /**
     * ask a specific record to the server :
     * url = [...]load_record/<YT code>/<Ref position>/<record name>/
     * then pass it to add_record
     * @type {HTMLElement}
     */
    const option = <HTMLOptionElement>document.getElementById("record_names_"+record_id);
    const value :string =  option.value;
    const split :string[] = value.split(':');

    const url:string =
        "load_record/" +
        get_yt_video_id()+"/"+
        split[0]+"/"+
        split[1]+"/";

    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
        },
    });

    const parrent_div = document.getElementById("new_record_"+record_id);

    let json_file =  await response.json();

     while (parrent_div.lastElementChild) {
        parrent_div.removeChild(parrent_div.lastElementChild);
        //const child = parrent_div.lastElementChild;
    }
    add_record(json_file,record_id );
}

function add_record(json_file:any, record_id:number){
    /**
     * modify the html page to add the record information, and add it to the list of recods
     */

    const parent_div = document.getElementById("new_record_"+record_id);

    const name: HTMLElement = document.createElement("label");
    name.innerText = "name : "+ json_file["name"];
    parent_div.appendChild(name);

    const author: HTMLElement = document.createElement("label");
    author.innerText = ", author : "+ json_file["author"];
    parent_div.appendChild(author);
    parent_div.appendChild(document.createElement("br"));

    const pos = document.createElement("label");
    pos.innerText = "Reff Position  : "+ json_file["position"]
    parent_div.appendChild(pos);
    parent_div.appendChild(document.createElement("br"));

    const but = document.createElement("button")
    but.setAttribute("onclick", "set_compare("+ record_id+")");
    but.innerText= "set compare";

    parent_div.appendChild(but);

    histories[record_id]= new RefRecord();
    if (reference_hist == null) {
        set_compare(record_id);
    }
}

function set_compare(id:number){
    /**
     * set the current record id to be the one to compare
     */
    reference_hist = histories[id]
}

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



function dropHandler(ev: DragEvent):void {
    /**
     * helper for the drag and drop
     */
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  /*if (ev.dataTransfer.items) {
    // Use DataTransferItemList interface to access the file(s)
    [...ev.dataTransfer.items].forEach((item, i) => {
      // If dropped items aren't files, reject them
      if (item.kind === "file") {
        const file = item.getAsFile();
        load_local_file(file);
      }
    });
  } else */{
    // Use DataTransfer interface to access the file(s)
        for (const file in ev.dataTransfer.files){
            load_local_file(ev.dataTransfer.files[file]);
        }

  }
}

function dragOverHandler(ev:Event) :void{
    /**
     * helper for the drag and drop
     */
  console.log("File(s) in drop zone");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}




function onYouTubeIframeAPIReady():void{
    /**
     * initialize the yt video
     * @type {YT.Player}
     */
    const player_size = getComputedStyle(document.getElementsByClassName("parent")[0]);
    const player_div = document.getElementById("player");
    const playerev : YT.Events = {
            onReady: onPlayerReady,
            onStateChange : onPlayerStateChange
    };

    const opts:YT.PlayerOptions= {
        width : 1920,
        height : 1080,
        videoId : get_yt_video_id(),
        playerVars : <YT.PlayerVars>{
            playsinline : 1
        },
        events :playerev
    };


    player = new YT.Player(player_div, opts);
    const slider = <HTMLInputElement>document.getElementById("myRange");

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() :void{
        const vid_len : number = player.getDuration()
        player.seekTo(vid_len/Number(slider.max) * Number((this as HTMLInputElement).value),true);
    }
}

// 4. The API will call this function when the video player is ready.

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.

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


function reset_player():void{
    /**
     * on load and new video, reset the mouse pos recording
     */
    const length:number = player.getDuration();
    const nb_record:number = length*fps;
    record_frames =  new RefRecord();
    for (let i = 0; i<nb_record;i++){
        record_frames.mouse_pos.push({x:-1,y:-1});
    }

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


function myloop():void{
    /**
     * running loop For recording the mouse movement (it seems to not be able to run much faster than 20 times per second
     *
     * @type {number}
     */
    const time  :number = player.getCurrentTime();
    const frame : number = Math.floor(time*fps);
    const canvas:HTMLCanvasElement = (document.getElementById("pannel") as HTMLCanvasElement);

    record_frames.mouse_pos[frame]= {x :mouse_pos.x,y: mouse_pos.y};
    const slider :HTMLInputElement = (document.getElementById("myRange") as HTMLInputElement);

    slider.value= (time/player.getDuration() * Number(slider.max)).toString();
    const ctx:RenderingContext = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1920, 1080);

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


function setup_canvas(player:YT.Player):void{
    /**
     * at startup
     * @type {HTMLElement}
     */
    const canvas:HTMLElement = document.getElementById("pannel");

    canvas.addEventListener("mousemove", mousemoveAction);

    document.addEventListener('keydown', keyPressedAction);
    //todo
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



function getCookie(name:String) :string{
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

