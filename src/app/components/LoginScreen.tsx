import { useState } from "react";
import { User } from "@/app/types";
import { login } from "@/app/services/authService";
import { MapPin, Mail, Lock, Eye, EyeOff } from "lucide-react";

interface LoginScreenProps {
  onLogin: (user: User) => void;
  onBack?: () => void;
  onShowRegister?: () => void;
  onShowForgotPassword?: () => void;
}

export function LoginScreen({
  onLogin,
  onBack,
  onShowRegister,
  onShowForgotPassword,
}: LoginScreenProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      // Call API service
      const response = await login({ email, password });

      if (response.success && response.data) {
        onLogin(response.data.user);
      } else {
        setError(response.error || "Đăng nhập thất bại");
      }
    } catch (err) {
      setError("Có lỗi xảy ra. Vui lòng thử lại");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Simulate Google login - auto login as customer
      const response = await login({
        email: "customer@demo.com",
        password: "1",
      });

      if (response.success && response.data) {
        onLogin(response.data.user);
      }
    } catch (err) {
      setError("Đăng nhập Google thất bại");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-20">
      <div className="max-w-md w-full mx-auto px-4">
        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Đăng nhập
          </h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@email.com"
                  className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-11 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600 text-center">
                  {error}
                </p>
              </div>
            )}

            {/* Remember & Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-gray-600">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Quên mật khẩu?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-gray-500">
                Hoặc đăng nhập với
              </span>
            </div>
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Đăng nhập bằng Google
          </button>

          {/* Sign Up Link */}
          <p className="mt-6 text-center text-sm text-gray-600">
            Chưa có tài khoản?{" "}
            <button
              onClick={onShowRegister}
              className="text-blue-600 hover:text-blue-700 font-semibold"
            >
              Đăng ký ngay
            </button>
          </p>

          {/* Back to Home */}
          {onBack && (
            <button
              onClick={onBack}
              className="mt-4 w-full py-2 text-gray-600 hover:text-gray-900 transition-colors text-sm"
            >
              ← Quay về trang chủ
            </button>
          )}

          {/* Demo Info */}
          <div className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2.5">
            <div className="flex items-center justify-between">
              <p className="text-xs text-blue-950 font-bold flex items-center gap-1.5">
                <span>🔑</span> Tài khoản mẫu thử nghiệm (Mật khẩu: <code>1</code>):
              </p>
              <span className="text-[10px] text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full font-medium">
                Bấm để điền nhanh
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {/* Lead Company */}
              <div
                onClick={() => {
                  setEmail("viettravel.tour@gmail.com");
                  setPassword("1");
                }}
                className="p-2 bg-white rounded-lg border border-blue-200 hover:border-blue-400 hover:bg-blue-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-gray-900 group-hover:text-blue-700 block">
                    🏢 Viettravel (Đơn vị Chủ trì):
                  </span>
                  <code className="text-[11px] text-blue-600 font-mono">
                    viettravel.tour@gmail.com
                  </code>
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-blue-600 font-medium">
                  Chọn ➔
                </span>
              </div>

              {/* Partner Company */}
              <div
                onClick={() => {
                  setEmail("hagiang.discovery@gmail.com");
                  setPassword("1");
                }}
                className="p-2 bg-white rounded-lg border-2 border-emerald-300 hover:border-emerald-500 hover:bg-emerald-50/50 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="font-bold text-emerald-950 group-hover:text-emerald-700 block">
                    🏔️ Hà Giang Discovery (Đối tác Liên minh):
                  </span>
                  <code className="text-[11px] text-emerald-700 font-mono font-bold">
                    hagiang.discovery@gmail.com
                  </code>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">
                  Test Báo giá &amp; Chặng
                </span>
              </div>

              {/* Customer */}
              <div
                onClick={() => {
                  setEmail("khachhang.fpt@gmail.com");
                  setPassword("1");
                }}
                className="p-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 hover:bg-purple-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-gray-900 group-hover:text-purple-700 block">
                    👤 Khách hàng (Tập đoàn FPT):
                  </span>
                  <code className="text-[11px] text-purple-600 font-mono">
                    khachhang.fpt@gmail.com
                  </code>
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-purple-600 font-medium">
                  Xem Tour ➔
                </span>
              </div>

              {/* Service Provider */}
              <div
                onClick={() => {
                  setEmail("provider.heritage@gmail.com");
                  setPassword("1");
                }}
                className="p-2 bg-white rounded-lg border border-teal-200 hover:border-teal-400 hover:bg-teal-50/50 cursor-pointer transition-all flex items-center justify-between group shadow-2xs"
              >
                <div>
                  <span className="font-bold text-gray-900 group-hover:text-teal-700 block">
                    🏨 Đối tác Cung cấp Dịch vụ (Heritage):
                  </span>
                  <code className="text-[11px] text-teal-600 font-mono font-bold">
                    provider.heritage@gmail.com
                  </code>
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-100 px-1.5 py-0.5 rounded">
                  Quản lý DV ➔
                </span>
              </div>

              {/* Admin */}
              <div
                onClick={() => {
                  setEmail("admin.platform@gmail.com");
                  setPassword("1");
                }}
                className="p-2 bg-white rounded-lg border border-amber-200 hover:border-amber-400 hover:bg-amber-50/50 cursor-pointer transition-all flex items-center justify-between group"
              >
                <div>
                  <span className="font-bold text-gray-900 group-hover:text-amber-800 block">
                    🛡️ Admin Sàn (Quyết toán Ký quỹ Escrow):
                  </span>
                  <code className="text-[11px] text-amber-700 font-mono">
                    admin.platform@gmail.com
                  </code>
                </div>
                <span className="text-[10px] text-gray-400 group-hover:text-amber-700 font-medium">
                  Chia tiền ➔
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}