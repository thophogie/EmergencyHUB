import React, { useState, useEffect, useRef } from 'react';
import { 
  Geolocation, 
  PermissionsAndroid, 
  Platform 
} from 'react-native';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  RefreshControl, 
  Image, 
  TouchableOpacity, 
  Alert,
  Dimensions,
  ActivityIndicator,
  StatusBar
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
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

// Icon mapping
const weatherIcons: Record<string, string> = {
  'partly-cloudy': '⛅',
  'sunny': '☀️',
  'rainy': '🌧️',
  'storm': '⛈️',
  'cloudy': '☁️'
};

// Alert level configuration
const alertConfig: Record<AlertLevel, { color: string; label: string; icon: string }> = {
  normal: { color: '#10B981', label: 'Normal', icon: '🟢' },
  yellow: { color: '#EAB308', label: 'Heavy Rainfall Watch', icon: '🟡' },
  orange: { color: '#F97316', label: 'Heavy Rainfall Warning', icon: '🟠' },
  red: { color: '#EF4444', label: 'Severe Warning', icon: '🔴' },
  violet: { color: '#8B5CF6', label: 'Extreme Emergency', icon: '🟣' }
};

const WeatherOutlook = () => {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const windowWidth = Dimensions.get('window').width;

  // State
  const [location, setLocation] = useState<{ city: string; province: string; lat: number; lng: number } | null>(null);
  const [manualLocation, setManualLocation] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [weatherData, setWeatherData] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [satelliteImage, setSatelliteImage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const mapViewRef = useRef<MapView>(null);

  // Initialize
  useEffect(() => {
    const init = async () => {
      // Check network status
      const unsubscribe = NetInfo.addEventListener(state => {
        setIsOnline(state.isConnected ?? false);
      });

      // Load cached data
      const cached = await AsyncStorage.getItem('weatherData');
      if (cached) {
        setWeatherData(JSON.parse(cached));
        setLoading(false);
      }

      // Get location
      await getCurrentLocation();

      return () => unsubscribe();
    };

    init();
  }, []);

  // Fetch weather data when location changes
  useEffect(() => {
    if (location) {
      fetchWeatherData();
    }
  }, [location]);

  // Auto-refresh satellite image every 30 minutes
  useEffect(() => {
    const fetchSatellite = () => {
      const timestamp = new Date().getTime();
      setSatelliteImage(`http://src.meteopilipinas.gov.ph/repo/mtsat-colored/24hour/latest-him-colored.gif?t=${timestamp}`);
    };

    fetchSatellite();
    const interval = setInterval(fetchSatellite, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  // Location functions
  const getCurrentLocation = async () => {
    try {
      if (Platform.OS === 'android') {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'This app needs access to your location for weather forecasts',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error('Location permission denied');
        }
      }

      Geolocation.getCurrentPosition(
        (position) => {
          // Mock location data - replace with reverse geocoding
          setLocation({
            city: 'Manila',
            province: 'Metro Manila',
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => {
          console.log('Location error:', error);
          // Use default location
          setLocation({
            city: 'Manila',
            province: 'Metro Manila',
            lat: 14.5995,
            lng: 120.9842
          });
          Alert.alert('Location Error', 'Using default location (Manila)');
        },
        { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
      );
    } catch (error) {
      console.log('Location permission error:', error);
      // Use default location
      setLocation({
        city: 'Manila',
        province: 'Metro Manila',
        lat: 14.5995,
        lng: 120.9842
      });
    }
  };

  // Fetch weather data from APIs
  const fetchWeatherData = async () => {
    setLoading(true);
    try {
      // Mock API response - replace with actual PAGASA/MeteoPhilippines calls
      const mockData: WeatherData = {
        location: location!,
        current: {
          temp: 32,
          feelsLike: 38,
          humidity: 78,
          windSpeed: 15,
          windDirection: 'NE',
          condition: 'Partly cloudy with afternoon rains',
          heatIndex: 41
        },
        forecast: [
          { day: 'Mon', date: '2025-11-24', high: 32, low: 28, icon: 'rainy' },
          { day: 'Tue', date: '2025-11-25', high: 33, low: 29, icon: 'partly-cloudy' },
          { day: 'Wed', date: '2025-11-26', high: 34, low: 29, icon: 'sunny' },
          { day: 'Thu', date: '2025-11-27', high: 34, low: 29, icon: 'sunny' },
          { day: 'Fri', date: '2025-11-28', high: 31, low: 27, icon: 'rainy' }
        ],
        cyclone: {
          active: true,
          name: 'Tropical Storm Kristine',
          distance: 250,
          intensity: 'Tropical Storm'
        },
        alerts: {
          rainfall: 'orange',
          heat: true
        },
        satelliteUrl: satelliteImage || ''
      };

      setWeatherData(mockData);
      setLastUpdated(new Date());
      await AsyncStorage.setItem('weatherData', JSON.stringify(mockData));
    } catch (error) {
      console.log('Weather fetch error:', error);
      Alert.alert('Data Error', 'Failed to load weather data. Showing cached information.');
    } finally {
      setLoading(false);
    }
  };

  // Manual location override
  const handleManualLocation = () => {
    setManualLocation(true);
    // Implement location picker here
    Alert.alert('Location Override', 'Manual location selection would open here');
  };

  // Safety tips based on conditions
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

  // Render functions
  const renderAlertBanner = () => {
    if (!weatherData) return null;

    const alert = weatherData.alerts.rainfall;
    if (alert === 'normal') return null;

    const config = alertConfig[alert];
    return (
      <View style={[styles.alertBanner, { backgroundColor: config.color + '20' }]}>
        <Text style={[styles.alertText, { color: config.color }]}>
          {config.icon} {config.label}
        </Text>
      </View>
    );
  };

  const renderCurrentWeather = () => {
    if (!weatherData) return null;

    const { current } = weatherData;
    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Today's Weather</Text>
        <View style={styles.metricsContainer}>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>🌡️</Text>
            <Text style={styles.metricValue}>{current.temp}°C</Text>
            <Text style={styles.metricLabel}>Feels like {current.feelsLike}°C</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>💨</Text>
            <Text style={styles.metricValue}>{current.windSpeed} km/h</Text>
            <Text style={styles.metricLabel}>{current.windDirection}</Text>
          </View>
          <View style={styles.metricRow}>
            <Text style={styles.metricIcon}>💧</Text>
            <Text style={styles.metricValue}>{current.humidity}%</Text>
            <Text style={styles.metricLabel}>Humidity</Text>
          </View>
          <View style={styles.conditionRow}>
            <Text style={styles.conditionText}>{current.condition}</Text>
          </View>
        </View>
      </View>
    );
  };

  const renderForecast = () => {
    if (!weatherData) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>5-Day Forecast</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.forecastScroll}>
          {weatherData.forecast.map((day, index) => (
            <View key={index} style={styles.forecastCard}>
              <Text style={styles.forecastDay}>{day.day}</Text>
              <Text style={styles.forecastIcon}>{weatherIcons[day.icon] || '🌤️'}</Text>
              <Text style={styles.forecastTempHigh}>{day.high}°</Text>
              <Text style={styles.forecastTempLow}>{day.low}°</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    );
  };

  const renderHeatIndex = () => {
    if (!weatherData) return null;

    const { heatIndex } = weatherData.current;
    const safetyTips = getSafetyTips();

    let heatIndexLevel = '';
    if (heatIndex >= 41) heatIndexLevel = 'Extreme Caution';
    else if (heatIndex >= 38) heatIndexLevel = 'Danger';
    else if (heatIndex >= 32) heatIndexLevel = 'Caution';
    else heatIndexLevel = 'Normal';

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Heat Index & Safety</Text>
        <View style={styles.heatIndexContainer}>
          <Text style={styles.heatIndexText}>
            🔥 Heat Index: <Text style={styles.heatIndexValue}>{heatIndex}°C</Text>
          </Text>
          <Text style={styles.heatIndexLevel}>{heatIndexLevel}</Text>
        </View>
        {safetyTips.length > 0 && (
          <View style={styles.safetyTips}>
            <Text style={styles.safetyTitle}>⚠️ Safety Tips:</Text>
            {safetyTips.map((tip, index) => (
              <Text key={index} style={styles.safetyTipItem}>• {tip}</Text>
            ))}
          </View>
        )}
      </View>
    );
  };

  const renderCycloneInfo = () => {
    if (!weatherData || !weatherData.cyclone.active) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>🌀 Tropical Cyclone Alert</Text>
        <View style={styles.cycloneInfo}>
          <Text style={styles.cycloneName}>{weatherData.cyclone.name}</Text>
          <Text style={styles.cycloneDetail}>
            Intensity: {weatherData.cyclone.intensity}
          </Text>
          <Text style={styles.cycloneDetail}>
            Distance: {weatherData.cyclone.distance} km from coast
          </Text>
        </View>
        <View style={styles.mapContainer}>
          <MapView
            ref={mapViewRef}
            style={styles.map}
            initialRegion={{
              latitude: location?.lat || 14.5995,
              longitude: location?.lng || 120.9842,
              latitudeDelta: 3,
              longitudeDelta: 3,
            }}
            showsUserLocation={true}
            showsTraffic={true}
          >
            {weatherData.cyclone.active && (
              <Marker
                coordinate={{
                  latitude: location?.lat || 14.5995,
                  longitude: location?.lng || 120.9842
                }}
                title={weatherData.cyclone.name}
                description={`Distance: ${weatherData.cyclone.distance} km`}
              />
            )}
          </MapView>
        </View>
      </View>
    );
  };

  const renderSatelliteImage = () => {
    return (
      <View style={styles.card}>
        <View style={styles.satelliteHeader}>
          <Text style={styles.sectionTitle}>🛰️ Satellite Imagery</Text>
          {lastUpdated && (
            <Text style={styles.lastUpdated}>
              Updated: {lastUpdated.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          )}
        </View>
        {satelliteImage ? (
          <Image 
            source={{ uri: satelliteImage }} 
            style={styles.satelliteImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
            <Text style={styles.imagePlaceholderText}>Loading satellite image...</Text>
          </View>
        )}
      </View>
    );
  };

  if (loading && !weatherData) {
    return (
      <View style={[styles.container, isDark && styles.containerDark]}>
        <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={isDark ? '#60A5FA' : '#3B82F6'} />
          <Text style={[styles.loadingText, isDark && styles.loadingTextDark]}>
            Loading weather data...
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, isDark && styles.containerDark]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <View style={styles.locationInfo}>
            <Text style={[styles.city, isDark && styles.cityDark]}>
              {location?.city || 'Manila'}
            </Text>
            <Text style={[styles.province, isDark && styles.provinceDark]}>
              {location?.province || 'Metro Manila'}
            </Text>
          </View>
          <TouchableOpacity onPress={handleManualLocation}>
            <Text style={[styles.editLocation, isDark && styles.editLocationDark]}>
              Edit
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.statusIndicator}>
          <View style={[styles.statusDot, { backgroundColor: isOnline ? '#10B981' : '#EF4444' }]} />
          <Text style={[styles.statusText, isDark && styles.statusTextDark]}>
            {isOnline ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl 
            refreshing={loading} 
            onRefresh={fetchWeatherData} 
            colors={[isDark ? '#60A5FA' : '#3B82F6']} 
          />
        }
      >
        {renderAlertBanner()}
        {renderCurrentWeather()}
        {renderForecast()}
        {renderHeatIndex()}
        {renderCycloneInfo()}
        {renderSatelliteImage()}

        <View style={styles.footerSpacer} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  containerDark: {
    backgroundColor: '#111827',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: 40,
    backgroundColor: 'transparent',
  },
  locationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  locationInfo: {
    flex: 1,
  },
  city: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  cityDark: {
    color: '#F9FAFB',
  },
  province: {
    fontSize: 16,
    color: '#6B7280',
  },
  provinceDark: {
    color: '#9CA3AF',
  },
  editLocation: {
    color: '#3B82F6',
    fontWeight: '600',
    marginLeft: 8,
  },
  editLocationDark: {
    color: '#60A5FA',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statusTextDark: {
    color: '#9CA3AF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#4B5563',
  },
  loadingTextDark: {
    color: '#D1D5DB',
  },
  alertBanner: {
    padding: 12,
    marginHorizontal: 16,
    borderRadius: 8,
    marginBottom: 16,
  },
  alertText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#111827',
  },
  metricsContainer: {
    gap: 12,
  },
  metricRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metricIcon: {
    fontSize: 20,
    width: 30,
  },
  metricValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  conditionRow: {
    paddingTop: 8,
  },
  conditionText: {
    fontSize: 16,
    color: '#4B5563',
  },
  forecastScroll: {
    paddingTop: 8,
  },
  forecastCard: {
    width: 80,
    alignItems: 'center',
    paddingVertical: 12,
  },
  forecastDay: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  forecastIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  forecastTempHigh: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1F2937',
  },
  forecastTempLow: {
    fontSize: 14,
    color: '#6B7280',
  },
  heatIndexContainer: {
    marginBottom: 12,
  },
  heatIndexText: {
    fontSize: 18,
    color: '#1F2937',
  },
  heatIndexValue: {
    fontWeight: '700',
  },
  heatIndexLevel: {
    fontSize: 16,
    color: '#EF4444',
    fontWeight: '600',
    marginTop: 4,
  },
  safetyTips: {
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  safetyTipItem: {
    fontSize: 14,
    color: '#4B5563',
    marginLeft: 8,
    marginBottom: 2,
  },
  cycloneInfo: {
    marginBottom: 12,
  },
  cycloneName: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EF4444',
    marginBottom: 4,
  },
  cycloneDetail: {
    fontSize: 14,
    color: '#4B5563',
  },
  mapContainer: {
    height: 200,
    borderRadius: 8,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  satelliteHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lastUpdated: {
    fontSize: 12,
    color: '#6B7280',
  },
  satelliteImage: {
    width: '100%',
    height: 250,
    borderRadius: 8,
  },
  imagePlaceholder: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#6B7280',
  },
  footerSpacer: {
    height: 20,
  },
});

export default WeatherOutlook;