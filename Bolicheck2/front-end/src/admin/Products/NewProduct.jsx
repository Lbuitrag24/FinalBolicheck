import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

const NewProduct = () => {
  useEffect(() => {
    document.title = "Crear Producto | Bolicheck";
  }, []);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [points, setPoints] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [image, setImage] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [min_stock, setMinStock] = useState("");
  const [max_stock, setMaxStock] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:8080/api/categories/`,
          {
            method: "GET",
          }
        );
        if (!response.ok) {
          setError(
            "Ha ocurrido un error al buscar las categorías, recarga la página."
          );
        }
        const data = await response.json();
        setCategories(data);
      } catch (error) {
        setError(
          "Ha ocurrido un error al buscar las categorías, estás conectado a internet?."
        );
      }
    };
    fetchCategories();
  }, []);
  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("description", description);
    formData.append("points", points);
    formData.append("category_id", category);
    formData.append("min_stock", min_stock);
    formData.append("max_stock", max_stock);
    if (image) {
      formData.append("image", image);
    }
    try {
      const response = await fetchWithAuth(
        "http://localhost:8080/api/products/",
        {
          method: "POST",
          body: formData,
        }
      );
      const data = await response.json();
      if (response.ok) {
        if (!image) {
          toast.warning(
            "No has seleccionado una imagen, asignaremos una por defecto."
          );
        }
        setName("");
        setDescription("");
        setPrice(0);
        setPoints(0);
        setCategory(0);
        setImage(null);
        navigate("/admin/products");
      } else {
        for (const field in data) {
          data[field].forEach((msg) => toast.error(`${field}: ${msg}`));
        }
      }
    } catch (error) {
      toast.error(
        "No hemos podido crear el producto, estás conectado a internet?"
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
      <div className="d-flex flex-column col-12 col-lg-7 mx-auto h-auto rounded-4 form-style p-3">
        <h1 className="text-center mt-3">Crear Producto</h1>
        {error && (
          <div className="alert alert-danger text-center col-10 mx-auto">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column">
          <div className="d-flex flex-column">
            <div>
              <label className="text-center col-12">Nombre:</label>
              <input
                type="text"
                className="form-control mx-auto"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Precio:</label>
              <input
                type="number"
                className="form-control mx-auto"
                value={price}
                min="0"
                onChange={(e) => setPrice(Number(e.target.value))}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">
                Descripción del producto:
              </label>
              <textarea
                type="number"
                className="form-control mx-auto"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Stock Mínimo:</label>
              <input
                type="number"
                className="form-control mx-auto"
                value={min_stock}
                min="0"
                onChange={(e) => setMinStock(e.target.value)}
                onBlur={() =>
                  setMinStock(min_stock === "" ? "" : Number(min_stock))
                }
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Stock Máximo:</label>
              <input
                type="number"
                className="form-control mx-auto"
                value={max_stock}
                onChange={(e) => setMaxStock(e.target.value)}
                onBlur={() =>
                  setMaxStock(max_stock === "" ? "" : Number(max_stock))
                }
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">
                Puntos ganados al comprar el producto:
              </label>
              <input
                type="number"
                className="form-control mx-auto"
                value={points}
                min="0"
                onChange={(e) => setPoints(Number(e.target.value))}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Categoría:</label>
              <select
                className="form-control mx-auto"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categories && categories.length > 0 ? (
                  categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>
                    Cargando categorías...
                  </option>
                )}
              </select>
            </div>
            <br />
            <div>
              <label className="text-center col-12">Imagen:</label>
              <input
                type="file"
                className="form-control mx-auto"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
              />
            </div>
            <div className="d-flex mx-auto gap-5">
              <Link
                className="btn delete-btn-style mx-auto mt-5 mb-5"
                to="/admin/products"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                className="btn secondary-btn-style mx-auto mt-5 mb-5"
              >
                Guardar Producto
              </button>
            </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default NewProduct;
