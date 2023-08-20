export const openModal = (parent: string) => {
    $(`#${parent}-modal`).removeClass('modal--closed');
}

export const closeModal = (parent: string) => {
    $(`#${parent}-modal`).addClass('modal--closed');
}