import { React, useEffect } from "react";

const ContactUs = () => {
  useEffect(() => {
    document.title = `Contáctanos | Bolicheck`;
  }, []);
  return (
    <div className="client-form">
      <h1 className="text-center mt-4">Visítanos</h1>
      <div className="row col-11 d-flex flex-column flex-xl-row col-xl-10 mx-auto gap-3 gap-xl-0 mb-5">
        <div
          className="client-products-card card mx-auto col-12 col-xl-4 d-flex align-items-center justify-content-center"
          style={{ height: "50vh" }}
        >
          <h2 className="text-center">Dirección: Cl 75 Sur #1c24</h2>
          <h2 className="text-center">Teléfono: 3053075365</h2>
          <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3977.435227875028!2d-74.11812472446624!3d4.515314631555435!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3fa22e33e3e871%3A0xdd6c443e33836d50!2sCl%2075%20Sur%20%231c24%2C%20Bogot%C3%A1!5e0!3m2!1ses-419!2sco!4v1711747383306!5m2!1ses-419!2sco"></iframe>
        </div>
          <div className="client-products-card card mx-auto col-12 col-xl-7 align-items-center justify-content-center overflow-auto" style={{ height: "50vh" }}>
            <h2 className="text-center">Contáctanos</h2>
            <p className="text-center">
              Puedes contactarnos para reservar o déjanos un mensaje. También
              puedes dejarnos tu opinión.
            </p>
            <p className="text-decoration-none text-center" href="#">
              <i className="fa fa-envelope"></i>play.house@gmail.com
            </p>
            <p className="text-decoration-none text-center" href="#">
              <i className="fa fa-map-marked"></i>Bogotá, Colombia
            </p>
            <form
              className="d-flex flex-wrap gap-3 justify-content-center align-items-center"
              autoComplete="off"
            >
              <div className="input-group">
                <input
                  type="text"
                  name="nombre"
                  placeholder="Ingresa tu nombre"
                  className="client-products-mini-input"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Ingresa tu correo"
                  className="client-products-mini-input"
                />
              </div>
              <textarea
                name="mensaje"
                placeholder="Escribe tu mensaje"
                className="full-width client-products-mini-input"
              ></textarea>
              <div className="d-flex col-12 justify-content-center">
                <button
                  type="submit"
                  className="col-4 btn client-products-primary-btn"
                  style={{ height: "2.5rem" }}
                >
                  Enviar
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
};

export default ContactUs;
