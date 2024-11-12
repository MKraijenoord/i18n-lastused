import fetchMock from 'fetch-mock';
import InMemoryStorage from '../test/InMemoryStorage';
import { UsedTranslations } from './LastUsed';

describe('LastUsed', () => {
  it('sends all used translations to the server every 10 seconds', async () => {
    const url = 'https://labels.easy-lms.internal/v1/api/used';
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
    lastUsed.isUsed('dashboard', 'misc.any.key');
    lastUsed.isUsed('course', 'misc.other.key');

    await new Promise<void>((resolve) => {
      setTimeout(() => resolve(), 35);
    });

    expect(fetchMock.calls(url)).to.have.length(3);
    const storeValues = JSON.parse(storage.getItem('translations'));
    expect(storeValues).to.have.property('dashboard');
    expect(storeValues.dashboard).to.have.property('misc.any.key');
    expect(storeValues.course).to.have.property('misc.other.key');
    expect(storeValues.dashboard['misc.any.key']).to.be.a('string');
    expect(storeValues.course['misc.other.key']).to.be.a('string');
  });
});
