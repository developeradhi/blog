"use client";

import { useState } from "react";
import { loginAction } from "./actions";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [requireMFA, setRequireMFA] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const res = await loginAction(email, password, requireMFA ? mfaCode : undefined);
    
    if (res?.error) {
      setMessage(res.error);
    } else if (res?.requireMFA) {
      setRequireMFA(true);
    } else if (res?.success) {
      // successful login, the server revalidated the path so page will refresh!
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
      <h1 className="text-3xl font-bold text-white">Admin Secure Auth</h1>
      <form onSubmit={handleLogin} className="flex flex-col gap-4 w-full max-w-sm">
        <input 
          type="email" 
          placeholder="Admin Email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={requireMFA}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
          required
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          disabled={requireMFA}
          className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50"
          required
        />
        
        {requireMFA && (
          <div className="flex flex-col gap-2 mt-4 p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-lg">
            <label className="text-sm text-emerald-400 font-bold">Two-Factor Authentication Required</label>
            <input 
              type="text" 
              placeholder="6-Digit TOTP Code" 
              value={mfaCode}
              onChange={(e) => setMfaCode(e.target.value)}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none"
              required
            />
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors mt-2 disabled:opacity-50"
        >
          {loading ? "Authenticating..." : requireMFA ? "Verify Code" : "Login"}
        </button>
        {message && <p className="text-red-400 text-sm text-center mt-2">{message}</p>}
      </form>
    </div>
  );
}
