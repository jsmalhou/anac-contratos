import Swal from "sweetalert2";

const Toast = Swal.mixin({
  toast: true,
  position: "top-end",
  showConfirmButton: false,
  timer: 3000,
  timerProgressBar: true,
  background: "rgba(11, 22, 40, 0.95)",
  color: "#fff",
  iconColor: "#C9963B",
  didOpen: (toast) => {
    toast.onmouseenter = Swal.stopTimer;
    toast.onmouseleave = Swal.resumeTimer;
  },
});

export function useSweetAlert() {
  const success = (title: string, text?: string) => {
    Toast.fire({
      icon: "success",
      title,
      text,
    });
  };

  const error = (title: string, text?: string) => {
    Toast.fire({
      icon: "error",
      title,
      text,
    });
  };

  const warning = (title: string, text?: string) => {
    Toast.fire({
      icon: "warning",
      title,
      text,
    });
  };

  const info = (title: string, text?: string) => {
    Toast.fire({
      icon: "info",
      title,
      text,
    });
  };

  const confirm = async (
    title: string,
    text: string,
    confirmButtonText = "Confirmar",
    cancelButtonText = "Cancelar"
  ): Promise<boolean> => {
    const result = await Swal.fire({
      title,
      text,
      icon: "question",
      showCancelButton: true,
      confirmButtonText,
      cancelButtonText,
      background: "rgba(11, 22, 40, 0.95)",
      color: "#fff",
      confirmButtonColor: "#C9963B",
      cancelButtonColor: "#374151",
      iconColor: "#C9963B",
    });
    return result.isConfirmed;
  };

  const confirmDelete = async (
    itemName: string
  ): Promise<boolean> => {
    return confirm(
      "Eliminar?",
      `Tem certeza que deseja eliminar "${itemName}"? Esta ação não pode ser desfeita.`,
      "Sim, eliminar",
      "Cancelar"
    );
  };

  return { success, error, warning, info, confirm, confirmDelete };
}
