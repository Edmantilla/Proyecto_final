/* admin.js - Admin Panel Logic for ANDREYLPZ */
(function () {
    'use strict';

    // ─── Simulated Initial Data ─────────────────────────────────────────────
    const DEFAULT_PRODUCTS = [
        { id: 1, name: "J'adore", brand: "Cristian Dior", price: 450000, stock: 12, category: "Mujer", image: "../assets/imagenes/J'adore Eau de Parfum.jpg" },
        { id: 2, name: "One Million", brand: "Paco Rabanne", price: 520000, stock: 8, category: "Hombre", image: "../assets/imagenes/1 million.png" },
        { id: 3, name: "Chance", brand: "Chanel", price: 480000, stock: 5, category: "Mujer", image: "../assets/imagenes/chance.webp" },
        { id: 4, name: "Erba Pura", brand: "Xerjoff", price: 750000, stock: 3, category: "Hombre", image: "../assets/imagenes/erba pura.webp" },
        { id: 5, name: "Invictus", brand: "Paco Rabanne", price: 490000, stock: 15, category: "Hombre", image: "../assets/imagenes/invictus.webp" },
        { id: 6, name: "Coco Mademoiselle", brand: "Chanel", price: 600000, stock: 7, category: "Mujer", image: "../assets/imagenes/coco mademoiselle.webp" },
    ];

    const DEFAULT_ORDERS = [
        { id: 1001, customer: "María García", product: "J'adore", total: 450000, date: "2026-02-15", status: "Entregado" },
        { id: 1002, customer: "Carlos Pérez", product: "One Million", total: 520000, date: "2026-02-16", status: "Procesando" },
        { id: 1003, customer: "Ana Martínez", product: "Chance", total: 480000, date: "2026-02-17", status: "Enviado" },
        { id: 1004, customer: "Luis Rodríguez", product: "Erba Pura", total: 750000, date: "2026-02-18", status: "Pendiente" },
        { id: 1005, customer: "Sofía López", product: "Invictus", total: 490000, date: "2026-02-19", status: "Procesando" },
        { id: 1006, customer: "Diego Silva", product: "Coco Mademoiselle", total: 600000, date: "2026-02-19", status: "Entregado" },
    ];

    const DEFAULT_USERS = [
        { id: 1, name: "María García", email: "maria@correo.com", orders: 3, joined: "2025-11-01", status: "Activo" },
        { id: 2, name: "Carlos Pérez", email: "carlos@correo.com", orders: 1, joined: "2026-01-15", status: "Activo" },
        { id: 3, name: "Ana Martínez", email: "ana@correo.com", orders: 5, joined: "2025-08-22", status: "Activo" },
        { id: 4, name: "Luis Rodríguez", email: "luis@correo.com", orders: 2, joined: "2026-02-01", status: "Inactivo" },
        { id: 5, name: "Sofía López", email: "sofia@correo.com", orders: 4, joined: "2025-12-10", status: "Activo" },
    ];

    // ─── localStorage helpers ───────────────────────────────────────────────
    function getData(key, defaults) {
        try {
            const stored = localStorage.getItem('admin_' + key);
            return stored ? JSON.parse(stored) : defaults;
        } catch { return defaults; }
    }

    function setData(key, value) {
        localStorage.setItem('admin_' + key, JSON.stringify(value));
    }

    function getProducts() { return getData('products', DEFAULT_PRODUCTS); }
    function setProducts(p) { setData('products', p); }
    function getOrders() { return getData('orders', DEFAULT_ORDERS); }
    function setOrders(o) { setData('orders', o); }
    function getUsers() { return getData('users', DEFAULT_USERS); }

    // ─── Section Navigation ─────────────────────────────────────────────────
    function navigate(sectionId) {
        document.querySelectorAll('.admin-section').forEach(s => s.classList.remove('active'));
        document.querySelectorAll('.admin-nav__item').forEach(i => i.classList.remove('active'));

        const section = document.getElementById('section-' + sectionId);
        const navItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (section) section.classList.add('active');
        if (navItem) navItem.classList.add('active');

        document.getElementById('topbar-title').textContent = navItem?.dataset.label || sectionId;

        // Re-render for freshness
        if (sectionId === 'dashboard') renderDashboard();
        if (sectionId === 'productos') renderProducts();
        if (sectionId === 'pedidos') renderOrders();
        if (sectionId === 'usuarios') renderUsers();

        // Close sidebar on mobile
        document.getElementById('adminSidebar')?.classList.remove('open');
    }

    // ─── Format helpers ─────────────────────────────────────────────────────
    function fmt(n) { return n.toLocaleString('es-CO') + ' COP'; }

    function statusBadge(status) {
        const map = {
            'Entregado': 'badge-success',
            'Enviado': 'badge-info',
            'Procesando': 'badge-warning',
            'Pendiente': 'badge-danger',
            'Activo': 'badge-success',
            'Inactivo': 'badge-danger',
        };
        return `<span class="badge ${map[status] || 'badge-info'}">${status}</span>`;
    }

    // ─── Dashboard ──────────────────────────────────────────────────────────
    function renderDashboard() {
        const products = getProducts();
        const orders = getOrders();
        const users = getUsers();
        const revenue = orders.filter(o => o.status === 'Entregado').reduce((s, o) => s + o.total, 0);

        document.getElementById('stat-revenue').textContent = fmt(revenue);
        document.getElementById('stat-products').textContent = products.length;
        document.getElementById('stat-orders').textContent = orders.length;
        document.getElementById('stat-users').textContent = users.length;

        // Recent orders (last 5)
        const recentTbody = document.getElementById('recent-orders-tbody');
        recentTbody.innerHTML = orders.slice(-5).reverse().map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.customer}</td>
                <td>${o.product}</td>
                <td>${fmt(o.total)}</td>
                <td>${statusBadge(o.status)}</td>
            </tr>`).join('');

        // Low stock
        const lowStock = products.filter(p => p.stock <= 5);
        const lowEl = document.getElementById('low-stock-list');
        lowEl.innerHTML = lowStock.length === 0
            ? '<p style="color:var(--admin-muted);font-size:0.85rem;">Sin alertas de stock</p>'
            : lowStock.map(p => `
                <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:1px solid var(--admin-border)">
                    <span>${p.name} - ${p.brand}</span>
                    <span class="badge ${p.stock === 0 ? 'badge-danger' : 'badge-warning'}">${p.stock} uds</span>
                </div>`).join('');
    }

    // ─── Products ───────────────────────────────────────────────────────────
    function renderProducts() {
        const products = getProducts();
        const tbody = document.getElementById('products-tbody');
        tbody.innerHTML = products.map(p => `
            <tr>
                <td><img class="product-img-sm" src="${p.image}" alt="" onerror="this.style.display='none'"></td>
                <td><strong>${p.name}</strong></td>
                <td>${p.brand}</td>
                <td>${p.category}</td>
                <td>${fmt(p.price)}</td>
                <td><span class="badge ${p.stock <= 5 ? 'badge-warning' : 'badge-success'}">${p.stock}</span></td>
                <td style="display:flex;gap:8px;padding-top:18px">
                    <button class="btn btn-secondary btn-sm" onclick="adminApp.editProduct(${p.id})">Editar</button>
                    <button class="btn btn-danger btn-sm" onclick="adminApp.deleteProduct(${p.id})">Eliminar</button>
                </td>
            </tr>`).join('');
    }

    // ─── Product Modal ──────────────────────────────────────────────────────
    let editingProductId = null;

    function openProductModal(product = null) {
        editingProductId = product ? product.id : null;
        document.getElementById('modal-product-title').textContent = product ? 'Editar Producto' : 'Agregar Producto';
        document.getElementById('prod-name').value = product?.name || '';
        document.getElementById('prod-brand').value = product?.brand || '';
        document.getElementById('prod-category').value = product?.category || 'Mujer';
        document.getElementById('prod-price').value = product?.price || '';
        document.getElementById('prod-stock').value = product?.stock || '';
        document.getElementById('prod-image').value = product?.image || '';
        document.getElementById('modal-product').classList.add('open');
    }

    function closeProductModal() {
        document.getElementById('modal-product').classList.remove('open');
        editingProductId = null;
    }

    function saveProduct() {
        const name = document.getElementById('prod-name').value.trim();
        const brand = document.getElementById('prod-brand').value.trim();
        const category = document.getElementById('prod-category').value;
        const price = parseInt(document.getElementById('prod-price').value, 10);
        const stock = parseInt(document.getElementById('prod-stock').value, 10);
        const image = document.getElementById('prod-image').value.trim();

        if (!name || !brand || isNaN(price) || isNaN(stock)) {
            alert('Por favor completa todos los campos requeridos.'); return;
        }

        const products = getProducts();
        if (editingProductId) {
            const idx = products.findIndex(p => p.id === editingProductId);
            if (idx !== -1) products[idx] = { ...products[idx], name, brand, category, price, stock, image };
        } else {
            const newId = Math.max(0, ...products.map(p => p.id)) + 1;
            products.push({ id: newId, name, brand, category, price, stock, image });
        }

        setProducts(products);
        renderProducts();
        renderDashboard();
        closeProductModal();
    }

    function deleteProduct(id) {
        if (!confirm('¿Eliminar este producto?')) return;
        const products = getProducts().filter(p => p.id !== id);
        setProducts(products);
        renderProducts();
        renderDashboard();
    }

    function editProduct(id) {
        const product = getProducts().find(p => p.id === id);
        if (product) openProductModal(product);
    }

    // ─── Orders ─────────────────────────────────────────────────────────────
    function renderOrders() {
        const orders = getOrders();
        const tbody = document.getElementById('orders-tbody');
        tbody.innerHTML = orders.map(o => `
            <tr>
                <td>#${o.id}</td>
                <td>${o.customer}</td>
                <td>${o.product}</td>
                <td>${fmt(o.total)}</td>
                <td>${o.date}</td>
                <td>
                    <select class="status-select" onchange="adminApp.changeOrderStatus(${o.id}, this.value)">
                        ${['Pendiente', 'Procesando', 'Enviado', 'Entregado'].map(s =>
            `<option value="${s}" ${o.status === s ? 'selected' : ''}>${s}</option>`
        ).join('')}
                    </select>
                </td>
            </tr>`).join('');
    }

    function changeOrderStatus(id, newStatus) {
        const orders = getOrders();
        const order = orders.find(o => o.id === id);
        if (order) { order.status = newStatus; setOrders(orders); renderDashboard(); }
    }

    // ─── Users ──────────────────────────────────────────────────────────────
    function renderUsers() {
        const users = getUsers();
        const tbody = document.getElementById('users-tbody');
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>#${u.id}</td>
                <td><strong>${u.name}</strong></td>
                <td>${u.email}</td>
                <td>${u.orders}</td>
                <td>${u.joined}</td>
                <td>${statusBadge(u.status)}</td>
            </tr>`).join('');
    }

    // ─── Event binding ──────────────────────────────────────────────────────
    function init() {
        // Nav items
        document.querySelectorAll('.admin-nav__item').forEach(item => {
            item.addEventListener('click', () => navigate(item.dataset.section));
        });

        // Hamburger
        document.getElementById('adminHamburger')?.addEventListener('click', () => {
            document.getElementById('adminSidebar')?.classList.toggle('open');
        });

        // Product modal
        document.getElementById('btn-add-product')?.addEventListener('click', () => openProductModal());
        document.getElementById('close-product-modal')?.addEventListener('click', closeProductModal);
        document.getElementById('modal-product')?.addEventListener('click', e => {
            if (e.target === document.getElementById('modal-product')) closeProductModal();
        });
        document.getElementById('save-product-btn')?.addEventListener('click', saveProduct);

        // Start on dashboard
        navigate('dashboard');
    }

    // ─── Public API ─────────────────────────────────────────────────────────
    window.adminApp = { editProduct, deleteProduct, changeOrderStatus };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
