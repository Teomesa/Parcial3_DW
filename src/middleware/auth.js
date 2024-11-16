import jwt from 'jsonwebtoken';

export class AuthMiddleware {
  static async authenticate(req, res, next) {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'Token no proporcionado' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded;
      next();
    } catch (error) {
      return res.status(401).json({ message: 'Token inválido' });
    }
  }

  static generateToken(userData) {
    return jwt.sign(userData, process.env.JWT_SECRET, { expiresIn: '30m' });
  }
}