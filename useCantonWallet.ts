import { useState, useCallback, useRef } from 'react'
import SignClient from '@walletconnect/sign-client'

const CANTON_METHODS = [
  'canton_prepareSignExecute', 
  'canton_signMessage',        
  'canton_listAccounts',       
  'canton_getPrimaryAccount',  
  'canton_getActiveNetwork',   
  'canton_status',             
  'canton_ledgerApi',          
]

const CANTON_EVENTS = ['accountsChanged', 'statusChanged', 'chainChanged']
export type WalletState = 'idle' | 'connecting' | 'connected' | 'error'
export interface CantonAccount {
  partyId: string    
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
      client.on('session_delete', () => {
        sessionRef.current = null
        setAccount(null)
        setState('idle')
      })
      const { uri, approval } = await client.connect({
        optionalNamespaces: {
          canton: {
            chains: ['canton:local'],
            methods: CANTON_METHODS,
            events: CANTON_EVENTS,
          },
        },
      })
      if (uri) setWcUri(uri)
      const session = await approval()
      setWcUri(null)
      const cantonAccounts = session.namespaces['canton']?.accounts ?? []
      const [, networkId] = (cantonAccounts[0] ?? '::').split(':')
      const chainId = `canton:${networkId}`
      sessionRef.current = { topic: session.topic, chainId }
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
