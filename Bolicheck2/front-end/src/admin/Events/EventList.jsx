import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import useConfirmToast from "../../hooks/confirmToast";

const EventList = () => {
  useEffect(() => {
          document.title = "Eventos | Bolicheck"
      }, [])
  const confirmToast = useConfirmToast();
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/events/",
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setEvents(data);
        } else {
          toast.error(
            "Ha ocurrido un error al obtener los eventos, por favor, recarga la página."
          );
        }
      } catch (error) {
        toast.error(
          "Ha ocurrido un error al obtener los eventos, estás conectado a internet?"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5 col-7 mx-auto h-auto rounded-4">
        Cargando...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center mt-5 col-7 mx-auto h-auto rounded-4">
        {error}
      </div>
    );
  }

  const handleDelete = async (id) => {
    const confirmed = await confirmToast(
      "Realmente quieres cambiar el estado del evento?"
    );
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/events/${id}/changestate/`,
        {
          method: "POST",
        }
      );
      const data = await response.json()
      if (response.ok) {
        setEvents((prevEvents) =>
          prevEvents.map((event) => 
            event.id === id ? { ...event, is_available: !event.is_available} : event
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al eliminar el evento, estás conectado a internet?"
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
    <div
      className="col-12 col-lg-9 mx-auto h-auto rounded-4 form-style"
    >
      <div className="d-flex justify-content-between">
        <h1 className="mt-4 text-end col-8">Lista de Eventos</h1>
        <Link
          to="/admin/events/new"
          className="btn new-btn-style col-3 mx-auto h-25 mt-4 text-truncate"
        >
          Nuevo Evento
        </Link>
      </div>

      <div className="row justify-content-center col-10 mt-4 mb-4 mx-auto">
        {events.length > 0 ? (
          events.map((event, index) => (
            <div
              className="col-12 col-md-8 col-lg-4 mb-3 d-flex justify-content-center"
              key={index}
            >
              <div
                className="card rounded-4 col-12 card-style"
              >
                <div className="card-body d-flex flex-column justify-content-between">
                  <h5 className="mt-2 text-center">{event.event_type}</h5>
                  <p className="text-center">{event.description}</p>
                  <p className={`text-center ${!event.is_available ? "text-disabled" : ""}`}>
                        {event.is_available ? "Disponible" : "No disponible"}
                      </p>
                  <div className="d-flex justify-content-center gap-2 mt-3">
                    <a
                      href={`/admin/events/edit/${event.id}`}
                      className="btn edit-btn-style"
                    >
                      Editar
                    </a>
                    <button
                        onClick={() => handleDelete(event.id)}
                        className={`btn ${event.is_available ? "delete-btn-style" : "new-btn-style"}`}
                      >
                        {event.is_available ? "Inabilitar" : "Habilitar"}
                      </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center col-12 mb-4">No hay eventos aún.</div>
        )}
      </div>
    </div>
    </motion.div>
  );
};

export default EventList;
