Cryptographic Design

Steggy relies exclusively on standard, well-reviewed cryptographic primitives.

Encryption Layers

Steggy may apply encryption before embedding:
	•	AES-GCM (256-bit)
	•	Optional OpenPGP encryption using OpenPGP.js

No custom cryptographic algorithms are implemented.

Key Derivation
	•	Password-based encryption uses PBKDF2
	•	SHA-256 hash
	•	High iteration count to mitigate brute-force attacks

Integrity Checking
	•	CRC32 is used for corruption detection
	•	CRC32 is not a cryptographic authentication mechanism
	•	Integrity failures result in explicit errors

Explicit Non-Claims

Steggy does not claim:
	•	Forward secrecy
	•	Deniability
	•	Resistance to cryptographic downgrade attacks
	•	Resistance to traffic analysis

Cryptography is used strictly to protect payload confidentiality after extraction.
