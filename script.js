document.addEventListener('DOMContentLoaded', () => {
    const input = document.getElementById('input-field');
    const button = document.getElementById('button');
    const responseCardBody = document.querySelector('.response-card-body');

    button.addEventListener('click', async () => {
        const artistName = input.value;
        if (!artistName) {
            responseCardBody.innerHTML = `<p>Please enter an artist name</p>`;
            return;
        }
        try {
            const response = await fetch(`http://localhost:3000/artist?name=${encodeURIComponent(artistName)}`);
            if (response.ok) {
                const data = await response.json();
                const artist = data.artist;
                const topTracks = data.topTracks.slice(0, 5);

                responseCardBody.innerHTML = `
                    <h5>${artist.name}</h5>
                    <img src="${artist.images[0].url}" alt="${artist.name}" style="width: 200px;">
                    <p>Followers: ${artist.followers.total}</p>
                    <p>Genres: ${artist.genres.join(', ')}</p>
                    <h6>Top 5 Songs:</h6>
                    <ul>
                        ${topTracks.map(track => `<li>${track.name}</li>`).join('')}
                    </ul>
                `;
            } else {
                responseCardBody.innerHTML = `<p>Error fetching artist data</p>`;
            }
        } catch (error) {
            responseCardBody.innerHTML = `<p>Error: ${error.message}</p>`;
        }
    });
});
