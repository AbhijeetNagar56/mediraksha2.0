import Hospital from "../service/Hospital"
import Upload from "../service/Upload"
import AddDoctor from "../service/AddDoctor"
import Appointment from "../service/Appointment"
import Chat from "../service/Chat"
import Disease from "../service/Disease"
import DoctorAvailability from "../service/DoctorAvailability"
import Health from "../service/Health"
import Map from '../service/Map'

const Services = () => {
  return (
    <div>
      Services
      <AddDoctor />
      <Appointment />
      <Chat />
      <Disease />
      <DoctorAvailability />
      <Health />
      <Hospital />
      <Map />
      <Upload />

    </div>
  )
}

export default Services