import type { EnvOptions } from 'tnp/src';

const env: Partial<EnvOptions> = {
  website: {
    domain: 'session.example.domain.com',
    title: 'Session',
    useDomain: true,
  },
  config: {
    googleSecret: () => `$$$TAON_ENCRYPTED_START$$$v1:600000:G+wKPKbNIqo2HfcCZ1F/UA==:muQFsICTOqwc7y/b:/jQups1I4RNW9Qf6jQH6GqnG8CQNmYbT8xm5Y+Fo8fUarHzNl+sz9KZjk/gXh9zjnIqz$$$TAON_ENCRYPTED_END$$$`,
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