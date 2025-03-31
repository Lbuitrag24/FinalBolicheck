import { React, useEffect } from "react";
import { Link } from "react-router-dom";
import "../client/products/product.css";

const AdminLayout = ({ children }) => {
  if (!children) {
    useEffect(() => {
      document.title = "Home | Bolicheck";
    }, []);
  }
  const LayoutStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  };

  return (
    <div style={LayoutStyle} className="align-items-center fondo_pagina">
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark col-12">
        <div className="container-fluid">
          <Link className="navbar-brand" to="/admin/dashboard">
            <img className="logo" src="/rana.png" />
          </Link>
          <div className="d-flex d-lg-none gap-4 align-items-center justify-content-center col-8">
            <div className="d-flex flex-column align-items-center text-white">
              <h6 className="text-center m-0">
                {localStorage.getItem("username")}
              </h6>
              <p className="text-center m-0">Administrador</p>
            </div>
          </div>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mynavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div className="collapse navbar-collapse" id="mynavbar">
            <ul className="navbar-nav me-auto">
            <div className="d-flex d-lg-none btn-group justify-content-start mt-2">
                <button
                  className="btn client-secondary-btn btn-md dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  Sesión
                </button>
                <ul
                  className="dropdown-menu dropdown-menu-end text-center"
                  aria-labelledby="dropdownMenuButton"
                  style={{
                    backgroundColor: "#212529",
                    position: "absolute",
                    border: "1px rgb(68, 68, 68) solid",
                  }}
                >
                  <li>
                    {" "}
                    <a
                      href="/logout"
                      class="btn client-thirdary-btn btn-md mx-1"
                      role="button"
                    >
                      Cerrar Sesión
                    </a>
                  </li>
                </ul>
              </div>
              <li className="nav-item mt-3 mt-lg-0">
                <Link className="nav-link text-center" to="/admin/categories">
                  Categorías
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-center" to="/admin/products">
                  Productos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-center" to="/admin/sellings">
                  Ventas
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-center" to="/admin/prizes">
                  Premios
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-center" to="/admin/events">
                  Eventos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-center" to="/admin/users">
                  Usuarios
                </Link>
              </li>
            </ul>
            <form className="d-none d-lg-flex align-items-center col-6 gap-3">
              <input
                className="form-control me-2 buscar"
                type="search"
                placeholder="Buscar"
                aria-label="Buscar"
              />
              <div className="d-flex col-auto align-items-center">
                <div className="d-flex flex-column ms-2 text-white">
                  <h6 className="text-center w-100 mb-0">
                    {localStorage.getItem("username")}
                  </h6>
                  <p
                    className="text-center w-100 mb-0"
                    style={{ fontSize: "0.9rem", marginTop: "-3px" }}
                  >
                    Administrador
                  </p>
                </div>
              </div>
              <div className="d-flex btn-group justify-content-start">
                <button
                  className="btn client-secondary-btn btn-md dropdown-toggle"
                  type="button"
                  id="dropdownMenuButton"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                  style={{ marginRight: "3rem" }}
                >
                  Sesión
                </button>
                <ul
                  className="dropdown-menu bg-dark text-center"
                  aria-labelledby="dropdownMenuButton"
                >
                  <li>
                    {" "}
                    <a
                      href="/logout"
                      class="btn client-thirdary-btn btn-md mx-1"
                      role="button"
                    >
                      Cerrar Sesión
                    </a>
                  </li>
                </ul>
              </div>
            </form>
          </div>
        </div>
      </nav>
      <main className="d-flex flex-column flex-grow-1 w-100 p-3 p-lg-4">
        {children}
      </main>
      <footer className="d-flex flex-column pie_pagina col-12">
        <div className="grupo_1 d-flex flex-column flex-md-row text-center text-md-start align-items-center justify-content-md-center">
          <div className="box mb-3 mb-md-0">
            <figure>
              <a href="#">
                <img src="/rana.png" alt="logo" className="img-fluid" />
              </a>
            </figure>
          </div>
          <div className="box mb-3 mb-md-0 col-10 col-md-4">
            <h2 className="fs-5 fw-bold">SOBRE NOSOTROS</h2>
            <h6 className="col-12">
              Nosotros somos PlayHouse, nuestro objetivo principal es brindar un
              servicio al cliente excepcional y ofrecer servicios de bolirana,
              bar, coctelería y aperitivos.
            </h6>
          </div>
          <div className="box">
            <h2 className="fs-5 fw-bold">SÍGUENOS</h2>
            <div className="red_social d-flex justify-content-center gap-3">
              <a href="#">
                <i className="bx bxl-facebook-square fs-3"></i>
              </a>
              <a href="#">
                <i className="bx bxl-instagram fs-3"></i>
              </a>
              <a href="#">
                <i className="bx bxl-youtube fs-3"></i>
              </a>
            </div>
          </div>
        </div>
        <div className="grupo_2 text-center mt-3">
          <small>
            &copy; 2024 <b>Play house</b> - Todos Los Derechos Reservados
          </small>
        </div>
      </footer>
    </div>
  );
};
export default AdminLayout;
