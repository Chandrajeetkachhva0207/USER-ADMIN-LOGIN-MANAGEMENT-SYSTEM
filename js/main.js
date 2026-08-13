// Global UI Utilities
function showToast(message, type = 'error') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  let icon = 'fa-circle-exclamation';
  if (type === 'success') icon = 'fa-check-circle';
  if (type === 'warning') icon = 'fa-triangle-exclamation';

  toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;
  container.appendChild(toast);

  // Trigger animation
  setTimeout(() => toast.classList.add('show'), 10);

  // Remove after 3s
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const icon = input.nextElementSibling.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.classList.remove('fa-eye');
    icon.classList.add('fa-eye-slash');
  } else {
    input.type = 'password';
    icon.classList.remove('fa-eye-slash');
    icon.classList.add('fa-eye');
  }
}

function toggleSidebar() {
  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.classList.toggle('open');
  }
}

function toggleTheme() {
  // Simplistic theme toggle via document body class for demo
  // Note: relies on CSS prefers-color-scheme in styles, but we can force it here
  if (document.documentElement.style.colorScheme === 'dark') {
    document.documentElement.style.colorScheme = 'light';
  } else {
    document.documentElement.style.colorScheme = 'dark';
  }
  showToast('Theme updated (Mock)', 'success');
}

// Validation Helper
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const loginForm = document.getElementById('loginForm');
  const adminForm = document.getElementById('adminForm');
  const twoFactorForm = document.getElementById('twoFactorForm');

  // Load Remembered Email
  const rememberMeBox = document.getElementById('rememberMe');
  const emailInput = document.getElementById('email');
  if (emailInput && localStorage.getItem('rememberedEmail')) {
    emailInput.value = localStorage.getItem('rememberedEmail');
    if (rememberMeBox) rememberMeBox.checked = true;
  }

  // Clear input styling on typing
  document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', () => input.classList.remove('input-error'));
  });

  // Handle Registration
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const usernameInput = document.getElementById('username');
      const emailInput = document.getElementById('email');
      const passwordInput = document.getElementById('password');

      const username = usernameInput.value.trim();
      const email = emailInput.value.trim();
      const password = passwordInput.value;

      let isValid = true;
      if (!username) { usernameInput.classList.add('input-error'); isValid = false; }
      if (!email || !isValidEmail(email)) { emailInput.classList.add('input-error'); isValid = false; }
      if (!password || password.length < 6) { 
        passwordInput.classList.add('input-error'); 
        showToast('Password must be at least 6 characters', 'error');
        isValid = false; 
      }

      if (isValid) {
        const btn = registerForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<div class="spinner"></div>`;
        btn.disabled = true;

        fetch('http://localhost:3000/api/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
          if (status === 201) {
            showToast('Registration successful!', 'success');
            setTimeout(() => window.location.href = 'index.html', 1500);
          } else {
            showToast(body.message || 'Registration failed', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
          }
        })
        .catch(error => {
          showToast('Server error. Is the backend running?', 'error');
          btn.innerHTML = originalText;
          btn.disabled = false;
        });
      }
    });
  }

  // Handle Login
  if (loginForm) {
    if (localStorage.getItem('currentUser')) {
      window.location.href = 'dashboard.html';
    }

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const email = emailInput.value.trim();
      const passwordInput = document.getElementById('password');
      const password = passwordInput.value;

      let isValid = true;
      if (!email) { emailInput.classList.add('input-error'); isValid = false; }
      if (!password) { passwordInput.classList.add('input-error'); isValid = false; }

      if (isValid) {
        if (rememberMeBox && rememberMeBox.checked) {
          localStorage.setItem('rememberedEmail', email);
        } else {
          localStorage.removeItem('rememberedEmail');
        }

        const btn = loginForm.querySelector('button[type="submit"]');
        const originalText = btn.innerHTML;
        btn.innerHTML = `<div class="spinner"></div>`;
        btn.disabled = true;

        fetch('http://localhost:3000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(({ status, body }) => {
          if (status === 200) {
            localStorage.setItem('pending2FAUser', JSON.stringify({ username: body.user.username, email: body.user.email }));
            showToast('Credentials accepted. Verify 2FA.', 'warning');
            setTimeout(() => window.location.href = '2fa.html', 1000);
          } else {
            showToast(body.message || 'Invalid credentials', 'error');
            btn.innerHTML = originalText;
            btn.disabled = false;
          }
        })
        .catch(error => {
          showToast('Server error. Is the backend running?', 'error');
          btn.innerHTML = originalText;
          btn.disabled = false;
        });
      }
    });
  }

  // Handle Admin Login
  if (adminForm) {
    if (localStorage.getItem('currentAdmin')) {
      window.location.href = 'admin-dashboard.html';
    }

    adminForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const adminIdInput = document.getElementById('adminId');
      const passwordInput = document.getElementById('password');
      const adminId = adminIdInput.value.trim();
      const password = passwordInput.value;

      if (!adminId || !password) {
        showToast('Please fill all required fields', 'error');
        return;
      }

      const btn = adminForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<div class="spinner"></div>`;
      btn.disabled = true;

      setTimeout(() => {
        if (adminId === 'admin@system.com' && password === 'admin123') {
          localStorage.setItem('currentAdmin', JSON.stringify({ adminId }));
          showToast('Access Granted', 'success');
          setTimeout(() => window.location.href = 'admin-dashboard.html', 1000);
        } else {
          showToast('Invalid Admin credentials', 'error');
          btn.innerHTML = originalText;
          btn.disabled = false;
        }
      }, 1000);
    });
  }

  // Handle 2FA Verification
  if (twoFactorForm) {
    const pendingUser = JSON.parse(localStorage.getItem('pending2FAUser'));
    if (!pendingUser) window.location.href = 'index.html';

    const inputs = twoFactorForm.querySelectorAll('.token-input');
    inputs.forEach((input, index) => {
      input.addEventListener('input', () => {
        if (input.value.length === 1 && index < inputs.length - 1) inputs[index + 1].focus();
      });
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && input.value.length === 0 && index > 0) inputs[index - 1].focus();
      });
    });

    twoFactorForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const code = Array.from(inputs).map(input => input.value).join('');
      
      if (code.length !== 6) {
        showToast('Please enter all 6 digits', 'warning');
        return;
      }

      const btn = twoFactorForm.querySelector('button[type="submit"]');
      const originalText = btn.innerHTML;
      btn.innerHTML = `<div class="spinner"></div>`;
      btn.disabled = true;

      setTimeout(() => {
        if (code === '123456') { // Dummy 2FA check
          localStorage.setItem('currentUser', JSON.stringify(pendingUser));
          localStorage.removeItem('pending2FAUser');
          showToast('Verified!', 'success');
          setTimeout(() => window.location.href = 'dashboard.html', 1000);
        } else {
          showToast('Invalid code. Try 123456', 'error');
          btn.innerHTML = originalText;
          btn.disabled = false;
          inputs.forEach(input => input.value = '');
          inputs[0].focus();
        }
      }, 1000);
    });
  }

  // Dashboard Logic
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    const isUserDash = document.getElementById('displayUsername');
    const isAdminDash = document.getElementById('displayAdminId');

    if (isUserDash) {
      const currentUser = JSON.parse(localStorage.getItem('currentUser'));
      if (!currentUser) { window.location.href = 'index.html'; return; }
      
      document.getElementById('displayUsername').textContent = currentUser.username || 'User';
      document.getElementById('displayEmail').textContent = currentUser.email;
      if(document.getElementById('avatarInitial')) {
        document.getElementById('avatarInitial').textContent = (currentUser.username || 'U').charAt(0).toUpperCase();
      }

      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
      });

      // Init Chart.js for User Dashboard
      const ctx = document.getElementById('activityChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'line',
          data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
              label: 'Activity Score',
              data: [12, 19, 15, 25, 22, 30, 28],
              borderColor: '#4f46e5',
              tension: 0.4,
              fill: true,
              backgroundColor: 'rgba(79, 70, 229, 0.1)'
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }
    }

    if (isAdminDash) {
      const currentAdmin = JSON.parse(localStorage.getItem('currentAdmin'));
      if (!currentAdmin) { window.location.href = 'admin-login.html'; return; }

      // Fetch User Count
      fetch('http://localhost:3000/api/users/count')
        .then(res => res.json())
        .then(data => {
          if (data.count !== undefined) {
            document.getElementById('userCount').textContent = data.count;
          }
        })
        .catch(err => console.error('Error fetching user count:', err));

      logoutBtn.addEventListener('click', () => {
        localStorage.removeItem('currentAdmin');
        window.location.href = 'admin-login.html';
      });

      // Init Chart.js for Admin Dashboard
      const trafficCtx = document.getElementById('trafficChart');
      if (trafficCtx) {
        new Chart(trafficCtx, {
          type: 'bar',
          data: {
            labels: ['00:00', '04:00', '08:00', '12:00', '16:00', '20:00'],
            datasets: [{
              label: 'Active Connections',
              data: [150, 80, 420, 560, 310, 220],
              backgroundColor: '#10b981',
              borderRadius: 4
            }]
          },
          options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
      }
    }
  }
});
