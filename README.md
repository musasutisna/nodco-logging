<h1 align="center">Nodejs Config Logging</h1>

Nodejs config api is package to make easier configuration nodejs configuration intergration with logging.

## Getting started

Lets install nodco-logging with npm

```bash
npm install --save @musasutisna/nodco-api
```

## How to initialize

```js
nodcoLogginConfig(
  {
    // default config here
  }
)
```

| Method | Type | Description |
|:--|:--|:--|
| send | async | Manage logs and send into file. |

```js
send(
  logIds, // string, unique id log
  message // string, message will be write into log file
)
```
