# Canton dApp Demo

A minimal React dApp showing how to connect Canton wallets using the official [`@canton-network/dapp-sdk`](https://www.npmjs.com/package/@canton-network/dapp-sdk).

Built for the Canton Foundation DevRel video series.

## What This Shows

- Connecting to a Canton wallet using the dApp SDK
- The built-in wallet picker (CIP-103)
- `sdk.connect()` with a `RemoteAdapter` pointing at a local Wallet Gateway
- `sdk.listAccounts()` — fetching the Canton party ID
- `sdk.prepareExecuteAndWait()` — submitting a Daml transaction
- `sdk.ledgerApi()` — querying active contracts

## Stack

- React + TypeScript + Vite
- `@canton-network/dapp-sdk`
- `@walletconnect/sign-client` (peer dependency)

## Prerequisites

You need a running Canton Wallet Gateway. The easiest way locally:

```bash
# Install
npm install -g @canton-network/wallet-gateway-remote

# Run (with a config file)
export WALLET_GATEWAY_ADMIN_SECRET=unsafe
wallet-gateway -c ./wallet-gateway.json
```

For a full local Canton setup including a Canton node and Mock OAuth2:

```bash
git clone https://github.com/canton-network/wallet-gateway.git
cd wallet-gateway
yarn install
yarn tsx scripts/src/fetch-canton.ts

# Terminal 1 — Canton node
.canton/.../bin/canton --config canton/devnet/canton.conf --bootstrap canton/devnet/bootstrap.sc --no-tty

# Terminal 2 — Mock OAuth2
yarn workspace @canton-network/mock-oauth2 start

# Terminal 3 — Wallet Gateway
export WALLET_GATEWAY_ADMIN_SECRET=unsafe
wallet-gateway -c ./wallet-gateway.json
```

## Setup

```bash
npm install
npm run dev
```

App runs on `http://localhost:5173`

## The Integration

All wallet connectivity is in `useCantonWallet.ts` — about 60 lines:

```typescript
import * as sdk from '@canton-network/dapp-sdk'
import { RemoteAdapter } from '@canton-network/dapp-sdk'

// Connect — opens built-in wallet picker
await sdk.connect({
  additionalAdapters: [
    new RemoteAdapter({
      name: 'Canton Local',
      rpcUrl: 'http://localhost:3030/api/v0/dapp',
    }),
  ],
})

// Get the user's Canton party ID
const accounts = await sdk.listAccounts()

// Submit a Daml transaction (wallet handles signing + approval)
await sdk.prepareExecuteAndWait({ commands: [...] })

// Query contracts (wallet proxies with auth)
await sdk.ledgerApi({ requestMethod: 'post', resource: '/v2/state/active-contracts', body: {...} })
```

## Architecture

```
Canton dApp (this repo)
    ↕ CIP-103 / dApp SDK
Wallet Gateway (localhost:3030)
    ↕ Ledger API + JWT auth
Canton Node (localhost:5003)
```

The Wallet Gateway handles authentication, signing, and Ledger API access.
Your dApp never touches JWT tokens or private keys.

## Key Concepts

**Party ID** — Your Canton identity. Format: `hint::fingerprint` e.g. `participant-user::122084b3f...`. Think of it like an Ethereum address but privacy-preserving.

**RemoteAdapter** — Connects the dApp SDK to a remote Wallet Gateway over HTTP/SSE.

**CIP-103** — Canton's open wallet connectivity standard. Any wallet implementing CIP-103 works with the dApp SDK.

## Links

- [dApp SDK docs](https://github.com/canton-network/wallet-gateway/tree/main/docs/dapp-building)
- [Wallet Gateway npm](https://www.npmjs.com/package/@canton-network/wallet-gateway-remote)
- [Canton Network](https://canton.network)
- [CIP-103](https://github.com/canton-foundation/cips/blob/main/cip-0103/cip-0103.md)
