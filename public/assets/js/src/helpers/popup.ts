export default ({ type, title, message }) => {
    if (!$('.popup-container')[0])
        $('<div class="popup-container">').appendTo(document.body);

    let popup = $('.popup'),
        length = Array.from(popup).length,
        icon = type == 'error' ? 'exclamation' : 'check';

    $(`
        <div class="popup popup--${type} flex" style="margin-top: ${length * 30}px; z-index: ${length + 1}">
            <div class="popup__icon flex flex--j-center flex--a-center">
                <svg class="image--icon" style="width: 2rem; height: 2rem;">
                    <use href="#${icon}"></use>
                </svg>
            </div>
            <div class="popup__message">
                <h4>${title}</h4>
                <p>${message}</p>
                <svg class="popup__message__close image--icon" style="width: 2rem; height: 2rem;">
                    <use href="#cross"></use>
                </svg>
            </div>
        </div>
    `).appendTo($('.popup-container')[0]);

    $($('.popup__message__close')[length]).on('click', (e) => {
        const popup = $((e.currentTarget.parentElement as HTMLElement).parentElement as HTMLElement)[0];

        popup.classList.remove('popup--open');

        setTimeout(() => {
            popup.remove();
        }, 1000);
    });

    setTimeout(() => {
        $('.popup')[length].classList.add('popup--open')
    }, 200);
};
