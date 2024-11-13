import fetchMock from 'fetch-mock';
import { expect } from 'vitest';

fetchMock.mockGlobal();

expect.extend({
  toBeValidDate(received) {
    const pass = !isNaN(Date.parse(received));
    if (pass) {
      return {
        message: () => `expected "${received}" not to be a valid date string`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected "${received}" to be a valid date string`,
        pass: false,
      };
    }
  },
});
