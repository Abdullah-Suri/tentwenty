"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 lg:px-24">
        <div className="w-full max-w-[300px] space-y-[40px]">
          <div className="space-y-2">
            <h1 className="text-[32px] font-bold tracking-tight text-foreground">Welcome back</h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-0">
            <div className="space-y-[8px]">
              <Label htmlFor="email" className="text-[14px] font-medium text-muted-foreground">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[44px] rounded-[8px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="mt-[40px] space-y-[12px]">
              <Label htmlFor="password" className="text-[14px] font-medium text-muted-foreground">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-[44px] rounded-[8px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF]"
              />
            </div>

            <div className="mt-[20px] flex items-center space-x-2">
              <Checkbox id="remember" className="border-[#1859F1] data-[state=checked]:bg-[#1859F1]" />
              <Label
                htmlFor="remember"
                className="text-[14px] font-medium leading-none text-muted-foreground cursor-pointer"
              >
                Remember me
              </Label>
            </div>

            {error && (
              <p className="mt-4 text-sm font-medium text-destructive">{error}</p>
            )}

            <Button
              type="submit"
              className="mt-[24px] w-full h-[44px] bg-[#1859F1] hover:bg-[#154ed1] text-white text-[14px] font-semibold rounded-[8px]"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-[#1859F1] p-12 text-white">
        <div className="max-w-[440px] space-y-6">
          <h2 className="text-[64px] font-bold leading-tight">ticktock</h2>
          <p className="text-[18px] leading-[1.6] opacity-90 font-medium">
            Introducing ticktock, our cutting-edge timesheet web application designed to revolutionize how you manage employee work hours. With ticktock, you can effortlessly track and monitor employee attendance and productivity from anywhere, anytime, using any internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}
