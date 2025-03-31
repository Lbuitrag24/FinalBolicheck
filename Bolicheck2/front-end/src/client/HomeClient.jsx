import { React, useEffect, useState } from "react";
import fetchWithAuth from "../hooks/fetchwithauth";
import { toast } from "react-toastify";

const HomeClient = () => {
  const [products, setProducts] = useState([]);

  const fetchProducts = async () => {
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/products/offered_products/",
        {
          method: "GET",
        }
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        toast.error(
          "No hemos podido cargar los productos destacados, recarga la pàgina."
        );
      }
    } catch {
      toast.error(
        "No hemos podido cargar los productos destacados, estàs conectado a internet?"
      );
    }
  };
  useEffect(() => {
    document.title = "Cliente | Bolicheck";
    fetchProducts();
  }, []);
  return (
    <div className="client-form rounded-2 p-3">
      <center>
        <img className="ranita_home" src="/rana.png" alt="frog logo" />
      </center>
      <h1 className="stext-primary-title text-center">Play house</h1>
      <div className="d-flex justify-content-center gap-3 mt-3">
        <div className="col-12 col-lg-8 image-cont rounded-2">
          <h3 className="text-center mt-2">Productos en oferta</h3>
          <div className="d-flex justify-content-center gap-4 flex-wrap">
            {products.length > 0 ? (
              products.map((product, index) => (
                <div className="col-5 col-md-4 col-lg-5 col-xl-3 mb-4" key={index}>
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
                      <span className="text-center">{product.points} pts.</span>
                    </div>
                    <div className="card-body d-flex flex-column justify-content-between">
                      <div className="d-flex flex-column mt-3">
                        <img
                          src={`http://localhost:8080/media/${product.image}`}
                          alt={product.name}
                          className={`card-img-top product-image ${
                            !product.is_available || product.stock <= 0
                              ? "grayscale"
                              : ""
                          }`}
                        />
                        <h5 className="text-truncate mt-2 text-center">
                          {product.name}
                        </h5>
                        <h6 className="text-center text-secondary text-decoration-line-through">
                          Precio: ${product.price.toLocaleString()}
                        </h6>
                        <h6 className="text-center">
                          Con descuento:{" "}
                          <span className="stext-primary">
                            {product.offered_price > 0
                              ? "$" + product.offered_price.toLocaleString()
                              : " Gratis"}
                          </span>
                        </h6>
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
                      <div className="mt-2">
                        <p className="text-center description-truncate">
                          {product.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <h6 className="mt-3 mb-3">
                Lo sentimos, no hay ofertas disponibles en este momento.
              </h6>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeClient;
