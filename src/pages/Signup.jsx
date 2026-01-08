import React, { useState } from "react";
import { useNavigate } from "react-router";
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import signup_background from "../assets/login_background.jpg";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    try {
      const userData = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      const user = userData.user;
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("token", user.accessToken);

      toast.success("Signup successful!");
      navigate("/admin");
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <section
      className="h-screen bg-cover bg-center flex items-center"
      style={{
        backgroundImage: `url(${signup_background})`,
      }}
    >
      <div className="container mx-auto">
        <div className="signup_main py-10">
          <div className="w-[350px] bg-white/20 backdrop-blur-md border border-white/30 rounded-xl shadow-lg p-6 mx-auto">
            <h1 className="text-4xl text-white text-center mb-4">
              Create Account
            </h1>

            <form onSubmit={handleSignup} className="flex flex-col gap-3">
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
                  className="absolute right-3 top-2 cursor-pointer text-white"
                >
                  {showPassword ? "Hide" : "Show"}
                </span>
              </div>

              <button
                className="bg-violet-500 hover:bg-violet-600 text-white py-2 rounded"
                type="submit"
              >
                Sign Up
              </button>
            </form>

            <p className="mt-3 text-center text-white">
              Already have an account?{" "}
              <span
                onClick={() => navigate("/")}
                className="underline cursor-pointer"
              >
                Login
              </span>
            </p>
          </div>
        </div>
      </div>

      <ToastContainer position="top-right" autoClose={3000} />
    </section>
  );
}

export default Signup;
