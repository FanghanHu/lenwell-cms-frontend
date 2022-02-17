import nc from 'next-connect';
import { sessionMiddleware } from '../../middlewares/session';
import { createStrapiAxios } from '../../utils/strapi';

export default nc()
  .use(sessionMiddleware)
  .post(async (req, res) => {
    const { email, password } = req.body;

    try {
        const result = await createStrapiAxios().post(
            `/auth/local`, 
            {
                identifier: email,
                password,
            }
        );

        //console.log("user", result.data);

        const user = {
            id: result.data.user.id,
            username: result.data.user.username,
            email: result.data.user.email,
            provider: result.data.user.provider,
            confirmed: result.data.user.confirmed,
            blocked: result.data.user.blocked,
            role: result.data.user.role,
            name: result.data.user.name,
            strapiToken: result.data.jwt,
            isAdmin: result.data.user.isAdmin,
            };

      if (!user.confirmed) {
        return res.status(401).json({
          statusCode: 401,
          message: 'User not confirmed'
        });
      }

      req.session.set('user', user);
      await req.session.save();
      res.json(user);
    } catch (error) {
      //console.error(error);
      const { response: fetchResponse } = error;
      if (fetchResponse) {
        return res.status(fetchResponse?.status || 500).json(error.response?.data);
      }
      res.status(500).json(error);
    }
  });