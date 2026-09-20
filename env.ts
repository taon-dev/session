import type { EnvOptions } from 'tnp/src';

const env: Partial<EnvOptions> = {
  website: {
    domain: 'session.example.domain.com',
    title: 'Session',
    useDomain: true,
  },
  config: {
    googleSecret: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:fXAi1O5K+n4DSU/jrXuilA==:97h8552wO4xZh4vZ:HDBMC6Bo+Z3RZH7g/j9D5gSnFL+ydFvfl4osvEtg/WggxPofvmexNDoicFHnnaiFRF+U$$$TAON_ENCRYPTED_END$$$`,
    googleClientId: 'asdasdasdasd',
    microsoftClientId: 'aaaaaaaaaaaaa',
  },
  loading: {
    preAngularBootstrap: {
      background: '#fdebed',
      loader: { name: 'lds-default' },
    },
  },
};
export default env;