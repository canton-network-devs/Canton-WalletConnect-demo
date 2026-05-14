/**
 * useCantonWallet.ts
 *
 * Raw WalletConnect integration for Canton Network dApps.
 * Uses @walletconnect/sign-client directly with the 'canton' namespace.
 *
 * Key differences from EVM:
 * - Namespace: 'canton' not 'eip155'
 * - No hardcoded chain ID — Canton network IDs are operator-defined
 * - 7 Canton-specific methods instead of eth_ methods
 * - Party ID is your identity, not a wallet address
 *
 * Spec: docs.walletconnect.network/wallet-sdk/chain-support/canton
 */

import { useState, useCallback, useRef } from 'react'
import SignClient from '@walletconnect/sign-client'

// ── The 7 Canton WalletConnect methods ───────────────────────────────────────
// Two require user approval, five are auto-approved
const CANTON_METHODS = [
  'canton_prepareSignExecute', // ← user approval required (like eth_sendTransaction)
  'canton_signMessage',        // ← user approval required (like personal_sign)
  'canton_listAccounts',       // auto-approved
  'canton_getPrimaryAccount',  // auto-approved
  'canton_getActiveNetwork',   // auto-approved
  'canton_status',             // auto-approved
  'canton_ledgerApi',          // auto-approved — wallet proxies Ledger API, handles auth
]

const CANTON_EVENTS = ['accountsChanged', 'statusChanged', 'chainChanged']

export type WalletState = 'idle' | 'connecting' | 'connected' | 'error'

export interface CantonAccount {
  partyId: string      // Canton identity — equivalent of an Ethereum address
  networkId: string
  status: string
  signingProviderId: string
}

export function useCantonWallet() {
  const clientRef = useRef<InstanceType<typeof SignClient> | null>(null)
  const sessionRef = useRef<{ topic: string; chainId: string } | null>(null)

  const [state, setState] = useState<WalletState>('idle')
  const [wcUri, setWcUri] = useState<string | null>(null)
  const [account, setAccount] = useState<CantonAccount | null>(null)
  const [error, setError] = useState<string | null>(null)

  const connect = useCallback(async () => {
    setState('connecting')
    setError(null)
    setWcUri(null)

    try {
      // Step 1: Init WalletConnect SignClient
      const client = clientRef.current ?? await SignClient.init({
        projectId: import.meta.env.VITE_WC_PROJECT_ID,
        metadata: {
          name: 'Canton WC Demo',
          description: 'WalletConnect demo for Canton Network',
          url: location.origin,
          icons: [],
        },
      })
      clientRef.current = client

      // Handle session deletion (wallet disconnects)
      client.on('session_delete', () => {
        sessionRef.current = null
        setAccount(null)
        setState('idle')
      })

      // Step 2: Create a WalletConnect session request
      //
      // KEY DIFFERENCE FROM EVM:
      // EVM:    requiredNamespaces: { eip155: { chains: ['eip155:1'] } }
      // Canton: optionalNamespaces with 'canton' namespace, no fixed chain ID
      //
      // Canton network IDs are operator-defined (e.g. 'canton:local', 'canton:mainnet')
      // The wallet tells the dApp which network it's on — not the other way around.
      const { uri, approval } = await client.connect({
        optionalNamespaces: {
          canton: {
            chains: ['canton:local'],
            methods: CANTON_METHODS,
            events: CANTON_EVENTS,
          },
        },
      })

      // Step 3: Show the WC URI (scan with wallet app or use desktop wallet)
      // In production: render as QR code with <QRCodeSVG value={wcUri} />
      if (uri) setWcUri(uri)

      // Step 4: Wait for wallet to approve the session
      const session = await approval()
      setWcUri(null)

      // Step 5: Parse the CAIP-10 account string
      // Format: "canton:<networkId>:<partyId>"
      // e.g.   "canton:local:participant-user::122084b3f..."
      const cantonAccounts = session.namespaces['canton']?.accounts ?? []
      const [, networkId] = (cantonAccounts[0] ?? '::').split(':')
      const chainId = `canton:${networkId}`
      sessionRef.current = { topic: session.topic, chainId }

      // Step 6: Fetch full account info from the wallet
      // canton_getPrimaryAccount is auto-approved — no user confirmation needed
      const acct = await client.request<CantonAccount>({
        topic: session.topic,
        chainId,
        request: { method: 'canton_getPrimaryAccount', params: {} },
      })

      setAccount(acct)
      setState('connected')

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed')
      setState('error')
    }
  }, [])

  const disconnect = useCallback(async () => {
    const client = clientRef.current
    const session = sessionRef.current
    if (client && session) {
      await client.disconnect({
        topic: session.topic,
        reason: { code: 6000, message: 'User disconnected' },
      })
    }
    sessionRef.current = null
    setAccount(null)
    setState('idle')
  }, [])

  return { state, wcUri, account, error, connect, disconnect }
}
