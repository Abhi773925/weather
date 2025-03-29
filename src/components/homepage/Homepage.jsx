import React, { useState, useEffect } from 'react';
import { Search, MapPin, Wind, Droplet, Cloud, Home, Calendar, Bookmark, Menu, Sun, Moon } from 'lucide-react';

const Homepage = () => {
  const [activeTab, setActiveTab] = useState('user'); // 'user' or 'search'
  const [weatherData, setWeatherData] = useState(null);
  const [forecastData, setForecastData] = useState(null);
  const [savedLocations, setSavedLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [locationAccess, setLocationAccess] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  
  const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";

  useEffect(() => {
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if (localCoordinates) {
      const coordinates = JSON.parse(localCoordinates);
      fetchUserWeatherInfo(coordinates);
    }
    
    const storedLocations = sessionStorage.getItem("savedLocations");
    if (storedLocations) {
      setSavedLocations(JSON.parse(storedLocations));
    }
    
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    
    if (tab === 'user') {
      const localCoordinates = sessionStorage.getItem("user-coordinates");
      if (localCoordinates) {
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
      }
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userCoordinates = {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
          };
          
          sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
          fetchUserWeatherInfo(userCoordinates);
          setLocationAccess(true);
        },
        (error) => {
          setLoading(false);
          console.error("Geolocation error:", error);
          alert("Unable to get your location. Please allow location access.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const fetchUserWeatherInfo = async (coordinates) => {
    const { lat, lon } = coordinates;
    setLoading(true);
    
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      setWeatherData(data);
      
      if (data.name) {
        fetchDailyForecast(data.name);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
      alert("Failed to fetch weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const fetchDailyForecast = async (cityName) => {
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      setForecastData(data);
    } catch (error) {
      console.error("Error fetching forecast:", error);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${searchInput}&appid=${API_KEY}&units=metric`);
      const data = await response.json();
      setWeatherData(data);
      
      fetchDailyForecast(searchInput);
    } catch (error) {
      console.error("Error fetching weather:", error);
      alert("City not found. Please check the name and try again.");
    } finally {
      setLoading(false);
    }
  };

  const saveLocation = () => {
    if (!weatherData) return;
    
    const locationData = {
      city: weatherData.name,
      country: weatherData.sys.country,
      temp: weatherData.main.temp,
      maxTemp: weatherData.main.temp_max,
      minTemp: weatherData.main.temp_min,
      description: weatherData.weather[0].description,
      icon: weatherData.weather[0].icon,
      sunrise: weatherData.sys.sunrise,
      sunset: weatherData.sys.sunset
    };
    
    const updatedLocations = [...savedLocations, locationData];
    setSavedLocations(updatedLocations);
    sessionStorage.setItem("savedLocations", JSON.stringify(updatedLocations));
    
    alert(`${weatherData.name} has been added to saved locations!`);
  };

  const removeSavedLocation = (index) => {
    const updatedLocations = savedLocations.filter((_, i) => i !== index);
    setSavedLocations(updatedLocations);
    sessionStorage.setItem("savedLocations", JSON.stringify(updatedLocations));
  };

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setMenuOpen(false);
  };
  return (
    <div className={`min-h-screen min-w-screen ${darkMode ? 'bg-black text-white' : 'bg-gradient-to-b from-blue-50 to-white text-gray-800'} transition-colors duration-300`}>
      <nav className={`${darkMode ? 'bg-black text-white' : 'bg-white text-gray-800'} shadow-lg fixed w-full z-10 transition-colors duration-300`}>
        <div className="container mx-auto px-4 py-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <h1 className={`text-xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'} ml-2`}>WeatherPro</h1>
            </div>
            
            <div className="hidden md:flex space-x-8 items-center">
              <button onClick={() => scrollToSection('weather')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition`}>Home</button>
              <button onClick={() => setActiveTab('search')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition`}>Search Weather</button>
              <button onClick={() => scrollToSection('forecast')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition`}>Weather Forecast</button>
              <button onClick={() => scrollToSection('saved')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition`}>Saved Locations</button>
              <button 
                onClick={toggleTheme} 
                className={`p-2 rounded-full ${darkMode ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition shadow-md`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
            </div>
            
            <div className="md:hidden flex items-center">
              <button 
                onClick={toggleTheme} 
                className={`p-2 mr-2 rounded-full ${darkMode ? 'bg-black text-yellow-300 hover:bg-gray-600' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} transition shadow-md`}
              >
                {darkMode ? <Sun size={20} /> : <Moon size={20} />}
              </button>
              <button onClick={() => setMenuOpen(!menuOpen)} className={darkMode ? 'text-gray-300' : 'text-gray-700'}>
                <Menu size={24} />
              </button>
            </div>
          </div>
          
          {menuOpen && (
            <div className={`md:hidden ${darkMode ? 'bg-black' : 'bg-white'} pt-2 pb-4 transition-colors duration-300`}>
              <div className="flex flex-col space-y-4">
                <button onClick={() => scrollToSection('weather')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition py-1`}>Home</button>
                <button onClick={() => setActiveTab('search')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition py-1`}>Search Weather</button>
                <button onClick={() => scrollToSection('forecast')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition py-1`}>Weather Forecast</button>
                <button onClick={() => scrollToSection('saved')} className={`${darkMode ? 'text-gray-300 hover:text-blue-400' : 'text-gray-700 hover:text-blue-600'} transition py-1`}>Saved Locations</button>
              </div>
            </div>
          )}
        </div>
      </nav>
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div id="weather" className="min-h-screen">
          <h1 className={`text-4xl font-bold text-center ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-8`}>Weather Pro</h1>
          
          <div className="flex justify-center mb-6">
            <div className={`flex ${darkMode ? 'bg-gray-900' : 'bg-gray-100'} rounded-lg p-1 shadow-lg`}>
              <button 
                className={`px-6 py-2 rounded-md font-medium ${activeTab === 'user' 
                  ? (darkMode ? 'bg-gray-700 shadow-md text-blue-400' : 'bg-white shadow-md text-blue-600') 
                  : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
                onClick={() => switchTab('user')}
              >
                Your Weather
              </button>
              <button 
                className={`px-6 py-2 rounded-md font-medium ${activeTab === 'search' 
                  ? (darkMode ? 'bg-gray-700 shadow-md text-blue-400' : 'bg-white shadow-md text-blue-600') 
                  : (darkMode ? 'text-gray-300' : 'text-gray-600')}`}
                onClick={() => switchTab('search')}
              >
                Search Weather
              </button>
            </div>
          </div>
          
          <div className="max-w-3xl mx-auto">
            {activeTab === 'user' && !locationAccess && !loading && !weatherData && (
              <div className={`${darkMode ? 'bg-black' : 'bg-white'} p-8 rounded-xl ${darkMode ? 'shadow-lg shadow-gray-800/50' : 'shadow-xl shadow-blue-100/50'} text-center flex flex-col items-center transition-colors duration-300`}>
                <MapPin size={64} className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} mb-4`} />
                <h2 className={`text-xl font-semibold mb-2 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Grant Location Access</h2>
                <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-6`}>Allow access to get your local weather information</p>
                <button 
                  onClick={getLocation}
                  className={`${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white py-2 px-6 rounded-md shadow-lg transition transform hover:scale-105`}
                >
                  Grant Access
                </button>
              </div>
            )}
            
            {activeTab === 'search' && (
              <div className={`${darkMode ? 'bg-black' : 'bg-white'} p-6 rounded-xl ${darkMode ? 'shadow-lg shadow-gray-800/50' : 'shadow-xl shadow-blue-100/50'} mb-8 transition-colors duration-300`}>
                <form onSubmit={handleSearch} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Search for city..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className={`flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 ${darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'}`}
                  />
                  <button type="submit" className={`${darkMode ? 'bg-blue-600 hover:bg-blue-500' : 'bg-blue-500 hover:bg-blue-600'} text-white p-2 rounded-md transition shadow-md transform hover:scale-105`}>
                    <Search size={24} />
                  </button>
                  <button 
                    type="button" 
                    onClick={saveLocation}
                    disabled={!weatherData}
                    className={`${darkMode ? 'bg-green-600 hover:bg-green-500' : 'bg-green-500 hover:bg-green-600'} text-white px-4 py-2 rounded-md transition shadow-md flex items-center gap-1 transform hover:scale-105
                      ${!weatherData ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <Bookmark size={16} /> 
                  </button>
                </form>
              </div>
            )}
            
            {loading && (
              <div className={`${darkMode ? 'bg-black' : 'bg-white'} p-8 rounded-xl ${darkMode ? 'shadow-lg shadow-gray-800/50' : 'shadow-xl shadow-blue-100/50'} text-center flex flex-col items-center transition-colors duration-300`}>
                <div className={`animate-spin rounded-full h-16 w-16 border-t-4 ${darkMode ? 'border-blue-400' : 'border-blue-500'} border-opacity-50 mb-4`}></div>
                <p className={`text-lg ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading weather data...</p>
              </div>
            )}
            
            {weatherData && !loading && (
              <div className={`${darkMode ? 'bg-black' : 'bg-white'} p-8 rounded-xl ${darkMode ? 'shadow-lg shadow-gray-800/50' : 'shadow-xl shadow-blue-100/50'} transition-colors duration-300`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center mb-3">
                      <h2 className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weatherData.name}</h2>
                      {weatherData.sys?.country && (
                        <img 
                          src={`https://flagcdn.com/48x36/${weatherData.sys.country.toLowerCase()}.png`} 
                          alt={weatherData.sys.country}
                          className="ml-3 h-6 rounded shadow-sm"
                        />
                      )}
                    </div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} capitalize mb-1`}>{weatherData.weather[0].description}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <img 
                      src={`https://openweathermap.org/img/w/${weatherData.weather[0].icon}.png`}
                      alt={weatherData.weather[0].description}
                      className="w-20 h-20"
                    />
                    <p className={`text-5xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{Math.round(weatherData.main.temp)}°C</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg ${darkMode ? 'shadow-md shadow-gray-900/50' : 'shadow-md shadow-blue-200/50'} flex items-center transition-colors duration-300 transform hover:scale-105`}>
                    <Wind className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-3`} size={36} />
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Wind Speed</p>
                      <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weatherData.wind.speed} m/s</p>
                    </div>
                  </div>
                  
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg ${darkMode ? 'shadow-md shadow-gray-900/50' : 'shadow-md shadow-blue-200/50'} flex items-center transition-colors duration-300 transform hover:scale-105`}>
                    <Droplet className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-3`} size={36} />
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Humidity</p>
                      <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weatherData.main.humidity}%</p>
                    </div>
                  </div>
                  
                  <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-4 rounded-lg ${darkMode ? 'shadow-md shadow-gray-900/50' : 'shadow-md shadow-blue-200/50'} flex items-center transition-colors duration-300 transform hover:scale-105`}>
                    <Cloud className={`${darkMode ? 'text-blue-400' : 'text-blue-500'} mr-3`} size={36} />
                    <div>
                      <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>Cloudiness</p>
                      <p className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{weatherData.clouds.all}%</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div id="forecast" className="pt-16 pb-8">
          <h2 className={`text-3xl font-bold text-center ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-8`}>7-Day Weather Forecast</h2>
          
          {forecastData ? (
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4 min-w-max">
                {forecastData.list.slice(0, 8).map((forecast, index) => {
                  const date = new Date(forecast.dt * 1000);
                  return (
                    <div key={index} className={`${darkMode ? 'bg-black' : 'bg-white'} p-4 rounded-lg ${darkMode ? 'shadow-lg shadow-gray-800/40' : 'shadow-xl shadow-blue-100/50'} min-w-56 transition-colors duration-300 transform hover:scale-105`}>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>{date.toLocaleDateString('en-US', { weekday: 'short' })}</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                      <div className="flex justify-center my-3">
                        <img 
                          src={`https://openweathermap.org/img/w/${forecast.weather[0].icon}.png`}
                          alt={forecast.weather[0].description}
                          className="w-14 h-14"
                        />
                      </div>
                      <p className={`text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>{Math.round(forecast.main.temp)}°C</p>
                      <p className={`text-sm text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>{forecast.weather[0].description}</p>
                      <div className={`mt-4 pt-4 border-t ${darkMode ? 'border-gray-700' : 'border-gray-100'}`}>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Wind:</span>
                          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{forecast.wind.speed} m/s</span>
                        </div>
                        <div className="flex justify-between text-sm mb-1">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Humidity:</span>
                          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{forecast.main.humidity}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Rain:</span>
                          <span className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{Math.round((forecast.pop || 0) * 100)}%</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className={`text-center ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Search for a location to see forecast data</p>
          )}
        </div>
        
        <div id="saved" className="pt-16">
          <h2 className={`text-3xl font-bold text-center ${darkMode ? 'text-blue-400' : 'text-blue-700'} mb-8`}>Saved Locations</h2>
          
          {savedLocations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedLocations.map((location, index) => (
                <div key={index} className={`${darkMode ? 'bg-black' : 'bg-white'} p-6 rounded-lg ${darkMode ? 'shadow-lg shadow-gray-800/40' : 'shadow-xl shadow-blue-100/50'} relative transition-colors duration-300 transform hover:scale-105`}>
                  <button 
                    className={`absolute top-3 right-3 ${darkMode ? 'text-gray-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'} transition-colors duration-300`}
                    onClick={() => removeSavedLocation(index)}
                  >
                    ✕
                  </button>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{location.city}</h3>
                      {location.country && (
                        <img 
                          src={`https://flagcdn.com/48x36/${location.country.toLowerCase()}.png`} 
                          alt={location.country}
                          className="mt-1 h-5 rounded"
                        />
                      )}
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>{Math.round(location.temp)}°C</p>
                      <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        H: {Math.round(location.maxTemp)}° L: {Math.round(location.minTemp)}°
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center mt-4">
                    {location.icon && (
                      <img 
                        src={`https://openweathermap.org/img/w/${location.icon}.png`}
                        alt={location.description || ''}
                        className="w-12 h-12 mr-2"
                      />
                    )}
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} capitalize`}>{location.description || ''}</p>
                  </div>
                  
                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-2 rounded-lg ${darkMode ? 'shadow-inner' : 'shadow-sm'}`}>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Sunrise</p>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(location.sunrise * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    <div className={`${darkMode ? 'bg-gray-700' : 'bg-blue-50'} p-2 rounded-lg ${darkMode ? 'shadow-inner' : 'shadow-sm'}`}>
                      <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Sunset</p>
                      <p className={`font-medium ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {new Date(location.sunset * 1000).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={`text-center ${darkMode ? 'bg-black' : 'bg-white'} p-8 rounded-xl ${darkMode ? 'shadow-lg shadow-gray-800/50' : 'shadow-xl shadow-blue-100/50'} max-w-md mx-auto transition-colors duration-300`}>
              <Bookmark size={48} className={`mx-auto ${darkMode ? 'text-gray-600' : 'text-gray-400'} mb-4`} />
              <p className={darkMode ? 'text-gray-300 mb-2' : 'text-gray-600 mb-2'}>No saved locations yet.</p>
              <p className={darkMode ? 'text-gray-400' : 'text-gray-500'}>Search for a city and click "Save" to add it here.</p>
            </div>
          )}
        </div>
      </div>
      
      <div className={`md:hidden fixed bottom-0 left-0 right-0 ${darkMode ? 'bg-black' : 'bg-white'} shadow-lg transition-colors duration-300`}>
        <div className="flex justify-around items-center py-2">
          <button onClick={() => scrollToSection('weather')} className="flex flex-col items-center p-2">
            <Home size={24} className={darkMode ? 'text-blue-400 mb-1' : 'text-blue-600 mb-1'} />
            <span className="text-xs">Home</span>
          </button>
          
          <button onClick={() => setActiveTab('search')} className="flex flex-col items-center p-2">
            <Search size={24} className={darkMode ? 'text-blue-400 mb-1' : 'text-blue-600 mb-1'} />
            <span className="text-xs">Search</span>
          </button>
          
          <button onClick={() => scrollToSection('forecast')} className="flex flex-col items-center p-2">
            <Calendar size={24} className={darkMode ? 'text-blue-400 mb-1' : 'text-blue-600 mb-1'} />
            <span className="text-xs">Forecast</span>
          </button>
          
          <button onClick={() => scrollToSection('saved')} className="flex flex-col items-center p-2">
            <Bookmark size={24} className={darkMode ? 'text-blue-400 mb-1' : 'text-blue-600 mb-1'} />
            <span className="text-xs">Saved</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Homepage;