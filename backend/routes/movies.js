const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

const API_ENDPOINTS = {
  'watch-guide': 'https://api.jikan.moe/v4/seasons/2020/spring?sfw',
  'fan-favorites': 'https://api.jikan.moe/v4/seasons/upcoming',
  'top-picks': 'https://api.jikan.moe/v4/seasons/2024/spring?sfw',
  'most-popular': 'https://api.jikan.moe/v4/top/anime?type=ona',
  '2005-winter': 'https://api.jikan.moe/v4/seasons/2005/winter?sfw',
  'sunday-schedule': 'https://api.jikan.moe/v4/schedules/sunday?sfw',
  'upcoming': 'https://api.jikan.moe/v4/seasons/upcoming'
};

async function fetchAnimeData(url) {
  const response = await fetch(url, {
    headers: {
      accept: 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch anime from Jikan API');
  }
  const data = await response.json();
  return data.data.map(anime => ({
    id: anime.mal_id,
    title: anime.title,
    image: anime.images.jpg.image_url,
    rating: anime.score,
    description: anime.synopsis || '',
    trailerUrl: anime.trailer ? anime.trailer.url : ''
  }));
}

Object.entries(API_ENDPOINTS).forEach(([key, url]) => {
  router.get('/' + key, async (req, res) => {
    try {
      const animes = await fetchAnimeData(url);
      res.json(animes);
    } catch (error) {
      console.error(`Error fetching anime for ${key}:`, error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });
});

module.exports = router;
