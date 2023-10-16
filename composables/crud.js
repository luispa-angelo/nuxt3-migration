const defaultSpecs = {
  fireSuccessAlert: true,
  fireErrorAlert: true,
  context: null,
  throwError: false,
  swalTarget: null,
}

const getList = async (url, query, pageNumber, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs }
  let page = ''
  let endpoint = url
  pageNumber && (page = `&page=${pageNumber}`)
  query && (endpoint = `${url}?${query}${page}`)

  try {
    const { data: { _rawValue }, status } = await useAsyncData('getListData', () => $fetch(endpoint))
    specs.fireSuccessAlert && onSuccess(status, 'Solicitação processada com sucesso!', specs.swalTarget)
    return _rawValue
  } catch (error) {
    console.log('error', error);
    const { status, data: { detail } } = error
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget)
    if (specs.throwError) {
      throw error
    }
  }
}
const getItem = async (url, query, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs }
  let endpoint = url
  query && (endpoint = `${url}?${query}`)
  try {
    const { data: { _rawValue: item }, status } = await useAsyncData('getItemData', () => $fetch(endpoint))
    specs.fireSuccessAlert && onSuccess(status, 'Solicitação processada com sucesso!', 'GET', specs.swalTarget)
    return item
  } catch (error) {
    const { status, data: { detail } } = error
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget)
    if (specs.throwError) {
      throw error
    }
  }
}
const createItem = async (url, payload, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs }
  try {
    const { data: { _rawValue }, status } = await useAsyncData('createItemData', () => $fetch(url, { method: 'PUT', body: payload }))
    specs.fireSuccessAlert && onSuccessCreate(status, 'Registo incluído com sucesso!', 'PUT', specs.swalTarget)
    return _rawValue
  } catch (error) {
    const { status, data: { detail } } = error
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget)
    if (specs.throwError) {
      throw error
    }
  }
}
const updateData = async (url, payload, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs }
  try {
    const { data: { _rawValue }, status } = await useAsyncData('updateDataItem', () => $fetch(url, { method: 'POST', body: payload }))
    specs.fireSuccessAlert && onSuccessUpdate(status, 'Registo alterado com sucesso!', 'POST', specs.swalTarget)
    return _rawValue
  } catch (error) {
    const { status, data: { detail } } = error
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget)
    if (specs.throwError) {
      throw error
    }
  }
}
const removeItem = async (url, id, customSpecs = defaultSpecs) => {
  const specs = { defaultSpecs, ...customSpecs }
  try {
    const { data: { _rawValue }, status } = await useAsyncData('removeItemData', () => $fetch(`${url}/${id}`, { method: 'DELETE' }))
    specs.fireSuccessAlert && onSuccessDelete(status, 'Registo deletado com sucesso!', 'DELETE', specs.swalTarget)
    return _rawValue
  } catch (error) {
    const { status, data: { detail } } = error
    specs.fireErrorAlert && onError(status, detail, specs.swalTarget)
    throw error
  }
}
const setContext = (context) => {
  if (!context) {
    return this
  } else {
    return context
  }
}


export { getList, getItem, createItem, updateData, removeItem }