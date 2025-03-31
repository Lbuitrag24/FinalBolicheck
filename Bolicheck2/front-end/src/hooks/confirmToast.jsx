import { toast } from "react-toastify";

const useConfirmToast = () => {
  return (message) => {
    return new Promise((resolve) => {
      toast(
        ({ closeToast }) => (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <p className="text-center">{message}</p>
            <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
              <button
                className="btn new-btn-style"
                onClick={() => {
                  resolve(true);
                  closeToast();
                }}
              >
                Sí
              </button>
              <button
                className="btn delete-btn-style"
                onClick={() => {
                  resolve(false);
                  closeToast();
                }}
              >
                No
              </button>
            </div>
          </div>
        ),
        { autoClose: false, closeOnClick: false, closeButton: false, position: "bottom-right" }
      );
    });
  };
};

export default useConfirmToast;
