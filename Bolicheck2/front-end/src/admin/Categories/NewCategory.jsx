/* eslint-disable no-unused-vars */
import { Link } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./categories.css";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const NewCategory = () => {
  useEffect(() => {
    document.title = "Crear Categoría | Bolicheck";
  }, []);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    } else {
      toast.warning(
        "No has seleccionado una imagen, asignaremos una por defecto."
      );
    }

    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/categories/",
        {
          method: "POST",
          body: formData,
        }
      );

      if (response.ok) {
        setName("");
        setDescription("");
        navigate("/admin/categories");
      } else {
        toast.error(
          "Ha ocurrido un error al crear la categoría, inténtalo de nuevo."
        );
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al crear la categoría, estás conectado a internet?."
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
      <div className="d-flex flex-column col-12 col-lg-7 mx-auto h-auto rounded-4 form-style p-3">
        <h1 className="text-center">Crear una nueva categoría</h1>
        {error && (
          <div className="alert alert-danger text-center col-10 mx-auto">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column">
          <div className="d-flex flex-column">
            <label htmlFor="name" className="text-center">
              Nombre:
            </label>
            <input
              className="form-control mx-auto"
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <br />
          <div className="d-flex flex-column">
            <label htmlFor="name" className="text-center">
              Descripción:
            </label>
            <textarea
              className="form-control mx-auto"
              id="name"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <br />
          <div>
            <label className="text-center col-12">Imagen:</label>
            <input
              type="file"
              className="form-control mx-auto file-upload"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
            />
          </div>
          <div className="mx-auto d-flex gap-5">
            <Link to="/admin/categories" className="btn delete-btn-style mx-auto mt-5 mb-5">
                Cancelar
            </Link>
            <button
              type="submit"
              className="btn secondary-btn-style mx-auto mt-5 mb-5"
            >
              Crear Categoría
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default NewCategory;
