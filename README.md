# Steggy ステギー

**Created by Dan**

Steggy is a client-side web application for hiding and retrieving data inside images. It is designed to be a practical, portable tool that supports multiple steganography methods and optional encryption. The entire app runs in the user's browser. No files are uploaded to a server.

## Purpose and rationale

Steggy is intended to provide a simple but flexible framework for obfuscating information inside images while giving users explicit control over the layers of protection they apply. It is not a messaging platform in the sense of threaded, synchronous encrypted chat. Instead, Steggy offers building blocks that a user can combine to protect discrete pieces of information:

- optional AES-GCM encryption of the payload, derived from a password
- multiple embedding strategies, including least significant bit embedding and PNG custom chunk insertion
- a keyed LSB option that permutes bit locations using a password
- an append mode that stores a payload in a visible but practical way

The intended audience includes journalists, researchers, human rights defenders, and others who may need alternative methods for privately exchanging information when centralized services are risky or not appropriate. Steggy gives users the ability to choose how to balance secrecy, robustness, and convenience.

## Important safety notes

- Steggy is a tool that gives you control over how data is embedded and encrypted. It does not remove the need for operational security. Choosing the right method and good passwords matters.
- LSB embedding is fragile. Using lossless PNG images increases the chance of successful recovery. Avoid lossy recompression if you require robustness.
- PNG custom chunk insertion is more standards based and retains payloads inside the file. Some image editors or services may strip unknown chunks.
- Appended payloads are easy to find by inspecting the file or the data URL.
- AES-GCM provides strong confidentiality for the payload content. Use a strong password. If an attacker has the carrier image and learns the password, confidentiality is lost.
- For high risk scenarios, consult security experts and consider additional operational protections.

## Features

- Encrypt and decrypt modes.
- Multiple algorithms:
  - LSB embedding (RGB or RGBA).
  - Keyed LSB using a password to permute bit locations.
  - Append payload appended to the image data URL.
  - PNG custom chunk insertion using a custom chunk named `stEG`.
- Optional AES-GCM encryption with PBKDF2 derived key.
- Auto-detect mode for decryption.
- Decrypted payload preview in the browser for text or common image formats.
- Mobile friendly and installable as a web app.
- Single file `index.html` for easy deployment.

## Basic usage

1. Open `index.html` in a modern browser or host it on static hosting such as GitHub Pages.
2. Choose Encrypt or Decrypt mode.
3. For encryption:
   - Load a carrier image.
   - Provide text or a file to hide.
   - Optionally provide a password and enable AES to encrypt the payload.
   - Choose an algorithm and click Encrypt and Export.
4. For decryption:
   - Load the stego image.
   - Provide a password if needed.
   - Choose Auto or the specific algorithm used.
   - Click Decrypt. Decrypted text or images will appear inline if possible.

## Advanced settings

Open the Advanced settings area to:
- adjust the AES PBKDF2 iteration count
- plan for PGP support and key import in future releases
- review other settings that affect performance and security

Future releases may integrate PGP public and private key import so users can encrypt using recipient public keys and decrypt with their private keys. This will remain optional and fully client side. The plan is to place PGP features under Advanced settings.

## PGP feasibility summary

- PGP can be implemented client side using libraries such as OpenPGP.js.
- It is logical to combine PGP and steganography: PGP provides asymmetric key protection while steganography hides the ciphertext.
- PGP can be implemented without violating the client-side model when libraries and keys are loaded locally by the user.

## Install to Home Screen

- On Android, use the Install button when it appears, or the browser menu Add to Home screen. The stegosaurus icon will be used as the app icon.
- On iOS, tap Share then Add to Home Screen. The stegosaurus icon will be used.

## Deployment

Drop `index.html` and `README.md` into a GitHub repository and enable GitHub Pages from the repository settings. The single `index.html` file contains the full app.

## Operational security guidance

- Use strong, unique passwords for AES or keyed LSB.
- Avoid storing sensitive images or keys in public or synced cloud storage if you need plausible deniability.
- When sharing stego images, consider the distribution channel and metadata. Metadata can reveal origin.
- Remember that steganography hides the presence of a message but does not guarantee anonymity or deniability in all contexts.

## License and usage

This software is provided as-is for educational and personal use. Unauthorized use of software is forbidden. Redistribution without explicit permission is forbidden. Credit: Dan.

By using this software you agree not to use it for illegal activity. The author is not responsible for misuse.

## Acknowledgements

Created by Dan Kelley
