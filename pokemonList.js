const fetch = require('node-fetch');
const fs = require('fs');

async function GetPokemonsJson() {
  const allPokemon = [];
  const evolutionMap = {};
  const allAbilities = [];
  const allLocations = [];
  const allTypes = [];

  function removeDup (data) {
    return data.filter((item,index)=>{
    return data.indexOf(item) === index;
  })}

  for (let id = 1; id <= 1025; id++) {
    try {
      const [speciesRes, dataRes, locRes] = await Promise.all([
        fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}/encounters`)
      ]);

      const pokemon = await speciesRes.json();
      const data = await dataRes.json();
      const locations = await locRes.json();

      const abi = data.abilities.map(a => a.ability.name.replace("-"," "));
      const stats = data.stats.map(s => s.base_stat);
      const total = stats.reduce((sum, s) => sum + s, 0);
      const locs = locations?.map((l) => l?.location_area.name);

      if(locs.length > 0){
        locs.map(l => allLocations.push(l));
      }

      
      data.abilities.map(a => allAbilities.push(a.ability.name.replace("-"," ")));
      data.types.map(t => t.name != null ? allTypes.push(t.name) : allTypes.push(t.type.name));

      const entry = {
        national_number: pokemon.id.toString(),
        "evolves from": pokemon.evolves_from_species ? pokemon.evolves_from_species.name : null,
        evolution: null,
        sprites: {
          front_default: data.sprites.other['official-artwork'].front_default || data.sprites.front_default,
          front_shiny: data.sprites.other['official-artwork'].front_shiny || data.sprites.front_shiny
        },
        name: pokemon.name,
        generation: pokemon.generation.name,
        type: data.types.length === 1
          ? [data.types[0].type.name]
          : [data.types[0].type.name, data.types[1].type.name],
        total,
        hp: stats[0],
        attack: stats[1],
        defense: stats[2],
        sp_atk: stats[3],
        sp_def: stats[4],
        speed: stats[5],
        location: locs,
        cries: data.cries.latest ? data.cries.latest : data.cries.legacy,
        abilities: abi
      };

      allPokemon.push(entry);

      if (pokemon.evolves_from_species?.name) {
        const from = pokemon.evolves_from_species.name;
        evolutionMap[from] = evolutionMap[from] || [];
        evolutionMap[from].push(pokemon.name);
      }

      console.log((Math.round(((id * 100) / 1025) * 1000) / 1000) + "%");
    } catch (error) {
      console.error(`Error fetching #${id}:`, error.message);
    }
  }

  allPokemon.forEach(p => {
    if (evolutionMap[p.name]) {
      p.evolution = evolutionMap[p.name].join(', ');
    }
  });

  var abilities = removeDup(allAbilities);
  var locations = removeDup(allLocations);
  var dataTypes = removeDup(allTypes);

  fs.writeFileSync('list.json', JSON.stringify(allPokemon, null, 2));
  console.log("Archivo generado: list.json");

  fs.writeFileSync('abilities.json', JSON.stringify(abilities, null, 2));
  console.log("Archivo generado: abilities.json");

  fs.writeFileSync('locations.json', JSON.stringify(locations, null, 2));
  console.log("Archivo generado: locations.json");

  fs.writeFileSync('types.json', JSON.stringify(dataTypes, null, 2));
  console.log("Archivo generado: types.json");
}

GetPokemonsJson();