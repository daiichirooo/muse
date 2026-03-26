document.addEventListener('DOMContentLoaded', function() {
    const ITUNES_LOOKUP_URL = 'https://itunes.apple.com/lookup';


    const body = document.body;
    const albumContainer = document.querySelector('.album-container');
    const albumDetail = document.getElementById('albumDetail');
    const backBtn = document.getElementById('backBtn');


    const albumData = JSON.parse(sessionStorage.getItem('selectedAlbum') || 'null');
    const currentGenre = sessionStorage.getItem('currentGenre') || 'hits';





    const navDirection = sessionStorage.getItem('navDirection');
    if (navDirection === 'forward') {

        albumContainer.style.transform = 'translateX(100%)';
        albumContainer.style.opacity = '0';
        albumContainer.style.animation = 'none';
        albumContainer.style.transition = 'none';

        void albumContainer.offsetWidth;

        requestAnimationFrame(() => {

        albumContainer.style.animation = '';
        albumContainer.style.transition = '';
        albumContainer.style.opacity = '';
        albumContainer.classList.add('slide-in-right');
        });
    }

    sessionStorage.removeItem('navDirection');






    async function computeAverageColor(imgUrl) {
        return new Promise((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            const w = 48, h = 48;
            canvas.width = w;
            canvas.height = h;
            ctx.drawImage(img, 0, 0, w, h);
            const data = ctx.getImageData(0, 0, w, h).data;

            let r = 0, g = 0, b = 0, c = 0;
            for (let i = 0; i < data.length; i += 4) {
            const a = data[i + 3];
            if (a < 200) continue;
            r += data[i];
            g += data[i + 1];
            b += data[i + 2];
            c++;
            }
            if (c === 0) return resolve('#F4B400');
            r = Math.round(r / c);
            g = Math.round(g / c);
            b = Math.round(b / c);
            resolve(`rgb(${r}, ${g}, ${b})`);
        };
        img.onerror = () => resolve('#F4B400');
        img.src = imgUrl;
        });
    }
    

    async function fetchAlbumTracks(collectionId) {
        const url = new URL(ITUNES_LOOKUP_URL);
        url.searchParams.set('id', String(collectionId));
        url.searchParams.set('entity', 'song');
        url.searchParams.set('country', 'US');

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('iTunes lookup failed');
        const json = await res.json();

        const results = json?.results ?? [];
        const tracks = results
        .filter(r => r.wrapperType === 'track' && r.kind === 'song')
        .map(t => t.trackName);

        return tracks;
    }


    async function renderAlbumDetail(album) {
        if (!album) {
        albumDetail.innerHTML = '<div class="loading">Album not found. Please go back and try again.</div>';
        return;
        }


        const bgColor = await computeAverageColor(album.artwork);
        body.style.backgroundColor = bgColor;
        document.documentElement.style.setProperty('--bg-color', bgColor);


        const q = encodeURIComponent(`${album.name} ${album.artist}`);


        albumDetail.innerHTML = `
        <div class="album-left">
            <img class="album-cover" src="${album.artwork}" alt="${album.name} cover">
            <div class="streaming-links">
            <a href="${album.url || `https://music.apple.com/us/search?term=${q}`}" target="_blank" class="streaming-link apple" title="Apple Music">
                <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
            </a>
            <a href="https://open.spotify.com/search/${q}/albums" target="_blank" class="streaming-link spotify" title="Spotify">
                <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                </svg>
            </a>
            <a href="https://music.youtube.com/search?q=${q}" target="_blank" class="streaming-link youtube" title="YouTube Music">
                <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.376 0 0 5.376 0 12s5.376 12 12 12 12-5.376 12-12S18.624 0 12 0zm0 19.104c-3.924 0-7.104-3.18-7.104-7.104S8.076 4.896 12 4.896s7.104 3.18 7.104 7.104-3.18 7.104-7.104 7.104zm0-13.332c-3.432 0-6.228 2.796-6.228 6.228S8.568 18.228 12 18.228s6.228-2.796 6.228-6.228S15.432 5.772 12 5.772zM9.684 15.54V8.46L15.816 12l-6.132 3.54z"/>
                </svg>
            </a>
            </div>
        </div>
        <div class="album-right">
            <h1 class="album-title">${album.name}</h1>
            <p class="album-artist">${album.artist}</p>
            <ol class="track-list" id="trackList">
            <li><span class="track-name">Loading tracks...</span></li>
            </ol>
        </div>
        `;


        try {
        const tracks = await fetchAlbumTracks(album.id);
        const trackList = document.getElementById('trackList');
        
        if (tracks.length > 0) {
            trackList.innerHTML = tracks.map((track, i) => `
            <li>
                <span class="track-number">${i + 1}.</span>
                <span class="track-name">${track}</span>
            </li>
            `).join('');
        } else {
            trackList.innerHTML = '<li><span class="track-name">No track data available</span></li>';
        }
        } catch (err) {
        console.error('[v0] Error fetching tracks:', err);
        const trackList = document.getElementById('trackList');
        trackList.innerHTML = '<li><span class="track-name">Failed to load tracks</span></li>';
        }
    }


    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        sessionStorage.setItem('navDirection', 'back');
        albumContainer.classList.add('slide-out');
        setTimeout(() => {
        window.location.href = `songs.html?genre=${currentGenre}`;
        }, 600);
    });


    renderAlbumDetail(albumData);
});
