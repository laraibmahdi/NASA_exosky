const express = require("express");

const cors = require("cors");

const { exec } = require("child_process");

const path = require("path");

const fetch = (...args) =>
  import("node-fetch").then(({ default: fetch }) => fetch(...args));

const xml2js = require("xml2js");

const app = express();

const PORT = process.env.PORT || 3000;
app.use(cors());
app.use(express.json());
app.use(express.static("exoskyUI"));

// Handle the root route

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "exoskyUI", "index.html"));
});

app.post("/api/run-script", async (req, res) => {
  const { ra_exo, dec_exo } = req.body;

  // Ensure the parameters are provided

  if (ra_exo === undefined || dec_exo === undefined) {
    return res

      .status(400)

      .send("Missing parameters: ra_exo, dec_exo are required.");
  }
});

app.get("/index.html", (req, res) => {
  const filePath = path.join(__dirname, "exoskyUI", "index.html");

  res.sendFile(filePath, (err) => {
    if (err) {
      console.error("Error sending file:", err);

      res.status(err.status).end();
    }
  });
});

app.get("/api/star-data", async (req, res) => {
  const { ra, dec } = req.query;

  if (!ra || !dec) {
    return res

      .status(400)

      .json({ error: "RA and Dec are required parameters" });
  }

  try {
    // Convert RA and Dec to numbers

    const raNum = parseFloat(ra);

    const decNum = parseFloat(dec);

    // Define the search radius (in degrees)

    const radius = 1;

    // Construct the Gaia archive query

    const query = `

      SELECT TOP 1000 source_id, ra, dec, phot_g_mean_mag, parallax

      FROM gaiadr3.gaia_source

      WHERE 1=CONTAINS(POINT('ICRS', ra, dec), CIRCLE('ICRS', ${raNum}, ${decNum}, ${radius}))

      AND phot_g_mean_mag < 15

      ORDER BY phot_g_mean_mag ASC

     `;

    const gaiaUrl = `https://gea.esac.esa.int/tap-server/tap/sync?request=doQuery&lang=ADQL&format=json&query=${query}`;

    console.log("Fetching data from:", gaiaUrl);

    const response = await fetch(gaiaUrl);

    const responseText = await response.text();

    if (!response.ok) {
      if (response.headers.get("content-type").includes("application/xml")) {
        const parser = new xml2js.Parser();

        const result = await parser.parseStringPromise(responseText);

        const errorMessage = result.VOTABLE.RESOURCE[0].INFO[0]._;

        throw new Error(`Gaia API XML error: ${errorMessage}`);
      } else {
        console.error("Gaia API error response:", responseText);

        throw new Error(`Gaia API responded with status: ${response.status}`);
      }
    }

    const data = JSON.parse(responseText);

    if (!data.data || !Array.isArray(data.data)) {
      console.error("Unexpected data structure:", data);
      throw new Error("Unexpected data structure from Gaia API");
    }

    // Process the data

    const starData = data.data.map((star) => ({
      ra: star[1],

      dec: star[2],

      brightness: 20 - star[3], // Invert magnitude scale for brightness

      distance: star[4] > 0 ? 1000 / star[4] : null, // Convert parallax to distance in parsecs
    }));

    res.json(starData);
  } catch (error) {
    console.error("Error fetching star data:", error);

    res

      .status(500)

      .json({ error: "Failed to fetch star data", details: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
