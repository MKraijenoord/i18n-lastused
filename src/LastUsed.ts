import { i18n, ThirdPartyModule } from 'i18next';
import type { InitOptions } from 'i18next/typescript/options';

interface LastUsedOptions {
  usedPath: string;
  debounce: number;
}

declare module 'i18next' {
  interface CustomPluginOptions {
    lastUsed: LastUsedOptions;
  }
}

type Translations = Record<string, Record<string, string>>;

export class UsedTranslations {
  constructor(
    private readonly storage: Storage,
    private readonly options: LastUsedOptions,
  ) {}

  init(): void {
    const intervalId = this.storage.getItem('intervalId');
    if (intervalId) {
      clearInterval(parseInt(intervalId, 10));
    }
    const newIntervalId = setInterval(() => {
      this.send();
    }, this.options.debounce);
    this.storage.setItem('intervalId', `${newIntervalId}`);
  }

  private getTranslations(): Translations {
    const translations = this.storage.getItem('translations');
    return translations ? JSON.parse(translations) : {};
  }

  send(): void {
    fetch(this.options.usedPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.getTranslations()),
    }).catch(console.error);
  }

  isUsed(ns: string, key: string): void {
    if (key) {
      const isoDate = new Date().toISOString();
      const translations: Translations = this.getTranslations();
      translations[ns] = {
        ...translations[ns],
        ...{ [key]: isoDate },
      };
      this.storage.setItem('translations', JSON.stringify(translations));
    }
  }
}

const LastUsed: ThirdPartyModule = {
  type: '3rdParty',
  init(i18nextInstance: i18n): void {
    const ut = new UsedTranslations(window.sessionStorage, {
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

export default LastUsed;
