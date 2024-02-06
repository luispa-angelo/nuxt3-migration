const exp = /\D/g;
const cleanSpecialCharExp = /[^a-zA-Z0-9 ]/g;
const justNumbersExp = /^-?\d+$/;
const emailRegex =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

export const onlyNumbers = (value) => {
  return value?.toString().replace(exp, '');
};
export const commaSeparateNumber = (val) => {
  var sign = 1;
  if (val < 0) {
    sign = -1;
    val = -val;
  }
  let num = val.toString().includes('.')
    ? val.toString().split('.')[0]
    : val.toString();

  while (/(\d+)(\d{3})/.test(num.toString())) {
    num = num.toString().replace(/(\d+)(\d{3})/, '$1' + '.' + '$2');
  }
  if (val.toString().includes('.')) {
    num = num + '.' + val.toString().split('.')[1];
  }
  return sign < 0 ? '-' + num : num;
};
export const showTeamHierarchy = (items) => {
  let hierarchy = {};

  let heads = [];
  for (let el of items) {
    if (!(el.id in hierarchy)) {
      hierarchy[el.id] = el;
      el['children'] = [];
    }
    if (el.parent_id in hierarchy) {
      hierarchy[el.parent_id].children.push(el);
    } else {
      heads.push(el);
    }
  }

  items = [];
  this.traverse(heads, items);

  return items;
};
export const traverse = (children, full, prefix = '') => {
  for (let el of children) {
    el.name = prefix + el.name;
    full.push(el);
    this.traverse(el.children, full, el.name + ' - ');
  }
};
export const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};
export const capitalizeText = (str, every) => {
  if (!every) return str.charAt(0)?.toUpperCase() + str.slice(1);
  else {
    let splitStr = str?.toLowerCase().split(' ');

    for (var i = 0; i < splitStr?.length; i++) {
      splitStr[i] =
        splitStr[i].charAt(0).toUpperCase() + splitStr[i].substring(1);
    }

    return splitStr.join(' ');
  }
};
export const findItemOnArray = (itemType, array, includes = false) => {
  if (array && array.length >= 1) {
    if (includes)
      return array?.find((c) => c?.type.includes(itemType))?.content;

    return array?.find((c) => c?.type === itemType)?.content;
  }
};
export const simpleDebounce = (func, timeout = 300) => {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      func.apply(this, args);
    }, timeout);
  };
};
export const arrayGroupBy = (array, key) => {
  return array.reduce((storage, item) => {
    const group = item[key];
    storage[group] = storage[group] || [];
    storage[group].push(item);
    return storage;
  }, {});
};
export const copyToClipboard = async (value) => {
  try {
    await navigator.clipboard.writeText(value);
  } catch (error) {
    console.log(error);
  }
};
export const getSubstring = (str, char1, char2) => {
  return str.substring(str.indexOf(char1) + 1, str.lastIndexOf(char2));
};
export const StringIsJustNumbers = (str) => {
  if (str) {
    const text = str.replace(cleanSpecialCharExp, '');
    if (justNumbersExp.test(text)) {
      return false;
    } else {
      return true;
    }
  }
};
export const checkEmailIsValid = (email) => {
  return emailRegex.test(email);
};
export const getUserInfo = () => {
  let info;
  if (localStorage.userInfo) {
    info = JSON.parse(localStorage.userInfo);
  }
  return info;
};
export const dateRangeList = (value) => {
  let startDate = new Date();
  let endDate = new Date();
  switch (value) {
    case 'today':
      startDate = this.$moment().startOf('day').format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment().endOf('day').format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'yesterday':
      startDate = this.$moment()
        .subtract(1, 'days')
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .subtract(1, 'days')
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'tomorrow':
      startDate = this.$moment()
        .add(1, 'days')
        .startOf('day')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .add(1, 'days')
        .endOf('day')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'thisWeek':
      startDate = this.$moment().startOf('week').format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment().endOf('week').format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'lastWeek':
      startDate = this.$moment()
        .subtract(1, 'week')
        .startOf('week')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .subtract(1, 'week')
        .endOf('week')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'nextWeek':
      startDate = this.$moment()
        .add(1, 'week')
        .startOf('week')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .add(1, 'week')
        .endOf('week')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'thisMonth':
      startDate = this.$moment().startOf('month').format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment().endOf('month').format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'lastMonth':
      startDate = this.$moment()
        .subtract(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .subtract(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'nextMonth':
      startDate = this.$moment()
        .add(1, 'month')
        .startOf('month')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .add(1, 'month')
        .endOf('month')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'thisQuarter':
      startDate = this.$moment()
        .startOf('quarter')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment().endOf('quarter').format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'lastQuarter':
      startDate = this.$moment()
        .subtract(1, 'quarter')
        .startOf('quarter')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .subtract(1, 'quarter')
        .endOf('quarter')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    case 'nextQuarter':
      startDate = this.$moment()
        .add(1, 'quarter')
        .startOf('quarter')
        .format('YYYY-MM-DDTHH:mm:ss');
      endDate = this.$moment()
        .add(1, 'quarter')
        .endOf('quarter')
        .format('YYYY-MM-DDTHH:mm:ss');
      break;
    default:
      startDate = null;
      endDate = null;
  }
  return [startDate, endDate];
};
export const setDateRangeList = (value, field, fullPath, onlyDates) => {
  let startDate = new Date();
  let endDate = new Date();
  const [utcStartDate, utcEndDate] = this.dateRangeList(value);

  if (utcStartDate && utcEndDate) {
    startDate = this.$moment(utcStartDate).utc().format('YYYY-MM-DDTHH:mm:ss');
    endDate = this.$moment(utcEndDate).utc().format('YYYY-MM-DDTHH:mm:ss');

    if (onlyDates) return [startDate, endDate];
    else if (fullPath) return `${field}=between(${startDate},${endDate})`;
    else return `between(${startDate},${endDate})`;
  } else {
    if (fullPath) return `${field}=${value}`;
    else return value;
  }
};
export const secondsToDhm = (seconds) => {
  const d = Math.floor(seconds / (3600 * 24));
  const h = Math.floor((seconds % (3600 * 24)) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const displayArray = [];
  const dDisplay = d > 0 ? d + (d == 1 ? ' Dia' : ' Dias') : null;
  const hDisplay =
    !dDisplay && h > 0 ? h + (h == 1 ? ' Hora' : ' Horas') : null;
  const mDisplay =
    !dDisplay && !hDisplay && m > 0
      ? m + (m == 1 ? ' Minuto' : ' Minutos')
      : null;
  dDisplay && displayArray.push(dDisplay);
  hDisplay && displayArray.push(hDisplay);
  mDisplay && displayArray.push(mDisplay);
  if (displayArray.length == 0) {
    return 'Menos de 1 minuto';
  }
  return displayArray.join(', ');
};
export const hideWindowScrollbar = (hide) => {
  if (hide) {
    window.scrollTo(0, 0);
    document.documentElement.style.overflow = 'hidden';
    document.body.style.overflow = 'hidden';
  } else {
    document.documentElement.style.overflow = '';
    document.body.style.overflow = '';
  }
};
export const getUfName = (uf) => {
  switch (uf) {
    case 'AC':
      return 'Acre';
    case 'AL':
      return 'Alagoas';
    case 'AP':
      return 'Amapá';
    case 'AM':
      return 'Amazonas';
    case 'BA':
      return 'Bahia';
    case 'CE':
      return 'Ceará';
    case 'DF':
      return 'Distrito Federal';
    case 'ES':
      return 'Espírito Santo';
    case 'GO':
      return 'Goiás';
    case 'MA':
      return 'Maranhão';
    case 'MT':
      return 'Mato Grosso';
    case 'MS':
      return 'Mato Grosso do Sul';
    case 'MG':
      return 'Minas Gerais';
    case 'PA':
      return 'Pará';
    case 'PB':
      return 'Paraíba';
    case 'PR':
      return 'Paraná';
    case 'PE':
      return 'Pernambuco';
    case 'PI':
      return 'Piauí';
    case 'RJ':
      return 'Rio de Janeiro';
    case 'RN':
      return 'Rio Grande do Norte';
    case 'RS':
      return 'Rio Grande do Sul';
    case 'RO':
      return 'Rondônia';
    case 'RR':
      return 'Roraima';
    case 'SC':
      return 'Santa Catarina';
    case 'SP':
      return 'São Paulo';
    case 'SE':
      return 'Sergipe';
    case 'TO':
      return 'Tocantins';
  }
};
export const getRandomNumber = (min, max) => {
  let generatedId;
  let existingToastElement;

  do {
    generatedId = Math.floor(Math.random() * (max - min + 1)) + min;
    existingToastElement = document.querySelector(
      `.container-item-toast[toast-id="${generatedId}"]`
    );
  } while (existingToastElement);

  return generatedId;
};
export const showToast = (options) => {
  const { type, message, requisition } = options;
  const { specs } = requisition;

  let counter = null;
  let lineLength = null;
  specs?.clickEvent ? (lineLength = 45) : (lineLength = 60);
  if (message.length > lineLength) {
    counter = 8000;
  } else {
    counter = 4000;
  }
  const content = {
    component: 'AlertToast',
    props: {
      type: type,
      customIcon: specs?.customIcon ? specs?.customIcon : null,
      message: message,
      hasButton: specs?.clickEvent ? true : false,
      buttonText: specs?.buttonText ? specs?.buttonText : null,
    },
    listeners: {
      clickToast: (id) => {
        if (specs?.clickEvent) {
          specs?.clickEvent();
          this.$toast.dismiss(id);
        }
      },
    },
  };
  const randomNumber = this.getRandomNumber(1, 100000);
  this.$toast(content, {
    id: `current-toast-${randomNumber}`,
    timeout: counter,
  });
};
export const getCep = (searchedCep) => {
  if (searchedCep) {
    searchedCep = this.onlyNumbers(searchedCep);
    const location = this.$viaCep
      .buscarCep(searchedCep)
      .then((location) => {
        return location;
      })
      .catch((error) => {
        console.log(error);
        return null;
      });
    return location;
  }
};
