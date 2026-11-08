const urlParams = new URLSearchParams(window.location.search);
const query = urlParams.get('q');

if (query) {
  document.getElementById("search-term").textContent = decodeURIComponent(query);
  
  // Call your Vercel proxy
  fetch(`https://live-torrent-proxy.vercel.app/api?q=${query}`)
    .then(response => response.text())
    .then(xmlString => {
      // Parse the raw XML text into a queryable DOM
      const parser = new window.DOMParser();
      return parser.parseFromString(xmlString, "text/xml");
    })
    .then(xmlData => {
      const items = xmlData.querySelectorAll("item");
      const resultsDiv = document.getElementById("results");
      resultsDiv.innerHTML = ""; // Clear loading text

      if (items.length === 0) {
        resultsDiv.innerHTML = "<div>No results found.</div>";
        return;
      }

      // Loop through each XML item and build the UI
      items.forEach(item => {
        const title = item.querySelector("title")?.textContent || "Unknown";
        const magnetLink = item.querySelector("link")?.textContent || "#";
        
        const div = document.createElement("div");
        div.className = "item";
        div.innerHTML = `
          <div class="title">${title}</div>
          <a href="${magnetLink}">🧲 Open Magnet</a>
        `;
        resultsDiv.appendChild(div);
      });
    })
    .catch(error => {
      document.getElementById("results").innerHTML = `<div style="color: #ff7b72;">Failed to fetch data. Ensure your Vercel proxy is live.</div>`;
    });
}
