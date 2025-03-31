import React from "react";
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";

const ChangePassword = () => {
  useEffect(() => {
      document.title = "Reestablece tu contraseña | Bolicheck"
    }, [])
  const { uid, token } = useParams();
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password != passwordConfirm) {
      toast.error("Tus contraseñas no coinciden.");
    } else if (password.length < 6) {
      toast.error("Tu contraseña no puede tener menos de 6 carácteres.");
    } else {
      try {
        const response = await fetch(
          `http://127.0.0.1:8080/api/password_reset_confirm/${uid}/${token}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ password: password }),
          }
        );
        const data = await response.json();
        if (response.ok) {
          toast.success(data.message);
          navigate("/login");
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error(
          "Error al enviar la solicitud, estás conectado a internet?"
        );
      }
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
            Escribe tu nueva contraseña, hazla segura y con mínimo 6 carácteres,
            recuérdala.
          </p>
          <div className="input_box">
            <input
              type="password"
              name="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <i className="bx bx-lock"></i>
          </div>
          <div className="input_box">
            <input
              type="password"
              name="password"
              placeholder="Confirma tu contraseña"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
            />
            <i className="bx bx-lock"></i>
          </div>
          <button type="submit" className="btn">
            Reestablecer contraseña
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
