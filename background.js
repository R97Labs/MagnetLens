chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "search-magnetlens",
    title: "Search for '%s'",
    contexts: ["selection"]
  });
  checkForUpdates();
});

chrome.runtime.onStartup.addListener(() => {
  checkForUpdates();
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "search-magnetlens") {
    chrome.tabs.sendMessage(tab.id, {
      action: "openOverlay",
      query: info.selectionText
    });
  }
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "fetchWhatsLink") {
    fetch(`https://whatslink.info/api/v1/link?url=${encodeURIComponent(request.url)}`)
      .then(res => res.json())
      .then(data => sendResponse({ success: true, data: data }))
      .catch(err => sendResponse({ success: false, error: err.message }));
    
    return true; 
  }
});

// --- CUSTOM GITHUB UPDATE CHECKER ---
const GITHUB_USER = "R97Labs";
const GITHUB_REPO = "MagnetLens";
const MANIFEST_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/main/manifest.json`;
const RELEASES_URL = `https://github.com/${GITHUB_USER}/${GITHUB_REPO}/releases/latest`;

async function checkForUpdates() {
  try {
    const response = await fetch(MANIFEST_URL, { cache: "no-store" });
    const remoteManifest = await response.json();
    const localVersion = chrome.runtime.getManifest().version;

    if (remoteManifest.version.localeCompare(localVersion, undefined, { numeric: true }) > 0) {
      chrome.notifications.create("magnetlens-update", {
        type: "basic",
        iconUrl: "icons/icon128.png",
        title: "MagnetLens Update Available",
        message: `Version ${remoteManifest.version} is out! Click here to download the latest features.`,
        requireInteraction: true
      });
    }
  } catch (error) {
    console.error("MagnetLens Update Check Failed:", error);
  }
}

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === "magnetlens-update") {
    chrome.tabs.create({ url: RELEASES_URL });
    chrome.notifications.clear(notificationId);
  }
});
