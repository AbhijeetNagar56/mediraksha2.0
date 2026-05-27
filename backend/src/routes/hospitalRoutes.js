import router from 'express';
import { getHospitals, getHospitalById } from '../controllers/hospitalController.js';

const hospitalRoutes = router();

hospitalRoutes.get('/all', getHospitals);
hospitalRoutes.get('/:id', getHospitalById);

export default hospitalRoutes;