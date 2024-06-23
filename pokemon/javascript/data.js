// data.js

let currentPage = 1;
const limit = 25;
let allPokemon = [];

// Función para obtener datos de Pokémon desde la PokéAPI
async function fetchPokemon(page = 1) {
    const offset = (page - 1) * limit;
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
    const data = await response.json();
    const pokemonList = data.results;

    // Obtener detalles adicionales para cada Pokémon
    const pokemonDetails = await Promise.all(pokemonList.map(async pokemon => {
        const response = await fetch(pokemon.url);
        return await response.json();
    }));

    displayPokemon(pokemonDetails);
}

// Función para mostrar la lista de Pokémon en la página de pokemon.html
function displayPokemon(pokemonList) {
    const pokemonListDiv = document.getElementById('pokemon-list');
    pokemonListDiv.innerHTML = ''; // Limpiar la lista anterior

    if (pokemonListDiv) {
        pokemonList.forEach(pokemon => {
            const pokemonItem = document.createElement('div');
            pokemonItem.classList.add('pokemon-card');
            pokemonItem.addEventListener('click', () => {
                window.location.href = `pokemon-detail.html?id=${pokemon.id}`;
            });

            const pokemonImage = document.createElement('img');
            pokemonImage.src = pokemon.sprites.front_default;
            pokemonImage.alt = pokemon.name;

            const pokemonName = document.createElement('p');
            pokemonName.textContent = `#${pokemon.id} ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}`;

            pokemonItem.appendChild(pokemonImage);
            pokemonItem.appendChild(pokemonName);
            pokemonListDiv.appendChild(pokemonItem);

            // Añadir efecto de inclinación en movimiento del ratón
            pokemonItem.addEventListener('mousemove', (e) => tiltEffect(e, pokemonItem));
            pokemonItem.addEventListener('mouseleave', () => resetTilt(pokemonItem));
        });
    }
}

// Función para aplicar efecto de inclinación
function tiltEffect(e, element) {
    const rect = element.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const deltaX = (x - centerX) / centerX;
    const deltaY = (y - centerY) / centerY;

    // Por recomendación dejar esto en máximo 35, más de eso el efecto se vuelve raro y poco estético

    const rotateX = deltaY * 35; // Ajustar el valor para más o menos inclinación
    const rotateY = -deltaX * 35; // Ajustar el valor para más o menos inclinación

    element.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.1)`;
    element.style.boxShadow = '0 10px 20px rgba(0, 0, 0, 0.2)';
}

// Función para resetear el efecto de inclinación
function resetTilt(element) {
    element.style.transform = 'rotateX(0) rotateY(0) scale(1)';
    element.style.boxShadow = '0 0 10px rgba(0, 0, 0, 0.1)';
}

// Función para cambiar de página
function changePage(direction) {
    currentPage += direction;
    fetchPokemon(currentPage);
    document.getElementById('prev-btn').disabled = currentPage === 1;
}

// Función para buscar Pokémon
async function searchPokemon(event) {
    const query = event.target.value.toLowerCase();

    if (query === '') {
        fetchPokemon(currentPage); // Volver a la paginación normal si el campo de búsqueda está vacío
    } else {
        if (allPokemon.length === 0) {
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000&offset=0');
            const data = await response.json();
            allPokemon = data.results;
        }

        const filteredPokemon = allPokemon.filter(pokemon => pokemon.name.includes(query));
        const pokemonDetails = await Promise.all(filteredPokemon.map(async pokemon => {
            const response = await fetch(pokemon.url);
            return await response.json();
        }));

        displayPokemon(pokemonDetails);
    }
}

// Función para obtener detalles de un Pokémon específico
async function fetchPokemonDetail(pokemonId) {
    const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
    const pokemon = await response.json();
    displayPokemonDetail(pokemon);
}

// Función para mostrar detalles de un Pokémon en la página pokemon-detail.html
function displayPokemonDetail(pokemon) {
    const pokemonDetailDiv = document.getElementById('pokemon-detail');

    const pokemonImage = document.createElement('img');
    pokemonImage.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${pokemon.id}.gif`;
    pokemonImage.alt = pokemon.name;
    pokemonImage.classList.add('pokemon-image');

    const shinyImage = document.createElement('img');
    shinyImage.src = pokemon.sprites.front_shiny;
    shinyImage.alt = `${pokemon.name} shiny`;
    shinyImage.classList.add('pokemon-shiny');

    pokemonDetailDiv.appendChild(pokemonImage);
    pokemonDetailDiv.appendChild(shinyImage);

    if (pokemon.sprites.front_female || pokemon.sprites.front_shiny_female) {
        if (pokemon.sprites.front_female) {
            const femaleImage = document.createElement('img');
            femaleImage.src = pokemon.sprites.front_female;
            femaleImage.alt = `${pokemon.name} hembra`;
            femaleImage.classList.add('pokemon-shiny');
            pokemonDetailDiv.appendChild(femaleImage);
        }

        if (pokemon.sprites.front_shiny_female) {
            const femaleShinyImage = document.createElement('img');
            femaleShinyImage.src = pokemon.sprites.front_shiny_female;
            femaleShinyImage.alt = `${pokemon.name} hembra shiny`;
            femaleShinyImage.classList.add('pokemon-shiny');
            pokemonDetailDiv.appendChild(femaleShinyImage);
        }
    }

    const pokemonInfo = document.createElement('div');
    pokemonInfo.classList.add('pokemon-info');

    pokemonInfo.innerHTML = `
        <p>Nombre: ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</p>
        <p>Número: ${pokemon.id}</p>
        <p>Altura: ${pokemon.height / 10} m</p>
        <p>Peso: ${pokemon.weight / 10} kg</p>
        <p>Tipos: ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p>Habilidades: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
    `;

    pokemonDetailDiv.appendChild(pokemonInfo);
}

// Llamar la función fetchPokemon si estamos en la página correcta
if (window.location.pathname.includes('pokemon.html')) {
    fetchPokemon();
}
