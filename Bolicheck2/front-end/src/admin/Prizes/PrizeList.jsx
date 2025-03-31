import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import fetchWithAuth from "../../hooks/fetchwithauth";
import useConfirmToast from "../../hooks/confirmToast";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

const PrizeList = () => {
  useEffect(() => {
          document.title = "Premios | Bolicheck"
      }, [])
  const confirmToast = useConfirmToast();
  const [prizes, setPrizes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrizes = async () => {
      try {
        const response = await fetchWithAuth(
          "http://localhost:8080/api/prizes/",
          {
            method: "GET",
          }
        );
        if (response.ok) {
          const data = await response.json();
          setPrizes(data);
        } else {
          toast.error("Ha ocurrido un error al obtener los premios, por favor, recarga la página.");
        }
      } catch (error) {
        toast.error("Ha ocurrido un error al obtener los premios, estás conectado a internet?");
      } finally {
        setLoading(false);
      }
    };
    fetchPrizes();
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
      "Realmente quieres cambiar el estado del premio?"
    );
    if (!confirmed) {
      return;
    }
    try {
      const response = await fetchWithAuth(
        `http://localhost:8080/api/prizes/${id}/changestate/`,
        {
          method: "POST",
        }
      );
      const data = await response.json()
      if (response.ok) {
        setPrizes((prevPrizes) =>
          prevPrizes.map((prize) => 
            prize.id === id ? { ...prize, is_available: !prize.is_available} : prize
          )
        );
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error("No ha sido posible eliminar el premio, estás conectado a internet?");
    }
  };

  return (
    <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
        >
    <div
      className="col-12 col-lg-9 mx-auto h-auto rounded-4 form-style "
    >
      <div className="d-flex justify-content-between">
        <h1 className="mt-4 text-end col-8">Lista de Premios</h1>
        <Link
          to="/admin/prizes/new"
          className="btn new-btn-style col-3 mx-auto h-25 mt-4 text-truncate"
        >
          Nuevo Premio
        </Link>
      </div>
      <div className="row justify-content-center gap-lg-1 mt-4 mb-4 col-10 mx-auto">
        {prizes.length > 0 ? (
          prizes.map((prize, index) => (
            <div className="col-12 col-md-8 col-lg-3 mb-4" key={index}>
                <div className={`card h-100 card-style ${prize.is_available ? "prizes" : "blocked"} `}>
                  <div className="card-body d-flex flex-column justify-content-between">
                  <div className={`d-flex justify-content-center align-items-center ${prize.is_available ? "points-badge" : "circle-points-blocked"}`}>
                      <span className="text-center" style={{ color: "white", fontWeight: "bold" }}>
                        {prize.required_points} pts
                      </span>
                    </div>
                    <div className="d-flex flex-column mt-3">
                      <img
                        src={prize.image}
                        alt={prize.name}
                        className={`card-img-top ${!prize.is_available && "grayscale"}`}
                        style={{
                          objectFit: "cover",
                          width: "100%",
                          height: "300px",
                          borderRadius: "10px",
                        }}
                      />
                      <h5 className="mt-2 text-center"><b>{prize.name}</b></h5>
                      <h6 className="text-center">Stock: {prize.stock}</h6>
                      <p className={`text-center ${!prize.is_available ? "text-disabled" : ""}`}>
                        {prize.is_available ? "Disponible" : "No disponible"}
                      </p>
                    </div>
                    <div className="mt-2">
                      <p className="text-center">{prize.description}</p>
                    </div>
                    <div className="d-flex justify-content-center gap-2">
                      <a
                        href={`/admin/prizes/edit/${prize.id}`}
                        className="btn edit-btn-style"
                      >
                        Editar
                      </a>
                      <button
                        onClick={() => handleDelete(prize.id)}
                        className={`btn ${prize.is_available ? "delete-btn-style" : "new-btn-style"}`}
                      >
                        {prize.is_available ? "Inabilitar" : "Habilitar"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          )
        ) : (
          <div className="text-center col-12 mb-4">No hay premios aún.</div>
        )}
      </div>
    </div>
    </motion.div>
  );
};

export default PrizeList;
