document.addEventListener('DOMContentLoaded', () => {
  const forms = document.querySelectorAll('form');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      let isValid = true;
      const inputs = form.querySelectorAll('input[required]');

      inputs.forEach(input => {
        const errorMsg = input.parentElement.querySelector('.error-msg');
        if (!input.value.trim()) {
          isValid = false;
          input.classList.add('input-error');
          if (errorMsg) {
            errorMsg.textContent = 'This field is required';
            errorMsg.classList.add('visible');
          }
        } else if (input.type === 'email' && !isValidEmail(input.value)) {
          isValid = false;
          input.classList.add('input-error');
          if (errorMsg) {
            errorMsg.textContent = 'Please enter a valid email';
            errorMsg.classList.add('visible');
          }
        } else {
          input.classList.remove('input-error');
          if (errorMsg) {
            errorMsg.classList.remove('visible');
          }
        }
      });

      if (isValid) {
        const btn = form.querySelector('.btn-primary');
        const originalText = btn.textContent;
        btn.textContent = 'Processing...';
        btn.style.opacity = '0.8';
        btn.disabled = true;
        
        // Simulate API call
        setTimeout(() => {
          btn.textContent = 'Success!';
          btn.style.backgroundColor = '#10b981';
          setTimeout(() => {
            btn.textContent = originalText;
            btn.style.backgroundColor = '';
            btn.disabled = false;
            btn.style.opacity = '1';
            
            // For demo: reset form
            form.reset();
          }, 2000);
        }, 1500);
      }
    });

    // Remove error on input
    form.querySelectorAll('input').forEach(input => {
      input.addEventListener('input', () => {
        input.classList.remove('input-error');
        const errorMsg = input.parentElement.querySelector('.error-msg');
        if (errorMsg) {
          errorMsg.classList.remove('visible');
        }
      });
    });
  });

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }
});
