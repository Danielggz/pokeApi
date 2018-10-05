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

var selectedStat = '';


window.onload = function()  
{
    var pokeDex = [];
    var section = document.getElementById("pokemons");
    var xmlReq = new XMLHttpRequest();
    var url = "https://pokeapi.co/api/v2/pokemon/";

    xmlReq.onreadystatechange = function() 
    {
        if (this.readyState == 4 && this.status == 200) 
        {
            var result = JSON.parse(this.response);
            var pokeArray = result.results.slice(0, 385);
            cargarPokemon(pokeArray);
        }
    };

    xmlReq.open("GET", url, true);
    xmlReq.send();
    
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

                    if(pokeDex.length == 385)
                    {
                        pokeDex.sort(orderPokemonById);
                        generarPokeTabla(pokeDex);
                        cargarSelectTipos();
                        cargarOrderByStats(); 
                        cargarBuscador();
                        var loader = document.getElementsByClassName('loader')[0].setAttribute("style", "display: none;");
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
            art.style = styling(pkmn);
            var a = document.createElement("a");
            a.innerText = pkmn.name;
            var img = document.createElement("img");
            img.src = pkmn.img;
            var tooltip_content = document.createElement("span");
            tooltip_content.className = "tooltiptext";
            tooltip_content.innerHTML = "<strong>" + pkmn.getName() + "</strong><hr/>" + pkmn.getStats() + "<hr/>" + pkmn.getTypes();

            art.appendChild(img);
            art.appendChild(a);
            art.appendChild(tooltip_content);
            section.appendChild(art);
        });
    }

    function styling(pokemon){
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

    function orderPokemonById(p1, p2)
    {
        if(p1.id>p2.id) return 1;
        if(p1.id<p2.id) return -1;
        return 0;
    }

    function cargarSelectTipos(){

        var selects = document.getElementsByName('tipo');
        selects.forEach(select => {
            var defaultOpt = document.createElement("option");
            defaultOpt.value = 'todos';
            defaultOpt.innerText = 'todos';
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
                var newPokeArray = [];
                var tipo1 = document.getElementById("sel_tipo1").value;
                var tipo2 = document.getElementById("sel_tipo2").value;
                
                if(tipo1!='todos' && tipo2 == 'todos' || tipo1=='todos' && tipo2 != 'todos')
                {
                    pokeDex.forEach(pkmn => {
                        if(pkmn.types['1'] == tipo1 || pkmn.types['2'] == tipo2)
                        {
                            newPokeArray.push(pkmn);
                        }
                    });
                    generarPokeTabla(newPokeArray);
                }
                else if(tipo1!='todos' && tipo2 != 'todos')
                {
                    pokeDex.forEach(pkmn => {
                        if(pkmn.types['1'] == tipo1 && pkmn.types['2'] == tipo2)
                        {
                            newPokeArray.push(pkmn);
                        }
                    });
                }
                else if(tipo1=='todos' && tipo2 == 'todos')
                {
                    generarPokeTabla(pokeDex);
                }
            });
        });
        
    }

    function cargarOrderByStats(){
        var select = document.getElementById('orderby_stats');

        select.addEventListener("change", ()=>{
            var newPokeArray = [];
            selectedStat = document.getElementById('orderby_stats').value;
            if(selectedStat=='')
            {
                generarPokeTabla(pokeDex.sort(orderPokemonById));
            }else{
                generarPokeTabla(pokeDex.sort(orderPokemonByStat));
            }
        });

    }

   
    function orderPokemonByStat(p1, p2)
    {
        if(p1.stats[selectedStat]>p2.stats[selectedStat]) return -1;
        if(p1.stats[selectedStat]<p2.stats[selectedStat]) return 1;
        return 0;
    }

    function cargarBuscador(){
        var buscador = document.getElementById('buscador');
        buscador.addEventListener('keyup', ()=>{
            var newPokeArray = [];
            pokeDex.forEach(pkmn => {
                if(pkmn.name.startsWith(buscador.value))
                {
                    newPokeArray.push(pkmn);
                }
            });
            generarPokeTabla(newPokeArray);
        })
    }

}