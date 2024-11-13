# Getting started

Source can be loaded via npm or downloaded from this repo.

```bash
npm install i18n-lastused
```

# Options

```json
{
  "usedPath": "[URL to API endpoint]",
  "debounce": 90000
}
```

# Using with i18next

Options can be passed in by setting options.lastUsed in i18next.init:

```typescript
import i18next from 'i18next';
import LastUsed from 'i18n-lastused';

i18next
  .use(LastUsed)
  .init({
      lastUsed: {
        debounce: 90000,
        usedPath: `${config.labelsApiUrl}v1/api/used`,
      },
  });
```
