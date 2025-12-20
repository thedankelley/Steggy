# Steggy Container Format Specification

Version: 1
Status: Stable

Steggy embeds data into image pixel LSBs using a structured container format.
All operations occur client-side and offline.

---

## Header

Each embedded fragment begins with the following header:

| Field | Size | Description |
|------|-----|-------------|
| Magic | 4 bytes | ASCII "STEG" |
| Version | 1 byte | Container version |
| Flags | 1 byte | Bit flags (decoy, encrypted, fragmented) |
| Fragment Index | 1 byte | Zero-based index |
| Fragment Count | 1 byte | Total fragments |
| Payload Length | 2 bytes | Length of fragment payload |

---

## Payload

Payload contents depend on selected modes:

- Plaintext
- AES-GCM encrypted data
- PGP encrypted data
- AES → PGP combined

Payload is binary-safe and opaque to the container.

---

## Integrity

Each fragment ends with:

| Field | Size |
|------|------|
| CRC32 | 4 bytes |

CRC covers header + payload.

---

## Decoy Payloads

Decoy payloads:
- Use identical container format
- Are flagged via header bit
- Are embedded at different offsets
- Are extractable without keys

---

## Failure States

- Missing fragments → extraction fails
- CRC mismatch → corruption warning
- Unsupported version → hard failure

---

## Security Notes

Steggy does not claim undetectability.
It prioritizes:
- Obfuscation
- Plausible deniability
- User-controlled threat modeling
