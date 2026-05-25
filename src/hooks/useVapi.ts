import { useEffect, useRef, useState } from 'react';
import Vapi from '@vapi-ai/web';

export const useVapi = (publicKey: string, assistantId: string) => {
  const vapiRef = useRef<Vapi | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!publicKey) {
      setError("Public Key missing");
      return;
    }
    
    const vapiInstance = new Vapi(publicKey);
    vapiRef.current = vapiInstance;

    if (publicKey && !publicKey.startsWith('pk_')) {
      console.warn('Vapi: The provided Public Key does not start with "pk_". Please verify you are using the "Public Key" from the Vapi Dashboard (Settings > API Keys).');
    }

    // Event listeners
    const onCallStart = () => {
      console.log('Vapi: Call Started');
      setIsCallActive(true);
      setIsConnecting(false);
    };
    const onCallEnd = () => {
      console.log('Vapi: Call Ended');
      setIsCallActive(false);
      setIsConnecting(false);
      setVolume(0);
    };
    const onError = (e: any) => {
      console.error('Vapi Error Event:', e);
      // Extra check for microphone permission issues
      const msg = e?.message || e?.error || 'Connection error';
      if (msg.includes('NotAllowedError') || msg.includes('Permission denied')) {
        setError("Microphone access denied. Please allow microphone access in your browser settings.");
      } else {
        setError(`Vapi: ${msg}`);
      }
      setIsConnecting(false);
    };
    const onVolume = (level: number) => {
      setVolume(level);
    };

    vapiInstance.on('call-start', onCallStart);
    vapiInstance.on('call-end', onCallEnd);
    vapiInstance.on('error', onError);
    vapiInstance.on('volume-level', onVolume);

    vapiInstance.on('message', (message: any) => {
      if (message.type === 'function-call' || message.type === 'tool-call') {
        console.log('Vapi Tool Call:', message.functionCall?.name || message.toolCall?.name);
      }
    });

    // Cleanup on unmount
    return () => {
      if (vapiInstance) {
        console.log('Vapi: Cleaning up session');
        vapiInstance.removeAllListeners();
        vapiInstance.stop();
      }
    };
  }, [publicKey]);

  const startCall = async (overrides?: any) => {
    if (!vapiRef.current) {
      setError("Vapi SDK not initialized");
      return;
    }
    if (!assistantId) {
      setError("Assistant ID missing. Please check your secrets.");
      return;
    }

    try {
      console.log('Vapi: Requesting Mic and starting call...');
      setIsConnecting(true);
      setError(null);
      
      // Attempt to start the call
      await vapiRef.current.start(assistantId, overrides);
      
    } catch (err: any) {
      console.error('Vapi Start Exception:', err);
      const msg = err?.message || 'Failed to connect';
      setError(`Start Error: ${msg}`);
      setIsConnecting(false);
    }
  };

  const stopCall = async () => {
    if (!vapiRef.current) return;
    setIsConnecting(true);
    await vapiRef.current.stop();
  };

  return { isCallActive, isConnecting, volume, error, startCall, stopCall, vapi: vapiRef.current };
};
