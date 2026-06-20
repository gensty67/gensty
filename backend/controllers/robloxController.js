const { fetchRobloxProfile } = require('../services/robloxService');

async function getRobloxData(req, res, next) {
  try {
    const { userId } = req.params;
    const data = await fetchRobloxProfile(userId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = { getRobloxData };
