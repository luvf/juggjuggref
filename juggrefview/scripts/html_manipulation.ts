// @filename: server_comunication.ts

import {RecordPoint, RefRecord,histories,reference_hist} from "./record.js"


export function get_yt_video_id():string{
    /*
    * Simple helper to form Youtube url to just video code
    * */
    const url : string = (document.getElementById("video_url") as HTMLInputElement).value
    const urlsliced : string[] = url.split('=');
    return urlsliced.slice(-1)[0];
}


export function get_json_record(frames :RecordPoint[], name:string=null, ref_position:string=null, author:string ="me"):string{
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




export function set_url(player:YT.Player):void{
    // change the video url => will be removed
    const url:string = get_yt_video_id();
    player.loadVideoById(url);
    reset_player();
    player.pauseVideo();
}





export function set_record_names(json_file:any):void{

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



export function add_record(json_file:any, record_id:number):void{
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

    histories[record_id]= new RefRecord(0);
    histories[record_id].mouse_pos=json_file["mouse_pos"];

    if (reference_hist == null) {
        set_compare(record_id);
    }
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