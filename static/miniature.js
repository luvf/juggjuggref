



async function set_tournament(){
    let tournament_name = document.getElementById("tournament_name")
    const url = "tournament?tournament="+tournament_name.value
        const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
          }
    });
    const vid = await response.json();
    const videos = vid["videos"]

    //var videos = JSON.parse(xmlHttp.response)["videos"];
    //requests.get(url="miniatures/tournament", {"tournament":tournament_name})

    let video_list = document.getElementById("vid_name")
    while (video_list.lastElementChild) {
        video_list.removeChild(video_list.lastElementChild);
      }

    for (let v in videos){
        let new_el = document.createElement("option", {"value":videos[v]});
        new_el.innerHTML = videos[v];
        video_list.appendChild(new_el);
    }
}


function set_game(){
    let vid_name = document.getElementById("vid_name")

    let logos1 =document.getElementById("Team1");
    let logos2 =document.getElementById("Team2");

    const [logo1, name1] = identify_team(logos1.children,vid_name.value);
    const exclude = identify_team(logos2.children,name1)[0];
    const [logo2, name2] = identify_team(logos2.children,vid_name.value,exclude);

    logos1.selectedIndex=logo1;
    logos2.selectedIndex=logo2;
    document.getElementById("Team2").selectedIndex=logo2;
    document.getElementById("Team2");

}


function identify_team(logos,selected_video, exclude=null){
    var team = 0;
    let compare_str = selected_video.toUpperCase();
    for (i= 0; i<logos.length ; i++){
        if( i == exclude){ continue;    }
        if (compare_str.includes(logos[i].value.toUpperCase()) ){
            team= i;
        }
        if (compare_str.includes(logos[i].innerHTML.toUpperCase())){
            team= i;
        }
    }
    //ret = list(logos)
    //ret[team], ret[0]= logos[0] ,logos[team]
    return [team, logos[team].value];
}

async function generate_miniature(regen_bg){
    let tournament_name = document.getElementById("tournament_name")
    let vid_name = document.getElementById("vid_name")
    let team1 = document.getElementById("Team1")
    let team2 = document.getElementById("Team2")
    let xoffset = document.getElementById("xoffset")
    let yoffset = document.getElementById("yoffset")
    let zoom = document.getElementById("zoom")


    let url = "gen_miniature?" +
        "tournament="+tournament_name.value+
        "&video="+ vid_name.value+
        "&Team1=" + team1.value+
        "&Team2=" + team2.value+
        "&xoffset=" + xoffset.value+
        "&yoffset=" + yoffset.value+
        "&zoom=" + zoom.value+
        "&regen_bg="+ regen_bg;
    const response = await fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
          }
    });
    const response_json = await response.json();

    var _image = new Image();
    _image.src = "../static/"+response_json["image_url"]+"?" + new Date().getTime();
    _image.setAttribute("class","renderedminiature");

    let image_container =document.getElementById("image_container");
    image_container.lastElementChild.remove();
    image_container.appendChild(_image);

    let yt_metadata = response_json["yt_metadata"];


    vid_name = document.getElementById("yt_video_name");
    vid_name.value=yt_metadata["vid_name"];


    description = document.getElementById( id="yt_video_description");
    description.value=yt_metadata["description_game"] + yt_metadata["description_links"]+ yt_metadata["description_TC"] ;



}




async function upload_on_youtube(){
    let tournament_name = document.getElementById("tournament_name")
    let vid_name = document.getElementById("vid_name")
    let team1 = document.getElementById("Team1")
    let team2 = document.getElementById("Team2")
    let offset = document.getElementById("slider")
    let image_url = document.getElementById("output_image").url
    let yt_video_name = document.getElementById("yt_video_name")
    let yt_video_description = document.getElementById("yt_video_description")
    let yt_pub_date = document.getElementById("yt_pub_date")




    let url = "upload_youtube?" +
        "tournament="+tournament_name.value+
        "&video="+ vid_name.value+
        "&Team1=" + team1.value+
        "&Team2=" + team2.value+
        "&offset=" + offset.value+
        "&url=" + image_url+
        "&yt_video_name" + yt_video_name.value+
        "&yt_video_description" + yt_video_description.value+
        "&yt_pub_date" + yt_pub_date.value


    fetch(url, {
        method : "GET",
        headers: {
            'Accept': 'application/json'
          }
    });





}
