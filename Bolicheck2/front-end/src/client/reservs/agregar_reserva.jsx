import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
const Agregar = ({props}) => {
    const [events, setEvents]=useState([]);
    const [eventData, setEventData] = useState({
        event_type_id: "",
        date_in: "",
        date_out: "",
        num_people: 1,
      });
    const [availableSlots, setAvailableSlots] = useState("")

    const fetchAvailableSlots = async () => {
      setAvailableSlots("Cargando cupos...")
      try {
        const response = await fetchWithAuth(
          `http://localhost:8080/api/reserves/available_slots/?date_in=${encodeURIComponent(eventData.date_in)}&date_out=${encodeURIComponent(eventData.date_out)}`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        if (response.ok) {
          setAvailableSlots(data.available_slots);
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error("Error al cargar los cupos disponibles, ¿estás conectado a internet?");
      }
    };    

      useEffect(() => {
        if (eventData.date_in && eventData.date_out && new Date(eventData.date_in) < new Date(eventData.date_out)) {
          fetchAvailableSlots();
        }
      }, [eventData.date_in, eventData.date_out]);      

      useEffect(() => {
        const fetchEventData = async () => {
          try {
            const response = await fetchWithAuth("http://localhost:8080/api/events/", {
              method: "GET",
            });
            const data = await response.json();
            setEvents(data.filter(event => event.is_available === true));        
          } catch (error) {
            setError("Error al cargar los eventos");
          }
        };
        fetchEventData();
      }, []);
      
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEventData({
      ...eventData,
      [name]: value,
    });
  };

  const saveReserve=(e)=>{
    e.preventDefault()
    props(eventData)
  }
  return (
    <div className="h-100 d-flex mb-auto mt-md-0 flex-column justify-content-center align-items-center p-3 rounded border border-white">
      <img src= "/rana.png" className="col-3 col-md-4"/>
      <h4 className="text-center client-products-text-decorate">Información de la reserva</h4>
      <h6>Más información, mejor servicio.</h6>
      <br />
      <form onSubmit={saveReserve}>
        <div className="mb-3">
          <label htmlFor="event" className="form-label col-12 text-center">
            Selecciona el tipo de evento
          </label>
          <select
            id="event"
            name="event_type_id"
            value={eventData.event_type_id}
            onChange={handleChange}
            className="reserve-input col-9"
            required
          >
            <option value="">Selecciona un evento</option>
            {events && events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.event_type} - {event.description}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label>Hora de Entrada:</label>
          <input
            type="datetime-local"
            name="date_in"
            className="reserve-input col-9"
            value={eventData.date_in}
            onChange={handleChange}
            required
          />
        </div>
        <div className="mb-3">
          <label>Hora de Salida:</label>
          <input
            type="datetime-local"
            name="date_out"
            className="reserve-input col-9"
            value={eventData.date_out}
            onChange={handleChange}
            required
          />
        </div>
        {availableSlots && (<p className="text-center text-success">Cupos disponibles para este horario: {availableSlots}</p>)}
          <div className="mb-3">
            <label>Cantidad de Personas:</label>
            <input
            type="number"
            name="num_people"
            className="reserve-input col-9"
            value={eventData.num_people}
            onChange={handleChange}
            required
          />
        </div>
        <div className="d-flex flex-column mt-3">
          <button className="btn client-products-primary-btn" type="submit">
            Confirmar Reserva
          </button>
        </div>
      </form>
    </div>
  );

};

export default Agregar;