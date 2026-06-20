const ROBLOX_USER_ID = 4745872952;
const DISCORD_INVITE = 'crzxJSD9Jf';
const avatarImg = document.getElementById('avatarImg');
const usernameElem = document.getElementById('username');
const introElem = document.getElementById('intro');
const profileBtn = document.getElementById('profileBtn');
const joinGameBtn = document.getElementById('joinGameBtn');
const liveStatusElem = document.getElementById('liveStatus');
const currentActivityElem = document.getElementById('currentActivity');
const placeNameElem = document.getElementById('placeName');
const gamePreviewElem = document.getElementById('gamePreview');
const gameThumb = document.getElementById('gameThumb');
const statsGrid = document.getElementById('statsGrid');
const timeline = document.getElementById('timeline');
const discordName = document.getElementById('discordName');
const discordCounts = document.getElementById('discordCounts');
const discordMembers = document.getElementById('discordMembers');
const yearElem = document.getElementById('year');
const loadingScreen = document.getElementById('loading');
const ROBLOX_PROFILE_URL = `https://www.roblox.com/users/${ROBLOX_USER_ID}/profile`;
const DISCORD_URL = `https://discord.gg/${DISCORD_INVITE}`;

function showLoading(isLoading) {
  loadingScreen.style.display = isLoading ? 'grid' : 'none';
}

function setLiveStatus(isLive, message) {
  liveStatusElem.textContent = isLive ? 'Online now' : 'Offline';
  liveStatusElem.classList.toggle('loading', !isLive);
  currentActivityElem.textContent = message;
}

function renderStats(data) {
  const stats = [
    { label: 'Followers', value: data.followers },
    { label: 'Following', value: data.followings },
    { label: 'Created', value: data.joined },
    { label: 'Robux', value: data.robux },
    { label: 'Recent Places', value: data.places.length },
    { label: 'Account ID', value: data.id }
  ];
  statsGrid.innerHTML = stats.map(stat => `
    <article class="card status">
      <h3>${stat.label}</h3>
      <p>${stat.value}</p>
    </article>
  `).join('');
}

function renderTimeline(activities) {
  if (!activities || activities.length === 0) {
    timeline.innerHTML = '<div class="timeline-item"><h3>No recent activity</h3><p>Public site updates live when available.</p></div>';
    return;
  }
  timeline.innerHTML = activities.slice(0, 4).map(item => `
    <div class="timeline-item">
      <h3>${item.title}</h3>
      <p>${item.subtitle}</p>
    </div>
  `).join('');
}

function renderDiscord(invite) {
  discordName.textContent = invite.name;
  discordCounts.textContent = `${invite.approximate_presence_count} online · ${invite.approximate_member_count} members`;
  discordMembers.innerHTML = `
    <p>Invite Code: <strong>${DISCORD_INVITE}</strong></p>
    <p>Vanity URL: <strong>discord.gg/${DISCORD_INVITE}</strong></p>
  `;
  document.getElementById('discordJoinBtn').href = DISCORD_URL;
  document.getElementById('discordServerBtn').href = DISCORD_URL;
}

function updateProfile(data) {
  usernameElem.textContent = data.name;
  introElem.textContent = data.description || 'Public Roblox creator portfolio with live community tracking.';
  profileBtn.href = ROBLOX_PROFILE_URL;
  avatarImg.src = data.avatarUrl || 'https://via.placeholder.com/420x420/1c2541/9fb4d1?text=Avatar';
  renderStats(data);
  renderTimeline(data.activities);

  const activePlace = data.currentPlace;
  if (activePlace) {
    setLiveStatus(true, `Playing ${activePlace.name}`);
    placeNameElem.textContent = activePlace.name;
    gameThumb.src = activePlace.image;
    gamePreviewElem.classList.remove('hidden');
    joinGameBtn.href = activePlace.launchUrl || `https://www.roblox.com/games/${activePlace.id}`;
    joinGameBtn.classList.remove('hidden');
  } else {
    setLiveStatus(false, 'Currently not in a game.');
    gamePreviewElem.classList.add('hidden');
    joinGameBtn.classList.add('hidden');
  }
}

async function fetchRoblox() {
  try {
    const profileResponse = await fetch(`https://users.roblox.com/v1/users/${ROBLOX_USER_ID}`);
    const avatarResponse = await fetch(`https://thumbnails.roblox.com/v1/users/avatar?userIds=${ROBLOX_USER_ID}&size=420x420&format=png&isCircular=false`);
    const followersResponse = await fetch(`https://friends.roblox.com/v1/users/${ROBLOX_USER_ID}/followers/count`);
    const followingResponse = await fetch(`https://friends.roblox.com/v1/users/${ROBLOX_USER_ID}/followings/count`);
    const presenceResponse = await fetch(`https://presence.roblox.com/v1/presence/users?userIds=${ROBLOX_USER_ID}`);

    const profile = await profileResponse.json();
    const avatarPayload = await avatarResponse.json();
    const followers = await followersResponse.json();
    const followings = await followingResponse.json();
    const presence = await presenceResponse.json();

    const placeData = presence.userPresences?.[0] || null;
    const currentPlace = placeData?.placeId ? {
      id: placeData.placeId,
      name: placeData.lastLocation || 'Active game',
      image: `https://www.roblox.com/asset-thumbnail/image?assetId=${placeData.placeId}&width=420&height=240&format=png`,
      launchUrl: `https://www.roblox.com/games/${placeData.placeId}`
    } : null;

    return {
      id: profile.id,
      name: profile.name,
      description: profile.description || 'A Roblox creator with public community tracking.',
      joined: new Date(profile.created).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }),
      followers: followers.count,
      followings: followings.count,
      robux: 0,
      avatarUrl: avatarPayload.data?.[0]?.imageUrl || '',
      places: profile.universeIds || [],
      activities: [
        { title: 'Profile refreshed', subtitle: 'Live Roblox creator data fetched publicly.' },
        { title: 'Discord link ready', subtitle: 'Public community invite available.' },
        { title: 'No local backend', subtitle: 'This page uses public APIs.' }
      ],
      currentPlace
    };
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function fetchDiscord() {
  try {
    const response = await fetch(`https://discord.com/api/v10/invites/${DISCORD_INVITE}?with_counts=true`);
    return await response.json();
  } catch (error) {
    console.error(error);
    return null;
  }
}

async function initialize() {
  yearElem.textContent = new Date().getFullYear();
  showLoading(true);
  const [robloxData, discordData] = await Promise.all([fetchRoblox(), fetchDiscord()]);

  if (robloxData) updateProfile(robloxData);
  else {
    usernameElem.textContent = 'Public Roblox Creator';
    introElem.textContent = 'Unable to load Roblox profile data right now.';
    profileBtn.href = ROBLOX_PROFILE_URL;
    setLiveStatus(false, 'Live data unavailable.');
  }

  if (discordData) renderDiscord(discordData);
  else {
    discordName.textContent = 'Public Discord';
    discordCounts.textContent = 'Invite available via link.';
    discordMembers.innerHTML = `<p>Invite Code: <strong>${DISCORD_INVITE}</strong></p>`;
  }

  showLoading(false);
}

document.getElementById('backToTop').addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

initialize();
