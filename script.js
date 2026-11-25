'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('feedback-modal');
  var openBtn = document.getElementById('open-feedback');
  var closeBtn = document.getElementById('close-feedback');
  var form = document.getElementById('feedback-form');
  var statusDiv = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');
  
  var fioInput = document.getElementById('fio');
  var phoneInput = document.getElementById('phone');

  // 1. Фильтрация ввода
  fioInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^А-Яа-яЁёA-Za-z\s\-]/g, '');
  });

  phoneInput.addEventListener('input', function() {
    this.value = this.value.replace(/[^\d+\(\)\s\-]/g, '');
  });

  // 2. History API
  openBtn.addEventListener('click', function() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    history.pushState({ modal: true }, '', '#feedback');
  });

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  closeBtn.addEventListener('click', function() {
    closeModal();
    if (window.location.hash === '#feedback') {
      history.back();
    }
  });

  window.addEventListener('popstate', function () {
    if (modal.classList.contains('active')) {
      closeModal();
    }
  });

  // 3. LocalStorage
  var inputs = form.querySelectorAll('input, textarea');
  inputs.forEach(function(input) {
    var savedValue = localStorage.getItem('feedback_' + input.name);
    if (savedValue) {
      if (input.type === 'checkbox') {
        input.checked = savedValue === 'true';
      } else {
        input.value = savedValue;
      }
    }
    input.addEventListener('input', function() {
      if (input.type === 'checkbox') {
        localStorage.setItem('feedback_' + input.name, input.checked);
      } else {
        localStorage.setItem('feedback_' + input.name, input.value);
      }
    });
  });

  // 4. Отправка на Web3Forms
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    statusDiv.textContent = 'Отправка на сервер...';
    statusDiv.style.color = '#dcdcdc';
    
    var formData = new FormData(form);

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: formData
    })
    .then(function(response) {
      if (response.ok) return response.json();
      throw new Error('Ошибка сервера');
    })
    .then(function(data) {
      statusDiv.textContent = 'Сообщение успешно отправлено!';
      statusDiv.style.color = '#4caf50';
      
      form.reset();
      inputs.forEach(function(input) {
        localStorage.removeItem('feedback_' + input.name);
      });
    })
    .catch(function(error) {
      statusDiv.textContent = 'Ошибка отправки. Попробуйте позже.';
      statusDiv.style.color = '#ff4d4d';
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
    });
  });
});
