async function parseM3U8(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.split('\n');
        const channels = [];
        let currentChannel = {};

        lines.forEach(line => {
            if (line.startsWith('#EXTINF')) {
                const nameMatch = line.match(/tvg-name="(.*?)"/);
                const titleMatch = line.match(/, (.*)/);
                currentChannel = {
                    name: nameMatch ? nameMatch[1] : titleMatch ? titleMatch[1] : "Unknown",
                    url: ''
                };
            } else if (line.startsWith('http')) {
                currentChannel.url = line.trim();
                channels.push(currentChannel);
                currentChannel = {};
            }
        });

        return channels;
    } catch (error) {
        console.error('Error fetching or parsing playlist:', error);
        return [];
    }
}

document.getElementById('parseBtn').addEventListener('click', async () => {
    const url = document.getElementById('playlistUrl').value;
    if (!url) {
        alert('Please enter a valid M3U8 URL.');
        return;
    }

    const channels = await parseM3U8(url);

    const channelsDiv = document.getElementById('channels');
    channelsDiv.innerHTML = '';

    if (channels.length === 0) {
        channelsDiv.innerHTML = '<p>No channels found or failed to parse.</p>';
        return;
    }

    channels.forEach(channel => {
        const channelDiv = document.createElement('div');
        channelDiv.innerHTML = `
            <strong>${channel.name}</strong><br>
            <button class="playBtn" data-url="${channel.url}">Play</button>
            <hr>
        `;
        channelsDiv.appendChild(channelDiv);
    });

    document.querySelectorAll('.playBtn').forEach(button => {
        button.addEventListener('click', (e) => playStream(e.target.getAttribute('data-url')));
    });
});

function playStream(url) {
    const video = document.getElementById('videoPlayer');
    const playerContainer = document.getElementById('playerContainer');

    if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(url);
        hls.attachMedia(video);
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
    }

    playerContainer.style.display = 'flex';
    video.play();
}

document.getElementById('closePlayer').addEventListener('click', () => {
    const playerContainer = document.getElementById('playerContainer');
    const video = document.getElementById('videoPlayer');

    playerContainer.style.display = 'none';
    video.pause();
    video.src = "";
});
