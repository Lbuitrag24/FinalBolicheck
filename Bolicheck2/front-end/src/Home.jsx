import { React, useEffect } from "react";
import './index.css'

const Home = () => {
  useEffect(() => {
    document.title = "Invitado | Bolicheck";
  }, []);
  return (
    <div>
      <center>
        <img className="ranita_home" src="/rana.png" alt="frog logo" />
      </center>
      <h1 className="stext-primary-title text-center">Play house</h1>
      <hr />
      <center>
        <h1 className="Productos">Nuestros servicios</h1>
      </center>
      <div id="demo" className="carousel slide" data-bs-ride="carousel">
        <div className="carousel-indicators">
          <button
            type="button"
            data-bs-target="#demo"
            data-bs-slide-to="0"
            className="active"
          ></button>
          <button
            type="button"
            data-bs-target="#demo"
            data-bs-slide-to="1"
          ></button>
          <button
            type="button"
            data-bs-target="#demo"
            data-bs-slide-to="2"
          ></button>
          <button
            type="button"
            data-bs-target="#demo"
            data-bs-slide-to="3"
          ></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <img
              src="/jugando.jpg"
              alt="Boliranas"
              className="mx-auto d-block img-carousel"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Servicio de reservas de máquinas</h5>
              <p>Diviértete con tus amigos en nuestras sedes.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="/cerveza.jpg"
              alt="Chicago"
              className="mx-auto d-block img-carousel"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Amplia variedad en bebidas, snacks y consumibles</h5>
              <p>Todo lo que buscas, ¡y más!, encuentra desde aperitivos hasta bebidas importadas.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="/picada.jpeg"
              alt="picada"
              className="mx-auto d-block img-carousel"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>¡Como hecho en casa!</h5>
              <p>Nuestros coctéles y alimentos tienen un sabor auténtico y casero.</p>
            </div>
          </div>
          <div className="carousel-item">
            <img
              src="/premios.png"
              alt="picada"
              className="mx-auto d-block img-carousel"
            />
            <div className="carousel-caption d-none d-md-block">
              <h5>Tus compras, tus puntos</h5>
              <p>Premiamos tu fidelidad, acumula puntos que podrás canjear en fabulosos premios.</p>
            </div>
          </div>
        </div>
        <button
          className="carousel-control-prev"
          type="button"
          data-bs-target="#demo"
          data-bs-slide="prev"
        >
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button
          className="carousel-control-next"
          type="button"
          data-bs-target="#demo"
          data-bs-slide="next"
        >
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>
      <hr />
      <img className="ilustracion" src="" />
      <br></br>
    </div>
  );
};

export default Home;
