import type { EnvOptions } from 'tnp/src';
const env: Partial<EnvOptions> = {
  //...
  config: {
    superUsers: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:ow84FrB5i38o0ZEZyd71MQ==:cVgLzfO3rKmX1fFQ:ypDQPyKk3pNMD67hl/ZgJKBOqS0BeSOuPuSZK1rtwerOxA==$$$TAON_ENCRYPTED_END$$$`,
    googleSecret: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:fp9jnyAtn9dEJ0atfLXL0A==:pOIhJCVtxXLUhbAd:GSTnmmt+L83LJvUidO8WdlEzZoXObYW5vBgZEhZQeSjCVqFGoQ==$$$TAON_ENCRYPTED_END$$$`,
    ACCESS_TOKEN_SECRET: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:gTbWKqdRgcNhtmGoPiZeqg==:FUp9O7d1NxTmsxwa:vsF7LBzVOcR/vC7ZtD6OhepqYbPem7zi65Om1gL76wzWeij9adhL19yaoQ==$$$TAON_ENCRYPTED_END$$$`,
    REFRESH_TOKEN_SECRET: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:tvHlcAFeix9kW+oi0FspLQ==:na7TZSG8TVKig09g:fL/xbzd/Whnac/xRDPnrKpQenK0oSZLSG1xBhzmQNm7M/tQFFg==$$$TAON_ENCRYPTED_END$$$`,
  },
  //...
};
export default env;