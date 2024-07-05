import express from 'express';
import axios from 'axios';
import cors from 'cors';

const app = express();

// Enable CORS for all routes
app.use(cors());

// Middleware to parse JSON bodies
app.use(express.json());

const getSpotifyToken = async () => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    params.append('client_id', 'b1b924bc6e044b118d4cbd4dbc4bb90e');  // Replace with your client ID
    params.append('client_secret', '12ce5e2eaca9443daf2b4a7f5de4cf2f');  // Replace with your client secret

    const response = await axios.post(
        'https://accounts.spotify.com/api/token',
        params,
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    );
    const { access_token } = response.data;
    return access_token;
};

let spotifyToken;

const initializeToken = async () => {
    spotifyToken = await getSpotifyToken();
};

initializeToken();

const searchArtist = async (name) => {
    if (!spotifyToken) {
        spotifyToken = await getSpotifyToken();
    }
    const response = await axios.get(`https://api.spotify.com/v1/search`, {
        headers: {
            'Authorization': `Bearer ${spotifyToken}`
        },
        params: {
            q: name,
            type: 'artist',
            limit: 1
        }
    });
    return response.data.artists.items[0];
};

const getArtistTopTracks = async (artistId) => {
    if (!spotifyToken) {
        spotifyToken = await getSpotifyToken();
    }
    const response = await axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks`, {
        headers: {
            'Authorization': `Bearer ${spotifyToken}`
        },
        params: {
            market: 'US'  // Adjust based on your requirements
        }
    });
    return response.data.tracks;
};

app.get('/artist', async (req, res) => {
    const artistName = req.query.name;
    if (!artistName) {
        return res.status(400).json({ message: 'Artist name is required' });
    }

    try {
        const artist = await searchArtist(artistName);
        if (!artist) {
            return res.status(404).json({ message: 'Artist not found' });
        }
        const topTracks = await getArtistTopTracks(artist.id);
        res.json({ artist, topTracks });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching data' });
    }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
