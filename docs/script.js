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

const API_BASE = window.location.origin;

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
    timeline.innerHTML = '<div class="timeline-item"><h3>No recent activity</h3><p>Check back soon for live updates.</p></div>';
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
}

function buildPlaceCard(place) {
  return `
    <div class="card status">
      <h3>${place.name}</h3>
      <p>${place.id}</p>
    </div>
  `;
}

function updateProfile(data) {
  usernameElem.textContent = data.name;
  introElem.textContent = data.description || 'Dynamic Roblox creator landing page backed by live API data.';
  profileBtn.href = `https://www.roblox.com/users/${ROBLOX_USER_ID}/profile`;
  avatarImg.src = data.avatarUrl || 'assets/avatar-placeholder.png';
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
    setLiveStatus(false, 'Currently not in a game. Check back later.');
    gamePreviewElem.classList.add('hidden');
    joinGameBtn.classList.add('hidden');
  }
}

async function fetchRoblox() {
  try {
    const response = await fetch(`${API_BASE}/api/roblox/${ROBLOX_USER_ID}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Unable to load Roblox data.');
    updateProfile(payload);
  } catch (error) {
    console.error(error);
    liveStatusElem.textContent = 'Unable to load status';
    currentActivityElem.textContent = 'Please try again later.';
  }
}

async function fetchDiscord() {
  try {
    const response = await fetch(`${API_BASE}/api/discord/${DISCORD_INVITE}`);
    const payload = await response.json();
    if (!response.ok) throw new Error(payload.message || 'Unable to load Discord data.');
    renderDiscord(payload);
  } catch (error) {
    console.error(error);
    discordName.textContent = 'Discord unavailable';
    discordCounts.textContent = 'Unable to fetch server info.';
  }
}

function initCanvas() {
  const canvas = document.getElementById('bg-canvas');
  const ctx = canvas.getContext('2d');
  const resize = () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  };
  resize();
  window.addEventListener('resize', resize);

  const draw = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < 28; i += 1) {
      const x = Math.sin((Date.now() * 0.0008) + i) * canvas.width * 0.18 + canvas.width / 2;
      const y = Math.cos((Date.now() * 0.0012) + i * 1.3) * canvas.height * 0.17 + canvas.height / 2;
      const radius = 80 + Math.sin(Date.now() * 0.0009 + i) * 20;
      ctx.fillStyle = `rgba(109, 159, 255, ${0.04 + (i * 0.002)})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    requestAnimationFrame(draw);
  };
  draw();
}

async function initialize() {
  yearElem.textContent = new Date().getFullYear();
  showLoading(true);
  initCanvas();
  await Promise.all([fetchRoblox(), fetchDiscord()]);
  showLoading(false);
}

document.getElementById('backToTop').addEventListener('click', event => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

initialize();
