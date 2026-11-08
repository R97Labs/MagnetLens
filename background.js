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
        if (remoteManifest.version.localeCompare(localVersion, undefined, { numeric: true }) > 0) {
          sendResponse({ updateAvailable: true, version: remoteManifest.version, url: RELEASES_URL });
        } else {
          sendResponse({ updateAvailable: false });
        }
      })
      .catch(err => {
        console.error("Update check failed:", err);
        sendResponse({ updateAvailable: false });
      });
    return true; // Keep channel open for async fetch
  }
});
