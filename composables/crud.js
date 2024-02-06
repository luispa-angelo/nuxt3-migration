const defaultSpecs = {
  fireSuccessAlert: true,
  fireErrorAlert: true,
  context: null,
  throwError: false,
  swalTarget: null,
};

const getList = async (url, query, pageNumber, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs };
  let page = '';
  let endpoint = `${useRuntimeConfig().public.baseURL}/${url}`;
  pageNumber && (page = `&page=${pageNumber}`);
  query && (endpoint = `${url}?${query}${page}`);

  try {
    const { data: response, status } = await useAsyncData('getListData', () =>
      $fetch(endpoint)
    );
    specs.fireSuccessAlert &&
      onSuccess(
        status,
        'Solicitação processada com sucesso!',
        specs.swalTarget
      );
    return response.value;
  } catch (error) {
    console.log('error', error);
    const {
      status,
      data: { detail },
    } = error;
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget);
    if (specs.throwError) {
      throw error;
    }
  }
};

const getItem = async (url, query, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs };
  let endpoint = `${useRuntimeConfig().public.baseURL}/${url}`;
  query && (endpoint = `${url}?${query}`);
  try {
    const { data: response, status } = await useAsyncData('getItemData', () =>
      $fetch(endpoint)
    );
    specs.fireSuccessAlert &&
      onSuccess(
        status,
        'Solicitação processada com sucesso!',
        'GET',
        specs.swalTarget
      );
    return response.value;
  } catch (error) {
    const {
      status,
      data: { detail },
    } = error;
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget);
    if (specs.throwError) {
      throw error;
    }
  }
};

const createItem = async (url, payload, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs };
  let endpoint = `${useRuntimeConfig().public.baseURL}/${url}`;
  try {
    const { data: response, status } = await useAsyncData(
      'createItemData',
      () => $fetch(endpoint, { method: 'PUT', body: payload })
    );
    specs.fireSuccessAlert &&
      onSuccessCreate(
        status,
        'Registo incluído com sucesso!',
        'PUT',
        specs.swalTarget
      );
    return response.value;
  } catch (error) {
    const {
      status,
      data: { detail },
    } = error;
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget);
    if (specs.throwError) {
      throw error;
    }
  }
};

const updateData = async (url, payload, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs };
  let endpoint = `${useRuntimeConfig().public.baseURL}/${url}`;
  try {
    const { data: response, status } = await useAsyncData(
      'updateDataItem',
      () => $fetch(endpoint, { method: 'POST', body: payload })
    );
    specs.fireSuccessAlert &&
      onSuccessUpdate(
        status,
        'Registo alterado com sucesso!',
        'POST',
        specs.swalTarget
      );
    return response.value;
  } catch (error) {
    const {
      status,
      data: { detail },
    } = error;
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget);
    if (specs.throwError) {
      throw error;
    }
  }
};

const removeItem = async (url, id, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs };
  let endpoint = `${useRuntimeConfig().public.baseURL}/${url}`;
  try {
    const { data: response, status } = await useAsyncData(
      'removeItemData',
      () => $fetch(`${endpoint}/${id}`, { method: 'DELETE' })
    );
    specs.fireSuccessAlert &&
      onSuccessDelete(
        status,
        'Registo deletado com sucesso!',
        'DELETE',
        specs.swalTarget
      );
    return response.value;
  } catch (error) {
    const {
      status,
      data: { detail },
    } = error;
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget);
    throw error;
  }
};

export { getList, getItem, createItem, updateData, removeItem };
