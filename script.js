async function parseM3U8(url) {
    try {
        const proxyUrl = "https://cors-anywhere.herokuapp.com/";
        const fullUrl = proxyUrl + url;
        
        const response = await fetch(fullUrl);
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
