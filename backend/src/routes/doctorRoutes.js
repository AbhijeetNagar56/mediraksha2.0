import router from 'express';

const authRouter = router();

authRouter.get('/', (req, res) => {
  res.status(200).json({ message: 'Doctor route is working' });
});

export default authRouter;