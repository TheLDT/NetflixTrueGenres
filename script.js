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

readTextFile("netflixgenres.json", function (text) {
  let data = JSON.parse(text);
  const div = document.querySelector(".genres");
  const staticdiv = document.querySelector(".static");
  document.body.appendChild(div);
  for (let i in data["genres"]) {
    let mainarr = data["genres"][i];
    let maindiv = document.createElement("div");
    let maindetails = document.createElement("div");
    let mainsummary = document.createElement("div");
    let mainmarker = document.createElement("button");
    let mainlink = document.createElement("a");
    let sublist = document.createElement("ol");
    let maincontent = document.createElement("div");
    maindiv.className = "details-marker";
    mainlink.className = "main-genre";
    mainmarker.className = "marker";
    maindetails.className = "details";
    mainsummary.className = "sumarry";
    maincontent.className = "content";
    mainlink.target = "_blank";
    mainlink.text = mainarr["genre"];
    mainlink.href = nfLink + mainarr["id"];

    mainmarker.textContent = "+";
    mainmarker.onclick = (e) => {
      maincontent.classList.toggle("open");

      let changeval = mainarr["subgenres"].length * 20;
      if (maincontent.classList.contains("open")) {
        mainmarker.textContent = "-";
        staticdiv.style.height = staticdiv.offsetHeight + changeval + "px";
      } else {
        mainmarker.textContent = "+";
        staticdiv.style.height = staticdiv.offsetHeight - changeval + "px";
      }
    };
    mainsummary.appendChild(mainlink);
    maincontent.appendChild(sublist);
    maindetails.appendChild(mainsummary);
    maindetails.appendChild(maincontent);
    maindiv.appendChild(mainmarker);
    maindiv.appendChild(maindetails);
    div.appendChild(maindiv);
    for (let j in mainarr["subgenres"]) {
      let subarr = mainarr["subgenres"][j];
      let sublistitem = document.createElement("li");
      let sublink = document.createElement("a");
      sublink.className = "sub-genre";
      sublink.target = "_blank";

      sublink.text = (subarr["emoji"] || "") + " " + subarr["genre"];
      sublink.href = nfLink + subarr["id"];
      sublistitem.appendChild(sublink);
      sublist.appendChild(sublistitem);
    }
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

  fitStatic(header, genres, staticdiv);
  window.onresize = (e) => {
    console.log("ye");
    staticdiv.style.height = 100 + "%";
    fitStatic(header, genres, staticdiv);
  };
});

function fitStatic(header, genres, staticdiv) {
  if (header.offsetHeight + genres.offsetHeight > staticdiv.offsetHeight) {
    staticdiv.style.height =
      staticdiv.offsetHeight + genres.offsetHeight + "px";
  }
}
