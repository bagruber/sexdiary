import { registerRootComponent } from "expo";
import * as ExpoCrypto from "expo-crypto";

// Core's id/token generation expects a WebCrypto-style CSPRNG on
// globalThis. React Native doesn't ship one; expo-crypto provides it.
const g = globalThis as { crypto?: { getRandomValues?: unknown } };
if (!g.crypto?.getRandomValues) {
  g.crypto = {
    ...g.crypto,
    getRandomValues: ExpoCrypto.getRandomValues.bind(ExpoCrypto),
  };
}

// App is required after the polyfill so module-init code already sees it.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const App = require("./App").default;

registerRootComponent(App);
