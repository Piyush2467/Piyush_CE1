const products = [
    {
        id: 1,
        name: "Wireless Headphones",
        category: "Electronics",
        price: 1499,
        image: "headphone.jpg"
    },
    {
        id: 2,
        name: "Smart Watch",
        category: "Electronics",
        price: 2299,
        image: "watch.jpg"
    },
    {
        id: 3,
        name: "Bluetooth Speaker",
        category: "Electronics",
        price: 999,
        image: "speaker.jpg"
    },
    {
        id: 4,
        name: "Casual Sneakers",
        category: "Fashion",
        price: 1799,
        image: "shoes.jpg"
    },
    {
        id: 5,
        name: "Classic Backpack",
        category: "Fashion",
        price: 899,
        image: "backpack.jpg"
    },
    {
        id: 6,
        name: "Cotton T-Shirt",
        category: "Fashion",
        price: 499,
        image: "tshirt.jpg"
    },
    {
        id: 7,
        name: "Desk Lamp",
        category: "Home",
        price: 699,
        image: "lamp.jpg"
    },
    {
        id: 8,
        name: "Coffee Mug Set",
        category: "Home",
        price: 399,
        image: "mug.jpg"
    },
    {
        id: 9,
        name: "Indoor Plant",
        category: "Home",
        price: 549,
        image: "plant.jpg"
    }
];

let cart = [];
let appliedCoupon = false;

const COUPON_CODE = "SAVE10";
const DELIVERY_FEE = 49;

const productGrid = document.getElementById("productGrid");
const cartItems = document.getElementById("cartItems");
const cartCount = document.getElementById("cartCount");

const searchInput = document.getElementById("searchInput");
const categoryFilter = document.getElementById("categoryFilter");
const sortSelect = document.getElementById("sortSelect");

function formatPrice(amount) {
    return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 2
    }).format(amount);
}

function photo(product) {
    return `
        <img
            src="${product.image}"
            alt="${product.name}"
            onerror="this.onerror=null;this.parentElement.innerHTML='Image not found';"
        >
    `;
}

function displayProducts() {
    const term = searchInput.value.trim().toLowerCase();
    const category = categoryFilter.value;
    const sort = sortSelect.value;

    let shown = products.filter(product => {
        const matchesName =
            product.name.toLowerCase().includes(term);

        const matchesCategory =
            category === "all" ||
            product.category === category;

        return matchesName && matchesCategory;
    });

    if (sort === "low") {
        shown.sort((a, b) => a.price - b.price);
    }

    if (sort === "high") {
        shown.sort((a, b) => b.price - a.price);
    }

    if (sort === "name") {
        shown.sort((a, b) =>
            a.name.localeCompare(b.name)
        );
    }

    document.getElementById("productCount").textContent =
        `${shown.length} products`;

    productGrid.innerHTML = shown.map(product => `
        <article class="product-card">

            <div class="product-image">
                ${photo(product)}
            </div>

            <p class="product-category">
                ${product.category}
            </p>

            <h3>${product.name}</h3>

            <div class="product-bottom">

                <span class="price">
                    ${formatPrice(product.price)}
                </span>

                <button
                    class="add-btn"
                    data-add="${product.id}"
                    type="button"
                >
                    Add to Cart
                </button>

            </div>

        </article>
    `).join("");

    document.getElementById("emptyProducts")
        .classList.toggle("hidden", shown.length !== 0);
}

function addToCart(id) {
    const existingItem = cart.find(item => item.id === id);

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            id: id,
            quantity: 1
        });
    }

    updateCart();
}

function changeQuantity(id, change) {
    const item = cart.find(item => item.id === id);

    if (!item) return;

    item.quantity += change;

    if (item.quantity <= 0) {
        removeFromCart(id);
        return;
    }

    updateCart();
}

function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    updateCart();
}

function calculateTotals() {
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(
            product => product.id === item.id
        );

        return sum + product.price * item.quantity;
    }, 0);

    const discount = appliedCoupon
        ? subtotal * 0.10
        : 0;

    const delivery = cart.length > 0
        ? DELIVERY_FEE
        : 0;

    const total = subtotal - discount + delivery;

    return {
        subtotal,
        discount,
        delivery,
        total
    };
}

function updateCart() {
    const totalItems = cart.reduce(
        (sum, item) => sum + item.quantity,
        0
    );

    cartCount.textContent = totalItems;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <p class="empty-cart">
                Your cart is empty.
            </p>
        `;

        appliedCoupon = false;

        document.getElementById("couponMessage").textContent =
            "Use SAVE10 to get 10% off.";

        document.getElementById("couponMessage").className =
            "message";

    } else {
        cartItems.innerHTML = cart.map(item => {
            const product = products.find(
                product => product.id === item.id
            );

            return `
                <div class="cart-item">

                    <div class="cart-item-image">
                        ${photo(product)}
                    </div>

                    <div>
                        <h4>${product.name}</h4>

                        <span class="cart-item-price">
                            ${formatPrice(product.price)} each
                        </span>

                        <div class="quantity-controls">

                            <button
                                data-minus="${product.id}"
                                type="button"
                            >-</button>

                            <span>${item.quantity}</span>

                            <button
                                data-plus="${product.id}"
                                type="button"
                            >+</button>

                        </div>
                    </div>

                    <div>
                        <strong>
                            ${formatPrice(product.price * item.quantity)}
                        </strong>

                        <br>

                        <button
                            class="remove-btn"
                            data-remove="${product.id}"
                            type="button"
                        >
                            Remove
                        </button>
                    </div>

                </div>
            `;
        }).join("");
    }

    const totals = calculateTotals();

    document.getElementById("subtotal").textContent =
        formatPrice(totals.subtotal);

    document.getElementById("discount").textContent =
        "-" + formatPrice(totals.discount);

    document.getElementById("delivery").textContent =
        formatPrice(totals.delivery);

    document.getElementById("total").textContent =
        formatPrice(totals.total);

    document.getElementById("modalTotal").textContent =
        formatPrice(totals.total);

    document.getElementById("checkoutBtn").disabled =
        cart.length === 0;
}

function applyCoupon() {
    const code = document.getElementById("couponInput")
        .value.trim().toUpperCase();

    const message = document.getElementById("couponMessage");

    if (cart.length === 0) {
        message.textContent =
            "Add a product before applying a coupon.";

        message.className = "message error";
        return;
    }

    if (code === COUPON_CODE) {
        appliedCoupon = true;

        message.textContent =
            "Coupon applied! You saved 10%.";

        message.className = "message success";

    } else {
        appliedCoupon = false;

        message.textContent =
            "Invalid coupon. Try SAVE10.";

        message.className = "message error";
    }

    updateCart();

    if (code !== COUPON_CODE) {
        message.textContent = "Invalid coupon. Try SAVE10.";
        message.className = "message error";
    }
}

function openCheckout() {
    if (cart.length === 0) return;

    document.getElementById("checkoutModal")
        .classList.remove("hidden");
}

function closeCheckout() {
    document.getElementById("checkoutModal")
        .classList.add("hidden");
}

function placeOrder(event) {
    event.preventDefault();

    if (cart.length === 0) return;

    const name = document.getElementById("customerName")
        .value.trim();

    const message = document.getElementById("checkoutMessage");

    message.textContent =
        `Thank you, ${name}! Your demo order has been placed.`;

    message.className = "message success";

    cart = [];
    appliedCoupon = false;

    document.getElementById("checkoutForm").reset();
    document.getElementById("couponInput").value = "";

    updateCart();
}

searchInput.addEventListener("input", displayProducts);
categoryFilter.addEventListener("change", displayProducts);
sortSelect.addEventListener("change", displayProducts);

productGrid.addEventListener("click", event => {
    const button = event.target.closest("[data-add]");

    if (button) {
        addToCart(Number(button.dataset.add));
    }
});

cartItems.addEventListener("click", event => {
    const plus = event.target.closest("[data-plus]");
    const minus = event.target.closest("[data-minus]");
    const remove = event.target.closest("[data-remove]");

    if (plus) {
        changeQuantity(Number(plus.dataset.plus), 1);
    }

    if (minus) {
        changeQuantity(Number(minus.dataset.minus), -1);
    }

    if (remove) {
        removeFromCart(Number(remove.dataset.remove));
    }
});

document.getElementById("applyCoupon")
    .addEventListener("click", applyCoupon);

document.getElementById("checkoutBtn")
    .addEventListener("click", openCheckout);

document.getElementById("closeModal")
    .addEventListener("click", closeCheckout);

document.getElementById("checkoutForm")
    .addEventListener("submit", placeOrder);

document.getElementById("cartShortcut")
    .addEventListener("click", () => {
        document.getElementById("cartPanel")
            .scrollIntoView({ behavior: "smooth" });
    });

document.getElementById("shopNow")
    .addEventListener("click", () => {
        document.getElementById("shopSection")
            .scrollIntoView({ behavior: "smooth" });
    });

displayProducts();
updateCart();