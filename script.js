'use strict';

document.addEventListener('DOMContentLoaded', function () {
  var modal = document.getElementById('feedback-modal');
  var openBtn = document.getElementById('open-feedback');
  var closeBtn = document.getElementById('close-feedback');
  var form = document.getElementById('feedback-form');
  var statusDiv = document.getElementById('form-status');
  var submitBtn = document.getElementById('submit-btn');
  
  // ВСТАВЬ СЮДА СВОЮ ССЫЛКУ ИЗ FORMCARRY
  var formcarryUrl = 'https://formcarry.com/s/ТВОЯ_ССЫЛКА_ИЗ_FORMCARRY';

  // 1. Работа с History API
  function openModal() {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Блокируем скролл фона
    history.pushState({ modal: true }, '', '#feedback');
  }

  function closeModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Если мы закрываем сами, возвращаем URL
    if (window.location.hash === '#feedback') {
      history.back();
    }
  }

  openBtn.addEventListener('click', openModal);
  closeBtn.addEventListener('click', closeModal);

  // Обработка кнопки "Назад" в браузере
  window.addEventListener('popstate', function (event) {
    if (modal.classList.contains('active')) {
      closeModal();
    }
  });

  // 2. LocalStorage (Сохранение и восстановление)
  var inputs = form.querySelectorAll('input, textarea');
  
  inputs.forEach(function(input) {
    // Восстановление при загрузке
    var savedValue = localStorage.getItem('feedback_' + input.name);
    if (savedValue) {
      if (input.type === 'checkbox') {
        input.checked = savedValue === 'true';
      } else {
        input.value = savedValue;
      }
    }

    // Сохранение при вводе
    input.addEventListener('input', function() {
      if (input.type === 'checkbox') {
        localStorage.setItem('feedback_' + input.name, input.checked);
      } else {
        localStorage.setItem('feedback_' + input.name, input.value);
      }
    });
  });

  // 3. Отправка формы (Fetch API)
  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Отменяем перезагрузку
    
    submitBtn.disabled = true;
    submitBtn.textContent = 'Отправка...';
    statusDiv.textContent = '';
    statusDiv.style.color = '';

    var formData = new FormData(form);

    fetch(formcarryUrl, {
      method: 'POST',
      body: formData,
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(function(response) {
      if (response.ok) {
        return response.json();
      }
      throw new Error('Ошибка сети');
    })
    .then(function(data) {
      // Успех
      statusDiv.textContent = 'Сообщение успешно отправлено!';
      statusDiv.style.color = '#4caf50';
      
      // Очищаем форму и LocalStorage
      form.reset();
      inputs.forEach(function(input) {
        localStorage.removeItem('feedback_' + input.name);
      });
    })
    .catch(function(error) {
      // Ошибка
      statusDiv.textContent = 'Ошибка отправки. Попробуйте позже.';
      statusDiv.style.color = '#ff4d4d';
    })
    .finally(function() {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Отправить';
    });
  });
});
