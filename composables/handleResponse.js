
const mappedReturns = [
    {
        original: 'remove opportunity before removing company',
        translated: 'Exclua a oportunidade para excluir a empresa.'
    },
    {
        original: 'you already have an invoice pending approval',
        translated: 'Já possui uma proposta pendente de aprovação.'
    }
]

const onSuccess = (statusCode, title, swalTarget) => {
    const target = swalTarget ? document.getElementById(swalTarget) : 'body'
    if (statusCode != 200) {
        this?.$swal({
            position: 'top-end',
            icon: 'success',
            title: title,
            toast: true,
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            target,
        })
    }
}

const onSuccessCreate = (statusCode, title, swalTarget) => {
    const target = swalTarget ? document.getElementById(swalTarget) : 'body'
    this?.$swal({
        position: 'top-end',
        icon: 'success',
        title: title,
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        target,
    })
}

const onSuccessUpdate = (statusCode, title, swalTarget) => {
    const target = swalTarget ? document.getElementById(swalTarget) : 'body'
    this?.$swal({
        position: 'top-end',
        icon: 'success',
        title: title,
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        target,
    })
}

const onSuccessDelete = (statusCode, title, swalTarget) => {
    const target = swalTarget ? document.getElementById(swalTarget) : 'body'
    this?.$swal({
        position: 'top-end',
        icon: 'success',
        title: title,
        toast: true,
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        target,
    })
}

const onError = (statusCode, detail, swalTarget) => {
    const target = swalTarget ? document.getElementById(swalTarget) : 'body'
    if (statusCode == 403) {
        this?.$swal({
            icon: 'error',
            title: 'Usúario sem permissão para executar a ação',
            target,
            scrollbarPadding: false,
        })
    } else if (statusCode == 500) {
        this?.$swal({
            icon: 'error',
            title: 'Erro interno - Não foi possível alterar o registro',
            footer: `Detalhes: ${this.translateReturn(detail)}`,
            target,
            scrollbarPadding: false,
        })
    } else if (statusCode != 401) {
        const [{ msg }] = detail
        this?.$swal({
            icon: 'error',
            title: 'Erro interno - Não foi possível alterar o registro',
            footer: `details: ${msg.substring(0, 40)}`,
            target,
            scrollbarPadding: false,
        })
    }
}

const translateReturn = (detail) => {
    const message = mappedReturns.find((msg) => msg.original == detail)
    if (message) {
        return message.translated
    }
    else if ("ExceptionTranslation" in window && detail in ExceptionTranslation) {
        return ExceptionTranslation[detail]
    }
    else {
        return detail
    }
}

export { onSuccess, onSuccessCreate, onSuccessUpdate, onSuccessDelete, onError, translateReturn }
