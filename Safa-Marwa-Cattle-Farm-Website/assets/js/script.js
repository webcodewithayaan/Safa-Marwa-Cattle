/* ============================================================
   SAFA MARWA CATTLE FARM — SHARED SCRIPT
   Theme toggle + Cart engine (persisted with localStorage)
   ============================================================ */

// ---------- THEME TOGGLE ----------
function applyStoredTheme() {
    const stored = localStorage.getItem('smcf_theme') || 'dark';
    document.documentElement.setAttribute('data-bs-theme', stored);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.setAttribute('class', stored === 'dark' ? 'bi bi-sun-fill fs-5' : 'bi bi-moon-stars-fill fs-5');
}

function toggleTheme() {
    const htmlElement = document.documentElement;
    const current = htmlElement.getAttribute('data-bs-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-bs-theme', next);
    localStorage.setItem('smcf_theme', next);
    const icon = document.getElementById('themeIcon');
    if (icon) icon.setAttribute('class', next === 'dark' ? 'bi bi-sun-fill fs-5' : 'bi bi-moon-stars-fill fs-5');
}

// ---------- CART ENGINE ----------
const CART_KEY = 'smcf_cart';

function getCart() {
    try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
    catch (e) { return []; }
}

function saveCart(cart) {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const count = cart.reduce((sum, item) => sum + item.qty, 0);
    document.querySelectorAll('#cart-count').forEach(el => el.innerText = count);
}

function isInCart(code) {
    return getCart().some(item => item.code === code);
}

function addToCart(code, name, price, img) {
    let cart = getCart();
    const existing = cart.find(item => item.code === code);
    if (existing) {
        existing.qty += 1;
    } else {
        cart.push({ code, name, price, img, qty: 1 });
    }
    saveCart(cart);
    refreshButtonStates();
    showToast(`"${name}" cart me add ho gaya hai.`);
}

function removeFromCart(code) {
    let cart = getCart().filter(item => item.code !== code);
    saveCart(cart);
    refreshButtonStates();
    if (typeof renderCartPage === 'function') renderCartPage();
}

function changeQty(code, delta) {
    let cart = getCart();
    const item = cart.find(i => i.code === code);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
        cart = cart.filter(i => i.code !== code);
    }
    saveCart(cart);
    if (typeof renderCartPage === 'function') renderCartPage();
}

// Toggle button UI between "Add to Cart" and "Remove" based on cart state
function refreshButtonStates() {
    document.querySelectorAll('[data-cart-btn]').forEach(btn => {
        const code = btn.getAttribute('data-code');
        const name = btn.getAttribute('data-name');
        const price = btn.getAttribute('data-price');
        const img = btn.getAttribute('data-img');
        if (isInCart(code)) {
            btn.innerText = 'Remove';
            btn.classList.add('added');
            btn.onclick = () => removeFromCart(code);
        } else {
            btn.innerText = 'Add to Cart';
            btn.classList.remove('added');
            btn.onclick = () => addToCart(code, name, price, img);
        }
    });
}

// Simple toast feedback (Bootstrap-independent, lightweight)
function showToast(message) {
    let toast = document.getElementById('smcf-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'smcf-toast';
        toast.style.cssText = 'position:fixed;bottom:24px;right:24px;z-index:3000;background:#dc3545;color:#fff;padding:14px 20px;border-radius:10px;box-shadow:0 8px 25px rgba(0,0,0,.4);font-weight:600;opacity:0;transition:opacity .3s ease;';
        document.body.appendChild(toast);
    }
    toast.innerText = message;
    toast.style.opacity = '1';
    clearTimeout(window._toastTimer);
    window._toastTimer = setTimeout(() => { toast.style.opacity = '0'; }, 2200);
}

// ---------- INIT ON EVERY PAGE ----------
document.addEventListener('DOMContentLoaded', () => {
    applyStoredTheme();
    updateCartBadge();
    refreshButtonStates();
});