import Swal from 'sweetalert2';

/**
 * @param {string} title - Alert title
 * @param {string} text - Alert text
 * @param {string} confirmButtonText - Confirm button text
 * @param {string} cancelButtonText - Cancel button text
 * @param {string} icon - Alert icon
 * @param {string} iconColor - Icon color (success, delete, warning, default)
 * @param {string} alertType - Define Alert type (success, delete, warning, default)
 * @param {boolean} showConfirmButton - Show confirm button
 * @param {boolean} showCancelButton - Show cancel button
 * @param {boolean} reverseButtons - Change buttons order
 * @param {boolean} showHtml - Show modal text as html
 * @returns
 */

export const baseAlert = async (
  title,
  text,
  confirmButtonText = 'Confirmar',
  cancelButtonText = 'Cancelar',
  icon,
  iconColor,
  alertType = 'default',
  showConfirmButton = true,
  showCancelButton = true,
  reverseButtons = false,
  showHtml = false
) => {
  const result = await Swal.fire({
    customClass: {
      container: `baseAlert ${alertType}`,
      confirmButton: 'confirmButton',
      cancelButton: 'cancelButton',
    },
    title: `<span class="title"> 
      <i class="material-symbols-rounded ${iconColor}" >${icon}</i> 
        <h6>${title}</h6>
      </span>`,
    text: text,
    html: showHtml ? text : '',
    reverseButtons: reverseButtons,
    showConfirmButton: showConfirmButton,
    showCancelButton: showCancelButton,
    confirmButtonText: confirmButtonText,
    cancelButtonText: cancelButtonText,
  });
  return result.isConfirmed;
};
