import React, { useState,useEffect } from "react";
import moment from "moment";
import { Calendar, momentLocalizer } from "react-big-calendar";
import withDragAndDrop from "react-big-calendar/lib/addons/dragAndDrop";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "react-big-calendar/lib/addons/dragAndDrop/styles.css";
import "./calendar.css";
import { MoonLoader } from "react-spinners";
import EventModal from "./EventModal";
import Agregar from "./agregar_reserva";

const DragAndDropCalendar = withDragAndDrop(Calendar);
const localizer = momentLocalizer(moment);

function CalendarComponent({ props, reserves, loading }) {
  const [eventos, setEventos] = useState(reserves);
  const [eventoSeleccionado, setEventoSeleccionado] = useState(null);

  useEffect(() => {
    setEventos(reserves);
  }, [reserves]);

  const MoverEventos = (data) => {
    const { start, end } = data;
    const updatedEvents = eventos.map((event) => {
      if (event.id === data.event.id) {
        return {
          ...event,
          start: new Date(start),
          end: new Date(end),
        };
      }
      return event;
    });
    setEventos(updatedEvents);
  };

  const handleEventClick = (evento) => {
    setEventoSeleccionado(evento);
  };

  const handleEventClose = () => {
    setEventoSeleccionado(null);
  };

  const eventStyleGetter = (event) => {
    let style = {
      borderRadius: "8px",
      padding: "5px",
      color: "#fff",
      border: "none",
      cursor: "pointer",
      transition: "0.3s",
    };
  
    if (event.color === "#00AD2B") {
      style = {
        ...style,
        border: "2px solid rgba(0, 180, 126, 0.699)",
        background: "rgba(0, 180, 126, 0.1)",
        color: "rgba(0, 180, 126, 0.9)",
        borderRadius: "10px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0 4px 10px rgba(0, 180, 126, 0.2)",
      };
    } else if (event.color === "#c42e0e") {
      style = {
        ...style,
        border: "2px solid rgba(196, 46, 14, 0.8)",
        background: "rgba(196, 46, 14, 0.1)",
        color: "rgba(196, 46, 14, 0.9)",
        borderRadius: "10px",
        cursor: "pointer",
        position: "relative",
        overflow: "hidden",
        transition: "all 0.3s ease-in-out",
        boxShadow: "0 4px 10px rgba(196, 46, 14, 0.2)",
      };
    }
    return { style };
  };   

  if(loading){
    return(
      <div className="pantalla">
        <div className="client-loader">
            <MoonLoader color="#00B47E" size={50} speedMultiplier={0.8} />
          </div>
      </div>  
    )
  }

  return (
    <div className="h-100 d-flex flex-column flex-md-row">
      <div className="d-flex col-12 col-md-3 p-3 p-md-0">
        <Agregar props={props}/>
      </div>
      <div className="col-12 col-md-9 mx-auto overflow-auto" style={{height: "80vh"}}>
        <Calendar
          defaultDate={moment().toDate()}
          defaultView="month"
          events={eventos}
          localizer={localizer}
          onEventDrop={MoverEventos}
          onEventResize={MoverEventos}
          onSelectEvent={handleEventClick}
          eventPropGetter={eventStyleGetter}
          resizable
        />
      </div>
      {eventoSeleccionado && (
        <EventModal evento={eventoSeleccionado} onClose={handleEventClose} />
      )}
    </div>
  );
}

export default CalendarComponent;
