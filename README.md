# Steggy 1.9 | ステギー

Steggy is a client side steganography framework designed to give individuals meaningful control over how private information is concealed inside ordinary images.

Unlike conventional encrypted messaging platforms that rely on centralized infrastructure, Steggy operates entirely in the browser and focuses on concealment rather than conversation. This makes it suitable for journalists, researchers, activists, and individuals operating in environments where encrypted messaging alone may attract unwanted attention.

## Core Principles

- No server side processing
- No accounts
- No tracking
- No network dependency
- Full user control over concealment methods

## Features

- Image based steganography using pixel embedding and PNG chunk insertion
- Optional AES-GCM encryption
- Optional PGP encryption for text payloads
- Decoy messages to mislead adversarial extraction
- Metadata stripping to remove EXIF and identifying data
- Multi layer concealment strategies
- Threat model guidance surfaced directly in the interface
- Progressive Web App support for offline usage

## Intended Use

Steggy is not designed to replace messaging platforms such as Signal or WhatsApp.

Instead, it provides a flexible toolkit for embedding information inside benign media files, allowing users to choose how visible or concealed their communications should be depending on risk level.

This approach supports scenarios where encrypted traffic itself may be suspicious, and where alternative methods of private communication are necessary.

## Installation

Steggy can be used directly in the browser or installed as a Progressive Web App on supported platforms.

## License

See LICENSE.md for usage terms.
