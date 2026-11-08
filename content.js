chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "openOverlay") {
    createOverlay(request.query);
  }
});

function createOverlay(initialQuery) {
  const existing = document.getElementById("streamlink-overlay");
  if (existing) existing.remove();


  
  const overlay = document.createElement("div");
  overlay.id = "streamlink-overlay";
  Object.assign(overlay.style, {
    position: "fixed", top: "0", left: "0", width: "100vw", height: "100vh",
    backgroundColor: "rgba(10, 12, 16, 0.7)", 
    backdropFilter: "blur(12px)", // Premium Glassmorphism blur
    WebkitBackdropFilter: "blur(12px)",
    zIndex: "999999", display: "flex", justifyContent: "center", alignItems: "center"
  });

  const modal = document.createElement("div");
  Object.assign(modal.style, {
    position: "relative", 
    backgroundColor: "rgba(22, 27, 34, 0.85)", 
    color: "#e6edf3", width: "840px",
    maxHeight: "85vh", overflowY: "auto", 
    borderRadius: "16px", padding: "24px", 
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 24px 48px rgba(0, 0, 0, 0.5)",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) overlay.remove();
  });

modal.innerHTML = `
    <div id="sl-update-banner" style="display: none; background: rgba(46, 160, 67, 0.15); border: 1px solid rgba(46, 160, 67, 0.4); color: #3fb950; padding: 12px 16px; border-radius: 12px; margin-bottom: 16px; font-size: 14px; font-weight: 600; justify-content: space-between; align-items: center;">
      <span>🚀 MagnetLens Update Available (<span id="sl-update-version"></span>)</span>
      <a id="sl-update-link" href="#" target="_blank" style="background: #238636; color: white; padding: 6px 14px; border-radius: 8px; text-decoration: none; transition: background 0.2s;">Download Latest</a>
    </div>
    <div style="display: flex; gap: 12px; margin-bottom: 20px;">
      <input id="sl-search-input" value="${initialQuery}" style="flex: 1; padding: 14px 16px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 12px; font-size: 16px; outline: none; transition: border-color 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);" placeholder="Search torrents...">
      <button id="sl-search-btn" style="padding: 14px 28px; background: linear-gradient(135deg, #238636, #2ea043); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3); transition: transform 0.1s, box-shadow 0.2s;">Search</button>
    </div>
      <input id="sl-search-input" value="${initialQuery}" style="flex: 1; padding: 14px 16px; background: rgba(0, 0, 0, 0.2); border: 1px solid rgba(255,255,255,0.1); color: #fff; border-radius: 12px; font-size: 16px; outline: none; transition: border-color 0.2s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);" placeholder="Search torrents...">
      <button id="sl-search-btn" style="padding: 14px 28px; background: linear-gradient(135deg, #238636, #2ea043); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: 600; font-size: 15px; box-shadow: 0 4px 12px rgba(35, 134, 54, 0.3); transition: transform 0.1s, box-shadow 0.2s;">Search</button>
    </div>
    <div id="sl-sort-tabs" style="display: flex; gap: 24px; margin-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 12px; padding-left: 8px;">
      <button data-sort="" style="background: transparent; color: #8b949e; border: none; cursor: pointer; font-size: 14px; font-weight: 500; padding: 0; transition: color 0.2s;">By Relevance</button>
      <button data-sort="time" style="background: transparent; color: #8b949e; border: none; cursor: pointer; font-size: 14px; font-weight: 500; padding: 0; transition: color 0.2s;">By Time</button>
      <button data-sort="size" style="background: transparent; color: #8b949e; border: none; cursor: pointer; font-size: 14px; font-weight: 500; padding: 0; transition: color 0.2s;">By Size</button>
      <button data-sort="seeders" style="background: transparent; color: #e6edf3; border: none; cursor: pointer; font-size: 14px; font-weight: 600; padding: 0; position: relative;">By Priority
        <div style="position: absolute; bottom: -14px; left: 0; right: 0; height: 3px; background: #58a6ff; border-radius: 3px 3px 0 0;"></div>
      </button>
    </div>
    <div id="sl-results"></div>
  `;

  // Premium Floating Preview Box (Centered image handling)
  const previewBox = document.createElement("div");
  previewBox.id = "sl-preview-box";
  Object.assign(previewBox.style, {
    position: "fixed", right: "30px", top: "30px", width: "360px", height: "202px", // 16:9 Aspect Ratio
    backgroundColor: "rgba(10, 12, 16, 0.9)", border: "1px solid rgba(255,255,255,0.1)", 
    borderRadius: "12px", opacity: "0", transition: "all 0.3s cubic-bezier(0.16, 1, 0.3, 1)", 
    boxShadow: "0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05) inset",
    pointerEvents: "none", display: "flex", alignItems: "center", justifyContent: "center",
    overflow: "hidden", zIndex: "1000000", backdropFilter: "blur(10px)",
    transform: "translateY(10px)" // Slight animation offset
  });
  
  overlay.appendChild(modal);
  overlay.appendChild(previewBox);
  document.body.appendChild(overlay);

  // Tab switching logic (updated for modern underline active state)
  let currentSort = 'seeders';

  document.getElementById("sl-search-btn").addEventListener("click", () => {
    fetchData(document.getElementById("sl-search-input").value, currentSort);
  });

  document.getElementById("sl-sort-tabs").addEventListener("click", (e) => {
    if (e.target.tagName === "BUTTON") {
      currentSort = e.target.getAttribute("data-sort");
      Array.from(document.getElementById("sl-sort-tabs").children).forEach(btn => {
        btn.style.color = "#8b949e";
        btn.style.fontWeight = "500";
        btn.innerHTML = btn.textContent; // Strip underline
      });
      e.target.style.color = "#e6edf3";
      e.target.style.fontWeight = "600";
      e.target.innerHTML = `${e.target.textContent} <div style="position: absolute; bottom: -14px; left: 0; right: 0; height: 3px; background: #58a6ff; border-radius: 3px 3px 0 0;"></div>`;
      fetchData(document.getElementById("sl-search-input").value, currentSort);
    }
  });

  fetchData(initialQuery, currentSort);
  // Trigger update check when the overlay opens
  chrome.runtime.sendMessage({ action: "checkUpdate" }, (response) => {
    if (response && response.updateAvailable) {
      document.getElementById("sl-update-version").textContent = response.version;
      document.getElementById("sl-update-link").href = response.url;
      document.getElementById("sl-update-banner").style.display = "flex"; // Un-hides the banner
    }
  });
}

// Premium Color Palette for Sizes
function getSizeColor(sizeStr) {
  let size = parseFloat(sizeStr);
  if (isNaN(size)) return { bg: "rgba(31, 58, 95, 0.2)", border: "rgba(31, 58, 95, 0.5)", text: "#79c0ff" }; 
  
  const str = sizeStr.toLowerCase();
  if (str.includes("tb")) size *= 1048576;
  else if (str.includes("gb")) size *= 1024;
  else if (str.includes("kb")) size /= 1024;
  
  // Translucent background, solid border, bright text
  if (size < 500) return { bg: "rgba(46, 160, 67, 0.15)", border: "rgba(46, 160, 67, 0.4)", text: "#3fb950" }; 
  if (size < 2048) return { bg: "rgba(210, 153, 34, 0.15)", border: "rgba(210, 153, 34, 0.4)", text: "#d29922" }; 
  if (size < 10240) return { bg: "rgba(227, 98, 9, 0.15)", border: "rgba(227, 98, 9, 0.4)", text: "#e36209" }; 
  return { bg: "rgba(248, 81, 73, 0.15)", border: "rgba(248, 81, 73, 0.4)", text: "#ff7b72" }; 
}

function fetchData(query, sort) {
  const resultsDiv = document.getElementById("sl-results");
  
  // Modern pulsating loading state
  resultsDiv.innerHTML = `
    <div style="display: flex; gap: 16px; align-items: center; padding: 20px; color: #8b949e;">
       <div style="width: 20px; height: 20px; border: 2px solid rgba(88, 166, 255, 0.2); border-top: 2px solid #58a6ff; border-radius: 50%; animation: sl-spin 0.8s linear infinite;"></div>
       <span style="font-size: 14px; font-weight: 500;">Searching active swarms...</span>
    </div>
    <style>@keyframes sl-spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }</style>
  `;

  fetch(`https://live-torrent-proxy.vercel.app/api?q=${encodeURIComponent(query)}&sort=${sort}&key=streamlink2026`)
    .then(res => res.text())
    .then(xmlString => new window.DOMParser().parseFromString(xmlString, "text/xml"))
    .then(xmlData => {
      resultsDiv.innerHTML = ""; 
      const items = Array.from(xmlData.querySelectorAll("item"));
      
      if (items.length === 0) {
        resultsDiv.innerHTML = `<div style="padding: 20px; color: #8b949e; text-align: center;">No viable links found.</div>`;
        return;
      }

      items.forEach(item => {
        const rawTitle = item.querySelector("title")?.textContent || "Unknown Title";
        const magnet = item.querySelector("link")?.textContent || "#";
        const pubDate = item.querySelector("pubDate")?.textContent || "";
        const description = item.querySelector("description")?.textContent || "";
        
        // Clean title
        const cleanTitle = rawTitle.replace(/(\.mkv|\.mp4|\.avi|\[YTS\.MX\]|\[TGx\]|\[rartv\])/gi, '').replace(/\./g, ' ').trim();
        
        // Extract size
        const sizeMatch = description.match(/([0-9.]+\s*[MGT]B)/i);
        const size = sizeMatch ? sizeMatch[1] : "Unknown";
        
        const dateObj = new Date(pubDate);
        const date = !isNaN(dateObj) ? dateObj.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : "N/A";
        
        const colors = getSizeColor(size);
        let currentPosterUrl = ""; 

        const itemDiv = document.createElement("div");
        Object.assign(itemDiv.style, {
          background: "rgba(255, 255, 255, 0.02)", padding: "18px", marginBottom: "16px",
          borderRadius: "12px", border: "1px solid rgba(255, 255, 255, 0.05)",
          transition: "background 0.2s, border-color 0.2s"
        });
        
        // Subtle hover highlight for the entire row
        itemDiv.addEventListener("mouseenter", () => { itemDiv.style.background = "rgba(255, 255, 255, 0.04)"; itemDiv.style.borderColor = "rgba(255, 255, 255, 0.1)"; });
        itemDiv.addEventListener("mouseleave", () => { itemDiv.style.background = "rgba(255, 255, 255, 0.02)"; itemDiv.style.borderColor = "rgba(255, 255, 255, 0.05)"; });
        
        const titleEl = document.createElement("a");
        titleEl.textContent = cleanTitle;
        titleEl.href = magnet;
        Object.assign(titleEl.style, {
          display: "inline-block", fontWeight: "600", fontSize: "16px", color: "#58a6ff", 
          textDecoration: "none", marginBottom: "14px", lineHeight: "1.4", wordWrap: "break-word",
          letterSpacing: "-0.2px"
        });

        let hoverTimeout; 

        titleEl.addEventListener("mouseenter", () => {
          titleEl.style.textDecoration = "underline";
          const previewBox = document.getElementById("sl-preview-box");
          if (!previewBox) return; 
          
          clearInterval(window.slSlideshow);
          previewBox.style.opacity = "1";
          previewBox.style.transform = "translateY(0)"; // Float up animation
          
          previewBox.innerHTML = `
            <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%;">
              <div style="width: 24px; height: 24px; border: 2px solid rgba(139, 148, 158, 0.2); border-top: 2px solid #8b949e; border-radius: 50%; animation: sl-spin 0.8s linear infinite; margin-bottom: 12px;"></div>
            </div>
          `;
          
          hoverTimeout = setTimeout(() => {
            chrome.runtime.sendMessage(
              { action: "fetchWhatsLink", url: magnet },
              (response) => {
                if (chrome.runtime.lastError || !response || !response.success) {
                   previewBox.innerHTML = `<div style="color: #ff7b72; font-size: 13px; font-weight: 500;">Preview Unavailable</div>`;
                   return;
                }
                
                const data = response.data;
                if (data.screenshots && Array.isArray(data.screenshots) && data.screenshots.length > 0) {
                  previewBox.innerHTML = ""; 
                  
                  const imgEl = document.createElement("img");
                  Object.assign(imgEl.style, {
                    width: "100%", height: "100%", 
                    objectFit: "contain", // Prevents zooming/cropping
                    objectPosition: "center", // Centers the image
                    borderRadius: "10px"
                  });
                  
                  let currentIndex = 0;
                  currentPosterUrl = data.screenshots[currentIndex].screenshot;
                  imgEl.src = currentPosterUrl;
                  previewBox.appendChild(imgEl);
                  
                  if (data.screenshots.length > 1) {
                    window.slSlideshow = setInterval(() => {
                      currentIndex = (currentIndex + 1) % data.screenshots.length;
                      currentPosterUrl = data.screenshots[currentIndex].screenshot;
                      imgEl.src = currentPosterUrl;
                    }, 1500); 
                  }
                } else {
                  previewBox.innerHTML = `<div style="color: #8b949e; font-size: 13px; font-weight: 500;">No Image Data</div>`;
                }
              }
            );
          }, 400); 
        });

        titleEl.addEventListener("mouseleave", () => {
          titleEl.style.textDecoration = "none";
          clearTimeout(hoverTimeout); 
          clearInterval(window.slSlideshow); 
          
          const previewBox = document.getElementById("sl-preview-box");
          if (previewBox) {
            previewBox.style.opacity = "0";
            previewBox.style.transform = "translateY(10px)";
            setTimeout(() => { if(previewBox.style.opacity === "0") previewBox.innerHTML = ""; }, 300);
          }
        });

        const metaDiv = document.createElement("div");
        Object.assign(metaDiv.style, {
          display: "flex", gap: "12px", fontSize: "12px", alignItems: "center", flexWrap: "wrap"
        });
        
        // Modern Pill Design (Seeders removed)
        metaDiv.innerHTML = `
          <button class="sl-play-btn" style="background: rgba(88, 166, 255, 0.1); border: 1px solid rgba(88, 166, 255, 0.4); color: #58a6ff; padding: 6px 14px; border-radius: 8px; cursor: pointer; font-weight: 600; display: flex; align-items: center; gap: 6px; transition: all 0.2s;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg> Play
          </button>
          <span style="background: ${colors.bg}; border: 1px solid ${colors.border}; color: ${colors.text}; padding: 5px 12px; border-radius: 8px; font-weight: 600; letter-spacing: 0.3px;">${size}</span>
          <span style="color: #8b949e; display: flex; align-items: center; gap: 4px;">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> 
            ${date}
          </span>
        `;

        const playBtn = metaDiv.querySelector(".sl-play-btn");
        playBtn.addEventListener("mouseenter", () => { playBtn.style.background = "rgba(88, 166, 255, 0.2)"; playBtn.style.transform = "scale(1.02)"; });
        playBtn.addEventListener("mouseleave", () => { playBtn.style.background = "rgba(88, 166, 255, 0.1)"; playBtn.style.transform = "scale(1)"; });
        
        playBtn.addEventListener("click", () => {
          const targetUrl = `https://streamlink.cloud/api/?url=${encodeURIComponent(magnet)}&action=stream-direct&fileName=${encodeURIComponent(cleanTitle)}&poster=${encodeURIComponent(currentPosterUrl)}`;
          window.open(targetUrl, '_blank');
        });

        itemDiv.appendChild(titleEl);
        itemDiv.appendChild(metaDiv);
        resultsDiv.appendChild(itemDiv);
      });
    })
    .catch(err => {
      resultsDiv.innerHTML = `<div style="padding: 20px; color: #ff7b72; text-align: center;">Network Error. Proxy unreachable.</div>`;
    });
}
