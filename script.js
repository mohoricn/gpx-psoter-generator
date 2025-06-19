//// Set A4 dimensions in pixels at 300 DPI (for export)
const A4_WIDTH = 2480;
const A4_HEIGHT = 3508;

document.getElementById("generateBtn").addEventListener("click", () => {
  const name = document.getElementById("athleteName").value;
  const title = document.getElementById("activityName").value;
  const date = document.getElementById("activityDate").value;
  const dist = document.getElementById("activityDistance").value;
  const time = document.getElementById("activityDuration").value;

  document.getElementById("nameOut").textContent = name;
  document.getElementById("infoOut").textContent = `${dist} | ${time} | ${date}`;
});

document.getElementById("gpxFile").addEventListener("change", function () {
  const file = this.files[0];
  if (!file) return;

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
  svg.setAttribute("width", A4_WIDTH);
  svg.setAttribute("height", A4_HEIGHT);
  svg.setAttribute("viewBox", `0 0 ${A4_WIDTH} ${A4_HEIGHT}`);

  // Add defs for radial gradient
  const defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
  const gradient = document.createElementNS("http://www.w3.org/2000/svg", "radialGradient");
  gradient.setAttribute("id", "bgGradient");
  gradient.setAttribute("cx", "50%");
  gradient.setAttribute("cy", "50%");
  gradient.setAttribute("r", "70%");

  const stop1 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop1.setAttribute("offset", "0%");
  stop1.setAttribute("stop-color", "#f0f4f8");

  const stop2 = document.createElementNS("http://www.w3.org/2000/svg", "stop");
  stop2.setAttribute("offset", "100%");
  stop2.setAttribute("stop-color", "#e6ecf3");

  gradient.appendChild(stop1);
  gradient.appendChild(stop2);
  defs.appendChild(gradient);
  svg.appendChild(defs);

  // Pastel gradient background
  const bg = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  bg.setAttribute("width", "100%");
  bg.setAttribute("height", "100%");
  bg.setAttribute("fill", "url(#bgGradient)");
  svg.appendChild(bg);

  // Light grey border frame inset by 50 px
  const frame = document.createElementNS("http://www.w3.org/2000/svg", "rect");
  frame.setAttribute("x", "50");
  frame.setAttribute("y", "50");
  frame.setAttribute("width", A4_WIDTH - 100);
  frame.setAttribute("height", A4_HEIGHT - 100);
  frame.setAttribute("fill", "none");
  frame.setAttribute("stroke", "#cccccc");
  frame.setAttribute("stroke-width", "2");
  svg.appendChild(frame);

  const coords = geojson.features[0].geometry.coordinates;

  // Mercator-like projection
  const projected = coords.map(c => {
    const lon = c[0];
    const lat = c[1];
    return [lon, Math.log(Math.tan(Math.PI / 4 + lat * Math.PI / 360))];
  });

  const lons = projected.map(p => p[0]);
  const lats = projected.map(p => p[1]);

  const minLon = Math.min(...lons);
  const maxLon = Math.max(...lons);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const w = A4_WIDTH;
  const h = A4_HEIGHT;

  const padding = 200;
  const scaleX = (w - 2 * padding) / (maxLon - minLon);
  const scaleY = (h - 2 * padding) / (maxLat - minLat);
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (w - (maxLon - minLon) * scale) / 2;
  const offsetY = (h - (maxLat - minLat) * scale) / 2;

  const points = projected.map(p => {
    const x = (p[0] - minLon) * scale + offsetX;
    const y = h - ((p[1] - minLat) * scale + offsetY);
    return `${x},${y}`;
  });

  const polyline = document.createElementNS("http://www.w3.org/2000/svg", "polyline");
  polyline.setAttribute("points", points.join(" "));
  polyline.setAttribute("stroke", "#FF5500");
  polyline.setAttribute("stroke-width", "8");
  polyline.setAttribute("fill", "none");
  polyline.setAttribute("stroke-linecap", "round");
  polyline.setAttribute("stroke-linejoin", "round");
  svg.appendChild(polyline);

  // Draw activity title top center
  const title = document.getElementById("activityName").value;
  if (title && title.trim().length > 0) {
    const titleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    titleText.setAttribute("x", w / 2);
    titleText.setAttribute("y", 100);
    titleText.setAttribute("text-anchor", "middle");
    titleText.setAttribute("font-family", "'Helvetica Neue', Helvetica, Arial, sans-serif");
    titleText.setAttribute("font-size", "72");
    titleText.setAttribute("fill", "#333333");
    titleText.setAttribute("font-weight", "600");
    titleText.textContent = title;
    svg.appendChild(titleText);
  }
}

// PNG Export
document.getElementById("downloadBtn").addEventListener("click", () => {
  html2canvas(document.getElementById("posterArea"), { scale: 3 }).then(canvas => {
    const link = document.createElement("a");
    link.download = "poster.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  });
});

// PDF Export with jsPDF
document.getElementById("downloadPdfBtn").addEventListener("click", async () => {
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    unit: "pt",
    format: [A4_WIDTH, A4_HEIGHT],
  });

  const canvas = await html2canvas(document.getElementById("posterArea"), { scale: 3 });
  const imgData = canvas.toDataURL("image/png");

  pdf.addImage(imgData, "PNG", 0, 0, A4_WIDTH, A4_HEIGHT);
  pdf.save("poster.pdf");
});
