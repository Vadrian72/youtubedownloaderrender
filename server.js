const express = require('express');
const ytdl = require('ytdl-core');
const app = express();
// Render folosește variabila de mediu PORT. Dacă nu e setată, folosim 3000.
const port = process.env.PORT || 3000;

// Traseu simplu pentru verificare
app.get('/', (req, res) => {
    res.send('Aplicația de descărcare YouTube este funcțională. Folosește /download?url=<URL_YOUTUBE> pentru a descărca.');
});

// Traseul principal pentru descărcare
app.get('/download', async (req, res) => {
    const videoUrl = req.query.url;

    if (!videoUrl) {
        return res.status(400).send('❌ Vă rugăm să furnizați un URL valid al videoclipului YouTube în parametrul "url".');
    }

    try {
        // Verifică dacă URL-ul este valid
        if (!ytdl.validateURL(videoUrl)) {
            return res.status(400).send('❌ URL-ul YouTube nu este valid.');
        }

        // Obține informații despre video pentru a crea un nume de fișier
        const info = await ytdl.getInfo(videoUrl);
        // Curăță titlul pentru a fi un nume de fișier valid (fără caractere speciale)
        const sanitizedTitle = info.videoDetails.title.replace(/[^a-zA-Z0-9 ]/g, "").replace(/ /g, "_").substring(0, 50);
        const fileName = `${sanitizedTitle}.mp3`;

        // Setează header-ele pentru a forța descărcarea ca fișier MP3
        res.header('Content-Disposition', `attachment; filename="${fileName}"`);
        res.header('Content-Type', 'audio/mpeg');

        // Fluxul de descărcare: ia doar cel mai bun format audio și îl trimite direct
        ytdl(videoUrl, {
            filter: 'audioonly', // Extrage doar fluxul audio
            quality: 'highestaudio',
        }).pipe(res); // Trimite fluxul direct către răspunsul HTTP

    } catch (error) {
        console.error('Eroare la descărcare:', error.message);
        res.status(500).send(`❌ A apărut o eroare la procesarea videoclipului: ${error.message}`);
    }
});

app.listen(port, () => {
    console.log(`Serverul rulează pe portul ${port}`);
});
