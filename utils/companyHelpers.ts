export const companyHelpers = {
  historyFieldFormatter(field: any, value: string) {
    switch (field) {
      case 'value':
        return parseInt(value)
          ? `R$ ${maskMoney('pt-br', parseInt(value))}`
          : 'R$ 0,00';
      case 'year_revenue':
        return parseInt(value)
          ? `R$ ${maskMoney('pt-br', parseInt(value))}`
          : 'R$ 0,00';
      case 'prevision':
      // return value ? $moment(value).format('DD/MM/YYYY') : null
      case 'foundation':
      // return value ? $moment(value).format('DD/MM/YYYY') : null
      case 'temperature':
        return parseInt(value) ? `${parseInt(value)}°C` : null;
      case 'identifier':
        return value ? maskCnpj(value) : value;
      default:
        return value;
    }
  },
};
