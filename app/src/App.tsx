import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import {HomeHeating} from './components/HomeHeating';
import NavigationBar from './components/NavigationBar';
import {Route, Routes} from 'react-router-dom';
import Login from './components/Login';
import Electricity from './components/Electricity/Electricity';
import RequireAuth from './components/RequireAuth';

function App() {
  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100">
      <Header />
      <div className="app-container flex flex-1 overflow-hidden">
        <div className='navigation'>
          <NavigationBar />
        </div>
        <div className='flex-1 overflow-auto p-4'>
          <Routes>
            <Route path="/" element={<RequireAuth><Home /></RequireAuth>} />
            <Route path="/login" element={<Login />} />
            <Route path="/electricity" element={<RequireAuth><Electricity /></RequireAuth>} />
            <Route path="/home-heating" element={<RequireAuth><HomeHeating /></RequireAuth>} />
            <Route path="*" element={<RequireAuth><Home /></RequireAuth>} />
          </Routes>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default App;
