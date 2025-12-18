# Steggy 2.0 (ステギー)

## WANRING: Software is currently in alpha state. This project will not receive an official release until the initial roadmap is fully implemented. Please use this software at your own risk.

Steggy is a client-side, offline-first steganographic framework for embedding structured data into image files using explicit, auditable techniques.

Steggy is designed for journalists, researchers, human rights workers, and technologists who require **direct control over how information is hidden, transported, and recovered**, especially in constrained or hostile environments.

Steggy is not a messaging app. It is a toolkit.

---

## Core Principles

- Fully client-side execution
- Offline-first operation
- No servers, accounts, or telemetry
- Explicit threat model
- Modular, auditable design
- Honest documentation of limitations

Steggy avoids security theater and does not claim anonymity, undetectability, or deniability.

---

## What Steggy Is

- A steganographic container framework
- A controlled data-hiding tool
- A research platform for resilient communication
- A composable system that layers optional cryptography

---

## What Steggy Is Not

- A secure messaging platform
- A replacement for Signal, Tor, or encrypted email
- A tool that protects against device compromise
- A system that guarantees safety under all conditions

---

## Features

### Steganography
- Least-significant-bit (LSB) image embedding
- Explicit capacity calculation and warnings
- Corruption detection via CRC32
- Clear and hard failure states

### Cryptography
- Optional AES-GCM encryption
- Optional OpenPGP payload encryption
- No custom cryptographic primitives
- User-controlled keys and passwords

### Advanced Capabilities
- Decoy payload embedding
- Multi-image payload fragmentation
- SHA-256 hashing of inputs and outputs
- Explicit SSTV emergency transport module

### Operational Safety
- Threat model visible in documentation
- No silent fallback behavior
- No network access required after load
- Offline-safe by design

---

## Threat Model Summary

Steggy is designed to resist:
- Casual inspection of image files
- Opportunistic interception
- Automated scanning without original images

Steggy does not defend against:
- Compromised endpoints
- Advanced forensic analysis
- Access to original cover images
- Behavioral or traffic analysis

See `/security-review/THREAT_MODEL.md` for full details.

---

## Encryption Model

Encryption layers are optional and composable:

1. Optional OpenPGP encryption
2. Optional AES-GCM encryption
3. Steganographic embedding

Decryption reverses this order.

Steggy does not implement custom cryptography.

---

## Decoy Payloads

Steggy supports optional decoy payloads designed to be:
- Easily extractable
- Non-protective by design
- Separate from protected payloads

This allows plausible disclosure under coercive inspection.

---

## Fragmentation

Payloads may be split across multiple images.

Fragmentation:
- Occurs before embedding
- Uses explicit fragment metadata
- Requires all fragments for recovery

---

## SSTV Emergency Transport

Steggy includes an optional SSTV module that can generate audio signals from images.

This feature:
- Is explicitly observable
- Provides no confidentiality
- Exists for emergency or infrastructure-failure scenarios
- Is never enabled automatically

---

## Test Vectors

The `/test-vectors` directory contains reproducible inputs and SHA-256 hashes.

These allow:
- External verification
- Regression detection
- Independent review

---

## Ethical Use Statement

Steggy is intended to support freedom of expression, research, and human rights work.

Users are responsible for understanding the risks and legal context in which they operate.

The authors make no claim that Steggy is safe in all environments.

---

## License

See `LICENSE.md`.

---
