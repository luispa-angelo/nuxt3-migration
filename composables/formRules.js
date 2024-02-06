const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
const phoneRegex = /^\([0-9]{2,3}\)? [0-9]{3,6}-?[0-9]{3,6}$/;
const numberRegex = new RegExp(/\D/g);
const urlRegex = new RegExp(
  /^(?:https?:\/\/)?(w{3}\.)?[\w_-]+((\.\w{2,}){1,2})(\/([\w._-]+\/?)*(\?[\w_-]+=[^?/&]*(&[\w_-]+=[^?/&]*)*)?)?$/
);

export const emailRules = [
  (value) => !!value || 'Insira um endereço de e-mail válido',
  (value) =>
    emailRegex.test(value?.value ?? value) ||
    'Insira um endereço de e-mail válido',
];
export const phoneRules = [
  (value) =>
    phoneRegex.test(value?.value ?? value) ||
    'Insira um número de telefone válido',
];
export const phoneValidationMessages = [
  (value) => {
    if (value) {
      if (!phoneRegex.test(value?.value ?? value))
        return 'Insira um número de telefone válido';

      const onlyNumbers =
        typeof value === 'object'
          ? value?.value?.replace(numberRegex, '')
          : value?.replace(numberRegex, '');

      if (value && (onlyNumbers?.length <= 9 || onlyNumbers?.length >= 12))
        return 'Formato de telefone não reconhecido';
    }
  },
];
export const fileRules = [
  (value) =>
    !value ||
    value.size < 20000000 ||
    'Tamanho do arquivo deve ser menor que 20 MB!',
];
export const mediaObjectEmailRules = [
  (value) => !!value || 'Insira um endereço de e-mail válido',
  (value) =>
    emailRegex.test(value ? value.value : null) ||
    'Insira um endereço de e-mail válido',
];
export const mediaObjectPhoneRules = [
  (value) =>
    phoneRegex.test(value ? value.value : null) ||
    'Insira um número de telefone válido',
];
export const websiteRules = [
  (value) => {
    if (value) {
      if (!urlRegex.test(value?.value ?? value))
        return 'Insira um endereço de url válido';
    }
  },
];
