import Icon from "./Icon";
import Modal from "./Modal";

/**
 * Diálogo de confirmación para acciones destructivas o irreversibles.
 *
 * El botón de cancelar recibe el foco inicial para reducir el riesgo de
 * confirmar por accidente con el teclado.
 *
 * @param {Object} props - Propiedades del diálogo.
 * @param {boolean} props.open - Controla la visibilidad.
 * @param {React.ReactNode} [props.title="¿Eliminar registro?"] - Título.
 * @param {React.ReactNode} props.message - Mensaje explicativo.
 * @param {string} [props.confirmLabel="Eliminar"] - Texto del botón principal.
 * @param {string} [props.cancelLabel="Cancelar"] - Texto del botón secundario.
 * @param {() => void} [props.onConfirm] - Acción confirmada.
 * @param {() => void} [props.onClose] - Cierra sin ejecutar la acción.
 * @returns {React.JSX.Element} Diálogo de confirmación.
 */
export default function ConfirmDialog({
  open,
  title = "¿Eliminar registro?",
  message,
  confirmLabel = "Eliminar",
  cancelLabel = "Cancelar",
  onConfirm,
  onClose,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="modal-foot-actions confirm-actions">
          <button
            type="button"
            className="btn btn-ghost"
            onClick={onClose}
            data-autofocus
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            className="btn btn-danger"
            onClick={onConfirm}
          >
            {confirmLabel}
          </button>
        </div>
      }
    >
      <div className="confirm-body">
        <div className="confirm-icon">
          <Icon name="alert" size={22} />
        </div>
        <p>{message}</p>
      </div>
    </Modal>
  );
}
