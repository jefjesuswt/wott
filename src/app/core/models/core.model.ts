import type { Misc } from 'youtubei.js/web';

export interface ProxySettings {
  protocol: 'http' | 'https';
  host: string;
  port: string;
}

export interface VideoItemData {
  videoId: string;
  title: string;
  titleText: string;
  thumbnail: string;
  authorAvatar?: string;
  metadata: (string | undefined)[];
  duration?: string;
}

export interface VideoDetails {
  title: string;
  channelName: string;
  channelAvatar: string;
  subscribers: string;
  views?: string;
  publishDate?: string;
  description?: Misc.Text;
}

export interface OnesieHotConfig {
  clientKeyData: Uint8Array;
  encryptedClientKey: Uint8Array;
  onesieUstreamerConfig: Uint8Array;
  baseUrl: string;
  keyExpiresInSeconds: number;
  timestamp?: number;
}

export interface EncryptedRequest {
  encrypted: Uint8Array;
  hmac: Uint8Array;
  iv: Uint8Array;
}
