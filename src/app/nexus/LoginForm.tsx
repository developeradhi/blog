"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [requireMFA, setRequireMFA] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    // 1. Password Rules Validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      // Generic error for security
      setMessage("Invalid credentials.");
      setLoading(false);
      return;
    }

    if (requireMFA) {
      // Handle MFA Verification
      const challenge = await supabase.auth.mfa.challenge({ factorId });
      if (challenge.error) {
        setMessage("Invalid credentials or locked out.");
        setLoading(false);
        return;
      }

      const verify = await supabase.auth.mfa.verify({
        factorId,
        challengeId: challenge.data.id,
        code: mfaCode,
      });

      if (verify.error) {
        setMessage("Invalid credentials.");
      }
      setLoading(false);
      return;
    }

    // 2. Initial Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      // Supabase handles rate-limiting internally here, but we enforce generic errors
      setMessage("Invalid credentials or account locked.");
      setLoading(false);
      return;
    }

    // 3. MFA Detection
    const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal.data?.nextLevel === 'aal2' && aal.data?.currentLevel === 'aal1') {
      const factors = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.data?.totp[0];
      
      if (totpFactor) {
        setRequireMFA(true);
        setFactorId(totpFactor.id);
      } else {
        setMessage("Invalid credentials."); // generic fallback
      }
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
