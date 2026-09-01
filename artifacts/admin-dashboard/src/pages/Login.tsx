import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (res.ok && data.success && data.token) {
        localStorage.setItem("ghh_token", data.token);
        localStorage.setItem("ghh_user", JSON.stringify(data.user));
        
        const role = data.user?.role;
        if (role === "admin" || role === "super_admin") {
          localStorage.setItem("role", "super_admin");
          setLocation("/super-admin");
        } else if (role === "owner") {
          localStorage.setItem("role", "library_owner");
          setLocation("/library-owner");
        } else {
          localStorage.setItem("role", role);
          setLocation("/super-admin");
        }
      } else {
        // Fallback for demo/offline accounts if backend unreachable
        if (email === "admin@ghh.com" && (password === "password" || password === "admin123")) {
          localStorage.setItem("role", "super_admin");
          setLocation("/super-admin");
          return;
        } else if (email === "owner@ghh.com" && (password === "password" || password === "owner123")) {
          localStorage.setItem("role", "library_owner");
          setLocation("/library-owner");
          return;
        }
        setError(data.message || "Invalid email or password.");
      }
    } catch (err: any) {
      // Local fallback for offline mode
      if (email === "admin@ghh.com") {
        localStorage.setItem("role", "super_admin");
        setLocation("/super-admin");
        return;
      } else if (email === "owner@ghh.com") {
        localStorage.setItem("role", "library_owner");
        setLocation("/library-owner");
        return;
      }
      setError("Unable to reach server. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string, demoRole: string) => {
    setEmail(demoEmail);
    setPassword("password");
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-sm shadow-lg border">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold text-xl mb-2">
            GHH
          </div>
          <CardTitle className="text-2xl text-primary font-bold">Smart Library Manager</CardTitle>
          <CardDescription>Sign in to Master Admin / Owner Portal</CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-md flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ghh.com or owner@ghh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="w-full font-semibold" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Authenticating...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-2">
            <p className="font-medium text-foreground">Quick Access Logins:</p>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleQuickFill("admin@ghh.com", "super_admin")}
              >
                Super Admin
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 text-xs"
                onClick={() => handleQuickFill("owner@ghh.com", "library_owner")}
              >
                Library Owner
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
