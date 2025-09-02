const d = document;
const mainPoke = document.getElementById("mainPoke");
const sectionPoke = document;
const form = document.getElementById("searchPokeForm");
const inputForm = document.getElementById("searchValue");
 const loader = document.createElement("img");
    loader.classList.add("loader");
    loader.src = "assets/loader.svg";
    const previous= document.createElement("svg");
    previous.classList.add("previous");
    previous.src="assets/previous.svg"
    const next= document.createElement("svg");
    previous.classList.add("next");
    previous.src="assets/next.svg"

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = inputForm.value.toLowerCase().trim();
  if (!value) {
    inputForm.value = "";
    getPokes("https://pokeapi.co/api/v2/pokemon?limit=20");
  } else {
    searchPoke(value);
    inputForm.value = "";
  }
});

d.addEventListener("DOMContentLoaded", () => {
  getPokes("https://pokeapi.co/api/v2/pokemon?limit=20");
});
async function searchPoke(value) {
  try {
    mainPoke.innerHTML = "";
    
    mainPoke.appendChild(loader);

    const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + value);

    if (res.status === 400) {
      mainPoke.innerHTML = `<p class="error">Invalid search. Please enter a Pokémon name or number.</p>`;
      return;
    }

    if (res.status === 404) {
      mainPoke.innerHTML = `<p class="error">No Pokémon found for "${value}". Please check the name or ID and try again.</p>`;
      return;
    }

    if (!res.ok) {
      mainPoke.innerHTML = `<p class="error">Something went wrong while searching. Please try again later.</p>`;
      return;
    }

    const pokeFound = await res.json();

    mainPoke.innerHTML = "";

    const card = document.createElement("div");
    card.classList.add("cardPoke");
    card.id = pokeFound.id;
    const infoDiv = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = pokeFound.name.toUpperCase();
    const types = document.createElement("p");
    types.classList.add("typesPoke");
    types.innerHTML = `Type(s): <br>${pokeFound.types
      .map((t) => `<span class="typeName">${t.type.name}</span>`)
      .join(", ")}`;

    infoDiv.appendChild(title);
    infoDiv.appendChild(types);

    const img = document.createElement("img");
    img.src = pokeFound.sprites.other["official-artwork"].front_default;
    img.alt = pokeFound.name;
    card.appendChild(infoDiv);
    card.appendChild(img);

    mainPoke.appendChild(card);
  } catch (error) {
    mainPoke.innerHTML = `<p class="error">Something went wrong. Please try again later.</p>`;
    console.error({ error });
  }
}
async function getPokes(url) {
  try {
    mainPoke.innerHTML = "";
   
    mainPoke.appendChild(loader);

    const res = await fetch(url);
    if (!res.ok) {
      mainPoke.innerHTML = `<p class="error">Something went wrong. Please try again later.</p>`;
      return;
    }

    const pokesInfo = await res.json();
    mainPoke.innerHTML = "";
    

    for (const poke of pokesInfo.results) {
      const pokeRes = await fetch(poke.url);
      const card = document.createElement("div");
      card.classList.add("cardPoke");
      if (!pokeRes.ok) {
        const errorText = document.createElement("p");
        errorText.classList.add("error");
        errorText.textContent = "Unable to load this Pokémon.";
        card.appendChild(errorText);
        continue;
      }
      const pokeInfo = await pokeRes.json();

      card.id = pokeInfo.id;

      const infoDiv = document.createElement("div");

      const title = document.createElement("h2");
      title.textContent = pokeInfo.name.toUpperCase();

      const types = document.createElement("p");
      types.classList.add("typesPoke");
      types.innerHTML = `Type(s): <br>${pokeInfo.types
        .map((t) => `<span class="typeName">${t.type.name}</span>`)
        .join(", ")}`;

      infoDiv.appendChild(title);
      infoDiv.appendChild(types);

      const img = document.createElement("img");
      img.src = pokeInfo.sprites.other["official-artwork"].front_default;
      img.alt = pokeInfo.name;

      card.appendChild(infoDiv);
      card.appendChild(img);

      mainPoke.appendChild(card);
    }
  } catch (error) {
    mainPoke.innerHTML = `<p class="error">Something went wrong while loading Pokémons. Please try again later.</p>`;
    console.error(error);
  }
}

//Search poke
/*fetch("https://pokeapi.co/api/v2/pokemon/" + value)
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
    });*/

//get pokes
/*fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
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
    });*/
