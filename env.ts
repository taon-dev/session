import type { EnvOptions } from 'tnp/src';

const env: Partial<EnvOptions> = {
  website: {
    domain: 'session.example.domain.com',
    title: 'Session',
    useDomain: true,
  },
  config: {
    googleSecret: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:U3NpnP07KY0c4LtZrejZsA==:LPv32FPgY0rNsBcx:+VATqikyAndyKkRL1tg5WgPbv/Vro2QyZqdslrlZMvAHJ8pkoXN1pVrQviABNFEVY9ug$$$TAON_ENCRYPTED_END$$$`,
    googleClientId: '289576612173-2mh31b67pmq2qdes5jedno9tr1m542es.apps.googleusercontent.com',
  },
  loading: {
    preAngularBootstrap: {
      background: '#fdebed',
      loader: { name: 'lds-default' },
    },
  },
};
export default env;