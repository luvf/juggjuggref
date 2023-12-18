// @filename: server_comunication.ts


import {get_json_record, set_record_names,add_record,get_yt_video_id} from "./html_manipulation.js"
import {record_frames} from "./record.js"


export async function submit_server(){
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


export async function record_names(){
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


