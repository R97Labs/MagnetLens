## Privacy & Network Usage
This extension is completely open-source and does not collect, store, or transmit any personal telemetry, analytics, or tracking data.
All operations happen locally in your browser, with the following functional exceptions:

* **Search Queries:** When you search, your query is routed through a custom Vercel edge proxy (`live-torrent-proxy.vercel.app`) to bypass tracker anti-bot protections.
* **Image Previews:** When hovering over a torrent title, your browser directly pings the `whatslink.info` API to fetch video frames. This third-party service will see your local IP address.
* **Streaming:** Clicking "Play" sends the magnet link and parsed metadata directly to `streamlink.cloud` for cloud streaming.

## Disclaimer
This project is an independent tool designed for parsing public RSS feeds. The developer does not host, upload, or manage any of the media or torrent files discovered through this extension.
Users are solely responsible for ensuring their use of this software complies with their local laws and regulations.
