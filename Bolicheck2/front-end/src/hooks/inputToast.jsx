import { toast } from "react-toastify";
import { useState } from "react";

const useInputToast = () => {
  return (message) => {
    return new Promise((resolve) => {
      let inputValue = "";

      const handleChange = (e) => {
        inputValue = e.target.value;
      };

      toast(
        ({ closeToast }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px"}}>
            <p className="text-center">{message}</p>
            <input type="number" onChange={handleChange} className="client-products-mini-input form-control w-75 mx-auto mb-4" />
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                className="btn new-btn-style"
                onClick={() => {
                  resolve(inputValue);
                  closeToast();
                }}
              >
                Confirmar
              </button>
              <button
                className="btn delete-btn-style"
                onClick={() => {
                  resolve(null);
                  closeToast();
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        ),
        { autoClose: false, closeOnClick: false, closeButton: false, position: "bottom-right" }
      );
    });
  };
};

export default useInputToast;
