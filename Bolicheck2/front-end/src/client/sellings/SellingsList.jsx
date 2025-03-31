import React from "react";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
export const ClientSellingList = () => {
  const [sellings, setSellings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [expandedId, setExpandedId] = useState(null);
  const fetchSellings = async () => {
    setLoading(true);
    try {
      const response = await fetchWithAuth("http://localhost:8080/api/sales/", {
        method: "GET",
      });
      if (response.ok) {
        const data = await response.json();
        setSellings(data);
      } else {
        toast.error("No hemos podido cargar tus compras, recarga la pàgina.");
      }
    } catch {
      toast.error(
        "No hemos podido cargar tus compras, estàs conectado a internet?"
      );
    } finally {
      setLoading(false);
    }
  };
  const handleCancel = async (id) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/sales/${id}/cancel/`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSellings((prevSellings) =>
          prevSellings.map((selling) =>
            selling.id === id ? { ...selling, status: "cancelada" } : selling
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al cancelar la venta, estás conectado a internet?"
      );
    }
  };
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  useEffect(() => {
    fetchSellings();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5 col-7 mx-auto h-auto rounded-4">
        Cargando...
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
    <div
      className="col-12 col-md-9 mx-auto h-100 rounded-4 overflow-auto client-form-styled"
    >
      <div className="d-flex justify-content-between">
        <h1 className="text-center col-12 mt-3">Tus compras</h1>
      </div>
      <ul className="list-group mt-1 col-11 mx-auto mb-3">
        {sellings.length > 0 ? (
          sellings.map((selling) => (
            <li
              key={selling.id}
              className="list-group-item d-flex flex-column mb-2 border-0"
              style={{ backgroundColor: "#2E2E2E", cursor: "pointer", color: "white" }}
              onClick={() => toggleExpand(selling.id)}
            >
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center col-8">
                  <div
                    style={{
                      width: "15px",
                      height: "15px",
                      borderRadius: "50%",
                      backgroundColor:
                        selling.status === "pendiente"
                          ? "#fb8500"
                          : selling.status === "completada"
                          ? "#2b9348"
                          : selling.status === "cancelada"
                          ? "#d62828"
                          : "gray",
                      marginRight: "15px",
                    }}
                  ></div>
                  <div className="col-8" style={{textDecoration:selling.status == "cancelada" && "line-through", color:selling.status == "cancelada" && "gray"}}>
                    <h5 className="mb-1">
                      Venta #{selling.id}{" "}
                      {selling.reserve.length != 0 && (
                        <span
                          className="rounded-5"
                          style={{
                            backgroundColor: "#62A87C",
                            width: "fit-content",
                            display: "inline-block", 
                            textAlign: "center",
                            padding: "1px 15px",
                          }}
                        >
                          Reservada
                        </span>
                      )}
                      {selling.is_redemption == true && (
                        <span
                          className="rounded-5"
                          style={{
                            backgroundColor: "#F39B21",
                            width: "fit-content",
                            display: "inline-block", 
                            textAlign: "center",
                            padding: "1px 15px",
                          }}
                        >
                          Redención
                        </span>
                      )}
                    </h5>
                    <p className="mb-1">
                      Fecha:{" "}
                      {new Date(selling.date).toLocaleDateString("es-MX")}
                    </p>
                    <h5>
                      <b>
                        Total:{" "}
                        {selling.is_redemption
                          ? `${selling.total}pts.`
                          : `$${selling.total}`}
                      </b>
                    </h5>
                  </div>
                </div>
                {selling.status == "pendiente" && (
                  <div className="btn-group gap-1">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCancel(selling.id);
                      }}
                      className="btn btn-sm client-thirdary-btn"
                    >
                      Cancelar
                    </button>
                  </div>
                )}
              </div>
              {expandedId === selling.id && (
                <div className="mb-3 p-2 bg-dark rounded h-auto">
                  <p>
                    <strong>Estado:</strong> {selling.status}
                    {selling.status == "cancelada"
                      ? selling.admin_cancel
                        ? ", por uno de nuestros integrantes de staff."
                        : ", por tí."
                      : ""}
                  </p>
                  <p>
                    <strong>
                      {selling.is_redemption ? "Premios:" : "Productos:"}
                    </strong>
                  </p>
                  <div className="d-flex flex-column gap-3">
                  {!selling.is_redemption
                    ? selling.products.map((product, i) => (
                        <div
                          className="card col-12 col-md-10 mx-auto client-card align-items-between gap-3 flex-lg-row p-3 mb-2"
                          key={i}
                        >
                          <img
                            src={product.product.image}
                            className="col-12 col-lg-3 h-100 h-lg-auto"
                            style={{ objectFit: "cover" }}
                          />
                          <div className="col-12 my-auto col-lg-5">
                            <h4 className="text-center text-truncate">
                              {product.product.name}
                            </h4>
                            <h5 className="text-center">
                              {product.product.offered_price != null ? <><del>${product.product.price}</del> <span className="text-success">${product.product.offered_price}</span></> : `$${product.product.price}`}
                            </h5>
                            <h6
                              className="text-center w-50 mx-auto rounded-5"
                              style={{ backgroundColor: "gray" }}
                            >
                              {product.product.category.name}
                            </h6>
                            <p className="text-center mb-0">
                              <i>{product.product.points}pts. C/U</i>
                            </p>
                            <p
                              className="text-center text-truncate"
                              style={{ color: "gray" }}
                            >
                              {product.product.description}
                            </p>
                          </div>
                          <div className="col-12 col-lg-3 d-flex flex-column justify-content-center align-items-start">
                            <h5 style={{ color: "gray" }} className="text-center col-12 col-lg-6">
                              {product.quantity} x ${product.product.offered_price != null ? product.product.offered_price : product.product.price}
                            </h5>
                            <h4 className="text-center col-12 col-lg-6">{product.subtotal}</h4>
                          </div>
                        </div>
                      ))
                    : selling.prizes.map((prize, i) => (
                      <div
                        className="card col-12 col-lg-10 mx-auto client-card align-items-between gap-3 flex-lg-row p-3 mb-2"
                        key={i}
                      >
                        <img
                          src={prize.prize.image}
                          className="col-12 col-lg-2"
                          style={{ objectFit: "cover" }}
                        />
                        <div className="col-12 my-auto col-lg-5">
                          <h4 className="text-center text-truncate">{prize.prize.name}</h4>
                          <h5 className="text-center">{prize.prize.required_points} pts. C/U</h5>
                          <p
                            className="text-center text-truncate"
                            style={{ color: "gray" }}
                          >
                            {prize.prize.description}
                          </p>
                        </div>
                        <div className="col-12 col-lg-3 d-flex flex-column justify-content-center align-items-start">
                          <h5 style={{ color: "gray" }} className="text-center col-12 col-lg-6">
                            {prize.quantity} x {prize.prize.required_points} pts.
                          </h5>
                          <h4 className="text-center col-12 col-lg-6">{prize.subtotal} pts.</h4>
                        </div>
                      </div>
                    ))}                    
                  {selling.reserve.length != 0 && (
                    <div>
                      <p className="col-12 col-md-12 mx-auto text-center text-md-start">
                        <strong>Detalles de la reserva:</strong>
                      </p>
                      <ul className="col-12 col-md-10 mx-auto">
                        <li>
                          <p className="col-12 col-md-10 mx-auto text-center text-md-start">
                            <strong>Evento: </strong>
                            {selling.reserve[0].event_type.event_type}
                          </p>
                        </li>
                        <li>
                            <p className="col-12 col-md-10 mx-auto text-center text-md-start">
                              <strong>Asistentes: </strong>
                              {selling.reserve[0].num_people}
                            </p>
                          </li>
                        <li>
                          <p className="col-12 col-md-10 mx-auto text-center text-md-start">
                            <strong>Fecha y hora de entrada: </strong>
                            {format(
                              new Date(selling.reserve[0].date_in),
                              "E'.' dd/MM/yyyy 'a las' HH:mm",
                              { locale: es }
                            )}
                          </p>
                        </li>
                        <li>
                          <p className="col-12 col-md-10 mx-auto text-center text-md-start">
                            <strong>Fecha y hora de salida: </strong>
                            {format(
                              new Date(selling.reserve[0].date_out),
                              "E'.' dd/MM/yyyy 'a las' HH:mm",
                              { locale: es }
                            )}
                          </p>
                        </li>
                      </ul>
                    </div>
                  )}
                  </div>
                </div>
              )}
            </li>
          ))
        ) : (
          <div className="text-center mt-3 mb-4">Aquí podrás ver el historial de tus compras.</div>
        )}
      </ul>
    </div>
    </motion.div>
  );
};

export default ClientSellingList;
