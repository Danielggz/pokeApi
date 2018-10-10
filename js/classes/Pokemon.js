export class Pokemon{
    constructor(name, id, img, types, stats){
        this.name = name;
        this.id = id;
        this.img = img;
        this.types = types;
        this.stats = stats;
    }

    getName(){
        return this.name.charAt(0).toUpperCase() + this.name.slice(1);;
    }

    statsToString(){
        return `<strong>Base stats:</strong><br/>
        <ul>
        <li>attack: ${this.stats['attack']} <br/></li>
        <li>defense: ${this.stats['defense']}<br/></li>
        <li>hp: ${this.stats['hp']}<br/></li>
        <li>special-attack: ${this.stats['special-attack']} <br/></li>
        <li>special-defense: ${this.stats['special-defense']} <br/></li>
        <li>speed: ${this.stats['speed']} <br/></li>
        </ul>`;
    }

    getTypes(){
        if(this.types['2']==undefined)
        {
            return `<strong>type</strong>: ${this.types['1']}`;
        }
        return `<strong>type</strong>: ${this.types['1']}/${this.types['2']}`;
    }

    setDescription(desc){
        this.description = desc;
    }

    setData(data){
        this.data = data; //DATA ARRAY
        //{base_happiness, capture_rate, gender_rate}
    }

    dataToString(){
        return `<strong>Other data:</strong><br/>
        <ul>
        <li>Base Happiness: ${this.data['base_happiness']} <br/></li>
        <li>Capture Rate: ${this.data['capture_rate']}<br/></li>
        <li>Gender Rate: ${this.data['gender_rate']}<br/></li>
        </ul>`;
    }

    setEvolutionChain(evol){
        this.evolutionChain = evol;
    }

}