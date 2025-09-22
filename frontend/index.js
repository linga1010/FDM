// Optional JS: prevent multiple submissions and show loader
document
  .getElementById("personalityForm")
  .addEventListener("submit", function () {
    const btn = this.querySelector('button[type="submit"]');
    btn.innerText = "Predicting...";
    btn.disabled = true;
  });
