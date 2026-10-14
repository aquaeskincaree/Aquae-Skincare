function seleccionarFundacion(element, causa) {
    document.querySelectorAll('.ngo-card').forEach(card => card.classList.remove('selected'));
    element.classList.add('selected');
    const summaryNGO = document.getElementById('summaryNGO');
    if (summaryNGO) summaryNGO.innerText = causa;
}

function seleccionarMonto(monto, button) {
    document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    
    const customInput = document.getElementById('customAmount');
    if (customInput) customInput.value = '';

    const summaryAmount = document.getElementById('summaryAmount');
    if (summaryAmount) summaryAmount.innerText = monto.toLocaleString('es-CO');
}

function actualizarMontoPersonalizado(valor) {
    if (valor && valor > 0) {
        document.querySelectorAll('.amount-btn').forEach(btn => btn.classList.remove('active'));
        const summaryAmount = document.getElementById('summaryAmount');
        if (summaryAmount) summaryAmount.innerText = parseFloat(valor).toLocaleString('es-CO');
    }
}

document.addEventListener('DOMContentLoaded', () => {

    let cart = JSON.parse(localStorage.getItem('aquae_cart')) || [];

    const cartCountElement = document.getElementById('cart-count');
    const itemsContainer = document.getElementById('cart-items-container');
    const itemsMobileContainer = document.getElementById('cart-items-mobile');
    const subtotalElement = document.getElementById('cart-subtotal');
    const totalElement = document.getElementById('cart-total');
    const btnClearCart = document.getElementById('btn-clear-cart');
    const btnCheckout = document.getElementById('btn-checkout');

    function updateCart() {
        localStorage.setItem('aquae_cart', JSON.stringify(cart));
        renderCartCount();
        renderCartPage();
        updateCheckoutLink();
    }

    function renderCartCount() {
        if (!cartCountElement) return;
        const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
        cartCountElement.textContent = totalItems;
    }

    const addButtons = document.querySelectorAll('.btn-add-cart');
    addButtons.forEach(button => {
        button.addEventListener('click', () => {
            const id = button.getAttribute('data-id');
            const title = button.getAttribute('data-title');
            const price = parseFloat(button.getAttribute('data-price'));
            const img = button.getAttribute('data-img');

            const existingIndex = cart.findIndex(item => item.id === id);

            if (existingIndex > -1) {
                cart[existingIndex].quantity += 1;
            } else {
                cart.push({ id, title, price, img, quantity: 1 });
            }

            updateCart();

            const originalText = button.textContent;
            button.textContent = '¡AÑADIDO!';
            button.classList.replace('btn-dark', 'btn-success');
            setTimeout(() => {
                button.textContent = originalText;
                button.classList.replace('btn-success', 'btn-dark');
            }, 1000);
        });
    });

    function renderCartPage() {
        if (!itemsContainer) return;

        itemsContainer.innerHTML = '';
        if (itemsMobileContainer) itemsMobileContainer.innerHTML = '';

        if (cart.length === 0) {
            itemsContainer.innerHTML = `
                <tr>
                    <td colspan="5" class="text-center py-5">
                        <p class="fs-5 text-muted mb-3">Tu carrito está vacío.</p>
                        <a href="productos.html" class="btn btn-outline-dark btn-sm">Explorar Productos</a>
                    </td>
                </tr>`;
            
            if (itemsMobileContainer) {
                itemsMobileContainer.innerHTML = `
                    <div class="text-center py-5">
                        <p class="fs-5 text-muted mb-3">Tu carrito está vacío.</p>
                        <a href="productos.html" class="btn btn-outline-dark btn-sm">Explorar Productos</a>
                    </div>`;
            }

            if (subtotalElement) subtotalElement.textContent = '$0 COP';
            if (totalElement) totalElement.textContent = '$0 COP';
            return;
        }

        let subtotal = 0;

        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;

            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>
                    <div class="d-flex align-items-center gap-3">
                        <img src="${item.img}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover;" class="rounded">
                        <span class="fw-medium">${item.title}</span>
                    </div>
                </td>
                <td>$${item.price.toLocaleString('es-CO')} COP</td>
                <td class="text-center">
                    <div class="d-inline-flex align-items-center border rounded">
                        <button class="btn btn-sm btn-light border-0 px-2 btn-decrease" data-id="${item.id}">-</button>
                        <span class="px-3 fw-bold">${item.quantity}</span>
                        <button class="btn btn-sm btn-light border-0 px-2 btn-increase" data-id="${item.id}">+</button>
                    </div>
                </td>
                <td class="text-end fw-bold">$${itemTotal.toLocaleString('es-CO')} COP</td>
                <td class="text-end">
                    <button class="btn btn-sm text-danger border-0 btn-remove" data-id="${item.id}">✕</button>
                </td>
            `;
            itemsContainer.appendChild(tr);

            if (itemsMobileContainer) {
                const mobCard = document.createElement('div');
                mobCard.className = 'card p-3 shadow-sm border-0 d-flex flex-row align-items-center justify-content-between gap-3 mb-2';
                mobCard.innerHTML = `
                    <img src="${item.img}" alt="${item.title}" style="width: 60px; height: 60px; object-fit: cover;" class="rounded">
                    <div class="flex-grow-1">
                        <h6 class="mb-1 fw-bold">${item.title}</h6>
                        <small class="text-muted">$${item.price.toLocaleString('es-CO')} COP</small>
                    </div>
                    <div class="d-flex align-items-center gap-2">
                        <button class="btn btn-sm btn-outline-secondary btn-decrease" data-id="${item.id}">-</button>
                        <span class="fw-bold px-1">${item.quantity}</span>
                        <button class="btn btn-sm btn-outline-secondary btn-increase" data-id="${item.id}">+</button>
                    </div>
                    <button class="btn btn-sm text-danger border-0 p-0 btn-remove" data-id="${item.id}">✕</button>
                `;
                itemsMobileContainer.appendChild(mobCard);
            }
        });

        if (subtotalElement) subtotalElement.textContent = `$${subtotal.toLocaleString('es-CO')} COP`;
        if (totalElement) totalElement.textContent = `$${subtotal.toLocaleString('es-CO')} COP`;

        document.querySelectorAll('.btn-increase').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const product = cart.find(p => p.id === id);
                if (product) product.quantity += 1;
                updateCart();
            });
        });

        document.querySelectorAll('.btn-decrease').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                const product = cart.find(p => p.id === id);
                if (product && product.quantity > 1) {
                    product.quantity -= 1;
                } else {
                    cart = cart.filter(p => p.id !== id);
                }
                updateCart();
            });
        });

        document.querySelectorAll('.btn-remove').forEach(btn => {
            btn.addEventListener('click', () => {
                const id = btn.getAttribute('data-id');
                cart = cart.filter(p => p.id !== id);
                updateCart();
            });
        });
    }

    if (btnClearCart) {
        btnClearCart.addEventListener('click', () => {
            cart = [];
            updateCart();
        });
    }

    function updateCheckoutLink() {
        if (!btnCheckout) return;

        if (cart.length === 0) {
            btnCheckout.setAttribute('href', 'javascript:void(0);');
            return;
        }

        const nombre = document.getElementById('cliente-nombre')?.value.trim() || 'No especificado';
        const email = document.getElementById('cliente-email')?.value.trim() || 'No especificado';
        const documento = document.getElementById('cliente-documento')?.value.trim() || 'No especificado';

        let mensaje = "¡Hola! 👋 Gracias por contactar a Aqüae. Hemos recibido tu pedido y en un instante te atenderemos para finalizar el pago.\n\n";
        mensaje += `Detalle del pedido:\n`;
        
        let total = 0;

        cart.forEach(item => {
            const sub = item.price * item.quantity;
            total += sub;
            mensaje += `- ${item.title} x${item.quantity} - $${sub.toLocaleString('es-CO')} COP\n`;
        });

        mensaje += `\nTotal a pagar: $${total.toLocaleString('es-CO')} COP\n\n`;
        mensaje += `Datos del cliente:\n`;
        mensaje += `• Nombre: ${nombre}\n`;
        mensaje += `• Correo: ${email}\n`;
        mensaje += `• Documento: ${documento}\n`;
        
        const linkWhatsApp = `https://api.whatsapp.com/send?phone=573204483562&text=${encodeURIComponent(mensaje)}`;
        btnCheckout.setAttribute('href', linkWhatsApp);
    }

    ['cliente-nombre', 'cliente-email', 'cliente-documento'].forEach(id => {
        const input = document.getElementById(id);
        if (input) {
            input.addEventListener('input', updateCheckoutLink);
        }
    });

    if (btnCheckout) {
        btnCheckout.addEventListener('click', (e) => {
            if (cart.length === 0) {
                e.preventDefault();
                alert('Tu carrito está vacío. Agrega productos antes de proceder al pago.');
                return;
            }

            const nombre = document.getElementById('cliente-nombre')?.value.trim();
            const email = document.getElementById('cliente-email')?.value.trim();
            const documento = document.getElementById('cliente-documento')?.value.trim();

            if (!nombre || !email || !documento) {
                e.preventDefault();
                alert('Por favor completa tu nombre, correo y documento de identidad antes de proceder al pago.');
            }
        });
    }

    const donationForm = document.getElementById('donationForm');
    if (donationForm) {
        donationForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nombre = document.getElementById('donorName')?.value.trim();
            const email = document.getElementById('donorEmail')?.value.trim();
            const documento = document.getElementById('donorDocument')?.value.trim();
            const causa = document.getElementById('summaryNGO')?.innerText.trim();
            const monto = document.getElementById('summaryAmount')?.innerText.trim();

            const numeroTelefono = "573204483562";

            const mensaje = `¡Holaa! Gracias por contactar a Aqüae. Hemos recibido tu mensaje y en un momento te respondemos para proceder con tu donación.\n\n` +
                            `Detalles de la Donación:\n` +
                            `Causa: ${causa}\n` +
                            `Monto a Donar: $${monto} COP\n\n` +
                            `Datos del Donante:\n` +
                            `• Nombre: ${nombre}\n` +
                            `• Correo: ${email}\n` +
                            `• Documento: ${documento}`;

            const urlWhatsapp = `https://api.whatsapp.com/send?phone=${numeroTelefono}&text=${encodeURIComponent(mensaje)}`;
            window.open(urlWhatsapp, '_blank');
        });
    }

    const btnAbrirBuscar = document.getElementById('btn-abrir-buscar');
    const closeSearchBtn = document.getElementById('closeSearchBtn');
    const searchBarTop = document.getElementById('searchBarTop');
    const searchInput = document.getElementById('searchInput');

    if (btnAbrirBuscar && searchBarTop) {
        btnAbrirBuscar.addEventListener('click', (e) => {
            e.preventDefault();
            searchBarTop.classList.toggle('d-none');
            searchBarTop.classList.toggle('active');

            if (searchInput && !searchBarTop.classList.contains('d-none')) {
                setTimeout(() => searchInput.focus(), 100);
            }
        });
    }

    if (closeSearchBtn && searchBarTop) {
        closeSearchBtn.addEventListener('click', () => {
            searchBarTop.classList.add('d-none');
            searchBarTop.classList.remove('active');
        });
    }

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && searchBarTop && !searchBarTop.classList.contains('d-none')) {
            searchBarTop.classList.add('d-none');
            searchBarTop.classList.remove('active');
        }
    });

    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();
            const productCards = document.querySelectorAll('.product-item, .product-card');

            productCards.forEach(card => {
                const title = card.querySelector('.product-title, .card-title')?.textContent.toLowerCase() || '';
                const subtitle = card.querySelector('.product-subtitle, .card-text')?.textContent.toLowerCase() || '';

                const container = card.closest('.col, .col-12, .col-md-4, .col-lg-3') || card;

                if (title.includes(query) || subtitle.includes(query)) {
                    container.style.display = '';
                } else {
                    container.style.display = 'none';
                }
            });
        });
    }

    const categoryButtons = document.querySelectorAll('.btn-category-filter');
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                categoryButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');

                const category = btn.getAttribute('data-category');
                const products = document.querySelectorAll('.product-item, .product-card');

                products.forEach(product => {
                    const productCategory = product.getAttribute('data-category');
                    const container = product.closest('.col, .col-12, .col-md-4, .col-lg-3') || product;

                    if (category === 'all' || productCategory === category) {
                        container.style.display = '';
                    } else {
                        container.style.display = 'none';
                    }
                });
            });
        });
    }

    renderCartCount();
    renderCartPage();
    updateCheckoutLink();

});