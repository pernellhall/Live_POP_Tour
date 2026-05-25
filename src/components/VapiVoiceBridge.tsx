import { useVapi } from '../hooks/useVapi';

const VapiVoiceBridge = () => {
  // Replace with your actual Vapi keys (store in .env)
  const publicKey = (import.meta as any).env.VITE_VAPI_PUBLIC_KEY;
  const assistantId = (import.meta as any).env.VITE_VAPI_ASSISTANT_ID;

  const { isCallActive, error, startCall, stopCall } = useVapi(publicKey, assistantId);

  return (
    <div className="voice-bridge fixed bottom-6 right-6 z-[100]">
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-2 rounded mb-2">
          Error: {error}
        </div>
      )}
      <button 
        onClick={isCallActive ? stopCall : () => startCall()}
        className={`px-6 py-3 rounded-full font-bold transition-all shadow-lg ${
          isCallActive 
            ? 'bg-zinc-800 text-white hover:bg-zinc-700' 
            : 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)]'
        }`}
      >
        {isCallActive ? 'Stop Conversation' : 'Talk to Executive Assistant'}
      </button>
      {isCallActive && (
        <div className="text-center mt-2 text-xs text-zinc-400 animate-pulse uppercase tracking-widest font-bold">
          🎙️ Agent is listening...
        </div>
      )}
    </div>
  );
};

export default VapiVoiceBridge;
