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

type LastUsedSettings = {
  intervalId: string;
  lastSend: string;
};

export default class LastUsed {
  constructor(
    private readonly storage: Storage,
    private readonly options: LastUsedOptions,
  ) {}

  init(): void {
    const { intervalId, lastSend } = this.getSettings();
    if (intervalId) {
      clearInterval(parseInt(intervalId, 10));
    }

    const newIntervalId = setInterval(() => {
      this.send();
    }, this.options.debounce);

    const lastSendDate = new Date(lastSend);
    const debounceDate = new Date();
    debounceDate.setSeconds(debounceDate.getSeconds() - this.options.debounce);

    if (lastSendDate < debounceDate) {
      this.send();
    } else {
      this.setSettings({ intervalId: `${newIntervalId}`, lastSend });
    }
  }

  private getSettings(): LastUsedSettings {
    const settings = this.storage.getItem('lastUsedSettings');
    if (settings) {
      return JSON.parse(settings);
    }
    return { intervalId: '', lastSend: '' };
  }

  private setSettings(settings: LastUsedSettings): void {
    this.storage.setItem('lastUsedSettings', JSON.stringify(settings));
  }

  private getTranslations(): Translations {
    const translations = this.storage.getItem('translations');
    return translations ? JSON.parse(translations) : {};
  }

  private setTranslations(translations: Translations): void {
    this.storage.setItem('translations', JSON.stringify(translations));
  }

  send(): void {
    fetch(this.options.usedPath, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.getTranslations()),
    })
      .then(() => this.getSettings())
      .then(({ intervalId }) => {
        this.setTranslations({});
        this.setSettings({
          intervalId: `${intervalId}`,
          lastSend: new Date().toISOString(),
        });
      })
      .catch(console.error);
  }

  isUsed(ns: string, key: string): void {
    if (key) {
      const isoDate = new Date().toISOString();
      const translations = this.getTranslations();
      translations[ns] = {
        ...translations[ns],
        ...{ [key]: isoDate },
      };
      this.setTranslations(translations);
    }
  }
}
