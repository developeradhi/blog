import { createClient } from "@/lib/supabaseServer";
import AdminDashboard from "./AdminDashboard";
import LoginForm from "./LoginForm";

export default async function NexusPage() {
  const supabase = await createClient();
  
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return <LoginForm />;
  }

  return <AdminDashboard user={data.user} />;
}
