const d = document;

const form = document.getElementById("searchPokeForm");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = document
    .getElementById("searchValue")
    .value.toLowerCase()
    .trim();
  if (!value) {
    getPokes();
  }

  fetch("https://pokeapi.co/api/v2/pokemon/" + value)
    .then((res) => res.json())
    .then((data) => {
      document.getElementById("mainPoke").innerHTML = `
    <div class="cardPoke" id="${data.id}">
      <div>
        <h2>${data.name.toUpperCase()}</h2>
        <p class="typesPoke">Type(s): <br>${data.types
          .map(
            (pokeType) => `<span class="typeName">${pokeType.type.name}</span>`
          )
          .join(", ")}</p>
      </div>
      <img src="${data.sprites.other["official-artwork"].front_default}" alt="${
        data.name
      }">
    </div>
  `;
    })
    .catch((err) => {
      document.getElementById("pokeResult").innerHTML =
        "<p>No Pokémon found with that name or ID. Please enter a different one</p>";
    });
});

d.addEventListener("DOMContentLoaded", () => {
  getPokes();
});

function getPokes() {
  fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
    .then((res) => res.json())
    .then((data) => {
      //console.log(data);
      const pokeListResult = data.results.map((poke) =>
        fetch(poke.url).then((res) => res.json())
      );

      Promise.all(pokeListResult).then((pokemonList) => {
        const mainPoke = document.getElementById("mainPoke");
        mainPoke.innerHTML = pokemonList
          .map(
            (pokemon) =>
              `<div class="cardPoke" id="${pokemon.id}">
          <div>
    <h2>${pokemon.name.toUpperCase()}</h2>
    <p class="typesPoke">Type(s): <br>${pokemon.types
      .map((pokeType) => `<span class="typeName">${pokeType.type.name}</span>`)
      .join(", ")}</p></div>
    <img src="${
      pokemon.sprites.other["official-artwork"].front_default
    }" alt="${pokemon.name}">
          
    </div>`
          )
          .join("");
      });
    });
}
