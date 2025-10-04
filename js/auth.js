document.addEventListener('DOMContentLoaded' , () => {
    const loginView = document.getElementById('login-view');
    const registerView = document.getElementById('register-view');
    const showRegister= document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    showRegister?.addEventListener('click' , (e) => {
        e.preventDefault();
        loginView.classList.add('hidden');
        registerView.classList.remove('hidden');
    });

    showLogin?.addEventListener('click' , (e) => {
        e.preventDefault();
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    })
})