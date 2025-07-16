import { useState } from "react";
import axios from "axios";

export default function AuthPage({ setIsLoggedIn }) {
  const [isLogin, setIsLogin] = useState(true);

  const [loginData, setLoginData] = useState({
    username: "",
    password: "",
  });

  const [signupData, setSignupData] = useState({
    fullname: "",
    username: "",
    password: "",
  });

const handleLogin = async (e) => {
  e.preventDefault();
  if (loginData.username && loginData.password) {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", loginData);
      localStorage.setItem("username", loginData.username);
      setIsLoggedIn(true);  // this will switch routes
    } catch (err) {
      alert(err.response.data.message || "Login failed");
    }
  } else {
    alert("Please fill in all fields.");
  }
};






const handleSignup = async (e) => {
  e.preventDefault();
  if (signupData.fullname && signupData.username && signupData.password) {
    try {
      const res = await axios.post("http://localhost:5000/api/auth/signup", signupData);
      localStorage.setItem("username", signupData.username);
      setIsLoggedIn(true);
      window.location.href = "/profile"; // ✅ Redirect after signup
    } catch (err) {
      alert(err.response.data.message || "Signup failed");
    }
  } else {
    alert("Please fill in all fields.");
  }
};



  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
      <div className="bg-white p-8 w-full max-w-sm border rounded">
        <h1
          className="text-5xl font-logo text-center mb-8"
          style={{
            fontFamily: "'Grand Hotel', cursive",
          }}
        >
          Instagram
        </h1>

        {isLogin ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Username"
              value={loginData.username}
              onChange={(e) =>
                setLoginData({ ...loginData, username: e.target.value })
              }
              className="border px-3 py-2 rounded bg-gray-50"
            />
            <input
              type="password"
              placeholder="Password"
              value={loginData.password}
              onChange={(e) =>
                setLoginData({ ...loginData, password: e.target.value })
              }
              className="border px-3 py-2 rounded bg-gray-50"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600"
            >
              Log In
            </button>
            <div className="text-center">
              <a href="#" className="text-sm text-blue-500 hover:underline">
                Forgot password?
              </a>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="Full Name"
              value={signupData.fullname}
              onChange={(e) =>
                setSignupData({ ...signupData, fullname: e.target.value })
              }
              className="border px-3 py-2 rounded bg-gray-50"
            />
            <input
              type="text"
              placeholder="Username"
              value={signupData.username}
              onChange={(e) =>
                setSignupData({ ...signupData, username: e.target.value })
              }
              className="border px-3 py-2 rounded bg-gray-50"
            />
            <input
              type="password"
              placeholder="Password"
              value={signupData.password}
              onChange={(e) =>
                setSignupData({ ...signupData, password: e.target.value })
              }
              className="border px-3 py-2 rounded bg-gray-50"
            />

            <p className="text-xs text-gray-500 text-center">
              People who use our service may have uploaded your contact
              information to Instagram.{" "}
              <span className="text-blue-500 hover:underline">Learn More</span>
            </p>
            <p className="text-xs text-gray-500 text-center">
              By signing up, you agree to our{" "}
              <span className="text-blue-500 hover:underline">
                Terms
              </span>
              ,{" "}
              <span className="text-blue-500 hover:underline">
                Privacy Policy
              </span>{" "}
              and{" "}
              <span className="text-blue-500 hover:underline">
                Cookies Policy
              </span>
              .
            </p>

            <button
              type="submit"
              className="bg-blue-500 text-white py-2 rounded font-semibold hover:bg-blue-600"
            >
              Sign Up
            </button>
          </form>
        )}
      </div>

      <div className="bg-white border p-4 w-full max-w-sm text-center mt-4">
        {isLogin ? (
          <p className="text-sm">
            Don't have an account?{" "}
            <span
              onClick={() => setIsLogin(false)}
              className="text-blue-500 font-semibold cursor-pointer"
            >
              Sign up
            </span>
          </p>
        ) : (
          <p className="text-sm">
            Have an account?{" "}
            <span
              onClick={() => setIsLogin(true)}
              className="text-blue-500 font-semibold cursor-pointer"
            >
              Log in
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
