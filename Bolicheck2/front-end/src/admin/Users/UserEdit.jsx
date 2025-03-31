import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const EditUser = () => {
  useEffect(() => {
    document.title = "Editar Usuario | Bolicheck";
  }, []);

  const { id } = useParams();
  const [first_name, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [telephone_number, setTelephone] = useState("");
  const [isStaff, setIsStaff] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetchWithAuth(`http://localhost:8080/api/users/${id}/`, { method: "GET" });
        if (!response.ok) throw new Error("Error al obtener el usuario.");
        const data = await response.json();
        setFirstName(data.first_name);
        setLastName(data.last_name);
        setUsername(data.username);
        setEmail(data.email);
        setTelephone(data.telephone_number);
        setIsStaff(data.is_staff);
      } catch {
        toast.error("Error al obtener el usuario.");
      }
    };
    fetchUser();
  }, [id]);

  const validateForm = () => {
    const nameRegex = /^[A-Za-z\s]+$/;
    const usernameRegex = /^[A-Za-z\s]+$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^[0-9]{7,}$/;

    if (!nameRegex.test(first_name)) {
      toast.error("El nombre solo debe contener letras y espacios.");
      return false;
    }
    if (!nameRegex.test(lastName)) {
      toast.error("El apellido solo debe contener letras y espacios.");
      return false;
    }
    if (!usernameRegex.test(username)) {
      toast.error("El nombre de usuario solo puede contener letras");
      return false;
    }
    if (!emailRegex.test(email)) {
      toast.error("El correo electrónico no es válido.");
      return false;
    }
    if (!phoneRegex.test(telephone_number)) {
      toast.error("El número de teléfono debe contener al menos 7 dígitos.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validateForm()) return;

    const updatedUser = { first_name, last_name: lastName, username, email, telephone_number, is_staff: isStaff };

    try {
      const response = await fetchWithAuth(`http://localhost:8080/api/users/${id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedUser),
      });
      if (!response.ok) throw new Error("Error al actualizar el usuario.");
      toast.success("Usuario actualizado correctamente.");
      navigate("/admin/users");
    } catch {
      toast.error("Error al actualizar el usuario, ¿estás conectado a internet?");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, y: -20 }} 
      transition={{ duration: 0.3 }}
    >
      <div className="col-12 col-lg-7 mx-auto h-auto rounded-4 form-style p-4">
        <h1 className="text-center mt-3">Editar Usuario</h1>
        <form className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column" onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label">Nombre:</label>
            <input type="text" className="form-control mx-auto" value={first_name} onChange={(e) => setFirstName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Apellido:</label>
            <input type="text" className="form-control mx-auto" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Nombre de Usuario:</label>
            <input type="text" className="form-control mx-auto" value={username} onChange={(e) => setUsername(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Correo:</label>
            <input type="email" className="form-control mx-auto" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="mb-3">
            <label className="form-label">Teléfono:</label>
            <input type="text" className="form-control mx-auto" value={telephone_number || ''} onChange={(e) => setTelephone(e.target.value)} required />
          </div>
          <div className="form-check mb-3">
            <input type="checkbox" className="form-check-input" checked={isStaff} onChange={(e) => setIsStaff(e.target.checked)} />
            <label className="form-check-label">Usuario Staff</label>
          </div>
          <div className="d-flex justify-content-between">
            <Link className="btn delete-btn-style mx-auto mt-5 mb-5" to="/admin/users">Volver</Link>
            <button type="submit" className="btn new-btn-style mx-auto mt-5 mb-5">Actualizar Usuario</button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditUser;
