/**
 * ZzBox Player - Static Version
 * GitHub Pages Compatible
 * Xtream Codes API Integration
 */

// ========================================
// Configuration
// ========================================

let Config = {
    app: {
        name: "ZzBox",
        title: "Player",
        version: "8.1",
        subtitle: "Streaming Premium",
        logo: "logo.png"
    },
    theme: {
        primary: "#FF5500",
        primaryDark: "#cc4400",
        background: "#050505",
        surface: "#121212",
        surfaceLight: "#1a1a1a",
        text: "#ffffff",
        textMuted: "#888888"
    },
    login: {
        showServerField: true,
        defaultServer: "",
        serverPlaceholder: "Servidor (ex: http://servidor.com)",
        usernamePlaceholder: "Usuário",
        passwordPlaceholder: "Senha",
        buttonText: "ENTRAR",
        loadingText: "CONECTANDO..."
    },
    sections: {
        live: { enabled: true, name: "TV ao Vivo", icon: "tv" },
        movies: { enabled: true, name: "Filmes", icon: "film" },
        series: { enabled: true, name: "Séries", icon: "series" }
    },
    player: {
        autoplay: true,
        defaultVolume: 1,
        showLiveBadge: true,
        liveBadgeText: "AO VIVO"
    },
    messages: {
        loading: "Carregando...",
        noContent: "Nenhum conteúdo encontrado",
        noCategories: "Nenhuma categoria encontrada",
        loginError: "Erro ao conectar",
        invalidCredentials: "Credenciais inválidas",
        connectionError: "Erro de conexão",
        playerError: "Erro ao reproduzir",
        retry: "Tentar Novamente",
        back: "Voltar",
        search: "Buscar...",
        logout: "Sair",
        expires: "Expira:"
    },
    footer: {
        show: false,
        text: "© 2024 ZzBox Player"
    }
};

async function loadConfig() {
    try {
        const response = await fetch('config.json');
        if (response.ok) {
            const userConfig = await response.json();
            // Deep merge config
            Config = deepMerge(Config, userConfig);
            console.log('Config loaded:', Config);
        }
    } catch (e) {
        console.log('Using default config');
    }
    applyConfig();
}

function deepMerge(target, source) {
    const result = { ...target };
    for (const key in source) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
            result[key] = deepMerge(target[key] || {}, source[key]);
        } else {
            result[key] = source[key];
        }
    }
    return result;
}

function applyConfig() {
    // Apply theme colors as CSS variables
    const root = document.documentElement;
    root.style.setProperty('--primary', Config.theme.primary);
    root.style.setProperty('--primary-dark', Config.theme.primaryDark);
    root.style.setProperty('--bg', Config.theme.background);
    root.style.setProperty('--surface', Config.theme.surface);
    root.style.setProperty('--surface-light', Config.theme.surfaceLight);
    root.style.setProperty('--text', Config.theme.text);
    root.style.setProperty('--text-muted', Config.theme.textMuted);

    // Apply app info
    document.title = `${Config.app.name} ${Config.app.title}`;

    // Update logo sources
    document.querySelectorAll('.logo, .loading-logo, .sidebar-logo').forEach(img => {
        img.src = Config.app.logo;
    });

    // Update app name in header
    const headerTitle = document.querySelector('.login-header h1');
    if (headerTitle) {
        headerTitle.innerHTML = `${Config.app.name} <span class="highlight">${Config.app.title}</span>`;
    }

    // Update subtitle
    const subtitle = document.querySelector('.subtitle');
    if (subtitle) {
        subtitle.innerHTML = `${Config.app.subtitle} <span class="version">v${Config.app.version}</span>`;
    }

    // Update sidebar title
    const sidebarTitle = document.querySelector('.sidebar-title');
    if (sidebarTitle) {
        sidebarTitle.textContent = Config.app.name;
    }

    // Update login form
    const serverInput = document.getElementById('server');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');

    if (serverInput) {
        serverInput.placeholder = Config.login.serverPlaceholder;
        if (Config.login.defaultServer) {
            serverInput.value = Config.login.defaultServer;
        }
        // Hide server field if configured
        if (!Config.login.showServerField) {
            serverInput.closest('.input-group').style.display = 'none';
        }
    }
    if (usernameInput) usernameInput.placeholder = Config.login.usernamePlaceholder;
    if (passwordInput) passwordInput.placeholder = Config.login.passwordPlaceholder;
    if (loginBtn) {
        loginBtn.querySelector('.btn-text').textContent = Config.login.buttonText;
    }

    // Update search placeholder
    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.placeholder = Config.messages.search;

    // Update nav items with section names
    document.querySelectorAll('.nav-item').forEach(item => {
        const section = item.dataset.section;
        if (Config.sections[section]) {
            item.querySelector('span').textContent = Config.sections[section].name;
            // Hide disabled sections
            if (!Config.sections[section].enabled) {
                item.style.display = 'none';
            }
        }
    });

    // Update back button text
    const backBtn = document.getElementById('back-btn');
    if (backBtn) {
        backBtn.querySelector('span').textContent = Config.messages.back;
    }

    // Update retry button text
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.textContent = Config.messages.retry;
    }

    // Update live badge text
    const liveBadge = document.getElementById('live-badge');
    if (liveBadge) {
        liveBadge.textContent = Config.player.liveBadgeText;
    }

    // Set default volume
    const volumeSlider = document.getElementById('volume-slider');
    if (volumeSlider) {
        volumeSlider.value = Config.player.defaultVolume;
    }
}

// ========================================
// State Management
// ========================================

const AppState = {
    isLoggedIn: false,
    server: '',
    username: '',
    password: '',
    userInfo: null,
    serverInfo: null,
    currentSection: 'live',
    categories: [],
    currentCategory: null,
    items: [],
    seriesInfo: null,
    hlsPlayer: null,
    mpegtsPlayer: null
};

// ========================================
// Storage
// ========================================

const Storage = {
    save() {
        const data = {
            server: AppState.server,
            username: AppState.username,
            password: AppState.password,
            userInfo: AppState.userInfo,
            serverInfo: AppState.serverInfo,
            isLoggedIn: AppState.isLoggedIn
        };
        localStorage.setItem('zzbox-auth', JSON.stringify(data));
    },

    load() {
        try {
            const data = JSON.parse(localStorage.getItem('zzbox-auth'));
            if (data && data.isLoggedIn) {
                AppState.server = data.server;
                AppState.username = data.username;
                AppState.password = data.password;
                AppState.userInfo = data.userInfo;
                AppState.serverInfo = data.serverInfo;
                AppState.isLoggedIn = true;
                return true;
            }
        } catch (e) {
            console.error('Error loading auth data:', e);
        }
        return false;
    },

    clear() {
        localStorage.removeItem('zzbox-auth');
    }
};

// ========================================
// API
// ========================================

const API = {
    buildUrl(action, params = {}) {
        let url = `${AppState.server}/player_api.php?username=${encodeURIComponent(AppState.username)}&password=${encodeURIComponent(AppState.password)}`;
        if (action) url += `&action=${action}`;
        Object.entries(params).forEach(([key, value]) => {
            url += `&${key}=${encodeURIComponent(value)}`;
        });
        return url;
    },

    async login(server, username, password) {
        let targetServer = server.trim().replace(/\/$/, '');
        if (!targetServer.startsWith('http')) {
            targetServer = `http://${targetServer}`;
        }

        const url = `${targetServer}/player_api.php?username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Erro de conexão');

        const data = await response.json();

        if (data.user_info && data.user_info.auth === 1) {
            AppState.server = targetServer;
            AppState.username = username;
            AppState.password = password;
            AppState.userInfo = data.user_info;
            AppState.serverInfo = data.server_info;
            AppState.isLoggedIn = true;
            Storage.save();
            return data;
        } else {
            throw new Error('Credenciais inválidas');
        }
    },

    async getCategories(type) {
        const actionMap = {
            live: 'get_live_categories',
            movies: 'get_vod_categories',
            series: 'get_series_categories'
        };
        const url = this.buildUrl(actionMap[type]);
        const response = await fetch(url);
        return response.json();
    },

    async getStreams(type, categoryId) {
        const actionMap = {
            live: 'get_live_streams',
            movies: 'get_vod_streams',
            series: 'get_series'
        };
        const url = this.buildUrl(actionMap[type], { category_id: categoryId });
        const response = await fetch(url);
        return response.json();
    },

    async getSeriesInfo(seriesId) {
        const url = this.buildUrl('get_series_info', { series_id: seriesId });
        const response = await fetch(url);
        return response.json();
    },

    getLiveStreamUrl(streamId, format = 'ts') {
        // Xtream codes suporta: .ts (mais comum), .m3u8
        return `${AppState.server}/live/${AppState.username}/${AppState.password}/${streamId}.${format}`;
    },

    getVodStreamUrl(streamId, extension = 'mp4') {
        return `${AppState.server}/movie/${AppState.username}/${AppState.password}/${streamId}.${extension}`;
    },

    getSeriesStreamUrl(streamId, extension = 'mp4') {
        return `${AppState.server}/series/${AppState.username}/${AppState.password}/${streamId}.${extension}`;
    }
};

// ========================================
// UI Elements
// ========================================

const UI = {
    loadingScreen: document.getElementById('loading-screen'),
    loginScreen: document.getElementById('login-screen'),
    dashboardScreen: document.getElementById('dashboard-screen'),

    loginForm: document.getElementById('login-form'),
    serverInput: document.getElementById('server'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    loginBtn: document.getElementById('login-btn'),
    loginStatus: document.getElementById('login-status'),

    sidebar: document.querySelector('.sidebar'),
    navItems: document.querySelectorAll('.nav-item'),
    mobileMenuBtn: document.getElementById('mobile-menu-btn'),
    logoutBtn: document.getElementById('logout-btn'),
    userName: document.getElementById('user-name'),
    userExp: document.getElementById('user-exp'),

    searchInput: document.getElementById('search-input'),
    sectionTitle: document.getElementById('section-title'),
    categoriesView: document.getElementById('categories-view'),
    categoriesGrid: document.getElementById('categories-grid'),
    contentView: document.getElementById('content-view'),
    contentTitle: document.getElementById('content-title'),
    contentGrid: document.getElementById('content-grid'),
    backBtn: document.getElementById('back-btn'),
    contentLoading: document.getElementById('content-loading'),

    playerModal: document.getElementById('player-modal'),
    closePlayer: document.getElementById('close-player'),
    videoPlayer: document.getElementById('video-player'),
    playerTitle: document.getElementById('player-title'),
    liveBadge: document.getElementById('live-badge'),
    progressContainer: document.getElementById('progress-container'),
    progressBar: document.getElementById('progress-bar'),
    bufferedBar: document.getElementById('buffered-bar'),
    currentTime: document.getElementById('current-time'),
    duration: document.getElementById('duration'),
    playPauseBtn: document.getElementById('play-pause-btn'),
    playIcon: document.getElementById('play-icon'),
    pauseIcon: document.getElementById('pause-icon'),
    muteBtn: document.getElementById('mute-btn'),
    volumeIcon: document.getElementById('volume-icon'),
    mutedIcon: document.getElementById('muted-icon'),
    volumeSlider: document.getElementById('volume-slider'),
    fullscreenBtn: document.getElementById('fullscreen-btn'),
    playerLoading: document.getElementById('player-loading'),
    playerError: document.getElementById('player-error'),
    retryBtn: document.getElementById('retry-btn'),

    // Audio/Subtitle controls
    audioBtn: document.getElementById('audio-btn'),
    audioMenu: document.getElementById('audio-menu'),
    audioTracks: document.getElementById('audio-tracks'),
    subtitleBtn: document.getElementById('subtitle-btn'),
    subtitleMenu: document.getElementById('subtitle-menu'),
    subtitleTracks: document.getElementById('subtitle-tracks'),

    seriesModal: document.getElementById('series-modal'),
    closeSeries: document.getElementById('close-series'),
    seriesCover: document.getElementById('series-cover'),
    seriesTitle: document.getElementById('series-title'),
    seriesPlot: document.getElementById('series-plot'),
    seasonsTabs: document.getElementById('seasons-tabs'),
    episodesGrid: document.getElementById('episodes-grid')
};

// ========================================
// View Controllers
// ========================================

const Views = {
    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
        document.getElementById(screenId).classList.add('active');
    },

    showLoading(show) {
        UI.contentLoading.style.display = show ? 'flex' : 'none';
    },

    showCategoriesView() {
        UI.categoriesView.classList.add('active');
        UI.contentView.classList.remove('active');
    },

    showContentView() {
        UI.categoriesView.classList.remove('active');
        UI.contentView.classList.add('active');
    },

    updateUserInfo() {
        if (AppState.userInfo) {
            UI.userName.textContent = AppState.userInfo.username || AppState.username;
            if (AppState.userInfo.exp_date) {
                const expDate = new Date(parseInt(AppState.userInfo.exp_date) * 1000);
                UI.userExp.textContent = `${Config.messages.expires} ${expDate.toLocaleDateString('pt-BR')}`;
            }
        }
    },

    renderCategories(categories) {
        UI.categoriesGrid.innerHTML = '';

        if (!categories || categories.length === 0) {
            UI.categoriesGrid.innerHTML = '<p class="no-content">Nenhuma categoria encontrada</p>';
            return;
        }

        categories.forEach(cat => {
            const card = document.createElement('div');
            card.className = 'category-card';
            card.innerHTML = `
                <div class="category-icon">📁</div>
                <span class="category-name">${cat.category_name}</span>
            `;
            card.addEventListener('click', () => loadCategory(cat.category_id, cat.category_name));
            UI.categoriesGrid.appendChild(card);
        });

        AppState.categories = categories;
    },

    renderContent(items, type) {
        UI.contentGrid.innerHTML = '';

        if (!items || items.length === 0) {
            UI.contentGrid.innerHTML = '<p class="no-content">Nenhum conteúdo encontrado</p>';
            return;
        }

        items.forEach(item => {
            const card = document.createElement('div');
            card.className = 'content-card';

            const poster = item.stream_icon || item.cover || '';
            const name = item.name || item.title || 'Sem título';
            const isLive = type === 'live';

            card.innerHTML = `
                <img class="content-poster ${isLive ? 'landscape' : ''}" 
                     src="${poster}" 
                     alt="${name}"
                     onerror="this.style.display='none'">
                <div class="content-info">
                    <div class="content-title">${name}</div>
                    ${item.rating ? `<div class="content-meta">⭐ ${item.rating}</div>` : ''}
                </div>
            `;

            card.addEventListener('click', () => {
                if (type === 'series') {
                    openSeriesModal(item);
                } else {
                    playContent(item, type);
                }
            });

            UI.contentGrid.appendChild(card);
        });

        AppState.items = items;
    },

    renderSeriesModal(seriesData, info) {
        UI.seriesCover.src = seriesData.cover || '';
        UI.seriesTitle.textContent = info.name || seriesData.name;
        UI.seriesPlot.textContent = info.plot || 'Sem descrição disponível.';

        const seasons = info.episodes ? Object.keys(info.episodes) : [];
        UI.seasonsTabs.innerHTML = '';

        seasons.forEach((season, index) => {
            const tab = document.createElement('button');
            tab.className = `season-tab ${index === 0 ? 'active' : ''}`;
            tab.textContent = `Temporada ${season}`;
            tab.addEventListener('click', () => {
                document.querySelectorAll('.season-tab').forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                renderEpisodes(info.episodes[season]);
            });
            UI.seasonsTabs.appendChild(tab);
        });

        if (seasons.length > 0) {
            renderEpisodes(info.episodes[seasons[0]]);
        }

        UI.seriesModal.classList.add('active');
    }
};

// ========================================
// Actions
// ========================================

async function handleLogin(e) {
    e.preventDefault();

    const server = UI.serverInput.value.trim();
    const username = UI.usernameInput.value.trim();
    const password = UI.passwordInput.value.trim();

    if (!server || !username || !password) {
        showLoginError('Preencha todos os campos');
        return;
    }

    UI.loginBtn.disabled = true;
    UI.loginBtn.querySelector('.btn-text').style.display = 'none';
    UI.loginBtn.querySelector('.btn-loading').style.display = 'flex';
    UI.loginStatus.className = 'status-message';
    UI.loginStatus.style.display = 'none';

    try {
        await API.login(server, username, password);
        Views.showScreen('dashboard-screen');
        Views.updateUserInfo();
        loadSection('live');
    } catch (error) {
        showLoginError(error.message || 'Erro ao conectar');
    } finally {
        UI.loginBtn.disabled = false;
        UI.loginBtn.querySelector('.btn-text').style.display = 'flex';
        UI.loginBtn.querySelector('.btn-loading').style.display = 'none';
    }
}

function showLoginError(message) {
    UI.loginStatus.textContent = message;
    UI.loginStatus.className = 'status-message error';
    UI.loginStatus.style.display = 'block';
}

function handleLogout() {
    Storage.clear();
    AppState.isLoggedIn = false;
    AppState.server = '';
    AppState.username = '';
    AppState.password = '';
    AppState.userInfo = null;
    Views.showScreen('login-screen');
    UI.serverInput.value = '';
    UI.usernameInput.value = '';
    UI.passwordInput.value = '';
}

async function loadSection(section) {
    AppState.currentSection = section;

    // Update nav
    UI.navItems.forEach(item => {
        item.classList.toggle('active', item.dataset.section === section);
    });

    // Update title using config
    UI.sectionTitle.textContent = Config.sections[section]?.name || section;

    // Show categories view
    Views.showCategoriesView();
    Views.showLoading(true);

    try {
        const categories = await API.getCategories(section);
        Views.renderCategories(categories);
    } catch (error) {
        console.error('Error loading categories:', error);
        UI.categoriesGrid.innerHTML = '<p class="no-content">Erro ao carregar categorias</p>';
    } finally {
        Views.showLoading(false);
    }

    // Close mobile sidebar
    UI.sidebar.classList.remove('open');
}

async function loadCategory(categoryId, categoryName) {
    AppState.currentCategory = categoryId;
    UI.contentTitle.textContent = categoryName;
    Views.showContentView();
    Views.showLoading(true);

    try {
        const items = await API.getStreams(AppState.currentSection, categoryId);
        Views.renderContent(items, AppState.currentSection);
    } catch (error) {
        console.error('Error loading content:', error);
        UI.contentGrid.innerHTML = '<p class="no-content">Erro ao carregar conteúdo</p>';
    } finally {
        Views.showLoading(false);
    }
}

function playContent(item, type) {
    let streamUrl;
    const isLive = type === 'live';

    if (type === 'live') {
        streamUrl = API.getLiveStreamUrl(item.stream_id);
        console.log('[PlayContent] Live URL:', streamUrl);
    } else if (type === 'movies') {
        const ext = item.container_extension || 'mp4';
        streamUrl = API.getVodStreamUrl(item.stream_id, ext);
    } else {
        const ext = item.container_extension || 'mp4';
        streamUrl = API.getSeriesStreamUrl(item.id, ext);
    }

    console.log('[PlayContent] Final URL:', streamUrl);

    UI.playerTitle.textContent = item.name || item.title || 'Reproduzindo';
    UI.liveBadge.style.display = isLive ? 'inline-block' : 'none';
    UI.progressContainer.style.display = isLive ? 'none' : 'block';

    initPlayer(streamUrl, isLive);
    UI.playerModal.classList.add('active');
}

async function openSeriesModal(series) {
    try {
        const info = await API.getSeriesInfo(series.series_id);
        AppState.seriesInfo = { series, info };
        Views.renderSeriesModal(series, info);
    } catch (error) {
        console.error('Error loading series info:', error);
    }
}

function renderEpisodes(episodes) {
    UI.episodesGrid.innerHTML = '';

    if (!episodes || episodes.length === 0) {
        UI.episodesGrid.innerHTML = '<p class="no-content">Nenhum episódio disponível</p>';
        return;
    }

    episodes.forEach(ep => {
        const card = document.createElement('div');
        card.className = 'episode-card';
        card.innerHTML = `
            <div class="episode-number">${ep.episode_num || '?'}</div>
            <div class="episode-info">
                <div class="episode-title">${ep.title || `Episódio ${ep.episode_num}`}</div>
                ${ep.info && ep.info.duration ? `<div class="episode-duration">${ep.info.duration}</div>` : ''}
            </div>
            <div class="episode-play">
                <svg viewBox="0 0 24 24" fill="currentColor">
                    <polygon points="5 3 19 12 5 21 5 3"></polygon>
                </svg>
            </div>
        `;
        card.addEventListener('click', () => {
            const ext = ep.container_extension || 'mp4';
            const url = API.getSeriesStreamUrl(ep.id, ext);
            UI.seriesModal.classList.remove('active');
            UI.playerTitle.textContent = ep.title || `Episódio ${ep.episode_num}`;
            UI.liveBadge.style.display = 'none';
            UI.progressContainer.style.display = 'block';
            initPlayer(url, false);
            UI.playerModal.classList.add('active');
        });
        UI.episodesGrid.appendChild(card);
    });
}

// ========================================
// Player
// ========================================

function initPlayer(url, isLive) {
    destroyPlayer();

    UI.playerLoading.style.display = 'flex';
    UI.playerError.style.display = 'none';
    UI.playIcon.style.display = 'block';
    UI.pauseIcon.style.display = 'none';

    const video = UI.videoPlayer;
    video.currentTime = 0;

    const isHLS = url.includes('.m3u8');
    const isTS = url.includes('.ts') && !url.includes('.m3u8');
    const isFLV = url.includes('.flv');

    // MPEG-TS streams (.ts) - common for live IPTV
    if ((isTS || isFLV) && typeof mpegts !== 'undefined' && mpegts.isSupported()) {
        console.log('[Player] Using mpegts.js for TS/FLV stream');

        const player = mpegts.createPlayer({
            type: isFLV ? 'flv' : 'mpegts',
            url: url,
            isLive: isLive,
            cors: true,
            hasAudio: true,
            hasVideo: true
        }, {
            enableWorker: true,
            enableStashBuffer: true,
            stashInitialSize: 1024 * 1024,      // 1MB buffer inicial
            lazyLoad: true,
            lazyLoadMaxDuration: 5 * 60,        // 5 minutos de buffer máximo
            lazyLoadRecoverDuration: 30,        // Recuperar 30 segundos
            deferLoadAfterSourceOpen: false,
            autoCleanupSourceBuffer: true,
            autoCleanupMaxBackwardDuration: 5 * 60,
            autoCleanupMinBackwardDuration: 3 * 60,
            seekType: 'range',
            // Buffer settings para evitar travamentos
            liveBufferLatencyChasing: false,    // Desabilitar para mais estabilidade
            liveBufferLatencyMaxLatency: 30,    // 30 segundos de latência máxima
            liveBufferLatencyMinRemain: 10,     // Manter 10 segundos de buffer mínimo
            liveSync: true,
            liveSyncTargetLatency: 15           // Alvo de 15 segundos de atraso
        });

        AppState.mpegtsPlayer = player;
        player.attachMediaElement(video);
        player.load();

        player.on(mpegts.Events.LOADING_COMPLETE, () => {
            console.log('[Player] mpegts loading complete');
        });

        player.on(mpegts.Events.ERROR, (errorType, errorDetail) => {
            console.error('[Player] mpegts error:', errorType, errorDetail);
            showPlayerError();
        });

        // Buffer progress indicator
        player.on(mpegts.Events.STATISTICS_INFO, (stats) => {
            if (stats.speed) {
                console.log('[Player] Download speed:', (stats.speed / 1024).toFixed(2), 'KB/s');
            }
        });

        video.addEventListener('loadeddata', () => {
            UI.playerLoading.style.display = 'none';
            video.play().catch(() => { });
            updateAudioTracks();
            updateSubtitleTracks();
        }, { once: true });

        // Esperar buffer antes de reproduzir
        setTimeout(() => {
            video.play().catch(() => { });
        }, 2000);
    }
    // HLS streams (.m3u8)
    else if (isHLS && Hls.isSupported()) {
        console.log('[Player] Using HLS.js for M3U8 stream');

        const hls = new Hls({
            enableWorker: true,
            lowLatencyMode: false,              // Desabilitar para mais estabilidade
            // Buffer settings
            maxBufferLength: 60,                // 60 segundos de buffer máximo
            maxMaxBufferLength: 120,            // Até 2 minutos se necessário
            maxBufferSize: 60 * 1000 * 1000,    // 60MB de buffer
            maxBufferHole: 0.5,
            // Início com mais buffer
            startLevel: -1,                     // Auto escolher qualidade
            abrEwmaDefaultEstimate: 500000,     // 500kbps estimativa inicial
            abrBandWidthFactor: 0.95,
            abrBandWidthUpFactor: 0.7,
            // Live settings
            liveSyncDurationCount: 5,           // 5 segmentos de sync
            liveMaxLatencyDurationCount: 10,    // Máximo 10 segmentos de atraso
            liveDurationInfinity: true,
            // Retry settings
            manifestLoadingMaxRetry: 4,
            levelLoadingMaxRetry: 4,
            fragLoadingMaxRetry: 6
        });

        AppState.hlsPlayer = hls;
        hls.loadSource(url);
        hls.attachMedia(video);

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
            UI.playerLoading.style.display = 'none';
            // Esperar um pouco para buffer antes de reproduzir
            setTimeout(() => {
                video.play().catch(() => { });
            }, 1000);
            // Update track lists after manifest is parsed
            setTimeout(() => {
                updateAudioTracks();
                updateSubtitleTracks();
            }, 500);
        });

        hls.on(Hls.Events.ERROR, (event, data) => {
            if (data.fatal) {
                console.error('HLS Error:', data);
                if (data.type === Hls.ErrorTypes.NETWORK_ERROR) {
                    hls.startLoad();
                } else if (data.type === Hls.ErrorTypes.MEDIA_ERROR) {
                    hls.recoverMediaError();
                } else {
                    showPlayerError();
                }
            }
        });
    }
    // Safari native HLS
    else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        console.log('[Player] Using native HLS (Safari)');
        video.src = url;
        video.addEventListener('loadeddata', () => {
            UI.playerLoading.style.display = 'none';
            video.play().catch(() => { });
            updateAudioTracks();
            updateSubtitleTracks();
        }, { once: true });
    }
    // Direct play (MP4, MKV, etc.)
    else {
        console.log('[Player] Using native video playback');
        video.src = url;
        video.addEventListener('loadeddata', () => {
            UI.playerLoading.style.display = 'none';
            video.play().catch(() => { });
            updateAudioTracks();
            updateSubtitleTracks();
        }, { once: true });
    }

    video.addEventListener('error', showPlayerError, { once: true });
}

function destroyPlayer() {
    if (AppState.hlsPlayer) {
        AppState.hlsPlayer.destroy();
        AppState.hlsPlayer = null;
    }
    if (AppState.mpegtsPlayer) {
        AppState.mpegtsPlayer.pause();
        AppState.mpegtsPlayer.unload();
        AppState.mpegtsPlayer.detachMediaElement();
        AppState.mpegtsPlayer.destroy();
        AppState.mpegtsPlayer = null;
    }
    UI.videoPlayer.src = '';
    UI.videoPlayer.load();
}

function showPlayerError() {
    UI.playerLoading.style.display = 'none';
    UI.playerError.style.display = 'flex';
}

function closePlayerModal() {
    destroyPlayer();
    UI.playerModal.classList.remove('active');
}

function formatTime(seconds) {
    if (isNaN(seconds)) return '0:00';
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
}

// ========================================
// Audio & Subtitle Track Management
// ========================================

function updateAudioTracks() {
    const container = UI.audioTracks;
    container.innerHTML = '';

    let tracks = [];

    // HLS.js audio tracks
    if (AppState.hlsPlayer && AppState.hlsPlayer.audioTracks) {
        tracks = AppState.hlsPlayer.audioTracks;
        const currentTrack = AppState.hlsPlayer.audioTrack;

        if (tracks.length <= 1) {
            container.innerHTML = '<div class="track-item disabled">Áudio único</div>';
            return;
        }

        tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = `track-item ${index === currentTrack ? 'active' : ''}`;
            item.textContent = track.name || track.lang || `Áudio ${index + 1}`;
            item.dataset.index = index;
            item.addEventListener('click', () => {
                AppState.hlsPlayer.audioTrack = index;
                updateAudioTracks();
            });
            container.appendChild(item);
        });
    }
    // Native video audioTracks (limited browser support)
    else if (UI.videoPlayer.audioTracks && UI.videoPlayer.audioTracks.length > 1) {
        const audioTracks = UI.videoPlayer.audioTracks;

        for (let i = 0; i < audioTracks.length; i++) {
            const track = audioTracks[i];
            const item = document.createElement('div');
            item.className = `track-item ${track.enabled ? 'active' : ''}`;
            item.textContent = track.label || track.language || `Áudio ${i + 1}`;
            item.dataset.index = i;
            item.addEventListener('click', () => {
                // Disable all, enable selected
                for (let j = 0; j < audioTracks.length; j++) {
                    audioTracks[j].enabled = (j === i);
                }
                updateAudioTracks();
            });
            container.appendChild(item);
        }
    } else {
        container.innerHTML = '<div class="track-item disabled">Áudio único</div>';
    }
}

function updateSubtitleTracks() {
    const container = UI.subtitleTracks;
    container.innerHTML = '';

    // Add "Off" option
    const offItem = document.createElement('div');
    offItem.className = 'track-item';
    offItem.textContent = 'Desativado';
    offItem.dataset.index = -1;
    container.appendChild(offItem);

    let tracks = [];
    let currentTrack = -1;

    // HLS.js subtitle tracks
    if (AppState.hlsPlayer && AppState.hlsPlayer.subtitleTracks) {
        tracks = AppState.hlsPlayer.subtitleTracks;
        currentTrack = AppState.hlsPlayer.subtitleTrack;

        offItem.className = `track-item ${currentTrack === -1 ? 'active' : ''}`;
        offItem.addEventListener('click', () => {
            AppState.hlsPlayer.subtitleTrack = -1;
            updateSubtitleTracks();
        });

        tracks.forEach((track, index) => {
            const item = document.createElement('div');
            item.className = `track-item ${index === currentTrack ? 'active' : ''}`;
            item.textContent = track.name || track.lang || `Legenda ${index + 1}`;
            item.dataset.index = index;
            item.addEventListener('click', () => {
                AppState.hlsPlayer.subtitleTrack = index;
                AppState.hlsPlayer.subtitleDisplay = true;
                updateSubtitleTracks();
            });
            container.appendChild(item);
        });
    }
    // Native video textTracks
    else if (UI.videoPlayer.textTracks && UI.videoPlayer.textTracks.length > 0) {
        const textTracks = UI.videoPlayer.textTracks;
        let hasActive = false;

        for (let i = 0; i < textTracks.length; i++) {
            const track = textTracks[i];
            if (track.kind === 'subtitles' || track.kind === 'captions') {
                const isActive = track.mode === 'showing';
                if (isActive) hasActive = true;

                const item = document.createElement('div');
                item.className = `track-item ${isActive ? 'active' : ''}`;
                item.textContent = track.label || track.language || `Legenda ${i + 1}`;
                item.dataset.index = i;
                item.addEventListener('click', () => {
                    // Hide all, show selected
                    for (let j = 0; j < textTracks.length; j++) {
                        textTracks[j].mode = (j === i) ? 'showing' : 'hidden';
                    }
                    updateSubtitleTracks();
                });
                container.appendChild(item);
            }
        }

        offItem.className = `track-item ${!hasActive ? 'active' : ''}`;
        offItem.addEventListener('click', () => {
            for (let i = 0; i < textTracks.length; i++) {
                textTracks[i].mode = 'hidden';
            }
            updateSubtitleTracks();
        });
    } else {
        offItem.className = 'track-item active';
        const noSubs = document.createElement('div');
        noSubs.className = 'track-item disabled';
        noSubs.textContent = 'Nenhuma disponível';
        container.appendChild(noSubs);
    }
}

function toggleTrackMenu(menu) {
    const isActive = menu.classList.contains('active');
    // Close all menus first
    document.querySelectorAll('.track-menu').forEach(m => m.classList.remove('active'));
    // Toggle the clicked one
    if (!isActive) {
        menu.classList.add('active');
    }
}

// ========================================
// Search
// ========================================

let searchTimeout;
let searchCache = { live: [], movies: [], series: [] };
let searchCacheLoaded = false;

async function loadSearchCache() {
    if (searchCacheLoaded) return;

    console.log('[Search] Loading search cache...');

    try {
        // Load all items from all sections for global search
        const [liveCategories, movieCategories, seriesCategories] = await Promise.all([
            API.getCategories('live'),
            API.getCategories('movies'),
            API.getCategories('series')
        ]);

        // Load items from each category (limit to first 10 categories per type for performance)
        const loadSection = async (categories, type, limit = 10) => {
            const items = [];
            const cats = categories.slice(0, limit);
            for (const cat of cats) {
                try {
                    const streams = await API.getStreams(type, cat.category_id);
                    if (Array.isArray(streams)) {
                        streams.forEach(s => {
                            s._type = type;
                            s._category = cat.category_name;
                        });
                        items.push(...streams);
                    }
                } catch (e) {
                    console.log(`[Search] Error loading ${type} category:`, e);
                }
            }
            return items;
        };

        // Load from ALL categories (no limit)
        searchCache.live = await loadSection(liveCategories, 'live', 999);
        searchCache.movies = await loadSection(movieCategories, 'movies', 999);
        searchCache.series = await loadSection(seriesCategories, 'series', 999);

        searchCacheLoaded = true;
        console.log('[Search] Cache loaded:', {
            live: searchCache.live.length,
            movies: searchCache.movies.length,
            series: searchCache.series.length
        });
    } catch (e) {
        console.error('[Search] Error loading cache:', e);
    }
}

function handleSearch(e) {
    const query = e.target.value.toLowerCase().trim();
    clearTimeout(searchTimeout);

    // If no query, reset to current view
    if (!query) {
        document.querySelectorAll('.content-card, .category-card').forEach(card => {
            card.style.display = '';
        });
        // Hide search results view if exists
        const searchResults = document.getElementById('search-results-view');
        if (searchResults) searchResults.remove();
        Views.showCategoriesView();
        return;
    }

    searchTimeout = setTimeout(async () => {
        // Load cache if not loaded
        if (!searchCacheLoaded) {
            Views.showLoading(true);
            await loadSearchCache();
            Views.showLoading(false);
        }

        // Search in all cached items
        const results = [];

        [...searchCache.live, ...searchCache.movies, ...searchCache.series].forEach(item => {
            const name = (item.name || item.title || '').toLowerCase();
            if (name.includes(query)) {
                results.push(item);
            }
        });

        console.log('[Search] Found', results.length, 'results for:', query);
        renderSearchResults(results, query);
    }, 500);
}

function renderSearchResults(results, query) {
    // Hide categories and content views
    UI.categoriesView.classList.remove('active');
    UI.contentView.classList.remove('active');

    // Create or get search results container
    let searchView = document.getElementById('search-results-view');
    if (!searchView) {
        searchView = document.createElement('div');
        searchView.id = 'search-results-view';
        searchView.className = 'content-view active';
        searchView.style.padding = '2rem';
        UI.categoriesView.parentElement.appendChild(searchView);
    }
    searchView.classList.add('active');

    // Group results by type
    const liveResults = results.filter(r => r._type === 'live');
    const movieResults = results.filter(r => r._type === 'movies');
    const seriesResults = results.filter(r => r._type === 'series');

    let html = `
        <h2 class="section-title">Resultados para "${query}"</h2>
        <p class="search-count">${results.length} resultado(s) encontrado(s)</p>
    `;

    const renderSection = (items, title, icon) => {
        if (items.length === 0) return '';
        return `
            <div class="search-section">
                <h3 class="search-section-title">${icon} ${title} (${items.length})</h3>
                <div class="content-grid">
                    ${items.slice(0, 20).map(item => {
            const poster = item.stream_icon || item.cover || '';
            const name = item.name || item.title || 'Sem título';
            const isLive = item._type === 'live';
            return `
                            <div class="content-card" data-id="${item.stream_id || item.series_id}" data-type="${item._type}">
                                <img class="content-poster ${isLive ? 'landscape' : ''}" 
                                     src="${poster}" 
                                     alt="${name}"
                                     onerror="this.style.display='none'">
                                <div class="content-info">
                                    <div class="content-title">${name}</div>
                                    ${item.rating ? `<div class="content-meta">⭐ ${item.rating}</div>` : ''}
                                </div>
                            </div>
                        `;
        }).join('')}
                </div>
            </div>
        `;
    };

    html += renderSection(liveResults, 'TV ao Vivo', '📺');
    html += renderSection(movieResults, 'Filmes', '🎬');
    html += renderSection(seriesResults, 'Séries', '📺');

    if (results.length === 0) {
        html += '<p class="no-content">Nenhum resultado encontrado</p>';
    }

    searchView.innerHTML = html;

    // Add click handlers
    searchView.querySelectorAll('.content-card').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            const id = card.dataset.id;
            const item = results.find(r =>
                (r.stream_id == id || r.series_id == id) && r._type === type
            );
            if (item) {
                if (type === 'series') {
                    openSeriesModal(item);
                } else {
                    playContent(item, type);
                }
            }
        });
    });
}

// ========================================
// Event Listeners
// ========================================

function setupEventListeners() {
    // Login
    UI.loginForm.addEventListener('submit', handleLogin);

    // Logout
    UI.logoutBtn.addEventListener('click', handleLogout);

    // Navigation
    UI.navItems.forEach(item => {
        item.addEventListener('click', () => loadSection(item.dataset.section));
    });

    // Mobile menu
    UI.mobileMenuBtn.addEventListener('click', () => {
        UI.sidebar.classList.toggle('open');
    });

    // Back button
    UI.backBtn.addEventListener('click', () => {
        Views.showCategoriesView();
    });

    // Search
    UI.searchInput.addEventListener('input', handleSearch);

    // Player controls
    UI.closePlayer.addEventListener('click', closePlayerModal);

    UI.playPauseBtn.addEventListener('click', () => {
        if (UI.videoPlayer.paused) {
            UI.videoPlayer.play();
        } else {
            UI.videoPlayer.pause();
        }
    });

    UI.videoPlayer.addEventListener('play', () => {
        UI.playIcon.style.display = 'none';
        UI.pauseIcon.style.display = 'block';
    });

    UI.videoPlayer.addEventListener('pause', () => {
        UI.playIcon.style.display = 'block';
        UI.pauseIcon.style.display = 'none';
    });

    UI.videoPlayer.addEventListener('waiting', () => {
        UI.playerLoading.style.display = 'flex';
    });

    UI.videoPlayer.addEventListener('playing', () => {
        UI.playerLoading.style.display = 'none';
    });

    UI.videoPlayer.addEventListener('timeupdate', () => {
        const video = UI.videoPlayer;
        const progress = (video.currentTime / video.duration) * 100;
        UI.progressBar.style.width = `${progress}%`;
        UI.currentTime.textContent = formatTime(video.currentTime);
        UI.duration.textContent = formatTime(video.duration);

        if (video.buffered.length > 0) {
            const buffered = (video.buffered.end(video.buffered.length - 1) / video.duration) * 100;
            UI.bufferedBar.style.width = `${buffered}%`;
        }
    });

    document.querySelector('.progress-bar').addEventListener('click', (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        UI.videoPlayer.currentTime = percent * UI.videoPlayer.duration;
    });

    UI.muteBtn.addEventListener('click', () => {
        UI.videoPlayer.muted = !UI.videoPlayer.muted;
        UI.volumeIcon.style.display = UI.videoPlayer.muted ? 'none' : 'block';
        UI.mutedIcon.style.display = UI.videoPlayer.muted ? 'block' : 'none';
        UI.volumeSlider.value = UI.videoPlayer.muted ? 0 : UI.videoPlayer.volume;
    });

    UI.volumeSlider.addEventListener('input', (e) => {
        const value = parseFloat(e.target.value);
        UI.videoPlayer.volume = value;
        UI.videoPlayer.muted = value === 0;
        UI.volumeIcon.style.display = value === 0 ? 'none' : 'block';
        UI.mutedIcon.style.display = value === 0 ? 'block' : 'none';
    });

    UI.fullscreenBtn.addEventListener('click', () => {
        const container = document.querySelector('.player-wrapper');
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            container.requestFullscreen();
        }
    });

    UI.retryBtn.addEventListener('click', () => {
        const currentUrl = UI.videoPlayer.src || UI.videoPlayer.currentSrc;
        if (currentUrl) {
            UI.playerError.style.display = 'none';
            initPlayer(currentUrl, UI.liveBadge.style.display !== 'none');
        }
    });

    // Audio track menu
    UI.audioBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTrackMenu(UI.audioMenu);
        updateAudioTracks();
    });

    // Subtitle menu
    UI.subtitleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleTrackMenu(UI.subtitleMenu);
        updateSubtitleTracks();
    });

    // Close track menus when clicking outside
    document.addEventListener('click', () => {
        document.querySelectorAll('.track-menu').forEach(m => m.classList.remove('active'));
    });

    // Prevent menu close when clicking inside menu
    UI.audioMenu.addEventListener('click', (e) => e.stopPropagation());
    UI.subtitleMenu.addEventListener('click', (e) => e.stopPropagation());

    // Series modal
    UI.closeSeries.addEventListener('click', () => {
        UI.seriesModal.classList.remove('active');
    });

    // Close modals on escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (UI.playerModal.classList.contains('active')) {
                closePlayerModal();
            } else if (UI.seriesModal.classList.contains('active')) {
                UI.seriesModal.classList.remove('active');
            }
        }
    });

    // Close modals on backdrop click
    UI.playerModal.addEventListener('click', (e) => {
        if (e.target === UI.playerModal) {
            closePlayerModal();
        }
    });

    UI.seriesModal.addEventListener('click', (e) => {
        if (e.target === UI.seriesModal) {
            UI.seriesModal.classList.remove('active');
        }
    });
}

// ========================================
// Initialization
// ========================================

async function init() {
    // Load configuration first
    await loadConfig();

    setupEventListeners();

    // Check for saved session
    if (Storage.load()) {
        Views.showScreen('dashboard-screen');
        Views.updateUserInfo();
        loadSection('live');
    } else {
        Views.showScreen('login-screen');
    }

    // Hide loading screen
    setTimeout(() => {
        UI.loadingScreen.classList.add('hidden');
    }, 500);
}

// Start app
document.addEventListener('DOMContentLoaded', init);

