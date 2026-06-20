const axios = require('axios');
const NodeCache = require('node-cache');

const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

async function fetchRobloxProfile(userId) {
  const cached = cache.get(`roblox:${userId}`);
  if (cached) return cached;

  const [profileResponse, avatarResponse, presenceResponse] = await Promise.all([
    axios.get(`https://users.roblox.com/v1/users/${userId}`),
    axios.get(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${userId}&size=420x420&format=png&isCircular=false`),
    axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`),
  ]);

  const profile = profileResponse.data;
  const avatarUrl = avatarResponse.data.data?.[0]?.imageUrl || '';
  const followers = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followers/count`);
  const following = await axios.get(`https://friends.roblox.com/v1/users/${userId}/followings/count`);

  const presence = await axios.get(`https://presence.roblox.com/v1/presence/users?userIds=${userId}`);
  const place = presence.data?.userPresences?.[0] || null;
  const currentPlace = place?.placeId ? {
    id: place.placeId,
    name: place.lastLocation || 'Active game',
    image: `https://www.roblox.com/asset-thumbnail/image?assetId=${place.placeId}&width=420&height=240&format=png`,
    launchUrl: `https://www.roblox.com/games/${place.placeId}`
  } : null;

  const robloxData = {
    id: profile.id,
    name: profile.name,
    description: profile.description || 'A Roblox creator with live status updates.',
    joined: new Date(profile.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
    followers: followers.data.count,
    followings: following.data.count,
    robux: 0,
    avatarUrl,
    places: profile.universeIds || [],
    activities: [
      { title: 'Profile refreshed', subtitle: 'Realtime Roblox creator data synced.' },
      { title: 'Discord community ready', subtitle: 'Invite members to join the server.' },
      { title: 'Backend live', subtitle: 'Secure API proxying of Roblox and Discord.' }
    ],
    currentPlace
  };

  cache.set(`roblox:${userId}`, robloxData);
  return robloxData;
}

module.exports = { fetchRobloxProfile };
