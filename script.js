function readTextFile(file, callback) {
  let rawFile = new XMLHttpRequest();
  rawFile.overrideMimeType("application/json");
  rawFile.open("GET", file, true);
  rawFile.onreadystatechange = function () {
    if (rawFile.readyState === 4 && rawFile.status == "200") {
      callback(rawFile.responseText);
    }
  };
  rawFile.send(null);
}

const nfLink = "https://www.netflix.com/browse/genre/";

var data;

readTextFile("netflixgenres.json", function (text) {
  data = JSON.parse(text);
  autocomplete();
  makePage();
});

function getSearch() {
  return window.location.href
    .split("?")[1]
    ?.replace("search=", "")
    .replace("+", " ")
    .toLowerCase();
}

function noOccurances(filter, item) {
  return (
    filter &&
    !item.some((arritem) => arritem.genre.toLowerCase().includes(filter))
  );
}

let setting = "so=yr";

function makePage() {
  const div = document.querySelector(".genres");
  const staticdiv = document.querySelector(".static");
  document.body.appendChild(div);
  let filter = getSearch();
  for (let i in data["genres"]) {
    let mainarr = data["genres"][i];
    if (noOccurances(filter, mainarr["subgenres"])) continue;
    let maindiv = document.createElement("div");
    let maindetails = document.createElement("div");
    let mainsummary = document.createElement("div");
    let mainmarker = document.createElement("button");
    let mainlink = document.createElement("a");
    let sublist = document.createElement("ol");
    maindiv.className = "details-marker";
    mainlink.className = "main-genre";
    mainmarker.className = "marker";
    maindetails.className = "details";
    mainsummary.className = "summary";
    mainlink.target = "_blank";
    mainlink.text = mainarr["genre"];
    mainlink.href = nfLink + mainarr["id"];

    mainmarker.textContent = "+";
    mainmarker.onclick = (e) => {
      maindetails.classList.toggle("open");
      mainmarker.textContent = maindetails.classList.contains("open")
        ? "-"
        : "+";
      window.dispatchEvent(new Event("resize"));
    };
    mainsummary.appendChild(mainmarker);
    mainsummary.appendChild(mainlink);
    maindetails.appendChild(sublist);

    maindiv.appendChild(mainsummary);
    maindiv.appendChild(maindetails);
    for (let j in mainarr.subgenres) {
      let subarr = mainarr.subgenres[j];
      if (filter && !subarr.genre.toLowerCase().includes(filter)) continue;
      let sublistitem = document.createElement("li");
      let sublink = document.createElement("a");
      sublink.className = "sub-genre";
      sublink.target = "_blank";

      sublink.text = (subarr.emoji || "") + " " + subarr.genre;
      sublink.href = nfLink + subarr.id + "?" + setting;
      sublistitem.appendChild(sublink);
      sublist.appendChild(sublistitem);
    }
    div.appendChild(maindiv);
  }

  let footer = document.querySelector(".footer");
  footer.className = "footer";
  let disableanimations = document.querySelector(".footer button");
  disableanimations.onclick = (e) => {
    staticdiv.getAnimations().forEach((animation) => {
      animation.cancel();
    });
  };
  footer.appendChild(disableanimations);
  document.body.appendChild(footer);
  let header = document.querySelector(".header");
  let genres = document.querySelector(".genres");

  fitStatic(header, genres, staticdiv, footer);
  window.onresize = (e) => {
    staticdiv.style.height = 100 + "%";
    fitStatic(header, genres, staticdiv, footer);
  };
}

function fitStatic(header, genres, staticdiv, footer) {
  const searchlistH = document.getElementById("search-list")?.offsetHeight || 0;
  const headerH = header.offsetHeight;
  const genresH = genres.offsetHeight;
  const footerH = footer.offsetHeight;

  if (
    staticdiv.offsetHeight < headerH + genresH + footerH ||
    staticdiv.offsetHeight > headerH + genresH + footerH + 50
  )
    staticdiv.style.height = headerH + genresH + footerH + 50 + "px";

  if (staticdiv.offsetHeight < headerH + searchlistH + footerH)
    staticdiv.style.height = headerH + searchlistH + footerH + "px";

  if (staticdiv.offsetHeight < window.innerHeight)
    staticdiv.style.height = window.innerHeight + "px";
}

function indexGenres() {
  let arr = [];
  for (let i in data["genres"]) {
    let mainarr = data["genres"][i];

    for (let j in mainarr["subgenres"])
      arr.push(mainarr["subgenres"][j]["genre"]);
  }
  return [...new Set(arr)];
}

//source: https://www.w3schools.com/howto/howto_js_autocomplete.asp
function autocomplete() {
  let inp = document.getElementById("search");
  let arr = indexGenres();
  var currentFocus;
  inp.addEventListener("input", makeList);
  inp.addEventListener("focus", makeList);
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById("search-list");
    if (x) x = x.getElementsByTagName("div");
    let key = e.key || e.keyCode;
    switch (key) {
      case 40:
      case "ArrowUp":
        currentFocus--;
        addActive(x);
        break;
      case 38:
      case "ArrowDown":
        currentFocus++;
        addActive(x);
        break;
      case 13:
      case "Enter":
        if (currentFocus > -1) {
          if (x) x[currentFocus].click();
        }
        break;
    }
  });

  function makeList(e) {
    let list,
      item,
      val = this.value;
    closeAllLists();
    if (!val) {
      window.dispatchEvent(new Event("resize"));
      return false;
    }
    currentFocus = -1;
    list = document.createElement("DIV");
    list.setAttribute("id", "search-list");
    list.setAttribute("class", "search-list");
    this.parentNode.appendChild(list);
    for (let i = 0; i < arr.length; i++) {
      if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
        item = document.createElement("DIV");
        item.innerHTML =
          "<strong>" + arr[i].substr(0, val.length) + "</strong>";
        item.innerHTML += arr[i].substr(val.length);
        item.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
        item.addEventListener("click", function (e) {
          inp.value = this.getElementsByTagName("input")[0].value;
          closeAllLists();
        });
        list.appendChild(item);
      }
    }

    window.dispatchEvent(new Event("resize"));
  }

  function addActive(item) {
    if (!item) return false;
    removeActive(item);
    if (currentFocus >= item.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = item.length - 1;
    item[currentFocus].classList.add("search-active");
  }

  function removeActive(item) {
    for (let i = 0; i < item.length; i++)
      item[i].classList.remove("search-active");
  }

  function closeAllLists(elmnt) {
    /*close all autocomplete lists in the document,
    except the one passed as an argument:*/
    let x = document.getElementsByClassName("search-list");
    for (let i = 0; i < x.length; i++)
      if (elmnt != x[i] && elmnt != inp) x[i].parentNode.removeChild(x[i]);
  }

  document.addEventListener("click", function (e) {
    closeAllLists(e.target);
  });
}
