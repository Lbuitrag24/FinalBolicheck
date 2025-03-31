import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import "./product.css";
import { MoonLoader } from "react-spinners";
import { motion } from "framer-motion";

const ClientProductList = () => {
  useEffect(() => {
    document.title = "Productos | Bolicheck";
  }, []);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [cart, setCart] = useState({ products: [] });
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [modalVisible, setIsModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const maxPrice = products.reduce(
    (max, p) => (p.price > max ? p.price : max),
    0
  );
  const [price, setPrice] = useState(maxPrice);

  const handlePriceChange = (e) => {
    setPrice(Number(e.target.value));
  };

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (storedCart) {
      setCart(JSON.parse(storedCart));
    }
  }, []);

  const addToCart = (product, quantity) => {
    if (quantity > product.stock) {
      toast.error(
        `No puedes agregar más de ${product.stock} unidades de este producto.`
      );
      return;
    }

    const productExists = cart.products.some((item) => item.id === product.id);
    if (productExists) {
      let validUpdate = true;
      const updatedProducts = cart.products.map((item) => {
        if (item.id === product.id) {
          if (item.quantity + quantity > product.stock) {
            toast.error(
              `No puedes agregar más de ${product.stock} unidades de este producto.`
            );
            validUpdate = false;
            return item;
          }
          return { ...item, quantity: item.quantity + quantity };
        }
        return item;
      });
      if (!validUpdate) return;
      const updatedCart = { ...cart, products: updatedProducts };
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    } else {
      const updatedCart = {
        ...cart,
        products: [...cart.products, { ...product, quantity }],
      };
      setCart(updatedCart);
      localStorage.setItem("cart", JSON.stringify(updatedCart));
    }
    window.dispatchEvent(new Event("cartUpdated"));
    toast.success(
      `El producto '${product.name}' x ${quantity} ha sido agregado al carrito.`
    );
    toast.info(`El valor de tu carrito ha sido actualizado.`);
  };

  useEffect(() => {
    const fetchProducts = async () => {
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
          setError("Error al obtener los productos.");
          console.error("ERROR al obtener productos");
        }
      } catch (error) {
        setError("Error de conexión.");
        console.error("ERROR de conexión", error);
      } finally {
        setLoading(false);
      }
    };
    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/categories/",
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          toast.error("Error al obtener los productos.");
        }
      } catch (error) {
        toast.error(
          "Error al obtener los productos, estás conectado a internet?"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const categoryMatch =
      !selectedCategories.length ||
      selectedCategories.includes(String(product.category.id));

    const priceMatch = price === 0 || product.price <= price;

    return categoryMatch && priceMatch;
  });

  const handleCategoryClick = (id) => {
    setSelectedCategories((prevCategories) =>
      prevCategories.includes(String(id))
        ? prevCategories.filter((category) => category !== String(id))
        : [...prevCategories, String(id)]
    );
  };

  const handleModal = (product) => {
    setSelectedProduct(product);
    setIsModalVisible(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 200 }}
      transition={{ duration: 0.3 }}
      className="d-flex flex-column flex-lg-row gap-3"
    >
      {modalVisible && (
        <div className="event-modal d-flex justify-content-center align-items-center">
          <div
            className={`d-flex flex-column product-modal w-25 h-auto p-4 rounded-4 shadow-lg ${
              selectedProduct.is_available
                ? "client-products-card"
                : "client-card-blocked"
            }`}
          >
            <button
              className="close-btn"
              onClick={() => setIsModalVisible(false)}
            >
              ✖
            </button>
            <h2 className="text-center product-name">{selectedProduct.name}</h2>
            <img
              src={selectedProduct.image}
              alt={selectedProduct.name}
              className={`product-image d-flex w-50 mx-auto ${
                !selectedProduct.is_available || selectedProduct.stock <= 0
                  ? "grayscale"
                  : ""
              }`}
            />
            <p className="category-badge col-4 mx-auto mt-2">
              {selectedProduct.category.name}
            </p>
            <p className="description text-center mb-0">
              {selectedProduct.description}
            </p>
            <p className="description text-center mt-0">
              Por compra de este producto ganas:{" "}
              <span className="stext-primary-stroke">
                {selectedProduct.points.toLocaleString()} puntos
              </span>
            </p>
            <div className="product-info">
              <span className="price">
                ${selectedProduct.price.toLocaleString()}
              </span>
              <span
                className={`stock ${
                  selectedProduct.stock > 0 ? "in-stock" : "out-of-stock"
                }`}
              >
                {selectedProduct.stock > 0
                  ? `Stock: ${selectedProduct.stock}`
                  : "Agotado"}
              </span>
            </div>
            <div className="d-flex col-12">
              {selectedProduct.is_available && (
                <input
                  type="number"
                  min="1"
                  defaultValue="1"
                  id={`quantity-${selectedProduct.id}`}
                  className="client-products-mini-input form-control"
                  style={{ width: "60px" }}
                />
              )}
              <button
                className={`btn ${
                  selectedProduct.is_available
                    ? "client-products-primary-btn"
                    : ""
                } col`}
                onClick={() => {
                  const quantity = parseInt(
                    document.getElementById(`quantity-${selectedProduct.id}`)
                      .value
                  );
                  if (quantity > selectedProduct.stock) {
                    toast.error(
                      `Ups, solo hay ${selectedProduct.stock} unidades disponibles de ${selectedProduct.name}.`
                    );
                    return;
                  }
                  addToCart(selectedProduct, quantity);
                }}
                disabled={
                  !selectedProduct.is_available || selectedProduct.stock <= 0
                }
              >
                {selectedProduct.is_available && selectedProduct.stock > 0
                  ? "Agregar al carrito"
                  : "No Disponible"}
              </button>
            </div>
          </div>
        </div>
      )}
      <div className="filter-form client-form card col-12 col-lg-2">
        <h5 className="text-center mt-4">Filtra por categoría</h5>
        {categories.map((category, index) =>
          category.is_available ? (
            <label key={index} className="custom-checkbox d-flex px-4">
              <input
                type="checkbox"
                onChange={() => handleCategoryClick(category.id)}
              />
              <span className="checkmark"></span>
              <span>{category.name}</span>
            </label>
          ) : null
        )}
        <div className="mt-5 mb-5">
          <h5 className="text-center">Filtra por precio</h5>
          <div className="d-flex flex-column col-9 mx-auto">
            <div className="d-flex col-12 mx-auto">
              <span className="ma-auto">$0</span>
              <span className="ms-auto">${price.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min="0"
              max={maxPrice + 100}
              value={price}
              onChange={handlePriceChange}
              step={100}
              className="custom-range w-75 mx-auto"
            />
          </div>
        </div>
      </div>
      <div className="client-form col-12 col-lg-10 mx-auto h-auto rounded-4">
        {loading ? (
          <div className="client-loader">
            <MoonLoader color="#00B47E" size={50} speedMultiplier={0.8} />
          </div>
        ) : (
          <>
            <div className="d-flex justify-content-between">
              <h1
                className="mt-3 text-center col-12"
                style={{ color: "white" }}
              >
                Lista de{" "}
                <span className="client-products-text-decorate">Productos</span>
              </h1>
            </div>
            <div className="row mt-4 col-10 gap-1 mx-auto justify-content-center">
              {filteredProducts.length > 0 ? (
                filteredProducts.map((product, index) => (
                  <div className="col-sm-12 col-md-5 col-xl-4 col-xxl-3 mb-4 mb-4" key={index}>
                    <div
                      className={`${
                        product.is_available
                          ? "client-products-card"
                          : "client-card-blocked"
                      } card h-100`}
                    >
                      <div
                        className={`${
                          product.is_available
                            ? "circle-products-points"
                            : "circle-points-blocked"
                        }`}
                      >
                        <span className="text-center">
                          {product.points} pts.
                        </span>
                      </div>
                      <div className="card-body d-flex flex-column justify-content-between">
                        <div className="d-flex flex-column mt-3">
                          <div className="product-container">
                            <img
                              src={product.image}
                              alt={product.name}
                              className={`card-img-top product-image ${
                                !product.is_available || product.stock <= 0
                                  ? "grayscale"
                                  : ""
                              }`}
                            />
                            <button
                              onClick={() => handleModal(product)}
                              className="btn btn-dark col-3 product-button"
                            >
                              Ver
                            </button>
                          </div>
                          <h5 className="text-truncate mt-2 text-center">
                            {product.name}
                          </h5>
                          <h6
                            className={`text-center ${
                              product.offered_price != null &&
                              "text-secondary text-decoration-line-through"
                            }`}
                          >
                            Precio: ${product.price.toLocaleString()}
                          </h6>
                          {product.offered_price != null && (
                            <h6 className="text-center text-success">
                              Precio (Con descuento):
                              {product.offered_price > 0
                                ? "$" + product.offered_price.toLocaleString()
                                : " Gratis"}
                            </h6>
                          )}
                          <p
                            className={`text-center ${
                              product.is_available
                                ? "stext-primary-stroke"
                                : "stext-thirdary"
                            }`}
                          >
                            {product.is_available && product.stock > 0
                              ? "Disponible"
                              : "No disponible"}
                          </p>
                        </div>
                        <h6 className="text-center">{product.stock}unds.</h6>
                        <div className="mt-2">
                          <p className="text-center description-truncate">
                            {product.description}
                          </p>
                        </div>
                        {product.is_available && product.stock > 0 ? (
                          <div className="d-flex justify-content-center gap-3">
                            <input
                              type="number"
                              min="1"
                              defaultValue="1"
                              id={`quantity-${product.id}`}
                              className="client-products-mini-input form-control"
                              style={{ width: "60px" }}
                            />
                            <button
                              className="btn client-products-primary-btn"
                              onClick={() => {
                                const quantity = parseInt(
                                  document.getElementById(
                                    `quantity-${product.id}`
                                  ).value
                                );
                                if (quantity > product.stock) {
                                  toast.error(
                                    `Ups, solo hay ${product.stock} unidades disponibles de ${product.name}.`
                                  );
                                  return;
                                }
                                addToCart(product, quantity);
                              }}
                            >
                              Agregar al carrito
                            </button>
                          </div>
                        ) : (
                          <h6
                            className="text-center"
                            style={{ color: "white" }}
                          >
                            Este producto no está disponible
                          </h6>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div
                  className="text-center col-12 mb-4"
                  style={{ color: "white" }}
                >
                  No hay productos aún.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </motion.div>
  );
};

export default ClientProductList;
