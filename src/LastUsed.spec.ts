import fetchMock from 'fetch-mock';
import { describe, expect, it } from 'vitest';
import InMemoryStorage from '../test/InMemoryStorage.js';
import LastUsed from './LastUsed.js';

describe('LastUsed', () => {
  const debounce = 10;
  async function setupLastUsed(
    url: string,
    wait: number = 11,
    storage: Storage = new InMemoryStorage(),
  ): Promise<Storage> {
    fetchMock.post(url, 200, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const lastUsed = new LastUsed(storage, {
      debounce,
      usedPath: url,
    });

    lastUsed.init();
    lastUsed.isUsed('ns1', 'misc.any.key');
    lastUsed.isUsed('ns2', 'misc.other.key');

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), wait);
    });

    return storage;
  }

  afterEach(() => {
    fetchMock.clearHistory();
  });

  it('sends all used translations to the server every 10 seconds', async () => {
    const url = 'https://endpoint.example/v1/api/used';
    await setupLastUsed(url, 35);

    expect(fetchMock.callHistory.calls(url)).to.have.length(3);
    const values = JSON.parse(fetchMock.callHistory.calls(url)[0].options.body);
    expect(values).toMatchObject({
      ns1: {
        'misc.any.key': expect.toBeValidDate(),
      },
      ns2: {
        'misc.other.key': expect.toBeValidDate(),
      },
    });
    expect(
      JSON.parse(fetchMock.callHistory.calls(url)[0].options.body),
    ).toMatchObject({});
    expect(
      JSON.parse(fetchMock.callHistory.calls(url)[0].options.body),
    ).toMatchObject({});
  });

  it('sends also if last send time was longer than debounce', async () => {
    const url = 'https://endpoint.longer-than-debounce/v1/api/used';
    const storage = new InMemoryStorage();
    const moreThanDebounce = new Date();
    moreThanDebounce.setSeconds(moreThanDebounce.getSeconds() - debounce - 10);
    storage.setItem(
      'lastUsedSettings',
      JSON.stringify({
        intervalId: '',
        lastSend: moreThanDebounce.toISOString(),
      }),
    );
    await setupLastUsed(url, 0, storage);

    expect(fetchMock.callHistory.calls(url)).to.have.length(1);
  });

  it('clears the storage after sending', async () => {
    const url = 'https://endpoint.example-2/v1/api/used';
    const storage = await setupLastUsed(url);

    expect(fetchMock.callHistory.calls(url)).to.have.length(1);
    expect(storage.getItem('translations')).to.equal('{}');
  });
});
