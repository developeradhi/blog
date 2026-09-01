"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const RATE_LIMIT_KEY = "nexus_login_attempts";
const MAX_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;

function getRateLimitState(): { attempts: number; lockedUntil: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return { attempts: 0, lockedUntil: 0 };
}

function setRateLimitState(state: { attempts: number; lockedUntil: number }) {
  localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(state));
}

function resetRateLimit() {
  localStorage.removeItem(RATE_LIMIT_KEY);
}

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mfaCode, setMfaCode] = useState("");
  const [requireMFA, setRequireMFA] = useState(false);
  const [factorId, setFactorId] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);

  // Countdown timer for lockout
  useEffect(() => {
    const { lockedUntil } = getRateLimitState();
    if (lockedUntil > Date.now()) {
      const tick = () => {
        const remaining = Math.ceil((lockedUntil - Date.now()) / 1000);
        if (remaining <= 0) {
          setLockoutSeconds(0);
          resetRateLimit();
        } else {
          setLockoutSeconds(remaining);
          setTimeout(tick, 1000);
        }
      };
      tick();
    }
  }, []);

  const isLockedOut = lockoutSeconds > 0;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLockedOut) return;

    // Rate limit check
    const state = getRateLimitState();
    if (state.lockedUntil > Date.now()) {
      setLockoutSeconds(Math.ceil((state.lockedUntil - Date.now()) / 1000));
      setMessage(`Too many attempts. Try again in ${LOCKOUT_MINUTES} minutes.`);
      return;
    }

    setLoading(true);
    setMessage("");

    if (requireMFA) {
      // MFA Verification step
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

    // Primary authentication — no client-side password rules on login
    // (password rules only enforced on account creation/change, not here)
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      // Increment attempt counter
      const newAttempts = state.attempts + 1;
      if (newAttempts >= MAX_ATTEMPTS) {
        const lockedUntil = Date.now() + LOCKOUT_MINUTES * 60 * 1000;
        setRateLimitState({ attempts: newAttempts, lockedUntil });
        setLockoutSeconds(LOCKOUT_MINUTES * 60);
        setMessage(`Too many failed attempts. Locked for ${LOCKOUT_MINUTES} minutes.`);
      } else {
        setRateLimitState({ attempts: newAttempts, lockedUntil: 0 });
        setMessage(`Invalid credentials. ${MAX_ATTEMPTS - newAttempts} attempt(s) remaining.`);
      }
      setLoading(false);
      return;
    }

    // Reset rate limit on success
    resetRateLimit();

    // MFA detection
    const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
    if (aal.data?.nextLevel === "aal2" && aal.data?.currentLevel === "aal1") {
      const factors = await supabase.auth.mfa.listFactors();
      const totpFactor = factors.data?.totp[0];
      if (totpFactor) {
        setRequireMFA(true);
        setFactorId(totpFactor.id);
      } else {
        setMessage("Invalid credentials.");
      }
    }

    setLoading(false);
  };

  const lockoutMinutes = Math.floor(lockoutSeconds / 60);
  const lockoutSecs = lockoutSeconds % 60;

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6 px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center gap-2 mb-8">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-2">
            <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          </div>
          <h1 className="text-2xl font-bold text-white">NEXUS Admin</h1>
          <p className="text-sm text-neutral-500">Secure access only</p>
        </div>

        {isLockedOut ? (
          <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
            <p className="text-red-400 font-bold text-lg mb-1">Account Locked</p>
            <p className="text-red-300 text-sm mb-3">Too many failed attempts.</p>
            <p className="text-white font-mono text-2xl">
              {String(lockoutMinutes).padStart(2, "0")}:{String(lockoutSecs).padStart(2, "0")}
            </p>
            <p className="text-neutral-500 text-xs mt-2">Try again after the timer expires.</p>
          </div>
        ) : (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input
              type="email"
              placeholder="Admin Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={requireMFA || loading}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50 w-full"
              required
              autoComplete="email"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={requireMFA || loading}
              className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white focus:border-emerald-500 outline-none disabled:opacity-50 w-full"
              required
              autoComplete="current-password"
            />

            {requireMFA && (
              <div className="flex flex-col gap-2 mt-2 p-4 border border-emerald-500/30 bg-emerald-500/10 rounded-lg">
                <label className="text-xs text-emerald-400 font-bold uppercase tracking-wide">Two-Factor Authentication</label>
                <p className="text-xs text-neutral-400">Enter the 6-digit code from your authenticator app.</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  placeholder="000000"
                  value={mfaCode}
                  onChange={(e) => setMfaCode(e.target.value.replace(/\D/g, ""))}
                  className="bg-neutral-900 border border-neutral-800 rounded-lg p-3 text-white text-center text-xl font-mono tracking-widest focus:border-emerald-500 outline-none"
                  required
                  autoComplete="one-time-code"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-emerald-500 text-black font-bold py-3 rounded-lg hover:bg-emerald-400 transition-colors mt-2 disabled:opacity-50 w-full"
            >
              {loading ? "Authenticating..." : requireMFA ? "Verify 2FA Code" : "Sign In"}
            </button>

            {message && (
              <p className={`text-sm text-center mt-1 ${message.includes("Invalid") || message.includes("Too many") ? "text-red-400" : "text-emerald-400"}`}>
                {message}
              </p>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
