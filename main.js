document.addEventListener("DOMContentLoaded", () => {

  const accountBtn = document.getElementById("account-button");
  const accountText = document.getElementById("account-text");

  if (accountBtn && accountText) {
    const currentUser = JSON.parse(localStorage.getItem("fioriUser")); // use same key as checkout
    

    accountBtn.parentElement.addEventListener("click", () => {
      if (currentUser) {
        window.location.href = "account.html";
      } else {
        window.location.href = "sign_in.html";
      }
    });
  }

  //order button logic
  const placeOrderBtn = document.getElementById("place-order-btn");
  const successMessage = document.getElementById("success-message");

  if (placeOrderBtn && successMessage) {
    placeOrderBtn.addEventListener("click", () => {
      const fullName = document.getElementById("full-name")?.value;
      const email = document.getElementById("email")?.value;
      const street = document.getElementById("street")?.value;

      if (!fullName || !email || !street) {
        alert("Order Failed. Please fill in valid info.");
        return;
      }

      //show success message
      successMessage.style.display = "block";

      //clear cart
      localStorage.removeItem("fioriCart");

      //redirect to home page
      setTimeout(() => {
        window.location.href = "index.html";
      }, 1500);
    });
  }
});
