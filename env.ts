import type { EnvOptions } from 'tnp/src';

const env: Partial<EnvOptions> = {
  website: {
    domain: 'session.example.domain.com',
    title: 'Session',
    useDomain: true,
  },
  config: {
    googleSecret: () => "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",
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