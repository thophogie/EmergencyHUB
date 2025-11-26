import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, RefreshCw } from "lucide-react";

const API_KEY = "bb0b8b639634c8a7a6c9faee7dca96e5";
const LAT = 13.0293;
const LON = 123.445;
const LOCATION_NAME = "Pio Duran, PH";

type AlertLevel = "normal" | "yellow" | "orange" | "red" | "violet";
type WeatherData = {
  location: { name: string; lat: number; lng: number };
  current: {
    temp: number;
    feelsLike: number;
    humidity: number;
    windSpeed: number;
    windDirection: string;
    condition: string;
    heatIndex: number;
    icon: string;
  };
  forecast: Array<{
    day: string;
    date: string;
    high: number;
    low: number;
    icon: string;
  }>;
  alerts: {
    rainfall: AlertLevel;
    heat: boolean;
  };
};

const weatherIcons: Record<string, string> = {
  "01d": "☀️",
  "01n": "🌙",
  "02d": "⛅",
  "02n": "☁️",
  "03d": "☁️",
  "03n": "☁️",
  "04d": "☁️",
  "04n": "☁️",
  "09d": "🌧️",
  "09n": "🌧️",
  "10d": "🌦️",
  "10n": "🌧️",
  "11d": "⛈️",
  "11n": "⛈️",
  "13d": "❄️",
  "13n": "❄️",
  "50d": "🌫️",
  "50n": "🌫️",
};

const alertConfig: Record<
  AlertLevel,
  { color: string; label: string; icon: string }
> = {
  normal: { color: "#10B981", label: "Normal", icon: "🟢" },
  yellow: { color: "#EAB308", label: "Heavy Rainfall Watch", icon: "🟡" },
  orange: { color: "#F97316", label: "Heavy Rainfall Warning", icon: "🟠" },
  red: { color: "#EF4444", label: "Severe Warning", icon: "🔴" },
  violet: { color: "#8B5CF6", label: "Extreme Emergency", icon: "🟣" },
};

const WeatherOutlook = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showAlert, setShowAlert] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    fetchData();

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const fetchData = async () => {
    if (!isOnline) {
      setError("No internet connection");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Fetch current weather
      const currentResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`,
      );

      if (!currentResponse.ok) {
        throw new Error("Failed to fetch current weather data");
      }

      const currentData = await currentResponse.json();

      // Fetch forecast
      const forecastResponse = await fetch(
        `https://api.openweathermap.org/data/2.5/forecast?lat=${LAT}&lon=${LON}&appid=${API_KEY}&units=metric`,
      );

      if (!forecastResponse.ok) {
        throw new Error("Failed to fetch forecast data");
      }

      const forecastData = await forecastResponse.json();

      // Process data
      const processedData: WeatherData = processWeatherData(
        currentData,
        forecastData,
      );
      setWeatherData(processedData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Error fetching weather data:", err);
      setError("Failed to load weather data. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const processWeatherData = (current: any, forecast: any): WeatherData => {
    // Process current weather
    const currentTemp = Math.round(current.main.temp);
    const feelsLike = Math.round(current.main.feels_like);
    const humidity = current.main.humidity;
    const windSpeed = Math.round(current.wind.speed * 3.6); // Convert m/s to km/h
    const windDeg = current.wind.deg;
    const condition = current.weather[0].description;
    const icon = current.weather[0].icon;

    // Calculate wind direction
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(windDeg / 45) % 8;
    const windDirection = directions[index];

    // Simple heat index calculation (approximation)
    const heatIndex = Math.round(
      currentTemp +
        0.33 *
          (humidity / 100) *
          6.105 *
          Math.exp((17.27 * currentTemp) / (237.7 + currentTemp)) -
        4.25,
    );

    // Process forecast
    const dailyForecasts: Record<string, any[]> = {};

    forecast.list.forEach((item: any) => {
      const date = new Date(item.dt * 1000);
      const dayKey = date.toISOString().split("T")[0];

      if (!dailyForecasts[dayKey]) {
        dailyForecasts[dayKey] = [];
      }
      dailyForecasts[dayKey].push(item);
    });

    const forecastArray = Object.keys(dailyForecasts)
      .slice(0, 5)
      .map((date) => {
        const dayData = dailyForecasts[date];
        const day = new Date(date).toLocaleDateString("en-US", {
          weekday: "short",
        });
        const high = Math.round(
          Math.max(...dayData.map((d: any) => d.main.temp_max)),
        );
        const low = Math.round(
          Math.min(...dayData.map((d: any) => d.main.temp_min)),
        );
        const icon = dayData[0].weather[0].icon;

        return {
          day,
          date,
          high,
          low,
          icon,
        };
      });

    // Determine alert level based on conditions
    let rainfallAlert: AlertLevel = "normal";
    if (
      current.weather[0].main === "Rain" ||
      current.weather[0].main === "Thunderstorm"
    ) {
      rainfallAlert = "orange";
    }

    const heatAlert = heatIndex > 38;

    return {
      location: {
        name: LOCATION_NAME,
        lat: LAT,
        lng: LON,
      },
      current: {
        temp: currentTemp,
        feelsLike,
        humidity,
        windSpeed,
        windDirection,
        condition,
        heatIndex,
        icon,
      },
      forecast: forecastArray,
      alerts: {
        rainfall: rainfallAlert,
        heat: heatAlert,
      },
    };
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getSafetyTips = () => {
    const tips = [];
    if (weatherData?.alerts.heat) {
      tips.push(
        "Stay hydrated",
        "Limit outdoor activities",
        "Wear light clothing",
      );
    }
    if (weatherData?.alerts.rainfall !== "normal") {
      tips.push(
        "Avoid flood-prone areas",
        "Prepare emergency kit",
        "Monitor updates",
      );
    }
    return tips;
  };

  if (loading && !weatherData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p
            className="text-gray-600 dark:text-gray-300"
            data-testid="text-loading"
          >
            Loading weather data...
          </p>
        </div>
      </div>
    );
  }

  const alert = weatherData?.alerts.rainfall;
  const config = alert && alert !== "normal" ? alertConfig[alert] : null;
  const safetyTips = getSafetyTips();

  let heatIndexLevel = "";
  const heatIndex = weatherData?.current.heatIndex || 0;
  if (heatIndex >= 41) heatIndexLevel = "Extreme Caution";
  else if (heatIndex >= 38) heatIndexLevel = "Danger";
  else if (heatIndex >= 32) heatIndexLevel = "Caution";
  else heatIndexLevel = "Normal";

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white dark:bg-gray-800 px-4 py-6 shadow-sm">
          <div className="flex justify-between items-start mb-3">
            <div>
              <h1
                className="text-2xl font-bold text-gray-900 dark:text-white"
                data-testid="text-city"
              >
                {weatherData?.location.name || LOCATION_NAME}
              </h1>
              <p
                className="text-gray-600 dark:text-gray-400"
                data-testid="text-coordinates"
              >
                {LAT.toFixed(4)}°N, {LON.toFixed(4)}°E
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-blue-600 dark:text-blue-400"
              onClick={handleRefresh}
              disabled={refreshing}
              data-testid="button-refresh-header"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <div
              className={`w-2 h-2 rounded-full ${isOnline ? "bg-green-500" : "bg-red-500"}`}
              data-testid="indicator-online-status"
            />
            <span
              className="text-sm text-gray-600 dark:text-gray-400"
              data-testid="text-online-status"
            >
              {isOnline ? "Online" : "Offline"}
            </span>
            {lastUpdated && (
              <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                Updated:{" "}
                {lastUpdated.toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            )}
          </div>
        </div>

        <div
          className="p-4 space-y-4 overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 150px)" }}
        >
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg text-red-700 dark:text-red-200">
              {error}
            </div>
          )}

          {config && showAlert && (
            <div
              className="p-3 rounded-lg flex items-center justify-between animate-pulse"
              style={{ backgroundColor: config.color + "20" }}
              data-testid="banner-alert"
            >
              <div className="flex-1">
                <p
                  className="text-center font-semibold"
                  style={{ color: config.color }}
                >
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
              <Card
                className="p-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white"
                data-testid="card-current-weather"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-lg font-bold mb-1">Current Weather</h2>
                    <p className="text-5xl font-bold mb-2">
                      {weatherData.current.temp}°C
                    </p>
                    <p className="opacity-90 capitalize">
                      {weatherData.current.condition}
                    </p>
                  </div>
                  <div className="text-6xl">
                    {weatherIcons[weatherData.current.icon] || "🌤️"}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/30">
                  <div className="flex items-center">
                    <span className="text-xl mr-2">🌡️</span>
                    <div>
                      <p className="text-sm opacity-80">Feels Like</p>
                      <p className="font-semibold">
                        {weatherData.current.feelsLike}°C
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xl mr-2">💨</span>
                    <div>
                      <p className="text-sm opacity-80">Wind</p>
                      <p className="font-semibold">
                        {weatherData.current.windSpeed} km/h{" "}
                        {weatherData.current.windDirection}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xl mr-2">💧</span>
                    <div>
                      <p className="text-sm opacity-80">Humidity</p>
                      <p className="font-semibold">
                        {weatherData.current.humidity}%
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <span className="text-xl mr-2">🔥</span>
                    <div>
                      <p className="text-sm opacity-80">Heat Index</p>
                      <p className="font-semibold">
                        {weatherData.current.heatIndex}°C
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-4" data-testid="card-forecast">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  5-Day Forecast
                </h2>
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {weatherData.forecast.map((day, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center min-w-[80px] p-3 rounded-lg bg-gray-50 dark:bg-gray-700"
                      data-testid={`forecast-day-${index}`}
                    >
                      <p className="text-sm font-semibold text-gray-900 dark:text-white mb-1">
                        {day.day}
                      </p>
                      <span className="text-3xl mb-2">
                        {weatherIcons[day.icon] || "🌤️"}
                      </span>
                      <div className="flex flex-col items-center">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">
                          {day.high}°
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {day.low}°
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-4" data-testid="card-heat-index">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  Heat Index & Safety
                </h2>
                <div className="mb-3">
                  <p className="text-lg text-gray-900 dark:text-white">
                    🔥 Heat Index:{" "}
                    <span className="font-bold" data-testid="text-heat-index">
                      {weatherData.current.heatIndex}°C
                    </span>
                  </p>
                  <p
                    className={`font-semibold mt-1 ${heatIndexLevel === "Danger" ? "text-red-500" : heatIndexLevel === "Caution" ? "text-orange-500" : heatIndexLevel === "Extreme Caution" ? "text-red-700" : "text-green-500"}`}
                    data-testid="text-heat-level"
                  >
                    {heatIndexLevel}
                  </p>
                </div>
                {safetyTips.length > 0 && (
                  <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className="font-semibold text-gray-900 dark:text-white mb-2">
                      ⚠️ Safety Tips:
                    </p>
                    {safetyTips.map((tip, index) => (
                      <p
                        key={index}
                        className="text-sm text-gray-700 dark:text-gray-300 ml-2 mb-1"
                        data-testid={`safety-tip-${index}`}
                      >
                        • {tip}
                      </p>
                    ))}
                  </div>
                )}
              </Card>

              <Card className="p-4" data-testid="card-alerts">
                <h2 className="text-lg font-bold mb-4 text-gray-900 dark:text-white">
                  Weather Alerts
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/30">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">🌧️</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Rainfall Alert
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {config
                            ? `${config.icon} ${config.label}`
                            : "No alerts"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 dark:bg-red-900/30">
                    <div className="flex items-center">
                      <span className="text-xl mr-3">🌡️</span>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Heat Alert
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {weatherData.alerts.heat
                            ? "⚠️ Heat Danger"
                            : "No heat alerts"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </>
          )}

          <div className="flex justify-center py-4">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-full max-w-xs flex items-center gap-2"
              data-testid="button-refresh"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              {refreshing ? "Refreshing..." : "Refresh Data"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeatherOutlook;
