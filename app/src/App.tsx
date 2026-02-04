import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import {HomeHeating} from './components/HomeHeating';
import NavigationBar from './components/NavigationBar';
import {Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import ElectricityConsumption from './components/ElectricityConsumption';
import {AuthProvider} from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
        <Header />
        <div className="app-container flex flex-1 overflow-hidden">
          <div className='navigation'>
            <NavigationBar />
          </div>
          <div className='flex-1 overflow-auto p-4'>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/electricityconsumption" element={<ElectricityConsumption />} />
              <Route path="/home-heating" element={<HomeHeating />} />
              <Route path="*" element={<Home />} />
            </Routes>
          </div>
        </div>
        <Footer />
      </div>
    </AuthProvider>
  );
}

export default App;
