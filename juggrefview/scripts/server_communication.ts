// @filename: server_comunication.ts


import {RefRecord} from "./record.js"



export interface RecordInfo{
    ref_pos: string,
    video_id:string,
    name:string,
    url?:string
}

export interface RecordList {
    record_names :RecordInfo[];
}

export async function submit_server(video_id:string, start_tc:number, record:RefRecord){
    /**
     * submit a record to the server
     * url : [...]submit_record/<YT code>/
     */
    const url : string = "/submit_record/" +
        video_id+"/"+
        String(start_tc)+"/";
    const response = await fetch(url, {
        method : "POST",
        headers: {
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken'),
        },
        body: JSON.stringify(record),
    });
}


export async function record_names(video_id:string, start_tc:number, callback:(value:RecordList)=>void){
    /**
     * ask the server the records for the current video :
     * url = [...]record_names/<YT code>/
     * expects a in "recordsnames" a list of dicts {ref_position, record_name}
     * @type {HTMLElement}
     */

    const url:string = "/record_names/" +
        video_id + "/"+
        String(start_tc)+"/";

    const response = await fetch(url, {
        method: "GET",
        headers: {
            'Accept': 'application/json'
        },
    });

    const json_file = (await response.json()) as RecordList;
    callback(json_file);
}




export async function load_record(record_id:RecordInfo, start:number,
                           callback:(json_file:RefRecord)=>void){
    /**
     * ask a specific record to the server :
     * url = [...]load_record/<YT code>/<Ref position>/<record name>/
     * then pass it to add_record
     * @type {HTMLElement}
     */

    const url:string =
        "/load_record/" +
        record_id.video_id+"/"+
        String(start)+"/"+
        record_id.ref_pos+"/"+
        record_id.name+"/";

    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
        },
    });

    callback(await response.json());

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


