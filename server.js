//load the 'express' module which makes writing webservers easy
const express = require("express");
const app = express();
// add facility to convert body from a json string into a javascript object automatically.
app.use(express.json());

const albumsData = [
  {
    albumId: 10,
    artistName: "Beyoncé",
    collectionName: "Lemonade",
    artworkUrl100:
      "http://is1.mzstatic.com/image/thumb/Music20/v4/23/c1/9e/23c19e53-783f-ae47-7212-03cc9998bd84/source/100x100bb.jpg",
    releaseDate: "2016-04-25T07:00:00Z",
    primaryGenreName: "Pop",
    url: "https://www.youtube.com/embed/PeonBmeFR8o?rel=0&amp;controls=0&amp;showinfo=0",
  },
  {
    albumId: 11,
    artistName: "Billy Joel",
    collectionName: "Dangerously In Love",
    artworkUrl100:
      "http://is1.mzstatic.com/image/thumb/Music/v4/18/93/6d/18936d85-8f6b-7597-87ef-62c4c5211298/source/100x100bb.jpg",
    releaseDate: "2003-06-24T07:00:00Z",
    primaryGenreName: "Pop",
    url: "https://www.youtube.com/embed/ViwtNLUqkMY?rel=0&amp;controls=0&amp;showinfo=0",
  },
];

let nextId =
  1 +
  albumsData.reduce((n, album) => (n < album.albumId ? album.albumId : n), 0);

// home endpoint to show server is responding.
app.get("/", function (request, response) {
  response.send("hello Express world!");
});

// fetch all albums, or just those matching a search criteria.
// dealing with search criteria can get much more complicated than this.
app.get("/albums", function (req, res) {
  if (req.query.artistName) {
    const albums = albumsData.filter(
      (a) => a.artistName === req.query.artistName
    );
    if (albums.length === 0) {
      res.sendStatus(404);
      return;
    }
    res.send(albums);
    return;
  }
  res.send(albumsData);
});

// fetch a single albums info.
// uses express to capture the id on the endpoint url into its request object's params object.
app.get("/albums/:id", function (req, res) {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    res.sendStatus(400);
    return;
  }
  const album = albumsData.find((a) => a.albumId === id);
  if (!album) {
    res.sendStatus(404);
    return;
  }
  res.send(album);
});

const compulsoryFields = [
  "artistName",
  "collectionName",
  "releaseDate",
  "primaryGenreName",
];
const allFields = compulsoryFields.concat(["artworkUrl100", "url"]);
// Add a new album.
// First ensures all compulsory fields are present.
// Then build the new album info, starting with the id field which we get from nextId (and then increment it).
// Then ensures only valid fieldnames are included.
// Could do far more validation.
// For instance, an empty string is currently allowed for artistName.
// Returns the added entry. A common feature, but not always the case.
app.post("/albums", function (req, res) {
  if (!compulsoryFields.every((cf) => req.body.hasOwnProperty(cf))) {
    res.status(401).send("Not all compulsory fields supplied");
    return;
  }
  // ...
  const newEntry = { albumId: nextId++ };
  allFields.forEach((fld) => {
    if (req.body[fld]) {
      newEntry[fld] = req.body[fld];
    }
  });
  albumsData.push(newEntry);

  res.send(albumsData);
});

// Delete an album.
// Gets the id via the req.params object.
// Returns the deleted entry. A common feature, but not always the case.
app.delete("/albums/:id", (req, res) => {
  const albumId = parseInt(req.params.id);
  if (isNaN(albumId)) {
    res.sendStatus(400);
    return;
  }
  const album = albumsData.find((a) => a.albumId === albumId);
  if (!album) {
    res.sendStatus(404);
    return;
  }
  const index = albumsData.findIndex((a) => a.albumId === albumId);
  albumsData.splice(index, 1);
  res.send(album);
});

// Update an album
// Use a combination of the work used in adding and fetching a single album.
// Returns both the original and the updated versions of the album. Again common but not ubiquitous.
app.put("/albums/:id", function (req, res) {
  const albumId = parseInt(req.params.id);
  if (isNaN(albumId)) {
    res.sendStatus(400);
    return;
  }
  const album = albumsData.find((a) => a.albumId === albumId);
  if (!album) {
    res.sendStatus(404);
    return;
  }
  if (!compulsoryFields.every((cf) => req.body[cf])) {
    res.status(401).send("Not all compulsory fields supplied");
    return;
  }
  // ...
  const updatedEntry = { albumId: albumId };
  allFields.forEach((fld) => {
    if (req.body[fld]) {
      updatedEntry[fld] = req.body[fld];
    }
  });

  updatedEntry = { ...album, ...req.body };

  const index = albumsData.findIndex((a) => a.albumId === albumId);
  albumsData[index] = updatedEntry;

  res.send([album, updatedEntry]);
});

// Start our server so that it listens for HTTP requests!
// Keen readers will note I've changed this to the proper way of
// reporting the server is successfully listening.
const port = process.env.PORT || 3004;
app.listen(port, () => {
  console.log(`listening on port : ${port}`);
});
