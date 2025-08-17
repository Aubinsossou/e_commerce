let Produits = JSON.parse(localStorage.getItem("Produits"))



const Produit = {
    get_produit: () => {
        if (!Produits) {
            localStorage.setItem("Produits", JSON.stringify([]))
        } return JSON.parse(localStorage.getItem("Produits"))
    },
    add_produit: () => {

        const add_product = document.getElementById("add_product")
        console.log('Button ajout produit: ', add_product);

        if (add_product) {
            add_product.addEventListener('click', event => {
                event.preventDefault();
                const full_name = document.getElementById("full_name")
                const lien = document.getElementById("lien")
                const price = document.getElementById("price")
                const qte = document.getElementById("qte")

                const product = {
                    id: Produits.length + 1,
                    full_name: full_name.value,
                    lien: lien.value,
                    price: price.value,
                    qte: qte.value
                }

                Produits.push(product)
                localStorage.setItem("Produits", JSON.stringify(Produits))

                full_name.value = ""
                lien.value = ""
                price.value = ""
                qte.value = ""
            })
        }


    },
    display_product: () => {
        const produit_tag = document.querySelector(".produit")
        //const produit_item=document.querySelector(".produit_item")
        let content = ``
        if (produit_tag) {
            if (Produits.length > 0) {
                Produits
                console.log('Produits: ', Produits);
                Produits.forEach(element => {
                    content += `
                    <div class="produit_item">
                    <div class="produit_item_part1">
                        <h2 class="name_produit">Nom du produit: ${element.full_name}</h2><br>
                    </div>
                    <div class="produit_item_part2">
                        <img src="${element.lien}" alt="" class="img_produit">
                    </div>
                    <div class="produit_item_part3">
                        <h3>prix : ${element.price} Fcfa</h3>
                        <h3>Stock: ${element.qte}</h3>
                        <div class="produit_content_part3_button">
                            <a class="button_panier" href="/e_commerce/formulaire_de_paiment.html?id=${element.id}">ajouter au panier</a>
                        </div>
                    </div>
                </div>
                    `
                });
            }
            else {
                content = `<h1>Aucun produit disponible</h1>
                        <a href="https://aubinsossou.github.io/e_commerce/add_produit.html">Ajouter de produit dans le localStorage</a>
                `
            }

            produit_tag.innerHTML = content
        }
    },
    add_produit_panier:()=>{   
        let produit_panier=JSON.parse(localStorage.getItem("Panier"))
        if(!produit_panier){
            localStorage.setItem("Panier",JSON.stringify([]))
        }return JSON.parse(localStorage.getItem("Panier"))

    },
    paiement: () => {
        const name_paiement = document.getElementById("name_paiement")
        const num_paiement = document.getElementById("num_paiement")
        const price_paiement = document.getElementById("price_paiement")
        const nombre_commande_paiement = document.getElementById("nombre_commande_paiement")
        const button_paiement = document.getElementById("paiement")

        const urlParams = new URLSearchParams(window.location.search)
        const id = urlParams.get('id')

        let product = Produits.find(item => item.id == id)
        name_paiement.value = product.full_name
        price_paiement.value = product.price
        nombre_commande_paiement.value = product.qte

        if (button_paiement) {
            button_paiement.addEventListener("click", (e) => {
                e.preventDefault();
                console.log("Paiement lancé");

                // Vérification rapide
                if (!name_paiement.value || !num_paiement.value || !price_paiement.value) {
                    alert("Veuillez remplir tous les champs !");
                    return;
                }

                CashChapPay.init({
                    fullname: name_paiement.value,
                    phoneNumber: num_paiement.value, 
                    amount: parseInt(price_paiement.value),
                    currency: "XOF",
                    email: "test@example.com",
                    publicKey: "PKLIVE_RS03ATRWYCRDCQFGMCTVWU9HU2MJNDQJO2NELUI73D43PRXT",
                    callback: "https://yourwebsite.com/callback"
                });

            });
        }

    },
}
Produit.get_produit();
Produit.add_produit();
Produit.display_product();
Produit.paiement();
Produit.add_produit_panier();
