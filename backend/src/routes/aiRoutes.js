import router from 'express';
import { chatWithAI } from '../controllers/chatController.js';
const aiRoutes = router.Router();

// Example AI chat route
aiRoutes.post('/', chatWithAI);

export default aiRoutes;