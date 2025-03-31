import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import "./categories.css";

const EditCategory = () => {
  useEffect(() => {
    document.title = "Editar Categoría | Bolicheck";
  }, []);

  const { id } = useParams();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [is_available, setIsAvailable] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:8080/api/categories/${id}/`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error("Error al obtener la categoría.");
        }
        const data = await response.json();
        setName(data.name);
        setDescription(data.description);
        setIsAvailable(data.is_available);
        setImagePreview(data.image);
      } catch (error) {
        toast.error("Error al obtener la categoría.");
      }
    };
    fetchCategory();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("name", name);
    formData.append("description", description);
    formData.append("is_available", is_available ? "True" : "False");
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/categories/${id}/`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      if (response.ok) {
        toast.success("Categoría actualizada exitosamente.");
        navigate("/admin/categories");
      } else {
        throw new Error("Error al actualizar la categoría.");
      }
    } catch (error) {
      toast.error("Error al actualizar la categoría.");
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
        <h1 className="text-center mt-3">Editar Categoría</h1>
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
            <label htmlFor="description" className="text-center">
              Descripción:
            </label>
            <textarea
              className="form-control mx-auto"
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <label className="text-center mt-3">Imágen actual:</label>
          <div
            className="image-container w-100 w-lg-75 mx-auto"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={handleImageClick}
          >
            <img
              src={imagePreview}
              className={`image ${isHovered ? "hovered" : ""}`}
              alt="Preview"
            />
            {isHovered && <div className="overlay-text">Editar</div>}
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              className="hidden-input"
              onChange={handleFileChange}
            />
          </div>
          <div className="form-check d-flex justify-content-center">
            <input
              className="form-check-input"
              type="checkbox"
              checked={is_available}
              onChange={(e) => setIsAvailable(e.target.checked)}
            />
            <label className="form-check-label" htmlFor="">
              Categoría disponible
            </label>
          </div>
          <div className="mx-auto d-flex gap-5">
            <Link to="/admin/categories" className="btn delete-btn-style mx-auto mt-5 mb-5">
                Cancelar
            </Link>
            <button
              type="submit"
              className="btn secondary-btn-style mx-auto mt-5 mb-5"
            >
              Actualizar Categoría
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};
export default EditCategory;
