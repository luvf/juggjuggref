// @filename: html_manipulation.ts

import {RecordPoint, refPosition, RefRecord} from "./record.js"

import {RecordList,RecordInfo} from "./server_communication.js"

export class Html_manipulation{
    private _canvas:HTMLCanvasElement;
    //private _playerIFrame:HTMLIFrameElement;
    private _slider:HTMLInputElement;
    private _record_list:HTMLElement;

    on_submit : ()=>void;
    on_copy_clipboard : ()=>void;
    on_load_names : ()=>void;

    on_click_load_record: (record:RecordInfo)=>void;

    on_file_drop:(new_record:RefRecord)=>void;


    constructor() {
        this._canvas = document.getElementById("pannel")as HTMLCanvasElement;
        this._record_list = document.getElementById("record_list");
        this._slider = document.getElementById("myRange")as HTMLInputElement;

        this.add_click_listener("record_names", ()=>{this.on_load_names();});
        this.add_click_listener("copy_record",  ()=>{this.on_copy_clipboard();});
        this.add_click_listener("submit_server",()=>{this.on_submit();});

        document.getElementById("drop").addEventListener("dragover", (ev:Event)=>{ev.preventDefault();});
        document.getElementById("drop").addEventListener("drop", (ev: DragEvent)=>{ this.myDropHandler(ev);});

    }

    private add_click_listener(element_id:string, fun:()=>void):void{//as_type:HTMLElement=HTMLInputElement
        const element = (document.getElementById(element_id));
        if (element){
            element.addEventListener("click", fun);
        }
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
        const div =document.getElementById("metric");
        div.innerText=value;
    }


    get_yt_video_id():string{
        /**
         * find the yt video url
         */
        return document.getElementById("juggjuggref_script").dataset.videoid;
    }

    get_review_start_tc():number{
        /**
         * find the point to record
         */
        return parseInt(document.getElementById("juggjuggref_script").dataset.start_tc);
    }
    get_review_end_tc():number{
        /**
         * find the point to record
         */
        return parseInt(document.getElementById("juggjuggref_script").dataset.end_tc);
    }

    myDropHandler(ev: DragEvent):void {
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
                    this.load_local_file(file);
                }
            });
        } else {
            // Use DataTransfer interface to access the file(s)
            for (const file of ev.dataTransfer.files){
                this.load_local_file(file);
            }
        }
    }
    load_local_file(filename:File){//Modify
        /**
         * load a file in drag and drop
         * calls add_record
         * @type {FileReader}
         */
        const reader = new FileReader();
        reader.addEventListener(
            "loadend",
            () => {this.on_file_drop(JSON.parse(<string>reader.result)as RefRecord)       },
            false,
        );
        reader.readAsText(filename as Blob);
    }




    build_record_names(records: RecordInfo[]):void{

        const new_div = document.createElement("div");

        const select : HTMLSelectElement = document.createElement("select");
        const child_id = this._record_list.children.length
        select.name = "record_names";
        select.id = "record_names_"+child_id;

        for (let rec of records){
            const option: HTMLOptionElement = document.createElement("option");
            option.value = JSON.stringify(rec);
            option.textContent = rec.ref_pos + " " + rec.name;
            select.appendChild(option);
        }
        const label : HTMLLabelElement = document.createElement("label");
        label.innerHTML = "Record to playback : "
        label.htmlFor = "record_name";
        new_div.setAttribute("class", "record");
        new_div.id = "new_record_"+ child_id;

        let load_button = document.createElement("button") as HTMLButtonElement;
        load_button.textContent = "Load";
        load_button.addEventListener("click",()=>{
            const selected = document.getElementById("record_names_"+child_id) as HTMLOptionElement;
            const record = JSON.parse(selected.value) as RecordInfo;
            this.on_click_load_record(record);
            new_div.parentNode.removeChild(new_div);
        });

        new_div.appendChild(label);
        new_div.appendChild(select);
        new_div.appendChild(select);
        new_div.appendChild(load_button);

        this._record_list.appendChild(new_div);
    }



    add_record(json_file:RefRecord, set_compare:()=>void):void{
        /**
         * modify the html page to add the record information, and add it to the list of recods
         */

        //document.getElementById("new_record_"+record_id);
        const new_div :HTMLElement= document.createElement("div");
        new_div.setAttribute("class", "record");

        const name: HTMLElement = document.createElement("label");
        name.innerText = "name : "+ json_file.name;
        new_div.appendChild(name);

        const author: HTMLElement = document.createElement("label");
        author.innerText = ", author : "+ json_file.author;
        new_div.appendChild(author);
        new_div.appendChild(document.createElement("br"));

        const pos = document.createElement("label");
        pos.innerText = "Reff Position  : "+ json_file.ref_position;
        new_div.appendChild(pos);
        new_div.appendChild(document.createElement("br"));

        const but = document.createElement("button")
        but.addEventListener("click", set_compare);
        but.innerText= "set compare";

        new_div.appendChild(but);

        this._record_list.appendChild(new_div)


    }

    print_pos(pos:RecordPoint):void{
        /*obsolete/debug */
        const px= document.getElementById("posx");
        px.innerText = pos.x.toString();
        const py= document.getElementById("posy");
        py.innerText=  pos.y.toString();
    }

    draw_line(frames:RecordPoint[], color="black"):void{
        /**
         * print an history on the canvas
         *
          */
        if (frames.length){
            const first = frames[0];
            const ctx:RenderingContext = this._canvas.getContext("2d");

            ctx.strokeStyle = color;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(first.x*this._canvas.width, first.y*this._canvas.height);

            for(const frame of frames){
                if (frame.x!==-1 ) {
                    ctx.lineTo(frame.x*this._canvas.width, frame.y*this._canvas.height);
                }
            }
            ctx.stroke();
        }
    }
}

