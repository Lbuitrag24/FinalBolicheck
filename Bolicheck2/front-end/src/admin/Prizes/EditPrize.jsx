import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const EditPrize = () => {
  useEffect(() => {
    document.title = "Editar Premio | Bolicheck";
  }, []);

  const { id } = useParams();
  const [name, setName] = useState("");
  const [requiredPoints, setRequiredPoints] = useState(0);
  const [stock, setStock] = useState(0);
  const [description, setDescription] = useState("");
  const [image, setImage] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPrize = async () => {
      try {
        const response = await fetchWithAuth(`http://localhost:8080/api/prizes/${id}/`, { method: "GET" });
        if (!response.ok) {
          throw new Error("Error al obtener el premio.");
        }
        const data = await response.json();
        setName(data.name);
        setRequiredPoints(data.required_points);
        setStock(data.stock);
        setDescription(data.description);
      } catch (error) {
        setError("Error al obtener el premio.");
      }
    };
    fetchPrize();
  }, [id]);

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
      const response = await fetchWithAuth(`http://localhost:8080/api/prizes/${id}/`, {
        method: "PATCH",
        body: formData,
      });
      if (!response.ok) {
        throw new Error("Error al actualizar el premio.");
      }
      toast.success("Premio actualizado correctamente.");
      navigate("/admin/prizes");
    } catch {
      toast.error("Error al actualizar el premio, ¿estás conectado a internet?");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}>
      <div className="col-12 col-lg-7 mx-auto h-auto rounded-4 form-style p-2">
        <h1 className="text-center mt-3">Editar Premio</h1>
        {error && <div className="alert alert-danger text-center col-10 mx-auto">{error}</div>}
        <form onSubmit={handleSubmit} className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column">
          <div className="d-flex flex-column">
            <div>
              <label className="text-center col-12">Nombre:</label>
              <input type="text" className="form-control mx-auto" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Descripción:</label>
              <textarea className="form-control mx-auto" value={description} onChange={(e) => setDescription(e.target.value)} required />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Puntos Requeridos:</label>
              <input type="number" className="form-control mx-auto" value={requiredPoints} onChange={(e) => setRequiredPoints(Number(e.target.value))} required />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Stock:</label>
              <input type="number" className="form-control mx-auto" value={stock} onChange={(e) => setStock(Number(e.target.value))} required />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Imagen:</label>
              <input type="file" className="form-control mx-auto" accept="image/*" onChange={(e) => setImage(e.target.files[0])} />
            </div>
            <div className="d-flex gap-5 mx-auto">
              <Link className="btn delete-btn-style mx-auto mt-5 mb-5" to="/admin/prizes">Volver</Link>
              <button type="submit" className="btn new-btn-style mx-auto mt-5 mb-5">Actualizar Premio</button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditPrize;
