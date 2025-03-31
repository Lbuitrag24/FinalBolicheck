import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "../../css/forms.css";
import fetchWithAuth from "../../hooks/fetchwithauth";
import useConfirmToast from "../../hooks/confirmToast";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const CategoryList = () => {
  useEffect(() => {
    document.title = "Categorías | Bolicheck";
  }, []);
  const confirmToast = useConfirmToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/categories/",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (response.ok) {
          const data = await response.json();
          setCategories(data);
        } else {
          toast.error(
            "Ha ocurrido un error al obtener las categorías, por favor, recarga la página."
          );
        }
      } catch {
        toast.error(
          "Ha ocurrido un error al obtener las categorías, estás conectado a internet?"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="text-center mt-5 col-7 mx-auto h-auto rounded-4">
        Cargando...
      </div>
    );
  }

  const handleDelete = async (id) => {
    const confirmed = await confirmToast(
      "Realmente quieres cambiar el estado de la categoría? Esto afectará también los productos asociados a la misma."
    );
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/categories/${id}/changestate/`,
        {
          method: "POST",
        }
      );
      const data = await response.json()
      if (response.ok) {
        setCategories((prevCategories) =>
          prevCategories.map((category) => 
            category.id === id ? { ...category, is_available: !category.is_available} : category
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(
        "Ha ocurrido un error al eliminar la categoría, estás conectado a internet?"
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
      <div className="col-12 col-lg-10 mx-auto h-auto rounded-4 form-style">
        <div className="d-flex">
        <h1 className="text-end ms-3 col-7 mt-3">Lista de Categorías</h1>
          <Link
            to="/admin/categories/new"
            className="btn new-btn-style col-3 mx-auto h-25 mt-4 text-truncate"
          >
            Nueva Categoría
          </Link>
        </div>
        <div className="container mt-4">
          <div className="row justify-content-center mt-4 mb-4 col-10 mx-auto">
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <div
                  className="col-12 col-md-6 col-lg-4 mb-3 d-flex justify-content-center"
                  key={index}
                >
                  <div className={`text-center card p-3 col-12 card-style ${category.is_available ? "categories" : "blocked"}`}>
                    <img
                      src={category.image}
                      alt={category.name}
                      className={`card-img-top ${!category.is_available && "grayscale"}`}
                      style={{
                        objectFit: "cover",
                        width: "100%",
                        height: "225px",
                        borderRadius: "10px",
                      }}
                    />
                    <h2 className="fs-5">
                      <b>{category.name}</b>
                    </h2>
                    <h6 className="text-center">{category.description}</h6>
                    <p className={`text-center ${!category.is_available ? "text-disabled" : ""}`}>
                        {category.is_available ? "Disponible" : "No disponible"}
                      </p>
                    <div className="card-actions d-flex justify-content-center gap-2">
                      <Link
                        to={`/admin/categories/edit/${category.id}`}
                        className="btn edit-btn-style"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleDelete(category.id)}
                        className={`btn ${category.is_available ? "delete-btn-style" : "new-btn-style"}`}
                      >
                        {category.is_available ? "Inhabilitar" : "Habilitar"}
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center col-12 mb-4">
                No hay categorías aún.
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryList;
