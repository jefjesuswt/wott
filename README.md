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

## Building from Source

1.  Install dependencies and run the application:

    ```bash
    # Using bun
    bun install
    bun start

    # Or with npm
    # npm install
    # npm start
    ```

2.  Open your browser and navigate to `http://localhost:4200`.

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
