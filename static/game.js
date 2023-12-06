

function set_teams(team1, team2){
    labels1 = document.getElementsByClassName("team1_label");
    for (let el of labels1){
        el.textContent=team1;
    }
    labels2 = document.getElementsByClassName("team2_label");
    for (let el of labels2){
        el.textContent=team2;
    }

}



function write_cuts(cuts, group, cut_name,cut_id,  team1, team2){
    while (group.lastElementChild) {
        group.removeChild(group.lastElementChild);
      }
    group.appendChild(add_top_pannel(cut_id, cut_name));

    group.appendChild(add_buttons(cut_id,0));

    for (var i =0;i<cuts.length;i++ ){
        group.appendChild(cut_html(i,cuts[i],cut_id, team1, team2))
    }

}



function add_top_pannel(cut_id,cut_name){
    let group = document.createElement("div");
    group.class = "top_panel";
    group.id = "top_panel_"+cut_id;

    let name_label = document.createElement("label");
    name_label.textContent = " Name of the cut : ";

    let name_input = document.createElement("input" );
    name_input.setAttribute("type", "text");
    name_input.id = "name_input_"+cut_id
    name_input.size="15"
    name_input.setAttribute("value", cut_name);

    let update_button = document.createElement("button" );
    update_button.onclick=function(){submit(cut_id);}
    update_button.innerText = "submit"
    /*
    let gen_cor_button = document.createElement("button");
    gen_cor_button.textContent = "Gen from vid file"
    gen_cor_button.onclick = function(){gen_from("file",cut_name) }

    let gen_xml_button = document.createElement("button");
    gen_xml_button.textContent = "Gen from xml file"
    gen_xml_button.onclick = function(){ gen_from("xml",cut_name)}

    let gen_ML_button = document.createElement("button");
    gen_ML_button.textContent = "Gen from ML file"
    gen_ML_button.onclick = function(){ gen_from("ml",cut_name)}*/




    group.appendChild(name_label);
    group.appendChild(name_input);
    group.appendChild(update_button);

    group.appendChild(document.createElement("br"));

    /*group.appendChild(gen_cor_button);
    group.appendChild(gen_xml_button);
    group.appendChild(gen_ML_button);*/

    group.appendChild(document.createElement("br"));
    group.appendChild(document.createElement("br"));

    return group
}




function cut_html(i, cut,cut_id, team1,team2){

    cur_span = document.createElement("span",  );
    cur_span.id="cut_"+i.toString()+"_"+cut_id
    in_tc = TC_html("in",i, cut["in"],cut_id);

    end= TC_html("end",i,cut["out"], cut_id);


    let radio = create_radio(i, team1, team2, cut_id)

    cur_span.appendChild(document.createElement("br"));
    let table =document.createElement("table")
    table.appendChild(in_tc);
    //cur_span.appendChild(document.createElement("br"));

    table.appendChild(end);
    cur_span.appendChild(table);

    //cur_span.appendChild(document.createElement("br"));
    cur_span.appendChild(radio);

    cur_span.appendChild(document.createElement("br"));
    cur_span.appendChild(document.createElement("br"));


    cur_span.appendChild(add_buttons(cut_id, i));

    return cur_span
}



function create_radio(i, team1,team2, cut_id){
    team1name = team1;
    team1slug ="team1";
    team2name =team2;
    team2slug ="team2";


    scored_form =document.createElement("form");
    scored_form.id= "team_score_"+i.toString()+"_"+cut_id;
    name= scored_form.id

    main_label = document.createElement("label");
    main_label.textContent = "Who Scored : ";


    team1_radio = document.createElement("input" );
    team1_radio.type = "radio";
    team1_radio.value ="1";
    team1_radio.name = name
    team1_radio.id =i.toString()+"_radio_"+team1name+"_"+cut_id

    team1_label = document.createElement("label");
    team1_label.className="team1_label"
    team1_label.textContent= team1name;
    team1_label.setAttribute("for", team1_radio.id)


    team2_radio = document.createElement("input")
    team2_radio.type = "radio"
    team2_radio.value ="2";
    team2_radio.name = name;
    team2_radio.id =i.toString()+"_radio_"+team2name+"_"+cut_id

    team2_label = document.createElement("label")
    team2_label.className="team2_label"
    team2_label.textContent= team2name;
    team2_label.setAttribute("for", team2_radio.id)

    wdh_radio = document.createElement("input")
    wdh_radio.type = "radio"
    wdh_radio.value ="0";
    wdh_radio.name = name;
    wdh_radio.checked=true;
    wdh_radio.id =i.toString()+"_radio_wdh"+"_"+cut_id

    wdh_label = document.createElement("label")
    wdh_label.textContent= "no point";
    wdh_label.setAttribute("for", wdh_radio.id)


    set_check = document.createElement("input")
    set_check.type = "checkbox"
    set_check.name = "set";
    set_check.id ="set_"+i.toString()+"_"+cut_id

    set_label = document.createElement("label")
    set_label.textContent= "set_scored";
    set_label.setAttribute("for", set_check.id)



    scored_form.appendChild(main_label);

    scored_form.appendChild(team1_radio);
    scored_form.appendChild(team1_label);

    scored_form.appendChild(team2_radio);
    scored_form.appendChild(team2_label);

    scored_form.appendChild(wdh_radio);
    scored_form.appendChild(wdh_label);

    scored_form.appendChild(document.createElement("br"));

    scored_form.appendChild(set_check);
    scored_form.appendChild(set_label);



    return scored_form
}

function add_buttons(cut_id, i){
    buttons = document.createElement("span");
    buttons.id = i.toString()+"_buttons_"+cut_id
    remove_b    = document.createElement("button",);
    remove_b.innerText ="remove"
    remove_b.onclick= function(){remove_cut(cut_id, i);};

    move_up_b   = document.createElement("button");
    move_up_b.innerText ="move up"
    move_up_b.onclick= function(){move_cut(cut_id, i,"up");};

    move_down_b = document.createElement("button");
    move_down_b.innerText ="move down"
    move_down_b.onclick= function(){move_cut(cut_id, i,"down");};

    add_b       = document.createElement("button");
    add_b.innerText ="create"

    add_b.onclick= function(){add_cut(cut_id, i);};

    buttons.appendChild(remove_b);
    buttons.appendChild(move_up_b);
    buttons.appendChild(move_down_b);
    buttons.appendChild(add_b);

    buttons.appendChild(document.createElement("br"));

    return buttons

}



function TC_html(name, id, tc,cut_id) {
    let [hms, f] = tc.split(".")
    let [h, m, s] = hms.split(":");
    tab_line = document.createElement("tr",);
    tab_line.id = name + "_span_" + id.toString() + "_" + cut_id;
    tab_line.class = "tc_contain";

    label = document.createElement("label");
    label.textContent = name + " : ";

    hour = document.createElement("input");
    hour.type = "number";
    hour.id = id.toString() + "_" + name + "_h" + "_" + cut_id;
    hour.min = 0;
    hour.max = 24;
    hour.size = 1;
    hour.value = h;


    minute = document.createElement("input");
    minute.type = "number";
    minute.id = id.toString() + "_" + name + "_mi" + "_" + cut_id;
    minute.min = 0;
    minute.max = 60;
    minute.size = 1;
    minute.value = m;

    second = document.createElement("input", min = 0);
    second.type = "number";

    second.id = id.toString() + "_" + name + "_sc" + "_" + cut_id;
    second.min = 0;
    second.max = 60;
    second.size = 1;
    second.value = s;

    frame = document.createElement("input");
    frame.type = "number";
    frame.id = id.toString() + "_" + name + "_fr" + "_" + cut_id;
    frame.min = 0;
    frame.max = 60;
    frame.size = 2;
    frame.value = f;

    lower_button = document.createElement("button");
    lower_button.onclick=function(){set_time_relative(tab_line.id,"-1")};
    lower_button.textContent = "Pevious";

    pfive = document.createElement("button");
    pfive.onclick=function(){set_time_relative(tab_line.id,"5")};
    pfive.textContent = "5 stones";

    pten = document.createElement("button");
    pten.onclick=function(){set_time_relative(tab_line.id,"10")};
    pten.textContent = "ten stones";

    upper_button = document.createElement("button");
    upper_button.onclick=function(){set_time_relative(tab_line.id,"-1")};
    upper_button.textContent = "next";

    let elements = [
        label,
        hour,
        document.createTextNode(":"),
        minute,
        document.createTextNode(":"),
        second,
        document.createTextNode("."),
        frame,
        lower_button, pfive,pten,upper_button,
    ]
    for (el of elements){
        ol= document.createElement("td")
        ol.appendChild(el)
        tab_line.appendChild(ol);
    }

    return tab_line;
}

function set_time_relative(id, value){
    let current = docutemnt.getElementById(id);
    if (value==-1){
        current;
    }
    if (value==-2){
        x=3;
    }

}
function remove_cut(cut_name, id){

}

function move_cut(cut_name, id, direction){

}

function add_cut(name,id){
    let group = document.getElementById(name).getElementById(".cuts");
    //document.getElementById(test).querySelector(".cuts")
    group.appendChild(cut_html(group.children.length, {"in":"00:00:00.0","end":"00:00:00.0"}));

}

function extract_tc(id, name, cut_id){
    ho =document.getElementById(id.toString()+"_" +name + "_h"+"_"+cut_id).value;
    mi = document.getElementById(id.toString()+"_" +name + "_mi"+"_"+cut_id).value;
    sc = document.getElementById(id.toString()+"_" +name + "_sc"+"_"+cut_id).value;
    fr = document.getElementById(id.toString()+"_" +name + "_fr"+"_"+cut_id).value;

    return ho+":"+mi+":"+sc+"."+fr

}

function extract_winner_set(id, cut_id){
    name ="team_score_"+id.toString()+"_"+cut_id;
    set_name = "set_"+id.toString()+"_"+cut_id;
    set_scored=   document.querySelector('#'+set_name).checked===true;

    winner = document.querySelector('input[name='+name+']:checked').value;


    return [winner, set_scored];
}

function extract_cuts(cut_id){
    cuts = document.getElementById("tabs_"+ cut_id.toString()).children
    json_cut=[];
    for (var i = 0;i<cuts.length-2;i++){
        start_tc=extract_tc(i, "in",cut_id);
        end_tc=extract_tc(i, "end", cut_id);
        let [winner, set] = extract_winner_set(i,cut_id);
        json_cut.push({start:start_tc, end:end_tc,result:winner, set: set});
    }
    return json_cut
}



 function openCut(id, cityName) {
    // Declare all variables
    var i, tabcontent, tablinks;

    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("cuts");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    // Show the current tab, and add an "active" class to the link that opened the tab
    document.getElementById("tabs_"+id.toString()).style.display = "block";
    document.getElementById("tablinks_"+id).className += " active";

    //document.getElementById("tabs_"+id).className += " active";

    //evt.currentTarget.className += " active";
}
function create_cut(event, cut_name="new_cut", cut=[]){
    create_cut_helper(cut_name, cut)

    openCut(event, cut_name)
}


function create_cut_helper(cut_name, cut){

    let span_container =document.getElementById("cuts_tab");
    var tabs = document.querySelectorAll("#cut_tab .tablinks").length;
    tabs-=1;
    let new_cuts = document.createElement("span");
    new_cuts.setAttribute("class", "cuts");
    new_cuts.setAttribute("id", "tabs_"+tabs.toString());
    span_container.appendChild(new_cuts);

    write_cuts(cut, new_cuts, cut_name, tabs, "t1","t2");
    let parent =document.getElementById("cut_tab");

    let new_tab = document.createElement("button");
    new_tab.setAttribute("class", "tablinks");
    new_tab.setAttribute("id", "tablinks_"+tabs.toString());

    //new_tab.setAttribute("onclick", );
    new_tab.onclick= function(){openCut(tabs, cut_name);};
    new_tab.innerText = cut_name;
    parent.insertBefore(new_tab, parent.children[parent.children.length-2]);
}




