const cpfRegex = new RegExp(/(\d{3})(\d{3})(\d{3})(\d{2})/);
const cnpjRegex = new RegExp(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/);
const numberRegex = new RegExp(/\D/g);

export const mask_cpf = '###.###.###-##';
export const mask_cnpj = '##.###.###/####-##';
export const mask_cep = '#####-###';

export const maskPhone = (value) => {
  if (!value) return '(##) #####-####';

  const justNumbers =
    typeof value === 'object'
      ? value?.value?.replace(numberRegex, '')
      : value?.replace(numberRegex, '');

  if (justNumbers?.length <= 10) return '(##) ####-####';
  else if (justNumbers?.length <= 11) return '(##) #####-####';

  return '(###) ######-######';
};
export const formatDate = (date) => {
  const isoDate = new Date(date);
  return isoDate.toLocaleDateString('pt-BR');
};
export const formatHour = (date) => {
  const isoDate = new Date(`${date}Z`);
  return isoDate.tLocaleTimeString();
};
export const maskMoney = (mask, value) => {
  //example mask: pt-br
  return value
    ? value.toLocaleString(mask, { minimumFractionDigits: 2 })
    : value;
};
export const maskCnpj = (value) => {
  return value ? value.replace(cnpjRegex, '$1.$2.$3/$4-$5') : value;
};
export const maskCpf = (value) => {
  return value?.replace(cpfRegex, '$1.$2.$3-$4');
};
export const timeDiff = (date1, date2) => {
  if (date1 && date2) {
    var diff = date2?.getTime() - date1?.getTime();
    var msec = diff;
    if (diff <= 0) {
      return '00' + ':' + '00' + ':' + '00';
    } else {
      var hh = Math.floor(msec / 1000 / 60 / 60);
      msec -= hh * 1000 * 60 * 60;
      var mm = Math.floor(msec / 1000 / 60);
      msec -= mm * 1000 * 60;
      var ss = Math.floor(msec / 1000);
      msec -= ss * 1000;
      return hh + ':' + mm + ':' + ss;
    }
  }
};
export const maskIdentifier = (value, type) => {
  if (type === 'cpf') return this.maskCpf(value);
  if (value?.length <= 11) return this.maskCpf(value);
  return this.maskCnpj(value);
};
