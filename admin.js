/* ===========================
   GESTION ADMIN - AJOUT DE PRODUITS
   =========================== */

// Récupérer les produits depuis localStorage
const getProducts = () => {
    const products = localStorage.getItem('Produits');
    if (!products) {
        localStorage.setItem('Produits', JSON.stringify([]));
        return [];
    }
    return JSON.parse(products);
};

// Sauvegarder les produits dans localStorage
const saveProducts = (products) => {
    localStorage.setItem('Produits', JSON.stringify(products));
};

// Générer un ID unique pour un nouveau produit
const generateProductId = () => {
    const products = getProducts();
    if (products.length === 0) return 1;
    const maxId = Math.max(...products.map(p => p.id));
    return maxId + 1;
};


/* ===========================
   APERÇU EN TEMPS RÉEL
   =========================== */

// Mettre à jour l'aperçu du produit en temps réel
const updatePreview = () => {
    const fullName = document.getElementById('full_name').value.trim();
    const lien = document.getElementById('lien').value.trim();
    const price = document.getElementById('price').value;
    const qte = document.getElementById('qte').value;

    const productPreview = document.getElementById('productPreview');
    const previewImage = document.getElementById('previewImage');
    const previewName = document.getElementById('previewName');
    const previewPrice = document.getElementById('previewPrice');
    const previewStock = document.getElementById('previewStock');

    // Afficher l'aperçu si au moins un champ est rempli
    if (fullName || lien || price || qte) {
        productPreview.style.display = 'block';

        // Mettre à jour les éléments de l'aperçu
        previewName.textContent = fullName || 'Nom du produit';
        previewPrice.textContent = '0 FCFA';
        previewStock.textContent = `Stock: ${qte || 0}`;

        // Mettre à jour l'image
        if (lien) {
            previewImage.src = lien;
            previewImage.style.display = 'block';
            previewImage.onerror = () => {
                previewImage.style.display = 'none';
            };
        } else {
            previewImage.style.display = 'none';
        }
    } else {
        productPreview.style.display = 'none';
    }
};

/* ===========================
   GESTION DU FORMULAIRE
   =========================== */

// Ajouter un nouveau produit
const addProduct = (e) => {
    e.preventDefault();

    // Récupérer les valeurs du formulaire
    const fullName = document.getElementById('full_name').value.trim();
    const lien = document.getElementById('lien').value.trim();
    const price = document.getElementById('price').value;
    const qte = document.getElementById('qte').value;

    // Validation
    if (!fullName || !lien || !price || !qte) {
        alert('Veuillez remplir tous les champs !');
        return;
    }

    if (parseInt(price) <= 0) {
        alert('Le prix doit être supérieur à 0 !');
        return;
    }

    if (parseInt(qte) <= 0) {
        alert('La quantité doit être supérieure à 0 !');
        return;
    }

    // Créer le nouveau produit
    const newProduct = {
        id: generateProductId(),
        full_name: fullName,
        lien: lien,
        price: price,
        qte: qte
    };

    // Ajouter le produit à la liste
    const products = getProducts();
    products.push(newProduct);
    saveProducts(products);

    // Afficher la modal de succès
    showSuccessModal();

    // Réinitialiser le formulaire
    resetForm();

    // Mettre à jour la liste des produits
    displayProductsList();
};

// Réinitialiser le formulaire
const resetForm = () => {
    document.getElementById('addProductForm').reset();
    document.getElementById('productPreview').style.display = 'none';
};

/* ===========================
   AFFICHAGE DE LA LISTE DES PRODUITS
   =========================== */

// Afficher la liste des produits existants
const displayProductsList = () => {
    const productsListContent = document.getElementById('productsListContent');
    const productsCount = document.getElementById('productsCount');
    const products = getProducts();

    if (!productsListContent) return;

    // Mettre à jour le compteur
    if (productsCount) {
        productsCount.textContent = `${products.length} produit(s)`;
    }

    // Si aucun produit
    if (products.length === 0) {
        productsListContent.innerHTML = `
            <div class="empty-list">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
                <p>Aucun produit ajouté pour le moment</p>
            </div>
        `;
        return;
    }

    // Générer le HTML pour chaque produit
    let html = '';
    products.forEach(product => {
        html += `
            <div class="product-item-admin">
                <img src="${product.lien}" alt="${product.full_name}" class="product-item-image">
                <div class="product-item-details">
                    <div class="product-item-name">${product.full_name}</div>
                    <div class="product-item-meta">
                        <span>Prix: ${product.price} FCFA</span>
                        <span>Stock: ${product.qte}</span>
                    </div>
                </div>
                <div class="product-item-actions">
                    <button class="btn-delete" onclick="deleteProduct(${product.id})" title="Supprimer">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polyline points="3 6 5 6 21 6"></polyline>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    });

    productsListContent.innerHTML = html;
};

// Supprimer un produit
const deleteProduct = (productId) => {
    if (!confirm('Voulez-vous vraiment supprimer ce produit ?')) return;

    let products = getProducts();
    products = products.filter(p => p.id !== productId);
    saveProducts(products);

    displayProductsList();
};

/* ===========================
   MODAL DE SUCCÈS
   =========================== */

// Afficher la modal de succès
const showSuccessModal = () => {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.add('active');
    }
};

// Fermer la modal de succès
const closeSuccessModal = () => {
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.classList.remove('active');
    }
};


document.addEventListener('DOMContentLoaded', () => {
    // Afficher la liste des produits existants
    displayProductsList();

    // Event listener pour le formulaire
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', addProduct);
    }

    // Event listeners pour l'aperçu en temps réel
    const fullNameInput = document.getElementById('full_name');
    const lienInput = document.getElementById('lien');
    const priceInput = document.getElementById('price');
    const qteInput = document.getElementById('qte');

    if (fullNameInput) fullNameInput.addEventListener('input', updatePreview);
    if (lienInput) lienInput.addEventListener('input', updatePreview);
    if (priceInput) priceInput.addEventListener('input', updatePreview);
    if (qteInput) qteInput.addEventListener('input', updatePreview);

    // Fermer la modal de succès en cliquant sur l'overlay
    const successModal = document.getElementById('successModal');
    if (successModal) {
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                closeSuccessModal();
            }
        });
    }

    // Fermer la modal avec Échap
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSuccessModal();
        }
    });
});