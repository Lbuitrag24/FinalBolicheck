import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import fetchWithAuth from "../../hooks/fetchwithauth";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";

const EditProduct = () => {
  useEffect(() => {
    document.title = "Editar Producto | Bolicheck";
  }, []);

  const { id } = useParams();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [points, setPoints] = useState("");
  const [min_stock, setMinStock] = useState("");
  const [max_stock, setMaxStock] = useState("");
  const [is_available, setIsAvailable] = useState(true);
  const [category, setCategory] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const handleImageClick = () => {
    document.getElementById("fileInput").click();
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/categories/",
          { method: "GET" }
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
          "Ha ocurrido un error al buscar las categorías, ¿estás conectado a internet?"
        );
      }
    };
    fetchCategories();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => setImagePreview(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetchWithAuth(
          `http://localhost:8080/api/products/${id}/`,
          { method: "GET" }
        );
        if (!response.ok) {
          throw new Error("Error al obtener el producto.");
        }
        const data = await response.json();
        setName(data.name);
        setDescription(data.description);
        setPrice(data.price);
        setStock(data.stock);
        setMinStock(data.min_stock);
        setMaxStock(data.max_stock);
        setPoints(data.points);
        setIsAvailable(data.is_available);
        setCategory(data.category);
        setImagePreview(data.image);
      } catch (error) {
        toast.error("Error al obtener el producto:", error);
      }
    };
    fetchProduct();
  }, [id]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();
    if (imageFile) {
      formData.append("image", imageFile);
    }
    formData.append("name", name);
    formData.append("description", description);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("points", points);
    formData.append("min_stock", min_stock);
    formData.append("max_stock", max_stock);
    formData.append("is_available", is_available ? "True" : "False");
    formData.append(
      "category_id",
      typeof category === "object" ? category.id : category
    );
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/products/${id}/`,
        {
          method: "PATCH",
          body: formData,
        }
      );
      const data = await response.json();
      if (!response.ok) {
        if (data && typeof data === "object") {
            Object.values(data).forEach(errors => {
                errors.forEach(error => toast.error(error));
            });
        } else {
            toast.error("Error desconocido.");
        }    
      } else {
        toast.success("Producto actualizado exitosamente");
        navigate("/admin/products");
      }
    } catch (error) {
      toast.error("Error al actualizar el producto:", error);
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
        <h1 className="text-center mt-3">Editar Producto</h1>
        {error && (
          <div className="alert alert-danger text-center col-10 mx-auto">
            {error}
          </div>
        )}
        <form
          onSubmit={handleSubmit}
          className="mt-4 col-10 col-lg-6 mx-auto d-flex flex-column"
        >
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
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Descripción:</label>
              <textarea
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
              <label className="text-center col-12">Puntos:</label>
              <input
                type="number"
                className="form-control mx-auto"
                min="0"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                required
              />
            </div>
            <br />
            <div>
              <label className="text-center col-12">Categoría: </label>
              <select
                className="form-control mx-auto"
                value={category ? category.id : ""}
                onChange={(e) => setCategory(Number(e.target.value))}
                required
              >
                <option value="">Seleccione una categoría</option>
                {categories.length > 0 ? (
                  categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
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
            <label className="text-center mt-3">Imágen actual:</label>
            <div
              className="image-container w-100 w-lg-75 mx-auto"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
              onClick={handleImageClick}
            >
              <img
                src={imagePreview}
                className={`image ${isHovered ? "hovered" : ""}`}
                alt="Preview"
              />
              {isHovered && <div className="overlay-text">Editar</div>}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                className="hidden-input"
                onChange={handleFileChange}
              />
            </div>
            <div className="mx-auto d-flex gap-5">
            <Link to="/admin/products" className="btn delete-btn-style mx-auto mt-5 mb-5">
                Cancelar
            </Link>
            <button
              type="submit"
              className="btn secondary-btn-style mx-auto mt-5 mb-5"
            >
              Actualizar Producto
            </button>
          </div>
          </div>
        </form>
      </div>
    </motion.div>
  );
};

export default EditProduct;
