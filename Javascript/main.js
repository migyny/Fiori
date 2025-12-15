document.addEventListener("DOMContentLoaded", () => {

  const accountBtn = document.getElementById("account-button");
  const accountText = document.getElementById("account-text");

  if (accountBtn && accountText) {
    const currentUser = JSON.parse(localStorage.getItem("fioriUser")); // use same key as checkout
    

    accountBtn.parentElement.addEventListener("click", () => {
      if (currentUser) {
        window.location.href = "../html/account.html";
      } else {
        window.location.href = "../html/sign_in.html";
      }
    });
  }

  // Note: Order button logic is handled in checkout.js to avoid duplicate handlers
});
