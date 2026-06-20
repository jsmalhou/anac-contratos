import Swal from "sweetalert2";
import { useCallback } from "react";

// Custom theme for glassmorphic look
const swalTheme = {
  confirmButtonColor: "#d97706",
  cancelButtonColor: "#475569",
  background: "rgba(11, 22, 40, 0.95)",
  color: "#fff",
  backdrop: "rgba(0, 0, 0, 0.6)",
  customClass: {
    popup: "glass-swal-popup",
    confirmButton: "glass-swal-confirm",
    cancelButton: "glass-swal-cancel",
    title: "glass-swal-title",
    htmlContainer: "glass-swal-text",
    icon: "glass-swal-icon",
  },
};

// Add custom styles
if (!document.getElementById("swal-glass-style")) {
  const style = document.createElement("style");
  style.id = "swal-glass-style";
  style.textContent = `
    .glass-swal-popup {
      border: 1px solid rgba(255,255,255,0.1) !important;
      border-radius: 16px !important;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05) !important;
      backdrop-filter: blur(20px) !important;
    }
    .glass-swal-title {
      color: #fff !important;
      font-weight: 600 !important;
    }
    .glass-swal-text {
      color: rgba(255,255,255,0.7) !important;
    }
    .glass-swal-confirm {
      background: linear-gradient(135deg, #d97706, #b45309) !important;
      border: none !important;
      border-radius: 10px !important;
      padding: 10px 24px !important;
      font-weight: 500 !important;
      box-shadow: 0 4px 12px rgba(217,119,6,0.3) !important;
    }
    .glass-swal-confirm:hover {
      background: linear-gradient(135deg, #f59e0b, #d97706) !important;
    }
    .glass-swal-cancel {
      background: rgba(255,255,255,0.1) !important;
      border: 1px solid rgba(255,255,255,0.2) !important;
      border-radius: 10px !important;
      padding: 10px 24px !important;
      font-weight: 500 !important;
      color: #fff !important;
    }
    .glass-swal-cancel:hover {
      background: rgba(255,255,255,0.2) !important;
    }
    .glass-swal-icon {
      border-color: rgba(255,255,255,0.2) !important;
    }
  `;
  document.head.appendChild(style);
}

export function useSweetAlert() {
  /**
   * Success toast (top-right, auto-dismiss)
   */
  const success = useCallback((title: string, text?: string) => {
    Swal.fire({
      ...swalTheme,
      icon: "success",
      title,
      text,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }, []);

  /**
   * Error toast (top-right, auto-dismiss)
   */
  const error = useCallback((title: string, text?: string) => {
    Swal.fire({
      ...swalTheme,
      icon: "error",
      title,
      text,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 4000,
      timerProgressBar: true,
    });
  }, []);

  /**
   * Warning toast (top-right, auto-dismiss)
   */
  const warning = useCallback((title: string, text?: string) => {
    Swal.fire({
      ...swalTheme,
      icon: "warning",
      title,
      text,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }, []);

  /**
   * Info toast (top-right, auto-dismiss)
   */
  const info = useCallback((title: string, text?: string) => {
    Swal.fire({
      ...swalTheme,
      icon: "info",
      title,
      text,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true,
    });
  }, []);

  /**
   * Centered confirmation dialog (center screen, requires action)
   */
  const confirm = useCallback(
    async (title: string, text: string): Promise<boolean> => {
      const result = await Swal.fire({
        ...swalTheme,
        icon: "question",
        title,
        text,
        showCancelButton: true,
        confirmButtonText: "Sim",
        cancelButtonText: "Não",
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
      });
      return result.isConfirmed;
    },
    []
  );

  /**
   * Centered delete confirmation dialog (center screen, requires action)
   */
  const confirmDelete = useCallback(
    async (itemName: string): Promise<boolean> => {
      const result = await Swal.fire({
        ...swalTheme,
        icon: "warning",
        title: "Eliminar?",
        html: `Tem a certeza que deseja eliminar <strong style="color:#fbbf24">${itemName}</strong>?<br><span style="color:#f87171;font-size:13px">Esta ação não pode ser desfeita.</span>`,
        showCancelButton: true,
        confirmButtonText: "Sim, eliminar",
        cancelButtonText: "Cancelar",
        reverseButtons: true,
        allowOutsideClick: false,
        allowEscapeKey: true,
      });
      return result.isConfirmed;
    },
    []
  );

  /**
   * Centered success dialog (center screen, requires click OK)
   */
  const successDialog = useCallback((title: string, text?: string) => {
    Swal.fire({
      ...swalTheme,
      icon: "success",
      title,
      text,
      confirmButtonText: "OK",
    });
  }, []);

  /**
   * Centered error dialog (center screen, requires click OK)
   */
  const errorDialog = useCallback((title: string, text?: string) => {
    Swal.fire({
      ...swalTheme,
      icon: "error",
      title,
      text,
      confirmButtonText: "OK",
    });
  }, []);

  /**
   * Loading dialog (center screen)
   */
  const loading = useCallback((title: string = "A processar...") => {
    Swal.fire({
      ...swalTheme,
      title,
      allowOutsideClick: false,
      allowEscapeKey: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });
  }, []);

  /**
   * Close any open dialog
   */
  const close = useCallback(() => {
    Swal.close();
  }, []);

  return {
    success,
    error,
    warning,
    info,
    confirm,
    confirmDelete,
    successDialog,
    errorDialog,
    loading,
    close,
  };
}
