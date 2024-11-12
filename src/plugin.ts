import { i18n, ThirdPartyModule } from 'i18next';
import type { InitOptions } from 'i18next/typescript/options';
import LastUsed from './LastUsed';

const plugin: ThirdPartyModule = {
  type: '3rdParty',
  init(i18nextInstance: i18n): void {
    const ut = new LastUsed(window.sessionStorage, {
      usedPath: i18nextInstance.options.lastUsed.usedPath,
      debounce: i18nextInstance.options.lastUsed.debounce,
    });
    ut.init();
    const { resourceStore } = i18nextInstance.services;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    const origGetResource = resourceStore.getResource;
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    // eslint-disable-next-line no-param-reassign
    resourceStore.getResource = (
      lng: string,
      ns: string,
      key: string,
      options?: Pick<InitOptions, 'keySeparator' | 'ignoreJSONStructure'>,
    ) => {
      ut.isUsed(ns, key);
      return origGetResource.call(resourceStore, lng, ns, key, options);
    };
  },
};

export default plugin;
