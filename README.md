# Steggy 1.6

Steggy is a client side steganography application designed for journalists, activists, researchers, and individuals operating under surveillance or censorship.

Steggy enables private information to be concealed inside ordinary PNG images without relying on servers, accounts, messaging platforms, or persistent communication channels.

All processing occurs locally on the user’s device.

---

## Design Philosophy

Most secure messaging systems focus on encrypting content. While effective, encrypted traffic itself often attracts scrutiny.

Steggy takes a different approach. Its primary goal is to hide the existence of communication entirely. Encryption is available, but optional and layered on top of steganography.

Steggy gives users direct control over how visible or hidden their communications are, rather than enforcing a single opaque workflow.

---

## Key Features

- Fully client side operation
- No servers, accounts, or telemetry
- Offline capable Progressive Web App
- PNG based steganography
- Decoy messages for plausible deniability
- AES GCM encryption
- Optional OpenPGP encryption
- Client side PGP key generation
- Metadata stripping via image re encoding
- Capacity calculation and safety warnings
- Corruption detection using CRC
- Clear failure states during extraction
- Mobile and desktop friendly interface

---

## Decoy and Protected Payloads

Steggy supports two independent payloads:

**Decoy Payload**
- Embedded sequentially
- Easily extractable
- Intended to appear legitimate
- Provides plausible deniability

**Protected Payload**
- Embedded using keyed scatter
- Optional AES and PGP encryption
- Requires explicit knowledge to extract
- Integrity verified via CRC

These payloads do not overlap and do not leak information about each other.

---

## Threat Model

Steggy is designed to protect against:

- Casual inspection
- Automated scanning
- Unsophisticated extraction attempts
- Opportunistic surveillance

Steggy does not protect against:

- Targeted forensic analysis
- Adversaries with prior knowledge of the tool
- Adversaries with access to correct keys and sufficient resources

Users should understand their risk environment before relying on Steggy in high risk situations.

---

## Metadata Considerations

By default, Steggy re encodes images using the browser canvas, which removes EXIF metadata such as camera model, timestamps, and GPS location.

This behavior improves anonymity but may slightly alter the image. Users should consider whether preserving metadata is appropriate for their situation.

---

## App Store and Play Store Compatibility

Steggy:
- Performs no background tracking
- Communicates with no external servers
- Does not collect personal data
- Operates transparently and predictably

It is suitable for distribution as a Progressive Web App or wrapped store application.

---

## License

See LICENSE.md
