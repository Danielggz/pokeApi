import { Pokemon } from './classes/Pokemon.js';

const gradient = `
background: color1; /* Old browsers */
background: -moz-linear-gradient(45deg, color1 0%, color1 50%, color2 51%, color2 100%); /* FF3.6-15 */
background: -webkit-linear-gradient(45deg, color1 0%,color1 50%,color2 51%,color2 100%); /* Chrome10-25,Safari5.1-6 */
background: linear-gradient(45deg, color1 0%,color1 50%,color2 51%,color2 100%); /* W3C, IE10+, FF16+, Chrome26+, Opera12+, Safari7+ */
filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#9dd53a', endColorstr='color2',GradientType=1 ); /* IE6-9 fallback on horizontal gradient */
`
const colores = {
    'grass': '#78C850',
    'flying':'#A890F0',
    'poison':'#A040A0',
    'normal':'#A8A878',
    'fighting':'#C03028',
    'ground':'#E0C068',
    'rock':'#B8A038',
    'bug':'#A8B820',
    'ghost':'#705898',
    'steel':'#B8B8D0',
    'fire':'#F08030',
    'water':'#6890F0',
    'electric':'#F8D030',
    'psychic':'#F85888',
    'ice':'#98D8D8',
    'dragon':'#7038F8',
    'fairy': '#EE99AC',
    'dark': '#6F5648',
}


// VARIABLES GLOBALES
var selectedStat = ''; //ORDENAR POR STAT
var asc_desc = 0; //DIRECCIÓN DE ORDENACIÓN
var myStorage = window.localStorage;
var pokeDex = [];

window.onload = function()  
{
    var section = document.getElementById("pokemons");

    if(myStorage.getItem("pokemons")!=null){
        var pokemons = JSON.parse(myStorage.getItem("pokemons"));
        pokemons.forEach(pkmn=>{
            var pk = new Pokemon(pkmn.name, pkmn.id, pkmn.img, pkmn.types, pkmn.stats);
            if(pkmn["description"]!=undefined) pk.setDescription(pkmn.description);
            if(pkmn["data"]!=undefined) pk.setData(pkmn.data);
            if(pkmn["evolutionChain"]!=undefined) pk.setEvolutionChain(pkmn.evolutionChain);
            pokeDex.push(pk);
        });
        boot();
    }else{
        var xmlReq = new XMLHttpRequest();
        var url = "https://pokeapi.co/api/v2/pokemon/";
    
        xmlReq.onreadystatechange = function() 
        {
            if (this.readyState == 4 && this.status == 200) 
            {
                var result = JSON.parse(this.response);
                // var generation = document.getElementById("gen");
                // var pkmnNumber = cargarGeneracion(generation.value);
                var pokeArray = result.results.slice(0, 386);
                cargarPokemon(pokeArray);
            }
        };
    
        xmlReq.open("GET", url, true);
        xmlReq.send();
    }
    
    var modal = document.getElementById('myModal');
    var span = document.getElementsByClassName("close")[0];
    span.onclick = function() {
        modal.style.display = "none";
    }
    
    // <----------------------------MÉTODOS PRINCIPALES------------------------------->
    function boot(){
        pokeDex.sort(ordenarPokemon);
        generarPokeTabla(pokeDex);
        cargarMenu();
        cargarSelectTipos();
        cargarOrderByStats(); 
        cargarBuscador();
        cargarOrderAscDesc();
        var loader = document.getElementsByClassName('loader')[0].setAttribute("style", "display: none;");
    }

    function cargarGeneracion(version){
        switch (version) {
            case "1":
                return 151;
                break;
            case "2":
                return 251;
                break;
            case "3":
                return 386;
                break;
            case "4":
                return 
                break;
            case "5":
                break;
            case "6":
                break;
            case "7":
                break;
            default:
                break;
        }
    }

    function cargarPokemon(pokeArray)
    {
        pokeArray.forEach(pokemon => {

            var xmlReq2 = new XMLHttpRequest();
            var url2 = pokemon.url;

            xmlReq2.onreadystatechange = function()
            {
                if (this.readyState == 4 && this.status == 200) 
                {
                    var pokeObject = JSON.parse(this.response);
                    console.log(pokeObject);
                    var stats = {};
                    pokeObject.stats.forEach(element => {
                        stats[element.stat.name] = element.base_stat;
                    });
                    var types = {};
                    pokeObject.types.forEach(element => {
                        types[element.slot] = element.type.name;
                    });
                    var pokeImg = pokeObject.sprites.front_default;

                    pokeDex.push(new Pokemon(pokemon.name, pokeObject.id, pokeImg, types, stats));

                    if(pokeDex.length == 386)
                    {
                        myStorage.setItem("pokemons", JSON.stringify(pokeDex));
                        boot();
                    }
                }
            }

            xmlReq2.open("GET", url2, true);
            xmlReq2.send();
        });
    }

    function generarPokeTabla(pokeArray)
    {
        document.getElementById('pokemons').innerHTML= '';

        pokeArray.forEach(pkmn => {
            var art = document.createElement("article");
            art.className = "tooltip";
            art.style = colorStyling(pkmn);
            var a = document.createElement("a");
            a.innerText = pkmn.name;
            var img = document.createElement("img");
            img.src = pkmn.img;
            var tooltip_content = document.createElement("span");
            tooltip_content.className = "tooltiptext";
            tooltip_content.innerHTML = "<strong>" + pkmn.getName() + "</strong><hr/>" + pkmn.statsToString() + "<hr/>" + pkmn.getTypes();

            art.appendChild(img);
            art.appendChild(a);
            art.appendChild(tooltip_content);
            art.id = "pkmn" + pkmn.id;
            art.addEventListener("click", cardEvent);
            section.appendChild(art);
        });
    }

    function filtrar(){
        var filteredPokedex = [];
        var tipo1 = document.getElementById("sel_tipo1").value;
        var tipo2 = document.getElementById("sel_tipo2").value;
        var orderStatVal = document.getElementById('orderby_stats').value;
        var buscVal = document.getElementById('buscador').value;

        if(buscVal != '')
        {
            filteredPokedex = pokeDex.filter(pkmn=>{
                if(pkmn.name.startsWith(buscVal.toLowerCase()))
                {
                    return true;
                }
            });
        }else{
            filteredPokedex = pokeDex;
        }


        filteredPokedex = filteredPokedex.filter(pkmn=>{
            if(tipo1=='all' && tipo2 == 'all')
            {
                return true;
            }
            else if(tipo1!='all' && tipo2 == 'all' || tipo1=='all' && tipo2 != 'all')
            {
                if(pkmn.types['1'] == tipo1 || pkmn.types['2'] == tipo2)
                {
                    return true;
                }
            }
            else if(tipo1!='all' && tipo2 != 'all')
            {
                if(pkmn.types['1'] == tipo1 && pkmn.types['2'] == tipo2)
                {
                    return true;
                }
            }
        }).sort(ordenarPokemon);

        generarPokeTabla(filteredPokedex);
    }

    function cargarMenu(){
        var menu = document.getElementById("filtros");
        menu.className = "mostrar";
    }

    function cardEvent(evt){
        var id = evt.currentTarget.id.slice(4);
        var pkmn = pokeDex.filter(pk=>{
            if(pk.id==id)return true;
        })[0];

        if(pkmn.evolutionChain!=undefined && pkmn.description!=undefined && pkmn.data!=undefined)
        {
            createModalContent(pkmn);
            modal.style.display = "block";
        }
        else{
            var xmlCardReq = new XMLHttpRequest();
            url=`https://pokeapi.co/api/v2/pokemon-species/${id}/`;
            xmlCardReq.open("GET", url, true);
            xmlCardReq.send(null);
            xmlCardReq.onreadystatechange = function()
            {
                if (this.readyState == 4 && this.status == 200) 
                {
                    var info = JSON.parse(this.response);
                    
                    var desc = info.flavor_text_entries.filter(d=>{
                        if(d.language.name=="es") return true;
                    });
                    var data = {
                        "base_happiness": info.base_happiness,
                        "capture_rate": info.capture_rate,
                        "gender_rate": info.gender_rate,
                    }
    
                    pkmn.setDescription(desc);
                    pkmn.setData(data);
                    var xmlCardReq2 = new XMLHttpRequest();
                    var url2 = info.evolution_chain.url;
                    xmlCardReq2.open("GET", url2, true);
                    xmlCardReq2.send(null);
                    xmlCardReq2.onreadystatechange = function()
                    {
                        if(this.readyState == 4 && this.status == 200)
                        {
                            var evolution_data = JSON.parse(this.response)["chain"];
                            if(evolution_data!=undefined)
                            {
                                //TODO 

                                createModalContent(pkmn);
                                modal.style.display = "block";
                            }
                        }
                    }
                    myStorage.setItem("pokemons", JSON.stringify(pokeDex));
                }
            }
        }
    }

    // <------------------------------------------------------------------------------>
    
    // <---------------------OPCIONES DE SELECCIÓN Y ORDENACIÓN-----------------------> 
    function cargarSelectTipos(){

        var selects = document.getElementsByName('tipo');
        selects.forEach(select => {
            var defaultOpt = document.createElement("option");
            defaultOpt.value = 'all';
            defaultOpt.innerText = 'all';
            select.appendChild(defaultOpt);

            for (const key in colores) {
                if (colores.hasOwnProperty(key)) {
                    var opt = document.createElement("option");
                    opt.value = key;
                    opt.innerText = key;
                    select.appendChild(opt);
                }
            }

            select.addEventListener("change", ()=>{
                var tipo1 = document.getElementById("sel_tipo1").value;
                var tipo2 = document.getElementById("sel_tipo2").value;

                filtrar();
            });
        });
        
    }

    function cargarOrderByStats(){
        var select = document.getElementById('orderby_stats');
        var orderEl = document.getElementById('asc_desc');

        select.addEventListener("change", ()=>{
            selectedStat = select.value;
            orderEl.className = "mostrar";
            filtrar();
        });

    }

    function cargarOrderAscDesc(){
        var element = document.getElementById("asc_desc");

        element.addEventListener("click", ()=>{
            
            if(asc_desc==0)
            {
                element.innerHTML = "&uarr;";
                asc_desc = 1;
                filtrar();
            }else if(asc_desc==1){
                element.innerHTML = "&darr;";
                asc_desc = 0;
                filtrar();
            }
        });
    }

    function cargarBuscador(){
        var buscador = document.getElementById('buscador');
        buscador.addEventListener('keyup', ()=>{
            filtrar();
        })
    }

    // <------------------------------------------------------------------------------>


    // <--------------------------MÉTODOS DE ORDENACIÓN------------------------------->
    function ordenarPokemon(p1, p2)
    {
        if(selectedStat != '')
        {
            if(asc_desc==0)
            {
                if(p1.stats[selectedStat]>p2.stats[selectedStat]) return -1;
                if(p1.stats[selectedStat]<p2.stats[selectedStat]) return 1;
            }else{
                if(p1.stats[selectedStat]>p2.stats[selectedStat]) return 1;
                if(p1.stats[selectedStat]<p2.stats[selectedStat]) return -1;
            }
        }else{
            if(p1.id>p2.id) return 1;
            if(p1.id<p2.id) return -1;
        }
        return 0;
    }
    // <------------------------------------------------------------------------------>

    // <------------------------------------ESTILOS-----------------------------------> 
    function colorStyling(pokemon){
        var types = pokemon.types;
        var style = gradient;
        var firstColor, secondColor;
        firstColor = secondColor = colores[types["1"]];

        if(colores[types["2"]]!=undefined)
        {
            secondColor = colores[types["2"]];
        }
        
        style = style.split("color1").join(firstColor);
        style = style.split("color2").join(secondColor);
        style = style.split("color3").join(firstColor);
        style = style.split("color4").join(secondColor);
        return style;

    }
    // <------------------------------------------------------------------------------>

    // <------------------------------------MODAL-----------------------------------> 
    function createModalContent(pkmn){
        var modal_content = document.getElementById("modal_content");
        modal_content.innerHTML = "";


        var card = document.createElement("div");
        //MAIN IMG
        var img = document.createElement("img");
        img.src = pkmn.img;
        img.className = 'card_img';

        //DESCRIPTION
        var description = document.createElement("p");
        var randomDesc = pkmn.description[Math.floor(Math.random()* pkmn.description.length)].flavor_text;
        description.innerHTML = randomDesc;
        description.id = "description";

        //STATS
        var statList = document.createElement("div");
        statList.id = "statList";
        statList.innerHTML = pkmn.statsToString();

        //OTHER DATA
        var otherDataList = document.createElement("div");
        otherDataList.id = "otherDataList";
        otherDataList.innerHTML = pkmn.dataToString();

        //EVOLUTION CHAIN
        var evolutionChain = document.createElement("div");
        evolutionChain.id = "evolutionChain";
        var evolutionIds = [];
        for (const evolution in pkmn.evolutionChain) {
            if (pkmn.evolutionChain.hasOwnProperty(evolution)) {
                const element = pkmn.evolutionChain[evolution];
                var pkmnEvol = pokeDex.find(pk =>{
                    if(pk.name == element)return true;
                });
                var chainImg = document.createElement("img");
                if(pkmnEvol!=undefined)
                {
                    chainImg.src = pkmnEvol.img;
                }
                evolutionChain.appendChild(chainImg);
            }
        }

        //DATA
        var data_div = document.createElement("div");
        data_div.id = "data";
        data_div.innerHTML += "<h2>" + pkmn.name +"info</h2>";
        data_div.appendChild(description);
        data_div.appendChild(statList);
        data_div.appendChild(otherDataList);
        data_div.appendChild(evolutionChain);

        card.appendChild(img);
        card.appendChild(data_div);
        modal_content.appendChild(card);
    }
    // <------------------------------------------------------------------------------>
}