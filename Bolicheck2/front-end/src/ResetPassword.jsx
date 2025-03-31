import React from "react";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

const ResetPassword = () => {
  useEffect(() => {
    document.title = "Reestablece tu contraseña | Bolicheck";
  }, []);
  const [email, setEmail] = useState("");
  const [blocked, setBlocked] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setBlocked(true);
      const response = await fetch("http://127.0.0.1:8080/api/password_reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success(data.message);
      } else {
        setBlocked(false);
        toast.error(data.message);
      }
    } catch {
      setBlocked(false);
      toast.error("Error al enviar la solicitud, estás conectado a internet?");
    }
  };

  return (
    <div>
      <img
        src="/rana.png"
        className="class_ranita_imagen"
        alt="Imagen de inicio"
      />
      <div className="wrapper mx-auto col-11 col-md-9 col-lg-6 col-xl-4">
        <form onSubmit={handleSubmit}>
          <p className="text-center">
            Has olvidado tu contraseña? No hay problema, escribe el correo
            asociado a tu cuenta para que podamos ayudarte.
          </p>
          <h3 style={{ fontWeight: "bold", textAlign: "center" }}>Email:</h3>
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
          <div className="link_registrarse">
            <p>
              Recuerdas tu contraseña? Vuelve al{" "}
              <a href="/login">Inicio de sesión</a>
            </p>
          </div>
          <button type="submit" className="btn h-auto" disabled={blocked}>
            Enviar correo de reestablecimiento
          </button>
        </form>
      </div>
    </div>
  );
};
export default ResetPassword;
