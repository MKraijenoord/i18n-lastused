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

export default class LastUsed {
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
