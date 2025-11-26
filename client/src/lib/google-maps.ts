let isLoading = false;
let isLoaded = false;

export async function loadGoogleMapsScript(): Promise<void> {
  if (isLoaded) {
    return Promise.resolve();
  }

  if (isLoading) {
    return new Promise((resolve) => {
      const checkLoaded = setInterval(() => {
        if (isLoaded) {
          clearInterval(checkLoaded);
          resolve();
        }
      }, 100);
    });
  }

  isLoading = true;

  const apiKey = await fetch('/api/config/google-api-key')
    .then(res => res.json())
    .then(data => data.apiKey)
    .catch(() => '');

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,geometry`;
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      isLoaded = true;
      isLoading = false;
      resolve();
    };

    script.onerror = () => {
      isLoading = false;
      reject(new Error('Failed to load Google Maps script'));
    };

    document.head.appendChild(script);
  });
}
