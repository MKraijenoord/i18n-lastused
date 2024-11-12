import fetchMock from 'fetch-mock';
import { describe, expect, it } from 'vitest';
import InMemoryStorage from '../test/InMemoryStorage';
import { UsedTranslations } from './LastUsed';

describe('LastUsed', () => {
  it('sends all used translations to the server every 10 seconds', async () => {
    const url = 'https://endpoint.example/v1/api/used';
    fetchMock.post(url, 200, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const storage = new InMemoryStorage();
    const lastUsed = new UsedTranslations(storage, {
      debounce: 10,
      usedPath: url,
    });

    lastUsed.init();
    lastUsed.isUsed('ns1', 'misc.any.key');
    lastUsed.isUsed('ns2', 'misc.other.key');

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 35);
    });

    expect(fetchMock.callHistory.calls(url)).to.have.length(3);
    const storeValues = JSON.parse(storage.getItem('translations') as string);
    expect(storeValues).to.have.property('ns1');
    expect(storeValues).to.have.property('ns2');
    expect(storeValues.ns1).to.have.property('misc.any.key');
    expect(storeValues.ns2).to.have.property('misc.other.key');
    expect(storeValues.ns1['misc.any.key']).to.be.a('string');
    expect(storeValues.ns2['misc.other.key']).to.be.a('string');
  });
});
