'use server'

import { createClient } from "@/lib/supabaseServer";
import { revalidatePath } from "next/cache";

// Simple in-memory rate limiter
const rateLimitMap = new Map<string, { count: number, resetAt: number }>();

export async function loginAction(email: string, password: string, mfaCode?: string) {
  // 1. Rate Limiting Check
  const now = Date.now();
  const rateLimitKey = email.toLowerCase();
  const record = rateLimitMap.get(rateLimitKey);

  if (record && now < record.resetAt) {
    if (record.count >= 5) {
      return { error: "Invalid credentials or account locked. Please try again later." };
    }
  }

  // Update rate limit count
  if (record && now < record.resetAt) {
    record.count++;
  } else {
    rateLimitMap.set(rateLimitKey, { count: 1, resetAt: now + 15 * 60 * 1000 }); // 15 minutes
  }

  // 2. Input Validation (Password rules)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
    return { error: "Invalid credentials." }; 
  }

  const supabase = await createClient();

  // 3. Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { error: "Invalid credentials or email unverified." };
  }

  // Clear rate limit on successful login
  rateLimitMap.delete(rateLimitKey);

  // 4. Two-Factor Authentication Check
  const aal = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  
  if (aal.data?.nextLevel === 'aal2' && aal.data?.currentLevel === 'aal1') {
    if (!mfaCode) {
      return { requireMFA: true }; 
    }

    const factors = await supabase.auth.mfa.listFactors();
    const totpFactor = factors.data?.totp[0];

    if (!totpFactor) {
      return { error: "MFA factor not found." };
    }

    const challenge = await supabase.auth.mfa.challenge({ factorId: totpFactor.id });
    if (challenge.error) return { error: "Invalid MFA code." };

    const verify = await supabase.auth.mfa.verify({
      factorId: totpFactor.id,
      challengeId: challenge.data.id,
      code: mfaCode,
    });

    if (verify.error) return { error: "Invalid MFA code." };
  }

  revalidatePath("/nexus");
  return { success: true };
}

export async function logoutAction() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/nexus");
}

export async function savePostAction(slug: string, title: string, excerpt: string, content: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("blog_posts").upsert({
    slug,
    title,
    excerpt,
    content,
    created_at: new Date().toISOString()
  });

  if (error) return { error: "Error saving post." };
  return { success: true };
}

export async function toggleMaintenanceAction(currentMode: boolean) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const newValue = !currentMode;
  const { error } = await supabase.from("site_settings").update({ is_maintenance_mode: newValue }).eq("id", 1);
  
  if (error) return { error: "Error updating setting." };
  return { success: true, newValue };
}

export async function deletePostAction(slug: string) {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Unauthorized" };

  const { error } = await supabase.from("blog_posts").delete().eq("slug", slug);
  if (error) return { error: "Error deleting post." };
  return { success: true };
}
