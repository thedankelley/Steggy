import { SteggyCore } from "../core/steggy-core.js";
import { SteggyPGP } from "../modules/steggy-pgp.js";
import { SteggyFragment } from "../modules/steggy-fragment.js";
import { SteggyDecoy } from "../modules/steggy-decoy.js";
import { SteggyHash } from "../modules/steggy-hash.js";

const core = new SteggyCore({
  pgp: SteggyPGP,
  fragment: SteggyFragment,
  decoy: SteggyDecoy,
  aes: null
});

const mode = document.getElementById("mode");
const encryptSection = document.getElementById("encryptSection");
const decryptSection = document.getElementById("decryptSection");

mode.onchange = () => {
  encryptSection.hidden = mode.value !== "encrypt";
  decryptSection.hidden = mode.value !== "decrypt";
};

document.getElementById("advancedToggle").onclick = () => {
  const adv = document.getElementById("advancedOptions");
  adv.hidden = !adv.hidden;
};

const cryptoMode = document.getElementById("cryptoMode");
cryptoMode.onchange = () => {
  document.getElementById("aesOptions").hidden = cryptoMode.value === "pgp" || cryptoMode.value === "none";
  document.getElementById("pgpOptions").hidden = cryptoMode.value === "aes" || cryptoMode.value === "none";
};

document.getElementById("generatePGP").onclick = async () => {
  const { publicKey, privateKey } = await SteggyPGP.generateKeypair(
    "Steggy User", "user@steggy", ""
  );
  document.getElementById("pgpPublicKey").value = publicKey;
  document.getElementById("pgpPrivateKey").value = privateKey;
};

document.getElementById("encryptWithPGP").onclick = async () => {
  const msg = document.getElementById("protectedMessage").value;
  const pub = document.getElementById("pgpPublicKey").value;
  const enc = await SteggyPGP.encrypt(new TextEncoder().encode(msg), pub);
  document.getElementById("protectedMessage").value =
    new TextDecoder().decode(enc);
};

document.getElementById("runEncrypt").onclick = async () => {
  alert("Encrypt pipeline is wired and ready. Image embedding occurs in next step.");
};
