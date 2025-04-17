// Authentication system
document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const loginModal = document.getElementById('loginModal');
    const registerModal = document.getElementById('registerModal');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const closeLogin = document.getElementById('closeLogin');
    const closeRegister = document.getElementById('closeRegister');
    const switchToRegister = document.getElementById('switchToRegister');
    const switchToLogin = document.getElementById('switchToLogin');
    
    // Account elements
    const authButtons = document.getElementById('authButtons');
    const userAccount = document.getElementById('userAccount');
    const userName = document.getElementById('userName');
    const userAvatar = document.getElementById('userAvatar');
    const userAccountBtn = document.getElementById('userAccountBtn');
    const userDropdown = document.getElementById('userDropdown');
    const logoutBtn = document.getElementById('logoutBtn');
    const loginMessage = document.getElementById('loginMessage');
    const authMessageText = document.getElementById('authMessageText');
    
    // Check if user is logged in (from localStorage)
    function checkLoginStatus() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            // User is logged in, show account info
            const userData = JSON.parse(loggedInUser);
            displayLoggedInUI(userData);
        }
    }
    
    // Run on page load
    checkLoginStatus();
    
    // Display logged-in UI
    function displayLoggedInUI(userData) {
        // Hide auth buttons and show user account
        if (authButtons) authButtons.style.display = 'none';
        if (userAccount) userAccount.style.display = 'block';
        
        // Set user name and avatar initial
        if (userName && userData.fullName) {
            userName.textContent = userData.fullName || userData.email;
        }
        
        if (userAvatar) {
            if (userData.fullName) {
                userAvatar.textContent = userData.fullName.charAt(0).toUpperCase();
            } else if (userData.email) {
                userAvatar.textContent = userData.email.charAt(0).toUpperCase();
            }
        }
    }
    
    // Open login modal
    if (loginBtn) {
        loginBtn.addEventListener('click', function() {
            if (loginModal) loginModal.classList.add('active');
        });
    }
    
    // Open register modal
    if (registerBtn) {
        registerBtn.addEventListener('click', function() {
            if (registerModal) registerModal.classList.add('active');
        });
    }
    
    // Close login modal
    if (closeLogin) {
        closeLogin.addEventListener('click', function() {
            if (loginModal) loginModal.classList.remove('active');
        });
    }
    
    // Close register modal
    if (closeRegister) {
        closeRegister.addEventListener('click', function() {
            if (registerModal) registerModal.classList.remove('active');
        });
    }
    
    // Switch from login to register
    if (switchToRegister) {
        switchToRegister.addEventListener('click', function(e) {
            e.preventDefault();
            if (loginModal) loginModal.classList.remove('active');
            setTimeout(function() {
                if (registerModal) registerModal.classList.add('active');
            }, 300);
        });
    }
    
    // Switch from register to login
    if (switchToLogin) {
        switchToLogin.addEventListener('click', function(e) {
            e.preventDefault();
            if (registerModal) registerModal.classList.remove('active');
            setTimeout(function() {
                if (loginModal) loginModal.classList.add('active');
            }, 300);
        });
    }
    
    // Toggle user dropdown
    if (userAccountBtn) {
        userAccountBtn.addEventListener('click', function() {
            if (userDropdown) userDropdown.classList.toggle('active');
        });
    }
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (userAccountBtn && userDropdown && !userAccountBtn.contains(e.target) && !userDropdown.contains(e.target)) {
            userDropdown.classList.remove('active');
        }
    });
    
    // Logout functionality
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Remove user data from localStorage
            localStorage.removeItem('loggedInUser');
            
            // Show auth buttons, hide user account
            if (authButtons) authButtons.style.display = 'flex';
            if (userAccount) userAccount.style.display = 'none';
            if (userDropdown) userDropdown.classList.remove('active');
            
            // Show logout message
            if (authMessageText) authMessageText.textContent = "Đăng xuất thành công!";
            if (loginMessage) {
                loginMessage.classList.add('show');
                setTimeout(function() {
                    loginMessage.classList.remove('show');
                }, 3000);
            }
        });
    }
    
    // Close modals when clicking outside
    window.addEventListener('click', function(e) {
        if (loginModal && e.target === loginModal) {
            loginModal.classList.remove('active');
        }
        if (registerModal && e.target === registerModal) {
            registerModal.classList.remove('active');
        }
    });
    
    // Form submission - Login
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values (in a real app, you would validate with server)
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Simulate successful login (in real app would be API call)
            const userData = {
                email: email,
                fullName: email.split('@')[0], // Just a placeholder
                loggedInAt: new Date()
            };
            
            // Store user data in localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(userData));
            
            // Update UI to show logged in state
            displayLoggedInUI(userData);
            
            // Close modal
            if (loginModal) loginModal.classList.remove('active');
            
            // Show success message
            if (authMessageText) authMessageText.textContent = "Đăng nhập thành công!";
            if (loginMessage) {
                loginMessage.classList.add('show');
                setTimeout(function() {
                    loginMessage.classList.remove('show');
                }, 3000);
            }
        });
    }
    
    // Form submission - Register
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Password confirmation validation
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                alert('Mật khẩu xác nhận không khớp!');
                return;
            }
            
            // Get user information
            const fullName = document.getElementById('fullName').value;
            const email = document.getElementById('email').value;
            const birthDate = document.getElementById('birthDate').value;
            const phone = document.getElementById('phone').value;
            const address = document.getElementById('address').value;
            
            // Create user object (in real app would be sent to server)
            const userData = {
                fullName: fullName,
                email: email,
                birthDate: birthDate,
                phone: phone,
                address: address,
                registeredAt: new Date()
            };
            
            // Store user data in localStorage
            localStorage.setItem('loggedInUser', JSON.stringify(userData));
            
            // Update UI to show logged in state
            displayLoggedInUI(userData);
            
            // Close modal
            if (registerModal) registerModal.classList.remove('active');
            
            // Show success message
            if (authMessageText) authMessageText.textContent = "Đăng ký thành công!";
            if (loginMessage) {
                loginMessage.classList.add('show');
                setTimeout(function() {
                    loginMessage.classList.remove('show');
                }, 3000);
            }
        });
    }
});