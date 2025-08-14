import Header from './components/Header';
import Footer from './components/Footer';
import Home from './components/Home';
import Electricity from './components/Electricity';
import './App.css';
import NavigationBar from './components/NavigationBar';
import {Route, Routes} from 'react-router-dom';
import Login from './components/Login';

function App() {
  return (
    <>
      <Header />
      <NavigationBar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/electricity" element={<Electricity />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </>
  );
}

export default App;
