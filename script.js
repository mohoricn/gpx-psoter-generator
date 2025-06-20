document.getElementById('gpxFile').addEventListener('change', handleFileSelect);
document.getElementById('downloadBtn').addEventListener('click', downloadPDF);
document.getElementById('fontSelect').addEventListener('change', function () {
  document.getElementById('poster').style.fontFamily = this.value;
});

function handleFileSelect(evt) {
  const file = evt.target.files[0];
  const reader = new FileReader();

  reader.onload = function(e) {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(e.target.result, "application/xml");
    const trkpts = xmlDoc.getElementsByTagName("trkpt");

    const svg = document.getElementById("track");
    svg.innerHTML = "";

    const points = [];
    for (let pt of trkpts) {
      const lat = parseFloat(pt.getAttribute("lat"));
      const lon = parseFloat(pt.getAttribute("lon"));
      points.push([lon, lat]);
    }

    if (points.length === 0) return;

    // Simple scaling
    const scale = 10000;
    const minX = Math.min(...points.map(p => p[0]));
    const minY = Math.min(...points.map(p => p[1]));
    const pathData = points.map(p => {
      return [(p[0] - minX) * scale, (p[1] - minY) * -scale];
    });

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", `M${pathData.map(p => p.join(',')).join(' L')}`);
    path.setAttribute("stroke", "#000");
    path.setAttribute("stroke-width", 2);
    path.setAttribute("fill", "none");
    svg.appendChild(path);
  };

  reader.readAsText(file);
}

function downloadPDF() {
  window.print(); // basic export option
}
