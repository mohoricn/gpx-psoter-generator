
document.getElementById("generateBtn").addEventListener("click", async () => {
  const fileInput = document.getElementById("gpxFile");
  if (!fileInput.files.length) {
    alert("Please upload a GPX file.");
    return;
  }

  const reader = new FileReader();
  reader.onload = function () {
    const parser = new DOMParser();
    const xml = parser.parseFromString(reader.result, "application/xml");
    const geojson = toGeoJSON.gpx(xml);

    if (!geojson.features.length) {
      alert("Invalid GPX file.");
      return;
    }

    const coords = geojson.features[0].geometry.coordinates;
    if (!coords.length) {
      alert("No coordinates found in GPX.");
      return;
    }

    // Scale and transform coordinates
    const svg = document.getElementById("routeMap");
    const padding = 200;
    const width = 2480, height = 3508;

    const xs = coords.map(c => c[0]);
    const ys = coords.map(c => c[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const scaleX = (width - 2 * padding) / (maxX - minX);
    const scaleY = (height - 2 * padding) / (maxY - minY);
    const scale = Math.min(scaleX, scaleY);

    const offsetX = (width - (maxX - minX) * scale) / 2;
    const offsetY = (height - (maxY - minY) * scale) / 2;

    const pathData = coords.map(([x, y], i) => {
      const px = (x - minX) * scale + offsetX;
      const py = height - ((y - minY) * scale + offsetY);
      return `${i === 0 ? "M" : "L"}${px},${py}`;
    }).join(" ");

    svg.setAttribute("width", width);
    svg.setAttribute("height", height);
    svg.innerHTML = `<path d="${pathData}" fill="none" stroke="#222" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/>`;

    // Add details
    const name = document.getElementById("athleteName").value;
    const title = document.getElementById("activityName").value;
    const date = document.getElementById("activityDate").value;
    const distance = document.getElementById("activityDistance").value;
    const duration = document.getElementById("activityDuration").value;

    document.getElementById("titleOut").textContent = title;
    document.getElementById("nameOut").textContent = name;
    document.getElementById("infoOut").textContent = `${distance} | ${duration} | ${date}`;
  };
  reader.readAsText(fileInput.files[0]);
});

document.getElementById("downloadBtn").addEventListener("click", () => {
  html2canvas(document.getElementById("posterArea")).then(canvas => {
    const link = document.createElement("a");
    link.download = "poster.png";
    link.href = canvas.toDataURL();
    link.click();
  });
});

document.getElementById("downloadPdfBtn").addEventListener("click", () => {
  html2canvas(document.getElementById("posterArea")).then(canvas => {
    const imgData = canvas.toDataURL("image/png");
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF("p", "px", [2480, 3508]);
    pdf.addImage(imgData, "PNG", 0, 0, 2480, 3508);
    pdf.save("poster.pdf");
  });
});
