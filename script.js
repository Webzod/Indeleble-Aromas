// ════════════════════════════════════════════
// ⚙️ CONFIGURACIÓN Y UTILIDADES
// ════════════════════════════════════════════
const WHATSAPP_NUMBER = "5491123456789"; 
const isTouchDevice = () => {
    return (('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0));
};

document.addEventListener('DOMContentLoaded', () => {

    // ════════════════════════════════════════════
    // 🌎 0. DETECCIÓN DE DISPOSITIVO/SO PARA EL SELECT DE PAÍSES
    //    - Celular / Mac / Linux / Windows 11 (Chrome-Edge) → bandera emoji
    //    - Windows 10, o Windows sin soporte de detección fina (Firefox) → texto "Abr +Código País"
    // ════════════════════════════════════════════
    (function setupCountrySelectDisplay() {
        const countrySelect = document.getElementById('checkoutCountryCode');
        if (!countrySelect) return;

        const options = Array.from(countrySelect.options);

        const renderAsFlag = () => {
            options.forEach(opt => {
                opt.textContent = opt.getAttribute('data-flag');
            });
        };

        const renderAsText = () => {
            options.forEach(opt => {
                const [code, countryName] = opt.value.split('|');
                const abbr = opt.getAttribute('data-abbr');
                opt.textContent = `${abbr} ${code} ${countryName}`;
            });
        };

        const ua = navigator.userAgent;
        const isMobile = /Android|iPhone|iPad|iPod/i.test(ua);
        const isWindows = /Windows NT/i.test(ua);
        const isMac = /Macintosh|Mac OS X/i.test(ua);
        const isLinux = /Linux/i.test(ua) && !isMobile;

        // Celular, Mac o Linux: siempre bandera (traen fuente de emoji completa)
        if (isMobile || isMac || isLinux) {
            renderAsFlag();
            return;
        }

        if (isWindows) {
            // Por defecto, en Windows arrancamos en modo texto (más seguro,
            // cubre Windows 10 y cualquier navegador que no soporte la
            // detección fina de versión, como Firefox).
            renderAsText();

            // Si el navegador soporta User-Agent Client Hints (Chrome/Edge),
            // podemos afinar y saber si realmente es Windows 11.
            // Chromium reporta platformVersion con major >= 13 para Windows 11.
            if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
                navigator.userAgentData.getHighEntropyValues(['platformVersion'])
                    .then(info => {
                        if (info.platform === 'Windows' && info.platformVersion) {
                            const majorVersion = parseInt(info.platformVersion.split('.')[0], 10);
                            if (majorVersion >= 13) {
                                renderAsFlag(); // Es Windows 11 → mostrar bandera
                            }
                            // Si es menor a 13 (Windows 10), se queda en modo texto.
                        }
                    })
                    .catch(() => {
                        // Si falla la detección, se queda en modo texto (seguro).
                    });
            }
            return;
        }

        // Cualquier otro caso no contemplado: modo texto por seguridad.
        renderAsText();
    })();

    // 1. LOADER & PÉTALOS CSS EN LOADER
    const loader = document.getElementById('loader');
    const loaderPetals = document.querySelector('.falling-petals-loader');
    
    // Crear pétalos para el loader
    for(let i=0; i<15; i++) {
        let petal = document.createElement('div');
        petal.style.position = 'absolute';
        petal.style.width = Math.random() * 15 + 10 + 'px';
        petal.style.height = petal.style.width;
        petal.style.background = Math.random() > 0.5 ? '#E8A0B0' : '#74C69D';
        petal.style.borderRadius = '15px 0 15px 0';
        petal.style.left = Math.random() * 100 + 'vw';
        petal.style.animation = `petalFall ${Math.random() * 2 + 1}s linear infinite`;
        loaderPetals.appendChild(petal);
    }

    setTimeout(() => {
        loader.style.opacity = '0';
        setTimeout(() => loader.style.display = 'none', 500);
    }, 2000);

    // 2. PÉTALOS FLOTANTES HERO
    const heroPetals = document.getElementById('heroPetals');
    for(let i=0; i<25; i++) {
        let petal = document.createElement('div');
        petal.style.position = 'absolute';
        petal.style.width = Math.random() * 20 + 10 + 'px';
        petal.style.height = petal.style.width;
        petal.style.background = Math.random() > 0.5 ? 'rgba(232, 160, 176, 0.6)' : 'rgba(255, 255, 255, 0.6)';
        petal.style.borderRadius = '15px 0 15px 0';
        petal.style.left = Math.random() * 100 + '%';
        petal.style.top = '-10%';
        petal.style.animation = `petalFall ${Math.random() * 5 + 5}s linear infinite`;
        petal.style.animationDelay = `${Math.random() * 5}s`;
        heroPetals.appendChild(petal);
    }

    // 3. CURSOR PERSONALIZADO
    const cursor = document.querySelector('.custom-cursor');
    if (!isTouchDevice()) {
        cursor.style.display = 'block';
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
        
        document.addEventListener('mousemove', (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        });

        const renderCursor = () => {
            // Lerp para suavidad
            cursorX += (mouseX - cursorX) * 0.2;
            cursorY += (mouseY - cursorY) * 0.2;
            cursor.style.transform = `translate(${cursorX}px, ${cursorY}px)`;
            requestAnimationFrame(renderCursor);
        };
        renderCursor();
    }

    // 4. BARRA PROGRESO SCROLL & HEADER TRANSPARENTE
    const scrollProgress = document.getElementById('scrollProgress');
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', () => {
        let scrollTop = window.scrollY;
        let docHeight = document.body.offsetHeight - window.innerHeight;
        let scrollPercent = (scrollTop / docHeight) * 100;
        scrollProgress.style.width = scrollPercent + '%';

        if(scrollTop > 80) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });

    // 5. TYPEWRITER HERO
    const typeTexts = ["Flores que hablan por ti.", "Aromas que no se olvidan.", "Arte que florece en ti."];
    let typeIndex = 0, charIndex = 0, isDeleting = false;
    const typeElement = document.getElementById('typewriter');

    const typeWriter = () => {
        const currentText = typeTexts[typeIndex];
        
        if (isDeleting) {
            typeElement.textContent = currentText.substring(0, charIndex - 1);
            charIndex--;
        } else {
            typeElement.textContent = currentText.substring(0, charIndex + 1);
            charIndex++;
        }

        let typeSpeed = isDeleting ? 50 : 100;

        if (!isDeleting && charIndex === currentText.length) {
            typeSpeed = 2000; // Pausa al final
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            typeIndex = (typeIndex + 1) % typeTexts.length;
            typeSpeed = 500;
        }
        setTimeout(typeWriter, typeSpeed);
    };
    setTimeout(typeWriter, 2500);

    // 6. SCROLL REVEAL & STAGGER
    // 6. SCROLL REVEAL & STAGGER
const revealElements = document.querySelectorAll('.reveal');

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0, rootMargin: '0px 0px -10% 0px' });

revealElements.forEach(el => revealObserver.observe(el));

// Los stagger-item se observan uno por uno (así el catálogo largo también se revela bien)
const staggerObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

document.querySelectorAll('.stagger-item').forEach(item => staggerObserver.observe(item));

    // 7. CONTADORES ANIMADOS
    const counters = document.querySelectorAll('.stat-number');
    const counterObserver = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                const targetStr = entry.target.getAttribute('data-target');
                const isDecimal = entry.target.getAttribute('data-decimal') === "true";
                const target = parseFloat(targetStr);
                let count = 0;
                const duration = 2000;
                const increment = target / (duration / 16); // 60fps

                const updateCount = () => {
                    count += increment;
                    if(count < target) {
                        entry.target.innerText = isDecimal ? count.toFixed(1) : Math.ceil(count);
                        requestAnimationFrame(updateCount);
                    } else {
                        entry.target.innerText = isDecimal ? target.toFixed(1) : target;
                    }
                };
                updateCount();
                obs.unobserve(entry.target);
            }
        });
    });
    counters.forEach(counter => counterObserver.observe(counter));

    // 8. TILT 3D HOVER (Solo Desktop)
    if (!isTouchDevice()) {
        const tiltCards = document.querySelectorAll('.tilt-card');
        tiltCards.forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
                const rotateY = ((x - centerX) / centerX) * 10;
                
                card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
            });
            card.addEventListener('mouseleave', () => {
                card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
            });
        });
    }

    // 9. FILTROS CATÁLOGO
    const filterBtns = document.querySelectorAll('.filter-btn');
    const catalogItems = document.querySelectorAll('.catalog-item');
    const filterTriggers = document.querySelectorAll('.filter-trigger'); // Links del footer

    const categoryEmptyMsg = document.getElementById('categoryEmpty');

    const applyFilter = (filterValue) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        const btn = document.querySelector(`.filter-btn[data-filter="${filterValue}"]`);
        if(btn) btn.classList.add('active');

        // Categorías sin productos cargados todavía (ej: Carteras)
        if (categoryEmptyMsg) {
            categoryEmptyMsg.style.display = (filterValue === 'carteras') ? 'block' : 'none';
        }

        catalogItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                if (filterValue === 'all' || item.getAttribute('data-category') === filterValue) {
                    item.classList.remove('hidden');
                    // Forzar reflow
                    void item.offsetWidth;
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                } else {
                    item.classList.add('hidden');
                }
            }, 300);
        });
    };

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.nav-search-input').forEach(input => input.value = '');
            const noResults = document.getElementById('noResults');
            if (noResults) noResults.style.display = 'none';
            applyFilter(btn.getAttribute('data-filter'));
        });
    });

    filterTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            const f = trigger.getAttribute('data-t');
            applyFilter(f);
        });
    });
    // ════════════════════════════════════════════
// ➡️ FLECHAS PARA DESPLAZAR LOS FILTROS DEL CATÁLOGO
// ════════════════════════════════════════════
const filtersScroll = document.getElementById('filtersScroll');
const filtersPrevBtn = document.getElementById('filtersPrev');
const filtersNextBtn = document.getElementById('filtersNext');

if (filtersScroll && filtersPrevBtn && filtersNextBtn) {
    const scrollAmount = 240;

    filtersPrevBtn.addEventListener('click', () => {
        filtersScroll.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    });
    filtersNextBtn.addEventListener('click', () => {
        filtersScroll.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    });

    const updateFilterArrows = () => {
        const maxScroll = filtersScroll.scrollWidth - filtersScroll.clientWidth;
        filtersPrevBtn.disabled = filtersScroll.scrollLeft <= 2;
        filtersNextBtn.disabled = filtersScroll.scrollLeft >= maxScroll - 2;
    };

    filtersScroll.addEventListener('scroll', updateFilterArrows);
    window.addEventListener('resize', updateFilterArrows);
    updateFilterArrows();
}
// ════════════════════════════════════════════
    // 🔲 VISTA DE CUADRÍCULA / LISTA (dos botones unidos)
    // ════════════════════════════════════════════
    const viewGridBtn = document.getElementById('viewGridBtn');
    const viewListBtn = document.getElementById('viewListBtn');
    const catalogGridView = document.getElementById('catalogGrid');

    if (viewGridBtn && viewListBtn && catalogGridView) {
        const setView = (mode) => {
            const isList = mode === 'list';
            catalogGridView.classList.toggle('list-view', isList);
            viewGridBtn.setAttribute('aria-pressed', String(!isList));
            viewListBtn.setAttribute('aria-pressed', String(isList));
        };

        viewGridBtn.addEventListener('click', () => setView('grid'));
        viewListBtn.addEventListener('click', () => setView('list'));
    }
    
    // 10. CARRUSEL DESTACADOS
    const featTrack = document.getElementById('featuredTrack');
    const featSlides = document.querySelectorAll('.featured-slide');
    const featNext = document.getElementById('featNext');
    const featPrev = document.getElementById('featPrev');
    const featDotsContainer = document.getElementById('featDots');
    let featIndex = 0;
    let featInterval;

    // Crear dots
    featSlides.forEach((_, i) => {
        let d = document.createElement('div');
        d.classList.add('dot');
        if(i === 0) d.classList.add('active');
        d.addEventListener('click', () => goToFeatSlide(i));
        featDotsContainer.appendChild(d);
    });
    const featDots = document.querySelectorAll('#featDots .dot');

    const goToFeatSlide = (index) => {
        featIndex = index;
        if (featIndex < 0) featIndex = featSlides.length - 1;
        if (featIndex >= featSlides.length) featIndex = 0;
        
        featTrack.style.transform = `translateX(-${featIndex * 100}%)`;
        featDots.forEach(d => d.classList.remove('active'));
        featDots[featIndex].classList.add('active');
    };

    featNext.addEventListener('click', () => goToFeatSlide(featIndex + 1));
    featPrev.addEventListener('click', () => goToFeatSlide(featIndex - 1));

    const startFeatAutoplay = () => { featInterval = setInterval(() => goToFeatSlide(featIndex + 1), 5000); };
    const stopFeatAutoplay = () => { clearInterval(featInterval); };

    document.querySelector('.featured-carousel').addEventListener('mouseenter', stopFeatAutoplay);
    document.querySelector('.featured-carousel').addEventListener('mouseleave', startFeatAutoplay);
    startFeatAutoplay();

    // 13. ACORDEÓN FAQ
    const faqItems = document.querySelectorAll('.faq-item');
    faqItems.forEach(item => {
        const header = item.querySelector('.faq-header');
        header.addEventListener('click', () => {
            const isActive = item.classList.contains('active');
            // Cerrar todos
            faqItems.forEach(faq => {
                faq.classList.remove('active');
                faq.querySelector('.faq-content').style.maxHeight = null;
            });
            // Abrir el clickeado si no estaba activo
            if(!isActive) {
                item.classList.add('active');
                const content = item.querySelector('.faq-content');
                content.style.maxHeight = content.scrollHeight + "px";
            }
        });
    });

    // 14. MENÚ MÓVIL (Hamburguesa)
    const hamburger = document.querySelector('.hamburger-menu');
    const navList = document.querySelector('.nav-list');
    const navLinks = document.querySelectorAll('.nav-link');

    hamburger.addEventListener('click', () => {
        navList.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navList.classList.remove('active');
        });
    });

    // 15. PARALLAX HERO
    const heroBg = document.querySelector('.hero-bg');
    window.addEventListener('scroll', () => {
        if(window.scrollY < window.innerHeight) {
            heroBg.style.transform = `translateY(${window.scrollY * 0.4}px)`;
        }
    });

    // ════════════════════════════════════════════
    // 🛒 16. CARRITO DE COMPRAS (FUNCIONAL, 2 PASOS)
    // ════════════════════════════════════════════
    const CART_STORAGE_KEY = 'indeleble_aromas_cart';
    let cart = [];

    try {
        const saved = localStorage.getItem(CART_STORAGE_KEY);
        cart = saved ? JSON.parse(saved) : [];
    } catch (err) {
        cart = [];
    }

    const cartOverlay = document.getElementById('cartOverlay');
    const cartModalHeader = document.querySelector('.cart-modal-header');
    const cartModalTitle = document.getElementById('cartModalTitle');
    const cartBackBtn = document.getElementById('cartBackBtn');

    const cartStepItems = document.getElementById('cartStepItems');
    const cartStepCheckout = document.getElementById('cartStepCheckout');

    const cartBody = document.getElementById('cartBody');
    const cartFooter = document.getElementById('cartFooter');
    const cartCheckoutFooter = document.getElementById('cartCheckoutFooter');
    const cartTotalEl = document.getElementById('cartTotal');
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
    const cartContinueBtn = document.getElementById('cartContinueBtn');
    const cartClearBtn = document.getElementById('cartClearBtn');
    const cartCloseBtn = document.getElementById('cartClose');
    const cartBtnDesktop = document.getElementById('cartBtnDesktop');
    const cartBtnMobile = document.getElementById('cartBtnMobile');
    const cartCountEls = document.querySelectorAll('.cart-count');

    const deliveryOptionBtns = document.querySelectorAll('.delivery-option');
    const deliveryError = document.getElementById('deliveryError');
    const checkoutNombre = document.getElementById('checkoutNombre');
    const checkoutNombreError = document.getElementById('checkoutNombreError');
    const checkoutCelular = document.getElementById('checkoutCelular');
    const checkoutCelularError = document.getElementById('checkoutCelularError');
    const checkoutCountryCode = document.getElementById('checkoutCountryCode');

    // Dirección de entrega (solo obligatoria si es "Domicilio") y comentarios de la orden (libre, sin límite)
    const checkoutDireccionBlock = document.getElementById('checkoutDireccionBlock');
    const checkoutDireccion = document.getElementById('checkoutDireccion');
    const checkoutDireccionError = document.getElementById('checkoutDireccionError');
    const checkoutComentarios = document.getElementById('checkoutComentarios');

    let selectedDelivery = null;

    const emptyCartHTML = `
        <div class="cart-empty">
            <div class="cart-empty-icon">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4Z"/>
                    <path d="M3 6h18"/>
                    <path d="M16 10a4 4 0 01-8 0"/>
                </svg>
            </div>
            <p class="cart-empty-title">Tu carrito está vacío</p>
            <p class="cart-empty-sub">Agrega algunos productos para comenzar</p>
        </div>
    `;

    const saveCart = () => {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (err) {
            /* almacenamiento no disponible, seguimos solo en memoria */
        }
    };

    const escapeHtml = (str) => String(str).replace(/[&<>"']/g, (m) => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));

    const updateCartCount = () => {
        const totalUnits = cart.reduce((sum, item) => sum + item.qty, 0);
        cartCountEls.forEach(el => {
            el.textContent = totalUnits;
            el.style.display = totalUnits > 0 ? 'flex' : 'none';
            el.classList.remove('bump');
            void el.offsetWidth;
            el.classList.add('bump');
        });
    };

    const renderCart = () => {
        if (cart.length === 0) {
            cartBody.innerHTML = emptyCartHTML;
            cartTotalEl.textContent = '$0';
            if (cartContinueBtn) cartContinueBtn.style.display = 'none';
            if (cartClearBtn) cartClearBtn.style.display = 'none';
            return;
        }

        
          cartBody.innerHTML = cart.map(item => `
            <div class="cart-item" data-name="${escapeHtml(item.name)}">
                <div class="cart-item-img">
                    ${item.image ? `<img src="${escapeHtml(item.image)}" alt="${escapeHtml(item.name)}">` : '🌸'}
                </div>
                <div class="cart-item-info">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">$${item.price} c/u</div>
                </div>
                <div class="cart-item-qty">
                    <button type="button" class="cart-qty-btn" data-action="decrease" aria-label="Quitar una unidad">−</button>
                    <span>${item.qty}</span>
                    <button type="button" class="cart-qty-btn" data-action="increase" aria-label="Agregar una unidad">+</button>
                </div>
                <button type="button" class="cart-item-remove" data-action="remove" aria-label="Eliminar producto">&times;</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        cartTotalEl.textContent = `$${total}`;
        if (cartContinueBtn) cartContinueBtn.style.display = '';
        if (cartClearBtn) cartClearBtn.style.display = '';
    };

    const buildOrderMessage = () => {
        const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
        const [code, countryName] = checkoutCountryCode.value.split('|');

        let msg = `*NUEVO PEDIDO - INDELEBLE AROMAS* 🌸\n\n`;
        cart.forEach(item => {
            msg += `• ${item.name} x${item.qty} - $${item.price * item.qty}\n`;
        });
        msg += `\n*Total: $${total}*\n\n`;
        msg += `*Entrega:* ${selectedDelivery}\n`;
        if (selectedDelivery === 'Domicilio' && checkoutDireccion.value.trim()) {
            msg += `*Dirección:* ${checkoutDireccion.value.trim()}\n`;
        }
        msg += `*Nombre:* ${checkoutNombre.value.trim()}\n`;
        msg += `*Celular:* ${code} ${checkoutCelular.value.trim()} (${countryName})`;
        if (checkoutComentarios.value.trim()) {
            msg += `\n*Comentarios:* ${checkoutComentarios.value.trim()}`;
        }
        return msg;
    };

    const updateCartUI = () => {
        saveCart();
        updateCartCount();
        renderCart();
    };

    const addToCart = (name, price, btnEl) => {
        const existing = cart.find(i => i.name === name);
        if (existing) {
            existing.qty += 1;
        } else {
            cart.push({ name, price, qty: 1 });
        }
        updateCartUI();

        if (btnEl) {
            btnEl.classList.add('added');
            setTimeout(() => btnEl.classList.remove('added'), 500);
        }
        if (typeof createConfetti === 'function' && btnEl) {
            createConfetti(btnEl);
        }
    };

    // Alterna entre el paso "items" y el paso "checkout" dentro del mismo modal
    const showCartStep = (step) => {
        if (step === 'checkout') {
            cartStepItems.classList.remove('active');
            cartStepCheckout.classList.add('active');
            cartFooter.classList.remove('active');
            cartCheckoutFooter.classList.add('active');
            cartModalHeader.classList.add('step-checkout');
            cartModalTitle.textContent = '📋 Datos de contacto';
        } else {
            cartStepCheckout.classList.remove('active');
            cartStepItems.classList.add('active');
            cartCheckoutFooter.classList.remove('active');
            cartFooter.classList.add('active');
            cartModalHeader.classList.remove('step-checkout');
            cartModalTitle.textContent = '🛒 Tu Carrito';
        }
    };

    const openCart = () => {
        showCartStep('items');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    };

    const closeCart = () => {
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    };

   // Botones "+" del catálogo → abren la vista rápida en vez de añadir directo
    document.querySelectorAll('.btn-add-cart').forEach(btn => {
        btn.addEventListener('click', () => {
            const card = btn.closest('.catalog-item');
            const imgWrap = card ? card.querySelector('.card-img-wrap') : null;
            if (imgWrap) imgWrap.click();
        });
    });

    // Abrir carrito (desktop y móvil)
    [cartBtnDesktop, cartBtnMobile].forEach(btn => {
        if (btn) btn.addEventListener('click', openCart);
    });

    // Cerrar carrito
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', closeCart);
    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) closeCart();
        });
    }
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && cartOverlay.classList.contains('active')) closeCart();
    });

    // Acciones dentro del carrito (aumentar, disminuir, eliminar)
    cartBody.addEventListener('click', (e) => {
        const actionBtn = e.target.closest('[data-action]');
        if (!actionBtn) return;
        const itemRow = actionBtn.closest('.cart-item');
        if (!itemRow) return;
        const name = itemRow.getAttribute('data-name');
        const item = cart.find(i => i.name === name);
        if (!item) return;

        const action = actionBtn.getAttribute('data-action');
        if (action === 'increase') {
            item.qty += 1;
        } else if (action === 'decrease') {
            item.qty -= 1;
            if (item.qty <= 0) {
                cart = cart.filter(i => i.name !== name);
            }
        } else if (action === 'remove') {
            cart = cart.filter(i => i.name !== name);
        }
        updateCartUI();
    });

    // Vaciar carrito
    if (cartClearBtn) {
        cartClearBtn.addEventListener('click', () => {
            cart = [];
            updateCartUI();
        });
    }

    // "Agregar" → pasa a la pantalla de datos de contacto (misma ventana/modal)
    if (cartContinueBtn) {
        cartContinueBtn.addEventListener('click', () => {
            if (cart.length === 0) return;
            showCartStep('checkout');
        });
    }

    // Botón "volver" al listado de productos
    if (cartBackBtn) {
        cartBackBtn.addEventListener('click', () => showCartStep('items'));
    }

    // Selección del método de entrega (Domicilio / Para llevar-Recoger)
    deliveryOptionBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            deliveryOptionBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedDelivery = btn.getAttribute('data-delivery');
            if (deliveryError) deliveryError.style.display = 'none';

            // Mostrar el campo de Dirección solo si eligieron "Domicilio"
            const esDomicilio = selectedDelivery === 'Domicilio';
            if (checkoutDireccionBlock) {
                checkoutDireccionBlock.style.display = esDomicilio ? 'block' : 'none';
            }
            if (!esDomicilio && checkoutDireccionError) {
                checkoutDireccionError.style.display = 'none';
            }
        });
    });

    // Envío final del pedido (WhatsApp) con todos los datos de contacto
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            let isValid = true;

            [deliveryError, checkoutNombreError, checkoutCelularError, checkoutDireccionError].forEach(el => {
                if (el) el.style.display = 'none';
            });

            if (!selectedDelivery) {
                isValid = false;
                if (deliveryError) deliveryError.style.display = 'block';
            }
            if (checkoutNombre.value.trim().length < 3) {
                isValid = false;
                if (checkoutNombreError) checkoutNombreError.style.display = 'block';
            }
            const phoneDigits = checkoutCelular.value.replace(/\D/g, '');
            if (phoneDigits.length < 7) {
                isValid = false;
                if (checkoutCelularError) checkoutCelularError.style.display = 'block';
            }
            if (selectedDelivery === 'Domicilio' && checkoutDireccion.value.trim().length < 5) {
                isValid = false;
                if (checkoutDireccionError) checkoutDireccionError.style.display = 'block';
            }

            if (!isValid) return;

            const msg = buildOrderMessage();
            window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
        });
    }

    // Render inicial
    updateCartUI();

    // ════════════════════════════════════════════
    // 🔍 17. QUICK VIEW POR PRODUCTO (click/toque en la imagen)
    // ════════════════════════════════════════════
    const qvOverlay = document.getElementById('quickviewOverlay');
    const qvClose = document.getElementById('quickviewClose');
    const qvTitle = document.getElementById('qvTitle');
    const qvImage = document.getElementById('qvImage');
    const qvPrice = document.getElementById('qvPrice');
    const qvQtyValue = document.getElementById('qvQtyValue');
    const qvDecrease = document.getElementById('qvDecrease');
    const qvIncrease = document.getElementById('qvIncrease');
    const qvAddBtn = document.getElementById('qvAddBtn');
    const qvAddPrice = document.getElementById('qvAddPrice');

    let qvCurrentProduct = null;
    let qvQty = 1;

    const updateQvAddPrice = () => {
        qvQtyValue.textContent = qvQty;
        if (qvCurrentProduct) {
            qvAddPrice.textContent = `$${qvCurrentProduct.price * qvQty}`;
        }
    };

    if (qvOverlay) {
        document.querySelectorAll('.catalog-item .card-img-wrap').forEach(imgWrap => {
            imgWrap.style.cursor = 'pointer';
            imgWrap.addEventListener('click', () => {
                const card = imgWrap.closest('.catalog-item');
                const btn = card.querySelector('.btn-add-cart');
                const name = btn.getAttribute('data-item');
                const price = parseFloat(btn.getAttribute('data-price')) || 0;
                const imgEl = imgWrap.querySelector('img');

                const imageSrc = imgEl.getAttribute('src');
                qvCurrentProduct = { name, price, image: imageSrc };
                qvQty = 1;

                qvTitle.textContent = name;
                qvImage.src = imageSrc;
                qvImage.alt = imgEl.getAttribute('alt') || name;
                qvPrice.textContent = `$${price}`;
                updateQvAddPrice();

                qvOverlay.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        });

        const closeQv = () => {
            qvOverlay.classList.remove('active');
            document.body.style.overflow = '';
        };

        if (qvClose) qvClose.addEventListener('click', closeQv);
        qvOverlay.addEventListener('click', (e) => {
            if (e.target === qvOverlay) closeQv();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && qvOverlay.classList.contains('active')) closeQv();
        });

        qvDecrease.addEventListener('click', () => {
            if (qvQty > 1) qvQty--;
            updateQvAddPrice();
        });
        qvIncrease.addEventListener('click', () => {
            qvQty++;
            updateQvAddPrice();
        });

      qvAddBtn.addEventListener('click', () => {
            if (!qvCurrentProduct) return;
            const existing = cart.find(i => i.name === qvCurrentProduct.name);
            if (existing) {
                existing.qty += qvQty;
                if (!existing.image && qvCurrentProduct.image) existing.image = qvCurrentProduct.image;
            } else {
                cart.push({ name: qvCurrentProduct.name, price: qvCurrentProduct.price, qty: qvQty, image: qvCurrentProduct.image });
            }
            updateCartUI();
            if (typeof createConfetti === 'function') createConfetti(qvAddBtn);
            closeQv();
        });
    }

    // 18. CONFETI FUNCTION (Pure DOM - CSS Animated)
    const confetiTriggers = document.querySelectorAll('.cta-confetti-trigger');
    confetiTriggers.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            createConfetti(btn);
            const href = btn.getAttribute('href');
            setTimeout(() => {
                if(href) window.open(href, '_blank');
            }, 800);
        });
    });

    // 19. BUSCADOR DE ARREGLOS
    const searchForms = document.querySelectorAll('[data-search-form]');
    const searchInputs = document.querySelectorAll('.nav-search-input');
    const noResultsMsg = document.getElementById('noResults');

    const normalizeText = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    const performSearch = (rawQuery) => {
        // Mantener sincronizados los dos inputs (desktop y móvil)
        searchInputs.forEach(input => {
            if (input.value !== rawQuery) input.value = rawQuery;
        });

        const query = normalizeText(rawQuery.trim());

        if (categoryEmptyMsg) categoryEmptyMsg.style.display = 'none';

        if (!query) {
            applyFilter('all');
            if (noResultsMsg) noResultsMsg.style.display = 'none';
            return;
        }

        // La búsqueda reemplaza el filtro por categoría mientras haya texto
        filterBtns.forEach(b => b.classList.remove('active'));

        catalogItems.forEach(item => {
            item.style.opacity = '0';
            item.style.transform = 'scale(0.9)';
        });

        setTimeout(() => {
            let matches = 0;
            catalogItems.forEach(item => {
                const name = normalizeText(item.querySelector('h3').textContent);
                if (name.includes(query)) {
                    item.classList.remove('hidden');
                    void item.offsetWidth;
                    item.style.opacity = '1';
                    item.style.transform = 'scale(1)';
                    matches++;
                } else {
                    item.classList.add('hidden');
                }
            });
            if (noResultsMsg) noResultsMsg.style.display = matches === 0 ? 'block' : 'none';
        }, 300);

        document.getElementById('arreglos').scrollIntoView({ behavior: 'smooth', block: 'start' });
        navList.classList.remove('active');
    };

    searchForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = form.querySelector('.nav-search-input');
            performSearch(input.value);
        });
    });

    searchInputs.forEach(input => {
        input.addEventListener('input', () => performSearch(input.value));
    });

    function createConfetti(element) {
        const container = document.getElementById('confetti-container');
        const colors = ['#1B4332', '#74C69D', '#E8A0B0', '#FEF0F3', '#C5A028'];
        
        for (let i = 0; i < 50; i++) {
            const petal = document.createElement('div');
            petal.classList.add('petal-confetti');
            
            // Random properties
            petal.style.background = colors[Math.floor(Math.random() * colors.length)];
            petal.style.left = Math.random() * 100 + 'vw';
            petal.style.animationDuration = (Math.random() * 2 + 2) + 's';
            petal.style.animationDelay = (Math.random() * 0.5) + 's';
            
            container.appendChild(petal);
            
            // Cleanup
            setTimeout(() => {
                petal.remove();
            }, 4000);
        }
    }

    // ════════════════════════════════════════════
    // 🔽 20. ORDENAR CATÁLOGO (Ordenar por)
    // ════════════════════════════════════════════
    const sortToggleBtn = document.getElementById('sortToggleBtn');
    const sortDropdown = document.getElementById('sortDropdown');
    const sortOptions = document.querySelectorAll('.sort-option');
    const sortLabel = document.getElementById('sortLabel');
    const catalogGridEl = document.getElementById('catalogGrid');

    const normalizeForSort = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

    // Guardamos el orden original de aparición (para "Más nuevos")
    if (catalogGridEl) {
        Array.from(catalogGridEl.querySelectorAll('.catalog-item')).forEach((item, idx) => {
            item.setAttribute('data-order', idx);
        });
    }

    const getItemName = (item) => normalizeForSort(item.querySelector('h3').textContent.trim());
    const getItemPrice = (item) => parseFloat(item.querySelector('.btn-add-cart').getAttribute('data-price')) || 0;

    const sortCatalog = (type) => {
        if (!catalogGridEl) return;
        const items = Array.from(catalogGridEl.querySelectorAll('.catalog-item'));
        let sorted;
        switch (type) {
            case 'az':
                sorted = items.sort((a, b) => getItemName(a).localeCompare(getItemName(b)));
                break;
            case 'price-asc':
                sorted = items.sort((a, b) => getItemPrice(a) - getItemPrice(b));
                break;
            case 'price-desc':
                sorted = items.sort((a, b) => getItemPrice(b) - getItemPrice(a));
                break;
            case 'newest':
                sorted = items.sort((a, b) => parseInt(b.getAttribute('data-order')) - parseInt(a.getAttribute('data-order')));
                break;
            default:
                sorted = items.sort((a, b) => parseInt(a.getAttribute('data-order')) - parseInt(b.getAttribute('data-order')));
        }
        sorted.forEach(item => catalogGridEl.appendChild(item));
    };

    if (sortToggleBtn && sortDropdown) {
        sortToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            sortDropdown.classList.toggle('active');
            sortToggleBtn.classList.toggle('active');
        });

        document.addEventListener('click', (e) => {
            if (!sortDropdown.contains(e.target) && !sortToggleBtn.contains(e.target)) {
                sortDropdown.classList.remove('active');
                sortToggleBtn.classList.remove('active');
            }
        });

        sortOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                sortOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                sortLabel.textContent = opt.textContent;
                sortCatalog(opt.getAttribute('data-sort'));
                sortDropdown.classList.remove('active');
                sortToggleBtn.classList.remove('active');
            });
        });
    }
});
// ════════════════════════════════════════════
// 🕐 21. ESTADO DE ATENCIÓN EN TIEMPO REAL (Abierto/Cerrado) + conversión a hora local del visitante
// ════════════════════════════════════════════
(function initStoreStatus() {
    const statusEl = document.getElementById('storeStatus');
    const statusText = document.getElementById('storeStatusText');
    const statusHours = document.getElementById('storeStatusHours');
    if (!statusEl || !statusText || !statusHours) return;

    const OPEN_HOUR = 8;
    const CLOSE_HOUR = 17;
    const STORE_TIMEZONE = 'America/Caracas';

    let serverOffsetMs = 0;
    const getAccurateNow = () => new Date(Date.now() + serverOffsetMs);

    const fetchServerTime = async () => {
        try {
            const res = await fetch(`https://timeapi.io/api/time/current/zone?timeZone=${encodeURIComponent(STORE_TIMEZONE)}`);
            if (!res.ok) throw new Error('timeapi failed');
            const data = await res.json();
            serverOffsetMs = new Date(data.dateTime).getTime() - Date.now();
        } catch (err) {
            serverOffsetMs = 0;
        }
    };

    // Zona horaria del visitante, detectada automáticamente por el navegador (funciona para cualquier país)
    const visitorTZ = Intl.DateTimeFormat().resolvedOptions().timeZone || STORE_TIMEZONE;

    const getStoreLocalParts = (date) => {
        const fmt = new Intl.DateTimeFormat('en-US', {
            timeZone: STORE_TIMEZONE, weekday: 'short', hour: 'numeric', minute: 'numeric', hour12: false
        });
        const parts = fmt.formatToParts(date);
        const get = (t) => parts.find(p => p.type === t)?.value;
        const dayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
        return { day: dayMap[get('weekday')], hour: parseInt(get('hour'), 10), minute: parseInt(get('minute'), 10) };
    };

    const buildStoreTimeUTC = (referenceDate, hour, minute, dayOffset = 0) => {
        // Toma la fecha de la tienda como referencia y arma un instante UTC que, visto en STORE_TIMEZONE, marque hour:minute
        const storeDateStr = new Intl.DateTimeFormat('en-CA', { timeZone: STORE_TIMEZONE }).format(referenceDate);
        const [y, m, d] = storeDateStr.split('-').map(Number);
        const guess = new Date(Date.UTC(y, m - 1, d + dayOffset, hour, minute, 0));
        const check = new Intl.DateTimeFormat('en-US', { timeZone: STORE_TIMEZONE, hour12: false, hour: '2-digit', minute: '2-digit' }).format(guess);
        const [ch, cm] = check.split(':').map(Number);
        const diffMin = (hour * 60 + minute) - (ch * 60 + cm);
        return new Date(guess.getTime() + diffMin * 60000);
    };

    const formatInVisitorTZ = (utcDate) => {
        return new Intl.DateTimeFormat('es', {
            timeZone: visitorTZ, weekday: 'long', hour: 'numeric', minute: '2-digit', hour12: true
        }).format(utcDate);
    };

    const updateStoreStatus = () => {
        const now = getAccurateNow();
        const { day, hour, minute } = getStoreLocalParts(now);
        const minutesNow = hour * 60 + minute;
        const esDiaHabil = day >= 1 && day <= 6; // Lunes a Sábado
        const estaAbierto = esDiaHabil && minutesNow >= OPEN_HOUR * 60 && minutesNow < CLOSE_HOUR * 60;

        statusEl.classList.toggle('is-open', estaAbierto);
        statusEl.classList.toggle('is-closed', !estaAbierto);

        if (estaAbierto) {
            const closeUTC = buildStoreTimeUTC(now, CLOSE_HOUR, 0, 0);
            statusText.textContent = 'Abierto';
            statusHours.textContent = visitorTZ === STORE_TIMEZONE
                ? '8:00 am - 5:00 pm'
                : `Cierra: ${formatInVisitorTZ(closeUTC)}`;
        } else {
            let dayOffset = 0;
            if (!(esDiaHabil && minutesNow < OPEN_HOUR * 60)) {
                dayOffset = 1;
                while (true) {
                    const proximoDia = (day + dayOffset) % 7;
                    if (proximoDia >= 1 && proximoDia <= 6) break; // Lunes a Sábado
                    dayOffset++;
                }
            }
            const openUTC = buildStoreTimeUTC(now, OPEN_HOUR, 0, dayOffset);
            statusText.textContent = 'Cerrado';
            statusHours.textContent = visitorTZ === STORE_TIMEZONE
                ? `${formatInVisitorTZ(openUTC).split(',')[0]} 8:00 am - 5:00 pm`
                : `Abre: ${formatInVisitorTZ(openUTC)}`;
        }
    };

    fetchServerTime().then(updateStoreStatus);
    setInterval(() => fetchServerTime().then(updateStoreStatus), 10 * 60 * 1000);
    setInterval(updateStoreStatus, 30000);
})();