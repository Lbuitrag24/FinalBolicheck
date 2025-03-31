import React from "react";
import { Link } from "react-router-dom";

const EmployeeLayout = ({ children }) => {
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
          <Link className="navbar-brand" to="/employee/dashboard">
            <img className="logo" src="/rana.png" />
          </Link>
          <div className="d-flex d-lg-none gap-4 align-items-center justify-content-center col-8">
            <div className="d-flex flex-column align-items-center text-white">
              <h6 className="text-center m-0">
                {localStorage.getItem("username")}
              </h6>
              <p className="text-center m-0">Empleado</p>
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
                <Link className="nav-link text-center" to="/employee/prizes">
                  Premios
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-center" to="/employee/products">
                  Productos
                </Link>
              </li>
              <li className="nav-item">
                <Link className="nav-link text-center" to="/employee/sellings">
                  Ventas
                </Link>
              </li>
            </ul>
            <form className="d-none d-lg-flex align-items-center justify-content-end col-6 gap-3">
            <div className="d-flex col-auto align-items-center">
                <div className="d-flex flex-column ms-2 text-white">
                  <h6 className="text-center w-100 mb-0">
                    {localStorage.getItem("username")}
                  </h6>
                  <p
                    className="text-center w-100 mb-0"
                    style={{ fontSize: "0.9rem", marginTop: "-3px" }}
                  >
                    Empleado
                  </p>
                </div>
              </div>
              <div>
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
                        className="btn client-thirdary-btn btn-md mx-1"
                        role="button"
                      >
                        Cerrar Sesión
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </form>
          </div>
        </div>
      </nav>
      <main className="d-flex flex-column flex-grow-1 w-100 p-3 p-lg-4">
        {children}
      </main>
      <footer className="pie_pagina col-12">
        <div className="grupo_1">
          <div className="box">
            <figure>
              <a href="#">
                <img src="/rana.png" alt="logo" />
              </a>
            </figure>
          </div>
          <div className="box">
            <h2>SOBRE NOSOTROS</h2>
            <p>
              Nosotros somos PlayHouse, nuestro objetivo principal es brindar un
              servicio al cliente excepcional y ofrecer servicios de bolirana,
              bar, coctelería y aperitivos.
            </p>
          </div>
          <div className="box">
            <h2>SÍGUENOS</h2>
            <div className="red_social">
              <a href="#">
                <i
                  className="bx bxl-facebook-square"
                  style={{ fontSize: "2rem" }}
                ></i>
              </a>
              <a href="#">
                <i
                  className="bx bxl-instagram"
                  style={{ fontSize: "2rem" }}
                ></i>
              </a>
              <a href="#">
                <i className="bx bxl-youtube" style={{ fontSize: "2rem" }}></i>
              </a>
            </div>
          </div>
        </div>
        <div className="grupo_2">
          <small>
            &copy; 2024 <b>Play house</b> - Todos Los Derechos Reservados
          </small>
        </div>
      </footer>
    </div>
  );
};
export default EmployeeLayout;
