const express = require('express');
const { getRobloxData } = require('../controllers/robloxController');
const { getDiscordInvite } = require('../controllers/discordController');

const router = express.Router();

router.get('/roblox/:userId', getRobloxData);
router.get('/discord/:inviteCode', getDiscordInvite);

module.exports = router;
