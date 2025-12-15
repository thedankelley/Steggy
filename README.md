# Steggy 1.7

Steggy is a client side steganography application designed to help journalists, activists, researchers, and individuals operating under surveillance or censorship communicate discreetly.

Unlike conventional encrypted messengers, Steggy focuses on hiding the existence of communication itself. Messages are concealed inside ordinary PNG images, allowing information to move through common channels without drawing attention.

All processing occurs locally on the user’s device. Steggy has no servers, accounts, telemetry, or external dependencies beyond the browser runtime.

---

## Core Principles

- Client side only
- No network communication
- No automatic key storage
- No background activity
- Explicit user control at every step

Steggy prioritizes transparency and informed use over convenience.

---

## Features

### Steganography
- PNG image based data hiding
- Capacity calculation and safety warnings
- Payload headers and corruption detection
- CRC verification during extraction
- Separate decoy and protected payloads
- Clear extraction failure states

### Encryption
- Optional AES GCM encryption
- Optional OpenPGP encryption
- Protected payload only
- Decoy payload never encrypted

### OpenPGP Support
- Client side key pair generation
- Public key encryption
- Private key decryption with passphrase support
- Public and private key export
- No automatic key persistence

### Metadata Handling
- Image re encoding via canvas
- Metadata stripped by default
- Optional metadata preservation

### User Experience
- Mobile and desktop friendly
- Light and dark mode
- Advanced settings isolated and collapsed by default
- Explicit threat model surfaced in app

### Offline Capability
- Progressive Web App compatible
- Works without network access once loaded

---

## Decoy and Protected Payloads

Steggy supports two independent payloads inside a single image.

### Decoy Payload
- Extractable using basic techniques
- Intended to appear legitimate
- Provides plausible deniability

### Protected Payload
- Requires specific knowledge to extract
- May be encrypted with AES and or OpenPGP
- Integrity verified before display

The presence of a decoy does not reveal the existence of a protected payload.

---

## Threat Model

Steggy is designed to protect against:
- Casual inspection
- Opportunistic surveillance
- Automated scanning
- Unsophisticated extraction attempts

Steggy does not protect against:
- Targeted forensic analysis
- Adversaries with prior knowledge of the tool
- Adversaries with correct keys and sufficient resources

Users should understand their threat environment and should not rely on any single technique for safety.

---

## Appropriate Use

Steggy is intended for lawful and ethical use, including:
- Journalism
- Human rights documentation
- Secure research communication
- Personal privacy protection

Users are responsible for complying with applicable laws in their jurisdiction.

---

## Security Notes

- Private keys should be stored securely and offline when possible
- Loss of a private key makes protected payloads unrecoverable
- Using encryption may increase suspicion in some threat environments
- Steganography effectiveness depends on image choice and context

---

## License

See LICENSE.md
