import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const NewPrize = () => {
  useEffect(() => {
    document.title = "Crear Premio | Bolicheck";
  }, []);
  const [name, setName] = useState("");
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append("name", name);
    formData.append("required_points", requiredPoints);
    formData.append("stock", stock);
    formData.append("description", description);
    if (image) {
      formData.append("image", image);
    }
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/prizes/",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (!image) {
          toast.warning(
            "No has seleccionado una imagen, asignaremos una por defecto."
          );
        }
        setName("");
        setRequiredPoints(0);
        setStock(0);
        setDescription("");
        setImage(null);
        navigate("/admin/prizes");
      } else {
        for (const field in data) {
          data[field].forEach((msg) => toast.error(`${msg}`));
        }
      }
    } catch {
      toast.error(
        "No hemos podido crear el premio, estás conectado a internet?"
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
        <h1 className="text-center mt-3">Crear Premio</h1>
        {error && (
          <div className="alert alert-danger text-center col-10 mx-auto">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column">
          <div className="d-flex flex-column">
            <div>
              <label className="text-center col-12">Nombre:</label>
              <input
                type="text"
                className="form-control mx-auto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Descripción:</label>
              <textarea
                className="form-control mx-auto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Puntos Requeridos:</label>
              <input
                type="number"
                className="form-control mx-auto"
                value={requiredPoints}
                onChange={(e) => setRequiredPoints(Number(e.target.value))}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Stock:</label>
              <input
                type="number"
                className="form-control mx-auto"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Imagen:</label>
              <input
                type="file"
                className="form-control mx-auto"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <div className="d-flex gap-5 mx-auto">
            <Link className="btn delete-btn-style mx-auto mt-5 mb-5" to="/admin/prizes">
              Volver
            </Link>
            <button type="submit" className="btn new-btn-style mx-auto mt-5 mb-5">
              Guardar Premio
            </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default NewPrize;
