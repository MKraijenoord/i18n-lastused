# Getting started

This plugin has taken inspiration from [locize-lastused](https://github.com/locize/locize-lastused).
Only now you can use any API endpoint to sent the data to.

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

# Request

```text
POST [URL to API endpoint]
body: {
  [namespace] : {
    [key]: "[Date ISO string]"
  }
}
```

# Using with i18next

Options can be passed in by setting options.lastUsed in i18next.init:

```typescript
import i18next from 'i18next';
import LastUsed from 'i18n-lastused';

i18next.use(LastUsed).init({
  lastUsed: {
    debounce: 90000,
    usedPath: `${config.labelsApiUrl}v1/api/used`,
  },
});
```
