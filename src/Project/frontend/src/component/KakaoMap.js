export function newInfoWindow(obj) {
  let infoDiv = document.createElement("div");
  let titleDiv = document.createElement("div");
  let imgDiv = document.createElement("img");
  let ulDiv = document.createElement("ul");
  let liDiv = document.createElement("li");
  let closeDiv = document.createElement("div");

  infoDiv.className = "cs_info";
  infoDiv.style.backgroundColor = "white";
  imgDiv.className = "cs_img";
  titleDiv.className = "cs_title";

  switch (obj.GB_OBSV) {
    case "01":
      titleDiv.style.backgroundColor = "blue";
      titleDiv.style.border = "true";
      imgDiv.style.height = "30px";
      imgDiv.src = require(`@/assets/rain_marker.png`);
      imgDiv.style.backgroundSize = "cover";
      break;
    case "02":
      titleDiv.style.backgroundColor = "skyblue";
      break;
    case "03":
      titleDiv.style.backgroundColor = "brown";
      break;
    case "06":
      titleDiv.style.backgroundColor = "purple";
      break;
    case "08":
      titleDiv.style.backgroundColor = "brown";
      break;
    case "17":
      titleDiv.style.backgroundColor = "orange";
      break;
    case "18":
      titleDiv.style.backgroundColor = "yellow";
      break;
    case "20":
      titleDiv.style.backgroundColor = "pink";
      break;
    case "21":
      titleDiv.style.backgroundColor = "red";
      break;
  }

  liDiv.textContent = "센서";
  closeDiv.onclick = "closeOverlay()";
  closeDiv.textContent = "닫기";
  ulDiv.appendChild(liDiv);

  titleDiv.textContent = obj.NM_DIST_OBSV;
  infoDiv.appendChild(titleDiv);
  infoDiv.appendChild(closeDiv);
  infoDiv.appendChild(imgDiv);
  infoDiv.appendChild(ulDiv);

  var content =
    '<div class="wrap bg-white">' +
    '    <div class="info">' +
    '        <div class="title bg-primary">' +
    `            ${obj.NM_DIST_OBSV}` +
    '            <div class="close" onclick="closeOverlay()" title="닫기"></div>' +
    "        </div>" +
    '        <div class="body">' +
    '            <div class="desc">' +
    `                <div class="jibun ellipsis">${obj.DTL_ADRES}</div>` +
    "            </div>" +
    "            <div>" +
    `                <div class='bg-black'>${obj.DATA}</div>` +
    "            </div>" +
    "        </div>" +
    "    </div>" +
    "</div>";
  return content;
}
