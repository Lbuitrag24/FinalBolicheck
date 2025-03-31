import { React, useEffect } from "react";

const AboutUs = () => {
  useEffect(() => {
    document.title = `Sobre Nosotros | Bolicheck`;
  }, []);
  return (
    <div className="client-form rounded-4">
      <div className="text-center mt-3 mb-0">
        <h1>
          Sobre Nosotros |{" "}
          <span className="client-products-text-decorate">PlayHouse</span>
        </h1>
      </div>
      <div className="col-12 d-flex flex-column flex-xl-row p-5">
        <div className="d-flex col-12 col-md-10 mx-auto col-xl-4 mb-3 mb-md-0 justify-content-center imagen rounded-4 image-cont">
          <img src="/rana.png" alt="Imagen de nosotros" />
        </div>
        <div className="col ms-5 text-center d-flex align-items-center cotenido_nosotros">
          <h4>
            En{" "}
            <span className="stext-primary">
              <b>PlayHouse</b>
            </span>
            , nos dedicamos a brindar{" "}
            <span className="stext-primary">experiencias excepcionales</span> a
            nuestros clientes a través de un servicio al cliente de primera
            categoría. Nuestra bolirana ofrece una variedad de{" "}
            <span className="stext-secondary">platillos exquisitos</span>,
            mientras que nuestro bar y coctelería están diseñados para
            sorprender y deleitar con una amplia selección de{" "}
            <span className="stext-thirdary">
              bebidas artesanales y cócteles creativos.
            </span>{" "}
            Además, nuestros aperitivos son la opción perfecta para acompañar
            tus bebidas. En resumen, en{" "}
            <span className="stext-primary">
              <b>PlayHouse</b>
            </span>{" "}
            te esperan momentos memorables donde la buena comida, excelentes
            bebidas y un servicio excepcional se unen para garantizar una
            experiencia inolvidable.
          </h4>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;
