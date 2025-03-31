import React, { useState, useEffect } from "react";
import fetchWithAuth from "../../hooks/fetchwithauth";
import "./cart.css";
import { toast } from "react-toastify";
import CalendarComponent from "../reservs/calendar";
import { MoonLoader } from "react-spinners";
import { motion } from "framer-motion";

const Cart = () => {
  useEffect(() => {
    document.title = "Tu carrito | Bolicheck";
  }, []);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState({ products: [] });
  const [cart2, setCart2] = useState({ prizes: [] });
  const [error, setError] = useState("");
  const [reserves, setReserves] = useState([]);
  const [events, setEvents] = useState([]);
  const [total, setTotal] = useState(0);
  const [total2, setTotal2] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(false);

  const formatDateTime = (dateTime) => {
    const dateObj = new Date(dateTime);
    const formattedDate = dateObj.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
    const formattedTime = dateObj.toLocaleTimeString("es-ES", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
    return `${formattedDate} a las ${formattedTime}`;
  };

  const deleteProduct = (productId) => {
    const storedCart = JSON.parse(localStorage.getItem("cart"));
    if (storedCart) {
      const updatedCart = {
        ...storedCart,
        products: storedCart.products.filter(
          (product) => product.id !== productId
        ),
      };
      localStorage.setItem("cart", JSON.stringify(updatedCart));
      setCart(updatedCart);
      updateTotal();
    }
  };

  const deletePrize = (prizeId) => {
    const storedCart2 = JSON.parse(localStorage.getItem("cart2"));
    if (storedCart2) {
      const updatedCart = {
        ...storedCart2,
        prizes: storedCart2.prizes.filter((prize) => prize.id !== prizeId),
      };
      localStorage.setItem("cart2", JSON.stringify(updatedCart));
      setCart2(updatedCart);
      updateTotal();
    }
  };

  const updateTotal = () => {
    const newTotal = cart.products.reduce((sum, product) => {
      const price = product.offered_price ?? product.price; 
      return sum + price * product.quantity;
    }, 0);
    
    setTotal(newTotal);
    window.dispatchEvent(new Event("cartUpdated"));
  };
  
  const updateTotalPrize = () => {
    const newTotal = cart2.prizes.reduce((sum, prize) => {
      return sum + prize.required_points * prize.quantity;
    }, 0);
    setTotal2(newTotal);
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity != 0) {
      setCart((prevCart) => {
        const updatedProducts = prevCart.products.map((product) =>
          product.id === productId ? { ...product, quantity } : product
        );
        return { ...prevCart, products: updatedProducts };
      });
      window.dispatchEvent(new Event("cartUpdated"));
      updateTotal();
    }
  };

  const updatePrizeQuantity = (prizeId, quantity) => {
    if (quantity != 0) {
      setCart2((prevCart) => {
        const updatedPrizes = prevCart.prizes.map((prize) =>
          prize.id === prizeId ? { ...prize, quantity } : prize
        );
        return { ...prevCart, prizes: updatedPrizes };
      });
      window.dispatchEvent(new Event("cartUpdated"));
      updateTotalPrize();
    }
  };

  const getTotalPrice = (price, quantity) => {
    return price * quantity;
  };

  const handleBuy = async () => {
    const ventaData = {
      products: cart.products,
    };
    if (cart.products.length > 0) {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/sales/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(ventaData),
          }
        );
        const data = await response.json();
        if (response.ok) {
          localStorage.removeItem("cart");
          setCart({ products: [] });
          toast.success(
            "¡Alistando tus polas! Cuando pases por ellas, estarán frías."
          );
          return data.id;
        } else {
          toast.error(data.message);
        }
      } catch (error) {
        toast.error(
          "No se ha podido agendar tu pedido, ¿estás conectado a internet?"
        );
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning(
        "Debes tener mínimo un producto en el carrito para realizar esta acción."
      );
    }
  };

  const handleReserve = async (eventData) => {
    const reservaData = {
      date_in: eventData.date_in,
      date_out: eventData.date_out,
      event_type_id: eventData.event_type_id,
      products: cart.products,
      num_people: eventData.num_people,
    };
    if (cart.products.length > 0) {
      setLoading(true);
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/reserves/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(reservaData),
          }
        );
        const data = await response.json();
        if (response.ok) {
          const newReserve = {
            title: `Reservado para un: ${data.event_type.event_type}`,
            start: new Date(eventData.date_in),
            end: new Date(eventData.date_out),
            color: "#00AD2B",
          };
          setReserves((prevReserves) => [...prevReserves, newReserve]);
          localStorage.setItem("cart", []);
          setCart({ products: [] });
          const formattedDateTime = formatDateTime(eventData.date_in);
          fetchEvents();
          toast.success(
            `¡Se armó el parche! Aquí te esperamos el ${formattedDateTime}`
          );
        } else {
          toast.error(data.message);
        }
      } catch {
        toast.error(
          "No hemos podido agendar tu reserva, estás conectado a internet?"
        );
      } finally {
        setLoading(false);
      }
    } else {
      toast.warning(
        "Debes tener mínimo un producto en el carrito para reservar."
      );
    }
  };

  const handleReserveDetails = (event) => {
    event.preventDefault();
    if (cart.products.length > 0) {
      setIsModalVisible(true);
    } else {
      toast.warning(
        "Debes tener mínimo un producto en el carrito para realizar esta acción."
      );
    }
  };

  const handleRedeem = async (event) => {
    event.preventDefault();
    const redeemData = {
      customer_id: localStorage.getItem("id"),
      prizes: cart2.prizes,
      is_redemption: true,
    };
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/sales/redeem/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(redeemData),
        }
      );
      const data = await response.json();
      if (response.ok) {
        toast.success(
          "Has redimido tus puntos satisfactoriamente, acèrcate a una de nuestras sedes con tu cèdula para recibir tu premio."
        );
        localStorage.setItem("cart2", []);
        setCart2({ prizes: [] });
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(
        "No ha sido posible redimir tus puntos, estàs conectado a internet?"
      );
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/reserves/reservesauth/",
        {
          method: "GET",
        }
      );
      const data = await response.json();
      setReserves(transformEvents(data));
    } catch (error) {
      setError("Error al cargar los eventos");
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  function transformEvents(apiData) {
    return apiData.map((event, index) => ({
      id: index + 1,
      title: `${event?.event_type?.event_type}, para ${event?.num_people} personas.`,
      start: new Date(event.date_in),
      end: new Date(event.date_out),
      color: `${event?.event_type ? "#00AD2B" : "#c42e0e"}`,
      ...(event?.sale ? { sale: event.sale } : {}),
      num_people: event.num_people,
    }));
  }

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedCart2 = localStorage.getItem("cart2");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
    if (storedCart2) {
      setCart2(JSON.parse(storedCart2));
    }
    updateTotal();
  }, []);

  useEffect(() => {
    updateTotal();
  }, [cart]);

  useEffect(() => {
    updateTotalPrize();
  }, [cart2]);

  if (loading) {
    return (
      <div className="client-form mt-5 p-3 col-9 mx-auto h-auto rounded-4 gap-3 d-flex flex-column">
        <div className="client-loader">
          <MoonLoader color="#00B47E" size={50} speedMultiplier={0.8} />
        </div>
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
      <div className="client-form p-3 col-12 col-lg-9 mx-auto h-auto rounded-4 gap-3 d-flex flex-column">
        {isModalVisible && (
          <div className="modal align-items-start align-items-md-center">
            <div className="modal-content">
              <button
                className=" btn client-products-primary-btn rounded-circle d-flex justify-content-center align-items-center"
                onClick={() => setIsModalVisible(false)}
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
              <CalendarComponent
                props={handleReserve}
                reserves={reserves}
                loading={loading}
              />
            </div>
          </div>
        )}
        <div className="client-products-card card col-12">
          <h2 className="mt-3 text-center stext-primary">Carrito</h2>
          <ul className="mt-3 list-unstyled">
            {cart.products.length > 0 ? (
              cart.products.map((product, index) => (
                <li
                  key={index}
                  className="card client-card col-10 mx-auto col-lg-10 d-flex flex-column flex-md-row gap-3 mb-3"
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    className="card mx-auto mx-lg-0 ma-lg-auto"
                    style={{
                      objectFit: "cover",
                      width: "15rem",
                      height: "15rem",
                      maxWidth: "15rem",
                    }}
                  />
                  <div className="my-auto w-100 d-inline-block overflow-hidden">
                    <h2 className="text-truncate col-12">
                      <span className="d-inline-flex align-items-center w-100 w-lg-25">
                        <span
                          className="text-truncate d-inline-block"
                          style={{ whiteSpace: "nowrap" }}
                        >
                          {product.name}
                        </span>
                        <span className="ms-2">x {product.quantity}</span>
                      </span>
                    </h2>
                    <h4
                      className="text-truncate col-12"
                      style={{ color: "gray" }}
                    >
                      {product.description}
                    </h4>
                    <p className="text-center text-md-start">
                      Precio unitario:{" "}
                      {product.offered_price != null ? (
                        <>
                          <span className="text-decoration-line-through text-secondary">
                            ${product.price.toLocaleString()}
                          </span>{" "}
                          {product.offered_price == 0 ? (
                            <span className="text-success fw-bold">Gratis</span>
                          ) : (
                            <span className="text-success fw-bold">
                              ${product.offered_price.toLocaleString()}
                            </span>
                          )}
                        </>
                      ) : (
                        <span>${product.price.toLocaleString()}</span>
                      )}
                    </p>
                    <p className="text-center text-md-start">
                      Precio total:{" "}
                      <b>
                        {getTotalPrice(
                          product.offered_price != null
                            ? product.offered_price
                            : product.price,
                          product.quantity
                        ) === 0 ? (
                          <span className="text-success fw-bold">Gratis</span>
                        ) : (
                          `$${getTotalPrice(
                            product.offered_price != null
                              ? product.offered_price
                              : product.price,
                            product.quantity
                          ).toLocaleString()}`
                        )}
                      </b>
                    </p>
                    <div className="d-flex flex-sm-row gap-3 align-items-center justify-content-center justify-content-md-start mb-2">
                      <button
                        className="btn client-dark-btn"
                        onClick={() =>
                          updateQuantity(product.id, product.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{product.quantity}</span>
                      <button
                        className="btn client-light-btn"
                        onClick={() =>
                          updateQuantity(product.id, product.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        className="btn client-thirdary-btn ml-5"
                        onClick={() => deleteProduct(product.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className="mt-2 text-center">
                No hay productos en el carrito.
              </p>
            )}
          </ul>
          <h2 className="text-center">
            Total:{" "}
            <b className="client-products-text-decorate">
              ${total.toLocaleString()}
            </b>
          </h2>
          <div className="col-12 d-flex justify-content-center gap-4 gap-lg-5 mt-3 mb-5">
            <button
              onClick={handleBuy}
              className="btn client-products-primary-btn col-3 col-lg-4"
            >
              Agendar
            </button>
            <div className="d-flex justify-content-center col-4 gap-3">
              <button
                onClick={handleReserveDetails}
                className="btn client-prizes-primary-btn col-9"
              >
                Reservar
              </button>
              <button
                onClick={() => setIsModalVisible(true)}
                className="btn client-secondary-btn col-4 col-lg-2"
              >
                <i className="bx bxs-calendar"></i>
              </button>
            </div>
          </div>
        </div>
        <div className="client-prizes-card card col-12">
          <h2 className="mt-3 text-center client-prizes-text-decorate">
            Redenciones
          </h2>
          <ul className="mt-4 list-unstyled">
            {cart2.prizes.length > 0 ? (
              cart2.prizes.map((prize, index) => (
                <li
                  key={index}
                  className="card client-prize-card col-10 mx-auto d-flex flex-column flex-md-row gap-3 mb-3 p-3"
                >
                  <img
                    src={prize.image}
                    alt={prize.name}
                    className="rounded-2 mx-auto mx-lg-0 ma-lg-auto"
                    style={{
                      objectFit: "cover",
                      width: "15rem",
                      height: "15rem",
                      maxWidth: "15rem",
                    }}
                  />
                  <div className="my-auto text-center text-md-start">
                  <h2 className="text-truncate col-12 text-center">
                      <span className="d-flex justify-content-center justify-content-md-start align-items-center w-100 w-lg-25">
                        <span
                          className="text-truncate d-inline-block"
                        >
                          {prize.name}
                        </span>
                        <span className="ms-2">x {prize.quantity}</span>
                      </span>
                    </h2>
                    <h4
                      className="text-truncate w-100"
                      style={{ color: "gray" }}
                    >
                      {prize.description}
                    </h4>
                    <p>Precio unitario: ${prize.required_points}</p>
                    <p>
                      Precio total:{" "}
                      <b>
                        ${getTotalPrice(prize.required_points, prize.quantity)}
                      </b>
                    </p>
                    <div className="d-flex flex-sm-row gap-3 align-items-center justify-content-center justify-content-md-start mb-2">
                      <button
                        className="btn client-dark-btn"
                        onClick={() =>
                          updatePrizeQuantity(prize.id, prize.quantity - 1)
                        }
                      >
                        -
                      </button>
                      <span>{prize.quantity}</span>
                      <button
                        className="btn client-light-btn"
                        onClick={() =>
                          updatePrizeQuantity(prize.id, prize.quantity + 1)
                        }
                      >
                        +
                      </button>
                      <button
                        className="btn client-thirdary-btn ml-5"
                        onClick={() => deletePrize(prize.id)}
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                </li>
              ))
            ) : (
              <p className="mt-2 text-center">No hay premios a redimir aún.</p>
            )}
          </ul>
          <h2 className="text-center">
            Total: <b className="client-prizes-text-decorate">{total2}pts.</b>
          </h2>
          <div className="col-10 d-flex mx-auto justify-content-center mt-3 mb-5">
            <button
              onClick={handleRedeem}
              className="btn client-products-primary-btn col-10"
            >
              Redimir
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Cart;
