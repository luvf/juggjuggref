// @filename: server_comunication.ts

import {RecordPoint, refPosition} from "./record.js"



export class Html_manipulation{
    private _canvas:HTMLCanvasElement;
    //private _playerIFrame:HTMLIFrameElement;
    private _slider:HTMLInputElement;
    private _record_list:HTMLElement;

    on_seturl : ()=>void;
    on_submit: ()=>void;
    on_copy_clipboard : ()=>void;
    on_load_names: ()=>void;

    on_click_load_record: ()=>void;



    constructor() {
        this._canvas = document.getElementById("")as HTMLCanvasElement;
        this._record_list = document.getElementById("record_list");
        this._slider = document.getElementById("myRange")as HTMLInputElement;


        (document.getElementById("record_names") as HTMLInputElement).addEventListener("click", this.on_load_names);
        (document.getElementById("copy_record") as HTMLInputElement).addEventListener("click", this.on_copy_clipboard);
        (document.getElementById("submit_server") as HTMLInputElement).addEventListener("click", this.on_submit);
        (document.getElementById("set_url") as HTMLInputElement).addEventListener("click", this.on_seturl);




    }

    get_canvas():HTMLCanvasElement {
        return this._canvas;
    }
    get_slider():HTMLInputElement {
        return this._slider;
    }
    get_player_div():HTMLDivElement {
        return document.getElementById("player")as HTMLDivElement;
    }

    set_metric(metric:string, value:string):void{
        const div =document.getElementById("mse");
        div.innerText=value;
    }


    get_yt_video_id():string{
        /*
        * Simple helper to form Youtube url to just video code
        * */
        const url : string = (document.getElementById("video_url") as HTMLInputElement).value
        const urlsliced : string[] = url.split('=');
        return urlsliced.slice(-1)[0];

    }
    get_selected_record():{ref_pos:string,name:string}{


        return {ref_pos:"main",name:"lol"}
    }



    build_record_names(records: {name:string,ref_position:refPosition}[]):void{
        const new_div = document.createElement("div");

        const select : HTMLSelectElement = document.createElement("select");
        const child_id = this._record_list.children.length
        select.name = "record_names";
        select.id = "record_names_"+child_id;

        for (let rec of records){
            const option: HTMLOptionElement = document.createElement("option");
            option.value = rec.ref_position + ":" + rec.name;
            option.textContent = rec.ref_position + " " + rec.name;
            select.appendChild(option);
        }
        const label : HTMLLabelElement = document.createElement("label");
        label.innerHTML = "Record to playback : "
        label.htmlFor = "record_name";
        new_div.setAttribute("class", "record");
        new_div.id = "new_record_"+ child_id;

        let load_button = document.createElement("button") as HTMLButtonElement;
        load_button.textContent = "Load";
        load_button.onclick=()=>{
            this.on_click_load_record;
            new_div.parentNode.removeChild(new_div);
        };

        new_div.appendChild(label);
        new_div.appendChild(select);
        new_div.appendChild(select);
        new_div.appendChild(load_button);

        this._record_list.appendChild(new_div);
    }



    add_record(json_file:any, set_compare:()=>void):void{
        /**
         * modify the html page to add the record information, and add it to the list of recods
         */

        //document.getElementById("new_record_"+record_id);
        const new_div = document.createElement("div");

        const name: HTMLElement = document.createElement("label");
        name.innerText = "name : "+ json_file["name"];
        new_div.appendChild(name);

        const author: HTMLElement = document.createElement("label");
        author.innerText = ", author : "+ json_file["author"];
        new_div.appendChild(author);
        new_div.appendChild(document.createElement("br"));

        const pos = document.createElement("label");
        pos.innerText = "Reff Position  : "+ json_file["position"]
        new_div.appendChild(pos);
        new_div.appendChild(document.createElement("br"));

        const but = document.createElement("button")
        but.onclick = set_compare;
        but.innerText= "set compare";

        new_div.appendChild(but);

        this._record_list.appendChild(new_div)


    }

    print_pos():void{
        /*obsolete/debug */
        const px= document.getElementById("posx");
        px.innerText = mouse_pos.x.toString();
        const py= document.getElementById("posy");
        py.innerText=  mouse_pos.y.toString();
    }

    display_hist(frames:RecordPoint[], current_time=0, color="black", last_seconds=5):void{
        /**
         * print an history on the canvas
         *
         */
        const cur_t = Math.floor(current_time*fps)
        const first = frames[cur_t];
        const ctx:RenderingContext = this._canvas.getContext("2d");

        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();

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



/*



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
     /

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

    if (window.reference_hist == null) {
        set_compare(record_id);
    }
}



*/