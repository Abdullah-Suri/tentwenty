"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { goeyToast } from "goey-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (res?.error) {
        goeyToast.error("Invalid email or password", {
          description: "Please check your credentials and try again.",
        });
      } else {
        goeyToast.success("Welcome back!", {
          description: "You have successfully signed in.",
        });
        router.push("/");
        router.refresh();
      }
    } catch (err) {
      goeyToast.error("An unexpected error occurred", {
        description: "Something went wrong. Please try again later.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col lg:flex-row">
      {/* Left Side - Login Form */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-6 py-12 lg:px-24">
        <div className="w-full max-w-4xl space-y-[40px]">
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
                className="h-[44px] rounded-[8px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-primary"
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
                className="h-[44px] rounded-[8px] border-[#E5E7EB] text-[14px] placeholder:text-[#9CA3AF] focus-visible:ring-primary"
              />
            </div>

            <div className="mt-[40px] flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="remember"
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="remember" className="text-sm font-medium text-muted-foreground cursor-pointer">
                  Remember me
                </Label>
              </div>
            </div>

            <Button
              type="submit"
              className="mt-[40px] w-full h-[48px] bg-primary hover:bg-primary-light text-white font-bold rounded-[8px] transition-colors"
              disabled={loading}
            >
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Branding */}
      <div className="hidden lg:flex flex-1 flex-col items-center justify-center bg-primary p-12 text-white">
        <div className="w-full space-y-4">
          <h2 className="text-[64px] font-semibold leading-tight">ticktock</h2>
          <p className="leading-[1.6] opacity-90 max-w-4xl">
            Introducing ticktock, our cutting-edge timesheet web application designed to revolutionize how you manage employee work hours. With ticktock, you can effortlessly track and monitor employee attendance and productivity from anywhere, anytime, using any internet-connected device.
          </p>
        </div>
      </div>
    </div>
  );
}
