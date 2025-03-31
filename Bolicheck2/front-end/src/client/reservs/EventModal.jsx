import React from "react";
import "./calendar.css";

const EventModal = ({ evento, onClose }) => {
  return (
    <div className="event-modal">
      <div className="event-modal-content col-9 col-md-4">
        <button
                className=" btn client-products-primary-btn rounded-circle d-flex justify-content-center align-items-center"
                onClick={onClose}
                style={{
                  width: "30px",
                  height: "30px",
                  minWidth: "30px",
                  fontSize: "14px",
                  fontWeight: "bold",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  position: "absolute",
                  top: "10px",
                  right: "10px"
                }}
              >
                ✕
              </button>
        <h2>{evento.title}</h2>
        <p>{evento.desc}</p>
        <p>Inicio: {new Date(evento.start).toLocaleString()}</p>
        <p>Fin: {new Date(evento.end).toLocaleString()}</p>
        <p>Cantidad de Personas: <b>{evento.num_people}</b></p>
        {evento.sale && (
          <>
            <p>Producto(s):</p>
            <div className="d-flex flex-column overflow-auto gap-2" style={{height:"10rem"}}>
              {evento.sale.products.map((producto, index) => (
                <div
                  className="card reserve-products-card col-12 flex-row"
                  key={index}
                >
                  <div className="d-flex justify-content-center align-items-center px-3 col-4">
                    <img
                      className="reserve-product-image"
                      src={`http://localhost:8080/${producto?.product?.image}`}
                      alt={producto?.product?.name}
                    />
                  </div>
                  <div className="col-8 py-3">
                    <h4 className="mb-0">{producto?.product?.name}</h4>
                    <p className="mb-0 text-truncate text-warning">{producto?.product?.description}</p>
                    <h5>
                      {producto?.quantity} x{" "}
                      <span className={`${producto?.product?.offered_price != null ? "text-decoration-line-through text-secondary" : ""}`}>
                        {producto?.product?.price.toLocaleString()}
                      </span>
                      {producto?.product?.offered_price != null && (
                      <span className="text-success">
                        {" " + producto?.product?.offered_price.toLocaleString()}
                      </span>
                      )}
                    </h5>
                    <h4>
                      {(producto?.quantity * (producto?.product?.offered_price != null ? producto?.product?.offered_price : producto?.product?.price)).toLocaleString()}
                    </h4>
                  </div>
                </div>
              ))}
            </div>
            <div className="col-6 mx-auto rounded-1 mt-5 client-secondary-btn d-flex flex-column">
              <h2>Total: {evento.sale.total.toLocaleString()}</h2>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EventModal;
