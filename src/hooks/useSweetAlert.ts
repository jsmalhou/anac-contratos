// Versão sem sweetalert2 — usa confirm nativo + toasts CSS
import { useCallback } from "react";

// Toast system using DOM
let toastContainer: HTMLDivElement | null = null;

function getContainer(): HTMLDivElement {
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      z-index: 99999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      pointer-events: none;
    `;
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function showToast(message: string, type: "success" | "error" | "warning" | "info" = "info") {
  const container = getContainer();
  const toast = document.createElement("div");

  const colors: Record<string, string> = {
    success: "#4ADE80",
    error: "#F87171",
    warning: "#FBBF24",
    info: "#60A5FA",
  };

  const icons: Record<string, string> = {
    success: "✓",
    error: "✕",
    warning: "⚠",
    info: "ℹ",
  };

  toast.style.cssText = `
    background: rgba(11, 22, 40, 0.95);
    border: 1px solid ${colors[type]}40;
    border-left: 4px solid ${colors[type]};
    color: white;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 14px;
    font-family: inherit;
    backdrop-filter: blur(10px);
    box-shadow: 0 8px 24px rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 280px;
    animation: toastSlideIn 0.3s ease;
    pointer-events: auto;
  `;

  toast.innerHTML = `
    <span style="color: ${colors[type]}; font-size: 18px; font-weight: bold;">${icons[type]}</span>
    <span>${message}</span>
  `;

  // Add animation style if not present
  if (!document.getElementById("toast-animations")) {
    const style = document.createElement("style");
    style.id = "toast-animations";
    style.textContent = `
      @keyframes toastSlideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes toastSlideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  container.appendChild(toast);

  // Auto remove
  setTimeout(() => {
    toast.style.animation = "toastSlideOut 0.3s ease forwards";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

export function useSweetAlert() {
  const success = useCallback((title: string) => {
    showToast(title, "success");
  }, []);

  const error = useCallback((title: string) => {
    showToast(title, "error");
  }, []);

  const warning = useCallback((title: string) => {
    showToast(title, "warning");
  }, []);

  const info = useCallback((title: string) => {
    showToast(title, "info");
  }, []);

  const confirm = useCallback(
    async (title: string, text: string): Promise<boolean> => {
      return window.confirm(`${title}\n\n${text}`);
    },
    []
  );

  const confirmDelete = useCallback(
    async (itemName: string): Promise<boolean> => {
      return window.confirm(
        `Eliminar "${itemName}"?\n\nEsta ação não pode ser desfeita.`
      );
    },
    []
  );

  return { success, error, warning, info, confirm, confirmDelete };
}
