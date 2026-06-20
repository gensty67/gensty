const { fetchDiscordInvite } = require('../services/discordService');

async function getDiscordInvite(req, res, next) {
  try {
    const { inviteCode } = req.params;
    const data = await fetchDiscordInvite(inviteCode);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

module.exports = { getDiscordInvite };
