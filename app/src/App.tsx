import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import {HomeHeatingTabs} from './components/HomeHeatingTabs';
import NavigationBar from './components/NavigationBar';
import {Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Electricity from './components/Electricity/Electricity';
import Devices from './components/Devices/Devices';
import Lights from './components/Lights/Lights';
import PowerOutlets from './components/PowerOutlets/PowerOutlets';
import RequireAuth from './components/RequireAuth';
import {useElectricityDataSync} from './lib/electricity/useElectricityDataSync';

function App() {
  useElectricityDataSync();

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      <Header />
      <div className="app-container flex flex-1 overflow-hidden flex-col md:flex-row">
        <div className='navigation shrink-0'>
          <NavigationBar />
        </div>
        <div className='flex-1 overflow-auto p-4'>
          <Routes>
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/electricity" element={<RequireAuth><Electricity /></RequireAuth>} />
            <Route path="/home-heating" element={<RequireAuth><HomeHeatingTabs /></RequireAuth>} />
            <Route path="/devices" element={<RequireAuth><Devices /></RequireAuth>} />
            <Route path="/lights" element={<RequireAuth><Lights /></RequireAuth>} />
            <Route path="/power-outlets" element={<RequireAuth><PowerOutlets /></RequireAuth>} />
            <Route path="*" element={<RequireAuth><Home /></RequireAuth>} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
