# Canton WalletConnect Demo

A demo showing how to integrate WalletConnect into a Canton Network dApp using the raw `@walletconnect/sign-client`.

## What This Shows

- Using the `canton` WalletConnect namespace
- Why there's no hardcoded chain ID (Canton network IDs are operator-defined)
- The 7 Canton WalletConnect methods
- QR code + URI generation for wallet connection

## Stack

- React + TypeScript + Vite
- `@walletconnect/sign-client`
- `qrcode.react`

## Setup

1. Get a WalletConnect Project ID from [cloud.walletconnect.com](https://cloud.walletconnect.com)

2. Setup an `.env` with your WC Project ID.

3. Install and run:

```bash
npm install
npm run dev
```

App runs on `http://localhost:5174`

## The Canton WalletConnect Namespace

```typescript
optionalNamespaces: {
  canton: {
    chains: ['canton:local'],
    methods: CANTON_METHODS,
    events: CANTON_EVENTS,
  },
}
```

## The 7 Canton Methods

| Method | Approval | Description |
|--------|----------|-------------|
| `canton_prepareSignExecute` | User required | Submit a Daml transaction |
| `canton_signMessage` | User required | Sign a message |
| `canton_listAccounts` | Auto | List parties |
| `canton_getPrimaryAccount` | Auto | Get primary party |
| `canton_getActiveNetwork` | Auto | Get network info |
| `canton_status` | Auto | Connection status |
| `canton_ledgerApi` | Auto | Proxy Ledger API |

## Docs

- [WalletConnect Canton spec](https://docs.walletconnect.network/wallet-sdk/chain-support/canton)
- [Canton Wallet Gateway](https://github.com/canton-network/wallet-gateway)
