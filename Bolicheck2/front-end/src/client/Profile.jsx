import { useState, useEffect } from "react";
import { ClientSellingList } from "./sellings/SellingsList";
import fetchWithAuth from "../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const Profile = () => {
  useEffect(() => {
    document.title = "Tu perfil | Bolicheck";
  }, []);
  const [photo, setPhoto] = useState(localStorage.getItem("photo"));
  const handlePhoto = () => {
    document.getElementById("file").click();
  };
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append("photo", file);
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/users/updatephoto",
          {
            method: "POST",
            body: formData,
          }
        );
        const data = await response.json();
        if (response.status === 200) {
          setPhoto(data.photo_url);
          localStorage.setItem("photo", data.photo_url);
          toast.success(
            "Foto del perfil actualizada correctamente, recarga la página."
          );
        } else {
          toast.error(
            "Error al subir la foto: " + (data.error || "error desconocido.")
          );
        }
      } catch (error) {
        toast.error("Error al subir la foto, ¿estás conectado a internet?");
      }
    }
  };
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="col-12 col-lg-9 mx-auto h-auto rounded-4 p-4 client-form"
      >
        <div className="text-center">
          <div
            className="position-relative d-inline-block avatar-container"
            onClick={handlePhoto}
          >
            <img
              src={localStorage.getItem("photo")}
              alt="User Avatar"
              className="rounded-circle user-photo"
            />
            <input
              type="file"
              style={{ display: "none" }}
              id="file"
              accept="image/*"
              onChange={handleFileChange}
            />
            <div className="overlay">
              <span className="edit-text">Editar</span>
            </div>
          </div>
          <h1 className="mt-3">
            {localStorage.getItem("first_name") + " " + localStorage.getItem("last_name")}
            <h3 className="text-secondary">
              {"@" + localStorage.getItem("username")}
            </h3>
          </h1>
          <h6>Cliente</h6>
        </div>
            <div
              className="col-12 mx-auto col-lg-6 h-100 rounded-4 client-form-styled"
            >
              <div className="d-flex flex-column align-items-center text-center">
                <h3 className="card-title text-center mb-4 mt-2">
                  Información del Usuario
                </h3>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-person-fill text-primary me-3 fs-3"></i>
                  <h5 className="m-0">
                    Usuario: {localStorage.getItem("username")}
                  </h5>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className='bx bxs-wallet-alt me-3 fs-3' style={{'color':'#de7800'}}  ></i>
                  <h5 className="m-0">
                    Puntos: {localStorage.getItem("points")}
                  </h5>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-credit-card-2-front-fill text-success me-3 fs-3"></i>
                  <h5 className="m-0">
                    Cédula: {localStorage.getItem("identification")}
                  </h5>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-telephone-fill text-warning me-3 fs-3"></i>
                  <h5 className="m-0">
                    Celular: {localStorage.getItem("telephone")}
                  </h5>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-envelope-fill text-danger me-3 fs-3"></i>
                  <h5 className="m-0">
                    Correo: {localStorage.getItem("email")}
                  </h5>
                </div>
              </div>
            </div>
            <a href="/logout" className="text-decoration-none d-flex mx-auto col-10 justify-content-center mt-3">
            <button className="btn client-thirdary-btn btn-lg ms-3">
              Cerrar Sesión
            </button>
          </a>
        </div>
    </motion.div>
  );
};

export default Profile;
