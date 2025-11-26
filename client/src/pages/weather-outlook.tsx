import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

type AlertLevel = 'normal' | 'yellow' | 'orange' | 'red' | 'violet';
type WeatherData = {
  location: { city: string; province: string; lat: number; lng: number };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    condition: string;
    heatIndex: number;
  };
  forecast: Array<{
    day: string;
    date: string;
    high: number;
    low: number;
    icon: string;
  }>;
  cyclone: {
    active: boolean;
    name: string;
    distance: number;
    intensity: string;
  };
  alerts: {
    rainfall: AlertLevel;
    heat: boolean;
  };
  satelliteUrl: string;
};

const weatherIcons: Record<string, string> = {
  'partly-cloudy': '⛅',
  'sunny': '☀️',
  'rainy': '🌧️',
  'storm': '⛈️',
  'cloudy': '☁️'
};

const alertConfig: Record<AlertLevel, { color: string; label: string; icon: string }> = {
  normal: { color: '#10B981', label: 'Normal', icon: '🟢' },
  yellow: { color: '#EAB308', label: 'Heavy Rainfall Watch', icon: '🟡' },
  orange: { color: '#F97316', label: 'Heavy Rainfall Warning', icon: '🟠' },
  red: { color: '#EF4444', label: 'Severe Warning', icon: '🔴' },
  violet: { color: '#8B5CF6', label: 'Extreme Emergency', icon: '🟣' }
};

const WeatherOutlook = () => {
  const [location, setLocation] = useState<{ city: string; province: string; lat: number; lng: number } | null>(null);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [satelliteImage, setSatelliteImage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    const init = async () => {
      const cached = localStorage.getItem('weatherData');
      if (cached) {
        setWeatherData(JSON.parse(cached));
        setLoading(false);
      }
      
      await getCurrentLocation();
    };
    
    init();
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  useEffect(() => {
    const fetchSatellite = () => {
      const timestamp = new Date().getTime();
      setSatelliteImage(`http://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif?t=${timestamp}`);
    };

    fetchSatellite();
    const interval = setInterval(fetchSatellite, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (showAlert) {
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 30000);
      
      return () => clearTimeout(timer);
    }
  }, [showAlert]);

  const getCurrentLocation = async () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            city: 'Manila',
            province: 'Metro Manila',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location error:', error);
          setLocation({
            city: 'Manila',
            province: 'Metro Manila',
            lat: 14.5995,
            lng: 120.9842
          });
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } else {
      setLocation({
        city: 'Manila',
        province: 'Metro Manila',
        lat: 14.5995,
        lng: 120.9842
      });
    }
  };

  const getWindDirection = (deg: number): string => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((deg % 360) / 45)) % 8;
    return directions[index];
  };

  const getWeatherIcon = (weatherId: number): string => {
    if (weatherId >= 200 && weatherId < 300) return 'storm';
    if (weatherId >= 300 && weatherId < 600) return 'rainy';
    if (weatherId >= 600 && weatherId < 700) return 'rainy';
    if (weatherId === 800) return 'sunny';
    if (weatherId > 800) return 'cloudy';
    return 'partly-cloudy';
  };

  const calculateHeatIndex = (temp: number, humidity: number): number => {
    const T = temp;
    const RH = humidity;
    
    if (T < 27) return T;
    
    const HI = -8.78469475556 +
      1.61139411 * T +
      2.33854883889 * RH +
      -0.14611605 * T * RH +
      -0.012308094 * T * T +
      -0.0164248277778 * RH * RH +
      0.002211732 * T * T * RH +
      0.00072546 * T * RH * RH +
      -0.000003582 * T * T * RH * RH;
    
    return Math.round(HI);
  };

  const determineRainfallAlert = (weatherId: number): AlertLevel => {
    if (weatherId >= 200 && weatherId < 300) return 'red';
    if (weatherId >= 500 && weatherId < 600) {
      if (weatherId >= 502 && weatherId <= 504) return 'orange';
      if (weatherId === 501) return 'yellow';
    }
    return 'normal';
  };

  const fetchWeatherData = async () => {
    if (!location) return;
    
    setLoading(true);
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`/api/weather/current?lat=${location.lat}&lon=${location.lng}`),
        fetch(`/api/weather/forecast?lat=${location.lat}&lon=${location.lng}`)
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      const heatIndex = calculateHeatIndex(
        Math.round(currentData.main.temp),
        currentData.main.humidity
      );

      const rainfallAlert = determineRainfallAlert(currentData.weather[0].id);

      const dailyForecasts = [];
      const processedDates = new Set<string>();
      
      for (const item of forecastData.list) {
        const date = new Date(item.dt * 1000);
        const dateStr = date.toISOString().split('T')[0];
        
        if (!processedDates.has(dateStr) && processedDates.size < 5) {
          processedDates.add(dateStr);
          const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
          
          const dayItems = forecastData.list.filter((i: any) => {
            const d = new Date(i.dt * 1000).toISOString().split('T')[0];
            return d === dateStr;
          });
          
          const temps = dayItems.map((i: any) => i.main.temp);
          const high = Math.round(Math.max(...temps));
          const low = Math.round(Math.min(...temps));
          
          dailyForecasts.push({
            day: dayName,
            date: dateStr,
            high,
            low,
            icon: getWeatherIcon(item.weather[0].id)
          });
        }
      }

      const newWeatherData: WeatherData = {
        location: {
          city: currentData.name || location.city,
          province: location.province,
          lat: location.lat,
          lng: location.lng
        },
        current: {
          temp: Math.round(currentData.main.temp),
          feelsLike: Math.round(currentData.main.feels_like),
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          windDirection: getWindDirection(currentData.wind.deg),
          condition: currentData.weather[0].description,
          heatIndex
        },
        forecast: dailyForecasts,
        cyclone: {
          active: false,
          name: '',
          distance: 0,
          intensity: ''
        },
        alerts: {
          rainfall: rainfallAlert,
          heat: heatIndex >= 38
        },
        satelliteUrl: satelliteImage || ''
      };

      setWeatherData(newWeatherData);
      setLastUpdated(new Date());
      localStorage.setItem('weatherData', JSON.stringify(newWeatherData));
    } catch (error) {
      console.error('Error fetching weather data:', error);
      
      const cached = localStorage.getItem('weatherData');
      if (!cached && !weatherData) {
        const fallbackData: WeatherData = {
          location: location!,
          current: {
            temp: 32,
            feelsLike: 38,
            humidity: 78,
            windSpeed: 15,
            windDirection: 'NE',
            condition: 'Unable to fetch weather data',
            heatIndex: 41
          },
          forecast: [],
          cyclone: { active: false, name: '', distance: 0, intensity: '' },
          alerts: { rainfall: 'normal', heat: false },
          satelliteUrl: satelliteImage || ''
        };
        setWeatherData(fallbackData);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWeatherData();
  };

  const getSafetyTips = () => {
    const tips = [];
    if (weatherData?.alerts.heat) {
      tips.push('Stay hydrated', 'Limit outdoor activities', 'Wear light clothing');
    }
    if (weatherData?.alerts.rainfall !== 'normal') {
      tips.push('Avoid flood-prone areas', 'Prepare emergency kit', 'Monitor updates');
    }
    return tips;
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300" data-testid="text-loading">Loading weather data...</p>
        </div>
      </div>
    );
  }

  const alert = weatherData?.alerts.rainfall;
  const config = alert && alert !== 'normal' ? alertConfig[alert] : null;
  const safetyTips = getSafetyTips();
  
  let heatIndexLevel = '';
  const heatIndex = weatherData?.current.heatIndex || 0;
  if (heatIndex >= 41) heatIndexLevel = 'Extreme Caution';
  else if (heatIndex >= 38) heatIndexLevel = 'Danger';
  else if (heatIndex >= 32) heatIndexLevel = 'Caution';
  else heatIndexLevel = 'Normal';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 px-4 py-6 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white" data-testid="text-city">
                {location?.city || 'Manila'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400" data-testid="text-province">
                {location?.province || 'Metro Manila'}
              </p>
            </div>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-blue-600 dark:text-blue-400"
              data-testid="button-edit-location"
            >
              Edit
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
              data-testid="indicator-online-status"
            />
            <span className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-online-status">
              {isOnline ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 150px)' }}>
          {config && showAlert && (
            <div 
              className="p-3 rounded-lg flex items-center justify-between animate-pulse" 
              style={{ backgroundColor: config.color + '20' }}
              data-testid="banner-alert"
            >
              <div className="flex-1">
                <p className="text-center font-semibold" style={{ color: config.color }}>
                  {config.icon} {config.label}
                </p>
              </div>
              <button
                onClick={() => setShowAlert(false)}
                className="ml-2 p-1 hover:opacity-70 transition-opacity"
                style={{ color: config.color }}
                data-testid="button-close-alert"
              >
                <X size={20} />
              </button>
            </div>
          )}

          {weatherData && (
            <>
              <Card className="p-4" data-testid="card-current-weather">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Today's Weather</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">🌡️</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white flex-1" data-testid="text-temp">
                      {weatherData.current.temp}°C
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-feels-like">
                      Feels like {weatherData.current.feelsLike}°C
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💨</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white flex-1" data-testid="text-wind-speed">
                      {weatherData.current.windSpeed} km/h
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400" data-testid="text-wind-direction">
                      {weatherData.current.windDirection}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xl">💧</span>
                    <span className="text-lg font-semibold text-gray-900 dark:text-white flex-1" data-testid="text-humidity">
                      {weatherData.current.humidity}%
                    </span>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Humidity</span>
                  </div>
                  <div className="pt-2">
                    <p className="text-gray-700 dark:text-gray-300 capitalize" data-testid="text-condition">
                      {weatherData.current.condition}
                    </p>
                  </div>
                </div>
              </Card>

              <Card className="p-4" data-testid="card-forecast">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">5-Day Forecast</h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {weatherData.forecast.map((day, index) => (
                    <div 
                      key={index} 
                      className="flex flex-col items-center min-w-[80px]"
                      data-testid={`forecast-day-${index}`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{day.day}</p>
                      <span className="text-2xl mb-2">{weatherIcons[day.icon] || '🌤️'}</span>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">{day.high}°</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{day.low}°</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4" data-testid="card-heat-index">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">Heat Index & Safety</h2>
                <div className="mb-3">
                  <p className="text-lg text-gray-900 dark:text-white">
                    🔥 Heat Index: <span className="font-bold" data-testid="text-heat-index">{weatherData.current.heatIndex}°C</span>
                  </p>
                  <p className="text-red-500 font-semibold mt-1" data-testid="text-heat-level">{heatIndexLevel}</p>
                </div>
                {safetyTips.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">⚠️ Safety Tips:</p>
                    {safetyTips.map((tip, index) => (
                      <p key={index} className="text-sm text-gray-700 dark:text-gray-300 ml-2 mb-1" data-testid={`safety-tip-${index}`}>
                        • {tip}
                      </p>
                    ))}
                  </div>
                )}
              </Card>

              {weatherData.cyclone.active && (
                <Card className="p-4" data-testid="card-cyclone">
                  <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">🌀 Tropical Cyclone Alert</h2>
                  <div className="mb-4">
                    <p className="text-lg font-bold text-red-500 mb-2" data-testid="text-cyclone-name">
                      {weatherData.cyclone.name}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-cyclone-intensity">
                      Intensity: {weatherData.cyclone.intensity}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300" data-testid="text-cyclone-distance">
                      Distance: {weatherData.cyclone.distance} km from coast
                    </p>
                  </div>
                  <div className="w-full h-[480px] rounded-lg overflow-hidden">
                    <iframe 
                      src="https://www.google.com/maps/d/embed?mid=1TSspiHSYVJinJHVDOsGicr74ERNCei0&ehbc=2E312F" 
                      width="100%" 
                      height="480"
                      className="border-0"
                      data-testid="iframe-map"
                    />
                  </div>
                </Card>
              )}

              <Card className="p-4" data-testid="card-satellite">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">🛰️ Satellite Imagery</h2>
                  {lastUpdated && (
                    <p className="text-xs text-gray-600 dark:text-gray-400" data-testid="text-last-updated">
                      Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  )}
                </div>
                {satelliteImage ? (
                  <img 
                    src={satelliteImage} 
                    alt="Satellite imagery"
                    className="w-full h-[250px] object-contain rounded-lg bg-gray-100 dark:bg-gray-700"
                    data-testid="img-satellite"
                  />
                ) : (
                  <div className="h-[250px] flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">Loading satellite image...</p>
                  </div>
                )}
              </Card>
            </>
          )}

          <div className="flex justify-center py-4">
            <Button 
              onClick={handleRefresh} 
              disabled={refreshing}
              className="w-full max-w-xs"
              data-testid="button-refresh"
            >
              {refreshing ? 'Refreshing...' : 'Refresh Data'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherOutlook;
