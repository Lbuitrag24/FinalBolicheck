import { useState, useEffect } from "react";
import "./css/Bootstrap.css";
import { toast } from "react-toastify";

const Login = () => {
  useEffect(() => {
    document.title = "Login | Bolicheck";
    if (localStorage.getItem("logoutMessage")) {
      toast.warning(localStorage.getItem("logoutMessage"));
      localStorage.removeItem("logoutMessage");
    }
  }, []);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch("http://localhost:8080/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
      if (response.ok) {
        const data = await response.json();
        localStorage.setItem("refresh_token", data.refresh);
        localStorage.setItem("token", data.access);
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("telephone", data.user.telephone);
        localStorage.setItem("identification", data.user.identification);
        localStorage.setItem("points", data.user.points);
        localStorage.setItem("id", data.user.id);
        localStorage.setItem("is_staff", data.user.is_staff);
        localStorage.setItem("is_superuser", data.user.is_super);
        localStorage.setItem("first_name", data.user.first_name);
        localStorage.setItem("last_name", data.user.last_name);
        localStorage.setItem("photo", data.user.photo);
        setError("");
        if (data.user.is_super && data.user.is_staff) {
          window.location.href = "/admin/dashboard";
        } else if (data.user.is_staff) {
          window.location.href = "/employee/dashboard";
        } else {
          window.location.href = "/client/dashboard";
        }
      } else if (response.status == 400) {
        const data = await response.json();
        setError(data.non_field_errors);
      }
    } catch (error) {
      console.error("Hubo un error en la solicitud: ", error);
      setError("Hubo un error en la solicitud.");
    }
  };

  return (
    <div className="d-flex justify-content-center">
      <a href="/">
      <img
        src="/rana.png"
        className="class_ranita_imagen"
        alt="Imagen de inicio"
      />
      </a>
      <div className="wrapper mx-auto col-11 col-md-9 col-lg-6 col-xl-4">
      <form className="mx-auto col-12" onSubmit={handleSubmit}>
        <h1 style={{ fontWeight: "bold" }}>Iniciar Sesión</h1>
        {error && (
          <h6 style={{ color: "red" }} className="text-center w-100">
            {error}
          </h6>
        )}
        <div className="input_box">
          <input
            type="email"
            name="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <i className="bx bx-user"></i>
          <br />
        </div>
        <div className="input_box">
          <input
            type="password"
            id="password"
            name="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <i className="bx bx-lock-open-alt toggle-password" />
        </div>
        <a
          href="/reset-password-form"
          style={{ textDecoration: "none", color: "white" }}
        >
          <p className="text-center">Has olvidado tu contraseña?</p>
        </a>
        <button type="submit" className="btn">
          Iniciar sesión
        </button>
        <div className="link_registrarse">
          <p>
            ¿No tienes una cuenta? <a href="/register">Regístrate</a>
          </p>
        </div>
      </form>
      </div>
    </div>
  );
};

export default Login;