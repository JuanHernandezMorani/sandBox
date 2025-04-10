const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const inputImage = "PokemonTypes.png";
const outputDir = "output";

const types = [
  "bug", "dark", "dragon", "electric", "fairy", "fighting",
  "fire", "flying", "ghost", "grass", "ground", "ice",
  "normal", "poison", "psychic", "rock", "steel", "water"
];

const columns = 6;
const rows = 3;

(async () => {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir);
  }

  const metadata = await sharp(inputImage).metadata();
  const tileWidth = Math.floor(metadata.width / columns);
  const tileHeight = Math.floor(metadata.height / rows);

  let index = 0;

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const left = col * tileWidth;
      const top = row * tileHeight;

      const typeName = types[index];
      const outputPath = path.join(outputDir, `${typeName}.png`);

      await sharp(inputImage)
        .extract({ left, top, width: tileWidth, height: tileHeight })
        .toFile(outputPath);

      console.log(`✅ Guardado: ${typeName}.png`);
      index++;
    }
  }

  console.log("🎉 ¡Todos los íconos fueron recortados correctamente!");
})();