import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import AiAssistantWidget from '../components/AiAssistantWidget'

export default function MainLayout() {
  return (
    <>
      <Navbar />
      <main className="flex-1 mt-[72px]">
        <Outlet />
      </main>
      <Footer />
      <AiAssistantWidget />
    </>
  )
}
