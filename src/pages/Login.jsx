import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, googleProvider } from "../firebaseConfig";
import {
  signInWithEmailAndPassword,
  signInWithPopup,
  sendPasswordResetEmail,
} from "firebase/auth";

import login_background from "../assets/login_background.jpg";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
const ADMIN_EMAIL = "faiz53308@gmail.com";
function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  // Email Login
const handleLogin = async (e) => {
  e.preventDefault();

  // ❌ Email restriction
  if (email !== ADMIN_EMAIL) {
    toast.error("Unauthorized admin access");
    return;
  }

  try {
    const res = await signInWithEmailAndPassword(auth, email, password);
    const user = res.user;

    localStorage.setItem("uid", user.uid);
    localStorage.setItem("token", user.accessToken);
    localStorage.setItem("role", "admin");

    toast.success("Admin login successful!");
    navigate("/admin");
  } catch (err) {
  console.log(err.code, err.message);

  if (err.code === "auth/user-not-found") {
    toast.error("User not found");
  } 
  else if (
    err.code === "auth/wrong-password" ||
    err.code === "auth/invalid-credential" ||
    err.code === "auth/invalid-login-credentials"
  ) {
    toast.error("Invalid email or password");
  } 
  else if (err.code === "auth/invalid-email") {
    toast.error("Invalid email format");
  } 
  else if (err.code === "auth/too-many-requests") {
    toast.error("Too many attempts. Try later.");
  } 
  else {
    toast.error(err.message);
  }
}
};


  // Google Login
 const handleGoogleLogin = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    if (user.email !== ADMIN_EMAIL) {
      toast.error("Unauthorized Google account");
      await auth.signOut();
      return;
    }

    localStorage.setItem("uid", user.uid);
    localStorage.setItem("token", user.accessToken);
    localStorage.setItem("role", "admin");

    toast.success("Admin Google Login Successful!");
    navigate("/admin");
  } catch (err) {
    toast.error(err.message);
  }
};


  // Reset Password
  const handlePasswordReset = async () => {
    if (!email) {
      toast.warn("Enter your email first.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      toast.success("Password reset link sent.");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section
      className="h-screen bg-cover bg-center flex items-center"
      style={{ backgroundImage: `url(${login_background})` }}
    >
      <div className="container mx-auto">
        <div className="login_main py-10">
          <div className="w-[350px] bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-lg p-6 mx-auto">
            <h1 className="text-4xl text-white text-center mb-4">STUVELY</h1>

            <form onSubmit={handleLogin} className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email"
                className="p-2 border border-violet-400 rounded"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  className="p-2 border border-violet-400 rounded w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />

                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2 cursor-pointer text-black"
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>

              <div
                onClick={handlePasswordReset}
                className="text-white cursor-pointer hover:underline"
              >
                Forget Password?
              </div>

              <button
                className="bg-violet-500 hover:bg-violet-600 text-white py-2 rounded"
                type="submit"
              >
                Login
              </button>
            </form>

            <button
              onClick={handleGoogleLogin}
              className="mt-3 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded"
            >
              Login with Google
            </button>

            <Link
              to="/signup"
              className="block w-full text-white py-2 text-center rounded bg-purple-500 mt-4"
            >
              If you have no account Signup
            </Link>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
}

export default Login;
