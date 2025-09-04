const d = document;
const mainPoke = d.getElementById("mainPoke");
const mainBody = d.querySelector("main");
const form = d.getElementById("searchPokeForm");
const inputForm = d.getElementById("searchValue");
const loader = d.createElement("img");
loader.classList.add("loader");
loader.src = "assets/loader.svg";
const previous = d.querySelector(".previous");
const next = d.querySelector(".next");
const filterPokes = d.querySelector("select");
const toggleButton = d.getElementById("modeColors");
const icon = toggleButton.querySelector("img");
const modalPokeDetails = d.getElementById("modalPokeDetails");
const closeModal = d.getElementById("closeModal");
const bodyModal = d.getElementById("pokeModalBody");
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
  const theme = localStorage.getItem("theme");
  const toggleButton = d.getElementById("modeColors");
  const icon = toggleButton.querySelector("img");

  if (theme === "dark") {
    d.body.classList.add("dark-mode");
    icon.src = "assets/light.svg"; // Mostrar ícono de modo claro
  } else {
    d.body.classList.remove("dark-mode");
    icon.src = "assets/dark.svg"; // Mostrar ícono de modo oscuro
  }

  getTypesPokes();
  getPokes("https://pokeapi.co/api/v2/pokemon?limit=20");
});
//Search a pokemon by name or id
async function searchPoke(value) {
  try {
    // filterPokes.classList.add("hiddenNav");
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
    const chartStats = chartPoke(pokeFound.stats, 200, false);
    //create the card
    const card = d.createElement("div");
    card.classList.add("cardPokeSearch");
    card.id = pokeFound.id;
    const infoDiv = d.createElement("div");
    const title = d.createElement("h2");
    title.textContent = pokeFound.name.toUpperCase();
    title.classList.add("searchTitle");
    const types = d.createElement("p");
    types.classList.add("typesPoke");
    types.innerHTML = `Type(s): <br>${pokeFound.types
      .map((t) => `<span class="typeName">${t.type.name}</span>`)
      .join(", ")}`;

    infoDiv.appendChild(title);
    infoDiv.appendChild(types);

    const img = d.createElement("img");
    img.classList.add("searchResultImg");
    img.src = pokeFound.sprites.other["official-artwork"].front_default ||
    pokeFound.sprites.front_default;
    img.alt = pokeFound.name;

    card.appendChild(infoDiv);
    card.appendChild(img);
    card.appendChild(chartStats);
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
      const chartStats = chartPoke(pokeInfo.stats, 100, false);

      const card = d.createElement("div");
      card.classList.add("cardPoke");
      card.id = pokeInfo.id;
      card.onclick = () => {
        getPokeLongInfo(card.id);
      };
      const infoDiv = d.createElement("div");

      const title = d.createElement("h2");
      title.textContent = pokeInfo.name.toUpperCase();

      const types = d.createElement("p");
      types.classList.add("typesPoke");
      types.innerHTML = `Type(s): <br>${pokeInfo.types
        .map((t) => `<span class="typeName">${t.type.name}</span>`)
        .join(", ")}`;

      infoDiv.appendChild(title);
      infoDiv.appendChild(types);

      const img = d.createElement("img");
      img.src =
        pokeInfo.sprites.other["official-artwork"].front_default ||
        pokeInfo.sprites.front_default;
      img.alt = pokeInfo.name;

      card.appendChild(infoDiv);
      card.appendChild(img);
      card.appendChild(chartStats);
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
  const card = d.createElement("div");
  card.classList.add("cardPokeSearch");
  const errorParagraphTitle = d.createElement("h2");
  errorParagraphTitle.classList.add("errorTitle");
  errorParagraphTitle.textContent = title;
  const errorParagraphDescription = d.createElement("span");
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

function chartPoke(stats, size, descriptionComplete) {
  const chartSpace = d.createElement("canvas");

  // si no queremos descripción completa, usamos tamaño fijo
  chartSpace.width = size;
  chartSpace.height = size;

  // get the sections and values
  const sections = stats.map((st) => st.stat.name.toUpperCase());
  const values = stats.map((st) => st.base_stat);
  const bgColors = [];
  const borderColors = [];
  const firstRed = 120;
  const lastRed = 255;
  const steps = stats.length - 1;
  for (let i = 0; i < stats.length; i++) {
    const red = Math.floor(firstRed + (i / steps) * (lastRed - firstRed));
    bgColors.push(`rgba(${red}, 0, 0,0.8)`);
    borderColors.push(`rgba(255, 255, 255)`);
  }

  // chart data
  const data = {
    labels: sections,
    datasets: [
      {
        label: "Stats",
        data: values,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
      },
    ],
  };

  if (descriptionComplete === true) {
    const config = {
      type: "bar",
      data: data,
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: true,
            position: "bottom",
          },
          title: {
            display: true,
            text: "Pokémon Stats",
            font: { size: 18 },
          },
          tooltip: {
            enabled: true,
          },
        },
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 150,
          },
        },
      },
    };
    new Chart(chartSpace.getContext("2d"), config);
  } else {
    const config = {
      type: "pie",
      data: data,
      options: {
        responsive: false,
        plugins: {
          legend: {
            display: false,
            position: "bottom",
          },
          title: {
            display: false,
            text: "Pokémon Stats",
          },
        },
      },
    };
    new Chart(chartSpace.getContext("2d"), config);
  }

  return chartSpace;
}

//get the types that have at least 1 pokemon
async function getTypesPokes() {
  //get the types
  const resTypes = await fetch("https://pokeapi.co/api/v2/type/");
  const types = await resTypes.json();
  //filter
  const typeChecks = await Promise.all(
    types.results.map(async (type) => {
      const res = await fetch(type.url);
      const typeData = await res.json();
      return typeData.pokemon.length > 0 ? type : null;
    })
  );

  const validTypes = typeChecks.filter((type) => type !== null);

  // add the types to the select
  validTypes.forEach((type) => {
    const option = d.createElement("option");
    option.value = type.url;
    option.textContent = type.name.toUpperCase();
    filterPokes.appendChild(option);
  });
}
//manage the routes to get pokes
filterPokes.onchange = () => {
  const url = filterPokes.value;
  if (url) {
    getPokesFilter(url);
  } else {
    getPokes("https://pokeapi.co/api/v2/pokemon?limit=20");
  }
};
//get the pokes by filter
async function getPokesFilter(url) {
  try {
    mainPoke.innerHTML = "";
    mainPoke.appendChild(loader);

    const res = await fetch(url);
    if (!res.ok) {
      errorHandle(
        "Something went wrong while searching.",
        "Please try again later."
      );
      return;
    }

    const pokesInfo = await res.json();
    console.log(pokesInfo);

    previous.classList.add("hiddenNav");
    next.classList.add("hiddenNav");

    const responseDetails = pokesInfo.pokemon.map(async (poke) => {
      const res = await fetch(poke.pokemon.url);
      if (!res.ok) {
        return null;
      }
      return res.json();
    });

    const pokeDetails = await Promise.all(responseDetails);
    mainPoke.innerHTML = "";

    pokeDetails.forEach((pokeInfo) => {
      if (!pokeInfo) {
        errorHandle("Sorry", "Unable to load this Pokémon.", true);
        return;
      }

      const chartStats = chartPoke(pokeInfo.stats, 100, false);

      const card = d.createElement("div");
      card.classList.add("cardPoke");
      card.id = pokeInfo.id;

      const infoDiv = d.createElement("div");

      const title = d.createElement("h2");
      title.textContent = pokeInfo.name.toUpperCase();

      const types = d.createElement("p");
      types.classList.add("typesPoke");
      types.innerHTML = `Type(s): <br>${pokeInfo.types
        .map((t) => `<span class="typeName">${t.type.name}</span>`)
        .join(", ")}`;

      infoDiv.appendChild(title);
      infoDiv.appendChild(types);

      const img = d.createElement("img");
      img.src =
        pokeInfo.sprites.other["official-artwork"].front_default ||
        pokeInfo.sprites.front_default;
      img.alt = pokeInfo.name;

      card.appendChild(infoDiv);
      card.appendChild(img);
      card.appendChild(chartStats);
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
//change modes ligh/dark
toggleButton.onclick = () => {
  d.body.classList.toggle("dark-mode");

  const isDark = d.body.classList.contains("dark-mode");
  icon.src = isDark ? "assets/light.svg" : "assets/dark.svg";
  localStorage.setItem("theme", isDark ? "dark" : "light");
};

async function getPokeLongInfo(idPoke) {
  const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + idPoke);
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
  const pokeFound = await res.json();
  console.log(pokeFound);

  modalPokeDetails.classList.add("show");
  d.body.style.overflow = "hidden";

 //clear the modal
  bodyModal.innerHTML = "";

  // Chart
  const chartStats = chartPoke(pokeFound.stats, 300, true);

  const infoDiv = d.createElement("div");
  bodyModal.classList.add("modalOrg");
  const title = d.createElement("h2");
  title.textContent = pokeFound.name.toUpperCase();
  title.classList.add("searchTitle");

  const types = d.createElement("p");
  types.classList.add("typesPoke");
  types.innerHTML = `Type(s): <br>${pokeFound.types
    .map((t) => `<span class="typeName">${t.type.name}</span>`)
    .join(", ")}`;

  // Height y weight
  const hw = d.createElement("p");
  hw.classList.add("typesPoke");
  hw.innerHTML = `
  Height:<span class="typeName">${pokeFound.height/10} m</span> <br>
  Weight:<span class="typeName">${pokeFound.weight/10} kg</span>
`;

  const abilities = d.createElement("p");
   abilities.classList.add("abilitiesPoke");
  abilities.innerHTML = `
  Abilities:<br>
  ${pokeFound.abilities
    .map((ab) => `<span class="abilityName">${ab.ability.name}</span>`)
    .join(", ")}
`;


  const img = d.createElement("img");
  img.classList.add("imgModal");
  img.src =
    pokeFound.sprites.other.home.front_default ||
    pokeFound.sprites.other["official-artwork"].front_default ||
    pokeFound.sprites.front_default;
  img.alt = pokeFound.name;

  // Append al modal
  infoDiv.appendChild(title);
  infoDiv.appendChild(types);
  infoDiv.appendChild(hw);
  infoDiv.appendChild(abilities);

  bodyModal.appendChild(infoDiv);
  bodyModal.appendChild(img);
  bodyModal.appendChild(chartStats);
}

closeModal.onclick = () => {
  modalPokeDetails.classList.remove("show");
  modalPokeDetails.classList.add("hiddenModal");
  d.body.style.overflow = "";
  bodyModal.innerHTML = "";
};
