import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const NewUser = () => {
  useEffect(() => {
    document.title = "Crear Nuevo Usuario | Bolicheck";
  }, []);
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [is_staff, setIsStaff] = useState(false);
  const [telephone_number, setTelephone] = useState(null);
  const [identification_number, setIdentification] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [telerror, setTelrror] = useState("");
  const [emailerror, setEmailerror] = useState("");
  const [iderror, setIderror] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] =
    useState(false);
  const navigate = useNavigate();
  const togglePasswordVisibility = (field) => {
    if (field === "password") {
      setPasswordVisible(!passwordVisible);
    } else if (field === "password_confirmation") {
      setPasswordConfirmationVisible(!passwordConfirmationVisible);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
      setPasswordError("Las contraseñas no coinciden.");
      return;
    }

    setError("");
    setTelrror("");
    setEmailerror("");
    setIderror("");
    setPasswordError("");

    try {
      const response = await fetchWithAuth(
        "http://127.0.0.1:8080/api/admin/register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            first_name,
            last_name,
            password,
            username,
            email,
            telephone_number,
            identification_number,
            is_staff,
          }),
        }
      );
      if (response.ok) {
        const data = await response.json();
        navigate("/admin/users");
      } else {
        const errorData = await response.json();
        errorData.username ? setError(errorData.username) : setError("");
        errorData.telephone_number
          ? setTelrror(errorData.telephone_number[0])
          : setTelrror("");
        errorData.identification_number
          ? setIderror(errorData.identification_number[0])
          : setIderror("");
        errorData.email ? setEmailerror(errorData.email[0]) : setEmailerror("");
        setSuccess("");
      }
    } catch (error) {
      toast.error(
        "No ha sido posible crear al usuario, estás conectado a internet?"
      );
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="col-12 col-lg-7 mx-auto h-auto rounded-4 form-style p-2">
        <h1 className="text-center mt-3">Crear un nuevo usuario</h1>
        {success && (
          <p style={{ color: "green" }} className="text-center">
            {success}
          </p>
        )}
        <form
          id="register-form"
          className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column"
          onSubmit={handleSubmit}
        >
          <div className="d-flex flex-column">
            <label for="first_name" className="text-center col-12">
              Nombre del usuario:
            </label>
            <input
              value={first_name}
              className="form-control mx-auto"
              onChange={(e) => setFirstName(e.target.value)}
              type="text"
              id="first_name"
              name="first_name"
              required
              maxLength="30"
              pattern="[A-Za-z\s]+"
              title="Ingrese solo letras"
            />
          </div>
          <br />
          <div className="d-flex flex-column">
            <label for="last_name" className="text-center col-12">
              Apellido del usuario:
            </label>
            <input
              value={last_name}
              className="form-control mx-auto"
              onChange={(e) => setLastName(e.target.value)}
              type="text"
              id="last_name"
              name="last_name"
              required
              maxLength="30"
              pattern="[A-Za-z\s]+"
              title="Ingrese solo letras"
            />
          </div>
          <br />
          <div className="d-flex flex-column">
            <label for="username" className="text-center col-12">
              Nombre del usuario (Username):
            </label>
            <input
              value={username}
              className="form-control mx-auto"
              onChange={(e) => setUsername(e.target.value)}
              type="text"
              id="username"
              name="username"
              required
              maxLength="30"
            />
          </div>
          {error && (
            <p style={{ color: "red" }} className="text-center">
              {error}
            </p>
          )}
          <br />
          <div className="d-flex flex-column">
            <label for="identification_number" className="text-center col-12">
              Cédula del usuario:
            </label>
            <input
              value={identification_number}
              onChange={(e) => setIdentification(e.target.value)}
              type="number"
              id="identification_number"
              className="form-control mx-auto"
              name="identification_number"
              required
              maxLength="20"
            />
          </div>
          {iderror && <p className="error-message mx-auto">{iderror}</p>}
          <br />
          <div className="d-flex flex-column">
            <label for="email" className="text-center col-12">
              Correo del usuario:
            </label>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              id="email"
              className="form-control mx-auto"
              name="email"
              required
              maxLength="30"
            />
          </div>
          {emailerror && <p className="error-message mx-auto">{emailerror}</p>}
          <br />
          <div className="d-flex flex-column">
            <label for="telephone_number" className="text-center col-12">
              Teléfono del usuario:
            </label>
            <input
              value={telephone_number}
              onChange={(e) => setTelephone(e.target.value)}
              type="text"
              id="telephone_number"
              className="form-control mx-auto"
              name="telephone_number"
              required
              maxLength="20"
            />
          </div>
          {telerror && <p className="error-message mx-auto">{telerror}</p>}
          <br />
          <div className="d-flex flex-column password-container">
            <label for="password" className="text-center col-12">
              Contraseña del usuario:
            </label>
            <input
              type={passwordVisible ? "text" : "password"}
              id="password"
              className="form-control mx-auto"
              name="password1"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              maxLength="50"
            />
            <span
              className="toggle-password"
              onClick={() => togglePasswordVisibility("password")}
            >
              <i
                className="fas fa-eye"
                style={{ position: "relative", right: "28vh", top: "1.5vh" }}
              ></i>
            </span>
          </div>
          <br />
          <div className="d-flex flex-column password-container">
            <label for="password" className="text-center col-12">
              Repite la contraseña del usuario:
            </label>
            <input
              type={passwordConfirmationVisible ? "text" : "password"}
              id="password_confirmation"
              className="form-control mx-auto"
              name="password2"
              value={passwordConfirmation}
              onChange={(e) => setPasswordConfirmation(e.target.value)}
              required
              maxLength="50"
            />
            <span
              className="toggle-password"
              onClick={() => togglePasswordVisibility("password_confirmation")}
            >
              <i
                className="fas fa-eye"
                style={{ position: "relative", right: "28vh", top: "1.5vh" }}
              ></i>
            </span>
          </div>
          <br />
          <div className="form-check d-flex justify-content-center">
            <input
              id="is_staff"
              className="form-check-input"
              type="checkbox"
              checked={is_staff}
              onChange={(e) => setIsStaff(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="is_staff">
              El usuario hace parte del staff
            </label>
          </div>
          {passwordError && (
            <p className="error-message text-center">{passwordError}</p>
          )}
          <div className="d-flex mx-auto gap-5">
          <Link className="btn delete-btn-style mx-auto mt-5 mb-5" to="/admin/users">
            Volver
          </Link>
          <button className="btn new-btn-style mx-auto mt-5 mb-5" type="submit">
            Crear usuario
          </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default NewUser;
