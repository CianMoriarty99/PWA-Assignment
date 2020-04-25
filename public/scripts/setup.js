localStorage.clear();

Promise.all(
    [new Promise((resolve, reject) => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('service_worker.js')
                .then(resolve)
                .catch(reject);
        };
    }),
    new Promise(initDbPromise)]
).then(() => location.reload());