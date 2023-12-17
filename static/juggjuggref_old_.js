// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');
tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
var player;

var canvas;
var slider;

var fps=20


var record_frames =[];

var reference_hist=null;
var histories = {},


actions = {"b" : "too_early"}


var mouse_pos = {x:0, y:0}
var loopInterval;

function get_url(){
    /*
    * Simple helper to form Youtube url to just video code
    * */
    url=document.getElementById("video_url").value

    ursliced = url.split('=');
    return ursliced.slice(-1)[0];
}

function set_url(){
    // change the video url => will be removed
    url =get_url();
    player.loadVideoById(url);
    reset_player()
    player.pauseVideo()
}



function copy_record() {
    navigator.clipboard.writeText(get_json_record(record_frames));
}

async function submit_server(){
    /**
     * submit a record to the server
     * url : [...]submit_record/<YT code>/
     */
    let url = "submit_record/" +
        get_url()+"/";

    const response = await fetch(url, {
        method : "POST",
        headers: {
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
            body: JSON.stringify(get_json_record(record_frames))
    });


}

function get_json_record(frames, name=null, ref_position=null, author="me"){
    /**
     * prepare the json file for the server with metadata
     * */

    if (name==null){
        name = document.getElementById("record_name").value
    }
    if (ref_position==null){
        ref_position = document.getElementById("position_select").value
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
    record_list = document.getElementById("record_list");

    let url = "record_names/" +
        get_url()+"/";

    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
        },
    });

    let json_file =  await response.json();
    //let json_file =  {"recordsnames":[{"name":"ii","ref_position":"45"},{"name":"i22i","ref_position":"45"}]};

    let select = document.createElement("select");
    let child_id =record_list.children.length
    select.name = "record_names";
    select.id = "record_names_"+child_id;

    for (var rec of json_file["recordsnames"] ){
        var option = document.createElement("option");
        option.value =  rec["ref_position"] + ":" +rec["name"];
        option.textContent = rec["ref_position"] + " " +rec["name"];

        select.appendChild(option);
    }
    let label = document.createElement("label");
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
async function load_record(record_id=0){
    /**
     * ask a specific record to the server :
     * url = [...]load_record/<YT code>/<Ref position>/<record name>/
     * then pass it to add_record
     * @type {HTMLElement}
     */
    option = document.getElementById("record_names_"+record_id);
    value=  option.value;
    split = value.split(':');

    let url =
        "load_record/" +
        get_url()+"/"+
        split[0]+"/"+
        split[1]+"/";

    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
        },
    });

    let json_file =  await response.json();
    parrent_div = document.getElementById("new_record_"+record_id);

     while (parrent_div.lastElementChild) {
        parrent_div.removeChild(parrent_div.lastElementChild);
        child = parrent_div.lastElementChild;
    }
    add_record(json_file,record_id );
}

function add_record(json_file, record_id){
    /**
     * modify the html page to add the record information, and add it to the list of recods
     */

    parrent_div = document.getElementById("new_record_"+record_id);

    var name = document.createElement("label");
    name.innerText = "name : "+ json_file["name"];
    parrent_div.appendChild(name);

    var author = document.createElement("label");
    author.innerText = ", author : "+ json_file["author"];
    parrent_div.appendChild(author);
    parrent_div.appendChild(document.createElement("br"));

    var pos = document.createElement("label");
    pos.innerText = "Reff Position  : "+ json_file["position"]
    parrent_div.appendChild(pos);
    parrent_div.appendChild(document.createElement("br"));

    var but = document.createElement("button")
    but.setAttribute("onclick", "set_compare("+ record_id+")");
    but.innerText= "set compare";

    parrent_div.appendChild(but);

    histories[record_id]=json_file;
    if (reference_hist == null) {
        set_compare(record_id);
    }
}

function set_compare(id){
    /**
     * set the current record id to be the one to compare
     */
    reference_hist = histories[id]
}

function load_local_file(file){
    /**
     * load a file in drag and drop
     * calls add_record
     * @type {FileReader}
     */
    const reader = new FileReader();

    reader.addEventListener(
        "load",
        () => {
           json_file = JSON.parse(reader.result);
            record_list = document.getElementById("record_list");
            var child_id = record_list.children.length;
            var new_div = document.createElement("div");
            new_div.setAttribute("class", "record");
            new_div.id = "new_record_"+ child_id;

            record_list.appendChild(new_div);
            add_record(json_file,child_id);
        },
        false,
    );
    reader.readAsText(file);
}



function dropHandler(ev) {
    /**
     * helper for the drag and drop
     */
  console.log("File(s) dropped");

  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();

  if (ev.dataTransfer.items) {
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
    [...ev.dataTransfer.files].forEach((file, i) => {
        load_local_file(file);
    });
  }
}

function dragOverHandler(ev) {
    /**
     * helper for the drag and drop
     */
  console.log("File(s) in drop zone");
  // Prevent default behavior (Prevent file from being opened)
  ev.preventDefault();
}





function onYouTubeIframeAPIReady(){
    /**
     * initalize the yt video
     * @type {YT.Player}
     */
    player_size = document.getElementsByClassName("parent")[0];
    player_size = getComputedStyle(player_size);
    player = new YT.Player('player', {
        height : "90%",
        width : "90%",
        videoId : get_url(),
        playerVars : {
            'playsinline' : 1
        },
        events : {
            'onReady': onPlayerReady,
            'onStateChange' : onPlayerStateChange
        }
    });
    slider = document.getElementById("myRange");

    // Update the current slider value (each time you drag the slider handle)
    slider.oninput = function() {
        vid_len = player.playerInfo.duration
        player.seekTo(vid_len/slider.max* this.value,true);

    }
}

// 4. The API will call this function when the video player is ready.

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.

function onPlayerStateChange(event){
    /**
     * sync the start and stop video with the mouse record
     */
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

function reset_player(){
    /**
     * on load and new video, reset the mouse pos recording
     */
    length = player.playerInfo.duration;
    nb_record = length*fps;
    record_frames =[];
    for (i = 0; i<nb_record;i++){
        record_frames.push([-1,-1,""]);
    }

    setup_canvas(player)
}
function onPlayerReady(event){
    reset_player();
}

function add_action_now(title){
    /**
     * to add something else than a mouse recording :
     * will be modified
     * @type {number}
     */
    time = player.getCurrentTime();
    //pos = [event.offsetX, event.offsetY];
    record_frames[Math.floor(time*fps)]= [mouse_pos.x,mouse_pos.y, title];
}


function myloop(){
    /**
     * running loop For recording the mouse movement (it seems to not be able to run much faster than 20 times per second
     *
     * @type {number}
     */
    time = player.getCurrentTime();
    frame = Math.floor(time*fps);
    record_frames[frame]= [mouse_pos.x,mouse_pos.y, ""];

    slider.value=time/player.playerInfo.duration*slider.max;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, 1920, 1080);

    display_hist(ctx, record_frames, "blue");
    if(reference_hist != null) {
        display_hist(ctx, reference_hist["mouse_pos"]);
        set_MSE(record_frames, reference_hist["mouse_pos"]);
    }
}



function print_pos(){
    /*obsolete/debug */
    px= document.getElementById("posx");
    px.innerText=mouse_pos.x;
    py= document.getElementById("posy");
    py.innerText=mouse_pos.y;
}


function MSE(list1,list2){
    /**
     * computation of the mean square error
     * need to add more metrics and refine.
     * @type {number}
     */
    len =  Math.min(list1.length,list2.length);
    s=0
    for(let i=0; i<len;i++){

        s+= Math.pow(list1[i][0]-list2[i][0],2)+Math.pow(list1[i][1]-list2[i][1],2)
    }
    return s/len

}

function set_MSE(hist1,hist2){
    /**
     * print mse to the page
     * @type {HTMLElement}
     */
    px = document.getElementById("mse");
    px.innerText = MSE(hist1, hist2);
}


function setup_canvas(player){
    /**
     * at startup
     * @type {HTMLElement}
     */
    canvas = document.getElementById("pannel");

    canvas.addEventListener("mousemove", mousemoveAction);

    document.addEventListener('keydown', keyPressedAction);
    //todo
}

function mousemoveAction(event){
    mouse_pos.x = event.offsetX;
    mouse_pos.y = event.offsetY;
}



function keyPressedAction(event){
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
    for (let b in actions){
        if (event.key == b)
            add_action_now(action[b])
     }
}





//------ Actions
function stopVideo(){
    player.stopVideo();
}





//----- Display
function display_hist(ctx, frames, color="black", last_seconds=5){
    /**
     * print an history on the canvas
     *
     */

      current_time = player.getCurrentTime();

    ctx.strokeStyle = color;
    ctx.lineWidth = 2;

    cur_t = Math.floor(current_time*fps)
    ctx.beginPath();
    first = frames[cur_t];
    ctx.moveTo(first[0], first[1]);

    for(i =1; i<fps*last_seconds;i++){
        idx = cur_t-i
        if ((idx >= 0) && (frames[idx][0]!==-1 )) {
            cur_pos = frames[idx];
            ctx.lineTo(cur_pos[0], cur_pos[1]);
        }
    }
    ctx.stroke();
}



function getCookie(name) {
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

