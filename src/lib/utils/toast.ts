import { toast } from 'react-toastify';
import { Bounce } from 'react-toastify';

export const showToastSuccess = (message: string) => {
  toast.success(message, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
    theme: "light",
    transition: Bounce,
  });
};

export const showToastError = (message: string) => {
  toast.error(message, {
    position: "bottom-left",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnFocusLoss: true,
    draggable: true,
    pauseOnHover: true,
    theme: "light",
    transition: Bounce,
  });
};