document.addEventListener('DOMContentLoaded', function() {

    const urlParams = new URLSearchParams(window.location.search);
    const genre = urlParams.get('genre') || 'hits';


    const GENRE_CONFIG = {
        hits: { 
        label: 'Hits', 
        color: '#F4B400', 
        font: "'Inter', sans-serif",
        keywords: ['Top', 'Hits', 'Today', 'Pop']
        },
        pop: { 
        label: 'Pop', 
        color: '#FF6B9A', 
        font: "'Poppins', sans-serif",
        keywords: ['Pop']
        },
        rnb: { 
        label: 'R&B', 
        color: '#6A4C93', 
        font: "'Playfair Display', serif",
        keywords: ['R&B', 'R&B/Soul', 'Soul']
        },
        rap: { 
        label: 'Hiphop/Rap', 
        color: '#FF3B3B', 
        font: "'Bebas Neue', sans-serif",
        keywords: ['Hip-Hop', 'Hip-Hop/Rap', 'Rap']
        },
        kpop: { 
        label: 'K-pop', 
        color: '#00C2FF', 
        font: "'Space Grotesk', sans-serif",
        keywords: ['K-Pop', 'Kpop', 'Korean']
        }
    };

    const APPLE_RSS_URL = 'https://rss.applemarketingtools.com/api/v2/us/music/most-played/100/albums.json';
    const ITUNES_SEARCH_URL = 'https://itunes.apple.com/search';


    const body = document.body;
    const albumsStage = document.getElementById('albumsStage');
    const backBtn = document.getElementById('backBtn');
    const customCursor = document.getElementById('customCursor');
    const songsContainer = document.querySelector('.songs-container');






    const navDirection = sessionStorage.getItem('navDirection');

    if (navDirection !== 'back') {
        songsContainer.classList.add('slide-in-right');
    }

    sessionStorage.removeItem('navDirection');







    function applyGenreStyles(genreKey) {
        const config = GENRE_CONFIG[genreKey] || GENRE_CONFIG.hits;
        
        body.classList.add(`genre-${genreKey}`);
        document.documentElement.style.setProperty('--genre-color', config.color);
        document.documentElement.style.setProperty('--genre-font', config.font);
        body.style.backgroundColor = config.color;
        body.style.fontFamily = config.font;
    }


    async function fetchAppleRssAlbums() {
        const res = await fetch(APPLE_RSS_URL);
        if (!res.ok) throw new Error('Apple RSS fetch failed');
        const json = await res.json();
        
        return (json?.feed?.results ?? []).map(a => ({
        id: a.id,
        name: a.name,
        artist: a.artistName,
        artwork: a.artworkUrl100?.replace('100x100bb.jpg', '600x600bb.jpg') || a.artworkUrl100,
        url: a.url,
        genres: (a.genres ?? []).map(g => g.name)
        }));
    }


    async function searchItunesAlbums(term, limit = 30) {
        const url = new URL(ITUNES_SEARCH_URL);
        url.searchParams.set('term', term);
        url.searchParams.set('entity', 'album');
        url.searchParams.set('limit', String(limit));
        url.searchParams.set('country', 'US');

        const res = await fetch(url.toString());
        if (!res.ok) throw new Error('iTunes search failed');
        const json = await res.json();

        return (json?.results ?? []).map(a => ({
        id: String(a.collectionId),
        name: a.collectionName,
        artist: a.artistName,
        artwork: (a.artworkUrl100 || '').replace('100x100bb.jpg', '600x600bb.jpg'),
        url: a.collectionViewUrl,
        genres: a.primaryGenreName ? [a.primaryGenreName] : []
        }));
    }


    function matchesGenre(album, genreKey) {
        const config = GENRE_CONFIG[genreKey];
        if (!config) return true;
        
        const tags = (album.genres || []).join(' ').toLowerCase();
        return config.keywords.some(k => tags.includes(k.toLowerCase()));
    }


    async function loadAlbums(genreKey) {
        let albums = [];
        
        try {
        const rssAlbums = await fetchAppleRssAlbums();
        
        if (genreKey === 'hits') {
            albums = rssAlbums;
        } else {
            albums = rssAlbums.filter(a => matchesGenre(a, genreKey));
        }


        if (albums.length < 25) {
            const config = GENRE_CONFIG[genreKey];
            const term = config?.label || 'Music';
            const extra = await searchItunesAlbums(term, 35);
            albums = [...albums, ...extra];
        }
        } catch (err) {

        const config = GENRE_CONFIG[genreKey];
        const term = config?.label || 'Music';
        albums = await searchItunesAlbums(term, 35);
        }


        albums = albums
        .map(v => ({ v, r: Math.random() }))
        .sort((a, b) => a.r - b.r)
        .map(x => x.v)
        .slice(0, 25);

        return albums;
    }


    function renderAlbums(albums) {
        const loadingMessage = document.getElementById('loadingMessage');
        if (loadingMessage) {
        loadingMessage.style.display = 'none';
        }

        const sizes = ['size-lg', 'size-md', 'size-sm'];

        for (let i = 0; i < 25; i++) {
        const albumDiv = document.getElementById(`album-${i + 1}`);
        if (!albumDiv) continue;

        const album = albums[i];
        if (!album) {
            albumDiv.style.display = 'none';
            continue;
        }

        const sizeClass = sizes[i % 3];
        albumDiv.className = `album-item ${sizeClass}`;
        albumDiv.dataset.albumId = album.id;
        albumDiv.dataset.artwork = album.artwork;
        albumDiv.dataset.albumData = JSON.stringify(album);


        const albumName = document.createElement('a');
        albumName.className = 'album-name';
        albumName.href = '#';
        albumName.textContent = album.name;


        const artistName = document.createElement('span');
        artistName.className = 'artist-name';
        artistName.textContent = album.artist;


        albumDiv.innerHTML = '';
        albumDiv.appendChild(albumName);
        albumDiv.appendChild(artistName);


        albumDiv.addEventListener('mouseenter', () => {
            customCursor.style.backgroundImage = `url(${album.artwork})`;
            customCursor.classList.add('visible');
        });

        albumDiv.addEventListener('mouseleave', () => {
            customCursor.classList.remove('visible');
        });


        albumName.addEventListener('click', (e) => {
            e.preventDefault();
            

            sessionStorage.setItem('selectedAlbum', JSON.stringify(album));
            sessionStorage.setItem('currentGenre', genre);
            
            





            sessionStorage.setItem('navDirection', 'forward');









            songsContainer.classList.add('slide-out-right');
            
            setTimeout(() => {
            window.location.href = `album.html?id=${album.id}`;
            }, 600);
        });
        }
    }


    document.addEventListener('mousemove', (e) => {
        customCursor.style.left = e.clientX + 'px';
        customCursor.style.top = e.clientY + 'px';
    });


    backBtn.addEventListener('click', (e) => {
        e.preventDefault();
        songsContainer.classList.add('slide-out-left');
        setTimeout(() => {
        window.location.href = 'menu.html';
        }, 600);
    });


    applyGenreStyles(genre);
    
    loadAlbums(genre).then(albums => {
        renderAlbums(albums);
    }).catch(err => {
        console.error('[v0] Error loading albums:', err);
        albumsStage.innerHTML = '<div class="loading">Failed to load albums. Please try again.</div>';
    });
});
