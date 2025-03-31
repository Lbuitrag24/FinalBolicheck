import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";

const UserView = () => {
    useEffect(() => {
            document.title = "Usuario | Bolicheck"
    }, [])
    const { id } = useParams(); 
    const [user, setUser] = useState(null); 
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const response = await fetch(`http://localhost:8080/admin/users/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${localStorage.getItem("token")}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setUser(data);
                } else {
                    setError("Error al obtener el usuario.");
                    console.error("ERROR al obtener el usuario");
                }
            } catch (error) {
                setError("Error de conexión.");
                console.error("ERROR de conexión", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [id]);

    if (loading) {
        return <div className="text-center mt-5 col-7 mx-auto h-auto rounded-4">Cargando...</div>;
    }

    if (error) {
        return <div className="text-center mt-5 col-7 mx-auto h-auto rounded-4">{error}</div>;
    }

    return (
        <div className="mt-5 col-9 mx-auto h-auto rounded-4" style={{ backgroundColor: "white" }}>
            {user ? (
                <div className="card">
                    <div className="d-flex">
                        <h1 className="text-center col-12 mt-3">Detalles del Usuario</h1>
                    </div>
                    <div className="col-8 mx-auto text-center card" style={{backgroundColor:"#d1d1d1"}}>
                        <h2>{user.first_name} {user.last_name}</h2>
                        <h4>Email: {user.email}</h4>
                        <h5>Teléfono: {user.telephone}</h5>
                        <h5>Identificación: {user.identification}</h5>
                        <h5>Puntos: {user.points}</h5>
                        <h5>Rol: {user.role_name}</h5>
                    </div>

                    <div className="col-10 mx-auto mt-4 card text-center">
                        <h3>Ventas</h3>
                        {user.ventasDTO.length > 0 ? (
                            <ul>
                                {user.ventasDTO.map((venta, index) => (
                                    <li key={index}>{venta}</li> 
                                ))}
                            </ul>
                        ) : (
                            <p>No hay ventas registradas.</p>
                        )}
                    </div>

                    <div className="col-10 mx-auto mt-4 card text-center mb-5">
                        <h3>Reservas</h3>
                        {user.reservasDTO.length > 0 ? (
                            <ul>
                                {user.reservasDTO.map((reserva, index) => (
                                    <li key={index}>{reserva}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>No hay reservas registradas.</p>
                        )}
                    </div>
                </div>
            ) : (
                <div className="text-center">No se encontró al usuario.</div>
            )}
        </div>
    );
};

export default UserView;