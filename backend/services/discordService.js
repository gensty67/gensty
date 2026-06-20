const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

async function fetchDiscordInvite(inviteCode) {
  const cached = cache.get(`discord:${inviteCode}`);
  if (cached) return cached;

  const response = await axios.get(`https://discord.com/api/v10/invites/${inviteCode}?with_counts=true`);
  const invite = response.data;

  const inviteData = {
    name: invite.guild?.name || 'Community Server',
    approximate_member_count: invite.approximate_member_count || 0,
    approximate_presence_count: invite.approximate_presence_count || 0,
    vanity_url_code: invite.code,
  };

  cache.set(`discord:${inviteCode}`, inviteData);
  return inviteData;
}

module.exports = { fetchDiscordInvite };
