document.getElementById("generateBtn").addEventListener("click", () => {
  const name = document.getElementById("athleteName").value;
  const title = document.getElementById("activityName").value;
  const date = document.getElementById("activityDate").value;
  const dist = document.getElementById("activityDistance").value;
  const time = document.getElementById("activityDuration").value;

  document.getElementById("nameOut").textContent = name;
  document.getElementById("titleOut").textContent = title;
  document.getElementById("infoOut").textContent = `${dist} | ${time} | ${date}`;
});

document.getElementById("gpxFile").addEventListener("change", function () {
  const file = this.files[0];
  const reader = new FileReader();
  reader.onload = function (e) {
    const xml = new DOMParser().parseFromString(e.target.result, "text/xml");
    const geojson = toGeoJSON.gpx(xml);
    drawTrack(geojson);
  };
  reader.readAsText(file);
});

function drawTrack(geojson) {
  const svg = document.getElementById("routeMap");
  svg.innerHTML = "";

  const coords = geojson.features[0].geometry.coordinates;
  const points = coords.map(c => [c[0], c[1]]);

  const lons = points.map(p => p[0]);
  const lats = points.map(p => p[1]);

  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const w = svg.getAttribute("width");
  const h = svg.getAttribute("height");

  const scaleX = w / (maxLon - minLon);
  const scaleY = h / (maxLat - minLat);
  const scale = Math.min(scaleX, scaleY) * 0.9;

  const offsetX = (w - (maxLon - minLon) * scale) / 2;
  const offsetY = (h - (maxLat - minLat) * scale) / 2;

  const line = points.map(p => {
    const x = (p[0] - minLon) * scale + offsetX;
    const y = h - ((p[1] - minLat) * scale + offsetY);
    return `${x},${y}`;
  });

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", line.join(" "));
  polyline.setAttribute("stroke", "#000");
  polyline.setAttribute("stroke-width", "2");
  polyline.setAttribute("fill", "none");
  svg.appendChild(polyline);
}

document.getElementById("downloadBtn").addEventListener("click", () => {
  html2canvas(document.getElementById("posterArea")).then(canvas => {
    const link = document.createElement("a");
    link.download = "poster.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});
