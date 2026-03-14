const BaseController = require('./BaseController');
const AdminService = require('../services/AdminService');

class AdminController extends BaseController {
  static loginAdmin = BaseController.asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const result = await AdminService.loginAdmin({ email, password });
    return res.status(200).json(result);
  });
}

module.exports = AdminController;

