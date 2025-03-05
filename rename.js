const fs = require('fs');
const path = require('path');

// Specify the directory containing the images
const directoryPath = './assets/MD_images'; // Change this to your folder path

// Function to rename files
fs.readdir(directoryPath, (err, files) => {
  if (err) {
    console.log('Unable to scan directory: ' + err);
    return;
  }

  files.forEach((file, index) => {
    const fileExtension = path.extname(file).toLowerCase();

    // Check if the file is an image (optional: you can add more extensions like .png, .gif, etc.)
    if (['.jpg', '.jpeg', '.png', '.gif'].includes(fileExtension)) {
      
      // Create a new name for the file (e.g., prepend the index number)
      const newFileName = `${file.slice(file.search(/_\d\d\d\d+/)+1)}`;
      //const newFileName = `${file}.png`;
      const oldFilePath = path.join(directoryPath, file);
      const newFilePath = path.join(directoryPath, newFileName);

      // Rename the file
      fs.rename(oldFilePath, newFilePath, (renameErr) => {
        if (renameErr) {
          console.log('Error renaming file:', renameErr);
        } else {
          console.log(`Renamed: ${file} -> ${newFileName}`);
        }
      });
    }
  });
});