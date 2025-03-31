import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { motion } from "framer-motion";
const EmployeeSellingList = () => {
  const [sellings, setSellings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [estado, setEstado] = useState("todos");
  const [fecha, setFecha] = useState("hoy");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchSellings = async () => {
    setLoading(true);
    try {
      const url = new URL("http://localhost:8080/api/staff/sales/");
      if (estado) url.searchParams.append("estado", estado);
      if (fecha) url.searchParams.append("fecha", fecha);
      const response = await fetchWithAuth(url.toString(), { method: "GET" });
      if (response.ok) {
        const data = await response.json();
        setSellings(data);
      } else {
        toast.error(
          "Ha ocurrido un error al obtener las ventas, por favor, recarga la página."
        );
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al obtener las ventas, estás conectado a internet?"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSellings();
  }, [estado, fecha]);

  const handleConfirm = async (id) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/staff/sales/${id}/confirm/`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSellings((prevSellings) =>
          prevSellings.map((selling) =>
            selling.id === id ? { ...selling, status: "completada" } : selling
          )
        );
        toast.success("La venta ha sido confirmada con éxito.");
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al confirmar la venta, estás conectado a internet?"
      );
    }
  };

  const handleCancel = async (id) => {
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/staff/sales/${id}/cancel/`,
        {
          method: "POST",
        }
      );
      const data = await response.json();
      if (response.ok) {
        setSellings((prevSellings) =>
          prevSellings.map((selling) =>
            selling.id === id
              ? { ...selling, status: "cancelada", admin_cancel: true }
              : selling
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

  const filteredSellings = sellings.filter((selling) => {
    const formattedDate = new Date(selling.date).toLocaleString("es-MX", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
    return (
      String(selling.id).includes(searchTerm) ||
      formattedDate.includes(searchTerm) ||
      selling?.by?.username?.includes(searchTerm)
    );
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

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
      <div className="col-12 col-lg-9 mx-auto h-auto rounded-4 form-style">
        <div className="d-flex justify-content-between">
          <h1 className="text-end col-8 mt-3">Lista de Ventas</h1>
          <Link
            to="/employee/sellings/new"
            className="btn new-btn-style col-3 h-25 mt-4 mx-auto text-truncate"
          >
            Nueva Venta
          </Link>
        </div>
        <div className="d-flex flex-column flex-lg-row align-items-center">
          <div className="col-10 col-lg-7 d-flex flex-column p-3 rounded">
            <h5 className="text-center mb-3">Aplica filtros</h5>
            <p className="text-center mb-0">Por estado:</p>
            <div className="d-flex justify-content-center gap-2 mb-2">
              {["Todos", "Pendiente", "Completada", "Cancelada"].map((item) => (
                <button
                  key={item}
                  className={`btn ${
                    estado === item.toLowerCase()
                      ? "btn-info"
                      : "btn-outline-info"
                  }`}
                  onClick={() => setEstado(item.toLowerCase())}
                >
                  {item}
                </button>
              ))}
            </div>
            <p className="text-center mb-0">Por fecha:</p>
            <div className="d-flex justify-content-center gap-2">
              {["Hoy", "Semana", "Mes", "Año", "Todas"].map((item) => (
                <button
                  key={item}
                  className={`btn ${
                    fecha === item.toLowerCase()
                      ? "btn-light"
                      : "btn-outline-light"
                  }`}
                  onClick={() => setFecha(item.toLowerCase())}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
          <div className="col-10 col-lg-4 d-flex flex-column rounded">
            <h3 className="text-center text-lg-start">Buscar</h3>
            <input
              type="text"
              placeholder="Busca una venta por su id, fecha o encargado."
              className="form-control mx-center mx-lg-start mb-3 inner-input-style"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <ul className="list-group mt-4 col-11 mx-auto mb-3 py-3">
          {filteredSellings.length > 0 ? (
            filteredSellings.map((selling) => (
              <li
                key={selling.id}
                className="list-group-item d-flex flex-column mb-2 sellings-card-style"
                style={{ cursor: "pointer" }}
                onClick={() => toggleExpand(selling.id)}
              >
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center justify-content-between col-9">
                    <div className="col-12 d-flex justify-content-start align-items-center">
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
                    <div className="col-8">
                      <h5 className="mb-1">
                        Venta #{selling.id}{" "}
                        {selling.reserve.length != 0 && (
                          <span
                            className="rounded-5"
                            style={{
                              backgroundColor: "#62A87C",
                              width: "50%",
                              display: "inline-block",
                              textAlign: "center",
                              padding: "1px",
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
                              width: "50%",
                              display: "inline-block",
                              textAlign: "center",
                              padding: "1px",
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
                          handleConfirm(selling.id);
                        }}
                        className="btn btn-sm btn-success"
                      >
                        Finalizar
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCancel(selling.id);
                        }}
                        className="btn btn-sm btn-danger"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
                </div>
                {expandedId === selling.id && (
                  <div className="mb-3 p-2 rounded">
                    <p>
                      <strong>Cliente:</strong>{" "}
                      {selling.customer == null
                        ? "Invitado"
                        : `${selling.customer.first_name} ${selling.customer.last_name}`}
                    </p>
                    <p>
                      <strong>Estado:</strong> {selling.status}
                      {selling.status == "cancelada"
                        ? selling.admin_cancel
                          ? ", por uno de los integrantes del staff."
                          : ", por el cliente."
                        : ""}
                    </p>
                    <p>
                      <strong>
                        {selling.is_redemption ? "Premios:" : "Productos:"}
                      </strong>
                    </p>
                    {!selling.is_redemption
                      ? selling.products.map((product, i) => (
                          <div
                            className="card col-12 col-md-10 mx-auto subsellings-card-style align-items-between gap-3 flex-lg-row p-3 mb-2"
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
                              {product.is_offer == true ? <><del>${product.product.price}</del> <span className="text-success">${product.unit_price == 0 ? "Gratis" : product.unit_price}</span></> : `$${product.product.price}`}
                            </h5>
                              <h6
                                className="text-center w-50 mx-auto rounded-5"
                                style={{ backgroundColor: "gray" }}
                              >
                                {product?.product?.category?.name ?? "N/A"}
                              </h6>
                              <p className="text-center mb-0">
                              <i>
                                  {product?.product?.points ?? "N/A"} pts. C/U
                                </i>
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
                              {product.quantity} x ${product.unit_price}
                            </h5>
                              <h4 className="text-center col-12 col-lg-6">${product.subtotal}</h4>
                            </div>
                          </div>
                        ))
                      : selling.prizes.map((prize, i) => (
                          <div
                            className="card col-12 col-lg-10 mx-auto subsellings-card-style align-items-between gap-3 flex-lg-row p-3 mb-2"
                            key={i}
                          >
                            <img
                              src={prize.prize.image}
                              className="col-12 col-lg-2"
                              style={{ objectFit: "cover" }}
                            />
                            <div className="col-12 my-auto col-lg-5">
                            <h4 className="text-center text-truncate">
                                {prize.prize.name}
                              </h4>
                              <h5 className="text-center">
                                {prize.prize.required_points}pts. C/U
                              </h5>
                              <p
                                className="text-center text-truncate"
                                style={{ color: "gray" }}
                              >
                                {prize.prize.description}
                              </p>
                            </div>
                            <div className="col-12 col-lg-3 d-flex flex-column justify-content-center align-items-start">
                            <h5 style={{ color: "gray" }} className="text-center col-12 col-lg-6">
                              {prize.quantity} x {prize.prize.required_points}
                            </h5>
                              <h4 className="text-center col-12 col-lg-6">
                                {prize.subtotal}pts.
                              </h4>
                            </div>
                          </div>
                        ))}
                    {selling.reserve.length != 0 && (
                      <div>
                      <p>
                        <strong>Detalles de la reserva:</strong>
                      </p>
                      <ul>
                        <li>
                          <p>
                            <strong>Evento: </strong>
                            {selling.reserve[0].event_type.event_type}
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>Asistentes: </strong>
                            {selling.reserve[0].num_people}
                          </p>
                        </li>
                        <li>
                          <p>
                            <strong>Fecha y hora de entrada: </strong>
                            {format(
                              new Date(selling.reserve[0].date_in),
                              "E'.' dd/MM/yyyy 'a las' HH:mm",
                              { locale: es }
                            )}
                          </p>
                        </li>
                        <li>
                          <p>
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
                )}
              </li>
            ))
          ) : (
            <div className="text-center mt-3 mb-4">No hay ventas aún.</div>
          )}
        </ul>
      </div>
    </motion.div>
  );
};
export default EmployeeSellingList;
