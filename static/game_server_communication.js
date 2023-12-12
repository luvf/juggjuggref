
/*async function generate_from_file(){
    let url = "cuts?generate_from_file";

    const responce = await fetch(url,{
        method:"GET",
        headers:{
            'Accept': 'application/json'
        }
    });
    const json_file =  await responce.json();

    write_cuts(json_file["cuts"], "pass","team1","team2");
}*/
async function update_infos() {
    let game_name =document.getElementById("game_name")
    let team1 =document.getElementById("Team1")
    let team2 =document.getElementById("Team2")

    let video =document.getElementById("vid_name")
    set_teams(team1[team1.selectedIndex].text, team2[team2.selectedIndex].text);
    let url = "update?"+
        "&game_name=" + game_name.value +
        "&team1=" + team1.value +
        "&team2=" + team2.value +
        "&rendered=" + video.value

    const response = await fetch(url, {
        method : "POST",
        headers: {
            'Accept': 'application/json',
              'X-CSRFToken': getCookie('csrftoken')
          },
          body : JSON.stringify({
              "game_name":game_name.value,
              "team1":team1.value,
              "team2":team2.value,
                "rendered" : video.value
          })
    });
    let xx = await response;
    let z=3
}

/*
async function load_cuts(tournament, game){
    let url = "cuts";
    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
          }
    });
    const json_file =  await response.json();
    let cuts= json_file["cuts"];
    write_cuts(cuts,"team2221","team2");
}*/
async function load_cut(cut_name){
    let url = cut_name + "/cuts";
    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
          }
    });
    let json_file =  await response.json();
    let cuts= json_file["cuts"];
    const team1=json_file["team1"];
    const team2=json_file["team2"];
    //return cuts, cut_name, team1, team2
    create_cut_helper(cut_name, cuts);

    ///write_cuts(cuts,  cut_name,team1,team2);

}

async function delete_cut(cut_id){
    // TODO prompt ask
    let cut_name = document.getElementById("name_input"+"_"+cut_id).value;

    let url = cut_name+"/delete_cut";

    const response = await fetch(url, {
        method : "POST",
        headers: {
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
    });
}

async function submit(cut_id){
    let cuts = extract_cuts(cut_id);
    let cut_name = document.getElementById("name_input"+"_"+cut_id).value;

    //let cut_name = "";

    let url = cut_name+"/upload_cuts";
    const response = await fetch(url, {
        method : "POST",
        headers: {
            'Accept': 'application/json',
            'X-CSRFToken': getCookie('csrftoken')
        },
        body: JSON.stringify({"cuts": cuts,"name":cut_name})
    });
}


async function gen_from(type, cut_name){

    let url = "gen_"+type;
    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
          }
    });
    let json_file =  await response.json();

    for (var cut of json_file["data"] ){
        let cuts= cut["cuts"];
        let filename = cut["filename"]
        const team1="t1"
        const team2="t2";
        create_cut_helper(filename, cuts)

        //write_cuts(cuts,  filename,team1,team2);
    }

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



const csrftoken = getCookie('csrftoken');