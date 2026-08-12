document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');

  // Helper functions
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showError(input, message) {
    input.classList.add('input-error');
    const errorMsg = input.parentElement.querySelector('.error-msg');
    if (errorMsg) {
      errorMsg.textContent = message;
      errorMsg.classList.add('visible');
    }
  }

  function clearError(input) {
    input.classList.remove('input-error');
    const errorMsg = input.parentElement.querySelector('.error-msg');
    if (errorMsg) {
      errorMsg.classList.remove('visible');
    }
  }

  // Clear errors on input
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => clearError(input));
  });

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      
      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      // Validation
      if (!username) { showError(usernameInput, 'Username is required'); isValid = false; }
      if (!email) { showError(emailInput, 'Email is required'); isValid = false; }
      else if (!isValidEmail(email)) { showError(emailInput, 'Please enter a valid email'); isValid = false; }
      if (!password) { showError(passwordInput, 'Password is required'); isValid = false; }
      else if (password.length < 6) { showError(passwordInput, 'Password must be at least 6 characters'); isValid = false; }

      if (isValid) {
        // Check if user exists
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const userExists = users.some(u => u.email === email || u.username === username);

        if (userExists) {
          showError(emailInput, 'Email or Username already exists');
          return;
        }

        const btn = registerForm.querySelector('.btn-primary');
        btn.textContent = 'Creating Account...';
        btn.disabled = true;

        setTimeout(() => {
          users.push({ username, email, password });
          localStorage.setItem('users', JSON.stringify(users));
          
          btn.textContent = 'Success!';
          btn.style.backgroundColor = '#10b981';
          
          setTimeout(() => {
            window.location.href = 'index.html';
          }, 1500);
        }, 1000);
      }
    });
  }

  // Handle Login
  if (loginForm) {
    // Check if already logged in
    if (localStorage.getItem('currentUser')) {
      window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      const email = emailInput.value.trim();
      const password = passwordInput.value;

      if (!email) { showError(emailInput, 'Email is required'); isValid = false; }
      if (!password) { showError(passwordInput, 'Password is required'); isValid = false; }

      if (isValid) {
        const btn = loginForm.querySelector('.btn-primary');
        btn.textContent = 'Authenticating...';
        btn.disabled = true;

        setTimeout(() => {
          const users = JSON.parse(localStorage.getItem('users') || '[]');
          const user = users.find(u => u.email === email && u.password === password);

          if (user) {
            localStorage.setItem('pending2FAUser', JSON.stringify({ username: user.username, email: user.email }));
            btn.textContent = 'Verify 2FA...';
            btn.style.backgroundColor = '#f59e0b';
            
            setTimeout(() => {
              window.location.href = '2fa.html';
            }, 1000);
          } else {
            showError(emailInput, 'Invalid email or password');
            btn.textContent = 'Sign In';
            btn.disabled = false;
          }
        }, 1000);
      }
    });
  }

  // Handle Admin Login
  const adminForm = document.getElementById('adminForm');
  if (adminForm) {
    if (localStorage.getItem('currentAdmin')) {
      window.location.href = 'admin-dashboard.html';
    }

    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      
      const adminIdInput = document.getElementById('adminId');
      const passwordInput = document.getElementById('password');

      const adminId = adminIdInput.value.trim();
      const password = passwordInput.value;

      if (!adminId) { showError(adminIdInput, 'Admin ID is required'); isValid = false; }
      if (!password) { showError(passwordInput, 'Password is required'); isValid = false; }

      if (isValid) {
        const btn = adminForm.querySelector('.btn-primary');
        btn.textContent = 'Authenticating...';
        btn.disabled = true;

        setTimeout(() => {
          // Hardcoded admin for demo purposes
          if (adminId === 'admin@system.com' && password === 'admin123') {
            localStorage.setItem('currentAdmin', JSON.stringify({ adminId: adminId }));
            btn.textContent = 'Access Granted!';
            btn.style.backgroundColor = '#10b981';
            
            setTimeout(() => {
              window.location.href = 'admin-dashboard.html';
            }, 1000);
          } else {
            showError(adminIdInput, 'Invalid Admin ID or Password');
            btn.textContent = 'Secure Login';
            btn.disabled = false;
          }
        }, 1000);
      }
    });
  }

  // Handle 2FA Verification
  const twoFactorForm = document.getElementById('twoFactorForm');
  if (twoFactorForm) {
    const pendingUser = JSON.parse(localStorage.getItem('pending2FAUser'));
    if (!pendingUser) {
      window.location.href = 'index.html'; // Redirect to login if no pending user
    }

    // Auto-focus next input
    const inputs = twoFactorForm.querySelectorAll('.token-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && index < inputs.length - 1) {
          inputs[index + 1].focus();
        }
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length === 0 && index > 0) {
          inputs[index - 1].focus();
        }
      });
    });

    twoFactorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const code = Array.from(inputs).map(input => input.value).join('');
      const errorMsg = document.getElementById('twoFactorError');
      const btn = twoFactorForm.querySelector('.btn-primary');

      if (code.length !== 6) {
        errorMsg.textContent = 'Please enter all 6 digits';
        errorMsg.classList.add('visible');
        return;
      }

      btn.textContent = 'Verifying...';
      btn.disabled = true;

      // Dummy 2FA check (code: 123456)
      setTimeout(() => {
        if (code === '123456') {
          // Success
          localStorage.setItem('currentUser', JSON.stringify(pendingUser));
          localStorage.removeItem('pending2FAUser');
          
          btn.textContent = 'Verified!';
          btn.style.backgroundColor = '#10b981';
          
          setTimeout(() => {
            window.location.href = 'dashboard.html';
          }, 1000);
        } else {
          // Failure
          errorMsg.textContent = 'Invalid code. Try again.';
          errorMsg.classList.add('visible');
          btn.textContent = 'Verify Identity';
          btn.disabled = false;
          inputs.forEach(input => input.value = '');
          inputs[0].focus();
        }
      }, 1000);
    });
  }
});
