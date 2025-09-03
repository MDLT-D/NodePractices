const d = document;
const mainPoke = document.getElementById("mainPoke");
const mainBody = document.querySelector("main");
const form = document.getElementById("searchPokeForm");
const inputForm = document.getElementById("searchValue");
const loader = document.createElement("img");
loader.classList.add("loader");
loader.src = "assets/loader.svg";
const previous = document.querySelector(".previous");
const next = document.querySelector(".next");

//Search form
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const value = inputForm.value.toLowerCase().trim();
  //if there is not a value the principal page is loaded
  if (!value) {
    inputForm.value = "";
    getPokes("https://pokeapi.co/api/v2/pokemon?limit=20");
  } else {
    //sends the input value to the function
    searchPoke(value);
    inputForm.value = "";
  }
});
//the principal page is loaded when the page starts
d.addEventListener("DOMContentLoaded", () => {
  getPokes("https://pokeapi.co/api/v2/pokemon?limit=20");
});
//Search a pokemon by name or id
async function searchPoke(value) {
  try {
    mainPoke.innerHTML = "";
    //show loader while the async function is waiting the responses from api
    mainPoke.appendChild(loader);
    //search by given value
    const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + value);
    mainPoke.innerHTML = "";
    //Handle status errors
    if (res.status === 400) {
      errorHandle("Invalid search.", "Please enter a Pokémon name or ID.");
      return;
    }
    if (res.status === 404) {
      errorHandle(
        `No Pokémon found for "${value}".`,
        "Please check the name or ID and try again."
      );
      return;
    }
    if (!res.ok) {
      errorHandle(
        "Something went wrong while searching.",
        "Please try again later."
      );
      return;
    }
    //get the pokemon values
    const pokeFound = await res.json();

    mainPoke.innerHTML = "";
    //create the card
    const card = document.createElement("div");
    card.classList.add("cardPokeSearch");
    card.id = pokeFound.id;
    const infoDiv = document.createElement("div");
    const title = document.createElement("h2");
    title.textContent = pokeFound.name.toUpperCase();
    title.classList.add("searchTitle");
    const types = document.createElement("p");
    types.classList.add("typesPoke");
    types.innerHTML = `Type(s): <br>${pokeFound.types
      .map((t) => `<span class="typeName">${t.type.name}</span>`)
      .join(", ")}`;

    infoDiv.appendChild(title);
    infoDiv.appendChild(types);

    const img = document.createElement("img");
    img.classList.add("searchResultImg");
    img.src = pokeFound.sprites.other["official-artwork"].front_default;
    img.alt = pokeFound.name;
    card.appendChild(infoDiv);
    card.appendChild(img);

    mainPoke.appendChild(card);
  } catch (error) {
    errorHandle("Unexpected Internal Error", "Please try again later.");
    console.error({ error });
  }
}
//get the pokemons by url
async function getPokes(url) {
  try {
    mainPoke.innerHTML = "";
    //show loader while the async function is waiting the responses from api
    mainPoke.appendChild(loader);

    const res = await fetch(url);
    //Handle first request error
    if (!res.ok) {
      errorHandle(
        "Something went wrong while searching.",
        "Please try again later."
      );
      return;
    }
    //get the info from all the pokes in the url
    const pokesInfo = await res.json();
    //console.log(pokesInfo);

    //manage navigations buttons
    if (!pokesInfo.previous) {
      previous.classList.add("hiddenNav");
    } else {
      previous.classList.remove("hiddenNav");
      previous.onclick = () => {
        loadPage(pokesInfo.previous);
      };
    }
    if (!pokesInfo.next) {
      next.classList.add("hiddenNav");
    } else {
      next.classList.remove("hiddenNav");
      next.onclick = () => {
        loadPage(pokesInfo.next);
      };
    }

    //for each result/pokemon make another request and create the cards
    const responseDetails = pokesInfo.results.map(async (poke) => {
      const res = await fetch(poke.url);
      if (!res.ok) {
        return null;
      }
      return res.json();
    });
    //wait until there is all the details from pokemons
    const pokeDetails = await Promise.all(responseDetails);
    mainPoke.innerHTML = "";
    pokeDetails.forEach((pokeInfo) => {
      if (!pokeInfo) {
        errorHandle("Sorry", "Unable to load this Pokémon.", true);
        return;
      }

      const card = document.createElement("div");
      card.classList.add("cardPoke");
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
      img.src =
        pokeInfo.sprites.other["official-artwork"].front_default ||
        pokeInfo.sprites.front_default;
      img.alt = pokeInfo.name;

      card.appendChild(infoDiv);
      card.appendChild(img);

      mainPoke.appendChild(card);
    });
  } catch (error) {
    errorHandle(
      "Something went wrong while loading Pokémons.",
      "Please try again later."
    );
    console.error(error);
  }
}

//get pokes by url
function loadPage(url) {
  getPokes(url);
}
//a card for the errors
function errorHandle(title, description, getFlag) {
  const card = document.createElement("div");
  card.classList.add("cardPokeSearch");
  const errorParagraphTitle = document.createElement("h2");
  errorParagraphTitle.classList.add("errorTitle");
  errorParagraphTitle.textContent = title;
  const errorParagraphDescription = document.createElement("span");
  errorParagraphDescription.classList.add("errorDescription");
  errorParagraphDescription.textContent = description;
  card.appendChild(errorParagraphTitle);
  card.appendChild(errorParagraphDescription);
  card.classList.add("lineError");
  if (getFlag === true) {
    card.classList.remove("cardPokeSearch");
    card.classList.add("cardPoke");
    errorParagraphTitle.classList.add("getPokesSize");
    errorParagraphDescription.classList.add("getPokesSize");
  }
  mainPoke.appendChild(card);
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
