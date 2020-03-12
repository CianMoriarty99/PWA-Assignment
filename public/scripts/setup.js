localStorage.clear();

navigator.serviceWorker
    .register('service_worker.js')
    .then(() => console.log('Service worker registered'))
    .then(() => location.reload());

