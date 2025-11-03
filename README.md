# Wott

![Angular](https://img.shields.io/badge/angular-%23DD0031.svg?style=for-the-badge&logo=angular&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-%233178C6.svg?style=for-the-badge&logo=typescript&logoColor=white)
![Prettier](https://img.shields.io/badge/prettier-1A2C34?style=for-the-badge&logo=prettier&logoColor=F7B93E)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)

Wott is an experimental Angular-based web client for YouTube, designed to demonstrate how [Shaka Player][shaka] can be adapted to play videos using YouTube's SABR (Server-side Adaptive Bitrate) streaming protocol. It is heavily inspired by the original [Kira](https://github.com/LuanRT/kira) project and serves as an Angular example for using the [YouTube.js][youtubeijs] and [googlevideo][googlevideo] libraries.

## Features

### Implemented

- Initial setup for proxy configuration.
- Handles Google's BotGuard challenges.

### Planned Features

- SABR-based video playback for VOD, Live, and Post-Live content.
- Nearly instant playback load times.
- A responsive UI for both desktop and mobile.
- Home feed with recommendations (using persistent InnerTube sessions).
- Video search functionality.
- SABR-based downloader.
- User playlists and settings.
- Viewing video comments.
- Improved accessibility.

## How to Run

To run Wott, you need two separate processes running simultaneously: the **proxy server** and the **frontend application**.

**1. Start the Proxy Server**

The proxy server acts as a small backend, handling requests to YouTube's internal APIs (InnerTube) to bypass browser CORS restrictions.

In a terminal, start the proxy using Deno:

```bash

deno run --allow-net --allow-read --allow-write ./proxy/deno.ts

```

By default, the proxy will run on `http://localhost:8080`.

**2. Start the Frontend**

In a second terminal, install the dependencies and start the Angular development server:

```bash

# Using bun

bun install

bun start



# Or with npm

npm install

npm start

```

**3. Configure the App**

Navigate to `http://localhost:4200` in your browser. The app will ask for the IP address and port of your proxy. Enter the address of the proxy server you started in step 1 (e.g., `http://localhost:8080`).

## Building for Production

To create an optimized production build, run:

```bash

# Using bun

bun run build



# Or with npm

npm run build

```

The output will be in the `dist/` directory.

To build for production:

```bash
# Using bun
bun run build

# Or with npm
# npm run build
```

## How it works

The core of the integration is the `SabrStreamingAdapter`, which is initialized with our custom `ShakaPlayerAdapter` class.

Shaka Player is loaded with a dynamically generated DASH manifest for VOD content. The `ShakaPlayerAdapter` registers a custom networking scheme to intercept all segment requests.

When the player requests a media segment, the request is modified and a proper payload is created. The response for these requests has a `content-type` of `application/vnd.yt-ump`; if that content type is present, it is streamed through a `SabrUmpProcessor`.

The processor extracts the specific media data the player requested, along with metadata needed to maintain the streaming session, and then aborts the request to save bandwidth.

This project's implementation of the `SabrPlayerAdapter` interface for Shaka Player can be found in [`src/app/core/streaming/ShakaPlayerAdapter.ts`][shakaplayeradapter].

## Acknowledgments

This project is heavily inspired by the original [Kira](https://github.com/LuanRT/kira) project by LuanRT. Much of the core logic for handling SABR streaming is based on his work in the [googlevideo][googlevideo] and [youtubei.js][youtubeijs] libraries.

## License

Distributed under the MIT License.

[shaka]: https://shaka-player-demo.appspot.com/
[googlevideo]: https://www.github.com/LuanRT/googlevideo
[youtubeijs]: https://github.com/LuanRT/youtube.js
[shakaplayeradapter]: src/app/core/streaming/ShakaPlayerAdapter.ts
