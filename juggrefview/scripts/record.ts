




export class RecordPoint{
    x:number;
    y:number;
    constructor(x:number=0,y:number=0) {
        this.x = x;
        this.y = y;
    }
}

export function MSE(list1:RecordPoint[], list2:RecordPoint[]):number{
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




export class RecordEvent  {
    point:RecordPoint;
    time:number;
    comment:string;
    constructor(pos:RecordPoint, time:number, comment:string ) {
        this.point= pos;
        this.time = time;
        this.comment = comment;
    }

}


export enum refPosition{
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
            this.mouse_pos.push(new RecordPoint(-1,-1));
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


    distance(record:RefRecord, method:"MSE"="MSE"):number{
        switch (method){
            case "MSE":
                return MSE(this.mouse_pos,record.mouse_pos);
            default:
                const _exhaustiveCheck: never = method;
                return _exhaustiveCheck;
        }
    }
}


