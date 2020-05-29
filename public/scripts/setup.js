localStorage.clear();

/*
 * Checks to see if there is a serviceWorker present on the browser, registers a new one if not
 */
Promise.allSettled(
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