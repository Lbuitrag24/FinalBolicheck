import { useState } from "react";
import "./css/login.css";
import "./css/register.css";
import { useNavigate } from "react-router-dom";

const Register = () => {
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [first_name, setFirstName] = useState("");
  const [last_name, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telephone_number, setTelephone] = useState(null);
  const [identification_number, setIdentification] = useState(null);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [firstNameError, setFirstError] = useState("");
  const [lastNameError, setLastError] = useState("");
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
    } else if (password.length < 6){
      setPasswordError("La contraseña debe tener al menos 6 carácteres.");
      return;
    }
    setError("");
    setTelrror("");
    setEmailerror("");
    setIderror("");
    setPasswordError("");
    try {
      const response = await fetch("http://127.0.0.1:8080/api/register", {
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
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess("Registro exitoso, en un momento serás redirigido...");
        localStorage.setItem("refresh_token", data.tokens.refresh);
        localStorage.setItem("token", data.tokens.access);
        localStorage.setItem("first_name", data.user.first_name)
        localStorage.setItem("last_name", data.user.last_name)
        localStorage.setItem("email", data.user.email);
        localStorage.setItem("username", data.user.username);
        localStorage.setItem("telephone", data.user.telephone);
        localStorage.setItem("identification", data.user.identification);
        localStorage.setItem("points", data.user.points);
        localStorage.setItem("id", data.user.id);
        localStorage.setItem("is_staff", data.user.is_staff);
        localStorage.setItem("is_superuser", data.user.is_super);
        setTimeout(() => {
          window.location.href = "/client/dashboard";
        }, 100);
      } else {
        const errorData = await response.json();
        errorData.first_name ? setFirstError(errorData.first_name) : setFirstError("");
        errorData.last_name ? setLastError(errorData.last_name) : setLastError("");
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
      console.error("Error en la solicitud:", error);
    }
  };

  return (
    <div className="form-container mx-auto col-11 col-md-9 col-lg-6 col-xl-4">
      <h1>Crear cuenta</h1>
      {success && (
        <p style={{ color: "green" }} className="text-center">
          {success}
        </p>
      )}
      <form id="register-form" className="registroForm" onSubmit={handleSubmit}>
        <div className="form-group">
          <input
            value={first_name}
            onChange={(e) => setFirstName(e.target.value)}
            type="text"
            id="first_name"
            className="entrada"
            name="first_name"
            required
            placeholder="Primer Nombre"
            maxLength="30"
            pattern="[A-Za-z\s]+"
            title="Ingrese solo letras"
          />
        </div>
        {firstNameError && (
          <p style={{ color: "red" }} className="text-center">
            {error}
          </p>
        )}
        <div className="form-group">
          <input
            value={last_name}
            onChange={(e) => setLastName(e.target.value)}
            type="text"
            id="last_name"
            className="entrada"
            name="last_name"
            required
            placeholder="Primer Apellido"
            maxLength="30"
            pattern="[A-Za-z\s]+"
            title="Ingrese solo letras"
          />
        </div>
        {lastNameError && (
          <p style={{ color: "red" }} className="text-center">
            {error}
          </p>
        )}
        <div className="form-group">
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            type="text"
            id="username"
            className="entrada"
            name="username"
            required
            placeholder="Nombre de Usuario"
            maxLength="30"
          />
        </div>
        {error && (
          <p style={{ color: "red" }} className="text-center">
            {error}
          </p>
        )}
        <div className="form-group">
          <input
            value={identification_number}
            onChange={(e) => setIdentification(e.target.value)}
            type="number"
            id="identification_number"
            className="entrada"
            name="identification_number"
            required
            placeholder="Cédula"
            maxLength="20"
          />
        </div>
        {iderror && <p className="error-message">{iderror}</p>}
        <div className="form-group">
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            id="email"
            className="entrada"
            name="email"
            required
            placeholder="Correo Electrónico"
            maxLength="30"
          />
        </div>
        {emailerror && <p className="error-message">{emailerror}</p>}
        <div className="form-group">
          <input
            value={telephone_number}
            onChange={(e) => setTelephone(e.target.value)}
            type="text"
            id="telephone_number"
            className="entrada"
            name="telephone_number"
            required
            placeholder="Celular"
            maxLength="20"
          />
        </div>
        {telerror && <p className="error-message">{telerror}</p>}
        <div className="form-group password-container">
          <input
            type={passwordVisible ? "text" : "password"}
            id="password"
            className="entrada"
            name="password1"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Contraseña"
            maxLength="50"
          />
          <span
            className="toggle-password"
            onClick={() => togglePasswordVisibility("password")}
          >
            <i className="fas fa-eye"></i>
          </span>
        </div>
        <div className="form-group password-container">
          <input
            type={passwordConfirmationVisible ? "text" : "password"}
            id="password_confirmation"
            className="entrada"
            name="password2"
            value={passwordConfirmation}
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            required
            placeholder="Confirma tu contraseña"
            maxLength="50"
          />
          <span
            className="toggle-password"
            onClick={() => togglePasswordVisibility("password_confirmation")}
          >
            <i className="fas fa-eye"></i>
          </span>
        </div>
        {passwordError && <p className="error-message">{passwordError}</p>}
        <div className="contendor">
          <button id="register-button" type="submit">
            Registrarse
          </button>
          <div className="link_registrarse">
            <p>
              Ya tienes una cuenta? Vuelve al{" "}
              <a href="/login">Inicio de sesión</a>
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};

export default Register;
