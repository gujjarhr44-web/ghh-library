import { useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export default function Login() {
  const [, setLocation] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("password");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "admin@ghh.com") {
      localStorage.setItem("role", "super_admin");
      setLocation("/super-admin");
    } else if (email === "owner@ghh.com") {
      localStorage.setItem("role", "library_owner");
      setLocation("/library-owner");
    } else {
      alert("Invalid mock account. Try admin@ghh.com or owner@ghh.com");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-muted/30">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl text-primary">GHH Library Admin</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@ghh.com or owner@ghh.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>
          <div className="mt-6 text-sm text-center text-muted-foreground">
            <p>Mock accounts:</p>
            <p><strong>admin@ghh.com</strong> (Super Admin)</p>
            <p><strong>owner@ghh.com</strong> (Library Owner)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
