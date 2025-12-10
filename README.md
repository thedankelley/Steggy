# Steggy
Experimental Steganography Web App


# Steggy ステギー

**Created by Dan**

Steggy is a client-side web application that provides a simple, portable framework for hiding data inside images. It is designed as a privacy tool that makes it easier to embed short messages or small files into images using multiple steganography methods, and to retrieve those hidden objects in the browser. All processing is completed in the user's browser; no files are uploaded to a server.

## Goals

Steggy aims to create a practical, easy to use framework for embedding and extracting data while balancing usability, portability, and security. The target users include journalists, researchers, and other people who may need accessible tools to protect sensitive communications. The project focuses on:

- Ease of use: a clean, mobile friendly user interface that runs in a modern browser.
- Portability: a single, self contained HTML file that can be deployed to static hosting like GitHub Pages.
- Optional strong confidentiality: AES-GCM encryption with password based key derivation is available when confidentiality is required.
- Multiple embedding options: LSB, keyed LSB, payload append, and a PNG custom chunk insertion method.
- Safety design: operations happen locally in the browser so payloads do not leave the user device.

This project is intended to help people exchange information under difficult circumstances while reducing technical friction. Users should evaluate the risks in their own context, and use strong passwords when enabling encryption.

## Features

- Encrypt and decrypt modes.
- Multiple algorithms:
  - LSB embedding (RGB or RGBA).
  - Keyed LSB using a password to permute bit locations.
  - Append payload to image data URL with a clear signature.
  - PNG custom chunk insertion using a custom chunk named `stEG`.
- Optional AES-GCM encryption of the payload protected by a password using PBKDF2 key derivation.
- Auto detect mode for decrypting without knowing which algorithm was used.
- Decrypted payloads are previewed in the browser if they are text or a standard image (PNG, JPEG, GIF).
- Mobile friendly download flow for iOS and Android.
- Single file `index.html` so the app can be hosted on static services.

## How to use

1. Open `index.html` in a modern browser or host it on GitHub Pages.
2. Choose Encrypt or Decrypt mode.
3. For encryption:
   - Load a carrier image.
   - Provide payload text or choose a payload file.
   - Optionally provide a password and enable AES to encrypt the payload before embedding.
   - Choose an embedding algorithm and click Encrypt and Export.
4. For decryption:
   - Load the stego image.
   - If the payload was AES encrypted, provide the correct password.
   - Choose Auto to let the app try all supported methods, or choose a specific algorithm.
   - Click Decrypt. If the payload is text or an image format supported by browsers, it will be shown inline.

## Security notes

- LSB embedding is fragile to recompression and format changes. Use lossless PNG carriers if you need robustness.
- Appended payloads are easy to find by inspecting the file or the data URL. PNG chunk insertion is more standards based and more robust than append, but some image processing tools may remove unknown chunks.
- AES-GCM is available to protect the payload contents. When using AES, choose a strong password and keep it safe. If an attacker has the carrier image and knows or can guess the password, confidentiality is lost.
- This tool is educational and practical. It is not a full secure messaging system. For high risk use cases, consult security professionals.

## License and usage

This software is provided as-is for educational and personal use. Unauthorized use of software is forbidden. Redistribution without explicit permission is forbidden. Credit: Dan.

By using this software you agree not to use it for illegal activity. The author is not responsible for misuse.

## Deployment

Drop `index.html` and `README.md` into a GitHub repository and enable GitHub Pages from the repository settings on the branch you prefer. The single file `index.html` contains the full app.

## Acknowledgements

Created by Dan.
