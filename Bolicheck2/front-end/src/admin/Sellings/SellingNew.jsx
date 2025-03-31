import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import useConfirmToast from "../../hooks/confirmToast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import "./sellings.css";
import "../../css/NewSellings.css";

const SellingNew = () => {
  useEffect(() => {
    document.title = "Registrar Venta | Bolicheck";
  }, []);
  const confirmToast = useConfirmToast();
  const [date, setDate] = useState("");
  const [total, setTotal] = useState(0);
  const [id_customer_id, setCustomerId] = useState(null);
  const [isReadonly, setIsReadonly] = useState(false);
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const navigate = useNavigate();

  const fetchProductData = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/products/",
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error(
          "No ha sido posible cargar los productos, vuélvelo a intentar."
        );
      }
    } catch (error) {
      toast.error(
        "No ha sido posible cargar los productos, estás conectado a internet?"
      );
    }
  };

  useEffect(() => {
    if (id_customer_id === "Invitado") {
      setCustomerId(null);
    }
  }, [id_customer_id]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/staff/users/",
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        } else {
          toast.error(
            "No ha sido posible cargar los usuarios, vuélvelo a intentar."
          );
        }
      } catch (error) {
        toast.error(
          "No ha sido posible cargar los usuarios, estás conectado a internet?"
        );
      }
    };
    fetchUsers();
    fetchProductData();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (cart.length === 0) {
      toast.error(
        "Debes colocar mínimo un producto en el carrito para registrar una venta."
      );
      return;
    }
    setLoading(true);
    if (id_customer_id == null) {
      const isConfirmed = await confirmToast(
        "No has registrado ningún cliente en la venta, ¿quieres continuar?"
      );
      if (!isConfirmed) {
        setLoading(false);
        return;
      }
    }
    const ventaData = {
      date,
      customer_id: id_customer_id,
      products: cart,
    };
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/staff/sales/",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ventaData),
        }
      );
      const data = await response.json()
      if (response.ok) {
        toast.success("Venta registrada");
        setCart([]);
        fetchProductData();
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error(
        "Ha ocurrido un error al registrar la venta, estás conectado a internet?"
      );
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const updateTotal = () => {
    const newTotal = cart.reduce((sum, product) => {
      return sum + (product.offered_price ? product.offered_price : product.price) * product.quantity;
    }, 0);
    setTotal(newTotal);
  };

  const updateCart = (product, quantity) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      const updatedCart = prevCart
        .map((item) => (item.id === product.id ? { ...item, quantity } : item))
        .filter((item) => item.quantity > 0);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity } : item
        );
      } else {
        return [...prevCart, { ...product, quantity }];
      }
    });
    updateTotal();
  };

  const deleteProduct = (productId) => {
    setCart((prevCart) =>
      prevCart.filter((product) => product.id !== productId)
    );
  };

  useEffect(() => {
    const newTotal = cart.reduce(
      (sum, product) => sum + (product.offered_price ? product.offered_price : product.price) * product.quantity,
      0
    );
    setTotal(newTotal);
  }, [cart]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.3 }}
    >
      <div className="col-12 col-lg-8 mx-auto h-auto rounded-4 form-style py-4">
        <h1 className="text-center">Crear Nueva Venta</h1>
        <div className="mt-4 d-flex flex-column">
          <div className="mb-3 d-flex flex-column">
            <label htmlFor="date" className="form-label text-center col-12">
              Fecha de la Venta
            </label>
            <input
              type="date"
              id="date"
              className={`form-control w-50 mx-auto ${
                isReadonly ? "readonly-field" : ""
              } inner-input-style`}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              readOnly={isReadonly}
              required
            />
          </div>
          <div className="mb-3">
            <label htmlFor="user_id" className="form-label col-12 text-center">
              Seleccionar Usuario
            </label>
            <select
              id="user_id"
              className={`form-control w-50 mx-auto ${
                isReadonly ? "readonly-field" : ""
              } inner-select-style`}
              value={id_customer_id}
              onChange={(e) => {
                const selectedUserId = e.target.value;
                setCustomerId(selectedUserId);
              }}
              readOnly={isReadonly}
              required
            >
              <option value={null}>Invitado</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.username} {user.identification_number}
                </option>
              ))}
            </select>
          </div>
          <hr
            className="col-8 mx-auto"
            style={{ color: "white", border: "1.5px solid" }}
          />
          <div className="d-flex flex-column">
            <h2 className="text-center">Productos</h2>
            <input
              type="text"
              placeholder="Busca un producto por su nombre o categoría."
              className="form-control w-50 mx-auto mb-3 inner-input-style"
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div
              className="card grid col-9 mx-auto flex-row flex-wrap justify-content-center gap-3 py-4 overflow-auto products-grid"
              style={{ height: "50vh" }}
            >
              {products.length > 0 ? (
                filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => {
                    const cartItem = cart.find(
                      (item) => item.id === product.id
                    );
                    const quantity = cartItem ? cartItem.quantity : 0;
                    return (
                      <div className="card col-12 col-md-6 col-lg-4 position-relative card-style products">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="card mx-auto"
                          style={{
                            objectFit: "cover",
                            height: "15rem",
                            maxWidth: "80%",
                            marginTop: "5%",
                            filter: product.is_available
                              ? "none"
                              : "grayscale(100%)",
                          }}
                        />
                        <div
                          className="d-flex justify-content-center align-items-center cart-points-badge"
                        >
                          <span
                            className="text-center"
                            style={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.8rem",
                            }}
                          >
                            {product.points} pts.
                          </span>
                        </div>
                        <div
                          className="d-flex mx-auto justify-content-center align-items-center"
                          style={{
                            backgroundColor: product.stock > 0 ? "#0259a5" : "black",
                            width: "80px",
                            height: "40px",
                            position: "relative",
                            top: "-2%",
                          }}
                        >
                          <span
                            className="text-center"
                            style={{
                              color: "white",
                              fontWeight: "bold",
                              fontSize: "0.7rem",
                            }}
                          >
                            {product.stock} disponibles
                          </span>
                        </div>
                        <h6
                          className="text-center w-75 mx-auto rounded-5 category-badge"
                        >
                          {product.category.name}
                        </h6>
                        <h6 className="text-center mb-0"><b>{product.name}</b></h6>
                        <p
                          className="text-center mb-0"
                        >
                          {product.description}
                        </p>
                        <h5 className="text-center">{product.offered_price ? <><del>${product.price}</del> <span className="text-success">${product.offered_price}</span></> : `$${product.price}`} C/U</h5>
                        {product.is_available ? (
                          <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                            <button
                              className="d-flex btn cart-delete-btn-style h-75 align-items-center"
                              onClick={() =>
                                updateCart(product, Math.max(0, quantity - 1))
                              }
                              disabled={quantity === 0}
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={quantity}
                              onChange={(e) => {
                                const newQuantity = Math.min(
                                  product.stock,
                                  Math.max(0, Number(e.target.value))
                                );
                                updateCart(product, newQuantity);
                              }}
                              className="text-center rounded-5"
                              style={{ width: "50px", textAlign: "center" }}
                              min="0"
                              max={product.stock}
                            />
                            <button
                              className="d-flex btn cart-add-btn-style h-75 align-items-center"
                              onClick={() =>
                                updateCart(
                                  product,
                                  Math.min(product.stock, quantity + 1)
                                )
                              }
                              disabled={quantity >= product.stock}
                            >
                              +
                            </button>
                          </div>
                        ) : (
                          <h6 className="text-center mt-2 mb-3">
                            Producto no disponible
                          </h6>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <p style={{color:"white"}}>
                    Tu búsqueda "{searchTerm}" no arrojó resultados, inténtalo
                    con otro término.
                  </p>
                )
              ) : (
                <p>No hay productos.</p>
              )}
            </div>
          </div>

          <div className="d-flex flex-column">
            <h2 className="text-center">Carrito</h2>
            <div
              className="card grid col-9 mx-auto flex-row flex-wrap justify-content-center gap-4 py-4 overflow-auto search-form-style"
              style={{ height: "50vh" }}
            >
              {cart.length > 0 ? (
                cart.map((product) => {
                  const cartItem = cart.find((item) => item.id === product.id);
                  const quantity = cartItem ? cartItem.quantity : 0;
                  return (
                    <div
                      className="card flex-md-row col-10 position-relative py-3 card-style products"
                    >
                      <div className="col-12 col-md-3 d-flex justify-content-center p-3">
                        <img
                          src={product.image}
                          alt={product.name}
                          className="col-12 rounded-3 h-100 h-lg-auto"
                          style={{
                            objectFit: "cover",
                            filter: product.is_available
                              ? "none"
                              : "grayscale(100%)",
                          }}
                        />
                      </div>
                      <div className="d-flex flex-column col-12 col-md-5">
                        <h6 className="text-center col-12 col-md-6 mx-auto rounded-5 category-badge">
                          {product.category.name}
                        </h6>
                        <h6 className="text-center text-truncate mb-2"><b>{product.name}</b></h6>
                        <p
                          className="text-center mb-3"
                        >
                          {product.description}
                        </p>
                        <h5 className="text-center">{product.offered_price ? <><del>${product.price}</del> <span className="text-success">${product.offered_price}</span></> : `$${product.price}`} C/U</h5>
                        <div className="d-flex justify-content-center align-items-center gap-2 mb-2">
                          <button
                            className="d-flex btn cart-delete-btn-style h-75 align-items-center"
                            onClick={() => deleteProduct(product.id)}
                          >
                            <i
                              className="bx bx-trash"
                              style={{ fontSize: "24px" }}
                            ></i>
                          </button>
                          <button
                            className="d-flex btn cart-delete-btn-style h-75 align-items-center"
                            onClick={() =>
                              updateCart(product, Math.max(0, quantity - 1))
                            }
                            disabled={quantity === 0}
                          >
                            -
                          </button>
                          <input
                            type="number"
                            value={quantity}
                            onChange={(e) => {
                              const newQuantity = Math.min(
                                product.stock,
                                Math.max(0, Number(e.target.value))
                              );
                              updateCart(product, newQuantity);
                            }}
                            className="text-center rounded-5"
                            style={{ width: "50px", textAlign: "center" }}
                            min="0"
                            max={product.stock}
                          />
                          <button
                            className="d-flex btn cart-add-btn-style h-75 align-items-center"
                            onClick={() =>
                              updateCart(
                                product,
                                Math.min(product.stock, quantity + 1)
                              )
                            }
                            disabled={quantity >= product.stock}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <div className="d-flex flex-column align-items-center justify-content-center col-12 col-md-4">
                        <h4 className="text-center">
                          Total: ${quantity * (product.offered_price ? product.offered_price : product.price)}
                        </h4>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>No has agregado productos al carrito.</p>
              )}
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="total" className="form-label col-12 text-center">
              Total:
            </label>
            <h4 className="text-center">${total}</h4>
          </div>

          <div className="d-flex mx-auto gap-5">
          <Link
              className="btn delete-btn-style mb-5"
              to="/admin/sellings"
            >
              Volver
            </Link>
            <button
              onClick={handleSubmit}
              type="submit"
              className="btn new-btn-style mb-5"
              disabled={loading}
            >
              {loading ? "Guardando..." : "Registrar Venta"}
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default SellingNew;

