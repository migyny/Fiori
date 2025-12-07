document.addEventListener("DOMContentLoaded", () => {
  const cart = JSON.parse(localStorage.getItem("fioriCart")) || [];
  const summaryContainer = document.getElementById("checkout-summary");
  const subtotalAmount = document.getElementById("subtotal-amount");
  const totalAmount = document.getElementById("total-amount");
  const shippingEl = document.getElementById("shipping-amount");
  const successMessage = document.getElementById("success-message");
  const placeBtn = document.getElementById("place-order-btn");

  const SHIPPING_RATE = 7.99;
  const FREE_SHIPPING_THRESHOLD = 44.99;

  let currentSubtotal = 0;
  let currentShipping = 0;


//render cart info
function renderCart() {
  let subtotal = 0;
  summaryContainer.innerHTML = "";

  if (cart.length === 0) {
    summaryContainer.innerHTML = `<p>Your cart is empty.</p>`;
  } else {
    cart.forEach(item => {
      const price = typeof item.price === "string"
        ? parseFloat(item.price.replace(/[^0-9.-]+/g, "")) || 0
        : Number(item.price) || 0;
      const qty = item.quantity || 1;
      const lineTotal = price * qty;
      subtotal += lineTotal;

      const div = document.createElement("div");
      div.classList.add("summary-line");
      div.innerHTML = `<span>${item.name} × ${qty}</span><span>$${lineTotal.toFixed(2)}</span>`;
      summaryContainer.appendChild(div);
    });
  }

  //shipping
  const shipping = subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_RATE;
  currentSubtotal = subtotal;
  currentShipping = shipping;

  //tax
  const TAX_RATE = 0.08875; 
  const tax = subtotal * TAX_RATE;

  //update elements
  subtotalAmount.textContent = `$${subtotal.toFixed(2)}`;
  shippingEl.textContent = shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;

  const taxEl = document.getElementById("tax-amount");
  if (taxEl) taxEl.textContent = `$${tax.toFixed(2)}`;

  totalAmount.textContent = `$${(subtotal + shipping + tax).toFixed(2)}`;
}

renderCart();
  // show inline errors
  function showError(el, msg) {
    const err = document.createElement("p");
    err.className = "error-msg";
    err.textContent = msg;
    el.insertAdjacentElement("afterend", err);
  }

  //validate all fields
  function validateFields() {
    let valid = true;

    //remove previous errors
    document.querySelectorAll(".error-msg").forEach(e => e.remove());

    const fields = [
      { el: document.getElementById("full-name"), regex: /^[A-Za-z]{2,}(\s[A-Za-z]{2,})+$/, msg: "Enter a valid full name" },
      { el: document.getElementById("email"), regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, msg: "Enter a valid email" },
      { el: document.getElementById("phone"), regex: /^\d{10,15}$/, msg: "Enter a valid phone number" },
      { el: document.getElementById("street"), regex: /^\d+\s[A-Za-z]{2,}(\s[A-Za-z]+)*\s?(St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Ln|Lane|Dr|Drive|Ct|Court)\.?$/i
, msg: "Enter a valid street address" },
      { el: document.getElementById("city"), regex: /^.{2,}$/, msg: "Enter a valid city" },
      { el: document.getElementById("state"), regex: /^.{2,}$/, msg: "Enter a valid state" },
      { el: document.getElementById("postal"), regex: /^\d{5}$/, msg: "Enter a valid 5-digit postal code" },
      { el: document.getElementById("country"), regex: /^.{2,}$/, msg: "Enter a valid country" },
      { el: document.getElementById("card-name"), regex: /^[A-Za-z]{2,}(\s[A-Za-z]{2,})+$/, msg: "Enter a valid cardholder name" },
      { el: document.getElementById("card-number"), regex: /^\d{16}$/, msg: "Enter a valid 16-digit card number", clean: true },
      { el: document.getElementById("expiry"), regex: /^(0[1-9]|1[0-2])\/\d{2}$/, msg: "Enter expiration date MM/YY" },
      { el: document.getElementById("cvv"), regex: /^\d{3,4}$/, msg: "Enter a valid CVV" }
    ];

    fields.forEach(f => {
      if (!f.el) return;
      let value = f.el.value.trim();
      if (!value) {
        showError(f.el, "This field is required");
        valid = false;
        return;
      }
      if (f.clean) value = value.replace(/\s+/g, "");
      if (!f.regex.test(value)) {
        showError(f.el, f.msg);
        valid = false;
      }
    });

    return valid;
  }

  //place order
  placeBtn.addEventListener("click", e => {
    e.preventDefault();
    e.stopImmediatePropagation(); //stop other scripts

    //hide previous success
    successMessage.style.display = "none";

    //validate all fields
    if (!validateFields()) return; //stop if invalid

    //check user login
    const user = JSON.parse(localStorage.getItem("fioriUser"));
    if (!user) {
      const err = document.createElement("p");
      err.className = "error-msg";
      err.textContent = "Please log in to place an order.";
      placeBtn.insertAdjacentElement("beforebegin", err);
      return;
    }

    // check cart
    if (cart.length === 0) {
      alert("Your cart is empty");
      return;
    }

    //save order
    if (!user.orders) user.orders = [];
    user.orders.push({
      date: new Date().toISOString(),
      items: cart,
      total: currentSubtotal + currentShipping
    });
    localStorage.setItem("fioriUser", JSON.stringify(user));

    //clear cart
    localStorage.removeItem("fioriCart");
    renderCart();

    //show success message
    successMessage.style.display = "block";

  });

  document.addEventListener("input", e => {
    if (e.target.classList.contains("input-field")) {
      const next = e.target.nextElementSibling;
      if (next && next.classList.contains("error-msg")) next.remove();
    }
  });
});
