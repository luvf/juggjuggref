




export interface RecordPoint{
    x:number;
    y:number;
}
interface RecordEvent  {
    point:RecordPoint;
    time:number;
    comment:string;
}

enum refPosition{
    main="main",
    second="second",
    right="right",
    left="left",
}

export class RefRecord{
    mouse_pos:RecordPoint[];
    name:string;
    author:string;
    ref_position:refPosition;
    events:RecordEvent[];

    constructor(length:number) {
        this.reset_record(length)
        this.name = "";
        this.author = "";
        this.ref_position=refPosition.main;
        this.events=[];
    }

    reset_record(length:number){
        this.mouse_pos = [];
        for (let i = 0; i<length;i++){
            this.mouse_pos.push({x:-1,y:-1});
        }
    }

    to_clipboard():void{
        navigator.clipboard.writeText(this.get_json_record());
    }

    get_json_record():string{
        /**
         * prepare the json file for the server with metadata
         * */
        return JSON.stringify(this);
        // if author==null Todo
        //return JSON.stringify({"name":this.name, "ref_position": this.ref_position, "author":author, "mouse_pos" : frames, "events":[]})
    }

    update(pos:RecordPoint, time:number):void{
        this.mouse_pos[time]=pos
    }
}



function set_compare(id:number){
    /**
     * set the current record id to be the one to compare
     */
    reference_hist = histories[id]
}


export var record_frames = new RefRecord(0);

export var reference_hist:RefRecord=null;
export var histories : {[key:number] : RefRecord} ={};

