import About from "../components/About"
import Hero from "../components/Hero"
import Navbar from "../components/Navbar"
import Services from "../components/Services"
import UserProfile from "./UserProfile"

const UserPage = () => {
  return (
    <div>
      UserPage
      <UserProfile />
      <Navbar />
      <Hero />
      <Services />
      <About />
    </div>
  )
}

export default UserPage