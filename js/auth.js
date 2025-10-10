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

    const LS_KEYS = {
        USERS: 'niqo.users',
        SESSION: 'niqo.session'
    };

    function loadUsers() {
        try {
            return JSON.parse(localStorage.getItem(LS_KEYS.USERS)) ?? [];
        } catch {
            return [];
        }
    }

    function saveUsers(users) {
        localStorage.setItem(LS_KEYS.USERS , JSON.stringify(users));
    }

    function setSession(session) {
        localStorage.setItem(LS_KEYS.SESSION, JSON.stringify(session));
    }

    function getSession() {
        return JSON.parse(localStorage.getItem(LS_KEYS.SESSION));
    }

    //a tester encore cette fonction
    function clearSession() {
    localStorage.removeItem(LS_KEYS.SESSION);
    }


    async function sha256(text) {
        const enc = new TextEncoder();
        const digest = await crypto.subtle.digest('SHA-256' , enc.encode(text));
        return [...new Uint8Array(digest)].map(b => b.toString(16).padStart(2,'0')).join('');
    }

    function showMessage(el,msg, type = 'error'){
        if (!el) return;
        el.classList.remove('hidden', 'error', 'success'); 
        el.classList.add(type);
        el.textContent = msg;
    }

    function hideMessage(el) {
        if (!el) return;
        el.classList.add('hidden');
        el.textContent = '';
    }

    function redirect(url) {
        if (window.__TEST_MODE__) { window.__lastRedirect = url; return; }
        window.location.href = url;
    }
// puis utiliser: redirect('./dashboard.html') au lieu de window.location.href ...


   /* const session = getSession();
    if(session && (session.username || session.guest)) {
            window.location.href = './dashboard.html';
            return;
    } 
    */
   
    const loginForm = document.getElementById('login-form');
    const loginMsg = document.getElementById('login-message'); 

    loginForm?.addEventListener('submit' , async (e) => {
        e.preventDefault();
        hideMessage(loginMsg);

        const form = new FormData(e.currentTarget);
        const username = (form.get('username') || '').toString().trim();
        const password = (form.get('password') || '').toString();

        if(!username || !password) {
            showMessage(loginMsg , 'Tous les champs sont requis.');
            return;
        }

        const users = loadUsers();
        const user = users.find(u => u.username.toLowerCase() === username.toLowerCase()); 

        if (!user) {
            showMessage(loginMsg, 'Utilisateur introuvable');
            return;
        }

        
        const passHash = await sha256(password);

        if (user.passwordHash !== passHash) {
            showMessage(loginMsg, 'Mot de passe incorrect.');
            return;
        }

        
        setSession({ username: user.username, currency: user.currency, guest: false });
        redirect('./dashboard.html');
        

    });

    const guestBtn = document.getElementById('guest-login');
        
    guestBtn?.addEventListener('click' , () => {
        setSession({ guest: true, username: 'Invité', currency: 'EUR' });
        redirect('./dashboard.html');
    })

    const registerForm = document.getElementById('register-form');
    const registerMsg = document.getElementById('register-message');

    registerForm?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideMessage(registerMsg);

    const form = new FormData(registerForm);
    const username = (form.get('username') || '').toString().trim();
    const password = (form.get('password') || '').toString();
    const currency = (form.get('currency') || 'EUR').toString();

    
    if (!username || !password) {
        showMessage(registerMsg, 'Tous les champs sont requis.');
        return;
    }
    if (username.length < 3) {
        showMessage(registerMsg, 'Le nom d’utilisateur doit faire au moins 3 caractères.');
        return;
    }
    if (password.length < 6) {
        showMessage(registerMsg, 'Mot de passe trop court (≥ 6 caractères).');
        return;
    }

    
    const users = loadUsers();
    const exists = users.some(u => u.username.toLowerCase() === username.toLowerCase());
    if (exists) {
        showMessage(registerMsg, 'Ce nom d’utilisateur est déjà pris.');
        return;
    }

    
    const passwordHash = await sha256(password);
    users.push({ username, passwordHash, currency, createdAt: Date.now() });
    saveUsers(users);

    
    showMessage(registerMsg, 'Compte créé ! Vous pouvez vous connecter.', 'success');
    setTimeout(() => {
        registerView.classList.add('hidden');
        loginView.classList.remove('hidden');
    }, 800);
    });
});