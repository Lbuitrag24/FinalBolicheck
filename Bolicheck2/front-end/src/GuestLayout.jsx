import React from "react";
import "./css/guest.css";
import "./css/Bootstrap.css";

const GuestLayout = ({ children }) => {
  const LayoutStyle = {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    width: "100%",
  };

  return (
    <div style={LayoutStyle} className="align-items-center fondo_pagina">
      <nav
        className="navbar-dark navbar-expand-md bg-dark navbar col-12"
        
      >
        <div className="container-fluid bg-dark">
          <a className="navbar-brand" href="/">
            <img className="logo" src="/rana.png" />
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#mynavbar"
          >
            <span className="navbar-toggler-icon"></span>
          </button>
          <div
            className="collapse navbar-collapse mb-2 mb-md-0 flex-column flex-md-row" id="mynavbar"
          >
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="text-decoration-none d-flex d-md-none w-100" href="/login">
                  <button
                    className="btn client-products-primary-btn col-12 mb-2 mt-2"
                    type="button"
                  >
                    Iniciar sesión
                  </button>
                </a>
              </li>
              <li className="nav-item">
                <a className="text-decoration-none d-flex d-md-none w-100" href="/register">
                  <button className="btn client-secondary-btn col-12" type="button">
                    Registrarse
                  </button>
                </a>
              </li>
              <li className="nav-item">
                <a className="text-center nav-link" href="/about_us">
                  Nosotros
                </a>
              </li>
              <li className="nav-item">
                <a className="text-center nav-link" href="/contact_us">
                  Contáctenos
                </a>
              </li>
            </ul>
            <form className="d-none d-md-flex gap-3">
              <input
                className="d-none d-lg-block buscar rounded-3"
                type="text"
                placeholder="  Buscar"
              />
              <a href="/login">
                <button className="btn client-products-primary-btn" type="button">
                  Iniciar sesión
                </button>
              </a>
              <a href="/register">
                <button className="btn client-secondary-btn" type="button">
                  Registrarse
                </button>
              </a>
            </form>
          </div>
        </div>
      </nav>

      <main className="d-flex flex-column flex-grow-1 w-100 p-5">
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

export default GuestLayout;
