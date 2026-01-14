// Récupérer les produits depuis localStorage
const getProduits = () => {
    const produits = localStorage.getItem('Produits');
    if (!produits) {
        localStorage.setItem('Produits', JSON.stringify([]));
        return [];
    }
    return JSON.parse(produits);
};

// Afficher les produits dans la grille
const displayProducts = () => {
    const produitsGrid = document.getElementById('produitsGrid');
    const emptyProducts = document.getElementById('emptyProducts');
    const produits = getProduits();

    if (!produitsGrid) return;

    // Si aucun produit, afficher le message vide
    if (produits.length === 0) {
        produitsGrid.style.display = 'none';
        if (emptyProducts) emptyProducts.style.display = 'block';
        return;
    }

    // Cacher le message vide et afficher la grille
    if (emptyProducts) emptyProducts.style.display = 'none';
    produitsGrid.style.display = 'grid';

    // Générer le HTML pour chaque produit
    let html = '';
    produits.forEach(produit => {
        html += `
            <div class="produit-card">
                <div class="produit-image-wrapper">
                    <img src="${produit.lien}" alt="${produit.full_name}" class="produit-image">
                    <div class="produit-stock-badge">Stock: ${produit.qte}</div>
                </div>
                <div class="produit-content">
                    <h3 class="produit-name">${produit.full_name}</h3>
                    <div class="produit-price">${formatPrice(produit.price)} FCFA</div>
                    <button class="produit-add-btn" onclick="addToCart(${produit.id})">
                        Ajouter au panier
                    </button>
                </div>
            </div>
        `;
    });

    produitsGrid.innerHTML = html;
};

// Formater le prix avec des espaces pour la lisibilité
const formatPrice = (price) => {
    return parseInt(price).toLocaleString('fr-FR');
};

/* ===========================
   GESTION DU PANIER
   =========================== */

// Récupérer le panier depuis localStorage
const getCart = () => {
    const cart = localStorage.getItem('Panier');
    if (!cart) {
        localStorage.setItem('Panier', JSON.stringify([]));
        return [];
    }
    return JSON.parse(cart);
};

// Sauvegarder le panier dans localStorage
const saveCart = (cart) => {
    localStorage.setItem('Panier', JSON.stringify(cart));
    updateCartBadge();
};

// Ajouter un produit au panier
const addToCart = (productId) => {
    const produits = getProduits();
    const cart = getCart();
    
    // Trouver le produit
    const product = produits.find(p => p.id === productId);
    if (!product) {
        alert('Produit introuvable !');
        return;
    }

    // Vérifier si le produit est déjà dans le panier
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        // Vérifier le stock avant d'augmenter la quantité
        if (existingItem.quantity >= parseInt(product.qte)) {
            alert('Stock insuffisant !');
            return;
        }
        existingItem.quantity += 1;
    } else {
        // Ajouter le nouveau produit au panier
        cart.push({
            id: product.id,
            name: product.full_name,
            price: parseInt(product.price),
            image: product.lien,
            quantity: 1,
            maxStock: parseInt(product.qte)
        });
    }

    saveCart(cart);
    
    // Animation de confirmation
    showNotification('Produit ajouté au panier !');
};

// Mettre à jour le badge du panier
const updateCartBadge = () => {
    const cartBadge = document.getElementById('cartBadge');
    if (!cartBadge) return;

    const cart = getCart();
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartBadge.textContent = totalItems;
    
    // Animation du badge
    if (totalItems > 0) {
        cartBadge.style.display = 'flex';
        cartBadge.style.animation = 'none';
        setTimeout(() => {
            cartBadge.style.animation = 'popIn 0.3s ease';
        }, 10);
    } else {
        cartBadge.style.display = 'none';
    }
};

// Augmenter la quantité d'un produit dans le panier
const increaseQuantity = (productId) => {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;
    
    if (item.quantity >= item.maxStock) {
        alert('Stock maximum atteint !');
        return;
    }
    
    item.quantity += 1;
    saveCart(cart);
    displayCart();
};

// Diminuer la quantité d'un produit dans le panier
const decreaseQuantity = (productId) => {
    const cart = getCart();
    const item = cart.find(i => i.id === productId);
    
    if (!item) return;
    
    if (item.quantity <= 1) {
        removeFromCart(productId);
        return;
    }
    
    item.quantity -= 1;
    saveCart(cart);
    displayCart();
};

// Supprimer un produit du panier
const removeFromCart = (productId) => {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    displayCart();
    showNotification('Produit retiré du panier');
};

// Vider le panier
const clearCart = () => {
    if (!confirm('Voulez-vous vraiment vider le panier ?')) return;
    
    localStorage.setItem('Panier', JSON.stringify([]));
    updateCartBadge();
    displayCart();
    showNotification('Panier vidé');
};

// Calculer le total du panier
const calculateTotal = () => {
    const cart = getCart();
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};

// Afficher le contenu du panier dans la modal
const displayCart = () => {
    const cartModalBody = document.getElementById('cartModalBody');
    const cartTotalPrice = document.getElementById('cartTotalPrice');
    const cart = getCart();

    if (!cartModalBody) return;

    // Si le panier est vide
    if (cart.length === 0) {
        cartModalBody.innerHTML = `
            <div class="cart-empty">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p>Votre panier est vide</p>
            </div>
        `;
        if (cartTotalPrice) cartTotalPrice.textContent = '0 FCFA';
        return;
    }

    // Générer le HTML des articles du panier
    let html = '';
    cart.forEach(item => {
        html += `
            <div class="cart-item">
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)} FCFA</div>
                    <div class="cart-item-controls">
                        <button class="cart-item-qty-btn" onclick="decreaseQuantity(${item.id})">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="cart-item-qty-btn" onclick="increaseQuantity(${item.id})">+</button>
                    </div>
                </div>
                <button class="cart-item-remove" onclick="removeFromCart(${item.id})">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            </div>
        `;
    });

    cartModalBody.innerHTML = html;

    // Mettre à jour le total
    const total = calculateTotal();
    if (cartTotalPrice) {
        cartTotalPrice.textContent = `${formatPrice(total)} FCFA`;
    }
};

/* ===========================
   GESTION DES MODALS
   =========================== */

// Ouvrir la modal du panier
const openCartModal = () => {
    const cartModal = document.getElementById('cartModal');
    if (!cartModal) return;
    
    displayCart();
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Fermer la modal du panier
const closeCartModal = () => {
    const cartModal = document.getElementById('cartModal');
    if (!cartModal) return;
    
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
};

// Ouvrir la modal de paiement
const openPaymentModal = () => {
    const cart = getCart();
    
    if (cart.length === 0) {
        alert('Votre panier est vide !');
        return;
    }
    
    const paymentModal = document.getElementById('paymentModal');
    if (!paymentModal) return;
    
    // Remplir le récapitulatif de commande
    displayOrderSummary();
    
    closeCartModal();
    paymentModal.classList.add('active');
    document.body.style.overflow = 'hidden';
};

// Fermer la modal de paiement
const closePaymentModal = () => {
    const paymentModal = document.getElementById('paymentModal');
    if (!paymentModal) return;
    
    paymentModal.classList.remove('active');
    document.body.style.overflow = '';
};

// Afficher le récapitulatif de commande
const displayOrderSummary = () => {
    const orderSummaryItems = document.getElementById('orderSummaryItems');
    const orderTotalAmount = document.getElementById('orderTotalAmount');
    const cart = getCart();

    if (!orderSummaryItems || !orderTotalAmount) return;

    let html = '';
    cart.forEach(item => {
        const itemTotal = item.price * item.quantity;
        html += `
            <div class="order-summary-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>${formatPrice(itemTotal)} FCFA</span>
            </div>
        `;
    });

    orderSummaryItems.innerHTML = html;
    
    const total = calculateTotal();
    orderTotalAmount.textContent = `${formatPrice(total)} FCFA`;
};

/* ===========================
   GESTION DU PAIEMENT
   =========================== */

// Traiter le paiement avec CashChapPay
const processPayment = (e) => {
    e.preventDefault();

    const paymentName = document.getElementById('paymentName').value.trim();
    const paymentPhone = document.getElementById('paymentPhone').value.trim();
    const paymentEmail = document.getElementById('paymentEmail').value.trim();

    // Validation des champs
    if (!paymentName || !paymentPhone) {
        alert('Veuillez remplir tous les champs obligatoires !');
        return;
    }

    const cart = getCart();
    if (cart.length === 0) {
        alert('Votre panier est vide !');
        return;
    }

    const total = calculateTotal();

    // Vérifier que CashChapPay est chargé
    if (typeof CashChapPay === 'undefined') {
        alert('Erreur: Le système de paiement n\'est pas disponible. Veuillez réessayer plus tard.');
        console.error('CashChapPay SDK non chargé');
        return;
    }

    try {
        // Initialiser le paiement CashChapPay
        CashChapPay.init({
            fullname: paymentName,
            phoneNumber: paymentPhone,
            amount: total,
            currency: "XOF",
            email: paymentEmail || "client@premiumstore.com",
            publicKey: "PKSANDBOX_F2EFBEISUCB9GCZYLRTCL36WF3AW5TB5VNG8IMDIVG9QYUFX",
            callback: window.location.origin + "/payment-callback",
            onSuccess: (response) => {
                console.log('Paiement réussi:', response);
                
                // Vider le panier après paiement réussi
                clearCart();
                closePaymentModal();
                
                showNotification('Paiement effectué avec succès !');
                
                // Réinitialiser le formulaire
                document.getElementById('paymentForm').reset();
            },
            onError: (error) => {
                console.error('Erreur de paiement:', error);
                alert('Erreur lors du paiement. Veuillez réessayer.');
            }
        });
    } catch (error) {
        console.error('Erreur lors de l\'initialisation du paiement:', error);
        alert('Une erreur est survenue. Veuillez réessayer.');
    }
};

/* ===========================
   NOTIFICATIONS
   =========================== */

// Afficher une notification temporaire
const showNotification = (message) => {
    // Créer l'élément de notification
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: #10b981;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(notification);

    // Supprimer après 3 secondes
    setTimeout(() => {
        notification.style.animation = 'fadeOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
};

/* ===========================
   EVENT LISTENERS
   =========================== */

// Initialisation au chargement de la page
document.addEventListener('DOMContentLoaded', () => {
    // Afficher les produits
    displayProducts();
    
    // Mettre à jour le badge du panier
    updateCartBadge();

    // Event listener pour l'icône du panier
    const cartIconWrapper = document.getElementById('cartIconWrapper');
    if (cartIconWrapper) {
        cartIconWrapper.addEventListener('click', openCartModal);
    }

    // Event listeners pour fermer les modals
    const cartModalClose = document.getElementById('cartModalClose');
    if (cartModalClose) {
        cartModalClose.addEventListener('click', closeCartModal);
    }

    const cartModalOverlay = document.getElementById('cartModalOverlay');
    if (cartModalOverlay) {
        cartModalOverlay.addEventListener('click', closeCartModal);
    }

    const paymentModalClose = document.getElementById('paymentModalClose');
    if (paymentModalClose) {
        paymentModalClose.addEventListener('click', closePaymentModal);
    }

    const paymentModalOverlay = document.getElementById('paymentModalOverlay');
    if (paymentModalOverlay) {
        paymentModalOverlay.addEventListener('click', closePaymentModal);
    }

    // Event listener pour le bouton "Valider la commande"
    const cartCheckoutBtn = document.getElementById('cartCheckoutBtn');
    if (cartCheckoutBtn) {
        cartCheckoutBtn.addEventListener('click', openPaymentModal);
    }

    // Event listener pour le bouton "Vider le panier"
    const cartClearBtn = document.getElementById('cartClearBtn');
    if (cartClearBtn) {
        cartClearBtn.addEventListener('click', clearCart);
    }

    // Event listener pour le formulaire de paiement
    const paymentForm = document.getElementById('paymentForm');
    if (paymentForm) {
        paymentForm.addEventListener('submit', processPayment);
    }

    // Fermer les modals avec la touche Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeCartModal();
            closePaymentModal();
        }
    });

    // Navigation active
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            e.target.classList.add('active');
        });
    });
});

/* ===========================
   UTILITAIRES POUR AJOUTER DES PRODUITS (DEV)
   =========================== */

// Fonction utilitaire pour ajouter des produits de démonstration
// À utiliser dans la console du navigateur pour tester
const addDemoProducts = () => {
    const demoProducts = [
        {
            id: 1,
            full_name: "Smartphone Premium X1",
            lien: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400",
            price: "250000",
            qte: "15"
        },
        {
            id: 2,
            full_name: "Laptop Pro 15\"",
            lien: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
            price: "450000",
            qte: "8"
        },
        {
            id: 3,
            full_name: "Écouteurs Sans Fil",
            lien: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400",
            price: "35000",
            qte: "25"
        },
        {
            id: 4,
            full_name: "Montre Connectée Sport",
            lien: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400",
            price: "85000",
            qte: "12"
        },
        {
            id: 5,
            full_name: "Tablette 10 pouces",
            lien: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400",
            price: "180000",
            qte: "20"
        },
        {
            id: 6,
            full_name: "Appareil Photo Reflex",
            lien: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=400",
            price: "550000",
            qte: "5"
        }
    ];

    localStorage.setItem('Produits', JSON.stringify(demoProducts));
    displayProducts();
    console.log('✅ Produits de démonstration ajoutés avec succès !');
};