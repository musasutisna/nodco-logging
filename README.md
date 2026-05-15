<h1 align="center">Nodejs Config Logging</h1>

Nodejs config api is package to make easier configuration nodejs configuration intergration with logging.

## Getting started

Lets install nodco-logging with npm

```bash
npm install --save @musasutisna/nodco-logging
```

## How to initialize

```js
const nodcoLoggingConfig = require('@musasutisna/nodco-logging');

nodcoLoggingConfig(
  {
    // default config here
  }
)
```

| Config | Type | Default | Description |
|:--|:--|:--|:--|
| dirs | String | logs | Relative path where logs stored. |
| size | Number | 1024 * 1024 | Max size of file log in bytes, the default is 1 MB. |
| format | String | date | The format of filename log date 'YYYY-MM-DD' and datetime 'YYYY-MM-DD-HH' |
| json | Boolean | false | Format line log into json. |

<br/>

| Method | Type | Description |
|:--|:--|:--|
| write | async | Manage logs and send into file. |

<br/>

```js
send(
  ids, // String, The logs unique identity.
  message // String, The message will be write.
)
```
