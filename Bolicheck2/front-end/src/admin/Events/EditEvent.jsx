import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const EditEvent = () => {
  useEffect(() => {
    document.title = "Editar Evento | Bolicheck";
  }, []);

  const { id } = useParams();
  const [event_type, setEventType] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:8080/api/events/${id}/`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error("Error al obtener el evento.");
        }
        const data = await response.json();
        setEventType(data.event_type);
        setDescription(data.description);
      } catch (error) {
        setError("Error al obtener el evento.");
      }
    };
    fetchEvent();
  }, [id]);

  const handleSubmit = async (evento) => {
    evento.preventDefault();
    const eventData = {
      event_type,
      description,
    };

    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/events/${id}/`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        }
      );
      if (!response.ok) {
        throw new Error("Error al actualizar el evento.");
      }
      navigate("/admin/events");
    } catch (error) {
      setError("Error al actualizar el evento, ¿estás conectado a internet?");
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
        <h1 className="text-center mt-3">Editar Evento</h1>
        {error && (
          <div className="alert alert-danger text-center col-10 mx-auto">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column">
          <div className="d-flex flex-column">
            <label htmlFor="name" className="text-center">
              Nombre del evento:
            </label>
            <input
              className="form-control mx-auto"
              type="text"
              id="name"
              value={event_type}
              onChange={(e) => setEventType(e.target.value)}
              required
            />
          </div>
          <br />
          <div className="d-flex flex-column">
            <label htmlFor="desc" className="text-center">
              Descripción del evento:
            </label>
            <textarea
              className="form-control mx-auto"
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>
          <div className="d-flex mx-auto gap-5">
            <Link className="btn delete-btn-style mx-auto mt-5 mb-5" to="/admin/events">
              Volver
            </Link>
            <button type="submit" className="btn new-btn-style mx-auto mt-5 mb-5">
              Actualizar Evento
            </button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditEvent;