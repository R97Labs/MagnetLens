chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-magnetlens",
    title: "Search for '%s'",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-magnetlens") {
    chrome.tabs.sendMessage(tab.id, {
      action: "openOverlay",
      query: info.selectionText
    }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn("MagnetLens: Please refresh this webpage to use the search overlay.");
      }
    });
  }
});

const GITHUB_USER = "R97Labs";
const GITHUB_REPO = "MagnetLens";
const MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/manifest.json`;
const RELEASES_URL = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle WhatsLink Image Fetch
  if (request.action === "fetchWhatsLink") {
    fetch(`https://whatslink.info/api/v1/link?url=${encodeURIComponent(request.url)}`)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data: data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    return true; 
  }

  // Handle GitHub Update Check
 if (request.action === "checkUpdate") {
    fetch(`${MANIFEST_URL}?t=${Date.now()}`, { cache: "no-store" })
      .then(res => {
        if (!res.ok) throw new Error("GitHub fetch failed");
        return res.json();
      })
      .then(remoteManifest => {
        const localVersion = chrome.runtime.getManifest().version;
        
        // Split versions into arrays (e.g., "1.2" -> [1, 2])
        const v1 = remoteManifest.version.split('.').map(Number);
        const v2 = localVersion.split('.').map(Number);
        
        let updateAvailable = false;
        
        // Mathematically compare each segment of the version number
        for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
          const num1 = v1[i] || 0;
          const num2 = v2[i] || 0;
          if (num1 > num2) {
            updateAvailable = true;
            break;
          } else if (num1 < num2) {
            break;
          }
        }

        if (updateAvailable) {
          sendResponse({ updateAvailable: true, version: remoteManifest.version, url: RELEASES_URL });
        } else {
          sendResponse({ updateAvailable: false });
        }
      })
      .catch(err => {
        console.error("Update check failed:", err);
        sendResponse({ updateAvailable: false });
      });
      
    return true; 
  }
});
