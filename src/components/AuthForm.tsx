import { useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Lock } from "lucide-react";
import { toast } from "sonner";

interface AuthFormProps {
  onLogin: (email: string, password: string) => void;
  onRegister: (name: string, email: string, password: string) => void;
}

export function AuthForm({ onLogin, onRegister }: AuthFormProps) {
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateEmail = (email: string) => {
    // Check for university email format
    return email.endsWith("usv.ro") || email.endsWith("usm.ro");
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!loginData.email) {
      newErrors.loginEmail = "Email-ul este obligatoriu";
    } else if (!validateEmail(loginData.email)) {
      newErrors.loginEmail =
        "Trebuie să folosești adresa de email universitară";
    }

    if (!loginData.password) {
      newErrors.loginPassword = "Parola este obligatorie";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onLogin(loginData.email, loginData.password);
    toast.success("Autentificare reușită!");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!registerData.name.trim()) {
      newErrors.name = "Numele este obligatoriu";
    }

    if (!registerData.email) {
      newErrors.registerEmail = "Email-ul este obligatoriu";
    } else if (!validateEmail(registerData.email)) {
      newErrors.registerEmail =
        "Trebuie să folosești adresa de email universitară";
    }

    if (!registerData.password) {
      newErrors.registerPassword = "Parola este obligatorie";
    } else if (registerData.password.length < 6) {
      newErrors.registerPassword =
        "Parola trebuie să aibă cel puțin 6 caractere";
    }

    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = "Parolele nu se potrivesc";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onRegister(registerData.name, registerData.email, registerData.password);
    toast.success("Cont creat cu succes!");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-blue-600 mx-auto mb-4">
            <svg
              viewBox="0 0 24 24"
              className="h-10 w-10 text-white"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M12 14l9-5-9-5-9 5 9 5z" />
              <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              <path d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
            </svg>
          </div>
          <h1 className="mb-2">UniPlans</h1>
          <p className="text-gray-600">
            Sistem de Management al Evenimentelor Universitare
          </p>
        </div>

        {/* Auth Form */}
        <div className="bg-white rounded-lg shadow-lg p-6 border">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Autentificare</TabsTrigger>
              <TabsTrigger value="register">Înregistrare</TabsTrigger>
            </TabsList>

            {/* Login Tab */}
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email universitar</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="nume.prenume@student.usv.ro"
                    value={loginData.email}
                    onChange={(e) => {
                      setLoginData({ ...loginData, email: e.target.value });
                      setErrors({ ...errors, loginEmail: "" });
                    }}
                    className={errors.loginEmail ? "border-red-500" : ""}
                  />
                  {errors.loginEmail && (
                    <p className="text-sm text-red-500">{errors.loginEmail}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="login-password">Parolă</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${
                        errors.loginPassword ? "border-red-500" : ""
                      }`}
                      value={loginData.password}
                      onChange={(e) => {
                        setLoginData({
                          ...loginData,
                          password: e.target.value,
                        });
                        setErrors({ ...errors, loginPassword: "" });
                      }}
                    />
                  </div>
                  {errors.loginPassword && (
                    <p className="text-sm text-red-500">
                      {errors.loginPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Autentificare
                </Button>

                <div className="text-center">
                  <Button variant="link" className="text-sm text-blue-600">
                    Ai uitat parola?
                  </Button>
                </div>
              </form>
            </TabsContent>

            {/* Register Tab */}
            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nume complet</Label>
                  <Input
                    id="register-name"
                    type="text"
                    placeholder="Nume Prenume"
                    value={registerData.name}
                    onChange={(e) => {
                      setRegisterData({
                        ...registerData,
                        name: e.target.value,
                      });
                      setErrors({ ...errors, name: "" });
                    }}
                    className={errors.name ? "border-red-500" : ""}
                  />
                  {errors.name && (
                    <p className="text-sm text-red-500">{errors.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-email">Email universitar</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="nume.prenume@student.usv.ro"
                    value={registerData.email}
                    onChange={(e) => {
                      setRegisterData({
                        ...registerData,
                        email: e.target.value,
                      });
                      setErrors({ ...errors, registerEmail: "" });
                    }}
                    className={errors.registerEmail ? "border-red-500" : ""}
                  />
                  {errors.registerEmail && (
                    <p className="text-sm text-red-500">
                      {errors.registerEmail}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Parolă</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${
                        errors.registerPassword ? "border-red-500" : ""
                      }`}
                      value={registerData.password}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          password: e.target.value,
                        });
                        setErrors({ ...errors, registerPassword: "" });
                      }}
                    />
                  </div>
                  {errors.registerPassword && (
                    <p className="text-sm text-red-500">
                      {errors.registerPassword}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmă parola</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className={`pl-10 ${
                        errors.confirmPassword ? "border-red-500" : ""
                      }`}
                      value={registerData.confirmPassword}
                      onChange={(e) => {
                        setRegisterData({
                          ...registerData,
                          confirmPassword: e.target.value,
                        });
                        setErrors({ ...errors, confirmPassword: "" });
                      }}
                    />
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-500">
                      {errors.confirmPassword}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Creează cont
                </Button>

                <p className="text-xs text-gray-500 text-center">
                  Prin crearea contului, ești de acord cu termenii și condițiile
                  platformei
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-500 mt-6">
          © 2025 Universitatea din Suceava. Toate drepturile rezervate.
        </p>
      </div>
    </div>
  );
}
